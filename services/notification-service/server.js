const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://notification-db:27017/notificationdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['email', 'sms', 'push', 'in_app'], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'failed', 'delivered'], 
    default: 'pending' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  metadata: { type: Object },
  sentAt: { type: Date },
  deliveredAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

// Simulate sending notification
const sendNotification = async (notification) => {
  // Simulate sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate 95% success rate
  const isSuccess = Math.random() > 0.05;
  
  notification.status = isSuccess ? 'sent' : 'failed';
  notification.sentAt = new Date();
  await notification.save();
  
  return isSuccess;
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'notification-service', timestamp: new Date().toISOString() });
});

// Send notification
app.post('/notifications', [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('type').isIn(['email', 'sms', 'push', 'in_app']).withMessage('Valid notification type is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, type, title, message, priority = 'medium', metadata } = req.body;

    const notification = new Notification({
      userId,
      type,
      title,
      message,
      priority,
      metadata
    });

    await notification.save();

    // Send notification asynchronously
    sendNotification(notification);

    res.status(201).json({ 
      message: 'Notification queued successfully', 
      notification: {
        id: notification._id,
        status: notification.status,
        type: notification.type
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get notifications by user
app.get('/notifications/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    let query = { userId: req.params.userId };
    
    if (type) query.type = type;
    if (status) query.status = status;

    const notifications = await Notification.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all notifications
app.get('/notifications', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, priority } = req.query;
    let query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const notifications = await Notification.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark notification as delivered
app.put('/notifications/:id/delivered', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'delivered', 
        deliveredAt: new Date() 
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as delivered', notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get notification statistics
app.get('/notifications/stats', async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalNotifications = await Notification.countDocuments();

    res.json({
      statusBreakdown: stats,
      typeBreakdown: typeStats,
      totalNotifications
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
  <title>Notification Service UI</title>
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
    <h1>Notification Service</h1>
    <div class="card">
      <h2>Quick Health</h2>
      <button id="btnHealth">GET /health</button>
    </div>
    <div class="card">
      <h2>Send Notification</h2>
      <textarea id="notifBody" rows="12">{ "userId": "user-1", "type": "email", "title": "Hello", "message": "Your order shipped!", "priority": "medium" }</textarea>
      <button id="btnSend">POST /notifications</button>
    </div>
    <div class="card">
      <h2>Generic Request</h2>
      <label>Method</label>
      <select id="method"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option></select>
      <label>Path</label>
      <input id="path" value="/notifications" />
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
    document.getElementById('btnSend').onclick = () => call('POST', '/notifications', document.getElementById('notifBody').value);
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
  console.log(`Notification service running on port ${PORT}`);
});
