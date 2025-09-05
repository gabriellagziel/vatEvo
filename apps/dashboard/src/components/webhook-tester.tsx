"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Copy, Check } from "lucide-react";

export function WebhookTester() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [testPayload, setTestPayload] = useState(`{
  "event": "invoice.accepted",
  "invoice_id": 2,
  "external_id": "TEST-INV-001",
  "status": "accepted",
  "timestamp": "${new Date().toISOString()}"
}`);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const sendTestWebhook = async () => {
    if (!webhookUrl) {
      setResponse("Please enter a webhook URL");
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      const payload = JSON.parse(testPayload);
      
      const result = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Vatevo-Signature': 'test-signature-' + Date.now(),
          'X-Vatevo-Event': payload.event || 'test.event',
        },
        body: testPayload,
      });

      const responseText = await result.text();
      setResponse(`Status: ${result.status} ${result.statusText}\n\nResponse:\n${responseText}`);
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(testPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleEvents = [
    {
      name: "Invoice Accepted",
      event: "invoice.accepted",
      payload: {
        event: "invoice.accepted",
        invoice_id: 2,
        external_id: "TEST-INV-001",
        status: "accepted",
        timestamp: new Date().toISOString()
      }
    },
    {
      name: "Invoice Rejected",
      event: "invoice.rejected",
      payload: {
        event: "invoice.rejected",
        invoice_id: 2,
        external_id: "TEST-INV-001",
        status: "rejected",
        error_message: "Invalid VAT number",
        timestamp: new Date().toISOString()
      }
    },
    {
      name: "Submission Failed",
      event: "submission.failed",
      payload: {
        event: "submission.failed",
        invoice_id: 2,
        external_id: "TEST-INV-001",
        status: "failed",
        error_message: "Gateway timeout",
        timestamp: new Date().toISOString()
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Webhook Tester</h1>
        <p className="text-gray-600">Test webhook endpoints with sample payloads</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>Enter your webhook endpoint URL to test</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL
            </label>
            <Input
              type="url"
              placeholder="https://your-app.com/webhooks/vatevo"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sample Events</CardTitle>
          <CardDescription>Click to load sample payloads for different webhook events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleEvents.map((sample) => (
              <Button
                key={sample.event}
                variant="outline"
                onClick={() => setTestPayload(JSON.stringify(sample.payload, null, 2))}
                className="h-auto p-4 flex flex-col items-start"
              >
                <div className="font-medium">{sample.name}</div>
                <Badge variant="secondary" className="mt-1">
                  {sample.event}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Payload</CardTitle>
          <CardDescription>Customize the webhook payload JSON</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              JSON Payload
            </label>
            <Button variant="ghost" size="sm" onClick={copyPayload}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <textarea
            className="w-full h-48 p-3 border border-gray-300 rounded-md font-mono text-sm"
            value={testPayload}
            onChange={(e) => setTestPayload(e.target.value)}
            placeholder="Enter JSON payload..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Test Webhook</CardTitle>
          <CardDescription>Send the test payload to your webhook endpoint</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={sendTestWebhook} disabled={loading || !webhookUrl}>
            <Send className="w-4 h-4 mr-2" />
            {loading ? "Sending..." : "Send Test Webhook"}
          </Button>

          {response && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response
              </label>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-auto max-h-64">
                {response}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Headers</CardTitle>
          <CardDescription>Headers sent with webhook requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Content-Type:</strong> application/json</div>
            <div><strong>X-Vatevo-Signature:</strong> HMAC-SHA256 signature for verification</div>
            <div><strong>X-Vatevo-Event:</strong> Event type (e.g., invoice.accepted)</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
