# Backup & Disaster Recovery Runbook

**Comprehensive backup and disaster recovery procedures for Vatevo platform**

## Overview

This runbook covers backup strategies, disaster recovery procedures, and business continuity planning for the Vatevo platform. It includes procedures for PostgreSQL databases, S3 WORM storage, and application recovery.

## Backup Strategy

### PostgreSQL Database Backups

#### Daily Full Backups
- **Frequency**: Daily at 02:00 UTC
- **Retention**: 30 days
- **Format**: Compressed SQL dump
- **Location**: S3 bucket `vatevo-backups-db`
- **Encryption**: AES-256 encryption at rest

#### Point-in-Time Recovery (PITR)
- **Frequency**: Continuous WAL archiving
- **Retention**: 7 days
- **Recovery Point Objective (RPO)**: 5 minutes
- **Recovery Time Objective (RTO)**: 1 hour

#### Backup Verification
- **Automated**: Daily restore tests in staging
- **Manual**: Weekly full restore verification
- **Monitoring**: Backup success/failure alerts

### S3 WORM Storage Backups

#### Object Replication
- **Cross-Region**: Automatic replication to secondary region
- **Versioning**: Enabled for all objects
- **Retention**: 10 years (compliance requirement)
- **Encryption**: Server-side encryption (SSE-S3)

#### Legal Hold
- **Trigger**: Legal request or compliance audit
- **Duration**: As specified by legal team
- **Process**: Automated via S3 Object Lock
- **Monitoring**: Legal hold status tracking

## Disaster Recovery Procedures

### Database Recovery

#### 1. Full Database Restore
```bash
# 1. Stop application services
fly scale count 0

# 2. Restore from latest backup
aws s3 cp s3://vatevo-backups-db/latest/full-backup.sql.gz .
gunzip full-backup.sql.gz

# 3. Drop and recreate database
psql -c "DROP DATABASE IF EXISTS vatevo_prod;"
psql -c "CREATE DATABASE vatevo_prod;"

# 4. Restore data
psql vatevo_prod < full-backup.sql

# 5. Verify restore
psql vatevo_prod -c "SELECT COUNT(*) FROM tenants;"
psql vatevo_prod -c "SELECT COUNT(*) FROM invoices;"

# 6. Restart application services
fly scale count 1
```

#### 2. Point-in-Time Recovery
```bash
# 1. Stop application services
fly scale count 0

# 2. Restore base backup
aws s3 cp s3://vatevo-backups-db/base-backup.sql.gz .
gunzip base-backup.sql.gz
psql vatevo_prod < base-backup.sql

# 3. Apply WAL files to target time
# (This would be done by PostgreSQL PITR process)

# 4. Verify data integrity
psql vatevo_prod -c "SELECT * FROM invoices WHERE created_at > '2025-09-09 10:00:00';"

# 5. Restart application services
fly scale count 1
```

### S3 Data Recovery

#### 1. Cross-Region Failover
```bash
# 1. Update DNS to point to secondary region
# 2. Verify data availability
aws s3 ls s3://vatevo-invoices-prod-eu-west-2/

# 3. Monitor application functionality
curl https://api.vatevo.com/health/db
```

#### 2. Object Recovery
```bash
# 1. List object versions
aws s3api list-object-versions --bucket vatevo-invoices-prod --prefix invoices/

# 2. Restore specific version
aws s3api restore-object --bucket vatevo-invoices-prod \
  --key invoices/inv_1234567890/2025-09-09T12:00:00.xml \
  --version-id <version-id>

# 3. Verify restoration
aws s3 ls s3://vatevo-invoices-prod/invoices/inv_1234567890/
```

### Application Recovery

#### 1. Complete Platform Recovery
```bash
# 1. Restore database (see above)
# 2. Restore S3 data (see above)
# 3. Deploy application
fly deploy --app vatevo-api

# 4. Verify all services
curl https://api.vatevo.com/health/ready
curl https://api.vatevo.com/health/db
curl https://vatevo.com
curl https://dashboard.vatevo.com

# 5. Run smoke tests
./ops/api/smoke.sh -u https://api.vatevo.com
```

#### 2. Partial Service Recovery
```bash
# 1. Identify failed service
fly status --app vatevo-api

# 2. Restart specific service
fly restart --app vatevo-api

# 3. Scale up if needed
fly scale count 2 --app vatevo-api

# 4. Verify recovery
curl https://api.vatevo.com/health/ready
```

## Business Continuity Planning

### RTO/RPO Targets

