# CRM Webhook Integration

**Guide for routing leads to CRM systems**

## Overview

This document explains how to integrate Vatevo's lead capture system with popular CRM platforms. The integration allows automatic routing of leads from the website contact form to your CRM system.

## Supported CRM Platforms

### 1. Salesforce
- **Integration Type**: REST API
- **Authentication**: OAuth 2.0
- **Endpoint**: Salesforce REST API
- **Rate Limits**: 15,000 API calls per day

### 2. HubSpot
- **Integration Type**: REST API
- **Authentication**: API Key
- **Endpoint**: HubSpot Contacts API
- **Rate Limits**: 100 requests per 10 seconds

### 3. Pipedrive
- **Integration Type**: REST API
- **Authentication**: API Token
- **Endpoint**: Pipedrive API
- **Rate Limits**: 10,000 requests per day

### 4. Zoho CRM
- **Integration Type**: REST API
- **Authentication**: OAuth 2.0
- **Endpoint**: Zoho CRM API
- **Rate Limits**: 100 requests per minute

## Lead Data Structure

### 1. Standard Lead Fields
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Example Corp",
  "phone": "+1-555-123-4567",
  "plan": "pro",
  "message": "Interested in your e-invoicing service",
  "source": "website",
  "timestamp": "2025-09-09T12:00:00Z",
  "leadId": "lead_1234567890"
}
```

### 2. Custom Fields
- **Lead Score**: Calculated lead score (1-100)
- **Country**: Lead's country
- **Industry**: Lead's industry
- **Company Size**: Company size category
- **Referral Source**: How they found us
- **Campaign**: Marketing campaign identifier

## CRM Integration Setup

### 1. Environment Variables
```bash
# CRM Configuration
CRM_PROVIDER=salesforce  # salesforce, hubspot, pipedrive, zoho
CRM_API_URL=https://api.salesforce.com
CRM_API_KEY=your_api_key
CRM_API_SECRET=your_api_secret

# Lead Routing
LEAD_ROUTING_ENABLED=true
LEAD_NOTIFICATION_EMAIL=leads@vatevo.com
LEAD_WEBHOOK_URL=https://your-crm.com/webhook
```

### 2. CRM-Specific Configuration

#### Salesforce
```bash
SALESFORCE_CLIENT_ID=your_client_id
SALESFORCE_CLIENT_SECRET=your_client_secret
SALESFORCE_USERNAME=your_username
SALESFORCE_PASSWORD=your_password
SALESFORCE_SECURITY_TOKEN=your_security_token
SALESFORCE_SANDBOX=false
```

#### HubSpot
```bash
HUBSPOT_API_KEY=your_api_key
HUBSPOT_PORTAL_ID=your_portal_id
HUBSPOT_DEAL_PIPELINE=your_pipeline_id
HUBSPOT_DEAL_STAGE=your_stage_id
```

#### Pipedrive
```bash
PIPEDRIVE_API_TOKEN=your_api_token
PIPEDRIVE_ORG_ID=your_org_id
PIPEDRIVE_PERSON_FIELD_ID=your_field_id
PIPEDRIVE_DEAL_TITLE=your_deal_title
```

#### Zoho CRM
```bash
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_REFRESH_TOKEN=your_refresh_token
ZOHO_REDIRECT_URI=your_redirect_uri
```

## Lead Processing Workflow

### 1. Lead Capture
```javascript
// Contact form submission
const leadData = {
  name: formData.name,
  email: formData.email,
  company: formData.company,
  phone: formData.phone,
  plan: formData.plan,
  message: formData.message,
  source: 'website',
  timestamp: new Date().toISOString()
};

