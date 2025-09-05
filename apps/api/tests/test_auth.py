import pytest
from app.auth import get_current_tenant, create_api_key
from app.models import Tenant
from fastapi import HTTPException


class TestAuthFunctions:
    def test_create_api_key(self):
        api_key = create_api_key()
        assert api_key.startswith("vat_")
        assert len(api_key) == 35  # "vat_" + 32 character hex string

    def test_create_api_key_uniqueness(self):
        key1 = create_api_key()
        key2 = create_api_key()
        assert key1 != key2

    def test_get_current_tenant_success(self, db_session, sample_tenant):
        from fastapi.security import HTTPAuthorizationCredentials
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=sample_tenant.api_key)
        tenant = get_current_tenant(credentials, db_session)
        assert tenant.id == sample_tenant.id
        assert tenant.name == sample_tenant.name
        assert tenant.api_key == sample_tenant.api_key

    def test_get_current_tenant_invalid_key(self, db_session):
        from fastapi.security import HTTPAuthorizationCredentials
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="invalid_key")
        with pytest.raises(HTTPException) as exc_info:
            get_current_tenant(credentials, db_session)
        assert exc_info.value.status_code == 401
        assert "Invalid authentication credentials" in str(exc_info.value.detail)

    def test_get_current_tenant_inactive_tenant(self, db_session):
        from fastapi.security import HTTPAuthorizationCredentials
        inactive_tenant = Tenant(
            name="Inactive Company",
            api_key="inactive_key_123",
            is_active=False
        )
        db_session.add(inactive_tenant)
        db_session.commit()
        
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=inactive_tenant.api_key)
        with pytest.raises(HTTPException) as exc_info:
            get_current_tenant(credentials, db_session)
        assert exc_info.value.status_code == 401
        assert "Invalid authentication credentials" in str(exc_info.value.detail)
