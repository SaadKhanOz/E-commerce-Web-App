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
