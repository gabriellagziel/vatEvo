import { test, expect } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:8000';
const OUTPUT_DIR = 'assets/demo';

// Ensure output directory exists
test.beforeAll(async () => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
});

test.describe('Vatevo Demo Screenshots', () => {
  test('Marketing Site Screenshots', async ({ page }) => {
    // Homepage
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/marketing-homepage.png`, fullPage: true });
    
    // ViDA page
    await page.goto(`${BASE_URL}/vida`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/marketing-vida.png`, fullPage: true });
    
    // Solutions page
    await page.goto(`${BASE_URL}/solutions`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/marketing-solutions.png`, fullPage: true });
    
    // Compare page
    await page.goto(`${BASE_URL}/compare`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/marketing-compare.png`, fullPage: true });
    
    // Pricing page
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/marketing-pricing.png`, fullPage: true });
    
    // Contact page
    await page.goto(`${BASE_URL}/contact`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/marketing-contact.png`, fullPage: true });
  });

  test('Dashboard Screenshots', async ({ page }) => {
    // Login page
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/dashboard-login.png`, fullPage: true });
    
    // Mock login (you may need to adjust this based on your auth implementation)
    await page.fill('input[name="email"]', 'demo@vatevo.com');
    await page.fill('input[name="password"]', 'demo123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL('**/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Dashboard overview
    await page.screenshot({ path: `${OUTPUT_DIR}/dashboard-overview.png`, fullPage: true });
    
    // Tenant switcher
    await page.click('[data-testid="tenant-switcher"]');
    await page.waitForSelector('[data-testid="tenant-dropdown"]');
    await page.screenshot({ path: `${OUTPUT_DIR}/dashboard-tenant-switcher.png` });
    
    // Invoices list
    await page.goto(`${BASE_URL}/dashboard/invoices`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/dashboard-invoices-list.png`, fullPage: true });
    
    // Filter by country
    await page.click('[data-testid="country-filter"]');
    await page.selectOption('[data-testid="country-filter"]', 'IT');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/dashboard-invoices-italy.png`, fullPage: true });
    
    // Filter by status
    await page.click('[data-testid="status-filter"]');
    await page.selectOption('[data-testid="status-filter"]', 'validated');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/dashboard-invoices-validated.png`, fullPage: true });
    
    // Invoice detail (click on first invoice)
    await page.click('[data-testid="invoice-row"]:first-child');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/dashboard-invoice-detail.png`, fullPage: true });
    
    // Settings page
    await page.goto(`${BASE_URL}/dashboard/settings`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/dashboard-settings.png`, fullPage: true });
    
    // API Keys section
    await page.click('[data-testid="api-keys-tab"]');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/dashboard-api-keys.png`, fullPage: true });
    
    // Create new API key
    await page.click('[data-testid="create-api-key"]');
    await page.fill('[data-testid="api-key-name"]', 'Demo API Key');
    await page.click('[data-testid="create-api-key-submit"]');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/dashboard-api-key-created.png`, fullPage: true });
  });

  test('API Documentation Screenshots', async ({ page }) => {
    // Swagger UI
    await page.goto(`${API_URL}/docs`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/api-swagger-ui.png`, fullPage: true });
    
    // Expand health check endpoint
    await page.click('text=Health Check');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/api-health-endpoint.png`, fullPage: true });
    
    // Expand invoices endpoint
    await page.click('text=Invoices');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/api-invoices-endpoint.png`, fullPage: true });
    
    // Expand webhooks endpoint
    await page.click('text=Webhooks');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/api-webhooks-endpoint.png`, fullPage: true });
    
    // Try it out - health check
    await page.click('text=Try it out');
    await page.click('text=Execute');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/api-health-try-it-out.png`, fullPage: true });
  });

  test('Status Page Screenshots', async ({ page }) => {
    // API status
    await page.goto(`${API_URL}/status`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/api-status-json.png`, fullPage: true });
    
    // Marketing status page
    await page.goto(`${BASE_URL}/status`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/marketing-status-page.png`, fullPage: true });
  });

  test('Compliance Matrix Screenshots', async ({ page }) => {
    // Compliance page
    await page.goto(`${BASE_URL}/compliance`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/compliance-matrix.png`, fullPage: true });
    
    // Filter by country
    await page.click('[data-testid="country-filter"]');
    await page.selectOption('[data-testid="country-filter"]', 'IT');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/compliance-italy.png`, fullPage: true });
    
    // Filter by status
    await page.click('[data-testid="status-filter"]');
    await page.selectOption('[data-testid="status-filter"]', 'implemented');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUTPUT_DIR}/compliance-implemented.png`, fullPage: true });
  });
});

