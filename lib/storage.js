'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'db.json');

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
  : null;

const defaultProducts = [
  {
    id: 'shawarma-beef',
    sku: '',
    name: 'Shawarma Beef',
    nameFr: 'Boeuf pour shawarma',
    category: 'Beef',
    description: 'Quality cuts prepared for restaurants, caterers, and wholesale kitchens.',
    descriptionFr: 'Coupes de qualite preparees pour restaurants, traiteurs et cuisines commerciales.',
    image: '/image/shawarmab.jpg'
  },
  {
    id: 'inside-round',
    sku: '',
    name: 'Inside Round',
    nameFr: 'Ronde interieure',
    category: 'Beef',
    description: 'Lean and versatile beef cut for roasting, slicing, and wholesale use.',
    descriptionFr: 'Coupe de boeuf maigre et polyvalente pour rotisserie, tranches et gros.',
    image: '/image/insideround.jpg'
  },
  {
    id: 'chicken-breast-skin',
    sku: '',
    name: 'Boneless Chicken Breast with Skin',
    nameFr: 'Poitrine de poulet desossee avec peau',
    category: 'Chicken',
    description: 'Fresh poultry packed for dependable food-service use.',
    descriptionFr: 'Volaille fraiche emballee pour un service alimentaire fiable.',
    image: '/image/chickenbreastbnlesswithskin.jpg'
  },
  {
    id: 'chicken-breast-skinless',
    sku: '',
    name: 'Boneless Skinless Chicken Breast',
    nameFr: 'Poitrine de poulet desossee sans peau',
    category: 'Chicken',
    description: 'Classic chicken breast, boneless and skinless for lean menu options.',
    descriptionFr: 'Poitrine de poulet classique desossee sans peau pour menus allegres.',
    image: '/image/chickenbreastbnless.jpg'
  },
  {
    id: 'chicken-cubes',
    sku: '',
    name: 'Chicken Breast Cubes',
    nameFr: 'Cubes de poitrine de poulet',
    category: 'Chicken',
    description: 'Ready-to-cook chicken cubes for busy professional kitchens.',
    descriptionFr: 'Cubes de poulet prets a cuisiner pour cuisines professionnelles.',
    image: '/image/chickenbreastcube.jpg'
  },
  {
    id: 'whole-wings',
    sku: '',
    name: 'Whole Chicken Wings',
    nameFr: 'Ailes de poulet entieres',
    category: 'Chicken',
    description: 'Fresh wings with consistent sizing for bulk orders.',
    descriptionFr: 'Ailes fraiches avec calibre regulier pour commandes en gros.',
    image: '/image/wholechickenwings.jpg'
  },
  {
    id: 'wings-cut',
    sku: '',
    name: 'Chicken Wings Cut',
    nameFr: 'Ailes de poulet coupees',
    category: 'Chicken',
    description: 'Pre-cut chicken wings ready for frying or grilling.',
    descriptionFr: 'Ailes de poulet pre-coupees prets pour friture ou grillade.',
    image: '/image/chickenwingscut.jpg'
  },
  {
    id: 'pork-butt-sliced',
    sku: '',
    name: 'Pork Butt Sliced',
    nameFr: 'Soc de porc tranche',
    category: 'Pork',
    description: 'Reliable pork cuts for restaurants and prepared-food producers.',
    descriptionFr: 'Coupes de porc fiables pour restaurants et transformateurs alimentaires.',
    image: '/image/porkbuttsliced.jpg'
  },
  {
    id: 'pork-cubes',
    sku: '',
    name: 'Pork Cubes',
    nameFr: 'Cubes de porc',
    category: 'Pork',
    description: 'Clean, practical cuts for stews, skewers, and production menus.',
    descriptionFr: 'Coupes pratiques pour ragouts, brochettes et menus de production.',
    image: '/image/porkcube.jpg'
  },
  {
    id: 'pork-leg',
    sku: '',
    name: 'Pork Leg with Bone',
    nameFr: 'Jambon de porc avec os',
    category: 'Pork',
    description: 'Whole pork leg with bone for roasting and slow cooking.',
    descriptionFr: 'Jambon entier avec os pour rotisserie et cuisson lente.',
    image: '/image/porklegwithbone.jpg'
  },
  {
    id: 'lamb-leg-boneless',
    sku: '',
    name: 'Boneless Lamb Leg',
    nameFr: "Gigot d'agneau desossee",
    category: 'Lamb',
    description: 'Premium lamb prepared for wholesale and food-service needs.',
    descriptionFr: 'Agneau de qualite prepare pour le gros et la restauration.',
    image: '/image/lamblegbnlessaus.jpg'
  },
  {
    id: 'whole-lamb',
    sku: '',
    name: 'Whole Lamb',
    nameFr: 'Agneau entier',
    category: 'Lamb',
    description: 'Whole lamb for special occasions and traditional preparations.',
    descriptionFr: 'Agneau entier pour occasions speciales et preparations traditionnelles.',
    image: '/image/wholelambmf.jpg'
  },
  {
    id: 'loukaniko',
    sku: '',
    name: 'Loukaniko',
    nameFr: 'Loukaniko',
    category: 'Specialty',
    description: 'Greek-style sausage for specialty menus and retail counters.',
    descriptionFr: 'Saucisse de style grec pour menus specialises et comptoirs de detail.',
    image: '/image/LOUKANIKO.jpg'
  },
  {
    id: 'canola-oil',
    sku: '',
    name: 'Canola Oil',
    nameFr: 'Huile de canola',
    category: 'Grocery',
    description: 'A practical food-service staple available with your order.',
    descriptionFr: 'Un essentiel pratique pour service alimentaire disponible avec votre commande.',
    image: '/image/canolaoil.jpg'
  }
];

