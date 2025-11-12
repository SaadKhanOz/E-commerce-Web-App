const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3009;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://shipping-db:27017/shippingdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Shipping Method Schema
const shippingMethodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  basePrice: { type: Number, required: true, min: 0 },
  freeShippingThreshold: { type: Number, default: 100 },
  estimatedDays: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  supportedRegions: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const ShippingMethod = mongoose.model('ShippingMethod', shippingMethodSchema);

// Shipment Schema
const shipmentSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  customerId: { type: String, required: true },
  shippingMethod: { type: String, required: true },
  trackingNumber: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'], 
    default: 'pending' 
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  weight: { type: Number, required: true },
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number }
  },
  cost: { type: Number, required: true },
  estimatedDelivery: { type: Date },
  actualDelivery: { type: Date },
  carrier: { type: String, default: 'Standard Shipping' },
  trackingEvents: [{
    status: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Shipment = mongoose.model('Shipment', shipmentSchema);

// Generate shipment ID
const generateShipmentId = () => {
  return 'SHIP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// Calculate shipping cost
const calculateShippingCost = (weight, distance, method) => {
  const baseCost = method.basePrice;
  const weightMultiplier = Math.ceil(weight / 1); // $1 per kg
  const distanceMultiplier = Math.ceil(distance / 100); // $1 per 100 miles
  
  return baseCost + (weightMultiplier * 1) + (distanceMultiplier * 1);
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'shipping-service', timestamp: new Date().toISOString() });
});

// Get shipping methods
app.get('/methods', async (req, res) => {
  try {
    const methods = await ShippingMethod.find({ isActive: true });
    res.json(methods);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Calculate shipping cost
app.post('/calculate', [
  body('weight').isNumeric().withMessage('Valid weight is required'),
  body('distance').isNumeric().withMessage('Valid distance is required'),
  body('methodId').notEmpty().withMessage('Shipping method ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { weight, distance, methodId, orderValue } = req.body;

    const method = await ShippingMethod.findById(methodId);
    if (!method) {
      return res.status(404).json({ message: 'Shipping method not found' });
    }

    let cost = calculateShippingCost(weight, distance, method);
    
    // Apply free shipping if order value exceeds threshold
    if (orderValue && orderValue >= method.freeShippingThreshold) {
      cost = 0;
    }

    res.json({
      method: method.name,
      cost,
      estimatedDays: method.estimatedDays,
      freeShippingEligible: orderValue && orderValue >= method.freeShippingThreshold
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create shipment
app.post('/shipments', [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('shippingMethod').notEmpty().withMessage('Shipping method is required'),
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('weight').isNumeric().withMessage('Valid weight is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, customerId, shippingMethod, shippingAddress, weight, dimensions } = req.body;

    const method = await ShippingMethod.findOne({ name: shippingMethod });
    if (!method) {
      return res.status(404).json({ message: 'Shipping method not found' });
    }

    const cost = calculateShippingCost(weight, 100, method); // Default distance
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + method.estimatedDays);

    const shipment = new Shipment({
      shipmentId: generateShipmentId(),
      orderId,
      customerId,
      shippingMethod,
      shippingAddress,
      weight,
      dimensions,
      cost,
      estimatedDelivery,
      trackingNumber: 'TRK' + Date.now()
    });

    await shipment.save();

    res.status(201).json({ message: 'Shipment created successfully', shipment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get shipment by ID
app.get('/shipments/:id', async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ shipmentId: req.params.id });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get shipments by order
app.get('/shipments/order/:orderId', async (req, res) => {
  try {
    const shipments = await Shipment.find({ orderId: req.params.orderId });
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update shipment status
app.put('/shipments/:id/status', [
  body('status').isIn(['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'])
    .withMessage('Valid status is required'),
  body('description').notEmpty().withMessage('Status description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, description, location } = req.body;

    const shipment = await Shipment.findOneAndUpdate(
      { shipmentId: req.params.id },
      {
        status,
        updatedAt: new Date(),
        $push: {
          trackingEvents: {
            status,
            description,
            location
          }
        }
      },
      { new: true }
    );

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    // Update actual delivery date if delivered
    if (status === 'delivered') {
      shipment.actualDelivery = new Date();
      await shipment.save();
    }

    res.json({ message: 'Shipment status updated successfully', shipment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Track shipment
app.get('/track/:trackingNumber', async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingNumber: req.params.trackingNumber });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    res.json({
      shipmentId: shipment.shipmentId,
      status: shipment.status,
      trackingEvents: shipment.trackingEvents,
      estimatedDelivery: shipment.estimatedDelivery,
      actualDelivery: shipment.actualDelivery
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get shipping statistics
app.get('/stats', async (req, res) => {
  try {
    const stats = await Shipment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalShipments = await Shipment.countDocuments();
    const totalRevenue = await Shipment.aggregate([
      { $group: { _id: null, total: { $sum: '$cost' } } }
    ]);

    res.json({
      statusBreakdown: stats,
      totalShipments,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create shipping method (admin)
app.post('/methods', [
  body('name').notEmpty().withMessage('Method name is required'),
  body('basePrice').isNumeric().withMessage('Valid base price is required'),
  body('estimatedDays').isInt().withMessage('Valid estimated days is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const method = new ShippingMethod(req.body);
    await method.save();

    res.status(201).json({ message: 'Shipping method created successfully', method });
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
  <title>Shipping Service UI</title>
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
    <h1>Shipping Service</h1>
    <div class="card">
      <h2>Quick Health</h2>
      <button id="btnHealth">GET /health</button>
      <button id="btnMethods">GET /methods</button>
    </div>
    <div class="card">
      <h2>Calculate Cost</h2>
      <textarea id="calcBody" rows="10">{ "weight": 2, "distance": 300, "methodId": "" }</textarea>
      <button id="btnCalc">POST /calculate</button>
    </div>
    <div class="card">
      <h2>Generic Request</h2>
      <label>Method</label>
      <select id="method"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option></select>
      <label>Path</label>
      <input id="path" value="/methods" />
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
    document.getElementById('btnMethods').onclick = () => call('GET', '/methods');
    document.getElementById('btnCalc').onclick = () => call('POST', '/calculate', document.getElementById('calcBody').value);
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
  console.log(`Shipping service running on port ${PORT}`);
});
