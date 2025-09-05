"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiClient, type Invoice } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime, getStatusColor } from "@/lib/utils";
import { Search, Plus, Download, RefreshCw, Eye } from "lucide-react";
import { InvoiceForm } from "./invoice-form";

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      const result = await apiClient.getInvoices({
        limit: 50,
        status: statusFilter || undefined,
      });
      
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setInvoices(result.data);
      }
    } catch {
      setError("Failed to load invoices");
    }finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.external_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRetry = async (invoiceId: number) => {
    try {
      const result = await apiClient.retryInvoice(invoiceId);
      if (result.error) {
        setError(`Failed to retry invoice: ${result.error}`);
      } else {
        loadInvoices();
        alert("Invoice retry initiated successfully");
      }
    } catch {
      setError("Failed to retry invoice");
    }
  };

  const handleDownload = async (invoice: Invoice, type: "ubl" | "pdf") => {
    if (type === "ubl" && invoice.ubl_xml_url) {
      window.open(invoice.ubl_xml_url, '_blank');
    } else if (type === "pdf") {
      alert("PDF download not yet implemented");
    } else {
      alert("File not available for download");
    }
  };

  const handleViewDetails = async (invoice: Invoice) => {
    try {
      const result = await apiClient.getInvoice(invoice.id);
      if (result.error) {
        setError(`Failed to load invoice details: ${result.error}`);
      } else if (result.data) {
        const details = `
Invoice Details:
- ID: ${result.data.id}
- Number: ${result.data.invoice_number}
- External ID: ${result.data.external_id}
- Status: ${result.data.status}
- Country: ${result.data.country_code}
- Currency: ${result.data.currency}
- Total: ${result.data.total_amount}
- Issue Date: ${result.data.issue_date}
- Due Date: ${result.data.due_date || 'Not set'}
- Created: ${result.data.created_at}
- Updated: ${result.data.updated_at}
${result.data.ubl_xml_url ? `- UBL XML: Available` : ''}
${result.data.error_message ? `- Error: ${result.data.error_message}` : ''}
        `;
        alert(details);
      }
    } catch {
      setError("Failed to load invoice details");
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    loadInvoices(); // Refresh the list
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading invoices...</div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <InvoiceForm 
        onSuccess={handleCreateSuccess}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Manage your EU-compliant e-invoices</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by invoice number or external ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="validated">Validated</option>
              <option value="submitted">Submitted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="failed">Failed</option>
            </select>
            <Button variant="outline" onClick={loadInvoices}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-red-600">{error}</div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                {searchTerm || statusFilter ? "No invoices match your filters" : "No invoices found"}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{invoice.invoice_number}</h3>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {invoice.country_code}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">External ID:</span>
                        <div className="font-medium">{invoice.external_id}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <div className="font-medium">
                          {formatCurrency(invoice.total_amount, invoice.currency)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Issue Date:</span>
                        <div className="font-medium">{formatDateTime(invoice.issue_date)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <div className="font-medium">{formatDateTime(invoice.created_at)}</div>
                      </div>
                    </div>
                    {invoice.error_message && (
                      <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                        {invoice.error_message}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(invoice)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {invoice.ubl_xml_url && (
                      <Button variant="outline" size="sm" onClick={() => handleDownload(invoice, "ubl")}>
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    {(invoice.status === "failed" || invoice.status === "rejected") && (
                      <Button variant="outline" size="sm" onClick={() => handleRetry(invoice.id)}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