const defaultSettings = {
  companyName: 'LES ALIMENTS BENITO',
  companySubtitle: '1241 5801 CANADA INC.',
  companyAddress: '11525, 4ieme Avenue, R.D.P., QC  H1E 2Y8',
  companyPhone: 'Tel.: (514) 723-2378',
  companyFax: 'Fax: (514) 723-3231',
  logoPath: '/image/beni.png'
};

const defaultDb = {
  users: [],
  products: [],
  orders: [],
  settings: {}
};

async function initStorage() {
  fs.mkdirSync(dataDir, { recursive: true });

  if (pool) {
    await ensurePostgresSchema();
    await migrateJsonToPostgresIfEmpty();
  } else if (!fs.existsSync(dbPath)) {
    writeDb(defaultDb);
  }

  await ensureDefaultAdmin();
  await seedDefaultProducts();
}

async function ensurePostgresSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      company TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      delivery_address TEXT DEFAULT '',
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT DEFAULT '',
      name TEXT NOT NULL,
      name_fr TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'Other',
      description TEXT NOT NULL DEFAULT '',
      description_fr TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      order_number TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      customer JSONB NOT NULL,
      items JSONB NOT NULL,
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query('CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders (user_id)');
  await pool.query("CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON orders (lower(customer->>'email'))");
  await pool.query('CREATE INDEX IF NOT EXISTS products_active_idx ON products (active)');
  await pool.query('CREATE INDEX IF NOT EXISTS users_role_idx ON users (role)');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL DEFAULT '{}'
    )
  `);
}

async function migrateJsonToPostgresIfEmpty() {
  if (!fs.existsSync(dbPath) || await countUsers()) return;

  const db = readDb();
  if (!db.users.length && !db.orders.length) return;

  for (const user of db.users) {
    await createUser({
      id: user.id || crypto.randomUUID(),
      name: user.name || user.company || user.email || 'Customer',
      email: String(user.email || '').toLowerCase(),
      role: user.role || 'customer',
      company: user.company || '',
      phone: user.phone || '',
      deliveryAddress: user.deliveryAddress || '',
      passwordHash: user.passwordHash,
      createdAt: user.createdAt || new Date().toISOString()
    });
  }

  for (const order of db.orders) {
    await createOrder({
      id: order.id || crypto.randomUUID(),
      userId: order.userId || null,
      orderNumber: order.orderNumber || await createOrderNumber(),
      createdAt: order.createdAt || new Date().toISOString(),
      status: order.status || 'new',
      customer: order.customer || {},
      items: Array.isArray(order.items) ? order.items : []
    });
  }

  console.log(`Imported ${db.users.length} users and ${db.orders.length} orders from data/db.json into PostgreSQL.`);
}

async function ensureDefaultAdmin() {
  if (await countUsers()) return;

  const email = process.env.ADMIN_EMAIL || 'jorgerensoraji@hotmail.com';
  const password = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'ChangeMe123!');

  if (!password) {
    throw new Error('ADMIN_PASSWORD must be set before the first production start.');
  }

  await createUser({
    id: crypto.randomUUID(),
    name: 'Benito Admin',
    email,
    role: 'admin',
    company: '',
    phone: '',
    deliveryAddress: '',
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString()
  });

  console.log(`Default admin created: ${email}`);
}

async function seedDefaultProducts() {
  const existing = await listProducts({ includeInactive: true });
  if (existing.length > 0) return;

  for (const p of defaultProducts) {
    await createProduct({
      id: p.id,
      sku: p.sku || '',
      name: p.name,
      nameFr: p.nameFr,
      category: p.category,
      description: p.description,
      descriptionFr: p.descriptionFr,
      image: p.image,
      active: true,
      createdAt: new Date().toISOString()
    });
  }

  console.log(`Seeded ${defaultProducts.length} default products.`);
}

// ── Users ───────────────────────────────────────────────────────────────────

function readDb() {
  const raw = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  if (!Array.isArray(raw.products)) raw.products = [];
  if (!Array.isArray(raw.users)) raw.users = [];
  if (!Array.isArray(raw.orders)) raw.orders = [];
  if (!raw.settings || typeof raw.settings !== 'object') raw.settings = {};
  return raw;
}

function writeDb(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

async function countUsers() {
  if (pool) {
    const result = await pool.query('SELECT COUNT(*)::int AS count FROM users');
    return result.rows[0].count;
  }
  return readDb().users.length;
}

async function findUserByEmail(email) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) return null;

  if (pool) {
    const result = await pool.query('SELECT * FROM users WHERE lower(email) = $1 LIMIT 1', [cleanEmail]);
    return result.rows[0] ? mapPostgresUser(result.rows[0]) : null;
  }

  return readDb().users.find((u) => String(u.email || '').toLowerCase() === cleanEmail) || null;
}

async function findUserById(id) {
  if (!id) return null;

  if (pool) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
    return result.rows[0] ? mapPostgresUser(result.rows[0]) : null;
  }

  return readDb().users.find((u) => u.id === id) || null;
}

async function createUser(user) {
  if (pool) {
    await pool.query(
      `INSERT INTO users (id, name, email, role, company, phone, delivery_address, password_hash, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [user.id, user.name, user.email, user.role || 'customer', user.company || '',
       user.phone || '', user.deliveryAddress || '', user.passwordHash, user.createdAt]
    );
    return;
  }

  const db = readDb();
  db.users.push(user);
  writeDb(db);
}

