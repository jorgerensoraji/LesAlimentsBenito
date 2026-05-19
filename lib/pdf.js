'use strict';

const fs   = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────
function createOrderSheetPdf(order, settings = {}) {
  const pageWidth  = 612;
  const pageHeight = 792;

  // Try to embed logo as JPEG (PNG is not supported in pure-JS PDF — needs zlib).
  // Falls back gracefully to drawn text logo when logo is PNG or file is missing.
  let logoImg = null;
  if (settings.logoPath) {
    try {
      const imgPath = path.join(__dirname, '..', 'public', settings.logoPath.replace(/^\//, ''));
      const imgBuf  = fs.readFileSync(imgPath);
      const dims    = parseJpegDims(imgBuf);
      if (dims) logoImg = { buf: imgBuf, ...dims };
    } catch (_) { /* file missing or unreadable — use text logo */ }
  }

  const hasLogo   = Boolean(logoImg);
  const content   = buildOrderSheetContent(order, settings, hasLogo);
  const contentBuf = Buffer.from(content, 'utf8');

  // Resources dict (shared between Page object and content stream)
  let res = '/Font << /F1 3 0 R /F2 4 0 R >> ';
  res    += '/ExtGState << /TransState << /Type /ExtGState /ca 0.35 /CA 0.35 >> >> ';
  if (hasLogo) res += '/XObject << /Im1 7 0 R >> ';

  // Build PDF as binary Buffer chunks so raw JPEG bytes survive intact
  const chunks  = [];
  const offsets = {};
  const bodyLen = () => chunks.reduce((s, c) => s + c.length, 0);

  function obj(num, text) {
    offsets[num] = bodyLen();
    chunks.push(Buffer.from(`${num} 0 obj\n${text}\nendobj\n`, 'utf8'));
  }

  chunks.push(Buffer.from('%PDF-1.4\n', 'utf8'));

  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [5 0 R] /Count 1 >>');
  obj(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  obj(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  obj(5, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << ${res}>> /Contents 6 0 R >>`);

  // Object 6 — text content stream
  offsets[6] = bodyLen();
  chunks.push(Buffer.from(`6 0 obj\n<< /Length ${contentBuf.length} >>\nstream\n`, 'utf8'));
  chunks.push(contentBuf);
  chunks.push(Buffer.from('\nendstream\nendobj\n', 'utf8'));

  // Object 7 — JPEG image XObject (only present when logo is a JPEG)
  if (hasLogo) {
    offsets[7] = bodyLen();
    chunks.push(Buffer.from(
      `7 0 obj\n` +
      `<< /Type /XObject /Subtype /Image` +
      ` /Width ${logoImg.width} /Height ${logoImg.height}` +
      ` /ColorSpace ${logoImg.colorSpace} /BitsPerComponent 8` +
      ` /Filter /DCTDecode /Length ${logoImg.buf.length} >>\nstream\n`,
      'utf8'
    ));
    chunks.push(logoImg.buf); // raw JPEG bytes — safe in Buffer concat
    chunks.push(Buffer.from('\nendstream\nendobj\n', 'utf8'));
  }

  const numObjs   = hasLogo ? 8 : 7;
  const xrefOffset = bodyLen();

  let xref = `xref\n0 ${numObjs}\n0000000000 65535 f \n`;
  for (let i = 1; i < numObjs; i++) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${numObjs} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  chunks.push(Buffer.from(xref, 'utf8'));

  return Buffer.concat(chunks);
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants
//   L=30  R=582  W=552
//   Header:          y 692 → 782  (90 pt)
//   Date row:        y 670 → 692  (22 pt)
//   Customer block:  y 562 → 670  (108 pt)
//   Table:           y  58 → 562  (504 pt → 27 data rows @ 18 pt)
//   Footer:          y  10 →  58
// ─────────────────────────────────────────────────────────────────────────────
function buildOrderSheetContent(order, settings = {}, hasLogo = false) {
  const cmd = [];
  const L = 30;
  const R = 582;
  const W = R - L; // 552

  const date     = new Date(order.createdAt).toLocaleDateString('fr-CA');
  const orderNum = String(order.orderNumber || '');

  const companyName    = settings.companyName    || 'LES ALIMENTS BENITO';
  const companySubtitle= settings.companySubtitle|| '1241 5801 CANADA INC.';
  const companyAddress = settings.companyAddress || '11525, 4ieme Avenue, R.D.P., QC  H1E 2Y8';
  const companyPhone   = settings.companyPhone   || 'Tel.: (514) 723-2378';
  const companyFax     = settings.companyFax     || 'Fax: (514) 723-3231';
  const companyContact = `${companyPhone}   *   ${companyFax}`;

  // ══════════════════════════════════════════════════════════
  // HEADER  (y: 692 → 782)
  // ══════════════════════════════════════════════════════════
  const hTop = 782;
  const hBot = 692;
  const logoR = L + 152;   // right edge of logo box
  const numL  = R - 86;    // left edge of order-number box

  pdfRect(cmd, L, hBot, W, hTop - hBot, 1.2);           // outer border
  pdfRect(cmd, L, hBot, logoR - L, hTop - hBot, 0.8);   // logo box

  if (hasLogo) {
    // Render the embedded JPEG scaled to fill the logo box
    cmd.push('q');
    cmd.push(`${logoR - L} 0 0 ${hTop - hBot} ${L} ${hBot} cm`);
    cmd.push('/Im1 Do');
    cmd.push('Q');
  } else {
    // Drawn text fallback (used when logo is PNG or not set)
    txt(cmd, 'LES ALIMENTS', L + 6, hBot + 62, 8,  { color: RED });
    txt(cmd, 'BENITO',        L + 4, hBot + 44, 18, { bold: true, color: RED });
    cmd.push('0 G 0.6 w');
    const hx = L + 76;
    const hy = hBot + 28;
    cmd.push(`${hx - 16} ${hy + 10} m ${hx - 16} ${hy + 36} ${hx + 16} ${hy + 36} ${hx + 16} ${hy + 10} c S`);
    cmd.push(`${hx - 22} ${hy + 8} m ${hx + 22} ${hy + 8} l S`);
    cmd.push(`${hx - 22} ${hy + 2} m ${hx + 22} ${hy + 2} l S`);
    cmd.push(`${hx - 22} ${hy + 2} m ${hx - 22} ${hy + 10} l S`);
    cmd.push(`${hx + 22} ${hy + 2} m ${hx + 22} ${hy + 10} l S`);
    cmd.push(`${hx - 14} ${hy} m ${hx - 18} ${hy - 18} l S`);
    cmd.push(`${hx + 14} ${hy} m ${hx + 18} ${hy - 18} l S`);
    cmd.push(`${hx - 18} ${hy - 18} m ${hx + 18} ${hy - 18} l S`);
  }

  // Company name block (between logo box and number box)
  const cL = logoR + 4;
  const cR = numL - 4;
  ctr(cmd, companyName,    cL, cR, hTop - 22, 17, { bold: true, color: RED });
  ctr(cmd, companySubtitle,cL, cR, hTop - 38,  9);
  line(cmd, cL + 4, hTop - 45, cR - 4, hTop - 45, 0.5);
  ctr(cmd, companyAddress, cL, cR, hTop - 58, 8);
  ctr(cmd, companyContact, cL, cR, hTop - 70, 8);

  // Order number box (right)
  pdfRect(cmd, numL, hBot, R - numL, hTop - hBot, 0.8);
  ctr(cmd, 'BON DE',    numL, R, hTop - 14, 8);
  ctr(cmd, 'COMMANDE',  numL, R, hTop - 25, 8);
  line(cmd, numL + 6, hTop - 31, R - 6, hTop - 31, 0.5);
  ctr(cmd, 'No.',       numL, R, hTop - 43, 8, { bold: true });
  ctr(cmd, orderNum,    numL, R, hTop - 66, 18, { bold: true, color: RED });

  // ══════════════════════════════════════════════════════════
  // DATE ROW  (y: 670 → 692)
  // ══════════════════════════════════════════════════════════
  const dateTop = hBot;
  const dateBot = dateTop - 22;
  pdfRect(cmd, L, dateBot, W, 22, 0.8);
  txt(cmd, 'DATE :', L + 6, dateBot + 7, 9, { bold: true });
  line(cmd, L + 50, dateBot + 3, L + 210, dateBot + 3, 0.5);
  txt(cmd, date, L + 54, dateBot + 7, 9);

  // ══════════════════════════════════════════════════════════
  // CUSTOMER BLOCK  (y: 562 → 670)
  // ══════════════════════════════════════════════════════════
  const custTop = dateBot;
  const custBot = custTop - 108;
  const midX    = L + Math.round(W / 2); // 306

  pdfRect(cmd, L, custBot, W, custTop - custBot, 0.8);
  line(cmd, midX, custBot, midX, custTop, 0.8);

  // VENDU À / SOLD TO
  txt(cmd, 'VENDU A  /', L + 4, custTop - 14, 8, { bold: true, color: RED });
  txt(cmd, 'SOLD TO  :', L + 4, custTop - 26, 8, { color: RED });

  const labW = 74;
  const vX   = L + labW;
  const ly1  = custTop - 38;
  const ly2  = custTop - 62;
  const ly3  = custTop - 86;

  line(cmd, vX, ly1, midX - 6, ly1, 0.5);
  line(cmd, vX, ly2, midX - 6, ly2, 0.5);
  line(cmd, vX, ly3, midX - 6, ly3, 0.5);

  txt(cmd, trunc(order.customer.company || '', 32), vX + 2, ly1 + 4, 9);
  txt(cmd, trunc(order.customer.contact || '', 32), vX + 2, ly2 + 4, 9);
  txt(cmd, trunc(order.customer.phone   || '', 32), vX + 2, ly3 + 4, 9);

  // EXPÉDIEZ À / SHIP TO
  txt(cmd, 'EXPEDIEZ A  /', midX + 4, custTop - 14, 8, { bold: true, color: RED });
  txt(cmd, 'SHIP TO  :',    midX + 4, custTop - 26, 8, { color: RED });

  const sX = midX + labW;
  line(cmd, sX, ly1, R - 6, ly1, 0.5);
  line(cmd, sX, ly2, R - 6, ly2, 0.5);
  line(cmd, sX, ly3, R - 6, ly3, 0.5);

  const addr = order.customer.deliveryAddress || order.customer.company || '';
  const addrLines = wrapText(addr, 28);
  txt(cmd, trunc(addrLines[0] || '',                         28), sX + 2, ly1 + 4, 9);
  txt(cmd, trunc(addrLines[1] || order.customer.email || '', 28), sX + 2, ly2 + 4, 9);
  txt(cmd, trunc(order.customer.email || '',                 28), sX + 2, ly3 + 4, 9);

  // ══════════════════════════════════════════════════════════
  // TABLE  (y: 58 → 562)
  //   CODE | QTÉ/QTY | DESCRIPTION | POIDS/WEIGHT | PRIX/PRICE | MONTANT/AMOUNT
  //    42  |   45    |     260      |      65      |     65     |       75
  // ══════════════════════════════════════════════════════════
  const tTop   = custBot;
  const tBot   = 58;
  const rowH   = 18;
  const maxRows = Math.floor((tTop - tBot - rowH) / rowH); // 27

  const cols = [L, L + 42, L + 87, L + 347, L + 412, L + 477, R];

  cmd.push('0.95 0.95 0.92 rg');
  cmd.push(`${L} ${tBot} ${W} ${tTop - tBot} re f`);
  cmd.push('0.78 0.78 0.74 rg');
  cmd.push(`${L} ${tTop - rowH} ${W} ${rowH} re f`);
  cmd.push('0 g');

  cols.forEach(x => line(cmd, x, tBot, x, tTop, 0.5));

  for (let r = 0; ; r++) {
    const y = tTop - r * rowH;
    if (y < tBot) break;
    line(cmd, L, y, R, y, (r === 0 || r === 1) ? 1 : 0.25);
  }
  line(cmd, L, tBot, R, tBot, 1);

  ctr(cmd, 'CODE',        cols[0], cols[1], tTop - 10, 8, { bold: true });
  ctr(cmd, 'QTE / QTY',  cols[1], cols[2], tTop - 10, 7, { bold: true });
  ctr(cmd, 'DESCRIPTION',cols[2], cols[3], tTop - 10, 9, { bold: true });
  ctr(cmd, 'POIDS',       cols[3], cols[4], tTop -  7, 8, { bold: true });
  ctr(cmd, 'WEIGHT',      cols[3], cols[4], tTop - 14, 6);
  ctr(cmd, 'PRIX',        cols[4], cols[5], tTop -  7, 8, { bold: true });
  ctr(cmd, 'PRICE',       cols[4], cols[5], tTop - 14, 6);
  ctr(cmd, 'MONTANT',     cols[5], cols[6], tTop -  7, 8, { bold: true });
  ctr(cmd, 'AMOUNT',      cols[5], cols[6], tTop - 14, 6);

  (order.items || []).slice(0, maxRows).forEach((item, i) => {
    const y = tTop - (i + 2) * rowH + 5;
    const nameText = item.notes
      ? trunc(`${item.name} (${item.notes})`, 44)
      : trunc(item.name || '', 44);
    ctr(cmd, String(i + 1).padStart(3, '0'), cols[0], cols[1], y, 8);
    ctr(cmd, String(item.quantity || ''),    cols[1], cols[2], y, 9);
    txt(cmd, nameText, cols[2] + 4, y, 9, { bold: true });
    if (item.unit) ctr(cmd, trunc(item.unit, 8), cols[3], cols[4], y, 8);
  });

  // ══════════════════════════════════════════════════════════
  // WATERMARK — diagonal, 35% opacity via ExtGState
  // ══════════════════════════════════════════════════════════
  cmd.push('q');
  cmd.push('/TransState gs');
  cmd.push('0.88 0.74 0.74 rg');
  cmd.push('1 0.52 -0.52 1 128 -30 cm');
  cmd.push('BT /F2 40 Tf 0 0 Td (' + escapePdf('BON DE COMMANDE') + ') Tj ET');
  cmd.push('Q');

  // ══════════════════════════════════════════════════════════
  // FOOTER  (y: 10 → 58)
  // ══════════════════════════════════════════════════════════
  line(cmd, L, tBot, R, tBot, 1.4);

  txt(cmd, "Nous n'acceptons pas de reclamation apres votre signature.", L, tBot - 13, 7);
  txt(cmd, 'We do not accept any claim after your signature.',           L, tBot - 23, 7);
  txt(cmd, 'CONDITIONS: NET 7 JOURS  *  TERMS NET 7 DAYS',              L, tBot - 33, 7);

  ctr(cmd, "SIGNATURE DE L'ACHETEUR", 215, 435, tBot - 12, 8, { bold: true });
  ctr(cmd, "BUYER'S SIGNATURE",       215, 435, tBot - 22, 7);
  line(cmd, 336, tBot - 34, 462, tBot - 34, 0.5);

  pdfRect(cmd, R - 82, tBot - 42, 82, 40, 1.2);
  ctr(cmd, 'TOTAL', R - 82, R, tBot - 18, 12, { bold: true });

  return cmd.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// JPEG dimension parser — reads width/height/colorspace from SOF marker.
// Returns null for any non-JPEG file (PNG, GIF, WebP, etc.).
// ─────────────────────────────────────────────────────────────────────────────
function parseJpegDims(buf) {
  if (buf.length < 4 || buf[0] !== 0xFF || buf[1] !== 0xD8) return null;
  let i = 2;
  while (i + 1 < buf.length) {
    if (buf[i] !== 0xFF) return null;
    const m = buf[i + 1];
    // SOF0 (baseline), SOF1 (extended sequential), SOF2 (progressive)
    if (m === 0xC0 || m === 0xC1 || m === 0xC2) {
      if (i + 9 >= buf.length) return null;
      const h = (buf[i + 5] << 8) | buf[i + 6];
      const w = (buf[i + 7] << 8) | buf[i + 8];
      const c = buf[i + 9];
      return {
        width: w,
        height: h,
        colorSpace: c === 1 ? '/DeviceGray' : c === 4 ? '/DeviceCMYK' : '/DeviceRGB'
      };
    }
    // Markers with no payload length (SOI, EOI, etc.)
    if (m === 0xD8 || m === 0xD9 || m === 0x01) { i += 2; continue; }
    if (i + 3 >= buf.length) return null;
    const segLen = (buf[i + 2] << 8) | buf[i + 3];
    i += 2 + segLen;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawing primitives
// ─────────────────────────────────────────────────────────────────────────────
const RED = [0.82, 0.06, 0.06];

function pdfRect(cmd, x, y, w, h, lw) {
  cmd.push(`0 G ${lw} w ${x} ${y} ${w} ${h} re S`);
}

function line(cmd, x1, y1, x2, y2, lw) {
  cmd.push(`0 G ${lw} w ${x1} ${y1} m ${x2} ${y2} l S`);
}

function txt(cmd, text, x, y, size, opts = {}) {
  const font = opts.bold ? 'F2' : 'F1';
  const c = opts.color;
  if (c) {
    if (Array.isArray(c)) cmd.push(`${c[0]} ${c[1]} ${c[2]} rg`);
    else cmd.push(c);
  } else {
    cmd.push('0 g');
  }
  cmd.push(`BT /${font} ${size} Tf ${x} ${y} Td (${escapePdf(text)}) Tj ET`);
  if (c) cmd.push('0 g');
}

function ctr(cmd, text, x1, x2, y, size, opts = {}) {
  const textW = String(text || '').length * size * 0.52;
  const x = x1 + Math.max(0, (x2 - x1 - textW) / 2);
  txt(cmd, text, x, y, size, opts);
}

function trunc(str, max) {
  str = String(str || '');
  return str.length > max ? str.slice(0, max - 1) + '~' : str;
}

function wrapText(str, cols) {
  const words = String(str || '').split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (test.length > cols && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function escapePdf(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

module.exports = { createOrderSheetPdf };
