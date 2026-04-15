const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://analytics-db:27017/analyticsdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Analytics Event Schema
const analyticsEventSchema = new mongoose.Schema({
  eventType: { type: String, required: true },
  userId: { type: String },
  sessionId: { type: String },
  productId: { type: String },
  category: { type: String },
  value: { type: Number },
  metadata: { type: Object },
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String },
  userAgent: { type: String }
});

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);

// Daily Stats Schema
const dailyStatsSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  totalUsers: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  totalProducts: { type: Number, default: 0 },
  pageViews: { type: Number, default: 0 },
  uniqueVisitors: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
  averageOrderValue: { type: Number, default: 0 },
  topProducts: [{ productId: String, sales: Number }],
  topCategories: [{ category: String, sales: Number }],
  createdAt: { type: Date, default: Date.now }
});

const DailyStats = mongoose.model('DailyStats', dailyStatsSchema);

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'analytics-service', timestamp: new Date().toISOString() });
});

// Track event
app.post('/events', [
  body('eventType').notEmpty().withMessage('Event type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = new AnalyticsEvent({
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await event.save();

    res.status(201).json({ message: 'Event tracked successfully', eventId: event._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get dashboard stats
app.get('/dashboard', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    let startDate = new Date();
    
    switch (period) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    // Get basic stats
    const totalUsers = await AnalyticsEvent.distinct('userId', {
      timestamp: { $gte: startDate }
    }).then(users => users.length);

    const totalOrders = await AnalyticsEvent.countDocuments({
      eventType: 'order_placed',
      timestamp: { $gte: startDate }
    });

    const totalRevenue = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: 'order_placed',
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$value' }
        }
      }
    ]);

    const pageViews = await AnalyticsEvent.countDocuments({
      eventType: 'page_view',
      timestamp: { $gte: startDate }
    });

    const uniqueVisitors = await AnalyticsEvent.distinct('userId', {
      eventType: 'page_view',
      timestamp: { $gte: startDate }
    }).then(visitors => visitors.length);

    const conversionRate = uniqueVisitors > 0 ? (totalOrders / uniqueVisitors) * 100 : 0;
    const averageOrderValue = totalOrders > 0 ? (totalRevenue[0]?.total || 0) / totalOrders : 0;

    // Get top products
    const topProducts = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: 'product_purchased',
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$productId',
          sales: { $sum: 1 }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 10 }
    ]);

    // Get top categories
    const topCategories = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: 'product_purchased',
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$category',
          sales: { $sum: 1 }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      period,
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      pageViews,
      uniqueVisitors,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      topProducts,
      topCategories
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get sales analytics
app.get('/sales', async (req, res) => {
  try {
    const { period = '30d', groupBy = 'day' } = req.query;
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    let groupFormat;
    switch (groupBy) {
      case 'hour':
        groupFormat = { $dateToString: { format: '%Y-%m-%d %H:00', date: '$timestamp' } };
        break;
      case 'day':
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } };
        break;
      case 'week':
        groupFormat = { $dateToString: { format: '%Y-W%U', date: '$timestamp' } };
        break;
      case 'month':
        groupFormat = { $dateToString: { format: '%Y-%m', date: '$timestamp' } };
        break;
    }

    const salesData = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: 'order_placed',
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupFormat,
          orders: { $sum: 1 },
          revenue: { $sum: '$value' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ salesData, period, groupBy });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user analytics
app.get('/users', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period.replace('d', '')));

    const userStats = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalEvents: { $sum: 1 },
          lastActivity: { $max: '$timestamp' },
          firstActivity: { $min: '$timestamp' },
          eventTypes: { $addToSet: '$eventType' }
        }
      },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: {
              $cond: [
                { $gte: ['$lastActivity', new Date(Date.now() - 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          },
          newUsers: {
            $sum: {
              $cond: [
                { $gte: ['$firstActivity', startDate] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    res.json({ userStats: userStats[0] || { totalUsers: 0, activeUsers: 0, newUsers: 0 } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get product analytics
app.get('/products', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period.replace('d', '')));

    const productStats = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: { $in: ['product_viewed', 'product_purchased', 'product_added_to_cart'] },
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$productId',
          views: {
            $sum: {
              $cond: [{ $eq: ['$eventType', 'product_viewed'] }, 1, 0]
            }
          },
          purchases: {
            $sum: {
              $cond: [{ $eq: ['$eventType', 'product_purchased'] }, 1, 0]
            }
          },
          cartAdds: {
            $sum: {
              $cond: [{ $eq: ['$eventType', 'product_added_to_cart'] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          conversionRate: {
            $cond: [
              { $gt: ['$views', 0] },
              { $multiply: [{ $divide: ['$purchases', '$views'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { purchases: -1 } },
      { $limit: 20 }
    ]);

    res.json({ productStats, period });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get real-time stats
app.get('/realtime', async (req, res) => {
  try {
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);

    const realtimeStats = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: lastHour }
        }
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      }
    ]);

    const activeUsers = await AnalyticsEvent.distinct('userId', {
      timestamp: { $gte: lastHour }
    }).then(users => users.length);

    res.json({
      activeUsers,
      eventsLastHour: realtimeStats,
      timestamp: new Date()
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
  <title>Analytics Service UI</title>
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
    <h1>Analytics Service</h1>
    <div class="card">
      <h2>Quick Health</h2>
      <button id="btnHealth">GET /health</button>
    </div>
    <div class="card">
      <h2>Track Event</h2>
      <textarea id="evtBody" rows="10">{ "eventType": "page_view", "userId": "u1", "value": 1 }</textarea>
      <button id="btnTrack">POST /events</button>
    </div>
    <div class="card">
      <h2>Generic Request</h2>
      <label>Method</label>
      <select id="method"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option></select>
      <label>Path</label>
      <input id="path" value="/dashboard?period=7d" />
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
    document.getElementById('btnTrack').onclick = () => call('POST', '/events', document.getElementById('evtBody').value);
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
  console.log(`Analytics service running on port ${PORT}`);
});
