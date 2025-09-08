#!/bin/bash
# Vatevo API Smoke Tests
# This script performs basic health checks and API validation

set -euo pipefail

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:8000}"
TIMEOUT="${TIMEOUT:-10}"
VERBOSE="${VERBOSE:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test functions
test_health_endpoints() {
    log_info "Testing health endpoints..."
    
    local endpoints=(
        "/healthz"
        "/health/ready"
        "/health/live"
        "/health/db"
    )
    
    for endpoint in "${endpoints[@]}"; do
        local url="${API_BASE_URL}${endpoint}"
        log_info "Testing ${endpoint}..."
        
        if curl -s --max-time "${TIMEOUT}" "${url}" | grep -q '"status":"ok"\|"status":"ready"\|"status":"alive"'; then
            log_info "✅ ${endpoint} - OK"
        else
            log_error "❌ ${endpoint} - FAILED"
            return 1
        fi
    done
}

test_api_docs() {
    log_info "Testing API documentation..."
    
    local url="${API_BASE_URL}/docs"
    if curl -s --max-time "${TIMEOUT}" "${url}" | grep -q "Swagger UI\|OpenAPI"; then
        log_info "✅ API docs - OK"
    else
        log_error "❌ API docs - FAILED"
        return 1
    fi
}

test_openapi_spec() {
    log_info "Testing OpenAPI specification..."
    
    local url="${API_BASE_URL}/openapi.json"
    if curl -s --max-time "${TIMEOUT}" "${url}" | grep -q '"openapi"'; then
        log_info "✅ OpenAPI spec - OK"
    else
        log_error "❌ OpenAPI spec - FAILED"
        return 1
    fi
}

test_tenant_creation() {
    log_info "Testing tenant creation..."
    
    local url="${API_BASE_URL}/tenants"
    local payload='{"name": "smoke-test-tenant", "webhook_url": null}'
    
    local response=$(curl -s --max-time "${TIMEOUT}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "${payload}" \
        "${url}")
    
    if echo "${response}" | grep -q '"api_key"'; then
        log_info "✅ Tenant creation - OK"
        # Extract API key for further tests
        export API_KEY=$(echo "${response}" | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)
        log_info "API Key: ${API_KEY:0:20}..."
    else
        log_error "❌ Tenant creation - FAILED"
        log_error "Response: ${response}"
        return 1
    fi
}

test_invoice_validation() {
    log_info "Testing invoice validation..."
    
    if [[ -z "${API_KEY:-}" ]]; then
        log_warn "Skipping invoice validation - no API key"
        return 0
    fi
    
    local url="${API_BASE_URL}/validate"
    local payload='{
        "country_code": "IT",
        "supplier": {
            "name": "Test Supplier",
            "vat_id": "IT12345678901",
            "address": "Test Address",
            "city": "Test City",
            "postal_code": "12345",
            "country": "IT"
        },
        "customer": {
            "name": "Test Customer",
            "vat_id": "IT98765432109",
            "address": "Customer Address",
            "city": "Customer City",
            "postal_code": "54321",
            "country": "IT"
        },
        "line_items": [
            {
                "description": "Test Item",
                "quantity": 1,
                "unit_price": "100.00",
                "tax_rate": 22.0,
                "tax_amount": "22.00",
                "line_total": "100.00"
            }
        ]
    }'
    
    local response=$(curl -s --max-time "${TIMEOUT}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${API_KEY}" \
        -d "${payload}" \
        "${url}")
    
    if echo "${response}" | grep -q '"valid"'; then
        log_info "✅ Invoice validation - OK"
    else
        log_error "❌ Invoice validation - FAILED"
        log_error "Response: ${response}"
        return 1
    fi
}

test_cors_headers() {
    log_info "Testing CORS headers..."
    
    local url="${API_BASE_URL}/healthz"
    local response=$(curl -s --max-time "${TIMEOUT}" \
        -H "Origin: https://vatevo.com" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        "${url}")
    
    if curl -s --max-time "${TIMEOUT}" -I "${url}" | grep -q "Access-Control-Allow-Origin"; then
        log_info "✅ CORS headers - OK"
    else
        log_warn "⚠️ CORS headers - Not configured"
    fi
}

# Main execution
main() {
    log_info "Starting Vatevo API smoke tests..."
    log_info "API Base URL: ${API_BASE_URL}"
    log_info "Timeout: ${TIMEOUT}s"
    
    local failed_tests=0
    
    # Run tests
    test_health_endpoints || ((failed_tests++))
    test_api_docs || ((failed_tests++))
    test_openapi_spec || ((failed_tests++))
    test_tenant_creation || ((failed_tests++))
    test_invoice_validation || ((failed_tests++))
    test_cors_headers || true  # CORS is optional
    
    # Summary
    if [[ ${failed_tests} -eq 0 ]]; then
        log_info "🎉 All smoke tests passed!"
        exit 0
    else
        log_error "💥 ${failed_tests} test(s) failed!"
        exit 1
    fi
}

# Help function
show_help() {
    cat << EOF
Vatevo API Smoke Tests

Usage: $0 [OPTIONS]

Options:
    -u, --url URL        API base URL (default: http://localhost:8000)
    -t, --timeout SEC    Request timeout in seconds (default: 10)
    -v, --verbose        Enable verbose output
    -h, --help           Show this help message

Environment Variables:
    API_BASE_URL         API base URL
    TIMEOUT              Request timeout in seconds
    VERBOSE              Enable verbose output

Examples:
    $0                                    # Test local API
    $0 -u https://api.vatevo.com         # Test production API
    $0 -t 30 -v                          # Test with 30s timeout and verbose output

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--url)
            API_BASE_URL="$2"
            shift 2
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE="true"
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Run main function
main
