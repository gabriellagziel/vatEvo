"""
Rate limiting middleware and API key management
"""
import time
import hashlib
import secrets
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import Request, HTTPException, status
from .models import Tenant, ApiKey
from .config import settings
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    """Rate limiting implementation with token bucket algorithm"""
    
    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url
        self.rate_limits = {
            'free': 100,      # requests per hour
            'pro': 1000,      # requests per hour
            'enterprise': 10000  # requests per hour
        }
    
    def get_rate_limit(self, tenant: Tenant) -> int:
        """Get rate limit for tenant based on plan"""
        # For now, use default rate limit
        # In production, this would check tenant.plan
        return self.rate_limits.get('pro', 1000)
    
    def is_rate_limited(self, tenant_id: str, tenant: Tenant) -> bool:
        """Check if tenant is rate limited"""
        if not self.redis_url:
            # No Redis available, skip rate limiting
            logger.warning("Redis not available, skipping rate limiting")
            return False
        
        try:
            import redis
            r = redis.from_url(self.redis_url)
            
            # Use token bucket algorithm
            key = f"rate_limit:{tenant_id}"
            current_time = int(time.time())
            window_start = current_time - 3600  # 1 hour window
            
            # Get current count
            pipe = r.pipeline()
            pipe.zremrangebyscore(key, 0, window_start)  # Remove old entries
            pipe.zcard(key)  # Count current entries
            pipe.zadd(key, {str(current_time): current_time})  # Add current request
            pipe.expire(key, 3600)  # Set expiration
            results = pipe.execute()
            
            current_count = results[1]
            rate_limit = self.get_rate_limit(tenant)
            
            return current_count >= rate_limit
            
        except Exception as e:
            logger.error(f"Rate limiting error: {e}")
            return False  # Fail open

class ApiKeyManager:
    """API key management and rotation"""
    
    @staticmethod
    def generate_api_key() -> str:
        """Generate a new API key"""
        return f"vatevo_{secrets.token_urlsafe(32)}"
    
    @staticmethod
    def hash_api_key(api_key: str) -> str:
        """Hash API key for storage"""
        return hashlib.sha256(api_key.encode()).hexdigest()
    
    @staticmethod
    def verify_api_key(api_key: str, hashed_key: str) -> bool:
        """Verify API key against hash"""
        return hashlib.sha256(api_key.encode()).hexdigest() == hashed_key
    
    @staticmethod
    def create_api_key(db: Session, tenant_id: str, name: str, expires_at: Optional[datetime] = None) -> Dict[str, Any]:
        """Create a new API key for tenant"""
        api_key = ApiKeyManager.generate_api_key()
        hashed_key = ApiKeyManager.hash_api_key(api_key)
        
        db_key = ApiKey(
            tenant_id=tenant_id,
            name=name,
            key_hash=hashed_key,
            expires_at=expires_at,
            is_active=True
        )
        
        db.add(db_key)
        db.commit()
        db.refresh(db_key)
        
        return {
            "id": str(db_key.id),
            "name": db_key.name,
            "api_key": api_key,  # Only returned on creation
            "created_at": db_key.created_at.isoformat(),
            "expires_at": db_key.expires_at.isoformat() if db_key.expires_at else None,
            "is_active": db_key.is_active
        }
    
    @staticmethod
    def list_api_keys(db: Session, tenant_id: str) -> list:
        """List API keys for tenant"""
        keys = db.query(ApiKey).filter(
            ApiKey.tenant_id == tenant_id,
            ApiKey.is_active == True
        ).all()
        
        return [
            {
                "id": str(key.id),
                "name": key.name,
                "created_at": key.created_at.isoformat(),
                "expires_at": key.expires_at.isoformat() if key.expires_at else None,
                "is_active": key.is_active,
                "last_used": key.last_used.isoformat() if key.last_used else None
            }
            for key in keys
        ]
    
    @staticmethod
    def revoke_api_key(db: Session, tenant_id: str, key_id: str) -> bool:
        """Revoke an API key"""
        key = db.query(ApiKey).filter(
            ApiKey.id == key_id,
            ApiKey.tenant_id == tenant_id
        ).first()
        
        if not key:
            return False
        
        key.is_active = False
        key.revoked_at = datetime.utcnow()
        db.commit()
        
        return True
    
    @staticmethod
    def rotate_api_key(db: Session, tenant_id: str, key_id: str) -> Dict[str, Any]:
        """Rotate an API key (create new, revoke old)"""
        # Get existing key
        old_key = db.query(ApiKey).filter(
            ApiKey.id == key_id,
            ApiKey.tenant_id == tenant_id
        ).first()
        
        if not old_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found"
            )
        
        # Create new key
        new_key_data = ApiKeyManager.create_api_key(
            db, tenant_id, f"{old_key.name} (rotated)"
        )
        
        # Revoke old key
        ApiKeyManager.revoke_api_key(db, tenant_id, key_id)
        
        return new_key_data

def get_tenant_from_api_key(db: Session, api_key: str) -> Optional[Tenant]:
    """Get tenant from API key"""
    if not api_key:
        return None
    
    # Hash the provided key
    hashed_key = ApiKeyManager.hash_api_key(api_key)
    
    # Find matching API key
    db_key = db.query(ApiKey).filter(
        ApiKey.key_hash == hashed_key,
        ApiKey.is_active == True
    ).first()
    
    if not db_key:
        return None
    
    # Check expiration
    if db_key.expires_at and db_key.expires_at < datetime.utcnow():
        return None
    
    # Update last used
    db_key.last_used = datetime.utcnow()
    db.commit()
    
    # Get tenant
    return db.query(Tenant).filter(Tenant.id == db_key.tenant_id).first()

async def rate_limit_middleware(request: Request, call_next):
    """Rate limiting middleware"""
    # Skip rate limiting for health checks
    if request.url.path.startswith('/health'):
        return await call_next(request)
    
    # Get API key from header
    api_key = request.headers.get('Authorization', '').replace('Bearer ', '')
    
    if not api_key:
        return await call_next(request)
    
    # Get database session
    db = request.state.db
    
    # Get tenant
    tenant = get_tenant_from_api_key(db, api_key)
    if not tenant:
        return await call_next(request)
    
    # Check rate limit
    rate_limiter = RateLimiter(settings.redis_url)
    if rate_limiter.is_rate_limited(tenant.id, tenant):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded",
            headers={
                "X-RateLimit-Limit": str(rate_limiter.get_rate_limit(tenant)),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(int(time.time()) + 3600)
            }
        )
    
    # Add rate limit headers
    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(rate_limiter.get_rate_limit(tenant))
    response.headers["X-RateLimit-Remaining"] = str(rate_limiter.get_rate_limit(tenant) - 1)
    response.headers["X-RateLimit-Reset"] = str(int(time.time()) + 3600)
    
    return response
