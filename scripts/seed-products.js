// Database Seeding Script for Products and Inventory
// Run this script to populate dummy products and inventory data
// Usage: node scripts/seed-products.js

const mongoose = require('mongoose');

// Product Service Connection
const productDb = mongoose.createConnection('mongodb://localhost:27018/productdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Inventory Service Connection
const inventoryDb = mongoose.createConnection('mongodb://localhost:27019/inventorydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: 'admin',
  user: 'admin',
  pass: 'password'
});

// Search Service Connection
const searchDb = mongoose.createConnection('mongodb://localhost:27024/searchdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: 'admin',
  user: 'admin',
  pass: 'password'
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  brand: String,
  images: [String],
  specifications: {
    weight: String,
    dimensions: String,
    color: String,
    material: String,
    warranty: String
  },
  tags: [String],
  isActive: Boolean,
  sellerId: String,
  createdAt: Date,
  updatedAt: Date
}, { collection: 'products' });

// Inventory Schema
const inventorySchema = new mongoose.Schema({
  productId: String,
  quantity: Number,
  reservedQuantity: Number,
  availableQuantity: Number,
  reorderLevel: Number,
  maxStock: Number,
  location: String,
  lastUpdated: Date
}, { collection: 'inventories' });

// Search Index Schema
const searchIndexSchema = new mongoose.Schema({
  productId: String,
  name: String,
  description: String,
  category: String,
  brand: String,
  price: Number,
  tags: [String],
  keywords: [String],
  rating: Number,
  reviewCount: Number,
  isActive: Boolean,
  lastUpdated: Date
}, { collection: 'searchindices' });

const Product = productDb.model('Product', productSchema);
const Inventory = inventoryDb.model('Inventory', inventorySchema);
const SearchIndex = searchDb.model('SearchIndex', searchIndexSchema);

