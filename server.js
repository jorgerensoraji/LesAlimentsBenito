'use strict';

const crypto = require('crypto');
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');

const { sendOrderEmail } = require('./lib/email');
const {
  initStorage,
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  listCustomers,
  listProducts,
  findProductById,
  createProduct,
  updateProduct,
  deactivateProduct,
  createOrder,
  listOrders,
  listOrdersForUser,
  updateOrderStatus,
  getAdminStats,
  getSettings,
  updateSettings,
  hashPassword,
  createOrderNumber
} = require('./lib/storage');

const app = express();
const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(__dirname, 'uploads');

const SESSION_COOKIE = 'benito_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const sessions = new Map();

const VALID_ORDER_STATUSES = ['new', 'processing', 'ready', 'delivered', 'cancelled'];
const PRODUCT_CATEGORIES = ['Beef', 'Chicken', 'Pork', 'Lamb', 'Specialty', 'Grocery', 'Other'];

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));

const upload = multer({ dest: uploadsDir });

// ── Page routes ───────────────────────────────────────────────────────────────

app.get('/', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
app.get('/order', (_req, res) => res.sendFile(path.join(publicDir, 'order.html')));
app.get('/login', (_req, res) => res.sendFile(path.join(publicDir, 'login.html')));
app.get('/signup', (_req, res) => res.sendFile(path.join(publicDir, 'signup.html')));
app.get('/account', (_req, res) => res.sendFile(path.join(publicDir, 'account.html')));
app.get('/admin', (_req, res) => res.sendFile(path.join(publicDir, 'admin.html')));

// ── Auth API ──────────────────────────────────────────────────────────────────

app.get('/api/session', async (req, res) => {
  const user = await getUserFromRequest(req);
  res.json({ authenticated: Boolean(user), user: user ? publicUser(user) : null });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);

  if (!user || !verifyPassword(password || '', user.passwordHash)) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const token = createSession(user.id);
  setSessionCookie(res, token);
  res.json({ success: true, user: publicUser(user) });
});

app.post('/api/signup', async (req, res) => {
  const { company, contact, email, phone, deliveryAddress, password } = req.body;
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '');

  if (!company || !cleanEmail || cleanPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Company, email, and a password with at least 8 characters are required.'
    });
  }

  const existing = await findUserByEmail(cleanEmail);
  if (existing) {
    return res.status(409).json({ success: false, message: 'An account already exists for this email.' });
  }

  const user = {
    id: crypto.randomUUID(),
    name: String(contact || company).trim(),
    email: cleanEmail,
    role: 'customer',
    company: String(company || '').trim(),
    phone: String(phone || '').trim(),
    deliveryAddress: String(deliveryAddress || '').trim(),
    passwordHash: hashPassword(cleanPassword),
    createdAt: new Date().toISOString()
  };

  await createUser(user);
  const token = createSession(user.id);
  setSessionCookie(res, token);
  res.status(201).json({ success: true, user: publicUser(user) });
});

app.post('/api/logout', (req, res) => {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies[SESSION_COOKIE];
  if (token) sessions.delete(token);
  res.clearCookie(SESSION_COOKIE);
  res.json({ success: true });
});

// ── Account API ───────────────────────────────────────────────────────────────

app.patch('/api/account/profile', requireAuth, async (req, res) => {
  const { name, phone, deliveryAddress, company } = req.body;
  await updateUser(req.user.id, { name, phone, deliveryAddress, company });
  const updated = await findUserById(req.user.id);
  res.json({ success: true, user: publicUser(updated) });
});

app.get('/api/my-orders', requireAuth, async (req, res) => {
  const orders = await listOrdersForUser(req.user);
  res.json({ orders });
});

// ── Products API ──────────────────────────────────────────────────────────────

app.get('/api/products', async (_req, res) => {
  const products = await listProducts();
  res.json({ products, categories: PRODUCT_CATEGORIES });
});

app.post('/api/products', requireAuth, requireRole('admin'), async (req, res) => {
  const { sku, name, nameFr, category, description, descriptionFr } = req.body;

  if (!name || !category) {
    return res.status(400).json({ success: false, message: 'Product name and category are required.' });
  }

  const product = await createProduct({ sku, name, nameFr, category, description, descriptionFr, image: '', active: true });
  res.status(201).json({ success: true, product });
});

