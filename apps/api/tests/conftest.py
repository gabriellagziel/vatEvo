import pytest
import asyncio
from typing import AsyncGenerator, Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models import Tenant, Invoice


SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_tenant(db_session) -> Tenant:
    tenant = Tenant(
        name="Test Company",
        api_key="test_api_key_123",
        webhook_url="https://example.com/webhook",
        is_active=True
    )
    db_session.add(tenant)
    db_session.commit()
    db_session.refresh(tenant)
    return tenant


@pytest.fixture
def auth_headers(sample_tenant):
    return {"Authorization": f"Bearer {sample_tenant.api_key}"}


@pytest.fixture
def sample_invoice_data():
    return {
        "external_id": "TEST-INV-001",
        "invoice_number": "INV-2024-001",
        "country_code": "DE",
        "issue_date": "2024-01-15T00:00:00Z",
        "due_date": "2024-02-15T00:00:00Z",
        "currency": "EUR",
        "supplier": {
            "name": "Test Supplier Ltd",
            "vat_id": "DE123456789",
            "address": "123 Business St",
            "city": "Berlin",
            "postal_code": "10115",
            "country": "Germany"
        },
        "customer": {
            "name": "Test Customer GmbH",
            "vat_id": "DE987654321",
            "address": "456 Customer Ave",
            "city": "Munich",
            "postal_code": "80331",
            "country": "Germany"
        },
        "line_items": [
            {
                "description": "Software License",
                "quantity": 1.0,
                "unit_price": "100.00",
                "tax_rate": 0.19,
                "tax_amount": "19.00",
                "line_total": "119.00"
            }
        ]
    }
