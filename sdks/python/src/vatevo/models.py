"""
Data models for the Vatevo SDK
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class VatevoConfig(BaseModel):
    """Configuration for the Vatevo client"""
    api_key: str = Field(..., description="Your API key")
    base_url: str = Field(default="https://api.vatevo.com", description="API base URL")
    timeout: int = Field(default=30, description="Request timeout in seconds")


class Tenant(BaseModel):
    """Tenant model"""
    id: str
    name: str
    api_key: str
    webhook_url: Optional[str] = None
    created_at: str


class InvoiceCreate(BaseModel):
    """Invoice creation model"""
    country_code: str
    supplier: "SupplierInfo"
    customer: "CustomerInfo"
    line_items: List["LineItem"]


class SupplierInfo(BaseModel):
    """Supplier information"""
    name: str
    vat_id: str
    address: str
    city: str
    postal_code: str
    country: str


class CustomerInfo(BaseModel):
    """Customer information"""
    name: str
    vat_id: str
    address: str
    city: str
    postal_code: str
    country: str


class LineItem(BaseModel):
    """Invoice line item"""
    description: str
    quantity: int
    unit_price: str
    tax_rate: float
    tax_amount: str
    line_total: str


class Invoice(BaseModel):
    """Invoice model"""
    id: int
    tenant_id: str
    status: str
    country_code: str
    ubl_xml: Optional[str] = None
    country_xml: Optional[str] = None
    pdf_url: Optional[str] = None
    submission_id: Optional[str] = None
    error_message: Optional[str] = None
    created_at: str
    updated_at: str


class ValidationResult(BaseModel):
    """Validation result model"""
    valid: bool
    errors: List[str]


class WebhookEvent(BaseModel):
    """Webhook event model"""
    id: str
    type: str
    created: str
    data: Dict[str, Any]
    api_version: str


# Update forward references
InvoiceCreate.model_rebuild()
SupplierInfo.model_rebuild()
CustomerInfo.model_rebuild()
LineItem.model_rebuild()
