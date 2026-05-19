const crypto = require('crypto');
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const rootDir = __dirname;
const publicDir = path.join(rootDir, 'public');
const dataDir = path.join(rootDir, 'data');
const uploadsDir = path.join(rootDir, 'uploads');
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

const upload = multer({ dest: uploadsDir });

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

app.post('/api/orders', (req, res) => {
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

  res.status(201).json({ success: true, orderNumber: order.orderNumber });

  sendOrderEmail(order).catch((error) => {
    console.error(`Order email failed for ${order.orderNumber}:`, {
      code: error.code,
      command: error.command,
      message: error.message
    });
  });
});

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
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: [process.env.ORDER_EMAIL || process.env.SMTP_USER, emailCliente],
    subject: `New Purchase Order - ${nombreOrden}`,
    text: `New Order Received.

Customer Name: ${nombreCliente}
Email: ${emailCliente}
Delivery address if different: ${direccionEnvio}

The purchase order PDF is attached.`,
    attachments: [
      {
        filename: `${nombreOrden}.pdf`,
        path: filePath
      }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Legacy PDF email sent:', info.response);
    res.json({ success: true, message: 'PDF received and email sent.' });
  } catch (error) {
    console.error('Legacy PDF email failed:', {
      code: error.code,
      command: error.command,
      message: error.message
    });
    res.status(500).json({ success: false, message: 'Email failed.', error: error.message });
  } finally {
    cleanupUpload(filePath);
  }
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
  fs.mkdirSync(uploadsDir, { recursive: true });
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

function cleanupUpload(filePath) {
  fs.unlink(filePath, (error) => {
    if (error) console.error('Upload cleanup failed:', error);
  });
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
  if (process.env.GOOGLE_SCRIPT_URL) {
    await sendOrderEmailWithGoogleScript(order);
    return;
  }

  if (process.env.RESEND_API_KEY) {
    await sendOrderEmailWithResend(order);
    return;
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`Order ${order.orderNumber} saved. SMTP is not configured.`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });

  const recipients = [process.env.ORDER_EMAIL || process.env.SMTP_USER, order.customer.email];
  const itemLines = buildOrderItemLines(order);
  const pdf = buildOrderPdf(order);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: recipients,
    subject: `New order ${order.orderNumber} - Les Aliments Benito`,
    text: buildOrderEmailText(order, itemLines),
    attachments: [
      {
        filename: `${order.orderNumber}.pdf`,
        content: pdf,
        contentType: 'application/pdf'
      }
    ]
  });
}

async function sendOrderEmailWithGoogleScript(order) {
  const recipients = [process.env.ORDER_EMAIL || process.env.SMTP_USER, order.customer.email].filter(Boolean);
  const itemLines = buildOrderItemLines(order);
  const pdf = buildOrderPdf(order);

  const response = await fetch(process.env.GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
      secret: process.env.GOOGLE_SCRIPT_SECRET || '',
      to: recipients.join(','),
      subject: `New order ${order.orderNumber} - Les Aliments Benito`,
      text: buildOrderEmailText(order, itemLines),
      attachment: {
        filename: `${order.orderNumber}.pdf`,
        mimeType: 'application/pdf',
        content: pdf.toString('base64')
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Script email failed: ${response.status} ${errorText}`);
  }
}

async function sendOrderEmailWithResend(order) {
  const recipients = [process.env.ORDER_EMAIL || process.env.SMTP_USER, order.customer.email].filter(Boolean);
  const itemLines = buildOrderItemLines(order);
  const pdf = buildOrderPdf(order);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'Les Aliments Benito <onboarding@resend.dev>',
      to: recipients,
      subject: `New order ${order.orderNumber} - Les Aliments Benito`,
      text: buildOrderEmailText(order, itemLines),
      attachments: [
        {
          filename: `${order.orderNumber}.pdf`,
          content: pdf.toString('base64')
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API failed: ${response.status} ${errorText}`);
  }
}

function buildOrderItemLines(order) {
  return order.items
    .map((item) => `- ${item.name}: ${item.quantity} ${item.unit}${item.notes ? ` (${item.notes})` : ''}`)
    .join('\n');
}

function buildOrderEmailText(order, itemLines) {
  return `New order received.

Order: ${order.orderNumber}
Company: ${order.customer.company}
Contact: ${order.customer.contact || '-'}
Email: ${order.customer.email}
Phone: ${order.customer.phone || '-'}
Delivery address: ${order.customer.deliveryAddress || '-'}

Products:
${itemLines}

Message:
${order.customer.message || '-'}`;
}

function buildOrderPdf(order) {
  return createOrderSheetPdf(order);
}

