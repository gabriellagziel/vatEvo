-- Backup Verification Script
-- This script verifies the integrity of a database backup
-- Run after restoring from backup to ensure data consistency

-- Check table counts
SELECT 
  'tenants' as table_name, 
  COUNT(*) as record_count 
FROM tenants
UNION ALL
SELECT 
  'invoices' as table_name, 
  COUNT(*) as record_count 
FROM invoices
UNION ALL
SELECT 
  'webhook_events' as table_name, 
  COUNT(*) as record_count 
FROM webhook_events
UNION ALL
SELECT 
  'api_keys' as table_name, 
  COUNT(*) as record_count 
FROM api_keys;

-- Check data integrity
SELECT 
  COUNT(*) as invalid_invoices
FROM invoices 
WHERE created_at > updated_at;

-- Check foreign key constraints
SELECT 
  COUNT(*) as orphaned_invoices
FROM invoices i
LEFT JOIN tenants t ON i.tenant_id = t.id
WHERE t.id IS NULL;

-- Check for missing required fields
SELECT 
  COUNT(*) as invoices_missing_supplier
FROM invoices 
WHERE supplier_name IS NULL OR supplier_name = '';

SELECT 
  COUNT(*) as invoices_missing_customer
FROM invoices 
WHERE customer_name IS NULL OR customer_name = '';

-- Check invoice status distribution
SELECT 
  status,
  COUNT(*) as count
FROM invoices 
GROUP BY status
ORDER BY count DESC;

-- Check tenant data integrity
SELECT 
  COUNT(*) as tenants_missing_name
FROM tenants 
WHERE name IS NULL OR name = '';

-- Check API key data integrity
SELECT 
  COUNT(*) as api_keys_missing_hash
FROM api_keys 
WHERE key_hash IS NULL OR key_hash = '';

-- Check webhook event data integrity
SELECT 
  COUNT(*) as webhook_events_missing_type
FROM webhook_events 
WHERE event_type IS NULL OR event_type = '';

-- Check for duplicate invoices (should be 0)
SELECT 
  COUNT(*) as duplicate_invoices
FROM (
  SELECT 
    tenant_id, 
    supplier_name, 
    customer_name, 
    total_amount, 
    created_at,
    COUNT(*) as cnt
  FROM invoices 
  GROUP BY tenant_id, supplier_name, customer_name, total_amount, created_at
  HAVING COUNT(*) > 1
) duplicates;

-- Check for recent data (last 24 hours)
SELECT 
  COUNT(*) as recent_invoices
FROM invoices 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Check for active API keys
SELECT 
  COUNT(*) as active_api_keys
FROM api_keys 
WHERE is_active = true 
  AND (expires_at IS NULL OR expires_at > NOW());

-- Summary report
SELECT 
  'BACKUP VERIFICATION SUMMARY' as report_type,
  NOW() as verification_time,
  (SELECT COUNT(*) FROM tenants) as tenant_count,
  (SELECT COUNT(*) FROM invoices) as invoice_count,
  (SELECT COUNT(*) FROM webhook_events) as webhook_event_count,
  (SELECT COUNT(*) FROM api_keys) as api_key_count;