async function updateUser(id, fields) {
  const allowed = ['name', 'phone', 'deliveryAddress', 'company'];
  const clean = {};
  allowed.forEach((key) => { if (fields[key] !== undefined) clean[key] = String(fields[key] || '').trim(); });

  if (!Object.keys(clean).length) return;

  if (pool) {
    const sets = [];
    const values = [];
    if (clean.name !== undefined) { sets.push(`name = $${sets.length + 1}`); values.push(clean.name); }
    if (clean.company !== undefined) { sets.push(`company = $${sets.length + 1}`); values.push(clean.company); }
    if (clean.phone !== undefined) { sets.push(`phone = $${sets.length + 1}`); values.push(clean.phone); }
    if (clean.deliveryAddress !== undefined) { sets.push(`delivery_address = $${sets.length + 1}`); values.push(clean.deliveryAddress); }
    values.push(id);
    await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${values.length}`, values);
    return;
  }

  const db = readDb();
  const user = db.users.find((u) => u.id === id);
  if (user) Object.assign(user, clean);
  writeDb(db);
}

async function listCustomers() {
  if (pool) {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.company, u.phone, u.delivery_address, u.created_at,
             COUNT(o.id)::int AS order_count,
             MAX(o.created_at) AS last_order_at
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      company: row.company || '',
      phone: row.phone || '',
      deliveryAddress: row.delivery_address || '',
      createdAt: toIsoString(row.created_at),
      orderCount: row.order_count,
      lastOrderAt: row.last_order_at ? toIsoString(row.last_order_at) : null
    }));
  }

  const db = readDb();
  const customers = db.users.filter((u) => u.role === 'customer');
  return customers.map((u) => {
    const userOrders = db.orders.filter((o) =>
      o.userId === u.id || String(o.customer && o.customer.email || '').toLowerCase() === u.email.toLowerCase()
    );
    const lastOrder = userOrders[0];
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      company: u.company || '',
      phone: u.phone || '',
      deliveryAddress: u.deliveryAddress || '',
      createdAt: u.createdAt,
      orderCount: userOrders.length,
      lastOrderAt: lastOrder ? lastOrder.createdAt : null
    };
  });
}

// ── Products ─────────────────────────────────────────────────────────────────

async function listProducts({ includeInactive = false } = {}) {
  if (pool) {
    const where = includeInactive ? '' : 'WHERE active = TRUE';
    const result = await pool.query(`SELECT * FROM products ${where} ORDER BY category, name`);
    return result.rows.map(mapPostgresProduct);
  }

  const db = readDb();
  const all = db.products || [];
  return includeInactive ? all : all.filter((p) => p.active !== false);
}

async function findProductById(id) {
  if (pool) {
    const result = await pool.query('SELECT * FROM products WHERE id = $1 LIMIT 1', [id]);
    return result.rows[0] ? mapPostgresProduct(result.rows[0]) : null;
  }
  const db = readDb();
  return (db.products || []).find((p) => p.id === id) || null;
}

async function createProduct(product) {
  const p = {
    id: product.id || crypto.randomUUID(),
    sku: String(product.sku || '').trim(),
    name: String(product.name || '').trim(),
    nameFr: String(product.nameFr || '').trim(),
    category: String(product.category || 'Other').trim(),
    description: String(product.description || '').trim(),
    descriptionFr: String(product.descriptionFr || '').trim(),
    image: String(product.image || '').trim(),
    active: product.active !== false,
    createdAt: product.createdAt || new Date().toISOString()
  };

  if (pool) {
    await pool.query(
      `INSERT INTO products (id, sku, name, name_fr, category, description, description_fr, image, active, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [p.id, p.sku, p.name, p.nameFr, p.category, p.description, p.descriptionFr, p.image, p.active, p.createdAt]
    );
    return p;
  }

  const db = readDb();
  db.products.push(p);
  writeDb(db);
  return p;
}

