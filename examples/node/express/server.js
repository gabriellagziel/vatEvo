const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

// Import Vatevo SDK (in real usage, this would be from npm)
const { createClient } = require('@vatevo/sdk');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.raw({ type: 'application/json' }));

// Initialize Vatevo client
const vatevo = createClient({
  apiKey: process.env.VATEVO_API_KEY,
  baseUrl: process.env.VATEVO_API_URL || 'https://api.vatevo.com'
});

// Webhook signature verification
function verifyWebhookSignature(payload, signature, timestamp, secret) {
  // Check timestamp (5 minute window)
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - timestamp) > 300) {
    throw new Error('Timestamp too old');
  }
  
  // Generate expected signature
  const message = `${timestamp}.${payload}`;
  const expectedSignature = `v1=${crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex')}`;
  
  // Compare signatures
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Vatevo Express Example API' });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const health = await vatevo.healthCheck();
    res.json({ status: 'ok', vatevo: health });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create invoice
app.post('/invoices', async (req, res) => {
  try {
    const invoice = await vatevo.createInvoice(req.body);
    res.json(invoice);
  } catch (error) {
    console.error('Invoice creation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// List invoices
app.get('/invoices', async (req, res) => {
  try {
    const invoices = await vatevo.listInvoices({
      status: req.query.status,
      skip: parseInt(req.query.skip) || 0,
      limit: parseInt(req.query.limit) || 10
    });
    res.json(invoices);
  } catch (error) {
    console.error('Invoice listing failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get invoice
app.get('/invoices/:id', async (req, res) => {
  try {
    const invoice = await vatevo.getInvoice(parseInt(req.params.id));
    res.json(invoice);
  } catch (error) {
    console.error('Invoice retrieval failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Validate invoice
app.post('/validate', async (req, res) => {
  try {
    const result = await vatevo.validateInvoice(req.body);
    res.json(result);
  } catch (error) {
    console.error('Invoice validation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-vatevo-signature'];
  const timestamp = parseInt(req.headers['x-vatevo-timestamp']);
  const payload = req.body.toString();
  
  try {
    if (verifyWebhookSignature(payload, signature, timestamp, process.env.WEBHOOK_SECRET)) {
      const event = JSON.parse(payload);
      console.log('Webhook received:', event);
      
      // Process webhook event
      switch (event.type) {
        case 'invoice.created':
          console.log('Invoice created:', event.data);
          break;
        case 'invoice.validated':
          console.log('Invoice validated:', event.data);
          break;
        case 'invoice.submitted':
          console.log('Invoice submitted:', event.data);
          break;
        case 'invoice.accepted':
          console.log('Invoice accepted:', event.data);
          break;
        case 'invoice.rejected':
          console.log('Invoice rejected:', event.data);
          break;
        case 'invoice.failed':
          console.log('Invoice failed:', event.data);
          break;
        default:
          console.log('Unknown event type:', event.type);
      }
      
      res.status(200).send('OK');
    } else {
      console.error('Invalid webhook signature');
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(400).send('Webhook processing failed');
  }
});

// Test webhook delivery
app.post('/test-webhook', async (req, res) => {
  try {
    const result = await vatevo.testWebhook();
    res.json(result);
  } catch (error) {
    console.error('Webhook test failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  console.log(`Vatevo Express Example running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Webhook endpoint: http://localhost:${port}/webhook`);
});
