"use client";

import React from "react";
import type { Metadata } from "next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, Users } from "lucide-react";

const metadata: Metadata = {
  title: "Contact - Request Demo",
  description: "Request a demo of Vatevo's EU e-invoicing compliance solution for SaaS companies.",
};

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    setLoading(true);
    setResult(null);
    
    try {
      const res = await fetch("/api/lead", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data) 
      });
      const json = await res.json();
      
      if (res.ok) {
        setResult("Thanks! We'll reach out within 24 hours to schedule your demo.");
        form.reset();
      } else {
        setResult(json.error ?? "Submission failed. Please try again or email us directly.");
      }
    } catch {
      setResult("Network error. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Request a Demo
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          See how Vatevo can simplify your EU e-invoicing compliance. 
          Get a personalized demo with your own use case.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Get Your Demo
              </CardTitle>
              <CardDescription>
                Fill out the form and we'll schedule a personalized demo within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Work Email *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="john@company.com"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    placeholder="ACME SaaS Inc"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Tell us about your use case
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Which EU countries do you sell to? What's your current invoicing setup? Any specific compliance requirements?"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full"
                >
                  {loading ? "Sending..." : "Request Demo"}
                </Button>
              </form>
              
              {result && (
                <div className={`mt-4 p-3 rounded-md text-sm ${
                  result.includes("Thanks") 
                    ? "bg-green-50 text-green-800 border border-green-200" 
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}>
                  {result}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              What to Expect
            </h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Personalized Demo</h3>
                  <p className="text-gray-600 text-sm">
                    We'll show you how Vatevo works with your specific use case and EU markets.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Technical Deep-Dive</h3>
                  <p className="text-gray-600 text-sm">
                    Review API documentation, integration patterns, and webhook examples.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Implementation Plan</h3>
                  <p className="text-gray-600 text-sm">
                    Get a custom roadmap for implementing Vatevo in your SaaS platform.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Other Ways to Reach Us
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <a href="mailto:contact@vatevo.com" className="ml-2 text-blue-600 hover:text-blue-500">
                  contact@vatevo.com
                </a>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">API Documentation:</span>
                <a 
                  href="https://app-ezgnqzzi.fly.dev/docs" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:text-blue-500"
                >
                  View API Docs
                </a>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Live Demo:</span>
                <a 
                  href="https://compliance-invoicing-platform-q0r2re2n.devinapps.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:text-blue-500"
                >
                  Try Dashboard
                </a>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Perfect for SaaS Companies
            </h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Selling B2B services in EU markets</li>
              <li>• Need to comply with ViDA by 2026</li>
              <li>• Want developer-friendly integration</li>
              <li>• Require multi-tenant architecture</li>
              <li>• Looking for automated compliance</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