app.put('/api/products/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { sku, name, nameFr, category, description, descriptionFr, active } = req.body;
  const updated = await updateProduct(req.params.id, { sku, name, nameFr, category, description, descriptionFr, active });

  if (!updated) return res.status(404).json({ success: false, message: 'Product not found.' });
  res.json({ success: true, product: updated });
});

app.delete('/api/products/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const result = await deactivateProduct(req.params.id);
  if (!result) return res.status(404).json({ success: false, message: 'Product not found.' });
  res.json({ success: true });
});

app.post('/api/products/:id/image', requireAuth, requireRole('admin'), upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided.' });

  const product = await findProductById(req.params.id);
  if (!product) {
    fs.unlink(req.file.path, () => {});
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg';
  const filename = `product-${req.params.id}${ext}`;
  const dest = path.join(publicDir, 'image', filename);

  fs.renameSync(req.file.path, dest);
  const imageUrl = `/image/${filename}`;
  await updateProduct(req.params.id, { image: imageUrl });
  res.json({ success: true, image: imageUrl });
});

// ── Orders API ────────────────────────────────────────────────────────────────

app.post('/api/orders', async (req, res) => {
  const user = await getUserFromRequest(req);
  const order = await normalizeOrder(req.body, user);

  if (!order.customer.company || !order.customer.email || !order.items.length) {
    return res.status(400).json({
      success: false,
      message: 'Company, email, and at least one product are required.'
    });
  }

  if (!order.userId) {
    const match = await findUserByEmail(order.customer.email);
    if (match) order.userId = match.id;
  }

  await createOrder(order);
  res.status(201).json({ success: true, orderNumber: order.orderNumber });

  sendOrderEmail(order).catch((error) => {
    console.error(`Order email failed for ${order.orderNumber}:`, {
      code: error.code,
      command: error.command,
      message: error.message
    });
  });
});

// ── Settings API (public read, admin write) ───────────────────────────────────

app.get('/api/settings', async (_req, res) => {
  const settings = await getSettings();
  // Omit internal keys before sending to public
  const { companyName, companySubtitle, companyAddress, companyPhone, companyFax, logoPath } = settings;
  res.json({ companyName, companySubtitle, companyAddress, companyPhone, companyFax, logoPath });
});

app.put('/api/admin/settings', requireAuth, requireRole('admin'), async (req, res) => {
  const { companyName, companySubtitle, companyAddress, companyPhone, companyFax } = req.body;
  const updated = await updateSettings({ companyName, companySubtitle, companyAddress, companyPhone, companyFax });
  res.json({ success: true, settings: updated });
});

app.post('/api/admin/logo', requireAuth, requireRole('admin'), upload.single('logo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No logo file provided.' });

  const ext = path.extname(req.file.originalname).toLowerCase() || '.png';
  const filename = `logo${ext}`;
  const dest = path.join(publicDir, 'image', filename);

  fs.renameSync(req.file.path, dest);
  const logoPath = `/image/${filename}`;
  await updateSettings({ logoPath });
  res.json({ success: true, logoPath });
});

// ── Admin API ─────────────────────────────────────────────────────────────────

app.get('/api/orders', requireAuth, requireRole('admin'), async (req, res) => {
  const { status, search } = req.query;
  const orders = await listOrders({ status, search });
  res.json({ orders });
});

