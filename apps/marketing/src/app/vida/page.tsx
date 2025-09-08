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
          ViDA = VAT in the Digital Age (adopted <strong>March 11, 2025</strong>; published <strong>March 25, 2025</strong>; enters into force <strong>April 2025</strong>). From <strong>July 1, 2030</strong>, <strong>intra-EU cross-border B2B</strong> e‑invoicing becomes mandatory across the EU.
          From <strong>2025</strong>, EU Member States may mandate <strong>domestic</strong> e‑invoicing freely.
        </p>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Purpose of ViDA</h3>
          <ul className="text-blue-800 space-y-1">
            <li>• Harmonize VAT reporting across EU member states</li>
            <li>• Reduce VAT gap (~€89B annually)</li>
            <li>• Enable near-real-time compliance monitoring</li>
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
            <li>• Many countries mandate earlier (2025–2028); EU-wide cross-border B2B compliance required by <strong>2030</strong></li>
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
                <td className="border border-gray-300 p-4">Full B2B/B2C e‑invoicing</td>
                <td className="border border-gray-300 p-4">Since 2019</td>
                <td className="border border-gray-300 p-4">FatturaPA via SDI</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-4 font-medium">Germany</td>
                <td className="border border-gray-300 p-4">Must receive e‑invoices; issuing phased</td>
                <td className="border border-gray-300 p-4">Receive: Jan 2025, Issue: 2027–2028</td>
                <td className="border border-gray-300 p-4">XRechnung/ZUGFeRD via Peppol</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-4 font-medium">France</td>
                <td className="border border-gray-300 p-4">Receiving mandatory; issuing phased</td>
                <td className="border border-gray-300 p-4">September 2026</td>
                <td className="border border-gray-300 p-4">Factur‑X via PPF/PDP</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-4 font-medium">Poland</td>
                <td className="border border-gray-300 p-4">KSeF mandatory (phased)</td>
                <td className="border border-gray-300 p-4">Feb 1, 2026 (large), Apr 1, 2026 (others)</td>
                <td className="border border-gray-300 p-4">UBL 2.1 via KSeF</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-4 font-medium">Spain</td>
                <td className="border border-gray-300 p-4">B2B e‑invoicing planned (phased)</td>
                <td className="border border-gray-300 p-4">From 2026 (pending regs)</td>
                <td className="border border-gray-300 p-4">Facturae; SII remains VAT reporting</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 p-4 font-medium">Netherlands</td>
                <td className="border border-gray-300 p-4">B2G mandatory since 2017; no B2B mandate yet</td>
                <td className="border border-gray-300 p-4">Since 2017</td>
                <td className="border border-gray-300 p-4">UBL / Peppol; B2B under consultation</td>
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
