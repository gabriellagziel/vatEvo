const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface Tenant {
  id: number;
  name: string;
  api_key: string;
  webhook_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Invoice {
  id: number;
  external_id: string;
  status: 'draft' | 'validated' | 'submitted' | 'accepted' | 'rejected' | 'failed';
  country_code: string;
  invoice_number: string;
  issue_date: string;
  due_date?: string;
  subtotal: string;
  tax_amount: string;
  total_amount: string;
  currency: string;
  ubl_xml_url?: string;
  country_xml_url?: string;
  pdf_url?: string;
  submission_id?: string;
  error_message?: string;
  created_at: string;
  updated_at?: string;
  submitted_at?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

class ApiClient {
  private apiKey: string | null = null;

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('vatevo_api_key', apiKey);
  }

  getApiKey(): string | null {
    if (this.apiKey) return this.apiKey;
    if (typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem('vatevo_api_key');
    }
    return this.apiKey;
  }

  clearApiKey() {
    this.apiKey = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vatevo_api_key');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const apiKey = this.getApiKey();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async createTenant(name: string, webhookUrl?: string): Promise<ApiResponse<Tenant>> {
    return this.request<Tenant>('/tenants', {
      method: 'POST',
      body: JSON.stringify({
        name,
        webhook_url: webhookUrl,
      }),
    });
  }

  async getInvoices(params?: {
    skip?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<Invoice[]>> {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.set('skip', params.skip.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);

    const query = searchParams.toString();
    const endpoint = `/invoices${query ? `?${query}` : ''}`;
    
    return this.request<Invoice[]>(endpoint);
  }

  async getInvoice(id: number): Promise<ApiResponse<Invoice>> {
    return this.request<Invoice>(`/invoices/${id}`);
  }

  async createInvoice(invoiceData: unknown): Promise<ApiResponse<Invoice>> {
    return this.request<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }

  async validateInvoice(validationData: unknown): Promise<ApiResponse<ValidationResult>> {
    return this.request<ValidationResult>('/validate', {
      method: 'POST',
      body: JSON.stringify(validationData),
    });
  }

  async retryInvoice(id: number): Promise<ApiResponse<Invoice>> {
    return this.request<Invoice>(`/invoices/${id}/retry`, {
      method: 'POST',
    });
  }

  async healthCheck(): Promise<ApiResponse<{ status: string; service: string }>> {
    return this.request<{ status: string; service: string }>('/healthz');
  }
}

export const apiClient = new ApiClient();