app.patch('/api/orders/:id/status', requireAuth, requireRole('admin'), async (req, res) => {
  const { status } = req.body;
  if (!VALID_ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Use: ${VALID_ORDER_STATUSES.join(', ')}.` });
  }
  const ok = await updateOrderStatus(req.params.id, status);
  if (!ok) return res.status(404).json({ success: false, message: 'Order not found.' });
  res.json({ success: true });
});

app.get('/api/admin/stats', requireAuth, requireRole('admin'), async (_req, res) => {
  const stats = await getAdminStats();
  res.json(stats);
});

app.get('/api/admin/customers', requireAuth, requireRole('admin'), async (_req, res) => {
  const customers = await listCustomers();
  res.json({ customers });
});

app.get('/api/admin/products', requireAuth, requireRole('admin'), async (_req, res) => {
  const products = await listProducts({ includeInactive: true });
  res.json({ products, categories: PRODUCT_CATEGORIES });
});

// ── Legacy PDF upload route (email is working — do not modify) ────────────────

app.post('/upload-pdf', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No PDF file was received.' });
  }

  const filePath = req.file.path;
  const emailCliente = String(req.body.emailCliente || '').trim();
  const nombreCliente = String(req.body.nombreCliente || 'Not specified').trim();
  const direccionEnvio = String(req.body.direccionEnvio || 'Not specified').trim();
  const nombreOrden = String(req.body.nombreOrden || req.file.originalname || createOrderNumber()).trim();

  if (!emailCliente) {
    cleanupUpload(filePath);
    return res.status(400).json({ success: false, message: 'Customer email is required.' });
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    cleanupUpload(filePath);
    return res.status(500).json({ success: false, message: 'SMTP is not configured.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: [process.env.ORDER_EMAIL || process.env.SMTP_USER, emailCliente],
    subject: `New Purchase Order - ${nombreOrden}`,
    text: `New Order Received.\n\nCustomer Name: ${nombreCliente}\nEmail: ${emailCliente}\nDelivery address if different: ${direccionEnvio}\n\nThe purchase order PDF is attached.`,
    attachments: [{ filename: `${nombreOrden}.pdf`, path: filePath }]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Legacy PDF email sent:', info.response);
    res.json({ success: true, message: 'PDF received and email sent.' });
  } catch (error) {
    console.error('Legacy PDF email failed:', { code: error.code, command: error.command, message: error.message });
    res.status(500).json({ success: false, message: 'Email failed.', error: error.message });
  } finally {
    cleanupUpload(filePath);
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

initStorage()
  .then(() => {
    app.listen(port, () => {
      console.log(`Les Aliments Benito running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Startup failed:', error);
    process.exit(1);
  });

// ── Auth helpers ──────────────────────────────────────────────────────────────

function verifyPassword(password, storedHash) {
  const [salt, key] = String(storedHash || '').split(':');
  if (!salt || !key) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), candidate);
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { userId, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

function setSessionCookie(res, token) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_MS
  });
}

async function getUserFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies[SESSION_COOKIE];
  const session = sessions.get(token);

  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  return findUserById(session.userId);
}

function parseCookies(cookieHeader) {
  return cookieHeader.split(';').reduce((acc, item) => {
    const [rawName, ...rawValue] = item.trim().split('=');
    if (!rawName) return acc;
    acc[rawName] = decodeURIComponent(rawValue.join('='));
    return acc;
  }, {});
}

async function requireAuth(req, res, next) {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ success: false, message: 'Login required.' });
  req.user = user;
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    next();
  };
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company || '',
    phone: user.phone || '',
    deliveryAddress: user.deliveryAddress || ''
  };
}

// ── Order helpers ─────────────────────────────────────────────────────────────

async function normalizeOrder(payload, user) {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const cleanItems = items
    .map((item) => ({
      productId: String(item.productId || ''),
      name: String(item.name || '').trim(),
      nameFr: String(item.nameFr || '').trim(),
      quantity: Number(item.quantity || 0),
      unit: String(item.unit || '').trim(),
      notes: String(item.notes || '').trim()
    }))
    .filter((item) => item.name && item.quantity > 0 && item.unit);

  return {
    id: crypto.randomUUID(),
    userId: user ? user.id : null,
    orderNumber: await createOrderNumber(),
    createdAt: new Date().toISOString(),
    status: 'new',
    customer: {
      company: String(payload.company || (user && user.company) || '').trim(),
      contact: String(payload.contact || (user && user.name) || '').trim(),
      email: String(payload.email || (user && user.email) || '').trim(),
      phone: String(payload.phone || (user && user.phone) || '').trim(),
      deliveryAddress: String(payload.deliveryAddress || (user && user.deliveryAddress) || '').trim(),
      message: String(payload.message || '').trim()
    },
    items: cleanItems
  };
}

function cleanupUpload(filePath) {
  fs.unlink(filePath, (error) => {
    if (error) console.error('Upload cleanup failed:', error);
  });
}