async function updateProduct(id, fields) {
  const allowed = ['sku', 'name', 'nameFr', 'category', 'description', 'descriptionFr', 'image', 'active'];
  const clean = {};
  allowed.forEach((key) => { if (fields[key] !== undefined) clean[key] = fields[key]; });

  if (!Object.keys(clean).length) return null;

  if (pool) {
    const colMap = { sku: 'sku', name: 'name', nameFr: 'name_fr', category: 'category',
      description: 'description', descriptionFr: 'description_fr', image: 'image', active: 'active' };
    const sets = [];
    const values = [];
    Object.keys(clean).forEach((key) => {
      sets.push(`${colMap[key]} = $${sets.length + 1}`);
      values.push(clean[key]);
    });
    values.push(id);
    const result = await pool.query(
      `UPDATE products SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    return result.rows[0] ? mapPostgresProduct(result.rows[0]) : null;
  }

  const db = readDb();
  const idx = (db.products || []).findIndex((p) => p.id === id);
  if (idx === -1) return null;
  Object.assign(db.products[idx], clean);
  writeDb(db);
  return db.products[idx];
}

async function deactivateProduct(id) {
  return updateProduct(id, { active: false });
}

// ── Orders ────────────────────────────────────────────────────────────────────

async function createOrder(order) {
  if (pool) {
    await pool.query(
      `INSERT INTO orders (id, user_id, order_number, status, customer, items, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [order.id, order.userId, order.orderNumber, order.status,
       JSON.stringify(order.customer), JSON.stringify(order.items), order.createdAt]
    );
    return;
  }

  const db = readDb();
  db.orders.unshift(order);
  writeDb(db);
}

async function listOrders({ status, search } = {}) {
  if (pool) {
    let where = '';
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      conditions.push(`(lower(customer->>'company') LIKE $${params.length} OR lower(customer->>'email') LIKE $${params.length})`);
    }
    if (conditions.length) where = `WHERE ${conditions.join(' AND ')}`;

    const result = await pool.query(`SELECT * FROM orders ${where} ORDER BY created_at DESC`, params);
    return result.rows.map(mapPostgresOrder);
  }

  let orders = readDb().orders;
  if (status) orders = orders.filter((o) => o.status === status);
  if (search) {
    const q = search.toLowerCase();
    orders = orders.filter((o) =>
      String(o.customer && o.customer.company || '').toLowerCase().includes(q) ||
      String(o.customer && o.customer.email || '').toLowerCase().includes(q)
    );
  }
  return orders;
}

