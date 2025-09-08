"""
Vatevo API client
"""

import hmac
import hashlib
import time
from typing import Optional, List, Dict, Any
import httpx
from .models import (
    VatevoConfig,
    Tenant,
    Invoice,
    InvoiceCreate,
    ValidationResult,
    WebhookEvent,
)


class VatevoClient:
    """Vatevo API client"""

    def __init__(self, config: VatevoConfig) -> None:
        self.config = config
        self.client = httpx.Client(
            base_url=config.base_url,
            timeout=config.timeout,
            headers={
                "Authorization": f"Bearer {config.api_key}",
                "Content-Type": "application/json",
                "User-Agent": "Vatevo-SDK-Python/1.0.0",
            },
        )

    def __enter__(self) -> "VatevoClient":
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        self.client.close()

    def close(self) -> None:
        """Close the HTTP client"""
        self.client.close()

    # Health checks
    def health_check(self) -> Dict[str, str]:
        """Basic health check"""
        response = self.client.get("/healthz")
        response.raise_for_status()
        return response.json()

    def health_ready(self) -> Dict[str, str]:
        """Readiness check"""
        response = self.client.get("/health/ready")
        response.raise_for_status()
        return response.json()

    def health_db(self) -> Dict[str, str]:
        """Database health check"""
        response = self.client.get("/health/db")
        response.raise_for_status()
        return response.json()

    # Tenant management
    def create_tenant(self, name: str, webhook_url: Optional[str] = None) -> Tenant:
        """Create a new tenant"""
        data = {"name": name}
        if webhook_url:
            data["webhook_url"] = webhook_url

        response = self.client.post("/tenants", json=data)
        response.raise_for_status()
        return Tenant(**response.json())

    # Invoice management
    def create_invoice(self, invoice_data: InvoiceCreate) -> Invoice:
        """Create a new invoice"""
        response = self.client.post("/invoices", json=invoice_data.dict())
        response.raise_for_status()
        return Invoice(**response.json())

    def get_invoice(self, invoice_id: int) -> Invoice:
        """Get an invoice by ID"""
        response = self.client.get(f"/invoices/{invoice_id}")
        response.raise_for_status()
        return Invoice(**response.json())

    def list_invoices(
        self,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Invoice]:
        """List invoices"""
        params = {"skip": skip, "limit": limit}
        if status:
            params["status"] = status

        response = self.client.get("/invoices", params=params)
        response.raise_for_status()
        return [Invoice(**item) for item in response.json()]

    def retry_invoice(self, invoice_id: int) -> Invoice:
        """Retry a failed invoice"""
        response = self.client.post(f"/invoices/{invoice_id}/retry")
        response.raise_for_status()
        return Invoice(**response.json())

    # Validation
    def validate_invoice(self, invoice_data: InvoiceCreate) -> ValidationResult:
        """Validate invoice data"""
        response = self.client.post("/validate", json=invoice_data.dict())
        response.raise_for_status()
        return ValidationResult(**response.json())

    # Webhooks
    def test_webhook(self) -> Dict[str, Any]:
        """Test webhook delivery"""
        response = self.client.post("/webhooks/test")
        response.raise_for_status()
        return response.json()

    def list_webhook_events(
        self, skip: int = 0, limit: int = 100
    ) -> List[WebhookEvent]:
        """List webhook events"""
        params = {"skip": skip, "limit": limit}
        response = self.client.get("/webhooks/events", params=params)
        response.raise_for_status()
        return [WebhookEvent(**item) for item in response.json()]

    def verify_webhook_signature(
        self, payload: str, signature: str, timestamp: int
    ) -> bool:
        """Verify webhook signature"""
        try:
            response = self.client.post(
                "/webhooks/verify",
                content=payload,
                headers={
                    "X-Vatevo-Signature": signature,
                    "X-Vatevo-Timestamp": str(timestamp),
                    "Content-Type": "application/json",
                },
            )
            response.raise_for_status()
            return response.json()["valid"]
        except Exception:
            return False

    @staticmethod
    def verify_webhook_signature_static(
        payload: str, signature: str, timestamp: int, secret: str
    ) -> bool:
        """Verify webhook signature (static method)"""
        # Check timestamp (5 minute window)
        current_time = int(time.time())
        if abs(current_time - timestamp) > 300:
            return False

        # Generate expected signature
        message = f"{timestamp}.{payload}"
        expected_signature = f"v1={hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()}"

        # Compare signatures
        return hmac.compare_digest(signature, expected_signature)


def create_client(api_key: str, base_url: str = "https://api.vatevo.com") -> VatevoClient:
    """Create a Vatevo client"""
    config = VatevoConfig(api_key=api_key, base_url=base_url)
    return VatevoClient(config)
