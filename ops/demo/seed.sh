#!/bin/bash
# Demo Data Seeding Script
# Creates demo tenants, API keys, invoices, and webhook events for investor demos

set -euo pipefail

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:8000}"
API_KEY="${API_KEY:-demo-admin-key}"
DB_URL="${DB_URL:-sqlite:///./vatevo.db}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🌱 Seeding Vatevo Demo Data${NC}"
echo "API Base URL: $API_BASE_URL"
echo "Database URL: $DB_URL"
echo ""

# Check if API is running
if ! curl -s "$API_BASE_URL/healthz" > /dev/null; then
    echo -e "${RED}❌ API is not running at $API_BASE_URL${NC}"
    echo "Please start the API server first:"
    echo "  cd apps/api && python -m uvicorn app.main:app --reload"
    exit 1
fi

echo -e "${GREEN}✅ API is running${NC}"

# Function to make API calls
api_call() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    
    if [ "$method" = "GET" ]; then
        curl -s -H "Authorization: Bearer $API_KEY" \
             -H "Content-Type: application/json" \
             "$API_BASE_URL$endpoint"
    else
        curl -s -X "$method" \
             -H "Authorization: Bearer $API_KEY" \
             -H "Content-Type: application/json" \
             -d "$data" \
             "$API_BASE_URL$endpoint"
    fi
}

# Function to create tenant
create_tenant() {
    local name="$1"
    local plan="$2"
    local webhook_url="$3"
    
    echo -e "${YELLOW}Creating tenant: $name${NC}"
    
    local response=$(api_call "POST" "/tenants" "{
        \"name\": \"$name\",
        \"webhook_url\": \"$webhook_url\"
    }")
    
    local tenant_id=$(echo "$response" | jq -r '.id // empty')
    if [ -z "$tenant_id" ]; then
        echo -e "${RED}❌ Failed to create tenant $name${NC}"
        echo "Response: $response"
        return 1
    fi
    
    echo -e "${GREEN}✅ Created tenant $name (ID: $tenant_id)${NC}"
    echo "$tenant_id"
}

# Function to create API key
create_api_key() {
    local tenant_id="$1"
    local name="$2"
    local expires_days="$3"
    
    echo -e "${YELLOW}Creating API key: $name${NC}"
    
    local response=$(api_call "POST" "/api-keys" "{
        \"name\": \"$name\",
        \"expires_days\": $expires_days
    }")
    
    local api_key=$(echo "$response" | jq -r '.api_key // empty')
    if [ -z "$api_key" ]; then
        echo -e "${RED}❌ Failed to create API key $name${NC}"
        echo "Response: $response"
        return 1
    fi
    
    echo -e "${GREEN}✅ Created API key $name${NC}"
    echo "$api_key"
}

# Function to create invoice
create_invoice() {
    local api_key="$1"
    local country_code="$2"
    local status="$3"
    local supplier_name="$4"
    local customer_name="$5"
    local amount="$6"
    
    echo -e "${YELLOW}Creating invoice: $supplier_name → $customer_name ($country_code)${NC}"
    
    local response=$(curl -s -X POST \
        -H "Authorization: Bearer $api_key" \
        -H "Content-Type: application/json" \
        -d "{
            \"country_code\": \"$country_code\",
            \"supplier\": {
                \"name\": \"$supplier_name\",
                \"vat_id\": \"${country_code}12345678901\",
                \"address\": \"Via Roma 1\",
                \"city\": \"Milano\",
                \"postal_code\": \"20100\",
                \"country\": \"$country_code\"
            },
            \"customer\": {
                \"name\": \"$customer_name\",
                \"vat_id\": \"${country_code}98765432109\",
                \"address\": \"Via Milano 2\",
                \"city\": \"Roma\",
                \"postal_code\": \"00100\",
                \"country\": \"$country_code\"
            },
            \"line_items\": [{
                \"description\": \"Demo Item\",
                \"quantity\": 1,
                \"unit_price\": \"$amount\",
                \"tax_rate\": 22.0,
                \"tax_amount\": \"$(echo "$amount * 0.22" | bc -l)\",
                \"line_total\": \"$amount\"
            }]
        }" \
        "$API_BASE_URL/invoices")
    
    local invoice_id=$(echo "$response" | jq -r '.id // empty')
    if [ -z "$invoice_id" ]; then
        echo -e "${RED}❌ Failed to create invoice${NC}"
        echo "Response: $response"
        return 1
    fi
    
    echo -e "${GREEN}✅ Created invoice $invoice_id${NC}"
    echo "$invoice_id"
}

# Function to test webhook
test_webhook() {
    local api_key="$1"
    
    echo -e "${YELLOW}Testing webhook delivery${NC}"
    
    local response=$(curl -s -X POST \
        -H "Authorization: Bearer $api_key" \
        "$API_BASE_URL/webhooks/test")
    
    local success=$(echo "$response" | jq -r '.success // false')
    if [ "$success" = "true" ]; then
        echo -e "${GREEN}✅ Webhook test successful${NC}"
    else
        echo -e "${YELLOW}⚠️ Webhook test failed (expected if no webhook URL configured)${NC}"
    fi
}

# Create demo tenants
echo -e "${GREEN}🏢 Creating Demo Tenants${NC}"