async function listOrdersForUser(user) {
  if (pool) {
    const result = await pool.query(
      `SELECT * FROM orders
       WHERE user_id = $1 OR lower(customer->>'email') = $2
       ORDER BY created_at DESC`,
      [user.id, String(user.email || '').toLowerCase()]
    );
    return result.rows.map(mapPostgresOrder);
  }

  const userEmail = user.email.toLowerCase();
  return readDb().orders.filter((o) => {
    const orderEmail = String(o.customer && o.customer.email || '').toLowerCase();
    return o.userId === user.id || orderEmail === userEmail;
  });
}

async function updateOrderStatus(id, status) {
  if (pool) {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id',
      [status, id]
    );
    return result.rowCount > 0;
  }

  const db = readDb();
  const order = db.orders.find((o) => o.id === id);
  if (!order) return false;
  order.status = status;
  writeDb(db);
  return true;
}

async function getAdminStats() {
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  if (pool) {
    const [ordersResult, customersResult, statusResult, productResult] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE created_at > $1)::int AS this_week,
          COUNT(*) FILTER (WHERE created_at > $2)::int AS this_month
        FROM orders
      `, [weekAgo, monthAgo]),
      pool.query("SELECT COUNT(*)::int AS total FROM users WHERE role = 'customer'"),
      pool.query(`
        SELECT status, COUNT(*)::int AS count FROM orders GROUP BY status
      `),
      pool.query(`
        SELECT elem->>'productId' AS product_id, elem->>'name' AS name,
               SUM((elem->>'quantity')::numeric)::int AS total_qty
        FROM orders, jsonb_array_elements(items) AS elem
        GROUP BY elem->>'productId', elem->>'name'
        ORDER BY total_qty DESC
        LIMIT 5
      `)
    ]);

    const byStatus = {};
    statusResult.rows.forEach((r) => { byStatus[r.status] = r.count; });

    const recentOrders = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5');

    return {
      totalOrders: ordersResult.rows[0].total,
      ordersThisWeek: ordersResult.rows[0].this_week,
      ordersThisMonth: ordersResult.rows[0].this_month,
      totalCustomers: customersResult.rows[0].total,
      ordersByStatus: byStatus,
      topProducts: productResult.rows.map((r) => ({ productId: r.product_id, name: r.name, totalQty: r.total_qty })),
      recentOrders: recentOrders.rows.map(mapPostgresOrder)
    };
  }

  const db = readDb();
  const orders = db.orders;
  const customers = db.users.filter((u) => u.role === 'customer');

  const byStatus = {};
  const productCount = {};
  orders.forEach((o) => {
    byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    (o.items || []).forEach((item) => {
      const key = item.productId || item.name;
      productCount[key] = productCount[key] || { name: item.name, totalQty: 0 };
      productCount[key].totalQty += Number(item.quantity) || 0;
    });
  });

  const topProducts = Object.entries(productCount)
    .sort(([, a], [, b]) => b.totalQty - a.totalQty)
    .slice(0, 5)
    .map(([productId, data]) => ({ productId, name: data.name, totalQty: data.totalQty }));

  return {
    totalOrders: orders.length,
    ordersThisWeek: orders.filter((o) => o.createdAt > weekAgo).length,
    ordersThisMonth: orders.filter((o) => o.createdAt > monthAgo).length,
    totalCustomers: customers.length,
    ordersByStatus: byStatus,
    topProducts,
    recentOrders: orders.slice(0, 5)
  };
}

// ── Settings ──────────────────────────────────────────────────────────────────

async function getSettings() {
  if (pool) {
    const result = await pool.query("SELECT value FROM settings WHERE key = 'companyInfo' LIMIT 1");
    if (result.rows[0]) return { ...defaultSettings, ...result.rows[0].value };
    return { ...defaultSettings };
  }
  const db = readDb();
  return { ...defaultSettings, ...(db.settings.companyInfo || {}) };
}

async function updateSettings(fields) {
  const allowed = ['companyName', 'companySubtitle', 'companyAddress', 'companyPhone', 'companyFax', 'logoPath'];
  const current = await getSettings();
  const updated = { ...current };
  allowed.forEach((key) => { if (fields[key] !== undefined) updated[key] = String(fields[key] || '').trim(); });

  if (pool) {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ('companyInfo', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1`,
      [JSON.stringify(updated)]
    );
    return updated;
  }
  const db = readDb();
  db.settings.companyInfo = updated;
  writeDb(db);
  return updated;
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapPostgresUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    company: row.company || '',
    phone: row.phone || '',
    deliveryAddress: row.delivery_address || '',
    passwordHash: row.password_hash,
    createdAt: toIsoString(row.created_at)
  };
}