// Dummy Products Data
const dummyProducts = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
    price: 199.99,
    category: 'Electronics',
    brand: 'TechSound',
    images: ['https://via.placeholder.com/300'],
    specifications: {
      weight: '250g',
      dimensions: '20x18x8cm',
      color: 'Black',
      material: 'Plastic, Metal',
      warranty: '2 years'
    },
    tags: ['wireless', 'bluetooth', 'headphones', 'audio'],
    isActive: true,
    sellerId: 'seller001',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Track your health and fitness with this advanced smartwatch',
    price: 299.99,
    category: 'Electronics',
    brand: 'FitTech',
    images: ['https://via.placeholder.com/300'],
    specifications: {
      weight: '45g',
      dimensions: '4x4x1cm',
      color: 'Silver',
      material: 'Aluminum, Silicone',
      warranty: '1 year'
    },
    tags: ['smartwatch', 'fitness', 'health', 'wearable'],
    isActive: true,
    sellerId: 'seller001',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Laptop Backpack',
    description: 'Durable laptop backpack with multiple compartments',
    price: 49.99,
    category: 'Accessories',
    brand: 'TravelPro',
    images: ['https://via.placeholder.com/300'],
    specifications: {
      weight: '800g',
      dimensions: '45x30x15cm',
      color: 'Navy Blue',
      material: 'Nylon',
      warranty: '1 year'
    },
    tags: ['backpack', 'laptop', 'travel', 'bag'],
    isActive: true,
    sellerId: 'seller002',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking',
    price: 29.99,
    category: 'Electronics',
    brand: 'TechMouse',
    images: ['https://via.placeholder.com/300'],
    specifications: {
      weight: '85g',
      dimensions: '12x6x4cm',
      color: 'Black',
      material: 'Plastic',
      warranty: '1 year'
    },
    tags: ['mouse', 'wireless', 'computer', 'accessories'],
    isActive: true,
    sellerId: 'seller002',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'USB-C Cable',
    description: 'Fast charging USB-C cable, 2 meters long',
    price: 12.99,
    category: 'Accessories',
    brand: 'CablePro',
    images: ['https://via.placeholder.com/300'],
    specifications: {
      weight: '50g',
      dimensions: '200cm length',
      color: 'Black',
      material: 'Nylon braided',
      warranty: '6 months'
    },
    tags: ['cable', 'usb-c', 'charging', 'accessories'],
    isActive: true,
    sellerId: 'seller003',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Mechanical Keyboard',
    description: 'RGB backlit mechanical keyboard with blue switches',
    price: 89.99,
    category: 'Electronics',
    brand: 'KeyTech',
    images: ['https://via.placeholder.com/300'],
    specifications: {
      weight: '1.2kg',
      dimensions: '44x13x4cm',
      color: 'Black',
      material: 'Plastic, Metal',
      warranty: '2 years'
    },
    tags: ['keyboard', 'mechanical', 'rgb', 'gaming'],
    isActive: true,
    sellerId: 'seller003',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Phone Case',
    description: 'Protective phone case with shock absorption',
    price: 19.99,
    category: 'Accessories',
    brand: 'CaseGuard',
    images: ['https://via.placeholder.com/300'],
    specifications: {
      weight: '30g',
      dimensions: '15x7x1cm',
      color: 'Clear',
      material: 'TPU',
      warranty: '6 months'
    },
    tags: ['phone', 'case', 'protection', 'accessories'],
    isActive: true,
    sellerId: 'seller004',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Portable Power Bank',
    description: '20000mAh power bank with fast charging',
    price: 39.99,
    category: 'Electronics',
    brand: 'PowerMax',
    images: ['https://via.placeholder.com/300'],
    specifications: {
      weight: '350g',
      dimensions: '15x7x2cm',
      color: 'Black',
      material: 'Plastic, Lithium',
      warranty: '1 year'
    },
    tags: ['powerbank', 'charging', 'portable', 'battery'],
    isActive: true,
    sellerId: 'seller004',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Desk Lamp',
    description: 'LED desk lamp with adjustable brightness',
    price: 34.99,
    category: 'Home & Office',
    brand: 'LightPro',
    images: ['https://via.placeholder.com/300'],
    specifications: {
      weight: '500g',
      dimensions: '40x15x15cm',
      color: 'White',
      material: 'Metal, Plastic',
      warranty: '1 year'
    },
    tags: ['lamp', 'desk', 'led', 'lighting'],
    isActive: true,
    sellerId: 'seller005',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Webcam HD',
    description: '1080p HD webcam with built-in microphone',
    price: 59.99,
    category: 'Electronics',
    brand: 'CamTech',
    images: ['https://via.placeholder.com/300'],
    specifications: {
      weight: '120g',
      dimensions: '8x4x4cm',
      color: 'Black',
      material: 'Plastic',
      warranty: '1 year'
    },
    tags: ['webcam', 'camera', 'video', 'conference'],
    isActive: true,
    sellerId: 'seller005',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('Clearing existing data...');
    await Product.deleteMany({});
    await Inventory.deleteMany({});
    await SearchIndex.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Insert products
    console.log('Inserting products...');
    const insertedProducts = await Product.insertMany(dummyProducts);
    console.log(`✅ Inserted ${insertedProducts.length} products\n`);

    // Create inventory for each product
    console.log('Creating inventory records...');
    const inventoryRecords = [];
    const searchIndices = [];

    for (let i = 0; i < insertedProducts.length; i++) {
      const product = insertedProducts[i];
      
      // Random inventory quantities (some low stock for testing)
      const quantity = [10, 25, 50, 100, 200, 500][Math.floor(Math.random() * 6)];
      const availableQuantity = quantity;
      const reorderLevel = 15;
      
      inventoryRecords.push({
        productId: product._id.toString(),
        quantity: quantity,
        reservedQuantity: 0,
        availableQuantity: availableQuantity,
        reorderLevel: reorderLevel,
        maxStock: 1000,
        location: 'warehouse',
        lastUpdated: new Date()
      });

      // Create search index
      searchIndices.push({
        productId: product._id.toString(),
        name: product.name,
        description: product.description,
        category: product.category,
        brand: product.brand,
        price: product.price,
        tags: product.tags,
        keywords: [
          ...product.tags,
          product.name.toLowerCase(),
          product.brand.toLowerCase(),
          product.category.toLowerCase()
        ],
        rating: 0,
        reviewCount: 0,
        isActive: true,
        lastUpdated: new Date()
      });
    }

    await Inventory.insertMany(inventoryRecords);
    console.log(`✅ Created ${inventoryRecords.length} inventory records\n`);

    await SearchIndex.insertMany(searchIndices);
    console.log(`✅ Created ${searchIndices.length} search indices\n`);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`\nSummary:`);
    console.log(`- Products: ${insertedProducts.length}`);
    console.log(`- Inventory Records: ${inventoryRecords.length}`);
    console.log(`- Search Indices: ${searchIndices.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();

