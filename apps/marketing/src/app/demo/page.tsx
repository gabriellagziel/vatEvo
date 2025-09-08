"use client";

import React from "react";
import type { Metadata } from "next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play } from "lucide-react";

const metadata: Metadata = {
  title: "Demo - Live Vatevo Dashboard",
  description: "Try the live Vatevo dashboard and see how easy EU e-invoicing compliance can be.",
};

export default function Demo() {
  const [jsonText, setJsonText] = useState<string>(`{
  "invoice_number": "INV-1001",
  "issue_date": "2025-09-01",
  "supplier": {
    "name": "ACME SaaS Inc",
    "vat_id": "DE123456789",
    "address": "Berlin, Germany"
  },
  "customer": {
    "name": "Contoso Ltd",
    "vat_id": "IT98765432101",
    "address": "Milan, Italy"
  },
  "lines": [
    {
      "description": "SaaS Subscription",
      "amount": "100.00",
      "currency": "EUR",
      "vat_rate": "22"
    }
  ]
}`);
  
  const [xmlPreview, setXmlPreview] = useState<string>("");

  const toXml = (json: any) => {
    const currency = json.lines?.[0]?.currency ?? "EUR";
    const vatRate = json.lines?.[0]?.vat_rate ?? "22";
    const amount = json.lines?.[0]?.amount ?? "0.00";
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>${json.invoice_number ?? ""}</cbc:ID>
  <cbc:IssueDate>${json.issue_date ?? ""}</cbc:IssueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${currency}</cbc:DocumentCurrencyCode>
  
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cbc:Name>${json.supplier?.name ?? ""}</cbc:Name>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${json.supplier?.vat_id ?? ""}</cbc:CompanyID>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>
  
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cbc:Name>${json.customer?.name ?? ""}</cbc:Name>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${json.customer?.vat_id ?? ""}</cbc:CompanyID>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingCustomerParty>
  
  ${(json.lines ?? []).map((line: any, index: number) => `
  <cac:InvoiceLine>
    <cbc:ID>${index + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="EA">1</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${currency}">${line.amount}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Description>${line.description}</cbc:Description>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${currency}">${line.amount}</cbc:PriceAmount>
    </cac:Price>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="${currency}">${(parseFloat(line.amount) * parseFloat(vatRate) / 100).toFixed(2)}</cbc:TaxAmount>
    </cac:TaxTotal>
  </cac:InvoiceLine>`).join("")}
  
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${currency}">${(parseFloat(amount) * parseFloat(vatRate) / 100).toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>
  
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${currency}">${amount}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${currency}">${amount}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${currency}">${(parseFloat(amount) * (1 + parseFloat(vatRate) / 100)).toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${currency}">${(parseFloat(amount) * (1 + parseFloat(vatRate) / 100)).toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`;
  };

  const handleGenerate = () => {
    try {
      const data = JSON.parse(jsonText);
      setXmlPreview(toXml(data));
    } catch {
      setXmlPreview("Invalid JSON - Please check your syntax");
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Live Demo
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          Experience Vatevo in action. Try our live dashboard and see how easy 
          EU e-invoicing compliance can be.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Play className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Live Dashboard</h2>
          </div>
          
          <div className="rounded-lg border overflow-hidden shadow-lg bg-white">
            <iframe
              className="w-full h-[500px]"
              src="https://compliance-invoicing-platform-q0r2re2n.devinapps.com"
              title="Vatevo Dashboard Demo"
              allow="fullscreen"
            />
          </div>
          
          <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-600">
              If the embed is blocked by your browser, open the demo in a new tab:
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-500 font-medium"
                href="https://compliance-invoicing-platform-q0r2re2n.devinapps.com" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
                Open Dashboard Demo
              </a>
              <a 
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-500 font-medium"
                href="https://app-ezgnqzzi.fly.dev/docs" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
                View API Documentation
              </a>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Interactive Example
          </h2>
          <p className="text-gray-600 mb-6">
            Paste or edit sample JSON invoice data below to see how Vatevo generates 
            compliant UBL 2.1 XML for EU e-invoicing.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice JSON Input
              </label>
              <textarea 
                value={jsonText} 
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full h-64 border border-gray-300 rounded-md p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter invoice JSON..."
              />
            </div>
            
            <Button onClick={handleGenerate} className="w-full">
              Generate UBL XML
            </Button>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generated UBL 2.1 XML
              </label>
              <pre className="w-full h-64 border border-gray-300 rounded-md p-3 bg-gray-50 overflow-auto text-xs whitespace-pre-wrap font-mono">
                {xmlPreview || "Click 'Generate UBL XML' to see the output..."}
              </pre>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Vatevo validates the XML against EN16931 standards</li>
              <li>• Routes to the correct gateway (SDI for Italy, Peppol for Germany, etc.)</li>
              <li>• Archives the signed invoice in WORM storage</li>
              <li>• Sends real-time status updates via webhooks</li>
            </ul>
          </div>
        </section>
      </div>

      <section className="mt-16 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          See how Vatevo can simplify your EU e-invoicing compliance. 
          Request a personalized demo with your own data.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
          >
            Request Personal Demo
          </a>
          <a 
            href="https://app-ezgnqzzi.fly.dev/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            Explore API Docs
          </a>
        </div>
      </section>
    </main>
  );
}
