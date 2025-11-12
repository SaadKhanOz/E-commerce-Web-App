# E-Commerce Dashboard Guide

## Overview

A unified dashboard has been created that integrates all microservices, allowing you to interact with all services from a single interface. The dashboard provides:

- **Product Management**: View all products with search functionality
- **Inventory Management**: Check stock levels, view low stock alerts
- **Order Management**: View order history and search orders
- **Search Functionality**: Search products and orders in real-time
- **Analytics Dashboard**: View system statistics

## Features

### 1. **Service Cards**
Click on any service card to switch between different views:
- 📦 **Products**: View all products in a grid layout
- 📊 **Inventory**: View inventory levels in a table format with stock status
- 🛒 **Orders**: View order history (requires login)
- 🔍 **Search**: Search products and orders
- 📈 **Analytics**: View dashboard statistics

### 2. **Search Functionality**
- **Product Search**: Search products by name, description, category, or brand
- **Order Search**: Search orders by order number or product name (requires login)
- Select search type from dropdown and enter query

### 3. **Inventory View**
- Click the **Inventory** service card to view all inventory items
- See stock levels, available quantities, reserved quantities
- Color-coded status badges:
  - 🟢 **In Stock**: Available quantity > reorder level
  - 🟡 **Low Stock**: Available quantity ≤ reorder level
  - 🔴 **Out of Stock**: Available quantity = 0

### 4. **Statistics Dashboard**
- View real-time statistics at the top:
  - Total Products
  - Total Inventory Items
  - Total Orders
  - Low Stock Alerts

## How to Use

### Step 1: Start the Application

```bash
# Start all services with Docker Compose
docker compose up -d --build
```

### Step 2: Seed the Database

Before using the dashboard, you need to populate the database with dummy products and inventory:

```bash
# Install mongoose if not already installed
npm install mongoose

# Run the seeding script
node scripts/seed-products.js
```

This will create:
- 10 dummy products (headphones, watches, keyboards, etc.)
- Inventory records for each product
- Search indices for search functionality

### Step 3: Access the Dashboard

1. Open your browser and navigate to: **http://localhost/dashboard**
   - Or click "Dashboard" in the navigation menu

2. **View Products**:
   - Click the "Products" card
   - All products will be displayed in a grid
   - Each product shows name, category, brand, and price

3. **View Inventory**:
   - Click the "Inventory" card
   - See all inventory items in a table
   - Check stock levels and status

4. **Search Products**:
   - Enter a search query (e.g., "wireless", "keyboard")
   - Select "Products" from the dropdown
   - Click "Search" or press Enter
   - Results will be displayed

5. **Search Orders** (requires login):
   - First, register/login at http://localhost/login
   - Then use the search to find orders by order number or product name

## API Integration

The dashboard uses the API Gateway (`http://localhost:3000/api`) to communicate with all services:

- **Products**: `/api/products/products`
- **Inventory**: `/api/inventory/inventory`
- **Orders**: `/api/orders/orders`
- **Search**: `/api/search/search`
- **Analytics**: `/api/analytics/dashboard`

All requests automatically include authentication tokens when logged in.

## Database Structure

### Products Collection
- Stored in `product-db` (MongoDB on port 27018)
- Contains product details: name, description, price, category, brand, etc.

### Inventory Collection
- Stored in `inventory-db` (MongoDB on port 27019)
- Contains: productId, quantity, availableQuantity, reservedQuantity, reorderLevel

### Search Index
- Stored in `search-db` (MongoDB on port 27024)
- Contains searchable product data for fast queries

## Troubleshooting

### No Products Showing
- Make sure you've run the seeding script: `node scripts/seed-products.js`
- Check that product-service is running: `docker ps | grep product-service`
- Verify MongoDB connection: `docker ps | grep product-db`

### Inventory Not Loading
- Ensure inventory-service is running
- Check that inventory-db is accessible
- Verify you're logged in (some endpoints require authentication)

### Search Not Working
- Make sure search-service is running
- Verify search-db has been seeded with search indices
- Check browser console for API errors

## Next Steps for Kubernetes Deployment

The dashboard is ready for Kubernetes deployment. All services will be accessible through:
- **Frontend**: Exposed via Ingress
- **API Gateway**: Exposed via Ingress
- **Microservices**: Internal ClusterIP services
- **Databases**: StatefulSets with PersistentVolumeClaims

The dashboard will automatically work with Kubernetes once the services are deployed and accessible through the Ingress controller.



