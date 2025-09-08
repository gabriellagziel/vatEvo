import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface VatevoConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface Tenant {
  id: string;
  name: string;
  api_key: string;
  webhook_url?: string;
  created_at: string;
}

export interface Invoice {
  id: number;
  tenant_id: string;
  status: string;
  country_code: string;
  ubl_xml?: string;
  country_xml?: string;
  pdf_url?: string;
  submission_id?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceCreate {
  country_code: string;
  supplier: {
    name: string;
    vat_id: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
  };
  customer: {
    name: string;
    vat_id: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
  };
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: string;
    tax_rate: number;
    tax_amount: string;
    line_total: string;
  }>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface WebhookEvent {
  id: string;
  type: string;
  created: string;
  data: any;
  api_version: string;
}

export class VatevoClient {
  private client: AxiosInstance;

  constructor(config: VatevoConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.vatevo.com',
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Vatevo-SDK-TypeScript/1.0.0'
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`Making request to ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Health checks
  async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await this.client.get('/healthz');
    return response.data;
  }

  async healthReady(): Promise<{ status: string; service: string }> {
    const response = await this.client.get('/health/ready');
    return response.data;
  }

  async healthDb(): Promise<{ status: string; database: string }> {
    const response = await this.client.get('/health/db');
    return response.data;
  }

  // Tenant management
  async createTenant(data: { name: string; webhook_url?: string }): Promise<Tenant> {
    const response = await this.client.post('/tenants', data);
    return response.data;
  }

  // Invoice management
  async createInvoice(data: InvoiceCreate): Promise<Invoice> {
    const response = await this.client.post('/invoices', data);
    return response.data;
  }

  async getInvoice(id: number): Promise<Invoice> {
    const response = await this.client.get(`/invoices/${id}`);
    return response.data;
  }

  async listInvoices(params?: { status?: string; skip?: number; limit?: number }): Promise<Invoice[]> {
    const response = await this.client.get('/invoices', { params });
    return response.data;
  }

  async retryInvoice(id: number): Promise<Invoice> {
    const response = await this.client.post(`/invoices/${id}/retry`);
    return response.data;
  }

  // Validation
  async validateInvoice(data: InvoiceCreate): Promise<ValidationResult> {
    const response = await this.client.post('/validate', data);
    return response.data;
  }

  // Webhooks
  async testWebhook(): Promise<{ success: boolean; webhook_url: string; event: any }> {
    const response = await this.client.post('/webhooks/test');
    return response.data;
  }

  async listWebhookEvents(params?: { skip?: number; limit?: number }): Promise<WebhookEvent[]> {
    const response = await this.client.get('/webhooks/events', { params });
    return response.data;
  }

  // Utility methods
  async verifyWebhookSignature(payload: string, signature: string, timestamp: number): Promise<boolean> {
    try {
      const response = await this.client.post('/webhooks/verify', payload, {
        headers: {
          'X-Vatevo-Signature': signature,
          'X-Vatevo-Timestamp': timestamp.toString(),
          'Content-Type': 'application/json'
        }
      });
      return response.data.valid;
    } catch (error) {
      console.error('Webhook verification failed:', error);
      return false;
    }
  }
}

// Export default client factory
export function createClient(config: VatevoConfig): VatevoClient {
  return new VatevoClient(config);
}

// Export types
export * from './types';
