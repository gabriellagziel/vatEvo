"use client";

import React from "react";
import { WebhookTester } from "@/components/webhook-tester";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function WebhooksPage() {
  const handleLogout = () => {
    localStorage.removeItem('vatevo_api_key');
    window.location.href = '/';
  };

  return (
    <DashboardLayout onLogout={handleLogout}>
      <WebhookTester />
    </DashboardLayout>
  );
}