// Send to API
const response = await fetch('/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(leadData)
});
```

### 2. Lead Processing
```javascript
// API endpoint processing
export async function POST(request) {
  const leadData = await request.json();
  
  // Validate lead data
  if (!leadData.name || !leadData.email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  // Store in database
  const lead = await storeLead(leadData);
  
  // Route to CRM
  if (process.env.CRM_ROUTING_ENABLED === 'true') {
    await routeToCRM(lead);
  }
  
  // Send notification email
  await sendNotificationEmail(lead);
  
  return NextResponse.json({ success: true, leadId: lead.id });
}
```

### 3. CRM Routing
```javascript
// Route lead to CRM
async function routeToCRM(lead) {
  const crmProvider = process.env.CRM_PROVIDER;
  
  switch (crmProvider) {
    case 'salesforce':
      await routeToSalesforce(lead);
      break;
    case 'hubspot':
      await routeToHubSpot(lead);
      break;
    case 'pipedrive':
      await routeToPipedrive(lead);
      break;
    case 'zoho':
      await routeToZoho(lead);
      break;
    default:
      console.log('No CRM provider configured');
  }
}
```

## CRM-Specific Implementations

### 1. Salesforce Integration
```javascript
// Salesforce lead creation
async function routeToSalesforce(lead) {
  const accessToken = await getSalesforceAccessToken();
  
  const leadData = {
    FirstName: lead.name.split(' ')[0],
    LastName: lead.name.split(' ').slice(1).join(' '),
    Email: lead.email,
    Company: lead.company,
    Phone: lead.phone,
    LeadSource: 'Website',
    Status: 'New',
    Description: lead.message
  };
  
  const response = await fetch(`${process.env.SALESFORCE_API_URL}/services/data/v58.0/sobjects/Lead`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(leadData)
  });
  
  if (response.ok) {
    const result = await response.json();
    console.log('Lead created in Salesforce:', result.id);
  }
}
```

### 2. HubSpot Integration
```javascript
// HubSpot contact creation
async function routeToHubSpot(lead) {
  const contactData = {
    properties: {
      firstname: lead.name.split(' ')[0],
      lastname: lead.name.split(' ').slice(1).join(' '),
      email: lead.email,
      company: lead.company,
      phone: lead.phone,
      lead_source: 'Website',
      lead_status: 'New',
      message: lead.message
    }
  };
  
  const response = await fetch(`${process.env.HUBSPOT_API_URL}/contacts/v1/contact`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(contactData)
  });
  
  if (response.ok) {
    const result = await response.json();
    console.log('Contact created in HubSpot:', result.vid);
  }
}
```

### 3. Pipedrive Integration
```javascript
// Pipedrive person creation
async function routeToPipedrive(lead) {
  const personData = {
    name: lead.name,
    email: [lead.email],
    phone: [lead.phone],
    org_name: lead.company,
    add_time: new Date().toISOString()
  };
  
  const response = await fetch(`${process.env.PIPEDRIVE_API_URL}/persons`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PIPEDRIVE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(personData)
  });
  
  if (response.ok) {
    const result = await response.json();
    console.log('Person created in Pipedrive:', result.data.id);
  }
}
```

### 4. Zoho CRM Integration
```javascript
// Zoho CRM lead creation
async function routeToZoho(lead) {
  const accessToken = await getZohoAccessToken();
  
  const leadData = {
    data: [{
      First_Name: lead.name.split(' ')[0],
      Last_Name: lead.name.split(' ').slice(1).join(' '),
      Email: lead.email,
      Company: lead.company,
      Phone: lead.phone,
      Lead_Source: 'Website',
      Lead_Status: 'New',
      Description: lead.message
    }]
  };
  
  const response = await fetch(`${process.env.ZOHO_API_URL}/crm/v2/Leads`, {
    method: 'POST',
    headers: {
      'Authorization': `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(leadData)
  });
  
  if (response.ok) {
    const result = await response.json();
    console.log('Lead created in Zoho CRM:', result.data[0].id);
  }
}
```

## Error Handling and Retry Logic

### 1. Error Handling
```javascript
// CRM integration with error handling
async function routeToCRM(lead) {
  try {
    const crmProvider = process.env.CRM_PROVIDER;
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        await routeToCRMProvider(lead, crmProvider);
        break; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        if (retryCount >= maxRetries) {
          console.error('Failed to route lead to CRM after retries:', error);
          await storeFailedLead(lead, error);
        } else {
          await delay(1000 * retryCount); // Exponential backoff
        }
      }
    }
  } catch (error) {
    console.error('CRM routing error:', error);
    await storeFailedLead(lead, error);
  }
}
```

### 2. Failed Lead Storage
```javascript
// Store failed leads for manual processing
async function storeFailedLead(lead, error) {
  const failedLead = {
    ...lead,
    crmError: error.message,
    retryCount: 0,
    status: 'failed',
    createdAt: new Date().toISOString()
  };
  
  // Store in database for manual processing
  await db.failedLeads.create(failedLead);
  
  // Send alert email
  await sendAlertEmail(failedLead);
}
```

## Monitoring and Analytics

### 1. Lead Metrics
- **Total Leads**: Total number of leads captured
- **CRM Success Rate**: Percentage of leads successfully routed to CRM
- **CRM Failure Rate**: Percentage of leads that failed to route
- **Average Processing Time**: Time to process and route leads

### 2. CRM Performance
- **API Response Time**: Response time for CRM API calls
- **API Error Rate**: Percentage of failed API calls
- **Retry Success Rate**: Percentage of successful retries
- **Queue Length**: Number of leads waiting to be processed

### 3. Alerting
- **High Failure Rate**: Alert when failure rate > 10%
- **API Errors**: Alert on CRM API errors
- **Queue Backlog**: Alert when queue length > 100
- **Service Down**: Alert when CRM service is down

## Testing and Validation

### 1. Unit Tests
```javascript
// Test CRM integration
describe('CRM Integration', () => {
  test('should route lead to Salesforce', async () => {
    const lead = { name: 'Test User', email: 'test@example.com' };
    const result = await routeToSalesforce(lead);
    expect(result.success).toBe(true);
  });
  
  test('should handle CRM errors gracefully', async () => {
    const lead = { name: 'Test User', email: 'test@example.com' };
    const result = await routeToCRM(lead);
    expect(result.error).toBeDefined();
  });
});
```

### 2. Integration Tests
```javascript
// Test end-to-end lead processing
describe('Lead Processing', () => {
  test('should process lead from form to CRM', async () => {
    const leadData = {
      name: 'Test User',
      email: 'test@example.com',
      company: 'Test Corp',
      plan: 'pro',
      message: 'Test message'
    };
    
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    
    expect(response.status).toBe(200);
    
    // Verify lead was created in CRM
    const crmLead = await getCRMLead(leadData.email);
    expect(crmLead).toBeDefined();
  });
});
```

## Security Considerations

### 1. API Security
- **Authentication**: Secure API authentication
- **Rate Limiting**: Implement rate limiting
- **Input Validation**: Validate all input data
- **Error Handling**: Don't expose sensitive information

### 2. Data Protection
- **Data Encryption**: Encrypt sensitive data
- **Access Control**: Limit access to CRM credentials
- **Audit Logging**: Log all CRM operations
- **Data Retention**: Implement data retention policies

### 3. Compliance
- **GDPR Compliance**: Ensure GDPR compliance
- **Data Minimization**: Collect only necessary data
- **Consent Management**: Manage consent properly
- **Right to Erasure**: Implement data deletion

---

**Document Version**: 1.0  
**Last Updated**: 2025-09-09  
**Next Review**: 2026-09-09  
**Owner**: Engineering Team  
**Status**: Internal - Implementation Guide