function mapPostgresOrder(row) {
  return {
    id: row.id,
    userId: row.user_id,
    orderNumber: row.order_number,
    createdAt: toIsoString(row.created_at),
    status: row.status,
    customer: row.customer || {},
    items: row.items || []
  };
}

function mapPostgresProduct(row) {
  return {
    id: row.id,
    sku: row.sku || '',
    name: row.name,
    nameFr: row.name_fr || '',
    category: row.category,
    description: row.description || '',
    descriptionFr: row.description_fr || '',
    image: row.image || '',
    active: row.active,
    createdAt: toIsoString(row.created_at)
  };
}

function toIsoString(value) {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

// ── Auth helpers (password only — sessions stay in auth.js) ──────────────────

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${key}`;
}

async function createOrderNumber() {
  const year = new Date().getFullYear();

  if (pool) {
    const result = await pool.query(
      `INSERT INTO settings (key, value)
       VALUES ('orderCounter', jsonb_build_object('year', $1::int, 'seq', 1))
       ON CONFLICT (key) DO UPDATE
         SET value = CASE
           WHEN (settings.value->>'year')::int = $1::int
           THEN jsonb_build_object('year', $1::int, 'seq', (settings.value->>'seq')::int + 1)
           ELSE jsonb_build_object('year', $1::int, 'seq', 1)
         END
       RETURNING value`,
      [year]
    );
    const { year: y, seq } = result.rows[0].value;
    return `${y}-${String(seq).padStart(5, '0')}`;
  }

  const db = readDb();
  const counter = db.settings.orderCounter || { year: 0, seq: 0 };
  if (counter.year !== year) {
    counter.year = year;
    counter.seq = 1;
  } else {
    counter.seq += 1;
  }
  db.settings.orderCounter = counter;
  writeDb(db);
  return `${year}-${String(counter.seq).padStart(5, '0')}`;
}

module.exports = {
  initStorage,
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  listCustomers,
  countUsers,
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
};
