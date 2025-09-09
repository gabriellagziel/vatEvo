#!/usr/bin/env bash
set -euo pipefail

DOMAIN="vatevo.com"
RESOLVERS=("1.1.1.1" "8.8.8.8")
rows=(
  "A @"
  "CNAME www"
  "CNAME dashboard"
  "CNAME docs"
  "CNAME api"
)

echo "== DNS VERIFY: ${DOMAIN} =="
for r in "${RESOLVERS[@]}"; do
  echo "-- resolver ${r} --"
  for row in "${rows[@]}"; do
    t=${row%% *}; h=${row##* }
    fqdn=$([ "$h" = "@" ] && echo "$DOMAIN" || echo "$h.$DOMAIN")
    if [ "$t" = "A" ]; then
      dig @"$r" +short A "$fqdn"
    else
      dig @"$r" +short CNAME "$fqdn"
    fi
  done
  echo
done

#!/bin/bash
# DNS Cutover Verification Script
# This script verifies DNS resolution and service accessibility after cutover

set -euo pipefail

# Configuration
TIMEOUT="${TIMEOUT:-10}"
VERBOSE="${VERBOSE:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED++))
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Test functions
test_dns_resolution() {
    local domain="$1"
    local expected_type="$2"
    local expected_target="$3"
    
    log_info "Testing DNS resolution for $domain"
    
    if [[ "$expected_type" == "A" ]]; then
        local result
        result=$(dig +short A "$domain" | head -1)
        if [[ "$result" == "$expected_target" ]]; then
            log_success "$domain resolves to $result"
        else
            log_error "$domain resolves to $result (expected $expected_target)"
        fi
    elif [[ "$expected_type" == "CNAME" ]]; then
        local result
        result=$(dig +short CNAME "$domain" | head -1)
        if [[ "$result" == "$expected_target" ]]; then
            log_success "$domain CNAME points to $result"
        else
            log_error "$domain CNAME points to $result (expected $expected_target)"
        fi
    fi
}

test_http_response() {
    local url="$1"
    local expected_status="$2"
    
    log_info "Testing HTTP response for $url"
    
    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$url")
    
    if [[ "$status_code" == "$expected_status" ]]; then
        log_success "$url returns $status_code"
    else
        log_error "$url returns $status_code (expected $expected_status)"
    fi
}

test_https_ssl() {
    local domain="$1"
    
    log_info "Testing SSL certificate for $domain"
    
    if openssl s_client -connect "$domain:443" -servername "$domain" -verify_return_error < /dev/null > /dev/null 2>&1; then
        log_success "$domain has valid SSL certificate"
    else
        log_error "$domain SSL certificate validation failed"
    fi
}

test_redirect() {
    local from_url="$1"
    local to_url="$2"
    
    log_info "Testing redirect from $from_url to $to_url"
    
    local redirect_url
    redirect_url=$(curl -s -o /dev/null -w "%{redirect_url}" --max-time "$TIMEOUT" "$from_url")
    
    if [[ "$redirect_url" == "$to_url" ]]; then
        log_success "$from_url redirects to $to_url"
    else
        log_error "$from_url redirects to $redirect_url (expected $to_url)"
    fi
}

# Main verification tests
verify_apex_domain() {
    log_info "=== Verifying Apex Domain ==="
    
    # Test A record
    test_dns_resolution "vatevo.com" "A" "76.76.21.21"
    
    # Test HTTPS
    test_https_ssl "vatevo.com"
    
    # Test HTTP response
    test_http_response "https://vatevo.com" "200"
    
    # Test specific pages
    test_http_response "https://vatevo.com/vida" "200"
    test_http_response "https://vatevo.com/compare" "200"
}

verify_www_redirect() {
    log_info "=== Verifying WWW Redirect ==="
    
    # Test CNAME
    test_dns_resolution "www.vatevo.com" "CNAME" "cname.vercel-dns.com"
    
    # Test redirect
    test_redirect "https://www.vatevo.com" "https://vatevo.com"
}

verify_dashboard_domain() {
    log_info "=== Verifying Dashboard Domain ==="
    
    # Test CNAME
    test_dns_resolution "dashboard.vatevo.com" "CNAME" "cname.vercel-dns.com"
    
    # Test HTTPS
    test_https_ssl "dashboard.vatevo.com"
    
    # Test HTTP response
    test_http_response "https://dashboard.vatevo.com" "200"
}

verify_api_domain() {
    log_info "=== Verifying API Domain ==="
    
    # Test CNAME (assuming Fly.io provides CNAME target)
    test_dns_resolution "api.vatevo.com" "CNAME" "app-ezgnqzzi.fly.dev"
    
    # Test HTTPS
    test_https_ssl "api.vatevo.com"
    
    # Test health endpoints
    test_http_response "https://api.vatevo.com/health/ready" "200"
    test_http_response "https://api.vatevo.com/health/db" "200"
    test_http_response "https://api.vatevo.com/docs" "200"
}

verify_docs_domain() {
    log_info "=== Verifying Docs Domain ==="
    
    # Test CNAME
    test_dns_resolution "docs.vatevo.com" "CNAME" "cname.vercel-dns.com"
    
    # Test HTTPS
    test_https_ssl "docs.vatevo.com"
    
    # Test HTTP response (should redirect to API docs)
    test_http_response "https://docs.vatevo.com" "200"
}

# Performance tests
test_performance() {
    log_info "=== Performance Tests ==="
    
    local domains=("vatevo.com" "dashboard.vatevo.com" "api.vatevo.com")
    
    for domain in "${domains[@]}"; do
        local response_time
        response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time "$TIMEOUT" "https://$domain")
        
        if (( $(echo "$response_time < 2.0" | bc -l) )); then
            log_success "$domain response time: ${response_time}s"
        else
            log_warn "$domain response time: ${response_time}s (slow)"
        fi
    done
}

