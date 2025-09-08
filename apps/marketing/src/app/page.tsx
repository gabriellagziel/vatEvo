"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Code2, Shield } from "lucide-react";

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 opacity-20" />
        <div className="max-w-7xl mx-auto px-6 py-24 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              Automate EU E‑Invoicing Compliance — Stay Ahead of ViDA
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto mb-10">
              From 2026, real-time e‑invoicing becomes <strong>mandatory</strong> across the EU.
              Vatevo makes compliance effortless for SaaS vendors, without rebuilding your entire billing stack.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <Button size="lg" className="px-8 py-3 text-lg">
                  Request Live Demo
                </Button>
              </Link>
              <a 
                href="https://app-ezgnqzzi.fly.dev/docs" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-blue-600 hover:text-blue-500 border border-blue-600 rounded-md hover:border-blue-500 transition-colors"
              >
                View API Docs
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white border rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
            <Code2 className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Single API Gateway</h3>
            <p className="text-gray-600">One integration for all EU countries</p>
          </div>
          
          <div className="bg-white border rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
            <Shield className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Future‑Proof Compliance</h3>
            <p className="text-gray-600">Automatically updated when mandates change</p>
          </div>
          
          <div className="bg-white border rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
            <CheckCircle2 className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Developer‑Friendly</h3>
            <p className="text-gray-600">Integrate in hours, not months</p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Join forward-thinking SaaS companies who are already preparing for EU e-invoicing compliance.
          </p>
          <Link href="/contact">
            <Button size="lg" className="px-8 py-3 text-lg">
              Request Demo
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
