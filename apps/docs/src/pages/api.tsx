import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function ApiReference() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title="API Reference"
      description="Complete API reference for Vatevo e-invoicing service">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--12">
            <h1>API Reference</h1>
            <p>
              Complete API documentation for the Vatevo e-invoicing service.
              All endpoints, request/response schemas, and examples.
            </p>
            
            <div className="margin-vert--lg">
              <h2>Interactive API Documentation</h2>
              <p>
                Explore our API interactively using the embedded OpenAPI specification:
              </p>
              
              <div className="margin-vert--md">
                <a 
                  href="https://api.vatevo.com/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="button button--primary button--lg">
                  Open Swagger UI
                </a>
                <a 
                  href="https://api.vatevo.com/openapi.json" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="button button--secondary button--lg margin-left--md">
                  Download OpenAPI Spec
                </a>
              </div>
            </div>

            <div className="margin-vert--lg">
              <h2>Base URL</h2>
              <div className="margin-vert--sm">
                <code>https://api.vatevo.com</code>
              </div>
            </div>

            <div className="margin-vert--lg">
              <h2>Authentication</h2>
              <p>
                All API requests require authentication using an API key in the Authorization header:
              </p>
              <div className="margin-vert--sm">
                <pre>
                  <code>
{`Authorization: Bearer your-api-key`}
                  </code>
                </pre>
              </div>
            </div>

            <div className="margin-vert--lg">
              <h2>Rate Limiting</h2>
              <p>
                API requests are rate limited per tenant. Rate limits vary by plan:
              </p>
              <ul>
                <li><strong>Free:</strong> 100 requests/hour</li>
                <li><strong>Pro:</strong> 1,000 requests/hour</li>
                <li><strong>Enterprise:</strong> 10,000 requests/hour</li>
              </ul>
              <p>
                Rate limit information is included in response headers:
              </p>
              <div className="margin-vert--sm">
                <pre>
                  <code>
{`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200`}
                  </code>
                </pre>
              </div>
            </div>

            <div className="margin-vert--lg">
              <h2>Error Handling</h2>
              <p>
                The API uses standard HTTP status codes and returns detailed error information:
              </p>
              <div className="margin-vert--sm">
                <pre>
                  <code>
{`{
  "detail": "Error message",
  "error_code": "INVALID_REQUEST",
  "field_errors": {
    "field_name": ["Error message for this field"]
  },
  "correlation_id": "req_1234567890"
}`}
                  </code>
                </pre>
              </div>
              <p>
                See our <a href="/docs/reference/error-codes">Error Codes Reference</a> for a complete list of error codes and their meanings.
              </p>
            </div>

            <div className="margin-vert--lg">
              <h2>SDKs and Examples</h2>
              <p>
                We provide official SDKs for popular programming languages:
              </p>
              <ul>
                <li><a href="/docs/sdks/typescript">TypeScript/Node.js SDK</a></li>
                <li><a href="/docs/sdks/python">Python SDK</a></li>
              </ul>
              <p>
                Check out our <a href="/docs/sdks/examples">integration examples</a> for Express.js, FastAPI, and more.
              </p>
            </div>

            <div className="margin-vert--lg">
              <h2>Postman Collection</h2>
              <p>
                Import our complete Postman collection to test the API:
              </p>
              <div className="margin-vert--sm">
                <a 
                  href="/VATEVO.postman_collection.json" 
                  download
                  className="button button--primary">
                  Download Postman Collection
                </a>
              </div>
            </div>

            <div className="margin-vert--lg">
              <h2>Webhooks</h2>
              <p>
                Set up webhooks to receive real-time notifications about invoice processing events.
                See our <a href="/docs/webhooks/overview">Webhooks Guide</a> for complete documentation.
              </p>
            </div>

            <div className="margin-vert--lg">
              <h2>Support</h2>
              <p>
                Need help with the API? We're here to help:
              </p>
              <ul>
                <li><strong>Documentation:</strong> Browse our comprehensive guides</li>
                <li><strong>Support Email:</strong> <a href="mailto:support@vatevo.com">support@vatevo.com</a></li>
                <li><strong>GitHub Issues:</strong> <a href="https://github.com/gabriellagziel/vatEvo/issues">Report bugs or request features</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
