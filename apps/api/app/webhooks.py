"""
Webhook signing and delivery functionality
"""
import hmac
import hashlib
import time
import json
import uuid
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import requests
from sqlalchemy.orm import Session
from .models import WebhookEvent, Tenant
from .config import settings
import logging

logger = logging.getLogger(__name__)

class WebhookSigner:
    """Webhook signature generation and verification"""
    
    @staticmethod
    def generate_signature(payload: str, secret: str, timestamp: int) -> str:
        """Generate HMAC-SHA256 signature for webhook payload"""
        message = f"{timestamp}.{payload}"
        signature = hmac.new(
            secret.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return f"v1={signature}"
    
    @staticmethod
    def verify_signature(payload: str, signature: str, secret: str, timestamp: int) -> bool:
        """Verify webhook signature and timestamp"""
        # Check timestamp (5 minute window)
        current_time = int(time.time())
        if abs(current_time - timestamp) > 300:  # 5 minutes
            logger.warning(f"Webhook timestamp too old: {timestamp}, current: {current_time}")
            return False
        
        # Generate expected signature
        expected_signature = WebhookSigner.generate_signature(payload, secret, timestamp)
        
        # Compare signatures
        return hmac.compare_digest(signature, expected_signature)

class WebhookDelivery:
    """Webhook delivery with retry logic"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def deliver_webhook(self, tenant_id: str, event_type: str, payload: Dict[str, Any]) -> bool:
        """Deliver webhook with retry logic"""
        # Get tenant webhook URL
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant or not tenant.webhook_url:
            logger.warning(f"No webhook URL configured for tenant {tenant_id}")
            return False
        
        # Create webhook event record
        webhook_event = WebhookEvent(
            tenant_id=tenant_id,
            event_type=event_type,
            payload=json.dumps(payload),
            webhook_url=tenant.webhook_url,
            status="pending"
        )
        self.db.add(webhook_event)
        self.db.commit()
        
        # Attempt delivery
        return self._deliver_with_retry(webhook_event)
    
    def _deliver_with_retry(self, webhook_event: WebhookEvent, max_retries: int = 3) -> bool:
        """Deliver webhook with exponential backoff retry"""
        payload = webhook_event.payload
        timestamp = int(time.time())
        signature = WebhookSigner.generate_signature(payload, settings.webhook_secret, timestamp)
        
        headers = {
            "Content-Type": "application/json",
            "X-Vatevo-Signature": signature,
            "X-Vatevo-Timestamp": str(timestamp),
            "X-Vatevo-Event": webhook_event.event_type,
            "User-Agent": "Vatevo-Webhook/1.0"
        }
        
        for attempt in range(max_retries + 1):
            try:
                response = requests.post(
                    webhook_event.webhook_url,
                    data=payload,
                    headers=headers,
                    timeout=30
                )
                
                if response.status_code >= 200 and response.status_code < 300:
                    webhook_event.status = "delivered"
                    webhook_event.response_code = response.status_code
                    webhook_event.delivered_at = datetime.utcnow()
                    self.db.commit()
                    logger.info(f"Webhook delivered successfully: {webhook_event.id}")
                    return True
                else:
                    logger.warning(f"Webhook delivery failed: {response.status_code}")
                    webhook_event.status = "failed"
                    webhook_event.response_code = response.status_code
                    webhook_event.error_message = response.text[:500]
                    
            except requests.exceptions.RequestException as e:
                logger.error(f"Webhook delivery error: {str(e)}")
                webhook_event.status = "failed"
                webhook_event.error_message = str(e)[:500]
            
            # Exponential backoff
            if attempt < max_retries:
                delay = 2 ** attempt
                logger.info(f"Retrying webhook delivery in {delay} seconds...")
                time.sleep(delay)
        
        # Final failure
        webhook_event.status = "failed"
        webhook_event.failed_at = datetime.utcnow()
        self.db.commit()
        logger.error(f"Webhook delivery failed after {max_retries + 1} attempts: {webhook_event.id}")
        return False

def create_webhook_event(tenant_id: str, event_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a webhook event payload"""
    return {
        "id": str(uuid.uuid4()),
        "type": event_type,
        "created": datetime.utcnow().isoformat() + "Z",
        "data": data,
        "api_version": "1.0"
    }
