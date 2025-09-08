# Vatevo API Error Codes

**Complete reference for all API error codes and their meanings**

## HTTP Status Codes

### 2xx Success
| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 202 | Accepted | Request accepted for processing |

### 4xx Client Errors
| Code | Meaning | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request data or parameters |
| 401 | Unauthorized | Missing or invalid API key |
| 403 | Forbidden | API key valid but insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists or conflict with current state |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |

### 5xx Server Errors
| Code | Meaning | Description |
|------|---------|-------------|
| 500 | Internal Server Error | Unexpected server error |
| 502 | Bad Gateway | Upstream service error |
| 503 | Service Unavailable | Service temporarily unavailable |
| 504 | Gateway Timeout | Upstream service timeout |

## API Error Response Format

```json
{
  "detail": "Error message",
  "error_code": "INVALID_REQUEST",
  "field_errors": {
    "field_name": ["Error message for this field"]
  },
  "correlation_id": "req_1234567890"
}
```

## Error Codes by Category

### Authentication Errors

#### `INVALID_API_KEY`
- **HTTP Status**: 401
- **Description**: API key is missing, invalid, or expired
- **Solution**: Check your API key and ensure it's correctly formatted

```json
{
  "detail": "Invalid API key",
  "error_code": "INVALID_API_KEY"
}
```

#### `API_KEY_EXPIRED`
- **HTTP Status**: 401
- **Description**: API key has expired
- **Solution**: Generate a new API key from your dashboard

#### `INSUFFICIENT_PERMISSIONS`
- **HTTP Status**: 403
- **Description**: API key valid but lacks required permissions
- **Solution**: Contact support to upgrade your plan

### Validation Errors

#### `VALIDATION_FAILED`
- **HTTP Status**: 422
- **Description**: Request data failed validation
- **Solution**: Check the field_errors for specific validation issues

```json
{
  "detail": "Validation failed",
  "error_code": "VALIDATION_FAILED",
  "field_errors": {
    "supplier.vat_id": ["Invalid VAT ID format"],
    "line_items.0.unit_price": ["Must be a positive number"]
  }
}
```

#### `INVALID_COUNTRY_CODE`
- **HTTP Status**: 422
- **Description**: Unsupported country code
- **Solution**: Use a supported country code (IT, DE, FR, ES, NL)

#### `INVALID_VAT_ID`
- **HTTP Status**: 422
- **Description**: VAT ID format is invalid for the specified country
- **Solution**: Check VAT ID format against country-specific rules

#### `MISSING_REQUIRED_FIELD`
- **HTTP Status**: 422
- **Description**: Required field is missing
- **Solution**: Include all required fields in your request

### Invoice Errors

#### `INVOICE_NOT_FOUND`
- **HTTP Status**: 404
- **Description**: Invoice with specified ID not found
- **Solution**: Check invoice ID and ensure it belongs to your tenant

#### `INVOICE_ALREADY_EXISTS`
- **HTTP Status**: 409
- **Description**: Invoice with same data already exists
- **Solution**: Check for duplicate invoices or use a different identifier

#### `INVOICE_CANNOT_BE_RETRIED`
- **HTTP Status**: 400
- **Description**: Invoice is not in a retryable state
- **Solution**: Only failed or rejected invoices can be retried

#### `INVOICE_PROCESSING_FAILED`
- **HTTP Status**: 500
- **Description**: Invoice processing failed due to internal error
- **Solution**: Retry the request or contact support if it persists

### Compliance Errors

#### `UNSUPPORTED_COUNTRY`
- **HTTP Status**: 422
- **Description**: Country not supported for e-invoicing
- **Solution**: Use a supported country code

#### `COMPLIANCE_GATEWAY_ERROR`
- **HTTP Status**: 502
- **Description**: Error communicating with compliance gateway
- **Solution**: Retry the request or contact support

#### `INVALID_UBL_XML`
- **HTTP Status**: 422
- **Description**: Generated UBL XML is invalid
- **Solution**: Check invoice data for compliance issues

### Rate Limiting Errors

#### `RATE_LIMIT_EXCEEDED`
- **HTTP Status**: 429
- **Description**: Too many requests in a short time period
- **Solution**: Wait before making more requests or upgrade your plan

```json
{
  "detail": "Rate limit exceeded",
  "error_code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 60
}
```

### Webhook Errors

#### `INVALID_WEBHOOK_SIGNATURE`
- **HTTP Status**: 400
- **Description**: Webhook signature verification failed
- **Solution**: Check your webhook secret and signature generation

