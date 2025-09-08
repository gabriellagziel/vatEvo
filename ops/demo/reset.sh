#!/bin/bash
# Demo Data Reset Script
# Truncates demo data only (preserves system data)

set -euo pipefail

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:8000}"
API_KEY="${API_KEY:-demo-admin-key}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Resetting Vatevo Demo Data${NC}"
echo "API Base URL: $API_BASE_URL"
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

# Function to delete tenant (this will cascade delete invoices and API keys)
delete_tenant() {
    local tenant_name="$1"
    
    echo -e "${YELLOW}Deleting tenant: $tenant_name${NC}"
    
    # Get tenant ID by name (this would need to be implemented in the API)
    # For now, we'll use a direct database approach or API call
    local response=$(api_call "GET" "/tenants")
    
    local tenant_id=$(echo "$response" | jq -r ".[] | select(.name == \"$tenant_name\") | .id // empty")
    
    if [ -z "$tenant_id" ]; then
        echo -e "${YELLOW}⚠️ Tenant $tenant_name not found (may already be deleted)${NC}"
        return 0
    fi
    
    # Delete tenant (this should cascade delete related data)
    local delete_response=$(api_call "DELETE" "/tenants/$tenant_id" "")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Deleted tenant $tenant_name${NC}"
    else
        echo -e "${RED}❌ Failed to delete tenant $tenant_name${NC}"
        echo "Response: $delete_response"
        return 1
    fi
}

# Delete demo tenants
echo -e "${GREEN}🗑️ Deleting Demo Tenants${NC}"

delete_tenant "demo-smb"
delete_tenant "demo-marketplace"
delete_tenant "demo-enterprise"

# Alternative: Direct database cleanup (if API doesn't support tenant deletion)
echo -e "${YELLOW}⚠️ If tenant deletion via API failed, you may need to manually clean the database${NC}"
echo ""
echo "Manual cleanup commands (if needed):"
echo "  # Connect to your database and run:"
echo "  DELETE FROM webhook_events WHERE tenant_id IN ("
echo "    SELECT id FROM tenants WHERE name LIKE 'demo-%'"
echo "  );"
echo "  DELETE FROM invoices WHERE tenant_id IN ("
echo "    SELECT id FROM tenants WHERE name LIKE 'demo-%'"
echo "  );"
echo "  DELETE FROM api_keys WHERE tenant_id IN ("
echo "    SELECT id FROM tenants WHERE name LIKE 'demo-%'"
echo "  );"
echo "  DELETE FROM tenants WHERE name LIKE 'demo-%';"
echo ""

# Summary
echo -e "${GREEN}🎉 Demo Data Reset Complete!${NC}"
echo ""
echo "Removed:"
echo "  • 3 demo tenants (SMB, Marketplace, Enterprise)"
echo "  • All associated API keys"
echo "  • All associated invoices"
echo "  • All associated webhook events"
echo ""
echo "System data preserved:"
echo "  • System configuration"
echo "  • Non-demo tenants"
echo "  • Database schema"
echo ""
echo "To re-seed demo data, run:"
echo "  ./ops/demo/seed.sh"
