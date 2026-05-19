const crypto = require('crypto');
const express = require('express');
const fs = require('fs');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const rootDir = __dirname;
const publicDir = path.join(rootDir, 'public');
const dataDir = path.join(rootDir, 'data');
const dbPath = path.join(dataDir, 'db.json');

const SESSION_COOKIE = 'benito_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-session-secret';
const sessions = new Map();

const defaultDb = {
  users: [],
  orders: []
};

const products = [
  {
    id: 'shawarma-beef',
    name: 'Shawarma Beef',
    nameFr: 'Boeuf pour shawarma',
    category: 'Beef',
    description: 'Quality cuts prepared for restaurants, caterers, and wholesale kitchens.',
    descriptionFr: 'Coupes de qualité préparées pour restaurants, traiteurs et cuisines commerciales.',
    image: '/image/shawarmab.jpg'
  },
  {
    id: 'chicken-breast-skin',
    name: 'Boneless Chicken Breast with Skin',
    nameFr: 'Poitrine de poulet désossée avec peau',
    category: 'Chicken',
    description: 'Fresh poultry packed for dependable food-service use.',
    descriptionFr: 'Volaille fraîche emballée pour un service alimentaire fiable.',
    image: '/image/chickenbreastbnlesswithskin.jpg'
  },
  {
    id: 'chicken-cubes',
    name: 'Chicken Breast Cubes',
    nameFr: 'Cubes de poitrine de poulet',
    category: 'Chicken',
    description: 'Ready-to-cook chicken cubes for busy professional kitchens.',
    descriptionFr: 'Cubes de poulet prêts à cuisiner pour cuisines professionnelles.',
    image: '/image/chickenbreastcube.jpg'
  },
  {
    id: 'whole-wings',
    name: 'Whole Chicken Wings',
    nameFr: 'Ailes de poulet entières',
    category: 'Chicken',
    description: 'Fresh wings with consistent sizing for bulk orders.',
    descriptionFr: 'Ailes fraîches avec calibre régulier pour commandes en gros.',
    image: '/image/wholechickenwings.jpg'
  },
  {
    id: 'pork-butt-sliced',
    name: 'Pork Butt Sliced',
    nameFr: 'Soc de porc tranché',
    category: 'Pork',
    description: 'Reliable pork cuts for restaurants and prepared-food producers.',
    descriptionFr: 'Coupes de porc fiables pour restaurants et transformateurs alimentaires.',
    image: '/image/porkbuttsliced.jpg'
  },
  {
    id: 'pork-cubes',
    name: 'Pork Cubes',
    nameFr: 'Cubes de porc',
    category: 'Pork',
    description: 'Clean, practical cuts for stews, skewers, and production menus.',
    descriptionFr: 'Coupes pratiques pour ragoûts, brochettes et menus de production.',
    image: '/image/porkcube.jpg'
  },
  {
    id: 'lamb-leg-boneless',
    name: 'Boneless Lamb Leg',
    nameFr: 'Gigot d’agneau désossé',
    category: 'Lamb',
    description: 'Premium lamb prepared for wholesale and food-service needs.',
    descriptionFr: 'Agneau de qualité préparé pour le gros et la restauration.',
    image: '/image/lamblegbnlessaus.jpg'
  },
  {
    id: 'loukaniko',
    name: 'Loukaniko',
    nameFr: 'Loukaniko',
    category: 'Specialty',
    description: 'Greek-style sausage for specialty menus and retail counters.',
    descriptionFr: 'Saucisse de style grec pour menus spécialisés et comptoirs de détail.',
    image: '/image/LOUKANIKO.jpg'
  },
  {
    id: 'canola-oil',
    name: 'Canola Oil',
    nameFr: 'Huile de canola',
    category: 'Grocery',
    description: 'A practical food-service staple available with your order.',
    descriptionFr: 'Un essentiel pratique pour service alimentaire disponible avec votre commande.',
    image: '/image/canolaoil.jpg'
  }
];

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));

ensureDatabase();
ensureDefaultAdmin();

app.get('/', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/order', (_req, res) => {
  res.sendFile(path.join(publicDir, 'order.html'));
});

app.get('/login', (_req, res) => {
  res.sendFile(path.join(publicDir, 'login.html'));
});

app.get('/signup', (_req, res) => {
  res.sendFile(path.join(publicDir, 'signup.html'));
});

app.get('/account', (_req, res) => {
  res.sendFile(path.join(publicDir, 'account.html'));
});

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(publicDir, 'admin.html'));
});

app.get('/api/products', (_req, res) => {
  res.json({ products });
});

app.get('/api/session', (req, res) => {
  const user = getUserFromRequest(req);
  res.json({ authenticated: Boolean(user), user: user ? publicUser(user) : null });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDb();
  const user = db.users.find((item) => item.email.toLowerCase() === String(email || '').toLowerCase());

  if (!user || !verifyPassword(password || '', user.passwordHash)) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const token = createSession(user.id);
  setSessionCookie(res, token);
  res.json({ success: true, user: publicUser(user) });
});

