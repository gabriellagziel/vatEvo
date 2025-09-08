# S3 WORM (Write Once, Read Many) Configuration Guide

**Purpose**: Configure AWS S3 for compliance with EU e-invoicing WORM requirements  
**Status**: ⚠️ **Configuration Required**  
**Priority**: **HIGH** - Required for compliance

## Overview

EU e-invoicing compliance requires immutable storage of invoice data for 10+ years. AWS S3 Object Lock provides this capability through:

- **Object Lock**: Prevents object deletion/modification
- **Compliance Mode**: Enforces retention policies
- **Legal Hold**: Additional protection for legal requirements
- **Versioning**: Maintains object history

## S3 Bucket Configuration

### 1. Create S3 Bucket with Object Lock

```bash
# Create bucket with Object Lock enabled
aws s3api create-bucket \
  --bucket vatevo-invoices-prod \
  --region eu-west-1 \
  --create-bucket-configuration LocationConstraint=eu-west-1

# Enable Object Lock
aws s3api put-object-lock-configuration \
  --bucket vatevo-invoices-prod \
  --object-lock-configuration '{
    "ObjectLockEnabled": "Enabled",
    "Rule": {
      "DefaultRetention": {
        "Mode": "COMPLIANCE",
        "Days": 3650
      }
    }
  }'

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket vatevo-invoices-prod \
  --versioning-configuration Status=Enabled

# Enable MFA delete (optional but recommended)
aws s3api put-bucket-versioning \
  --bucket vatevo-invoices-prod \
  --versioning-configuration '{
    "Status": "Enabled",
    "MfaDelete": "Enabled"
  }'
```

### 2. Bucket Policy for Compliance

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyInsecureConnections",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::vatevo-invoices-prod",
        "arn:aws:s3:::vatevo-invoices-prod/*"
      ],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    },
    {
      "Sid": "DenyObjectLockBypass",
      "Effect": "Deny",
      "Principal": "*",
      "Action": [
        "s3:BypassGovernanceRetention",
        "s3:PutObjectLegalHold"
      ],
      "Resource": "arn:aws:s3:::vatevo-invoices-prod/*"
    }
  ]
}
```

## Application Integration

### 1. S3 Client Configuration

```python
import boto3
from botocore.exceptions import ClientError
from datetime import datetime, timedelta

class S3WORMClient:
    def __init__(self, bucket_name: str, region: str = "eu-west-1"):
        self.s3 = boto3.client('s3', region_name=region)
        self.bucket_name = bucket_name
    
    def store_invoice(self, invoice_id: str, content: bytes, 
                     retention_days: int = 3650) -> str:
        """Store invoice with WORM compliance"""
        key = f"invoices/{invoice_id}/{datetime.now().isoformat()}.xml"
        
        # Calculate retention date
        retention_date = datetime.now() + timedelta(days=retention_days)
        
        try:
            self.s3.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=content,
                ObjectLockMode='COMPLIANCE',
                ObjectLockRetainUntilDate=retention_date,
                ObjectLockLegalHoldStatus='ON'
            )
            return f"s3://{self.bucket_name}/{key}"
        except ClientError as e:
            raise Exception(f"Failed to store invoice: {e}")
    
    def get_invoice(self, key: str) -> bytes:
        """Retrieve invoice (read-only)"""
        try:
            response = self.s3.get_object(Bucket=self.bucket_name, Key=key)
            return response['Body'].read()
        except ClientError as e:
            raise Exception(f"Failed to retrieve invoice: {e}")
```

### 2. Invoice Storage Service

```python
from typing import Optional
from .models import Invoice
from .s3_worm_client import S3WORMClient

class InvoiceStorageService:
    def __init__(self, s3_client: S3WORMClient):
        self.s3_client = s3_client
    
    def store_ubl_xml(self, invoice: Invoice) -> str:
        """Store UBL XML with WORM compliance"""
        if not invoice.ubl_xml:
            raise ValueError("Invoice has no UBL XML to store")
        
        return self.s3_client.store_invoice(
            invoice_id=str(invoice.id),
            content=invoice.ubl_xml.encode('utf-8'),
            retention_days=3650  # 10 years
        )
    
    def store_country_xml(self, invoice: Invoice) -> str:
        """Store country-specific XML with WORM compliance"""
        if not invoice.country_xml:
            raise ValueError("Invoice has no country XML to store")
        
        return self.s3_client.store_invoice(
            invoice_id=f"{invoice.id}_country",
            content=invoice.country_xml.encode('utf-8'),
            retention_days=3650
        )
```

## Retention Policy Configuration

### 1. Default Retention (10 years)

```python
# Default retention for all invoices
DEFAULT_RETENTION_DAYS = 3650  # 10 years

