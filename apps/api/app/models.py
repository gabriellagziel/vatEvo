from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum


class InvoiceStatus(enum.Enum):
    DRAFT = "draft"
    VALIDATED = "validated"
    SUBMITTED = "submitted"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    FAILED = "failed"


class CountryCode(enum.Enum):
    DE = "DE"  # Germany
    IT = "IT"  # Italy
    FR = "FR"  # France
    ES = "ES"  # Spain
    NL = "NL"  # Netherlands
    BE = "BE"  # Belgium
    AT = "AT"  # Austria


class Tenant(Base):
    __tablename__ = "tenants"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    api_key = Column(String(255), unique=True, index=True, nullable=False)
    webhook_url = Column(String(500), nullable=True)
    webhook_secret = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    invoices = relationship("Invoice", back_populates="tenant")
    api_keys = relationship("ApiKey", back_populates="tenant")


class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String(255), nullable=False)  # Client's invoice ID
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.DRAFT)
    country_code = Column(Enum(CountryCode), nullable=False)
    invoice_number = Column(String(100), nullable=False)
    issue_date = Column(DateTime(timezone=True), nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=True)
    
    subtotal = Column(String(20), nullable=False)  # Store as string to avoid float precision issues
    tax_amount = Column(String(20), nullable=False)
    total_amount = Column(String(20), nullable=False)
    currency = Column(String(3), default="EUR")
    
    supplier_data = Column(JSON, nullable=False)  # Supplier/seller information
    customer_data = Column(JSON, nullable=False)  # Customer/buyer information
    
    line_items = Column(JSON, nullable=False)  # Array of invoice line items
    
    ubl_xml = Column(Text, nullable=True)  # Generated UBL XML
    country_xml = Column(Text, nullable=True)  # Country-specific XML (FatturaPA, XRechnung, etc.)
    pdf_url = Column(String(500), nullable=True)  # S3 URL to PDF
    
    submission_id = Column(String(255), nullable=True)  # Gateway submission ID
    gateway_response = Column(JSON, nullable=True)  # ACK/NACK response
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    
    tenant = relationship("Tenant", back_populates="invoices")
    webhook_events = relationship("WebhookEvent", back_populates="invoice")


class WebhookEvent(Base):
    __tablename__ = "webhook_events"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    event_type = Column(String(50), nullable=False)  # invoice.accepted, invoice.rejected, etc.
    payload = Column(JSON, nullable=False)
    delivered = Column(Boolean, default=False)
    delivery_attempts = Column(Integer, default=0)
    last_attempt_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    invoice = relationship("Invoice", back_populates="webhook_events")


class ApiKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    key_hash = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    
    tenant = relationship("Tenant", back_populates="api_keys")
