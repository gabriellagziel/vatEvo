# API Key Management

**Complete guide to API key lifecycle, security, and best practices**

## Overview

API keys are used to authenticate requests to the Vatevo API. Each tenant can have multiple API keys for different purposes (development, production, integrations, etc.).

## API Key Format

Vatevo API keys follow this format:
```
vatevo_<32-character-random-string>
```

Example:
```
vatevo_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

## Creating API Keys

### Via API

```bash
curl -X POST https://api.vatevo.com/api-keys \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production API Key",
    "expires_days": 365
  }'
```

### Via SDK

#### TypeScript
```typescript
const apiKey = await client.createApiKey({
  name: "Production API Key",
  expires_days: 365
});

console.log("New API key:", apiKey.api_key);
```

#### Python
```python
api_key = client.create_api_key(
    name="Production API Key",
    expires_days=365
)

print(f"New API key: {api_key['api_key']}")
```

## API Key Lifecycle

### 1. Creation
- **Name**: Descriptive name for the key
- **Expiration**: Optional expiration date
- **Permissions**: Inherits tenant permissions
- **Status**: Active by default

### 2. Usage
- **Authentication**: Include in `Authorization: Bearer <key>` header
- **Rate Limiting**: Applied per tenant, not per key
- **Audit Logging**: All usage is logged with key ID

### 3. Rotation
- **Create New**: Generate replacement key
- **Update Systems**: Update all systems using old key
- **Revoke Old**: Deactivate old key
- **Grace Period**: Old key remains valid for 24 hours

### 4. Revocation
- **Immediate**: Key becomes invalid immediately
- **Audit Trail**: Revocation is logged
- **Cleanup**: Revoked keys are marked as inactive

## API Endpoints

### Create API Key
```http
POST /api-keys
Authorization: Bearer <your-api-key>
Content-Type: application/json

{
  "name": "My API Key",
  "expires_days": 365
}
```

**Response:**
```json
{
  "id": "key_1234567890",
  "name": "My API Key",
  "api_key": "vatevo_abc123...",
  "created_at": "2025-09-09T12:00:00Z",
  "expires_at": "2026-09-09T12:00:00Z",
  "is_active": true
}
```

### List API Keys
```http
GET /api-keys
Authorization: Bearer <your-api-key>
```

**Response:**
```json
{
  "api_keys": [
    {
      "id": "key_1234567890",
      "name": "My API Key",
      "created_at": "2025-09-09T12:00:00Z",
      "expires_at": "2026-09-09T12:00:00Z",
      "is_active": true,
      "last_used": "2025-09-09T15:30:00Z"
    }
  ]
}
```

### Revoke API Key
```http
DELETE /api-keys/{key_id}
Authorization: Bearer <your-api-key>
```

**Response:**
```json
{
  "message": "API key revoked successfully"
}
```

### Rotate API Key
```http
POST /api-keys/{key_id}/rotate
Authorization: Bearer <your-api-key>
```

**Response:**
```json
{
  "id": "key_9876543210",
  "name": "My API Key (rotated)",
  "api_key": "vatevo_xyz789...",
  "created_at": "2025-09-09T16:00:00Z",
  "expires_at": "2026-09-09T16:00:00Z",
  "is_active": true
}
```

## Security Best Practices

### 1. Key Storage
- **Environment Variables**: Store in environment variables
- **Secret Management**: Use proper secret management tools
- **Never Log**: Never log API keys in application logs
- **Encryption**: Encrypt keys at rest

### 2. Key Rotation
- **Regular Rotation**: Rotate keys every 90 days
- **Automated Rotation**: Use automated rotation where possible
- **Grace Period**: Allow 24-hour grace period for updates
- **Monitoring**: Monitor for failed authentications

### 3. Access Control
- **Least Privilege**: Use minimal required permissions
- **Separate Keys**: Use different keys for different environments
- **Named Keys**: Use descriptive names for easy identification
- **Expiration**: Set appropriate expiration dates

### 4. Monitoring
- **Usage Tracking**: Monitor API key usage patterns
- **Anomaly Detection**: Alert on unusual usage patterns
- **Audit Logs**: Review audit logs regularly
- **Failed Attempts**: Monitor for failed authentication attempts

## Rate Limiting

### Per-Tenant Limits
Rate limits are applied per tenant, not per API key:

| Plan | Requests/Hour | Burst Limit |
|------|---------------|-------------|
| Free | 100 | 10 |
| Pro | 1,000 | 100 |
| Enterprise | 10,000 | 1,000 |

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "detail": "Rate limit exceeded",
  "error_code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 3600
}
```

## Error Handling

### Common Errors

#### Invalid API Key
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "detail": "Invalid API key",
  "error_code": "INVALID_API_KEY"
}
```

#### Expired API Key
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "detail": "API key has expired",
  "error_code": "API_KEY_EXPIRED"
}
```

#### Revoked API Key
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "detail": "API key has been revoked",
  "error_code": "API_KEY_REVOKED"
}
```

## Integration Examples

### Environment Configuration
```bash
# .env
VATEVO_API_KEY=vatevo_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
VATEVO_API_URL=https://api.vatevo.com
```

### SDK Configuration
```typescript
// TypeScript
import { createClient } from '@vatevo/sdk';

const client = createClient({
  apiKey: process.env.VATEVO_API_KEY,
  baseUrl: process.env.VATEVO_API_URL
});
```

```python
# Python
from vatevo import create_client

client = create_client(
    api_key=os.getenv('VATEVO_API_KEY'),
    base_url=os.getenv('VATEVO_API_URL')
)
```

### Direct API Usage
```bash
# Using curl
curl -H "Authorization: Bearer $VATEVO_API_KEY" \
     https://api.vatevo.com/healthz
```

## Troubleshooting

### Common Issues

#### 1. "Invalid API key" Error
- Check that the API key is correctly formatted
- Ensure the key hasn't expired
- Verify the key hasn't been revoked

#### 2. "Rate limit exceeded" Error
- Check your current usage against plan limits
- Implement exponential backoff retry logic
- Consider upgrading your plan

#### 3. "API key not found" Error
- Verify the key ID is correct
- Check that the key belongs to your tenant
- Ensure the key is still active

### Debugging Steps

1. **Verify API Key Format**
   ```bash
   echo $VATEVO_API_KEY | grep -E '^vatevo_[A-Za-z0-9_-]{32}$'
   ```

2. **Test Authentication**
   ```bash
   curl -H "Authorization: Bearer $VATEVO_API_KEY" \
        https://api.vatevo.com/healthz
   ```

3. **Check Key Status**
   ```bash
   curl -H "Authorization: Bearer $VATEVO_API_KEY" \
        https://api.vatevo.com/api-keys
   ```

4. **Review Audit Logs**
   - Check tenant dashboard for recent activity
   - Look for failed authentication attempts
   - Verify key usage patterns

## Migration Guide

### From Legacy Keys
If you're migrating from legacy API keys:

1. **Create New Keys**: Generate new keys using the API
2. **Update Systems**: Update all systems to use new keys
3. **Test Thoroughly**: Verify all functionality works
4. **Revoke Old Keys**: Deactivate legacy keys
5. **Monitor**: Watch for any issues

### Key Rotation Process
1. **Create New Key**: Generate replacement key
2. **Update Systems**: Deploy new key to all systems
3. **Verify Functionality**: Test all integrations
4. **Revoke Old Key**: Deactivate old key
5. **Clean Up**: Remove old key from systems

---

**Last Updated**: 2025-09-09T03:00:00Z  
**API Version**: 1.0  
**Support**: [support@vatevo.com](mailto:support@vatevo.com)
