import React from "react";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle, Database, FileText, Globe, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Solutions - EU E-Invoicing Compliance",
  description: "How Vatevo solves EU e-invoicing compliance with one API, one dashboard, and total compliance for SaaS companies.",
};

export default function Solutions() {
  return (
    <main>
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            The Vatevo Solution
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            <strong>One API. One Dashboard. Total Compliance.</strong>
          </p>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            Vatevo transforms complex EU e-invoicing requirements into a simple, developer-friendly API 
            that handles all compliance automatically.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          How It Works
        </h2>
        
        <div className="mb-10">
          <p className="text-lg text-gray-700 text-center max-w-5xl mx-auto">
            Vatevo provides <strong>one API + dashboard</strong> that validates against <strong>EN 16931/UBL 2.1</strong>, generates country‑specific formats (<strong>FatturaPA, XRechnung, Factur‑X</strong>), routes invoices via the correct channels (<strong>SDI, Peppol, PPF/PDP, KSeF</strong>), and supports secure archiving + real‑time webhooks. Coverage expands as national onboarding completes.
          </p>
        </div>
        
        <div className="grid md:grid-cols-5 gap-8 items-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">1. Send JSON</h3>
            <p className="text-sm text-gray-600">SaaS sends invoice data to Vatevo API</p>
          </div>
          
          <ArrowRight className="w-6 h-6 text-gray-400 mx-auto hidden md:block" />
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">2. Validate & Generate</h3>
            <p className="text-sm text-gray-600">Vatevo validates and generates compliant XML</p>
          </div>
          
          <ArrowRight className="w-6 h-6 text-gray-400 mx-auto hidden md:block" />
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">3. Submit to Authority</h3>
            <p className="text-sm text-gray-600">Submits to correct gateway (SDI, Peppol, PPF, KSeF)</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mt-12 items-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">4. Archive Securely</h3>
            <p className="text-sm text-gray-600">Archives signed invoices in WORM storage for 10 years</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="font-semibold mb-2">5. Real-time Status</h3>
            <p className="text-sm text-gray-600">Dashboard + webhooks provide real-time status updates</p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Key Advantages
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Globe className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Unified API</h3>
              <p className="text-gray-600">
                One integration covers all EU mandates. No need to implement separate 
                connections for Italy's SDI, Germany's Peppol, France's PPF, or Poland's KSeF.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Shield className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">SaaS-First Architecture</h3>
              <p className="text-gray-600">
                Built specifically for multi-tenant SaaS companies with proper tenant isolation, 
                API key management, and webhook delivery.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <CheckCircle className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">GDPR-Compliant</h3>
              <p className="text-gray-600">
                EU-hosted infrastructure with GDPR compliance, eIDAS-ready digital signatures, 
                and SOC2/ISO27001 security standards.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Zap className="w-8 h-8 text-orange-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Developer Experience</h3>
              <p className="text-gray-600">
                Stripe-style developer experience with comprehensive documentation, 
                SDKs, and webhook testing tools.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Database className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Automatic Updates</h3>
              <p className="text-gray-600">
                Stay compliant automatically as regulations change. We handle format updates, 
                new country requirements, and gateway changes.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <FileText className="w-8 h-8 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Complete Archival</h3>
              <p className="text-gray-600">
                10-year WORM storage with digital signatures, audit trails, 
                and instant retrieval for tax authority requests.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Simplify EU Compliance?
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Join forward-thinking SaaS companies who are already preparing for mandatory e-invoicing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo">
              <Button size="lg" className="px-8 py-3 text-lg">
                See Live Demo
              </Button>
            </Link>
            <a 
              href="https://app-ezgnqzzi.fly.dev/docs" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-blue-600 hover:text-blue-500 border border-blue-600 rounded-md hover:border-blue-500 transition-colors"
            >
              Explore API Docs
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
