# Database Seeding Scripts

## Seed Products and Inventory

This script populates the database with dummy products, inventory records, and search indices.

### Prerequisites

1. Make sure all services are running (via Docker Compose)
2. MongoDB instances should be accessible on their respective ports

### Usage

```bash
# Install dependencies if not already installed
npm install mongoose

# Run the seeding script
node scripts/seed-products.js
```

### What it does

1. **Clears existing data** from:
   - Products collection (product-db)
   - Inventory collection (inventory-db)
   - Search indices (search-db)

2. **Inserts 10 dummy products** including:
   - Wireless Bluetooth Headphones
   - Smart Fitness Watch
   - Laptop Backpack
   - Wireless Mouse
   - USB-C Cable
   - Mechanical Keyboard
   - Phone Case
   - Portable Power Bank
   - Desk Lamp
   - Webcam HD

3. **Creates inventory records** for each product with:
   - Random stock quantities (10-500 units)
   - Reorder levels set to 15
   - Location set to 'warehouse'

4. **Creates search indices** for each product to enable search functionality

### Database Connections

The script connects to:
- Product DB: `mongodb://localhost:27018/productdb`
- Inventory DB: `mongodb://localhost:27019/inventorydb` (with auth)
- Search DB: `mongodb://localhost:27024/searchdb` (with auth)

### Notes

- The script uses direct MongoDB connections (not through the API)
- Some databases require authentication (admin/password)
- Make sure MongoDB containers are running before executing the script

