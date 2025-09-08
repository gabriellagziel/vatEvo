import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What is ViDA? EU VAT in the Digital Age",
  description: "Learn about ViDA (VAT in the Digital Age) and why EU e-invoicing compliance is mandatory for SaaS companies by 2026.",
};

export default function ViDA() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
        What is ViDA?
      </h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-gray-700 mb-8">
          ViDA = VAT in the Digital Age (adopted March 2025). From <strong>July 1, 2030</strong>, cross‑border B2B e‑invoicing becomes <strong>mandatory</strong> across the EU.
          From <strong>2025</strong>, member states may enforce domestic e‑invoicing freely.
        </p>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Purpose of ViDA</h3>
          <ul className="text-blue-800 space-y-1">
            <li>• Harmonize VAT reporting across EU member states</li>
            <li>• Reduce VAT fraud (currently €93B annually)</li>
            <li>• Enable real-time auditing and compliance monitoring</li>
          </ul>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
          Why It Matters for SaaS Companies
        </h2>
        
        <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8">
          <h3 className="text-lg font-semibold text-red-900 mb-3">Non-Compliance Consequences</h3>
          <ul className="text-red-800 space-y-2">
            <li>• <strong>Fines and penalties</strong> from tax authorities</li>
            <li>• <strong>Blocked payments</strong> from EU customers</li>
            <li>• <strong>Loss of EU market access</strong> for non-compliant vendors</li>
            <li>• <strong>Mandatory adaptation</strong> before 2026 for SaaS vendors selling into Europe</li>
          </ul>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
          Country-Specific Mandates
        </h2>
        
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 p-4 text-left font-semibold">Country</th>
                <th className="border border-gray-300 p-4 text-left font-semibold">Requirement</th>
                <th className="border border-gray-300 p-4 text-left font-semibold">Effective Date</th>
                <th className="border border-gray-300 p-4 text-left font-semibold">Format / Gateway</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-4 font-medium">Italy</td>
                <td className="border border-gray-300 p-4">Full mandatory e‑invoicing</td>
                <td className="border border-gray-300 p-4">Since 2019</td>
                <td className="border border-gray-300 p-4">FatturaPA XML via SDI</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-4 font-medium">Germany</td>
                <td className="border border-gray-300 p-4">Must accept e‑invoices</td>
                <td className="border border-gray-300 p-4">January 2025</td>
                <td className="border border-gray-300 p-4">XRechnung via Peppol</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-4 font-medium">France</td>
                <td className="border border-gray-300 p-4">Receiving mandatory</td>
                <td className="border border-gray-300 p-4">September 2026</td>
                <td className="border border-gray-300 p-4">Factur‑X via PPF/PDP</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-4 font-medium">Poland</td>
                <td className="border border-gray-300 p-4">KSeF e‑invoicing platform</td>
                <td className="border border-gray-300 p-4">July 2026</td>
                <td className="border border-gray-300 p-4">UBL 2.1 via KSeF</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-4 font-medium">Spain</td>
                <td className="border border-gray-300 p-4">B2B e‑invoicing mandatory</td>
                <td className="border border-gray-300 p-4">2025 (phased)</td>
                <td className="border border-gray-300 p-4">Facturae via SII</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-4 font-medium">Netherlands</td>
                <td className="border border-gray-300 p-4">Government contracts first</td>
                <td className="border border-gray-300 p-4">2026 (planned)</td>
                <td className="border border-gray-300 p-4">UBL 2.1 via Peppol</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">The Vatevo Solution</h3>
          <p className="text-green-800">
            Instead of implementing separate integrations for each country's requirements, 
            Vatevo provides a single API that handles all EU e-invoicing mandates automatically. 
            <strong> One integration, total compliance.</strong>
          </p>
        </div>
      </div>
    </main>
  );
}
