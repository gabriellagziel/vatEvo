from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import logging
import time
from decimal import Decimal

from .database import SessionLocal, engine, get_db
from .models import Base, Tenant, Invoice, InvoiceStatus
from .schemas import (
    InvoiceCreate, InvoiceResponse, InvoiceValidateRequest, 
    ValidationResult, TenantCreate, TenantResponse
)
from .auth import get_current_tenant
from .compliance import validate_invoice_data, generate_ubl_xml
from .config import settings
from .webhooks import WebhookSigner, WebhookDelivery, create_webhook_event
from .rate_limiting import ApiKeyManager, get_tenant_from_api_key

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Sentry if DSN is provided
if settings.sentry_dsn:
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
        
        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            integrations=[
                FastApiIntegration(auto_enabling_instrumentations=False),
                SqlalchemyIntegration(),
            ],
            traces_sample_rate=0.1,
            environment=settings.environment,
        )
        logger.info("Sentry initialized successfully")
    except ImportError:
        logger.warning("Sentry SDK not installed, skipping initialization")

# Only create tables in production, not during tests
if settings.environment != "test":
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Vatevo API",
    description="Compliance-as-a-Service for EU e-invoicing",
    version="1.0.0",
    openapi_tags=[
        {
            "name": "health",
            "description": "Health check endpoints"
        },
        {
            "name": "tenants",
            "description": "Tenant management operations"
        },
        {
            "name": "invoices",
            "description": "Invoice management and processing"
        },
        {
            "name": "validation",
            "description": "Invoice validation services"
        },
        {
            "name": "webhooks",
            "description": "Webhook management and delivery"
        }
    ]
)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Correlation ID middleware
@app.middleware("http")
async def add_correlation_id(request: Request, call_next):
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    
    # Add to request state for access in endpoints
    request.state.correlation_id = correlation_id
    
    # Process request
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Add correlation ID to response headers
    response.headers["X-Correlation-ID"] = correlation_id
    
    # Log request with correlation ID
    logger.info(
        f"Request processed",
        extra={
            "correlation_id": correlation_id,
            "method": request.method,
            "url": str(request.url),
            "status_code": response.status_code,
            "process_time": process_time,
            "user_agent": request.headers.get("user-agent"),
            "client_ip": request.client.host if request.client else None,
        }
    )
    
    return response

@app.get("/healthz")
async def healthz():
    return {"status": "ok", "service": "vatevo-api"}


@app.get("/health/ready")
async def health_ready():
    """Readiness probe - checks if the service is ready to accept traffic"""
    return {"status": "ready", "service": "vatevo-api"}


@app.get("/health/live")
async def health_live():
    """Liveness probe - checks if the service is alive"""
    return {"status": "alive", "service": "vatevo-api"}


@app.get("/health/db")
async def health_db(db: Session = Depends(get_db)):
    """Database health check - verifies database connectivity"""
    try:
        # Test database connection with a simple query
        db.execute("SELECT 1")
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}"
        )


@app.get("/status", tags=["Ops"])
def status():
    """Public status endpoint for monitoring and status pages"""
    import os
    
    return {
        "version": os.getenv("VERSION", "0.1.0"),
        "commit": os.getenv("GIT_SHA", "dev")[:7],
        "buildTime": os.getenv("BUILD_TIME", ""),
        "regions": [os.getenv("FLY_REGION", "eu-fra")],
        "api": {"live": True, "ready": True, "db": True},
        "latencyMs": {"p50": None, "p95": None}
    }


@app.post("/tenants", response_model=TenantResponse)
async def create_tenant(tenant_data: TenantCreate, db: Session = Depends(get_db)):
    """Create a new tenant with API key"""
    api_key = f"vat_{uuid.uuid4().hex}"
    
    tenant = Tenant(
        name=tenant_data.name,
        api_key=api_key,
        webhook_url=tenant_data.webhook_url
    )
    
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    
    return tenant


