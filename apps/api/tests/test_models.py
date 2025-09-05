import pytest
from datetime import datetime
from app.models import Tenant, Invoice, InvoiceStatus, CountryCode, WebhookEvent


class TestTenantModel:
    def test_create_tenant(self, db_session):
        tenant = Tenant(
            name="Test Company",
            api_key="test_key_123",
            webhook_url="https://example.com/webhook"
        )
        db_session.add(tenant)
        db_session.commit()
        db_session.refresh(tenant)
        
        assert tenant.id is not None
        assert tenant.name == "Test Company"
        assert tenant.api_key == "test_key_123"
        assert tenant.webhook_url == "https://example.com/webhook"
        assert tenant.is_active is True
        assert tenant.created_at is not None

    def test_tenant_without_webhook(self, db_session):
        tenant = Tenant(
            name="Simple Company",
            api_key="simple_key_123"
        )
        db_session.add(tenant)
        db_session.commit()
        db_session.refresh(tenant)
        
        assert tenant.webhook_url is None
        assert tenant.is_active is True


class TestInvoiceModel:
    def test_create_invoice(self, db_session, sample_tenant):
        invoice = Invoice(
            external_id="TEST-INV-001",
            tenant_id=sample_tenant.id,
            invoice_number="INV-2024-001",
            country_code=CountryCode.DE,
            issue_date=datetime.now(),
            subtotal="100.00",
            tax_amount="19.00",
            total_amount="119.00",
            supplier_data={"name": "Test Supplier"},
            customer_data={"name": "Test Customer"},
            line_items=[{"description": "Test Item", "amount": "119.00"}]
        )
        db_session.add(invoice)
        db_session.commit()
        db_session.refresh(invoice)
        
        assert invoice.id is not None
        assert invoice.external_id == "TEST-INV-001"
        assert invoice.status == InvoiceStatus.DRAFT
        assert invoice.country_code == CountryCode.DE
        assert invoice.currency == "EUR"  # Default value
        assert invoice.created_at is not None
        assert invoice.tenant_id == sample_tenant.id

    def test_invoice_status_enum(self, db_session, sample_tenant):
        invoice = Invoice(
            external_id="TEST-STATUS",
            tenant_id=sample_tenant.id,
            invoice_number="INV-STATUS-001",
            country_code=CountryCode.IT,
            issue_date=datetime.now(),
            subtotal="50.00",
            tax_amount="10.00",
            total_amount="60.00",
            supplier_data={},
            customer_data={},
            line_items=[]
        )
        
        invoice.status = InvoiceStatus.VALIDATED
        db_session.add(invoice)
        db_session.commit()
        assert invoice.status == InvoiceStatus.VALIDATED
        
        invoice.status = InvoiceStatus.SUBMITTED
        db_session.commit()
        assert invoice.status == InvoiceStatus.SUBMITTED
        
        invoice.status = InvoiceStatus.ACCEPTED
        db_session.commit()
        assert invoice.status == InvoiceStatus.ACCEPTED

    def test_invoice_relationship_with_tenant(self, db_session, sample_tenant):
        invoice = Invoice(
            external_id="REL-TEST",
            tenant_id=sample_tenant.id,
            invoice_number="INV-REL-001",
            country_code=CountryCode.FR,
            issue_date=datetime.now(),
            subtotal="200.00",
            tax_amount="40.00",
            total_amount="240.00",
            supplier_data={},
            customer_data={},
            line_items=[]
        )
        db_session.add(invoice)
        db_session.commit()
        db_session.refresh(invoice)
        
        assert invoice.tenant.id == sample_tenant.id
        assert invoice.tenant.name == sample_tenant.name
        assert len(sample_tenant.invoices) == 1
        assert sample_tenant.invoices[0].id == invoice.id


class TestWebhookEventModel:
    def test_create_webhook_event(self, db_session, sample_tenant):
        invoice = Invoice(
            external_id="WEBHOOK-TEST",
            tenant_id=sample_tenant.id,
            invoice_number="INV-WEBHOOK-001",
            country_code=CountryCode.ES,
            issue_date=datetime.now(),
            subtotal="75.00",
            tax_amount="15.00",
            total_amount="90.00",
            supplier_data={},
            customer_data={},
            line_items=[]
        )
        db_session.add(invoice)
        db_session.commit()
        db_session.refresh(invoice)
        
        webhook_event = WebhookEvent(
            invoice_id=invoice.id,
            event_type="invoice.accepted",
            payload={"status": "accepted", "invoice_id": invoice.id},
            delivered=False,
            delivery_attempts=0
        )
        db_session.add(webhook_event)
        db_session.commit()
        db_session.refresh(webhook_event)
        
        assert webhook_event.id is not None
        assert webhook_event.invoice_id == invoice.id
        assert webhook_event.event_type == "invoice.accepted"
        assert webhook_event.delivered is False
        assert webhook_event.delivery_attempts == 0
        assert webhook_event.created_at is not None
        
        assert webhook_event.invoice.id == invoice.id
        assert len(invoice.webhook_events) == 1
        assert invoice.webhook_events[0].id == webhook_event.id


class TestEnums:
    def test_invoice_status_enum_values(self):
        assert InvoiceStatus.DRAFT.value == "draft"
        assert InvoiceStatus.VALIDATED.value == "validated"
        assert InvoiceStatus.SUBMITTED.value == "submitted"
        assert InvoiceStatus.ACCEPTED.value == "accepted"
        assert InvoiceStatus.REJECTED.value == "rejected"
        assert InvoiceStatus.FAILED.value == "failed"

    def test_country_code_enum_values(self):
        assert CountryCode.DE.value == "DE"
        assert CountryCode.IT.value == "IT"
        assert CountryCode.FR.value == "FR"
        assert CountryCode.ES.value == "ES"
        assert CountryCode.NL.value == "NL"
        assert CountryCode.BE.value == "BE"
        assert CountryCode.AT.value == "AT"