#### `WEBHOOK_TIMESTAMP_TOO_OLD`
- **HTTP Status**: 400
- **Description**: Webhook timestamp is outside the 5-minute window
- **Solution**: Ensure webhook is processed within 5 minutes

#### `WEBHOOK_DELIVERY_FAILED`
- **HTTP Status**: 500
- **Description**: Failed to deliver webhook after all retries
- **Solution**: Check your webhook endpoint and contact support

### Database Errors

#### `DATABASE_CONNECTION_FAILED`
- **HTTP Status**: 503
- **Description**: Database connection failed
- **Solution**: Retry the request or contact support

#### `DATABASE_QUERY_FAILED`
- **HTTP Status**: 500
- **Description**: Database query failed
- **Solution**: Contact support with the correlation ID

### External Service Errors

#### `S3_UPLOAD_FAILED`
- **HTTP Status**: 502
- **Description**: Failed to upload file to S3
- **Solution**: Retry the request or contact support

#### `REDIS_CONNECTION_FAILED`
- **HTTP Status**: 503
- **Description**: Redis connection failed
- **Solution**: Retry the request or contact support

## Error Handling Best Practices

### 1. Always Check HTTP Status Codes
```typescript
try {
  const invoice = await client.createInvoice(data);
} catch (error) {
  if (error.response) {
    const status = error.response.status;
    const errorData = error.response.data;
    
    switch (status) {
      case 401:
        console.error('Authentication failed:', errorData.detail);
        break;
      case 422:
        console.error('Validation failed:', errorData.field_errors);
        break;
      case 429:
        console.error('Rate limited, retry after:', errorData.retry_after);
        break;
      default:
        console.error('API error:', errorData);
    }
  }
}
```

### 2. Implement Retry Logic
```typescript
async function createInvoiceWithRetry(data, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await client.createInvoice(data);
    } catch (error) {
      if (error.response?.status === 429) {
        // Rate limited - wait and retry
        const retryAfter = error.response.data.retry_after || 60;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      } else if (error.response?.status >= 500) {
        // Server error - retry with exponential backoff
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }
      }
      throw error;
    }
  }
}
```

### 3. Log Errors with Correlation IDs
```typescript
try {
  const invoice = await client.createInvoice(data);
} catch (error) {
  const correlationId = error.response?.data?.correlation_id;
  console.error(`Invoice creation failed [${correlationId}]:`, error.message);
  
  // Include correlation ID in support requests
  if (correlationId) {
    console.log(`Please include correlation ID ${correlationId} when contacting support`);
  }
}
```

### 4. Handle Specific Error Types
```typescript
try {
  const invoice = await client.createInvoice(data);
} catch (error) {
  const errorCode = error.response?.data?.error_code;
  
  switch (errorCode) {
    case 'VALIDATION_FAILED':
      // Handle validation errors
      const fieldErrors = error.response.data.field_errors;
      Object.entries(fieldErrors).forEach(([field, errors]) => {
        console.error(`${field}: ${errors.join(', ')}`);
      });
      break;
      
    case 'RATE_LIMIT_EXCEEDED':
      // Handle rate limiting
      const retryAfter = error.response.data.retry_after;
      console.log(`Rate limited. Retry after ${retryAfter} seconds`);
      break;
      
    case 'INVOICE_NOT_FOUND':
      // Handle not found
      console.error('Invoice not found');
      break;
      
    default:
      // Handle other errors
      console.error('Unexpected error:', error.message);
  }
}
```

## Troubleshooting

### Common Issues

#### 1. "Invalid API key" Error
- Check that your API key is correctly formatted
- Ensure you're using the correct API key for your tenant
- Verify the API key hasn't expired

#### 2. "Validation failed" Error
- Check the field_errors object for specific validation issues
- Ensure all required fields are present
- Verify data types and formats match the API specification

#### 3. "Rate limit exceeded" Error
- Implement exponential backoff retry logic
- Consider upgrading your plan for higher rate limits
- Monitor your API usage patterns

#### 4. "Webhook signature invalid" Error
- Verify your webhook secret matches the one in your dashboard
- Check that you're generating the signature correctly
- Ensure the timestamp is within the 5-minute window

### Getting Help

If you encounter an error not listed here:

1. **Check the correlation ID** in the error response
2. **Review the error details** and field_errors
3. **Check our status page** for known issues
4. **Contact support** with the correlation ID and error details

---

**Last Updated**: 2025-09-09T02:30:00Z  
**API Version**: 1.0  
**Support**: [support@vatevo.com](mailto:support@vatevo.com)