# Global DNS propagation test
test_global_propagation() {
    log_info "=== Global DNS Propagation Test ==="
    
    local dns_servers=("8.8.8.8" "1.1.1.1" "208.67.222.222")
    local domain="vatevo.com"
    local expected_ip="76.76.21.21"
    
    for dns_server in "${dns_servers[@]}"; do
        local result
        result=$(dig @$dns_server +short A "$domain" | head -1)
        
        if [[ "$result" == "$expected_ip" ]]; then
            log_success "DNS server $dns_server: $domain → $result"
        else
            log_warn "DNS server $dns_server: $domain → $result (expected $expected_ip)"
        fi
    done
}

# Print summary
print_summary() {
    echo ""
    log_info "=== Verification Summary ==="
    echo "  ✅ Passed: $PASSED"
    echo "  ❌ Failed: $FAILED"
    echo "  📊 Total:  $((PASSED + FAILED))"
    
    if [[ $FAILED -eq 0 ]]; then
        log_success "🎉 All DNS cutover verifications passed!"
        exit 0
    else
        log_error "💥 $FAILED verification(s) failed!"
        exit 1
    fi
}

# Main execution
main() {
    log_info "Starting DNS cutover verification..."
    log_info "Timeout: ${TIMEOUT}s"
    echo ""
    
    # Run all verification tests
    verify_apex_domain
    verify_www_redirect
    verify_dashboard_domain
    verify_api_domain
    verify_docs_domain
    test_performance
    test_global_propagation
    
    print_summary
}

# Help function
show_help() {
    cat << EOF
DNS Cutover Verification Script

Usage: $0 [OPTIONS]

Options:
    -t, --timeout SEC    Request timeout in seconds (default: 10)
    -v, --verbose        Enable verbose output
    -h, --help           Show this help message

Environment Variables:
    TIMEOUT              Request timeout in seconds
    VERBOSE              Enable verbose output

Examples:
    $0                                    # Run with default settings
    $0 -t 30 -v                          # Run with 30s timeout and verbose output

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
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

# Check dependencies
if ! command -v dig &> /dev/null; then
    log_error "dig command not found. Please install dnsutils."
    exit 1
fi

if ! command -v curl &> /dev/null; then
    log_error "curl command not found. Please install curl."
    exit 1
fi

if ! command -v openssl &> /dev/null; then
    log_error "openssl command not found. Please install openssl."
    exit 1
fi

if ! command -v bc &> /dev/null; then
    log_error "bc command not found. Please install bc."
    exit 1
fi

# Run main function
main
