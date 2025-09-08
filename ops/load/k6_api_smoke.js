/**
 * K6 Performance Smoke Test for Vatevo API
 * 
 * This script performs basic load testing to establish performance baselines
 * and verify API functionality under load.
 * 
 * Usage:
 *   k6 run k6_api_smoke.js
 *   k6 run --vus 10 --duration 30s k6_api_smoke.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
export let errorRate = new Rate('errors');
export let responseTime = new Trend('response_time');

// Test configuration
export let options = {
  stages: [
    { duration: '30s', target: 5 },   // Ramp up to 5 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'],     // Error rate must be below 10%
    errors: ['rate<0.1'],              // Custom error rate must be below 10%
  },
};

// Test data
const API_BASE_URL = __ENV.API_BASE_URL || 'https://api.vatevo.com';
const API_KEY = __ENV.API_KEY || 'test-api-key';

// Test payloads
const testInvoice = {
  country_code: 'IT',
  supplier: {
    name: 'Test Supplier',
    vat_id: 'IT12345678901',
    address: 'Via Roma 1',
    city: 'Milano',
    postal_code: '20100',
    country: 'IT'
  },
  customer: {
    name: 'Test Customer',
    vat_id: 'IT98765432109',
    address: 'Via Milano 2',
    city: 'Roma',
    postal_code: '00100',
    country: 'IT'
  },
  line_items: [{
    description: 'Test Item',
    quantity: 1,
    unit_price: '100.00',
    tax_rate: 22.0,
    tax_amount: '22.00',
    line_total: '100.00'
  }]
};

// Common headers
const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  'User-Agent': 'K6-Performance-Test/1.0'
};

export default function() {
  // Test 1: Health Check
  testHealthCheck();
  
  // Test 2: Invoice Validation
  testInvoiceValidation();
  
  // Test 3: Webhook Test
  testWebhookTest();
  
  // Test 4: API Key Management
  testApiKeyManagement();
  
  // Wait between requests
  sleep(1);
}

function testHealthCheck() {
  const response = http.get(`${API_BASE_URL}/healthz`, { headers });
  
  const success = check(response, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 500ms': (r) => r.timings.duration < 500,
    'health check has correct content-type': (r) => r.headers['Content-Type'] === 'application/json',
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  
  if (!success) {
    console.error(`Health check failed: ${response.status} - ${response.body}`);
  }
}

function testInvoiceValidation() {
  const response = http.post(`${API_BASE_URL}/validate`, JSON.stringify(testInvoice), { headers });
  
  const success = check(response, {
    'validation status is 200': (r) => r.status === 200,
    'validation response time < 2s': (r) => r.timings.duration < 2000,
    'validation has correct content-type': (r) => r.headers['Content-Type'] === 'application/json',
    'validation returns valid field': (r) => {
      try {
        const body = JSON.parse(r.body);
        return typeof body.valid === 'boolean';
      } catch (e) {
        return false;
      }
    },
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  
  if (!success) {
    console.error(`Invoice validation failed: ${response.status} - ${response.body}`);
  }
}

function testWebhookTest() {
  const response = http.post(`${API_BASE_URL}/webhooks/test`, null, { headers });
  
  const success = check(response, {
    'webhook test status is 200': (r) => r.status === 200,
    'webhook test response time < 2s': (r) => r.timings.duration < 2000,
    'webhook test has correct content-type': (r) => r.headers['Content-Type'] === 'application/json',
    'webhook test returns success field': (r) => {
      try {
        const body = JSON.parse(r.body);
        return typeof body.success === 'boolean';
      } catch (e) {
        return false;
      }
    },
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  
  if (!success) {
    console.error(`Webhook test failed: ${response.status} - ${response.body}`);
  }
}

function testApiKeyManagement() {
  // Test listing API keys
  const response = http.get(`${API_BASE_URL}/api-keys`, { headers });
  
  const success = check(response, {
    'api keys list status is 200': (r) => r.status === 200,
    'api keys list response time < 1s': (r) => r.timings.duration < 1000,
    'api keys list has correct content-type': (r) => r.headers['Content-Type'] === 'application/json',
    'api keys list returns api_keys field': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.api_keys);
      } catch (e) {
        return false;
      }
    },
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  
  if (!success) {
    console.error(`API keys list failed: ${response.status} - ${response.body}`);
  }
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data, null, 2),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = `${indent}Vatevo API Performance Test Summary\n`;
  summary += `${indent}=====================================\n\n`;
  
  // Test configuration
  summary += `${indent}Configuration:\n`;
  summary += `${indent}  API Base URL: ${API_BASE_URL}\n`;
  summary += `${indent}  Test Duration: ${data.metrics.iteration_duration?.values?.max || 'N/A'}ms\n`;
  summary += `${indent}  Total Iterations: ${data.metrics.iterations?.values?.count || 0}\n\n`;
  
  // Response time metrics
  summary += `${indent}Response Times:\n`;
  summary += `${indent}  Average: ${data.metrics.http_req_duration?.values?.avg?.toFixed(2) || 'N/A'}ms\n`;
  summary += `${indent}  P50: ${data.metrics.http_req_duration?.values?.['p(50)']?.toFixed(2) || 'N/A'}ms\n`;
  summary += `${indent}  P95: ${data.metrics.http_req_duration?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms\n`;
  summary += `${indent}  P99: ${data.metrics.http_req_duration?.values?.['p(99)']?.toFixed(2) || 'N/A'}ms\n`;
  summary += `${indent}  Max: ${data.metrics.http_req_duration?.values?.max?.toFixed(2) || 'N/A'}ms\n\n`;
  
  // Error metrics
  summary += `${indent}Error Rates:\n`;
  summary += `${indent}  HTTP Errors: ${((data.metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%\n`;
  summary += `${indent}  Custom Errors: ${((data.metrics.errors?.values?.rate || 0) * 100).toFixed(2)}%\n\n`;
  
  // Request metrics
  summary += `${indent}Request Metrics:\n`;
  summary += `${indent}  Total Requests: ${data.metrics.http_reqs?.values?.count || 0}\n`;
  summary += `${indent}  Requests/sec: ${data.metrics.http_reqs?.values?.rate?.toFixed(2) || 'N/A'}\n`;
  summary += `${indent}  Data Sent: ${(data.metrics.data_sent?.values?.count || 0).toFixed(2)} bytes\n`;
  summary += `${indent}  Data Received: ${(data.metrics.data_received?.values?.count || 0).toFixed(2)} bytes\n\n`;
  
  // Threshold results
  summary += `${indent}Threshold Results:\n`;
  if (data.thresholds) {
    Object.entries(data.thresholds).forEach(([name, result]) => {
      const status = result.ok ? '✅ PASS' : '❌ FAIL';
      summary += `${indent}  ${name}: ${status}\n`;
    });
  }
  
  return summary;
}
