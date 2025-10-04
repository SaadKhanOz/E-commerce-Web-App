# E-Commerce Microservices Platform

A comprehensive e-commerce platform built with microservices architecture using MERN stack and Docker.

## Architecture Overview

This project consists of **12 microservices** with **10 MongoDB databases**, providing a complete e-commerce solution:

### Microservices Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   User Service  │
│   (React)       │◄──►│   (Port 3000)   │◄──►│   (Port 3001)   │
│   (Port 80)     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼───────┐ ┌─────▼─────┐ ┌──────▼──────┐
        │Product Service│ │Inventory  │ │Order Service│
        │(Port 3002)    │ │Service    │ │(Port 3004)  │
        │               │ │(Port 3003)│ │             │
        └───────────────┘ └───────────┘ └─────────────┘
                │               │               │
        ┌───────▼───────┐ ┌─────▼─────┐ ┌──────▼──────┐
        │Payment Service│ │Notification│ │Review Service│
        │(Port 3005)    │ │Service    │ │(Port 3007)  │
        │               │ │(Port 3006)│ │             │
        └───────────────┘ └───────────┘ └─────────────┘
                │               │               │
        ┌───────▼───────┐ ┌─────▼─────┐ ┌──────▼──────┐
        │Search Service │ │Shipping   │ │Analytics   │
        │(Port 3008)    │ │Service    │ │Service     │
        │               │ │(Port 3009)│ │(Port 3010)  │
        └───────────────┘ └───────────┘ └─────────────┘
```

### Services Description

1. **User Service** (Port 3001) - User authentication, registration, profile management
2. **Product Service** (Port 3002) - Product catalog, categories, specifications
3. **Inventory Service** (Port 3003) - Stock management, availability tracking
4. **Order Service** (Port 3004) - Order processing, order history
5. **Payment Service** (Port 3005) - Payment processing, transactions
6. **Notification Service** (Port 3006) - Email, SMS, push notifications
7. **Review Service** (Port 3007) - Product reviews, ratings, feedback
8. **Search Service** (Port 3008) - Product search, recommendations
9. **Shipping Service** (Port 3009) - Shipping calculations, tracking
10. **Analytics Service** (Port 3010) - Business intelligence, reporting
11. **API Gateway** (Port 3000) - Request routing, authentication
12. **Frontend App** (Port 80) - React-based user interface

### Database Architecture

Each microservice has its own MongoDB database:
- `user-db` (Port 27017) - User data
- `product-db` (Port 27018) - Product catalog
- `inventory-db` (Port 27019) - Inventory data
- `order-db` (Port 27020) - Order data
- `payment-db` (Port 27021) - Payment data
- `notification-db` (Port 27022) - Notification data
- `review-db` (Port 27023) - Review data
- `search-db` (Port 27024) - Search index
- `shipping-db` (Port 27025) - Shipping data
- `analytics-db` (Port 27026) - Analytics data

## Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB (10 instances)
- **Frontend**: React.js + Nginx
- **Containerization**: Docker + Docker Compose
- **Communication**: REST APIs
- **Authentication**: JWT tokens
- **API Gateway**: Request routing and load balancing

## Features

### User Management
- User registration and authentication
- Profile management
- Role-based access control (Customer, Admin, Seller)

### Product Management
- Product catalog with categories
- Product search and filtering
- Product reviews and ratings
- Inventory tracking

### Order Management
- Shopping cart functionality
- Order processing
- Order tracking
- Order history

### Payment Processing
- Multiple payment methods
- Payment verification
- Refund processing
- Transaction history

### Shipping & Logistics
- Shipping cost calculation
- Order tracking
- Delivery status updates
- Multiple shipping methods

### Analytics & Reporting
- Sales analytics
- User behavior tracking
- Product performance metrics
- Real-time dashboards

### Notifications
- Email notifications
- SMS alerts
- Push notifications
- In-app notifications

## Getting Started

### Prerequisites
- Docker
- Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd e-commerce
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost
   - API Gateway: http://localhost:3000
   - Individual services: http://localhost:3001-3010

### Service Health Checks

Check if all services are running:
```bash
curl http://localhost:3000/api/health
```

### Individual Service Health Checks

```bash
# User Service
curl http://localhost:3001/health

# Product Service
curl http://localhost:3002/health

# Inventory Service
curl http://localhost:3003/health

# Order Service
curl http://localhost:3004/health

# Payment Service
curl http://localhost:3005/health

# Notification Service
curl http://localhost:3006/health

# Review Service
curl http://localhost:3007/health

# Search Service
curl http://localhost:3008/health

# Shipping Service
curl http://localhost:3009/health

# Analytics Service
curl http://localhost:3010/health
```

## API Endpoints

### User Service
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Product Service
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `GET /api/categories` - Get categories

### Order Service
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/customer/:customerId` - Get customer orders

### Payment Service
- `POST /api/payments` - Process payment
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments/:id/refund` - Process refund

## Project Structure

```
e-commerce/
├── services/
│   ├── user-service/
│   │   ├── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── product-service/
│   │   ├── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── inventory-service/
│   │   ├── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── order-service/
│   │   ├── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── payment-service/
│   │   ├── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── notification-service/
│   │   ├── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── review-service/
│   │   ├── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── search-service/
│   │   ├── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── shipping-service/
│   │   ├── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── analytics-service/
│   │   ├── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   └── api-gateway/
│       ├── server.js
│       ├── package.json
│       └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── App.js
│   ├── public/
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## Development

### Running Individual Services

To run a specific service in development mode:

```bash
cd services/user-service
npm install
npm run dev
```

### Environment Variables

Each service uses environment variables for configuration. Key variables include:
- `PORT` - Service port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key

## Monitoring and Logs

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs user-service
```

### Container Status
```bash
docker-compose ps
```

## Scaling

The microservices architecture allows for independent scaling:

```bash
# Scale specific service
docker-compose up --scale user-service=3
```

## Security Considerations

- JWT tokens for authentication
- Input validation on all endpoints
- CORS configuration
- Environment variable management
- Database isolation per service

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.