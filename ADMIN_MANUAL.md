# Les Aliments Benito — Admin Manual

> Last updated: 2026-05-19

---

## Table of Contents

1. [How to Access the Admin Site](#1-how-to-access-the-admin-site)
2. [Dashboard Tab](#2-dashboard-tab)
3. [Orders Tab](#3-orders-tab)
4. [Products Tab](#4-products-tab)
5. [Customers Tab](#5-customers-tab)
6. [Settings Tab — Company Info & Logo](#6-settings-tab--company-info--logo)
7. [How Order Numbers Work](#7-how-order-numbers-work)
8. [How PDFs Are Generated](#8-how-pdfs-are-generated)
9. [How Emails Are Sent](#9-how-emails-are-sent)
10. [Making Code Changes and Pushing to GitHub](#10-making-code-changes-and-pushing-to-github)
11. [Environment Variables Reference](#11-environment-variables-reference)
12. [File & Folder Reference](#12-file--folder-reference)

---

## 1. How to Access the Admin Site

### Live site (Render)
```
https://<your-render-app>.onrender.com/admin
```

### Local development
```
http://localhost:3000/admin
```

**Default credentials** are set in your `.env` file:
```
ADMIN_USER=admin
ADMIN_PASS=yourpassword
```

If the login page appears, enter those credentials. On success you are redirected to `/admin`.

---

## 2. Dashboard Tab

The first tab you see after logging in. Shows:

| Card | What it counts |
|---|---|
| Total Orders | All orders ever submitted |
| New (pending) | Orders with status = `new` |
| This Month | Orders placed in the current calendar month |
| This Week | Orders placed in the current calendar week (Mon–Sun) |
| Customers | Unique companies that have placed at least one order |

**Recent Orders** — shows the last 10 orders with a quick status badge.  
**Top Products** — shows the 5 most-ordered products by quantity across all orders.

These numbers update every time you load the Dashboard tab. Refresh the page or click the tab again to get fresh numbers.

---

## 3. Orders Tab

### Viewing orders
Click the **Orders** tab. All orders appear in a table:

| Column | Meaning |
|---|---|
| Order # | Sequential number like `2026-0001` |
| Date | When the order was placed |
| Company | Customer's company name |
| Email | Customer's email |
| Items | Number of product lines ordered |
| Status | Current order status |

### Filtering
- Type in the **search box** to filter by company name or email (partial match works).
- Use the **status dropdown** to show only orders of one status.
- Click **Filter** to apply. Leave both empty and click Filter to reset.

### Changing an order status
Click the **status badge** on any order row. A small dropdown appears with these options:

- `new` — just received, not yet processed
- `processing` — being prepared
- `ready` — ready for pickup / delivery
- `delivered` — completed
- `cancelled` — cancelled

Select a status and it saves immediately (no page reload needed).

### Viewing order details
Click anywhere on an order row (except the status badge) to expand it and see:
- Full customer info (contact, phone, delivery address, message)
- Full product list with quantities and units

---

## 4. Products Tab

### Adding a product
1. Click **+ Add Product** (top right of the tab).
2. Fill in the form:
   - **Name (EN)** — required. English product name shown to customers.
   - **Name (FR)** — French translation (shown when customer switches to FR).
   - **Category** — Beef, Chicken, Pork, Lamb, Specialty, Grocery, Other.
   - **SKU / Code** — optional internal code.
   - **Description (EN / FR)** — optional short description.
   - **Product Image** — optional image file (JPG, PNG, WebP, etc.).
3. Click **Save Product**.

### Editing a product
Click the **Edit** (pencil) icon on any product card. The same form opens pre-filled. Make changes and click **Save Product**.

### Deleting a product
Click the **Delete** (trash) icon on a product card. You will be asked to confirm. Once deleted the product disappears from the customer order form immediately.

### Product image tips
- Images are stored in `public/image/products/` on the server.
- Recommended size: 400×400 px square, under 500 KB.
- If no image is uploaded, a grey placeholder is shown.

---

## 5. Customers Tab

Shows every unique company that has ever placed an order.

| Column | Meaning |
|---|---|
| Company | Company name from their order |
| Contact | Contact person name |
| Email | Email address |
| Phone | Phone number |
| Orders | Total number of orders placed |
| Last Order | Date of their most recent order |
| Since | Date of their very first order |

Customers are **read-only** — they are created automatically when a customer submits an order. There is no manual customer creation.

---

## 6. Settings Tab — Company Info & Logo

### Company info
These fields appear printed on every PDF order form:

| Field | Example |
|---|---|
| Company name | `LES ALIMENTS BENITO` |
| Company subtitle / legal name | `1241 5801 CANADA INC.` |
| Address | `11525, 4ieme Avenue, R.D.P., QC  H1E 2Y8` |
| Phone | `Tel.: (514) 723-2378` |
| Fax | `Fax: (514) 723-3231` |

1. Edit any field.
2. Click **Save company info**.
3. A green confirmation message appears. The change takes effect immediately on the next PDF generated.

### Logo
The logo appears in:
- The **website header** (top left on every page)
- The **top-left box** of every PDF order form

**To update the logo:**
1. Click **Choose File** and select your image.
   - PNG or JPEG both work for the website header.
   - **Use JPEG if you want the logo inside PDF order forms** (PNG also works now).
2. Click **Upload logo**.
3. The header on the current page updates instantly without a reload.
4. New PDFs will use the new logo.

**Logo file location on server:** `public/image/logo.jpg` (or `.png` depending on what you upload).

---

## 7. How Order Numbers Work

Order numbers are generated automatically and follow the format:

```
YYYY-NNNN
```

Examples: `2026-0001`, `2026-0042`, `2027-0001`

- The **year** resets the counter: when January 1st arrives the sequence starts back at `0001`.
- Numbers are **never reused** — even if an order is cancelled.
- On **Render (PostgreSQL)**: the counter is stored atomically in the database so two simultaneous orders never get the same number.
- On **local JSON mode**: stored in `data/db.json` under `settings.orderCounter`.

The code that generates order numbers is in `lib/storage.js` → `createOrderNumber()`.

---

## 8. How PDFs Are Generated

Every time an order is placed, a PDF is generated and attached to the email automatically. The PDF looks like the physical Les Aliments Benito order form.

Layout (top to bottom):
1. **Header** — logo box (left), company name/address (center), order number box (right, red)
2. **Date row** — `DATE:` with order date
3. **Customer block** — VENDU À / SOLD TO (left) and EXPÉDIEZ À / SHIP TO (right)
4. **Product table** — CODE | QTÉ/QTY | DESCRIPTION | POIDS/WEIGHT | PRIX/PRICE | MONTANT/AMOUNT
5. **Watermark** — diagonal "BON DE COMMANDE" in transparent red across the table
6. **Footer** — signature line and TOTAL box

The PDF code is in `lib/pdf.js`. No external PDF library is used — it is pure JavaScript writing raw PDF format.

**Important:** customers do not fill in prices. PRIX/PRICE and MONTANT/AMOUNT columns are left blank intentionally for the office to fill in by hand after receiving the order.

---

## 9. How Emails Are Sent

When a customer submits an order:
1. The order is saved to the database.
2. A PDF is generated (see above).
3. An email is sent to **two recipients**:
   - The business (configured in `ORDER_EMAIL` env variable)
   - The customer (their email from the order form)

The email includes the PDF as an attachment named `2026-0001.pdf` (matching the order number).

### Email providers (configured via environment variables)

| Priority | Provider | Env variable needed |
|---|---|---|
| 1st | Google Apps Script | `GOOGLE_SCRIPT_URL` |
| 2nd | Resend API | `RESEND_API_KEY` |
| 3rd | SMTP (Gmail etc.) | `SMTP_USER` + `SMTP_PASS` |

Only one is used at a time — whichever is configured first in that priority order.

The email code is in `lib/email.js`.

---

## 10. Making Code Changes and Pushing to GitHub

### One-time setup (already done)
The project is connected to GitHub at:
```
https://github.com/jorgerensoraji/LesAlimentsBenito.git
```
Render.com auto-deploys every time you push to the `main` branch.

### Workflow for making a change

**Step 1 — Make your code edits** (in VS Code, Claude Code, or any editor).

**Step 2 — Open a terminal** in the project folder:
```
d:\programs\PAGINA WEB BENITO\order de compra copia
```

**Step 3 — Check what changed:**
```bash
git status
```
This shows which files were modified.

**Step 4 — Stage the changed files:**
```bash
# Stage specific files (recommended):
git add lib/pdf.js
git add public/js/app.js
git add server.js

# Or stage everything at once:
git add .
```

**Step 5 — Commit with a message:**
```bash
git commit -m "Short description of what you changed"
```

**Step 6 — Push to GitHub:**
```bash
git push origin main
```

**Step 7 — Wait for Render to deploy** (usually 1–3 minutes). You can watch the deploy log at:
```
https://dashboard.render.com
```

### Common scenarios

#### I changed a product or order — no push needed
Database changes (adding products, updating order status) are saved live. No code push required.

#### I changed company info or the logo — no push needed
Settings are saved live via the admin Settings tab. No code push required.

#### I edited a `.js` or `.html` file — push required
```bash
git add <filename>
git commit -m "describe what you changed"
git push origin main
```

#### I want to see what I changed before committing:
```bash
git diff
```

#### I made a mistake and want to undo uncommitted changes:
```bash
git restore lib/pdf.js    # undo changes to one file
git restore .             # undo ALL uncommitted changes (careful!)
```

#### I want to see recent commits:
```bash
git log --oneline -10
```

---

## 11. Environment Variables Reference

Set these in your `.env` file locally, or in the Render dashboard under **Environment**.

| Variable | Required | Description |
|---|---|---|
| `ADMIN_USER` | Yes | Admin login username |
| `ADMIN_PASS` | Yes | Admin login password |
| `SESSION_SECRET` | Yes | Random string for session encryption |
| `ORDER_EMAIL` | Yes | Email address that receives order notifications |
| `DATABASE_URL` | No | PostgreSQL connection string (Render provides this) |
| `GOOGLE_SCRIPT_URL` | No | Google Apps Script web app URL for sending email |
| `GOOGLE_SCRIPT_SECRET` | No | Secret token checked by the Google Script |
| `RESEND_API_KEY` | No | Resend.com API key for sending email |
| `EMAIL_FROM` | No | Sender address shown in emails |
| `SMTP_HOST` | No | SMTP server host (default: smtp.gmail.com) |
| `SMTP_PORT` | No | SMTP port (default: 587) |
| `SMTP_USER` | No | SMTP username / Gmail address |
| `SMTP_PASS` | No | SMTP password or Gmail App Password |
| `SMTP_SECURE` | No | Set to `true` for port 465 TLS |
| `PORT` | No | Port to run on locally (default: 3000) |

**Gmail App Password note:** If using Gmail SMTP, you need a 16-character App Password (not your regular Gmail password). Generate one at: Google Account → Security → 2-Step Verification → App passwords.

---

## 12. File & Folder Reference

```
order de compra copia/
│
├── server.js              ← Express app + all API routes
├── package.json           ← Node.js dependencies
├── .env                   ← Environment variables (never commit this!)
├── ADMIN_MANUAL.md        ← This file
│
├── lib/
│   ├── pdf.js             ← PDF generation (pure JS, no library)
│   ├── email.js           ← Email sending (SMTP / Resend / Google Script)
│   └── storage.js         ← Database layer (PostgreSQL or JSON file)
│
├── data/
│   └── db.json            ← Local JSON database (used when no DATABASE_URL)
│
├── public/                ← Static files served to browsers
│   ├── index.html         ← Customer order form (homepage)
│   ├── admin.html         ← Admin panel
│   ├── css/
│   │   └── styles.css     ← All site styles
│   ├── js/
│   │   └── app.js         ← All frontend JavaScript
│   └── image/
│       ├── beni.png       ← Default logo
│       └── logo.*         ← Uploaded logo (set via admin Settings)
│
└── uploads/               ← Temporary upload staging folder
```

### Key API routes (for reference)

| Method | Route | What it does |
|---|---|---|
| `POST` | `/api/orders` | Customer submits an order |
| `GET` | `/api/admin/orders` | List all orders (admin only) |
| `PUT` | `/api/admin/orders/:id/status` | Update order status |
| `GET` | `/api/products` | List all products (public) |
| `POST` | `/api/admin/products` | Add a product (admin only) |
| `PUT` | `/api/admin/products/:id` | Edit a product (admin only) |
| `DELETE` | `/api/admin/products/:id` | Delete a product (admin only) |
| `GET` | `/api/settings` | Get company settings (public) |
| `PUT` | `/api/admin/settings` | Update company info (admin only) |
| `POST` | `/api/admin/logo` | Upload a new logo (admin only) |

---

*This manual covers the state of the project as of 2026-05-19. If you add new features, update this file and push it along with the code changes.*
