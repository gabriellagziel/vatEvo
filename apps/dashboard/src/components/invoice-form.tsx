"use client";

import React, { useState } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface InvoiceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function InvoiceForm({ onSuccess, onCancel }: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    external_id: "",
    invoice_number: "",
    country_code: "DE",
    issue_date: new Date().toISOString().split('T')[0],
    due_date: "",
    subtotal: "",
    tax_amount: "",
    total_amount: "",
    currency: "EUR",
    supplier_name: "",
    supplier_address: "",
    supplier_vat_id: "",
    customer_name: "",
    customer_address: "",
    customer_vat_id: "",
    line_item_description: "",
    line_item_quantity: "1",
    line_item_unit_price: "",
    line_item_total: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const invoiceData = {
        external_id: formData.external_id,
        invoice_number: formData.invoice_number,
        country_code: formData.country_code,
        issue_date: new Date(formData.issue_date).toISOString(),
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        currency: formData.currency,
        supplier: {
          name: formData.supplier_name,
          vat_id: formData.supplier_vat_id,
          address: formData.supplier_address.split(',')[0] || formData.supplier_address,
          city: formData.supplier_address.split(',')[1]?.trim() || "Berlin",
          postal_code: "10115",
          country: "Germany",
        },
        customer: {
          name: formData.customer_name,
          vat_id: formData.customer_vat_id,
          address: formData.customer_address.split(',')[0] || formData.customer_address,
          city: formData.customer_address.split(',')[1]?.trim() || "Munich",
          postal_code: "80331",
          country: "Germany",
        },
        line_items: [
          {
            description: formData.line_item_description,
            quantity: parseFloat(formData.line_item_quantity),
            unit_price: formData.line_item_unit_price,
            tax_rate: 0.19,
            tax_amount: formData.tax_amount,
            line_total: formData.line_item_total,
          }
        ],
      };

      const result = await apiClient.createInvoice(invoiceData);
      if (result.error) {
        setError(typeof result.error === 'string' ? result.error : JSON.stringify(result.error));
        return;
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while creating the invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "line_item_quantity" || field === "line_item_unit_price") {
      const quantity = field === "line_item_quantity" ? parseFloat(value) || 0 : parseFloat(formData.line_item_quantity) || 0;
      const unitPrice = field === "line_item_unit_price" ? parseFloat(value) || 0 : parseFloat(formData.line_item_unit_price) || 0;
      const lineTotal = (quantity * unitPrice).toFixed(2);
      
      setFormData(prev => ({
        ...prev,
        [field]: value,
        line_item_total: lineTotal,
        subtotal: lineTotal,
        tax_amount: (parseFloat(lineTotal) * 0.19).toFixed(2), // 19% VAT
        total_amount: (parseFloat(lineTotal) * 1.19).toFixed(2),
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
          <p className="text-gray-600">Create a new EU-compliant e-invoice</p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>Enter the basic invoice information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  External ID *
                </label>
                <Input
                  required
                  value={formData.external_id}
                  onChange={(e) => handleInputChange("external_id", e.target.value)}
                  placeholder="Your internal invoice ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number *
                </label>
                <Input
                  required
                  value={formData.invoice_number}
                  onChange={(e) => handleInputChange("invoice_number", e.target.value)}
                  placeholder="INV-2024-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country Code *
                </label>
                <select
                  required
                  value={formData.country_code}
                  onChange={(e) => handleInputChange("country_code", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="DE">Germany (DE)</option>
                  <option value="IT">Italy (IT)</option>
                  <option value="FR">France (FR)</option>
                  <option value="ES">Spain (ES)</option>
                  <option value="NL">Netherlands (NL)</option>
                  <option value="BE">Belgium (BE)</option>
                  <option value="AT">Austria (AT)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <Input
                  value={formData.currency}
                  onChange={(e) => handleInputChange("currency", e.target.value)}
                  placeholder="EUR"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date *
                </label>
                <Input
                  type="date"
                  required
                  value={formData.issue_date}
                  onChange={(e) => handleInputChange("issue_date", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleInputChange("due_date", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Supplier Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <Input
                      required
                      value={formData.supplier_name}
                      onChange={(e) => handleInputChange("supplier_name", e.target.value)}
                      placeholder="Your Company Ltd"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <Input
                      required
                      value={formData.supplier_address}
                      onChange={(e) => handleInputChange("supplier_address", e.target.value)}
                      placeholder="123 Business St, City, Country"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      VAT ID *
                    </label>
                    <Input
                      required
                      value={formData.supplier_vat_id}
                      onChange={(e) => handleInputChange("supplier_vat_id", e.target.value)}
                      placeholder="DE123456789"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <Input
                      required
                      value={formData.customer_name}
                      onChange={(e) => handleInputChange("customer_name", e.target.value)}
                      placeholder="Customer Company Ltd"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <Input
                      required
                      value={formData.customer_address}
                      onChange={(e) => handleInputChange("customer_address", e.target.value)}
                      placeholder="456 Customer Ave, City, Country"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      VAT ID *
                    </label>
                    <Input
                      required
                      value={formData.customer_vat_id}
                      onChange={(e) => handleInputChange("customer_vat_id", e.target.value)}
                      placeholder="DE987654321"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Line Items</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <Input
                    required
                    value={formData.line_item_description}
                    onChange={(e) => handleInputChange("line_item_description", e.target.value)}
                    placeholder="Software License"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={formData.line_item_quantity}
                    onChange={(e) => handleInputChange("line_item_quantity", e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={formData.line_item_unit_price}
                    onChange={(e) => handleInputChange("line_item_unit_price", e.target.value)}
                    placeholder="100.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.line_item_total}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtotal
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.subtotal}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Amount (19%)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.tax_amount}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.total_amount}
                  readOnly
                  className="bg-gray-50 font-semibold"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Invoice"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