# Country-specific retention (if required)
RETENTION_POLICIES = {
    'IT': 3650,  # Italy: 10 years
    'DE': 3650,  # Germany: 10 years
    'FR': 3650,  # France: 10 years
    'ES': 3650,  # Spain: 10 years
    'NL': 3650,  # Netherlands: 10 years
}
```

### 2. Legal Hold Management

```python
def apply_legal_hold(self, key: str, reason: str) -> bool:
    """Apply legal hold to specific invoice"""
    try:
        self.s3_client.put_object_legal_hold(
            Bucket=self.bucket_name,
            Key=key,
            LegalHold={'Status': 'ON'}
        )
        return True
    except ClientError:
        return False

def release_legal_hold(self, key: str) -> bool:
    """Release legal hold (requires special permissions)"""
    try:
        self.s3_client.put_object_legal_hold(
            Bucket=self.bucket_name,
            Key=key,
            LegalHold={'Status': 'OFF'}
        )
        return True
    except ClientError:
        return False
```

## Compliance Monitoring

### 1. Retention Status Check

```python
def check_retention_status(self, key: str) -> dict:
    """Check object retention status"""
    try:
        response = self.s3_client.get_object_retention(
            Bucket=self.bucket_name,
            Key=key
        )
        return {
            'retention_mode': response['Retention']['Mode'],
            'retain_until': response['Retention']['RetainUntilDate'],
            'legal_hold': self.get_legal_hold_status(key)
        }
    except ClientError as e:
        return {'error': str(e)}
```

### 2. Audit Trail

```python
def get_audit_trail(self, invoice_id: str) -> list:
    """Get audit trail for invoice"""
    try:
        response = self.s3_client.list_object_versions(
            Bucket=self.bucket_name,
            Prefix=f"invoices/{invoice_id}/"
        )
        return response.get('Versions', [])
    except ClientError as e:
        return []
```

## Retention Bypass Escalation

### 1. Emergency Bypass Procedure

**⚠️ WARNING**: Bypassing retention should only be done in extreme circumstances with proper authorization.

```python
def emergency_bypass_retention(self, key: str, reason: str, 
                              authorized_by: str) -> bool:
    """Emergency bypass of retention (requires MFA)"""
    try:
        # This requires MFA and special permissions
        self.s3_client.delete_object(
            Bucket=self.bucket_name,
            Key=key,
            BypassGovernanceRetention=True
        )
        
        # Log the bypass action
        self.log_retention_bypass(key, reason, authorized_by)
        return True
    except ClientError as e:
        self.log_bypass_failure(key, reason, str(e))
        return False
```

### 2. Escalation Checklist

- [ ] **Legal Approval**: Written authorization from legal team
- [ ] **MFA Authentication**: Multi-factor authentication required
- **Audit Logging**: All bypass actions must be logged
- **Notification**: Notify compliance team within 24 hours
- **Documentation**: Document reason and authorization

## Environment Configuration

### 1. Environment Variables

```bash
# S3 Configuration
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-west-1
S3_BUCKET=vatevo-invoices-prod
S3_OBJECT_LOCK=true

# Retention Configuration
DEFAULT_RETENTION_DAYS=3650
LEGAL_HOLD_ENABLED=true
MFA_DELETE_ENABLED=true
```

### 2. IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:GetObjectRetention",
        "s3:PutObjectLegalHold",
        "s3:GetObjectLegalHold"
      ],
      "Resource": "arn:aws:s3:::vatevo-invoices-prod/*"
    },
    {
      "Effect": "Deny",
      "Action": [
        "s3:DeleteObject",
        "s3:PutObjectRetention"
      ],
      "Resource": "arn:aws:s3:::vatevo-invoices-prod/*"
    }
  ]
}
```

## Testing and Validation

### 1. WORM Compliance Test

```python
def test_worm_compliance():
    """Test WORM compliance functionality"""
    client = S3WORMClient("vatevo-invoices-test")
    
    # Test storing with retention
    key = client.store_invoice("test-123", b"test content", 30)
    
    # Verify retention is applied
    status = client.check_retention_status(key)
    assert status['retention_mode'] == 'COMPLIANCE'
    
    # Verify deletion is blocked
    try:
        client.s3.delete_object(Bucket="vatevo-invoices-test", Key=key)
        assert False, "Deletion should be blocked"
    except ClientError:
        pass  # Expected behavior
```

### 2. Compliance Audit

```python
def audit_compliance():
    """Audit WORM compliance across all invoices"""
    issues = []
    
    # Check all objects have retention
    for obj in list_all_invoices():
        status = check_retention_status(obj.key)
        if status.get('retention_mode') != 'COMPLIANCE':
            issues.append(f"Object {obj.key} missing retention")
    
    return issues
```

## Success Criteria

### Technical
- [ ] S3 bucket created with Object Lock enabled
- [ ] Compliance mode retention policy applied
- [ ] Versioning enabled with MFA delete
- [ ] Application integration working
- [ ] Retention bypass procedures documented

### Compliance
- [ ] 10-year retention policy enforced
- [ ] Legal hold capability available
- [ ] Audit trail maintained
- [ ] Emergency procedures documented
- [ ] Regular compliance audits scheduled

---

**Estimated Setup Time**: 2-3 hours  
**Ongoing Maintenance**: Monthly compliance audits  
**Dependencies**: AWS S3, IAM permissions, MFA setup