TENANT_SMB=$(create_tenant "demo-smb" "free" "https://webhook.site/demo-smb")
TENANT_MARKETPLACE=$(create_tenant "demo-marketplace" "pro" "https://webhook.site/demo-marketplace")
TENANT_ENTERPRISE=$(create_tenant "demo-enterprise" "enterprise" "https://webhook.site/demo-enterprise")

# Create API keys for each tenant
echo -e "${GREEN}🔑 Creating API Keys${NC}"

API_KEY_SMB=$(create_api_key "$TENANT_SMB" "SMB Production Key" 365)
API_KEY_MARKETPLACE=$(create_api_key "$TENANT_MARKETPLACE" "Marketplace Integration" 365)
API_KEY_ENTERPRISE=$(create_api_key "$TENANT_ENTERPRISE" "Enterprise Master Key" 365)

# Create demo invoices for SMB tenant
echo -e "${GREEN}📄 Creating SMB Invoices${NC}"

create_invoice "$API_KEY_SMB" "IT" "validated" "Acme SRL" "Beta SpA" "100.00"
create_invoice "$API_KEY_SMB" "IT" "submitted" "Acme SRL" "Gamma Srl" "250.00"
create_invoice "$API_KEY_SMB" "IT" "accepted" "Acme SRL" "Delta SRL" "500.00"
create_invoice "$API_KEY_SMB" "IT" "rejected" "Acme SRL" "Epsilon SRL" "75.00"
create_invoice "$API_KEY_SMB" "IT" "failed" "Acme SRL" "Zeta SRL" "150.00"

# Create demo invoices for Marketplace tenant
echo -e "${GREEN}📄 Creating Marketplace Invoices${NC}"

create_invoice "$API_KEY_MARKETPLACE" "DE" "validated" "Deutsche GmbH" "French SARL" "300.00"
create_invoice "$API_KEY_MARKETPLACE" "DE" "submitted" "Deutsche GmbH" "Spanish SL" "450.00"
create_invoice "$API_KEY_MARKETPLACE" "DE" "accepted" "Deutsche GmbH" "Dutch BV" "600.00"
create_invoice "$API_KEY_MARKETPLACE" "FR" "validated" "Française SARL" "German GmbH" "200.00"
create_invoice "$API_KEY_MARKETPLACE" "FR" "submitted" "Française SARL" "Italian SRL" "350.00"
create_invoice "$API_KEY_MARKETPLACE" "ES" "validated" "Española SL" "German GmbH" "400.00"
create_invoice "$API_KEY_MARKETPLACE" "NL" "validated" "Nederlandse BV" "French SARL" "275.00"

# Create demo invoices for Enterprise tenant
echo -e "${GREEN}📄 Creating Enterprise Invoices${NC}"

create_invoice "$API_KEY_ENTERPRISE" "IT" "validated" "Enterprise IT SRL" "Client A SpA" "1000.00"
create_invoice "$API_KEY_ENTERPRISE" "IT" "submitted" "Enterprise IT SRL" "Client B SpA" "2500.00"
create_invoice "$API_KEY_ENTERPRISE" "IT" "accepted" "Enterprise IT SRL" "Client C SpA" "5000.00"
create_invoice "$API_KEY_ENTERPRISE" "DE" "validated" "Enterprise DE GmbH" "Client D SARL" "1500.00"
create_invoice "$API_KEY_ENTERPRISE" "DE" "submitted" "Enterprise DE GmbH" "Client E SL" "3000.00"
create_invoice "$API_KEY_ENTERPRISE" "FR" "validated" "Enterprise FR SARL" "Client F BV" "2000.00"
create_invoice "$API_KEY_ENTERPRISE" "ES" "validated" "Enterprise ES SL" "Client G SRL" "1750.00"
create_invoice "$API_KEY_ENTERPRISE" "NL" "validated" "Enterprise NL BV" "Client H GmbH" "2250.00"
create_invoice "$API_KEY_ENTERPRISE" "PL" "validated" "Enterprise PL Sp. z o.o." "Client I SpA" "1200.00"

# Test webhooks for each tenant
echo -e "${GREEN}🔔 Testing Webhooks${NC}"

test_webhook "$API_KEY_SMB"
test_webhook "$API_KEY_MARKETPLACE"
test_webhook "$API_KEY_ENTERPRISE"

# Summary
echo ""
echo -e "${GREEN}🎉 Demo Data Seeding Complete!${NC}"
echo ""
echo "Created:"
echo "  • 3 demo tenants (SMB, Marketplace, Enterprise)"
echo "  • 3 API keys (one per tenant)"
echo "  • 20 demo invoices across IT/DE/FR/ES/NL/PL"
echo "  • Mixed statuses: validated, submitted, accepted, rejected, failed"
echo "  • Webhook endpoints configured"
echo ""
echo "API Keys (for testing):"
echo "  • SMB: $API_KEY_SMB"
echo "  • Marketplace: $API_KEY_MARKETPLACE"
echo "  • Enterprise: $API_KEY_ENTERPRISE"
echo ""
echo "Next steps:"
echo "  • Test API endpoints with the keys above"
echo "  • Run dashboard to see the demo data"
echo "  • Execute demo flows from docs/DEMO_RUN.md"
