"""
FastAPI example for Vatevo API
"""

import json
import hmac
import hashlib
import time
from typing import Optional
from fastapi import FastAPI, Request, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Import Vatevo SDK (in real usage, this would be from pip)
from vatevo import create_client, InvoiceCreate, SupplierInfo, CustomerInfo, LineItem

app = FastAPI(
    title="Vatevo FastAPI Example",
    description="Example FastAPI application using Vatevo SDK",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Vatevo client
vatevo = create_client(
    api_key="your-api-key",  # In production, use environment variable
    base_url="https://api.vatevo.com"
)

# Webhook signature verification
def verify_webhook_signature(payload: str, signature: str, timestamp: int, secret: str) -> bool:
    """Verify webhook signature"""
    # Check timestamp (5 minute window)
    current_time = int(time.time())
    if abs(current_time - timestamp) > 300:
        return False
    
    # Generate expected signature
    message = f"{timestamp}.{payload}"
    expected_signature = f"v1={hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()}"
    
    # Compare signatures
    return hmac.compare_digest(signature, expected_signature)

# Pydantic models
class InvoiceResponse(BaseModel):
    id: int
    status: str
    country_code: str
    created_at: str

class ValidationRequest(BaseModel):
    country_code: str
    supplier: SupplierInfo
    customer: CustomerInfo
    line_items: list[LineItem]

# Routes
@app.get("/")
async def root():
    return {"message": "Vatevo FastAPI Example API"}

@app.get("/health")
async def health():
    """Health check endpoint"""
    try:
        health_status = vatevo.health_check()
        return {"status": "ok", "vatevo": health_status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/invoices", response_model=InvoiceResponse)
async def create_invoice(invoice_data: InvoiceCreate):
    """Create a new invoice"""
    try:
        invoice = vatevo.create_invoice(invoice_data)
        return InvoiceResponse(
            id=invoice.id,
            status=invoice.status,
            country_code=invoice.country_code,
            created_at=invoice.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/invoices")
async def list_invoices(
    status: Optional[str] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of records to return")
):
    """List invoices"""
    try:
        invoices = vatevo.list_invoices(status=status, skip=skip, limit=limit)
        return invoices
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/invoices/{invoice_id}")
async def get_invoice(invoice_id: int):
    """Get a specific invoice"""
    try:
        invoice = vatevo.get_invoice(invoice_id)
        return invoice
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/validate")
async def validate_invoice(validation_data: ValidationRequest):
    """Validate invoice data"""
    try:
        result = vatevo.validate_invoice(validation_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhook")
async def webhook_handler(request: Request):
    """Webhook endpoint for Vatevo events"""
    body = await request.body()
    signature = request.headers.get("X-Vatevo-Signature", "")
    timestamp = int(request.headers.get("X-Vatevo-Timestamp", "0"))
    
    # Verify webhook signature
    if not verify_webhook_signature(body.decode(), signature, timestamp, "your-webhook-secret"):
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Parse webhook event
    event = json.loads(body)
    print(f"Webhook received: {event}")
    
    # Process webhook event
    event_type = event.get("type")
    event_data = event.get("data", {})
    
    if event_type == "invoice.created":
        print(f"Invoice created: {event_data}")
    elif event_type == "invoice.validated":
        print(f"Invoice validated: {event_data}")
    elif event_type == "invoice.submitted":
        print(f"Invoice submitted: {event_data}")
    elif event_type == "invoice.accepted":
        print(f"Invoice accepted: {event_data}")
    elif event_type == "invoice.rejected":
        print(f"Invoice rejected: {event_data}")
    elif event_type == "invoice.failed":
        print(f"Invoice failed: {event_data}")
    else:
        print(f"Unknown event type: {event_type}")
    
    return {"status": "ok"}

@app.post("/test-webhook")
async def test_webhook():
    """Test webhook delivery"""
    try:
        result = vatevo.test_webhook()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
