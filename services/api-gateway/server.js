const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Service URLs
const services = {
  user: 'http://user-service:3001',
  product: 'http://product-service:3002',
  inventory: 'http://inventory-service:3003',
  order: 'http://order-service:3004',
  payment: 'http://payment-service:3005',
  notification: 'http://notification-service:3006',
  review: 'http://review-service:3007',
  search: 'http://search-service:3008',
  shipping: 'http://shipping-service:3009',
  analytics: 'http://analytics-service:3010'
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Optional authentication middleware
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'api-gateway', 
    timestamp: new Date().toISOString(),
    services: Object.keys(services)
  });
});

// User Service Routes
app.use('/api/users', createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  pathRewrite: { '^/api/users': '' }
}));

// Product Service Routes
app.use('/api/products', optionalAuth, createProxyMiddleware({
  target: services.product,
  changeOrigin: true,
  pathRewrite: { '^/api/products': '' }
}));

// Inventory Service Routes
app.use('/api/inventory', authenticateToken, createProxyMiddleware({
  target: services.inventory,
  changeOrigin: true,
  pathRewrite: { '^/api/inventory': '' }
}));

// Order Service Routes
app.use('/api/orders', authenticateToken, createProxyMiddleware({
  target: services.order,
  changeOrigin: true,
  pathRewrite: { '^/api/orders': '' }
}));

// Payment Service Routes
app.use('/api/payments', authenticateToken, createProxyMiddleware({
  target: services.payment,
  changeOrigin: true,
  pathRewrite: { '^/api/payments': '' }
}));

// Notification Service Routes
app.use('/api/notifications', authenticateToken, createProxyMiddleware({
  target: services.notification,
  changeOrigin: true,
  pathRewrite: { '^/api/notifications': '' }
}));

// Review Service Routes
app.use('/api/reviews', optionalAuth, createProxyMiddleware({
  target: services.review,
  changeOrigin: true,
  pathRewrite: { '^/api/reviews': '' }
}));

// Search Service Routes
app.use('/api/search', optionalAuth, createProxyMiddleware({
  target: services.search,
  changeOrigin: true,
  pathRewrite: { '^/api/search': '' }
}));

// Shipping Service Routes
app.use('/api/shipping', authenticateToken, createProxyMiddleware({
  target: services.shipping,
  changeOrigin: true,
  pathRewrite: { '^/api/shipping': '' }
}));

// Analytics Service Routes
app.use('/api/analytics', authenticateToken, createProxyMiddleware({
  target: services.analytics,
  changeOrigin: true,
  pathRewrite: { '^/api/analytics': '' }
}));

// Service Health Check Endpoint
app.get('/api/health', async (req, res) => {
  const healthChecks = {};
  
  for (const [serviceName, serviceUrl] of Object.entries(services)) {
    try {
      const response = await fetch(`${serviceUrl}/health`);
      const data = await response.json();
      healthChecks[serviceName] = {
        status: 'healthy',
        data
      };
    } catch (error) {
      healthChecks[serviceName] = {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  res.json({
    gateway: 'healthy',
    timestamp: new Date().toISOString(),
    services: healthChecks
  });
});

// Simple UI Dashboard
app.get('/', (req, res) => {
  const serviceLinks = Object.entries(services).map(
    ([name], idx) => `<li><a href="http://localhost:${3001 + idx}" target="_blank">${name}-service (port ${3001 + idx})</a></li>`
  ).join('');
  res.send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>E-Commerce API Gateway</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; margin: 0; padding: 2rem; line-height: 1.5; }
    .container { max-width: 1000px; margin: 0 auto; }
    h1 { margin-top: 0; }
    .grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
    @media (min-width: 900px) { .grid { grid-template-columns: 2fr 1fr; } }
    .card { border: 1px solid #4443; border-radius: 12px; padding: 1rem; }
    button { padding: .6rem 1rem; border-radius: 8px; border: 1px solid #4443; cursor: pointer; }
    input, select, textarea { width: 100%; box-sizing: border-box; padding: .6rem .7rem; border-radius: 8px; border: 1px solid #4443; font-family: inherit; }
    label { font-weight: 600; display: block; margin: .6rem 0 .3rem; }
    pre { background: #00000008; border-radius: 8px; padding: 1rem; overflow: auto; max-height: 45vh; }
    ul { margin: .4rem 0 .8rem; padding-left: 1.2rem; }
    .muted { opacity: .8; }
    .row { display: flex; gap: .6rem; align-items: center; }
  </style>
  </head>
  <body>
    <div class="container">
      <h1>API Gateway UI</h1>
      <p class="muted">Use this page to query the gateway and jump to each service UI.</p>
      <div class="grid">
        <div class="card">
          <h2>Try Gateway Request</h2>
          <div class="row">
            <label for="method">Method</label>
            <select id="method">
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>DELETE</option>
            </select>
          </div>
          <label for="path">Path (relative to gateway)</label>
          <input id="path" value="/api/health" />
          <label for="token">Bearer Token (optional)</label>
          <input id="token" placeholder="ey..." />
          <label for="body">JSON Body (for POST/PUT)</label>
          <textarea id="body" rows="6">{}</textarea>
          <div class="row" style="margin-top:.7rem;">
            <button id="send">Send</button>
            <button id="health">Check /api/health</button>
          </div>
          <h3>Response</h3>
          <pre id="output"></pre>
        </div>
        <div class="card">
          <h2>Service UIs</h2>
          <ul>${serviceLinks}</ul>
          <p class="muted">Each service exposes a minimal UI at its root, e.g. http://localhost:3001/</p>
        </div>
      </div>
    </div>
    <script>
      const out = document.getElementById('output');
      const send = document.getElementById('send');
      const methodEl = document.getElementById('method');
      const pathEl = document.getElementById('path');
      const tokenEl = document.getElementById('token');
      const bodyEl = document.getElementById('body');
      const healthBtn = document.getElementById('health');
      
      async function doFetch(m, p, t, b) {
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (t) headers['Authorization'] = 'Bearer ' + t;
          const opts = { method: m, headers };
          if (m === 'POST' || m === 'PUT') opts.body = b || '{}';
          const resp = await fetch(p, opts);
          const text = await resp.text();
          try {
            out.textContent = JSON.stringify(JSON.parse(text), null, 2);
          } catch {
            out.textContent = text;
          }
        } catch (e) {
          out.textContent = 'Error: ' + e.message;
        }
      }
      send.addEventListener('click', () => doFetch(methodEl.value, pathEl.value, tokenEl.value.trim(), bodyEl.value));
      healthBtn.addEventListener('click', () => doFetch('GET', '/api/health', tokenEl.value.trim()));
    </script>
  </body>
</html>`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Gateway Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
