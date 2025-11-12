const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3008;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://search-db:27017/searchdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Search Index Schema
const searchIndexSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  tags: [{ type: String }],
  keywords: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now }
});

const SearchIndex = mongoose.model('SearchIndex', searchIndexSchema);

// Search History Schema
const searchHistorySchema = new mongoose.Schema({
  userId: { type: String },
  query: { type: String, required: true },
  results: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'search-service', timestamp: new Date().toISOString() });
});

// Search products
app.get('/search', async (req, res) => {
  try {
    const { q, category, brand, minPrice, maxPrice, sortBy = 'relevance', page = 1, limit = 10 } = req.query;
    
    if (!q && !category && !brand) {
      return res.status(400).json({ message: 'Search query, category, or brand is required' });
    }

    let query = { isActive: true };
    let sortOptions = {};

    // Text search
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { keywords: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    // Filters
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Sorting
    switch (sortBy) {
      case 'price_low':
        sortOptions.price = 1;
        break;
      case 'price_high':
        sortOptions.price = -1;
        break;
      case 'rating':
        sortOptions.rating = -1;
        break;
      case 'newest':
        sortOptions.lastUpdated = -1;
        break;
      default:
        sortOptions.rating = -1;
    }

    const results = await SearchIndex.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SearchIndex.countDocuments(query);

    // Log search history
    if (q) {
      const searchHistory = new SearchHistory({
        userId: req.query.userId,
        query: q,
        results: total
      });
      await searchHistory.save();
    }

    res.json({
      results,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      query: q,
      filters: { category, brand, minPrice, maxPrice }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get search suggestions
app.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await SearchIndex.aggregate([
      {
        $match: {
          isActive: true,
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } },
            { brand: { $regex: q, $options: 'i' } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          names: { $addToSet: '$name' },
          categories: { $addToSet: '$category' },
          brands: { $addToSet: '$brand' }
        }
      }
    ]);

    const result = suggestions[0] || { names: [], categories: [], brands: [] };
    const allSuggestions = [
      ...result.names.slice(0, 5),
      ...result.categories.slice(0, 3),
      ...result.brands.slice(0, 3)
    ];

    res.json({ suggestions: allSuggestions.slice(0, 10) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Index product
app.post('/index', [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Product description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('price').isNumeric().withMessage('Valid price is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, name, description, category, brand, price, tags = [], keywords = [] } = req.body;

    const searchIndex = await SearchIndex.findOneAndUpdate(
      { productId },
      {
        productId,
        name,
        description,
        category,
        brand,
        price,
        tags,
        keywords,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Product indexed successfully', searchIndex });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product rating
app.put('/index/:productId/rating', [
  body('rating').isNumeric().withMessage('Valid rating is required'),
  body('reviewCount').isInt().withMessage('Valid review count is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, reviewCount } = req.body;
    const searchIndex = await SearchIndex.findOneAndUpdate(
      { productId: req.params.productId },
      { rating, reviewCount, lastUpdated: new Date() },
      { new: true }
    );

    if (!searchIndex) {
      return res.status(404).json({ message: 'Product not found in search index' });
    }

    res.json({ message: 'Product rating updated successfully', searchIndex });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get popular searches
app.get('/popular', async (req, res) => {
  try {
    const popularSearches = await SearchHistory.aggregate([
      { $match: { timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({ popularSearches });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get search analytics
app.get('/analytics', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const analytics = await SearchHistory.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalSearches: { $sum: 1 },
          uniqueQueries: { $addToSet: '$query' },
          avgResults: { $avg: '$results' }
        }
      }
    ]);

    const result = analytics[0] || { totalSearches: 0, uniqueQueries: [], avgResults: 0 };

    res.json({
      totalSearches: result.totalSearches,
      uniqueQueries: result.uniqueQueries.length,
      avgResults: result.avgResults
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
  <title>Search Service UI</title>
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
    <h1>Search Service</h1>
    <div class="card">
      <h2>Quick Health</h2>
      <button id="btnHealth">GET /health</button>
    </div>
    <div class="card">
      <h2>Search</h2>
      <label>Query</label>
      <input id="q" value="sample" />
      <button id="btnSearch">GET /search?q=...</button>
    </div>
    <div class="card">
      <h2>Generic Request</h2>
      <label>Method</label>
      <select id="method"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option></select>
      <label>Path</label>
      <input id="path" value="/search?q=sample" />
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
    document.getElementById('btnSearch').onclick = () => call('GET', '/search?q=' + encodeURIComponent(document.getElementById('q').value));
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
  console.log(`Search service running on port ${PORT}`);
});
