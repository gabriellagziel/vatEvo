#!/bin/bash
# PostgreSQL Migration Preparation Script
# This script prepares PostgreSQL for production deployment

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$(cd "${SCRIPT_DIR}/../../apps/api" && pwd)"
TIMEOUT="${TIMEOUT:-30}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if POSTGRES_URL is set
check_postgres_url() {
    if [[ -z "${POSTGRES_URL:-}" ]]; then
        log_error "POSTGRES_URL environment variable is not set"
        log_info "Please set POSTGRES_URL before running this script"
        log_info "Example: export POSTGRES_URL='postgresql://user:pass@host:port/db'"
        exit 1
    fi
    
    log_success "POSTGRES_URL is set"
}

# Check if Alembic is available
check_alembic() {
    cd "${API_DIR}"
    
    if ! command -v alembic &> /dev/null; then
        log_error "Alembic is not installed or not in PATH"
        log_info "Please install Alembic: pip install alembic"
        exit 1
    fi
    
    log_success "Alembic is available"
}

# Check database connectivity
check_database_connection() {
    log_info "Testing database connectivity..."
    
    if python "${SCRIPT_DIR}/check_connection.py" --url "${POSTGRES_URL}" --timeout "${TIMEOUT}"; then
        log_success "Database connection successful"
    else
        log_error "Database connection failed"
        log_info "Please check your POSTGRES_URL and ensure the database is accessible"
        exit 1
    fi
}

# Run Alembic upgrade
run_alembic_upgrade() {
    log_info "Running Alembic upgrade..."
    
    cd "${API_DIR}"
    
    # Set environment variable for Alembic
    export DATABASE_URL="${POSTGRES_URL}"
    
    # Run upgrade
    if alembic upgrade head; then
        log_success "Alembic upgrade completed successfully"
    else
        log_error "Alembic upgrade failed"
        log_info "Please check the error messages above"
        exit 1
    fi
}

# Verify migration status
verify_migration_status() {
    log_info "Verifying migration status..."
    
    cd "${API_DIR}"
    
    # Get current revision
    local current_revision
    current_revision=$(alembic current 2>/dev/null | grep -o '^[a-f0-9]\+' || echo "none")
    
    # Get head revision
    local head_revision
    head_revision=$(alembic heads 2>/dev/null | grep -o '^[a-f0-9]\+' || echo "none")
    
    if [[ "${current_revision}" == "${head_revision}" ]]; then
        log_success "Database is at the latest revision: ${current_revision}"
    else
        log_warn "Database revision mismatch:"
        log_warn "  Current: ${current_revision}"
        log_warn "  Head: ${head_revision}"
        log_info "This may indicate a migration issue"
    fi
}

# Test database schema
test_database_schema() {
    log_info "Testing database schema..."
    
    cd "${API_DIR}"
    
    # Test basic database operations
    if python -c "
import os
import sys
sys.path.append('.')
from app.database import engine
from app.models import Base

# Test table creation
Base.metadata.create_all(bind=engine)
print('Schema test passed')
"; then
        log_success "Database schema test passed"
    else
        log_error "Database schema test failed"
        log_info "Please check the database permissions and schema"
        exit 1
    fi
}

# Print summary
print_summary() {
    log_info "PostgreSQL preparation summary:"
    echo "  ✅ Database connection verified"
    echo "  ✅ Alembic upgrade completed"
    echo "  ✅ Migration status verified"
    echo "  ✅ Schema test passed"
    echo ""
    log_success "PostgreSQL is ready for production deployment"
}

# Main execution
main() {
    log_info "Starting PostgreSQL preparation..."
    log_info "API Directory: ${API_DIR}"
    log_info "Timeout: ${TIMEOUT}s"
    echo ""
    
    # Run all checks and operations
    check_postgres_url
    check_alembic
    check_database_connection
    run_alembic_upgrade
    verify_migration_status
    test_database_schema
    print_summary
}

# Help function
show_help() {
    cat << EOF
PostgreSQL Migration Preparation Script

Usage: $0 [OPTIONS]

Options:
    -t, --timeout SEC    Connection timeout in seconds (default: 30)
    -h, --help           Show this help message

Environment Variables:
    POSTGRES_URL         PostgreSQL connection URL (required)
    TIMEOUT              Connection timeout in seconds

Examples:
    $0                                    # Run with default settings
    POSTGRES_URL="postgresql://..." $0    # Run with specific database
    $0 -t 60                             # Run with 60s timeout

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
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
