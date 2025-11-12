const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://payment-db:27017/paymentdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Payment Schema
const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  customerId: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  method: { 
    type: String, 
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'], 
    default: 'pending' 
  },
  paymentDetails: {
    cardLast4: String,
    cardBrand: String,
    transactionId: String,
    gatewayResponse: Object
  },
  refundAmount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);

// Generate payment ID
const generatePaymentId = () => {
  return 'PAY-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// Simulate payment processing
const processPayment = async (paymentData) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate 90% success rate
  const isSuccess = Math.random() > 0.1;
  
  return {
    success: isSuccess,
    transactionId: isSuccess ? 'TXN-' + Date.now() : null,
    gatewayResponse: {
      status: isSuccess ? 'approved' : 'declined',
      message: isSuccess ? 'Payment processed successfully' : 'Payment declined'
    }
  };
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'payment-service', timestamp: new Date().toISOString() });
});

// Process payment
app.post('/payments', [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('method').isIn(['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer'])
    .withMessage('Valid payment method is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, customerId, amount, method, paymentDetails } = req.body;

    const payment = new Payment({
      paymentId: generatePaymentId(),
      orderId,
      customerId,
      amount,
      method,
      paymentDetails
    });

    await payment.save();

    // Process payment
    const result = await processPayment(payment);

    if (result.success) {
      payment.status = 'completed';
      payment.paymentDetails.transactionId = result.transactionId;
      payment.paymentDetails.gatewayResponse = result.gatewayResponse;
    } else {
      payment.status = 'failed';
      payment.paymentDetails.gatewayResponse = result.gatewayResponse;
    }

    payment.updatedAt = new Date();
    await payment.save();

    res.status(201).json({
      message: 'Payment processed',
      payment: {
        paymentId: payment.paymentId,
        status: payment.status,
        amount: payment.amount,
        transactionId: payment.paymentDetails.transactionId
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get payment by ID
app.get('/payments/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get payments by order
app.get('/payments/order/:orderId', async (req, res) => {
  try {
    const payments = await Payment.find({ orderId: req.params.orderId });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get payments by customer
app.get('/payments/customer/:customerId', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    let query = { customerId: req.params.customerId };
    
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Refund payment
app.post('/payments/:id/refund', [
  body('amount').isNumeric().withMessage('Valid refund amount is required'),
  body('reason').notEmpty().withMessage('Refund reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, reason } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed payments can be refunded' });
    }

    if (amount > payment.amount - payment.refundAmount) {
      return res.status(400).json({ 
        message: 'Refund amount exceeds available amount',
        available: payment.amount - payment.refundAmount
      });
    }

    payment.refundAmount += amount;
    payment.status = payment.refundAmount >= payment.amount ? 'refunded' : 'completed';
    payment.updatedAt = new Date();
    await payment.save();

    res.json({ 
      message: 'Refund processed successfully', 
      payment,
      refundAmount: amount,
      reason
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get payment statistics
app.get('/payments/stats', async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalPayments = await Payment.countDocuments();
    const totalAmount = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalRefunded = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$refundAmount' } } }
    ]);

    res.json({
      statusBreakdown: stats,
      totalPayments,
      totalAmount: totalAmount[0]?.total || 0,
      totalRefunded: totalRefunded[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Minimal UI
app.get('/', (req, res) => {
  res.send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Payment Service UI</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 0; padding: 2rem; line-height: 1.5; }
    .container { max-width: 900px; margin: 0 auto; }
    .card { border: 1px solid #4443; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
    input, textarea, select { width: 100%; padding: .6rem; border: 1px solid #4443; border-radius: 8px; font-family: inherit; }
    label { font-weight: 600; display: block; margin: .5rem 0 .3rem; }
    button { padding: .6rem 1rem; border-radius: 8px; border: 1px solid #4443; cursor: pointer; }
    pre { background: #00000008; padding: 1rem; border-radius: 8px; overflow: auto; max-height: 45vh; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Payment Service</h1>
    <div class="card">
      <h2>Quick Health</h2>
      <button id="btnHealth">GET /health</button>
    </div>
    <div class="card">
      <h2>Process Payment</h2>
      <textarea id="payBody" rows="12">{ "orderId": "ORD-1", "customerId": "user-1", "amount": 49.99, "method": "credit_card", "paymentDetails": { "cardLast4": "4242", "cardBrand": "VISA" } }</textarea>
      <button id="btnPay">POST /payments</button>
    </div>
    <div class="card">
      <h2>Generic Request</h2>
      <label>Method</label>
      <select id="method"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option></select>
      <label>Path</label>
      <input id="path" value="/payments/stats" />
      <label>JSON Body</label>
      <textarea id="body" rows="8">{}</textarea>
      <button id="send">Send</button>
    </div>
    <div class="card">
      <h2>Response</h2>
      <pre id="out"></pre>
    </div>
  </div>
  <script>
    const out = document.getElementById('out');
    function show(x){ out.textContent = typeof x === 'string' ? x : JSON.stringify(x, null, 2); }
    async function call(method, path, body){
      const headers = { 'Content-Type': 'application/json' };
      const opts = { method, headers };
      if(method === 'POST' || method === 'PUT') opts.body = body || '{}';
      const r = await fetch(path, opts);
      const t = await r.text();
      try{ show(JSON.parse(t)); }catch{ show(t); }
    }
    document.getElementById('btnHealth').onclick = () => call('GET', '/health');
    document.getElementById('btnPay').onclick = () => call('POST', '/payments', document.getElementById('payBody').value);
    document.getElementById('send').onclick = () => call(
      document.getElementById('method').value,
      document.getElementById('path').value,
      document.getElementById('body').value
    );
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});
