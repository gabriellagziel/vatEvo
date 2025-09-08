import React from "react";
import type { Metadata } from "next";
import { Check, X } from "lucide-react";

export const metadata: Metadata = {
  title: "Compare - Vatevo vs Competitors",
  description: "Compare Vatevo with Stripe Tax, Avalara, Sovos, and Pagero for EU e-invoicing compliance.",
};

export default function Compare() {
  const features = [
    {
      feature: "Single API for all EU mandates",
      vatevo: true,
      stripeTax: false,
      avalara: "partial",
      sovos: "partial",
      pagero: false,
    },
    {
      feature: "Built-in adapters (SDI, Peppol, PPF, KSeF)",
      vatevo: true,
      stripeTax: false,
      avalara: "limited",
      sovos: "limited",
      pagero: "manual",
    },
    {
      feature: "Real-time e-invoice submission",
      vatevo: true,
      stripeTax: false,
      avalara: false,
      sovos: "partial",
      pagero: true,
    },
    {
      feature: "EN16931 / UBL 2.1 validation",
      vatevo: true,
      stripeTax: false,
      avalara: "partial",
      sovos: "limited",
      pagero: "limited",
    },
    {
      feature: "API-first developer experience",
      vatevo: "best",
      stripeTax: "good",
      avalara: "complex",
      sovos: "outdated",
      pagero: "heavy",
    },
    {
      feature: "Multi-tenant SaaS-ready",
      vatevo: true,
      stripeTax: false,
      avalara: false,
      sovos: false,
      pagero: false,
    },
    {
      feature: "Dashboard + Webhooks",
      vatevo: true,
      stripeTax: "partial",
      avalara: "limited",
      sovos: "limited",
      pagero: "limited",
    },
    {
      feature: "10-year WORM archiving",
      vatevo: true,
      stripeTax: false,
      avalara: "paid",
      sovos: "missing",
      pagero: "missing",
    },
  ];

  const renderCell = (value: boolean | string) => {
    if (value === true || value === "best") {
      return (
        <div className="flex items-center justify-center">
          <Check className="w-5 h-5 text-green-600" />
          {value === "best" && <span className="ml-2 text-sm font-medium text-green-600">Best</span>}
        </div>
      );
    }
    if (value === false) {
      return (
        <div className="flex items-center justify-center">
          <X className="w-5 h-5 text-red-500" />
        </div>
      );
    }
    return (
      <div className="text-center text-sm">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value === "partial" || value === "good" ? "bg-yellow-100 text-yellow-800" :
          value === "limited" || value === "complex" ? "bg-orange-100 text-orange-800" :
          value === "paid" ? "bg-blue-100 text-blue-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {value}
        </span>
      </div>
    );
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          How Vatevo Compares
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          See why Vatevo is the only solution built specifically for SaaS companies 
          needing EU e-invoicing compliance.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 bg-white rounded-lg shadow-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-4 text-left font-semibold text-gray-900">
                Feature
              </th>
              <th className="border border-gray-300 p-4 text-center font-semibold text-blue-600">
                Vatevo
              </th>
              <th className="border border-gray-300 p-4 text-center font-semibold text-gray-700">
                Stripe Tax
              </th>
              <th className="border border-gray-300 p-4 text-center font-semibold text-gray-700">
                Avalara
              </th>
              <th className="border border-gray-300 p-4 text-center font-semibold text-gray-700">
                Sovos
              </th>
              <th className="border border-gray-300 p-4 text-center font-semibold text-gray-700">
                Pagero
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-4 font-medium text-gray-900">
                  {row.feature}
                </td>
                <td className="border border-gray-300 p-4 bg-blue-50">
                  {renderCell(row.vatevo)}
                </td>
                <td className="border border-gray-300 p-4">
                  {renderCell(row.stripeTax)}
                </td>
                <td className="border border-gray-300 p-4">
                  {renderCell(row.avalara)}
                </td>
                <td className="border border-gray-300 p-4">
                  {renderCell(row.sovos)}
                </td>
                <td className="border border-gray-300 p-4">
                  {renderCell(row.pagero)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Why Choose Vatevo?
          </h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• Built specifically for SaaS companies</li>
            <li>• Single API covers all EU requirements</li>
            <li>• Stripe-style developer experience</li>
            <li>• Multi-tenant architecture ready</li>
            <li>• Complete compliance automation</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            Stripe Tax Limitations
          </h3>
          <ul className="text-yellow-800 space-y-2 text-sm">
            <li>• No e-invoicing submission</li>
            <li>• Tax calculation only</li>
            <li>• No EU gateway integrations</li>
            <li>• No compliance archiving</li>
            <li>• Not built for multi-tenant SaaS</li>
          </ul>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-orange-900 mb-3">
            Enterprise Solutions
          </h3>
          <ul className="text-orange-800 space-y-2 text-sm">
            <li>• Complex implementation (6+ months)</li>
            <li>• Enterprise pricing only</li>
            <li>• Heavy integration requirements</li>
            <li>• Not optimized for SaaS workflows</li>
            <li>• Limited API-first approach</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to See the Difference?
        </h2>
        <p className="text-gray-700 mb-6">
          Experience the only e-invoicing solution built for modern SaaS companies.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/demo"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Live Demo
          </a>
          <a 
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            Request Consultation
          </a>
        </div>
      </div>
    </main>
  );
}