| Service | RTO | RPO | Priority |
|---------|-----|-----|----------|
| API | 1 hour | 5 minutes | Critical |
| Database | 1 hour | 5 minutes | Critical |
| Marketing Site | 2 hours | 1 hour | High |
| Dashboard | 2 hours | 1 hour | High |
| Documentation | 4 hours | 1 hour | Medium |

### Communication Plan

#### Internal Communication
- **Incident Commander**: CTO
- **Technical Lead**: Senior DevOps Engineer
- **Communications**: Marketing Team
- **Escalation**: CEO (for critical incidents)

#### External Communication
- **Status Page**: [status.vatevo.com](https://status.vatevo.com)
- **Customer Notifications**: Email, Slack, Twitter
- **Partner Notifications**: Direct communication
- **Media Relations**: PR team

### Recovery Testing

#### Monthly Tests
- **Database Restore**: Full restore from backup
- **S3 Failover**: Cross-region failover test
- **Application Recovery**: Complete platform recovery
- **Communication**: Incident response simulation

#### Quarterly Tests
- **Disaster Recovery**: Full DR scenario
- **Business Continuity**: Extended outage simulation
- **Recovery Procedures**: Documentation validation
- **Team Training**: Incident response training

## Monitoring and Alerting

### Backup Monitoring
- **Success/Failure**: Daily backup status
- **Size Trends**: Backup size monitoring
- **Duration**: Backup completion time
- **Storage Usage**: Backup storage consumption

### Recovery Monitoring
- **RTO Tracking**: Recovery time measurement
- **RPO Tracking**: Data loss measurement
- **Service Health**: Post-recovery verification
- **User Impact**: Customer experience monitoring

### Alerting Thresholds
- **Backup Failure**: Immediate alert
- **RTO Exceeded**: Immediate alert
- **RPO Exceeded**: Immediate alert
- **Service Degradation**: 5-minute alert

## Recovery Procedures by Scenario

### Scenario 1: Database Corruption
1. **Detection**: Database health check failure
2. **Assessment**: Determine corruption scope
3. **Recovery**: Restore from latest backup
4. **Verification**: Data integrity checks
5. **Communication**: Update status page

### Scenario 2: Regional Outage
1. **Detection**: Service unavailability
2. **Assessment**: Determine outage scope
3. **Failover**: Switch to secondary region
4. **Recovery**: Restore services
5. **Communication**: Customer notifications

### Scenario 3: Data Center Failure
1. **Detection**: Complete service unavailability
2. **Assessment**: Determine failure scope
3. **Recovery**: Full platform recovery
4. **Verification**: Complete system testing
5. **Communication**: Extended outage notifications

### Scenario 4: Security Incident
1. **Detection**: Security monitoring alerts
2. **Assessment**: Determine incident scope
3. **Containment**: Isolate affected systems
4. **Recovery**: Clean restore from backups
5. **Communication**: Security incident notifications

## Backup Verification Scripts

### Database Backup Verification
```sql
-- ops/db/backup_smoke.sql
-- Verify backup integrity

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
FROM webhook_events;

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
```

### S3 Backup Verification
```sql
-- ops/db/restore_smoke.sql
-- Verify S3 data integrity

-- Check invoice PDFs exist
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
```

## Recovery Checklists

### Pre-Recovery Checklist
- [ ] **Incident Assessment**: Determine scope and impact
- [ ] **Team Notification**: Alert recovery team
- [ ] **Communication**: Update status page
- [ ] **Backup Verification**: Confirm backup integrity
- [ ] **Recovery Plan**: Select appropriate recovery procedure

### During Recovery Checklist
- [ ] **Service Shutdown**: Stop affected services
- [ ] **Data Restoration**: Restore from backups
- [ ] **Service Restart**: Restart services
- [ ] **Health Checks**: Verify service health
- [ ] **Smoke Tests**: Run comprehensive tests

### Post-Recovery Checklist
- [ ] **Service Verification**: Confirm all services operational
- [ ] **Data Integrity**: Verify data consistency
- [ ] **Performance Check**: Monitor service performance
- [ ] **Communication**: Update stakeholders
- [ ] **Documentation**: Record incident details

## Contact Information

### Recovery Team
- **Incident Commander**: [CTO Name] - [phone] - [email]
- **Technical Lead**: [Senior DevOps] - [phone] - [email]
- **Database Admin**: [DBA Name] - [phone] - [email]
- **Infrastructure**: [Infra Team] - [phone] - [email]

### External Contacts
- **AWS Support**: [Support Case ID]
- **Fly.io Support**: [Support Case ID]
- **Vercel Support**: [Support Case ID]
- **DNS Provider**: [Provider Contact]

---

**Last Updated**: 2025-09-09T03:30:00Z  
**Next Review**: Monthly  
**Owner**: DevOps Team  
**Approved By**: CTO
