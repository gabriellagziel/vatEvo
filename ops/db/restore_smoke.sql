-- Restore Verification Script
-- This script verifies the integrity of a database restore
-- Run after restoring from backup to ensure data consistency

-- Check S3 data integrity
-- Note: This would typically be done via AWS CLI or SDK
-- This SQL script focuses on database integrity

-- Check invoice PDFs exist (verify S3 integration)
SELECT 
  i.id,
  i.pdf_url,
  CASE 
    WHEN i.pdf_url IS NOT NULL THEN 'Has PDF'
    ELSE 'Missing PDF'
  END as pdf_status
FROM invoices i
WHERE i.status = 'accepted'
LIMIT 10;

-- Check UBL XML exists
SELECT 
  i.id,
  CASE 
    WHEN i.ubl_xml IS NOT NULL THEN 'Has UBL'
    ELSE 'Missing UBL'
  END as ubl_status
FROM invoices i
WHERE i.status IN ('validated', 'submitted', 'accepted')
LIMIT 10;

-- Check country-specific XML exists
SELECT 
  i.id,
  i.country_code,
  CASE 
    WHEN i.country_xml IS NOT NULL THEN 'Has Country XML'
    ELSE 'Missing Country XML'
  END as country_xml_status
FROM invoices i
WHERE i.status IN ('validated', 'submitted', 'accepted')
LIMIT 10;

-- Check webhook delivery status
SELECT 
  we.status,
  COUNT(*) as count
FROM webhook_events we
GROUP BY we.status
ORDER BY count DESC;

-- Check failed webhook deliveries
SELECT 
  we.id,
  we.event_type,
  we.status,
  we.error_message,
  we.created_at
FROM webhook_events we
WHERE we.status = 'failed'
ORDER BY we.created_at DESC
LIMIT 10;

-- Check API key usage patterns
SELECT 
  ak.name,
  ak.last_used,
  ak.created_at,
  CASE 
    WHEN ak.last_used IS NULL THEN 'Never Used'
    WHEN ak.last_used < NOW() - INTERVAL '30 days' THEN 'Inactive'
    ELSE 'Active'
  END as usage_status
FROM api_keys ak
WHERE ak.is_active = true
ORDER BY ak.last_used DESC;

-- Check tenant activity
SELECT 
  t.name,
  t.created_at,
  COUNT(i.id) as invoice_count,
  MAX(i.created_at) as last_invoice_date
FROM tenants t
LEFT JOIN invoices i ON t.id = i.tenant_id
GROUP BY t.id, t.name, t.created_at
ORDER BY last_invoice_date DESC;

-- Check data consistency across tables
SELECT 
  'Data Consistency Check' as check_type,
  (SELECT COUNT(*) FROM tenants) as tenant_count,
  (SELECT COUNT(DISTINCT tenant_id) FROM invoices) as tenants_with_invoices,
  (SELECT COUNT(DISTINCT tenant_id) FROM webhook_events) as tenants_with_webhooks,
  (SELECT COUNT(DISTINCT tenant_id) FROM api_keys) as tenants_with_api_keys;

-- Check for data anomalies
SELECT 
  'Data Anomalies' as check_type,
  COUNT(*) as invoices_with_future_dates
FROM invoices 
WHERE created_at > NOW();

SELECT 
  'Data Anomalies' as check_type,
  COUNT(*) as invoices_with_negative_amounts
FROM invoices 
WHERE total_amount < 0;

-- Check webhook event consistency
SELECT 
  'Webhook Consistency' as check_type,
  COUNT(*) as webhook_events_without_tenant
FROM webhook_events we
LEFT JOIN tenants t ON we.tenant_id = t.id
WHERE t.id IS NULL;

-- Check API key consistency
SELECT 
  'API Key Consistency' as check_type,
  COUNT(*) as api_keys_without_tenant
FROM api_keys ak
LEFT JOIN tenants t ON ak.tenant_id = t.id
WHERE t.id IS NULL;

-- Final integrity check
SELECT 
  'RESTORE VERIFICATION SUMMARY' as report_type,
  NOW() as verification_time,
  (SELECT COUNT(*) FROM tenants) as tenant_count,
  (SELECT COUNT(*) FROM invoices) as invoice_count,
  (SELECT COUNT(*) FROM webhook_events) as webhook_event_count,
  (SELECT COUNT(*) FROM api_keys) as api_key_count,
  (SELECT COUNT(*) FROM invoices WHERE pdf_url IS NOT NULL) as invoices_with_pdfs,
  (SELECT COUNT(*) FROM invoices WHERE ubl_xml IS NOT NULL) as invoices_with_ubl,
  (SELECT COUNT(*) FROM webhook_events WHERE status = 'delivered') as delivered_webhooks,
  (SELECT COUNT(*) FROM api_keys WHERE is_active = true) as active_api_keys;
