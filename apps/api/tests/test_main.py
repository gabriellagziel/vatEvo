import pytest
from fastapi.testclient import TestClient
from app.models import Tenant, Invoice, InvoiceStatus


class TestHealthCheck:
    def test_health_check(self, client: TestClient):
        response = client.get("/healthz")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "vatevo-api"


class TestTenantEndpoints:
    def test_create_tenant_success(self, client: TestClient):
        tenant_data = {
            "name": "New Test Company",
            "webhook_url": "https://example.com/webhook"
        }
        response = client.post("/tenants", json=tenant_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == tenant_data["name"]
        assert data["webhook_url"] == tenant_data["webhook_url"]
        assert data["is_active"] is True
        assert "api_key" in data
        assert data["api_key"].startswith("vat_")
        assert "id" in data
        assert "created_at" in data

    def test_create_tenant_without_webhook(self, client: TestClient):
        tenant_data = {"name": "Simple Test Company"}
        response = client.post("/tenants", json=tenant_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == tenant_data["name"]
        assert data["webhook_url"] is None

    def test_create_tenant_missing_name(self, client: TestClient):
        tenant_data = {"webhook_url": "https://example.com/webhook"}
        response = client.post("/tenants", json=tenant_data)
        assert response.status_code == 422


class TestInvoiceEndpoints:
    def test_create_invoice_success(self, client: TestClient, auth_headers: dict, sample_invoice_data: dict):
        response = client.post("/invoices", json=sample_invoice_data, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["external_id"] == sample_invoice_data["external_id"]
        assert data["invoice_number"] == sample_invoice_data["invoice_number"]
        assert data["country_code"] == sample_invoice_data["country_code"]
        assert data["status"] == "validated"
        assert data["currency"] == "EUR"
        assert "id" in data
        assert "created_at" in data
        assert "ubl_xml_url" in data

    def test_create_invoice_unauthorized(self, client: TestClient, sample_invoice_data: dict):
        response = client.post("/invoices", json=sample_invoice_data)
        assert response.status_code == 403

    def test_create_invoice_invalid_auth(self, client: TestClient, sample_invoice_data: dict):
        headers = {"Authorization": "Bearer invalid_key"}
        response = client.post("/invoices", json=sample_invoice_data, headers=headers)
        assert response.status_code == 401

    def test_create_invoice_missing_required_fields(self, client: TestClient, auth_headers: dict):
        invalid_data = {"external_id": "TEST-001"}
        response = client.post("/invoices", json=invalid_data, headers=auth_headers)
        assert response.status_code == 422

    def test_get_invoices_list(self, client: TestClient, auth_headers: dict, sample_invoice_data: dict):
        client.post("/invoices", json=sample_invoice_data, headers=auth_headers)
        
        response = client.get("/invoices", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["external_id"] == sample_invoice_data["external_id"]

    def test_get_invoices_with_filters(self, client: TestClient, auth_headers: dict, sample_invoice_data: dict):
        client.post("/invoices", json=sample_invoice_data, headers=auth_headers)
        
        response = client.get("/invoices?status=validated", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        
        response = client.get("/invoices?status=rejected", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0

    def test_get_invoice_by_id(self, client: TestClient, auth_headers: dict, sample_invoice_data: dict):
        create_response = client.post("/invoices", json=sample_invoice_data, headers=auth_headers)
        invoice_id = create_response.json()["id"]
        
        response = client.get(f"/invoices/{invoice_id}", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == invoice_id
        assert data["external_id"] == sample_invoice_data["external_id"]

    def test_get_invoice_not_found(self, client: TestClient, auth_headers: dict):
        response = client.get("/invoices/99999", headers=auth_headers)
        assert response.status_code == 404

    def test_retry_invoice(self, client: TestClient, auth_headers: dict, sample_invoice_data: dict, db_session):
        create_response = client.post("/invoices", json=sample_invoice_data, headers=auth_headers)
        invoice_id = create_response.json()["id"]
        
        invoice = db_session.query(Invoice).filter(Invoice.id == invoice_id).first()
        invoice.status = InvoiceStatus.FAILED
        invoice.error_message = "Test error"
        db_session.commit()
        
        response = client.post(f"/invoices/{invoice_id}/retry", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == invoice_id
        assert data["status"] == "validated"  # Should be reset to validated after retry

    def test_retry_invoice_not_found(self, client: TestClient, auth_headers: dict):
        response = client.post("/invoices/99999/retry", headers=auth_headers)
        assert response.status_code == 404


class TestValidationEndpoint:
    def test_validate_invoice_success(self, client: TestClient, auth_headers: dict, sample_invoice_data: dict):
        response = client.post("/validate", json=sample_invoice_data, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["valid"] is True
        assert isinstance(data["errors"], list)
        assert isinstance(data["warnings"], list)

    def test_validate_invoice_invalid_data(self, client: TestClient, auth_headers: dict):
        invalid_data = {
            "external_id": "TEST-001",
            "invoice_number": "",  # Empty invoice number should cause validation error
            "country_code": "INVALID"  # Invalid country code
        }
        response = client.post("/validate", json=invalid_data, headers=auth_headers)
        assert response.status_code == 422

    def test_validate_invoice_unauthorized(self, client: TestClient, sample_invoice_data: dict):
        response = client.post("/validate", json=sample_invoice_data)
        assert response.status_code == 403