app.post('/api/signup', (req, res) => {
  const { company, contact, email, phone, deliveryAddress, password } = req.body;
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '');

  if (!company || !cleanEmail || cleanPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Company, email, and a password with at least 8 characters are required.'
    });
  }

  const db = readDb();
  const existingUser = db.users.find((user) => user.email.toLowerCase() === cleanEmail);
  if (existingUser) {
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

  db.users.push(user);
  writeDb(db);

  const token = createSession(user.id);
  setSessionCookie(res, token);
  res.status(201).json({ success: true, user: publicUser(user) });
});

app.post('/api/logout', (_req, res) => {
  res.clearCookie(SESSION_COOKIE);
  res.json({ success: true });
});

app.post('/api/orders', async (req, res) => {
  const user = getUserFromRequest(req);
  const order = normalizeOrder(req.body, user);

  if (!order.customer.company || !order.customer.email || !order.items.length) {
    return res.status(400).json({
      success: false,
      message: 'Company, email, and at least one product are required.'
    });
  }

  const db = readDb();
  if (!order.userId) {
    const matchingUser = db.users.find((item) => item.email.toLowerCase() === order.customer.email.toLowerCase());
    if (matchingUser) order.userId = matchingUser.id;
  }
  db.orders.unshift(order);
  writeDb(db);

  try {
    await sendOrderEmail(order);
  } catch (error) {
    console.error('Order email failed:', error);
  }

  res.status(201).json({ success: true, orderNumber: order.orderNumber });
});

app.get('/api/orders', requireAuth, requireRole('admin'), (_req, res) => {
  const db = readDb();
  res.json({ orders: db.orders });
});

app.get('/api/my-orders', requireAuth, (req, res) => {
  const db = readDb();
  const userEmail = req.user.email.toLowerCase();
  const orders = db.orders.filter((order) => {
    const orderEmail = String(order.customer && order.customer.email || '').toLowerCase();
    return order.userId === req.user.id || orderEmail === userEmail;
  });

  res.json({ orders });
});

app.listen(port, () => {
  console.log(`Les Aliments Benito running on http://localhost:${port}`);
});

function ensureDatabase() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    writeDb(defaultDb);
  }
}

function ensureDefaultAdmin() {
  const db = readDb();
  if (db.users.length > 0) return;

  const email = process.env.ADMIN_EMAIL || 'jorgerensoraji@hotmail.com';
  const password = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'ChangeMe123!');

  if (!password) {
    throw new Error('ADMIN_PASSWORD must be set before the first production start.');
  }

  db.users.push({
    id: crypto.randomUUID(),
    name: 'Benito Admin',
    email,
    role: 'admin',
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  console.log(`Default admin created: ${email}`);
}

function readDb() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function writeDb(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${key}`;
}

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

function getUserFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies[SESSION_COOKIE];
  const session = sessions.get(token);

  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  const db = readDb();
  return db.users.find((user) => user.id === session.userId) || null;
}

function parseCookies(cookieHeader) {
  return cookieHeader.split(';').reduce((cookies, item) => {
    const [rawName, ...rawValue] = item.trim().split('=');
    if (!rawName) return cookies;
    cookies[rawName] = decodeURIComponent(rawValue.join('='));
    return cookies;
  }, {});
}

function requireAuth(req, res, next) {
  const user = getUserFromRequest(req);
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

function normalizeOrder(payload, user) {
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
    orderNumber: createOrderNumber(),
    createdAt: new Date().toISOString(),
    status: 'new',
    customer: {
      company: String(payload.company || user && user.company || '').trim(),
      contact: String(payload.contact || user && user.name || '').trim(),
      email: String(payload.email || user && user.email || '').trim(),
      phone: String(payload.phone || user && user.phone || '').trim(),
      deliveryAddress: String(payload.deliveryAddress || user && user.deliveryAddress || '').trim(),
      message: String(payload.message || '').trim()
    },
    items: cleanItems
  };
}

function createOrderNumber() {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(2, 14);
  return `BEN-${stamp}`;
}

async function sendOrderEmail(order) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`Order ${order.orderNumber} saved. SMTP is not configured.`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const recipients = [process.env.ORDER_EMAIL || process.env.SMTP_USER, order.customer.email];
  const itemLines = order.items
    .map((item) => `- ${item.name}: ${item.quantity} ${item.unit}${item.notes ? ` (${item.notes})` : ''}`)
    .join('\n');

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: recipients,
    subject: `New order ${order.orderNumber} - Les Aliments Benito`,
    text: `New order received.

Order: ${order.orderNumber}
Company: ${order.customer.company}
Contact: ${order.customer.contact || '-'}
Email: ${order.customer.email}
Phone: ${order.customer.phone || '-'}
Delivery address: ${order.customer.deliveryAddress || '-'}

Products:
${itemLines}

Message:
${order.customer.message || '-'}`
  });
}