// Generate gallery markdown
test.afterAll(async () => {
  const galleryContent = `# Vatevo Demo Gallery

This gallery contains screenshots of the Vatevo platform for investor presentations and customer demos.

## Marketing Site

### Homepage
![Marketing Homepage](marketing-homepage.png)
*Clean, professional homepage showcasing ViDA compliance*

### ViDA Compliance
![ViDA Page](marketing-vida.png)
*Detailed information about ViDA requirements and solutions*

### Solutions
![Solutions Page](marketing-solutions.png)
*Overview of Vatevo's e-invoicing solutions*

### Compare Plans
![Compare Page](marketing-compare.png)
*Feature comparison across different plans*

### Pricing
![Pricing Page](marketing-pricing.png)
*Transparent pricing with volume-based tiers*

### Contact
![Contact Page](marketing-contact.png)
*Lead capture form for potential customers*

## Dashboard

### Login
![Dashboard Login](dashboard-login.png)
*Secure login interface*

### Overview
![Dashboard Overview](dashboard-overview.png)
*Main dashboard with key metrics and recent activity*

### Tenant Switcher
![Tenant Switcher](dashboard-tenant-switcher.png)
*Multi-tenant support with easy switching*

### Invoices List
![Invoices List](dashboard-invoices-list.png)
*Comprehensive invoice management interface*

### Italy Invoices
![Italy Invoices](dashboard-invoices-italy.png)
*Filtered view showing Italian invoices*

### Validated Invoices
![Validated Invoices](dashboard-invoices-validated.png)
*Filtered view showing validated invoices*

### Invoice Detail
![Invoice Detail](dashboard-invoice-detail.png)
*Detailed invoice view with XML and processing history*

### Settings
![Settings Page](dashboard-settings.png)
*Account and configuration settings*

### API Keys
![API Keys](dashboard-api-keys.png)
*API key management interface*

### API Key Created
![API Key Created](dashboard-api-key-created.png)
*New API key creation confirmation*

## API Documentation

### Swagger UI
![Swagger UI](api-swagger-ui.png)
*Interactive API documentation*

### Health Endpoint
![Health Endpoint](api-health-endpoint.png)
*Health check endpoint documentation*

### Invoices Endpoint
![Invoices Endpoint](api-invoices-endpoint.png)
*Invoice management endpoint documentation*

### Webhooks Endpoint
![Webhooks Endpoint](api-webhooks-endpoint.png)
*Webhook management endpoint documentation*

### Try It Out
![Try It Out](api-health-try-it-out.png)
*Interactive API testing*

## Status & Monitoring

### API Status JSON
![API Status JSON](api-status-json.png)
*Machine-readable status information*

### Marketing Status Page
![Marketing Status Page](marketing-status-page.png)
*Human-readable status page*

## Compliance

### Compliance Matrix
![Compliance Matrix](compliance-matrix.png)
*Country and format support matrix*

### Italy Compliance
![Italy Compliance](compliance-italy.png)
*Italian compliance details*

### Implemented Features
![Implemented Features](compliance-implemented.png)
*Currently implemented compliance features*

---

*Screenshots generated automatically for demo purposes*
`;

  await fs.writeFile(`${OUTPUT_DIR}/README.md`, galleryContent);
  console.log(`Demo gallery generated at ${OUTPUT_DIR}/README.md`);
});
