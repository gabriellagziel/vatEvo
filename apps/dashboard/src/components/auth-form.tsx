"use client";

import React, { useState } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    name: "",
    apiKey: "",
    webhookUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "register") {
        const result = await apiClient.createTenant(formData.name, formData.webhookUrl || undefined);
        if (result.error) {
          setError(result.error);
          return;
        }
        if (result.data) {
          apiClient.setApiKey(result.data.api_key);
          onAuthSuccess();
        }
      } else {
        apiClient.setApiKey(formData.apiKey);
        const result = await apiClient.healthCheck();
        if (result.error) {
          setError("Invalid API key");
          apiClient.clearApiKey();
          return;
        }
        onAuthSuccess();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vatevo</h1>
          <p className="text-gray-600">EU e-invoicing compliance dashboard</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{mode === "login" ? "Sign In" : "Create Tenant"}</CardTitle>
            <CardDescription>
              {mode === "login" 
                ? "Enter your API key to access your dashboard"
                : "Create a new tenant to get started"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Tenant Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your company name"
                    />
                  </div>
                  <div>
                    <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Webhook URL (optional)
                    </label>
                    <Input
                      id="webhookUrl"
                      type="url"
                      value={formData.webhookUrl}
                      onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                      placeholder="https://your-app.com/webhooks/vatevo"
                    />
                  </div>
                </>
              )}

              {mode === "login" && (
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <Input
                    id="apiKey"
                    type="password"
                    required
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder="Enter your API key"
                  />
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Loading..." : mode === "login" ? "Sign In" : "Create Tenant"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {mode === "login" 
                  ? "Need a tenant? Create one here" 
                  : "Already have an API key? Sign in"
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