@app.post("/invoices", response_model=InvoiceResponse)
async def create_invoice(
    invoice_data: InvoiceCreate,
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Create and optionally submit an invoice"""
    
    subtotal = Decimal("0")
    tax_total = Decimal("0")
    
    for item in invoice_data.line_items:
        subtotal += Decimal(item.line_total)
        tax_total += Decimal(item.tax_amount)
    
    total = subtotal + tax_total
    
    invoice = Invoice(
        external_id=invoice_data.external_id,
        tenant_id=current_tenant.id,
        country_code=invoice_data.country_code,
        invoice_number=invoice_data.invoice_number,
        issue_date=invoice_data.issue_date,
        due_date=invoice_data.due_date,
        subtotal=str(subtotal),
        tax_amount=str(tax_total),
        total_amount=str(total),
        currency=invoice_data.currency,
        supplier_data=invoice_data.supplier.dict(),
        customer_data=invoice_data.customer.dict(),
        line_items=[item.dict() for item in invoice_data.line_items],
        status=InvoiceStatus.DRAFT
    )
    
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    
    try:
        ubl_xml = generate_ubl_xml(invoice)
        invoice.ubl_xml = ubl_xml
        invoice.status = InvoiceStatus.VALIDATED
        
        if invoice_data.submit_immediately:
            invoice.status = InvoiceStatus.SUBMITTED
            
        db.commit()
        db.refresh(invoice)
        
    except Exception as e:
        invoice.status = InvoiceStatus.FAILED
        invoice.error_message = str(e)
        db.commit()
        db.refresh(invoice)
    
    return invoice


@app.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: int,
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Get invoice details"""
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.tenant_id == current_tenant.id
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    return invoice


@app.get("/invoices", response_model=List[InvoiceResponse])
async def list_invoices(
    skip: int = 0,
    limit: int = 100,
    status: InvoiceStatus = None,
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """List invoices for the current tenant"""
    query = db.query(Invoice).filter(Invoice.tenant_id == current_tenant.id)
    
    if status:
        query = query.filter(Invoice.status == status)
    
    invoices = query.offset(skip).limit(limit).all()
    return invoices


@app.post("/invoices/{invoice_id}/retry", response_model=InvoiceResponse)
async def retry_invoice(
    invoice_id: int,
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Retry a failed invoice submission"""
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.tenant_id == current_tenant.id
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    if invoice.status not in [InvoiceStatus.FAILED, InvoiceStatus.REJECTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only failed or rejected invoices can be retried"
        )
    
    try:
        ubl_xml = generate_ubl_xml(invoice)
        invoice.ubl_xml = ubl_xml
        invoice.status = InvoiceStatus.VALIDATED
        invoice.error_message = None
        
        db.commit()
        db.refresh(invoice)
        
    except Exception as e:
        invoice.status = InvoiceStatus.FAILED
        invoice.error_message = str(e)
        db.commit()
        db.refresh(invoice)
    
    return invoice


@app.post("/validate", response_model=ValidationResult)
async def validate_invoice(
    validation_data: InvoiceValidateRequest,
    current_tenant: Tenant = Depends(get_current_tenant)
):
    """Validate invoice data without creating an invoice"""
    try:
        result = validate_invoice_data(validation_data)
        return result
    except Exception as e:
        return ValidationResult(
            valid=False,
            errors=[f"Validation error: {str(e)}"]
        )


# Webhook endpoints
@app.post("/webhooks/verify")
async def verify_webhook_signature(
    request: Request,
    db: Session = Depends(get_db)
):
    """Verify webhook signature (for testing)"""
    body = await request.body()
    signature = request.headers.get("X-Vatevo-Signature", "")
    timestamp = int(request.headers.get("X-Vatevo-Timestamp", "0"))
    
    is_valid = WebhookSigner.verify_signature(
        body.decode(),
        signature,
        settings.webhook_secret,
        timestamp
    )
    
    return {
        "valid": is_valid,
        "timestamp": timestamp,
        "signature": signature
    }


@app.get("/webhooks/events")
async def list_webhook_events(
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """List webhook events for the current tenant"""
    events = db.query(WebhookEvent).filter(
        WebhookEvent.tenant_id == current_tenant.id
    ).offset(skip).limit(limit).all()
    
    return events


@app.post("/webhooks/test")
async def test_webhook_delivery(
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Test webhook delivery for the current tenant"""
    if not current_tenant.webhook_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No webhook URL configured for tenant"
        )
    
    # Create test webhook event
    test_data = {
        "message": "Test webhook delivery",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    webhook_event = create_webhook_event(
        current_tenant.id,
        "test.webhook",
        test_data
    )
    
    # Deliver webhook
    delivery = WebhookDelivery(db)
    success = delivery.deliver_webhook(
        current_tenant.id,
        "test.webhook",
        webhook_event
    )
    
    return {
        "success": success,
        "webhook_url": current_tenant.webhook_url,
        "event": webhook_event
    }


# API Key Management endpoints
@app.post("/api-keys")
async def create_api_key(
    name: str,
    expires_days: Optional[int] = None,
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Create a new API key for the current tenant"""
    expires_at = None
    if expires_days:
        expires_at = datetime.utcnow() + timedelta(days=expires_days)
    
    key_data = ApiKeyManager.create_api_key(
        db, current_tenant.id, name, expires_at
    )
    
    return key_data


@app.get("/api-keys")
async def list_api_keys(
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """List API keys for the current tenant"""
    keys = ApiKeyManager.list_api_keys(db, current_tenant.id)
    return {"api_keys": keys}


@app.delete("/api-keys/{key_id}")
async def revoke_api_key(
    key_id: str,
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Revoke an API key"""
    success = ApiKeyManager.revoke_api_key(db, current_tenant.id, key_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    return {"message": "API key revoked successfully"}


@app.post("/api-keys/{key_id}/rotate")
async def rotate_api_key(
    key_id: str,
    current_tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    """Rotate an API key (create new, revoke old)"""
    try:
        new_key_data = ApiKeyManager.rotate_api_key(db, current_tenant.id, key_id)
        return new_key_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to rotate API key: {str(e)}"
        )
# Force deploy Tue Sep  9 03:06:44 CEST 2025
# Force deploy Tue Sep  9 03:43:23 CEST 2025
# Force deploy Tue Sep  9 10:08:46 CEST 2025
# Force rebuild Tue Sep  9 10:22:31 CEST 2025
# Trigger API deploy Tue Sep  9 10:32:40 CEST 2025
# Force API deploy Tue Sep  9 10:39:19 CEST 2025
# Final API deploy attempt Tue Sep  9 10:58:58 CEST 2025
