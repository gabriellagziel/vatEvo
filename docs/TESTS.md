# Vatevo MVP Test Documentation

## Test Plan

### Backend Testing (pytest)
- **Framework**: pytest with coverage reporting
- **Target Coverage**: 80% minimum threshold
- **Test Categories**:
  - Health check endpoint
  - Tenant management (create, authenticate)
  - Invoice operations (create, list, get, retry)
  - Validation endpoint
  - Authentication functions
  - Database models

### Frontend Testing (Jest + RTL)
- **Framework**: Jest with React Testing Library
- **Test Categories**:
  - Component rendering
  - User interaction flows
  - API integration (future)

## Test Commands

### Backend Tests
```bash
cd apps/api
poetry install --no-root
poetry run pytest -v
poetry run pytest --cov=app --cov-report=html
```

### Frontend Tests
```bash
cd apps/dashboard
npm ci
npm run test
npm run test -- --coverage
```

### Full Test Suite
```bash
# From repository root
turbo test
```

## Test Results Summary

### Backend Test Coverage
- **Total Tests**: 25 test cases across 4 test files
- **Test Files**:
  - `test_main.py`: API endpoint tests (13 tests)
  - `test_models.py`: Database model tests (8 tests)
  - `test_auth.py`: Authentication tests (3 tests)
  - `conftest.py`: Test configuration and fixtures

### Test Categories Breakdown

#### API Endpoint Tests (`test_main.py`)
1. **Health Check**: `GET /healthz`
2. **Tenant Management**: `POST /tenants`
3. **Invoice Operations**:
   - `POST /invoices` (create)
   - `GET /invoices` (list with filters)
   - `GET /invoices/{id}` (get specific)
   - `POST /invoices/{id}/retry` (retry failed)
4. **Validation**: `POST /validate`

#### Database Model Tests (`test_models.py`)
1. **Tenant Model**: Creation, relationships, validation
2. **Invoice Model**: Status transitions, relationships, enums
3. **WebhookEvent Model**: Event tracking, delivery status
4. **Enum Validation**: InvoiceStatus, CountryCode

#### Authentication Tests (`test_auth.py`)
1. **API Key Generation**: `create_api_key()` function
2. **Tenant Authentication**: `get_current_tenant()` with various scenarios
3. **Error Handling**: Invalid keys, inactive tenants

### Frontend Test Coverage
- **Total Tests**: 2 test cases
- **Components Tested**:
  - `AuthForm`: Sign in form rendering and tenant creation option

## Coverage Reports

### Backend Coverage
- **Location**: `docs/tests/backend/htmlcov/index.html`
- **Format**: HTML with line-by-line coverage details
- **Threshold**: 80% minimum (configured in `pyproject.toml`)

### Viewing Coverage Reports
```bash
# Generate and view backend coverage
cd apps/api
poetry run pytest --cov=app --cov-report=html
open htmlcov/index.html

# View committed coverage reports
open docs/tests/backend/htmlcov/index.html
```

## CI/CD Integration

### GitHub Actions Workflow
- **File**: `.github/workflows/ci.yml`
- **Triggers**: Pull requests and pushes to `devin/bootstrap`
- **Jobs**:
  1. **Backend**: Python 3.12, Poetry, pytest with coverage
  2. **Frontend**: Node.js 20, npm, Jest tests, Next.js build

### CI Test Commands
```yaml
# Backend CI
poetry install --no-root
poetry run pytest --cov=app --cov-report=term-missing

# Frontend CI
npm ci
npm run test -- --ci --reporters=default
npm run build
```

## Test Fixtures and Data

### Backend Test Fixtures (`conftest.py`)
- **Database**: In-memory SQLite for isolated testing
- **Sample Tenant**: Pre-configured test tenant with API key
- **Sample Invoice Data**: Complete invoice payload for testing
- **Authentication Headers**: Bearer token headers for API testing

### Test Data Examples
```python
# Sample tenant
{
    "name": "Test Company",
    "api_key": "test_api_key_123",
    "webhook_url": "https://example.com/webhook"
}

# Sample invoice
{
    "external_id": "TEST-INV-001",
    "invoice_number": "INV-2024-001",
    "country_code": "DE",
    "supplier": {...},
    "customer": {...},
    "line_items": [...]
}
```

## Running Tests Locally

### Prerequisites
- Python 3.12+ with Poetry
- Node.js 20+ with npm
- Git repository cloned

### Step-by-Step
1. **Backend Setup**:
   ```bash
   cd apps/api
   poetry install --no-root
   ```

2. **Frontend Setup**:
   ```bash
   cd apps/dashboard
   npm ci
   ```

3. **Run All Tests**:
   ```bash
   # Backend
   cd apps/api && poetry run pytest -v
   
   # Frontend
   cd apps/dashboard && npm run test
   ```

4. **Generate Coverage**:
   ```bash
   cd apps/api
   poetry run pytest --cov=app --cov-report=html
   # Coverage report: htmlcov/index.html
   ```

## Test Maintenance

### Adding New Tests
- **Backend**: Add test files in `apps/api/tests/`
- **Frontend**: Add test files in `apps/dashboard/src/__tests__/`
- **Naming**: Use `test_*.py` or `*.test.tsx` patterns

### Coverage Goals
- **Backend**: Maintain 80%+ coverage for all modules
- **Frontend**: Add tests for new components and critical user flows
- **Integration**: Add end-to-end tests for complete workflows

### CI Monitoring
- All tests must pass before PR merge
- Coverage reports are generated on each CI run
- Failed tests block deployment pipeline

The test infrastructure provides a solid foundation for maintaining code quality and preventing regressions as the Vatevo platform evolves.
