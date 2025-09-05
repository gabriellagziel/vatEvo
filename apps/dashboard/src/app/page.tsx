"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { InvoiceList } from "@/components/invoice-list";
import { AuthForm } from "@/components/auth-form";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const apiKey = apiClient.getApiKey();
      if (apiKey) {
        const result = await apiClient.healthCheck();
        if (!result.error) {
          setIsAuthenticated(true);
        } else {
          apiClient.clearApiKey();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    apiClient.clearApiKey();
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <DashboardLayout onLogout={handleLogout}>
      <InvoiceList />
    </DashboardLayout>
  );
}
