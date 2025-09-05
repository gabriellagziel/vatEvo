from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from .models import InvoiceStatus, CountryCode


class SupplierData(BaseModel):
    name: str
    vat_id: str
    address: str
    city: str
    postal_code: str
    country: str
    email: Optional[str] = None
    phone: Optional[str] = None


class CustomerData(BaseModel):
    name: str
    vat_id: Optional[str] = None
    address: str
    city: str
    postal_code: str
    country: str
    email: Optional[str] = None


class LineItem(BaseModel):
    description: str
    quantity: float
    unit_price: str  # String to avoid float precision issues
    tax_rate: float
    tax_amount: str
    line_total: str


class InvoiceCreate(BaseModel):
    external_id: str = Field(..., description="Your internal invoice ID")
    country_code: CountryCode
    invoice_number: str
    issue_date: datetime
    due_date: Optional[datetime] = None
    currency: str = "EUR"
    
    supplier: SupplierData
    customer: CustomerData
    line_items: List[LineItem]
    
    submit_immediately: bool = False


class InvoiceResponse(BaseModel):
    id: int
    external_id: str
    status: InvoiceStatus
    country_code: CountryCode
    invoice_number: str
    issue_date: datetime
    due_date: Optional[datetime]
    subtotal: str
    tax_amount: str
    total_amount: str
    currency: str
    
    ubl_xml_url: Optional[str] = None
    country_xml_url: Optional[str] = None
    pdf_url: Optional[str] = None
    
    submission_id: Optional[str] = None
    error_message: Optional[str] = None
    
    created_at: datetime
    updated_at: Optional[datetime]
    submitted_at: Optional[datetime]

    class Config:
        from_attributes = True


class InvoiceValidateRequest(BaseModel):
    country_code: CountryCode
    supplier: SupplierData
    customer: CustomerData
    line_items: List[LineItem]


class ValidationResult(BaseModel):
    valid: bool
    errors: List[str] = []
    warnings: List[str] = []


class WebhookPayload(BaseModel):
    event_type: str
    invoice_id: int
    external_id: str
    status: InvoiceStatus
    timestamp: datetime
    data: Dict[str, Any]


class TenantCreate(BaseModel):
    name: str
    webhook_url: Optional[str] = None


class TenantResponse(BaseModel):
    id: int
    name: str
    api_key: str
    webhook_url: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
