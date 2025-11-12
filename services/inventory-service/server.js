const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://inventory-db:27017/inventorydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Inventory Schema
const inventorySchema = new mongoose.Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  reservedQuantity: { type: Number, default: 0, min: 0 },
  availableQuantity: { type: Number, required: true, min: 0 },
  reorderLevel: { type: Number, default: 10 },
  maxStock: { type: Number, default: 1000 },
  location: { type: String, default: 'warehouse' },
  lastUpdated: { type: Date, default: Date.now }
});

const Inventory = mongoose.model('Inventory', inventorySchema);

// Stock Movement Schema
const stockMovementSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  type: { type: String, enum: ['in', 'out', 'adjustment'], required: true },
  quantity: { type: Number, required: true },
  reason: { type: String, required: true },
  reference: { type: String }, // Order ID, Purchase ID, etc.
  timestamp: { type: Date, default: Date.now },
  userId: { type: String }
});

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'inventory-service', timestamp: new Date().toISOString() });
});

// Get inventory for a product
app.get('/inventory/:productId', async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ productId: req.params.productId });
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found for this product' });
    }
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all inventory
app.get('/inventory', async (req, res) => {
  try {
    const { page = 1, limit = 10, lowStock = false } = req.query;
    let query = {};

    if (lowStock === 'true') {
      query.availableQuantity = { $lte: 10 };
    }

    const inventory = await Inventory.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ lastUpdated: -1 });

    const total = await Inventory.countDocuments(query);

    res.json({
      inventory,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create/Update inventory
app.post('/inventory', [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isNumeric().withMessage('Valid quantity is required'),
  body('reorderLevel').optional().isNumeric().withMessage('Valid reorder level is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity, reorderLevel = 10, maxStock = 1000, location = 'warehouse' } = req.body;

    const inventory = await Inventory.findOneAndUpdate(
      { productId },
      {
        productId,
        quantity,
        availableQuantity: quantity,
        reorderLevel,
        maxStock,
        location,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    // Log stock movement
    const stockMovement = new StockMovement({
      productId,
      type: 'in',
      quantity,
      reason: 'Initial stock or stock update',
      userId: req.body.userId
    });
    await stockMovement.save();

    res.status(201).json({ message: 'Inventory updated successfully', inventory });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reserve stock
app.post('/inventory/reserve', [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isNumeric().withMessage('Valid quantity is required'),
  body('orderId').notEmpty().withMessage('Order ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity, orderId } = req.body;

    const inventory = await Inventory.findOne({ productId });
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found for this product' });
    }

    if (inventory.availableQuantity < quantity) {
      return res.status(400).json({ 
        message: 'Insufficient stock', 
        available: inventory.availableQuantity,
        requested: quantity 
      });
    }

    inventory.reservedQuantity += quantity;
    inventory.availableQuantity -= quantity;
    inventory.lastUpdated = new Date();
    await inventory.save();

    // Log stock movement
    const stockMovement = new StockMovement({
      productId,
      type: 'out',
      quantity,
      reason: 'Stock reserved for order',
      reference: orderId
    });
    await stockMovement.save();

    res.json({ message: 'Stock reserved successfully', inventory });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Release reserved stock
app.post('/inventory/release', [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isNumeric().withMessage('Valid quantity is required'),
  body('orderId').notEmpty().withMessage('Order ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity, orderId } = req.body;

    const inventory = await Inventory.findOne({ productId });
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found for this product' });
    }

    if (inventory.reservedQuantity < quantity) {
      return res.status(400).json({ 
        message: 'Cannot release more than reserved', 
        reserved: inventory.reservedQuantity,
        requested: quantity 
      });
    }

    inventory.reservedQuantity -= quantity;
    inventory.availableQuantity += quantity;
    inventory.lastUpdated = new Date();
    await inventory.save();

    // Log stock movement
    const stockMovement = new StockMovement({
      productId,
      type: 'in',
      quantity,
      reason: 'Reserved stock released',
      reference: orderId
    });
    await stockMovement.save();

    res.json({ message: 'Stock released successfully', inventory });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Adjust stock
app.post('/inventory/adjust', [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isNumeric().withMessage('Valid quantity is required'),
  body('reason').notEmpty().withMessage('Reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity, reason, userId } = req.body;

    const inventory = await Inventory.findOne({ productId });
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found for this product' });
    }

    const newQuantity = inventory.quantity + quantity;
    if (newQuantity < 0) {
      return res.status(400).json({ message: 'Cannot adjust stock below zero' });
    }

    inventory.quantity = newQuantity;
    inventory.availableQuantity = newQuantity - inventory.reservedQuantity;
    inventory.lastUpdated = new Date();
    await inventory.save();

    // Log stock movement
    const stockMovement = new StockMovement({
      productId,
      type: quantity > 0 ? 'in' : 'out',
      quantity: Math.abs(quantity),
      reason,
      userId
    });
    await stockMovement.save();

    res.json({ message: 'Stock adjusted successfully', inventory });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get stock movements
app.get('/movements/:productId', async (req, res) => {
  try {
    const movements = await StockMovement.find({ productId })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get low stock alerts
app.get('/alerts/low-stock', async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      availableQuantity: { $lte: '$reorderLevel' }
    });
    res.json(lowStockItems);
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
  <title>Inventory Service UI</title>
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
    <h1>Inventory Service</h1>
    <div class="card">
      <h2>Quick Health</h2>
      <button id="btnHealth">GET /health</button>
      <button id="btnList">GET /inventory</button>
    </div>
    <div class="card">
      <h2>Upsert Inventory</h2>
      <textarea id="invBody" rows="10">{ "productId": "p1", "quantity": 100, "reorderLevel": 10 }</textarea>
      <button id="btnUpsert">POST /inventory</button>
    </div>
    <div class="card">
      <h2>Generic Request</h2>
      <label>Method</label>
      <select id="method"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option></select>
      <label>Path</label>
      <input id="path" value="/inventory" />
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
    document.getElementById('btnList').onclick = () => call('GET', '/inventory');
    document.getElementById('btnUpsert').onclick = () => call('POST', '/inventory', document.getElementById('invBody').value);
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
  console.log(`Inventory service running on port ${PORT}`);
});
