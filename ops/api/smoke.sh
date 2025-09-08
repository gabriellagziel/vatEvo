#!/bin/bash
# Vatevo API Smoke Test
# Comprehensive smoke test for production API validation

set -euo pipefail

# Configuration
API_BASE_URL="${API_BASE_URL:-https://api.vatevo.com}"
DEMO_API_KEY="${DEMO_API_KEY:-demo-smoke-test-key}"
TIMEOUT="${TIMEOUT:-30}"
VERBOSE="${VERBOSE:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_status="${3:-200}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}🧪 Running: $test_name${NC}"
    
    if [ "$VERBOSE" = "true" ]; then
        echo "Command: $test_command"
    fi
    
    # Run the test command
    local response
    local status_code
    local response_time
    
    response=$(eval "$test_command" 2>&1)
    status_code=$?
    
    # Extract HTTP status code if it's a curl command
    if [[ "$test_command" == *"curl"* ]]; then
        status_code=$(echo "$response" | grep -o "HTTP/[0-9.]* [0-9]*" | tail -1 | awk '{print $2}')
        if [ -z "$status_code" ]; then
            status_code=000
        fi
    fi
    
    # Check if test passed
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS: $test_name${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL: $test_name (Status: $status_code, Expected: $expected_status)${NC}"
        if [ "$VERBOSE" = "true" ]; then
            echo "Response: $response"
        fi
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to test API endpoint
test_endpoint() {
    local endpoint="$1"
    local method="${2:-GET}"
    local data="${3:-}"
    local expected_status="${4:-200}"
    local headers="${5:-}"
    
    local curl_cmd="curl -s -w '%{http_code}' -o /dev/null"
    
    if [ "$method" != "GET" ]; then
        curl_cmd="$curl_cmd -X $method"
    fi
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -d '$data'"
    fi
    
    if [ -n "$headers" ]; then
        curl_cmd="$curl_cmd $headers"
    fi
    
    curl_cmd="$curl_cmd '$API_BASE_URL$endpoint'"
    
    run_test "$endpoint ($method)" "$curl_cmd" "$expected_status"
}

# Function to test with API key
test_endpoint_with_auth() {
    local endpoint="$1"
    local method="${2:-GET}"
    local data="${3:-}"
    local expected_status="${4:-200}"
    
    local headers="-H 'Authorization: Bearer $DEMO_API_KEY' -H 'Content-Type: application/json'"
    
    test_endpoint "$endpoint" "$method" "$data" "$expected_status" "$headers"
}

# Main smoke test function
main() {
    echo -e "${GREEN}🚀 Vatevo API Smoke Test${NC}"
    echo "API Base URL: $API_BASE_URL"
    echo "Demo API Key: $DEMO_API_KEY"
    echo "Timeout: $TIMEOUT seconds"
    echo ""
    
    # Test 1: Health Checks
    echo -e "${YELLOW}📊 Health Checks${NC}"
    test_endpoint "/healthz" "GET" "" "200"
    test_endpoint "/health/ready" "GET" "" "200"
    test_endpoint "/health/live" "GET" "" "200"
    test_endpoint "/health/db" "GET" "" "200"
    test_endpoint "/status" "GET" "" "200"
    
    # Test 2: API Documentation
    echo -e "${YELLOW}📚 API Documentation${NC}"
    test_endpoint "/docs" "GET" "" "200"
    test_endpoint "/openapi.json" "GET" "" "200"
    
    # Test 3: Authentication (without API key)
    echo -e "${YELLOW}🔐 Authentication${NC}"
    test_endpoint "/invoices" "GET" "" "401"
    test_endpoint "/tenants" "GET" "" "401"
    test_endpoint "/api-keys" "GET" "" "401"
    
    # Test 4: Invoice Management (with API key)
    echo -e "${YELLOW}📄 Invoice Management${NC}"
    test_endpoint_with_auth "/invoices" "GET" "" "200"
    test_endpoint_with_auth "/invoices?status=validated" "GET" "" "200"
    test_endpoint_with_auth "/invoices?country_code=IT" "GET" "" "200"
    
    # Test 5: Invoice Validation
    echo -e "${YELLOW}✅ Invoice Validation${NC}"
    local validation_data='{
        "country_code": "IT",
        "supplier": {
            "name": "Test Supplier",
            "vat_id": "IT12345678901",
            "address": "Via Roma 1",
            "city": "Milano",
            "postal_code": "20100",
            "country": "IT"
        },
        "customer": {
            "name": "Test Customer",
            "vat_id": "IT98765432109",
            "address": "Via Milano 2",
            "city": "Roma",
            "postal_code": "00100",
            "country": "IT"
        },
        "line_items": [{
            "description": "Test Item",
            "quantity": 1,
            "unit_price": "100.00",
            "tax_rate": 22.0,
            "tax_amount": "22.00",
            "line_total": "100.00"
        }]
    }'
    
    test_endpoint_with_auth "/validate" "POST" "$validation_data" "200"
    
    # Test 6: Invoice Creation (Demo)
    echo -e "${YELLOW}📝 Invoice Creation (Demo)${NC}"
    local invoice_data='{
        "country_code": "IT",
        "supplier": {
            "name": "Smoke Test Supplier",
            "vat_id": "IT12345678901",
            "address": "Via Roma 1",
            "city": "Milano",
            "postal_code": "20100",
            "country": "IT"
        },
        "customer": {
            "name": "Smoke Test Customer",
            "vat_id": "IT98765432109",
            "address": "Via Milano 2",
            "city": "Roma",
            "postal_code": "00100",
            "country": "IT"
        },
        "line_items": [{
            "description": "Smoke Test Item",
            "quantity": 1,
            "unit_price": "100.00",
            "tax_rate": 22.0,
            "tax_amount": "22.00",
            "line_total": "100.00"
        }]
    }'
    
    # Create invoice and get ID
    local create_response
    create_response=$(curl -s -X POST \
        -H "Authorization: Bearer $DEMO_API_KEY" \
        -H "Content-Type: application/json" \
        -d "$invoice_data" \
        "$API_BASE_URL/invoices")
    
    local invoice_id
    invoice_id=$(echo "$create_response" | jq -r '.id // empty')
    
    if [ -n "$invoice_id" ]; then
        echo -e "${GREEN}✅ Invoice created with ID: $invoice_id${NC}"
        
        # Test invoice retrieval
        test_endpoint_with_auth "/invoices/$invoice_id" "GET" "" "200"
        
        # Test invoice status polling
        echo -e "${YELLOW}⏳ Polling invoice status...${NC}"
        local max_attempts=10
        local attempt=1
        local status=""
        
        while [ $attempt -le $max_attempts ]; do
            local status_response
            status_response=$(curl -s -H "Authorization: Bearer $DEMO_API_KEY" \
                "$API_BASE_URL/invoices/$invoice_id")
            
            status=$(echo "$status_response" | jq -r '.status // empty')
            
            if [ "$status" = "validated" ]; then
                echo -e "${GREEN}✅ Invoice validated successfully${NC}"
                break
            elif [ "$status" = "failed" ] || [ "$status" = "rejected" ]; then
                echo -e "${RED}❌ Invoice failed with status: $status${NC}"
                break
            else
                echo -e "${YELLOW}⏳ Invoice status: $status (attempt $attempt/$max_attempts)${NC}"
                sleep 2
                attempt=$((attempt + 1))
            fi
        done
        
        if [ $attempt -gt $max_attempts ]; then
            echo -e "${RED}❌ Invoice validation timeout${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    else
        echo -e "${RED}❌ Failed to create invoice${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    # Test 7: Webhook Testing
    echo -e "${YELLOW}🔔 Webhook Testing${NC}"
    test_endpoint_with_auth "/webhooks/test" "POST" "" "200"
    test_endpoint_with_auth "/webhooks/events" "GET" "" "200"
    
    # Test 8: API Key Management
    echo -e "${YELLOW}🔑 API Key Management${NC}"
    test_endpoint_with_auth "/api-keys" "GET" "" "200"
    
    # Test 9: Error Handling
    echo -e "${YELLOW}⚠️ Error Handling${NC}"
    test_endpoint_with_auth "/invoices/999999" "GET" "" "404"
    test_endpoint_with_auth "/validate" "POST" '{"invalid": "data"}' "422"
    
    # Test 10: Rate Limiting (if configured)
    echo -e "${YELLOW}🚦 Rate Limiting${NC}"
    # Make multiple requests quickly to test rate limiting
    local rate_limit_test_passed=true
    for i in {1..5}; do
        local rate_response
        rate_response=$(curl -s -w '%{http_code}' -o /dev/null \
            -H "Authorization: Bearer $DEMO_API_KEY" \
            "$API_BASE_URL/healthz")
        
        if [ "$rate_response" = "429" ]; then
            echo -e "${GREEN}✅ Rate limiting working (request $i returned 429)${NC}"
            break
        elif [ "$i" -eq 5 ]; then
            echo -e "${YELLOW}⚠️ Rate limiting not triggered (may not be configured)${NC}"
        fi
        
        sleep 0.1
    done
    
    # Summary
    echo ""
    echo -e "${GREEN}📊 Smoke Test Summary${NC}"
    echo "=================="
    echo -e "Total Tests: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}❌ Some tests failed!${NC}"
        exit 1
    fi
}

# Help function
show_help() {
    echo "Vatevo API Smoke Test"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -u, --url URL          API base URL (default: https://api.vatevo.com)"
    echo "  -k, --key KEY          Demo API key (default: demo-smoke-test-key)"
    echo "  -t, --timeout SECONDS  Timeout for requests (default: 30)"
    echo "  -v, --verbose          Verbose output"
    echo "  -h, --help             Show this help"
    echo ""
    echo "Environment Variables:"
    echo "  API_BASE_URL          API base URL"
    echo "  DEMO_API_KEY          Demo API key"
    echo "  TIMEOUT               Request timeout"
    echo "  VERBOSE               Verbose output (true/false)"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Run with defaults"
    echo "  $0 -u http://localhost:8000          # Test local API"
    echo "  $0 -k your-api-key                   # Use specific API key"
    echo "  $0 -v                                # Verbose output"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--url)
            API_BASE_URL="$2"
            shift 2
            ;;
        -k|--key)
            DEMO_API_KEY="$2"
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
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Run main function
main