function createOrderSheetPdf(order) {
  const pageWidth = 612;
  const pageHeight = 792;
  const content = buildOrderSheetContent(order);
  const objects = [];
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
  objects[4] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R >> >> /Contents 5 0 R >>`;
  objects[5] = `<< /Length ${Buffer.byteLength(content, 'utf8')} >>
stream
${content}
endstream`;
  objects[2] = '<< /Type /Pages /Kids [4 0 R] /Count 1 >>';

  const parts = ['%PDF-1.4\n'];
  const offsets = [0];

  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = Buffer.byteLength(parts.join(''), 'utf8');
    parts.push(`${index} 0 obj\n${objects[index]}\nendobj\n`);
  }

  const xrefOffset = Buffer.byteLength(parts.join(''), 'utf8');
  parts.push(`xref
0 ${objects.length}
0000000000 65535 f 
`);

  for (let index = 1; index < objects.length; index += 1) {
    parts.push(`${String(offsets[index]).padStart(10, '0')} 00000 n \n`);
  }

  parts.push(`trailer
<< /Size ${objects.length} /Root 1 0 R >>
startxref
${xrefOffset}
%%EOF`);

  return Buffer.from(parts.join(''), 'utf8');
}

function buildOrderSheetContent(order) {
  const commands = [];
  const left = 28;
  const right = 584;
  const top = 760;
  const date = new Date(order.createdAt).toLocaleDateString('en-CA');
  const rowsTop = 555;
  const rowHeight = 20;
  const rows = 27;
  const bottom = rowsTop - rows * rowHeight;
  const columns = [left, 78, 130, 360, 425, 490, right];

  commands.push('0.96 0.96 0.94 rg');
  commands.push(`${left} ${bottom} ${right - left} ${rows * rowHeight} re f`);
  commands.push('0 G 0.7 w');

  drawHeaderLogo(commands, left + 18, top - 74);
  addText(commands, 'LES ALIMENTS BENITO', 220, top - 24, 22, { bold: true, color: '0.05 0.45 0.18 rg' });
  addText(commands, '1241 5801 CANADA INC.', 221, top - 43, 9);
  addText(commands, '11525, 4ieme Avenue, R.D.P., QC H1E 2Y8  •  Tel.: (514) 723-2378', 221, top - 78, 9);
  addText(commands, order.orderNumber.replace(/\D/g, '').slice(-6) || order.orderNumber, 505, top - 18, 18, { color: '0.75 0.12 0.12 rg' });

  addText(commands, 'DATE', 435, 640, 10);
  drawLine(commands, 460, 638, 580, 638, 0.5);
  addText(commands, date, 468, 642, 9);

  addVerticalLabel(commands, ['V', 'E', 'N', 'D', 'U', '', 'A'], 22, 612, 8);
  addVerticalLabel(commands, ['S', 'O', 'L', 'D', '', 'T', 'O'], 34, 612, 8);
  drawLine(commands, 55, 608, 305, 608, 0.5);
  drawLine(commands, 55, 580, 305, 580, 0.5);
  drawLine(commands, 55, 552, 305, 552, 0.5);
  addText(commands, order.customer.company, 60, 614, 9);
  addText(commands, order.customer.contact || order.customer.email, 60, 586, 9);
  addText(commands, order.customer.phone || '', 60, 558, 9);

  addVerticalLabel(commands, ['E', 'X', 'P', 'E', 'D', 'I', 'E', 'Z', '', 'A'], 308, 612, 8);
  addVerticalLabel(commands, ['S', 'H', 'I', 'P', '', 'T', 'O'], 320, 612, 8);
  drawLine(commands, 335, 608, 580, 608, 0.5);
  drawLine(commands, 335, 580, 580, 580, 0.5);
  drawLine(commands, 335, 552, 580, 552, 0.5);
  addText(commands, order.customer.deliveryAddress || order.customer.company, 340, 614, 8);
  addText(commands, order.customer.email, 340, 586, 8);
  addText(commands, order.customer.message || '', 340, 558, 8);

  drawLine(commands, left, rowsTop + 2, right, rowsTop + 2, 1.4);
  columns.forEach((x) => drawLine(commands, x, bottom, x, rowsTop + rowHeight, 0.5));
  for (let row = 0; row <= rows + 1; row += 1) {
    const y = rowsTop + rowHeight - row * rowHeight;
    drawLine(commands, left, y, right, y, row === 1 ? 0.9 : 0.35);
  }

  addCenteredText(commands, 'CODE', columns[0], columns[1], rowsTop + 7, 8);
  addCenteredText(commands, 'QTE', columns[1], columns[2], rowsTop + 11, 8);
  addCenteredText(commands, 'QTY', columns[1], columns[2], rowsTop + 1, 8);
  addCenteredText(commands, 'DESCRIPTION', columns[2], columns[3], rowsTop + 7, 8);
  addCenteredText(commands, 'POIDS', columns[3], columns[4], rowsTop + 11, 8);
  addCenteredText(commands, 'WEIGHT', columns[3], columns[4], rowsTop + 1, 8);
  addCenteredText(commands, 'PRIX', columns[4], columns[5], rowsTop + 11, 8);
  addCenteredText(commands, 'PRICE', columns[4], columns[5], rowsTop + 1, 8);
  addCenteredText(commands, 'MONTANT', columns[5], columns[6], rowsTop + 11, 8);
  addCenteredText(commands, 'AMOUNT', columns[5], columns[6], rowsTop + 1, 8);

  addWatermark(commands, 'BON DE COMMANDE', 200, 360);

  order.items.slice(0, rows - 1).forEach((item, index) => {
    const y = rowsTop - rowHeight * (index + 1) + 6;
    addCenteredText(commands, String(index + 1).padStart(3, '0'), columns[0], columns[1], y, 8);
    addCenteredText(commands, String(item.quantity), columns[1], columns[2], y, 9);
    addText(commands, item.name, columns[2] + 6, y, 9, { bold: true });
    if (item.notes) addText(commands, `Notes: ${item.notes}`, columns[2] + 6, y - 9, 7);
    addCenteredText(commands, item.unit, columns[3], columns[4], y, 8);
  });

  drawLine(commands, left, 44, right, 44, 1.2);
  addText(commands, "Nous n'acceptons pas de reclamation apres votre signature.", left, 30, 7);
  addText(commands, 'We do not accept any claim after your signature.', left, 20, 7);
  addText(commands, 'CONDITIONS: NET 7 JOURS  •  TERMS NET 7 DAYS.', left, 10, 7);
  addText(commands, "SIGNATURE DE L'ACHETEUR", 205, 28, 8);
  addText(commands, "BUYER'S SIGNATURE", 205, 18, 8);
  drawLine(commands, 330, 18, 465, 18, 0.5);
  addText(commands, 'TOTAL', 505, 22, 14);
  drawLine(commands, 560, 18, right, 18, 0.5);

  return commands.join('\n');
}

function drawHeaderLogo(commands, x, y) {
  commands.push('0 G 1 w');
  commands.push(`${x + 22} ${y + 42} ${x + 42} ${y + 68} ${x + 62} ${y + 42} c S`);
  commands.push(`${x + 18} ${y + 78} ${x + 36} ${y + 92} ${x + 55} ${y + 80} c S`);
  commands.push(`${x + 45} ${y + 82} ${x + 64} ${y + 98} ${x + 82} ${y + 78} c S`);
  commands.push(`${x + 16} ${y + 35} ${x + 50} ${y + 18} ${x + 88} ${y + 35} c S`);
  commands.push(`${x + 20} ${y + 18} ${x + 52} ${y - 2} ${x + 84} ${y + 18} c S`);
  addText(commands, 'LES ALIMENTS', x + 28, y + 20, 8, { color: '0.75 0.12 0.12 rg' });
  addText(commands, 'BENITO', x + 20, y + 2, 20, { bold: true, color: '0.05 0.35 0.18 rg' });
}

function addVerticalLabel(commands, letters, x, y, size) {
  letters.forEach((letter, index) => {
    if (letter) addText(commands, letter, x, y - index * 10, size);
  });
}

function addWatermark(commands, text, x, y) {
  commands.push('q');
  commands.push('0.92 0.72 0.72 rg');
  commands.push(`1 0.55 -0.55 1 ${x} ${y} cm`);
  commands.push('BT /F1 38 Tf 0 0 Td');
  commands.push(`(${escapePdfText(text)}) Tj`);
  commands.push('ET');
  commands.push('Q');
}

function drawLine(commands, x1, y1, x2, y2, width) {
  commands.push(`${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
}

function addText(commands, text, x, y, size, options = {}) {
  const color = options.color || '0 G';
  commands.push(color.includes('rg') ? color : `${color}`);
  commands.push(`BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`);
}

function addCenteredText(commands, text, x1, x2, y, size) {
  const clean = escapePdfText(text);
  const estimatedWidth = String(text || '').length * size * 0.48;
  const x = x1 + ((x2 - x1 - estimatedWidth) / 2);
  commands.push('0 G');
  commands.push(`BT /F1 ${size} Tf ${x} ${y} Td (${clean}) Tj ET`);
}

function wrapPdfLine(line, maxChars) {
  const value = String(line || '');
  if (value.length <= maxChars) return [value];

  const words = value.split(' ');
  const lines = [];
  let current = '';

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) lines.push(current);
  return lines;
}

function escapePdfText(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}
