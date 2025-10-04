# 🔧 Microservice Access Guide

## Overview
Your e-commerce platform has **12 microservices** running on different ports. Here's how to access each one:

## 📋 Service Ports & Endpoints

### 1. **User Service** (Port 3001) ✅ WORKING
- **Health Check**: `GET http://localhost:3001/health`
- **Register**: `POST http://localhost:3001/register`
- **Login**: `POST http://localhost:3001/login`
- **Verify Token**: `GET http://localhost:3001/verify`

**Example Registration:**
```bash
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. **Product Service** (Port 3002) ✅ WORKING
- **Health Check**: `GET http://localhost:3002/health`
- **Get Products**: `GET http://localhost:3002/products`
- **Get Product by ID**: `GET http://localhost:3002/products/:id`
- **Create Product**: `POST http://localhost:3002/products`
- **Update Product**: `PUT http://localhost:3002/products/:id`
- **Delete Product**: `DELETE http://localhost:3002/products/:id`

### 3. **Inventory Service** (Port 3003) ✅ WORKING
- **Health Check**: `GET http://localhost:3003/health`
- **Get Inventory**: `GET http://localhost:3003/inventory`
- **Update Stock**: `PUT http://localhost:3003/inventory/:productId`

### 4. **Order Service** (Port 3004) ✅ WORKING
- **Health Check**: `GET http://localhost:3004/health`
- **Get Orders**: `GET http://localhost:3004/orders`
- **Create Order**: `POST http://localhost:3004/orders`
- **Get Order by ID**: `GET http://localhost:3004/orders/:id`
- **Update Order Status**: `PUT http://localhost:3004/orders/:id/status`

### 5. **Payment Service** (Port 3005) ✅ WORKING
- **Health Check**: `GET http://localhost:3005/health`
- **Process Payment**: `POST http://localhost:3005/payments`
- **Get Payment**: `GET http://localhost:3005/payments/:id`
- **Refund Payment**: `POST http://localhost:3005/payments/:id/refund`

### 6. **Notification Service** (Port 3006) ✅ WORKING
- **Health Check**: `GET http://localhost:3006/health`
- **Send Notification**: `POST http://localhost:3006/notifications`
- **Get Notifications**: `GET http://localhost:3006/notifications/:userId`

### 7. **Review Service** (Port 3007) ✅ WORKING
- **Health Check**: `GET http://localhost:3007/health`
- **Get Reviews**: `GET http://localhost:3007/reviews`
- **Create Review**: `POST http://localhost:3007/reviews`
- **Update Review**: `PUT http://localhost:3007/reviews/:id`

### 8. **Search Service** (Port 3008) ✅ WORKING
- **Health Check**: `GET http://localhost:3008/health`
- **Search Products**: `GET http://localhost:3008/search?q=query`
- **Advanced Search**: `POST http://localhost:3008/search`

### 9. **Shipping Service** (Port 3009) ✅ WORKING
- **Health Check**: `GET http://localhost:3009/health`
- **Calculate Shipping**: `POST http://localhost:3009/shipping/calculate`
- **Create Shipment**: `POST http://localhost:3009/shipments`
- **Track Shipment**: `GET http://localhost:3009/shipments/:id/track`

### 10. **Analytics Service** (Port 3010) ✅ WORKING
- **Health Check**: `GET http://localhost:3010/health`
- **Get Analytics**: `GET http://localhost:3010/analytics`
- **Get Sales Data**: `GET http://localhost:3010/analytics/sales`
- **Get User Analytics**: `GET http://localhost:3010/analytics/users`

### 11. **API Gateway** (Port 3000) ⚠️ PARTIALLY WORKING
- **Health Check**: `GET http://localhost:3000/api/health`
- **User Routes**: `http://localhost:3000/api/users/*` (Currently not working)
- **Product Routes**: `http://localhost:3000/api/products/*`
- **Order Routes**: `http://localhost:3000/api/orders/*`
- **Payment Routes**: `http://localhost:3000/api/payments/*`

### 12. **Frontend** (Port 80) ✅ WORKING
- **Main App**: `http://localhost/`
- **Login Page**: `http://localhost/login`
- **Register Page**: `http://localhost/register`
- **Products Page**: `http://localhost/products`

## 🚀 How to Access Microservices

### Method 1: Direct API Calls (Recommended)
Use curl, Postman, or any HTTP client to call services directly:

```bash
# Test all services health
for port in 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010; do
  echo "Testing port $port:"
  curl -s http://localhost:$port/health
  echo ""
done
```

### Method 2: Through Frontend
The React frontend can call these services. Update the frontend code to use direct service URLs:

```javascript
// In your React components
const response = await fetch('http://localhost:3002/products');
const products = await response.json();
```

### Method 3: Through API Gateway (When Fixed)
Once the API Gateway routing is fixed, you can use:

```bash
# Through API Gateway
curl http://localhost:3000/api/products
curl http://localhost:3000/api/orders
```

## 🔧 Testing Commands

### Test All Services Health:
```bash
curl -s http://localhost:3001/health && echo " - User Service"
curl -s http://localhost:3002/health && echo " - Product Service"
curl -s http://localhost:3003/health && echo " - Inventory Service"
curl -s http://localhost:3004/health && echo " - Order Service"
curl -s http://localhost:3005/health && echo " - Payment Service"
```

### Test User Registration:
```bash
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Test Product Service:
```bash
curl http://localhost:3002/products
curl http://localhost:3002/categories
```

## 📱 Frontend Integration

To integrate microservices with your React frontend:

1. **Update API calls** in your components to use direct service URLs
2. **Add error handling** for service communication
3. **Implement loading states** for better UX
4. **Add authentication headers** where needed

Example:
```javascript
// In your React component
const fetchProducts = async () => {
  try {
    const response = await fetch('http://localhost:3002/products');
    const products = await response.json();
    setProducts(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
};
```

## 🐛 Troubleshooting

### If a service is not responding:
1. Check if the container is running: `docker-compose ps`
2. Check service logs: `docker-compose logs [service-name]`
3. Restart the service: `docker-compose restart [service-name]`
4. Check the service health endpoint

### Common Issues:
- **CORS errors**: Services have CORS enabled, but you might need to configure it for your frontend
- **Authentication**: Some endpoints require JWT tokens
- **Database connection**: Services need MongoDB to be running

## 🎯 Next Steps

1. **Test each service** individually using the health endpoints
2. **Add sample data** to services that return empty results
3. **Fix API Gateway routing** for unified access
4. **Update frontend** to use all services
5. **Add authentication** to protected endpoints

---

**Happy coding! 🚀**
