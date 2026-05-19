'use strict';

const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

// ─────────────────────────────────────────────────────────────────────────────
// Logo loader — tries JPEG, then PNG. Both return a PDF-embeddable blob.
// ─────────────────────────────────────────────────────────────────────────────
function loadLogoImg(settings) {
  if (!settings.logoPath) return null;
  try {
    const imgPath = path.join(__dirname, '..', 'public', settings.logoPath.replace(/^\//, ''));
    const buf = fs.readFileSync(imgPath);

    // JPEG: embed raw bytes with DCTDecode
    const jpeg = parseJpegDims(buf);
    if (jpeg) {
      return { idat: buf, width: jpeg.width, height: jpeg.height,
               colorSpace: jpeg.colorSpace, filter: '/DCTDecode' };
    }

    // PNG: decode, strip alpha, re-compress as raw RGB/Gray with FlateDecode
    const png = parsePngForPdf(buf);
    if (png) {
      return { idat: png.idat, width: png.width, height: png.height,
               colorSpace: png.colorSpace, filter: '/FlateDecode' };
    }

    return null;
  } catch (_) { return null; }
}

// ─────────────────────────────────────────────────────────────────────────────
// createOrderSheetPdf — public API
// ─────────────────────────────────────────────────────────────────────────────
function createOrderSheetPdf(order, settings = {}) {
  const pageWidth  = 612;
  const pageHeight = 792;

  const logoImg = loadLogoImg(settings);
  const content = buildOrderSheetContent(order, settings, logoImg);
  const contentBuf = Buffer.from(content, 'utf8');

  let res = '/Font << /F1 3 0 R /F2 4 0 R >> ';
  res    += '/ExtGState << /TransState << /Type /ExtGState /ca 0.35 /CA 0.35 >> >> ';
  if (logoImg) res += '/XObject << /Im1 7 0 R >> ';

  // Build as binary Buffer chunks — raw image bytes survive intact in Buffer.concat
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

  offsets[6] = bodyLen();
  chunks.push(Buffer.from(`6 0 obj\n<< /Length ${contentBuf.length} >>\nstream\n`, 'utf8'));
  chunks.push(contentBuf);
  chunks.push(Buffer.from('\nendstream\nendobj\n', 'utf8'));

  if (logoImg) {
    offsets[7] = bodyLen();
    chunks.push(Buffer.from(
      `7 0 obj\n<< /Type /XObject /Subtype /Image` +
      ` /Width ${logoImg.width} /Height ${logoImg.height}` +
      ` /ColorSpace ${logoImg.colorSpace} /BitsPerComponent 8` +
      ` /Filter ${logoImg.filter} /Length ${logoImg.idat.length} >>\nstream\n`, 'utf8'
    ));
    chunks.push(logoImg.idat);
    chunks.push(Buffer.from('\nendstream\nendobj\n', 'utf8'));
  }

  const numObjs    = logoImg ? 8 : 7;
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
function buildOrderSheetContent(order, settings = {}, logoImg = null) {
  const cmd = [];
  const L = 30;
  const R = 582;
  const W = R - L;

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
  const logoR = L + 152;
  const numL  = R - 86;

  pdfRect(cmd, L, hBot, W, hTop - hBot, 1.2);
  pdfRect(cmd, L, hBot, logoR - L, hTop - hBot, 0.8);

  if (logoImg) {
    // Fit image inside logo box, preserving aspect ratio, centered
    const boxW = logoR - L;
    const boxH = hTop - hBot;
    const scale = Math.min(boxW / logoImg.width, boxH / logoImg.height);
    const imgW  = logoImg.width  * scale;
    const imgH  = logoImg.height * scale;
    const imgX  = L + (boxW - imgW) / 2;
    const imgY  = hBot + (boxH - imgH) / 2;
    cmd.push('q');
    cmd.push(`${imgW.toFixed(2)} 0 0 ${imgH.toFixed(2)} ${imgX.toFixed(2)} ${imgY.toFixed(2)} cm`);
    cmd.push('/Im1 Do');
    cmd.push('Q');
  } else {
    // Text fallback when no logo or unsupported format
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

  const cL = logoR + 4;
  const cR = numL - 4;
  ctr(cmd, companyName,    cL, cR, hTop - 22, 17, { bold: true, color: RED });
  ctr(cmd, companySubtitle,cL, cR, hTop - 38,  9);
  line(cmd, cL + 4, hTop - 45, cR - 4, hTop - 45, 0.5);
  ctr(cmd, companyAddress, cL, cR, hTop - 58, 8);
  ctr(cmd, companyContact, cL, cR, hTop - 70, 8);

  pdfRect(cmd, numL, hBot, R - numL, hTop - hBot, 0.8);
  ctr(cmd, 'BON DE',    numL, R, hTop - 14, 8);
  ctr(cmd, 'COMMANDE',  numL, R, hTop - 25, 8);
  line(cmd, numL + 6, hTop - 31, R - 6, hTop - 31, 0.5);
  ctr(cmd, 'No.',       numL, R, hTop - 43, 8, { bold: true });
  ctr(cmd, orderNum,    numL, R, hTop - 66, 16, { bold: true, color: RED });

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
  const midX    = L + Math.round(W / 2);

  pdfRect(cmd, L, custBot, W, custTop - custBot, 0.8);
  line(cmd, midX, custBot, midX, custTop, 0.8);

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
  // CODE | QTÉ/QTY | DESCRIPTION | POIDS/WEIGHT | PRIX/PRICE | MONTANT/AMOUNT
  // ══════════════════════════════════════════════════════════
  const tTop   = custBot;
  const tBot   = 58;
  const rowH   = 18;
  const maxRows = Math.floor((tTop - tBot - rowH) / rowH);

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
    const name = item.notes ? trunc(`${item.name} (${item.notes})`, 44) : trunc(item.name || '', 44);
    ctr(cmd, String(i + 1).padStart(3, '0'), cols[0], cols[1], y, 8);
    ctr(cmd, String(item.quantity || ''),    cols[1], cols[2], y, 9);
    txt(cmd, name, cols[2] + 4, y, 9, { bold: true });
    if (item.unit) ctr(cmd, trunc(item.unit, 8), cols[3], cols[4], y, 8);
  });

  // ══════════════════════════════════════════════════════════
  // WATERMARK — centered on table area, 35% opacity
  // Table center: x≈306  y≈310
  // Matrix 1 0.52 -0.52 1 150 229 → text midpoint lands at (306, 310)
  // ══════════════════════════════════════════════════════════
  cmd.push('q');
  cmd.push('/TransState gs');
  cmd.push('0.88 0.74 0.74 rg');
  cmd.push('1 0.52 -0.52 1 150 229 cm');
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
  line(cmd, 235, tBot - 38, 385, tBot - 38, 0.5);
  pdfRect(cmd, R - 82, tBot - 42, 82, 40, 1.2);
  ctr(cmd, 'TOTAL', R - 82, R, tBot - 18, 12, { bold: true });

  return cmd.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// JPEG parser — reads dimensions from SOF marker; returns null for non-JPEG
// ─────────────────────────────────────────────────────────────────────────────
function parseJpegDims(buf) {
  if (buf.length < 4 || buf[0] !== 0xFF || buf[1] !== 0xD8) return null;
  let i = 2;
  while (i + 1 < buf.length) {
    if (buf[i] !== 0xFF) return null;
    const m = buf[i + 1];
    if (m === 0xC0 || m === 0xC1 || m === 0xC2) {
      if (i + 9 >= buf.length) return null;
      const h = (buf[i + 5] << 8) | buf[i + 6];
      const w = (buf[i + 7] << 8) | buf[i + 8];
      const c = buf[i + 9];
      return { width: w, height: h, colorSpace: c === 1 ? '/DeviceGray' : c === 4 ? '/DeviceCMYK' : '/DeviceRGB' };
    }
    if (m === 0xD8 || m === 0xD9 || m === 0x01) { i += 2; continue; }
    if (i + 3 >= buf.length) return null;
    i += 2 + ((buf[i + 2] << 8) | buf[i + 3]);
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// PNG parser — inflates IDAT, applies row un-filtering, strips alpha channel.
// Returns raw RGB/Gray pixels re-compressed with zlib (FlateDecode-ready).
// Supports colorTypes: 0 (Gray), 2 (RGB), 4 (Gray+A), 6 (RGBA).
// ─────────────────────────────────────────────────────────────────────────────
function parsePngForPdf(buf) {
  const SIG = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  for (let i = 0; i < 8; i++) { if (buf[i] !== SIG[i]) return null; }

  let width, height, bitDepth, colorType;
  const idatParts = [];
  let i = 8;

  while (i + 12 <= buf.length) {
    const len  = buf.readUInt32BE(i);
    const type = buf.slice(i + 4, i + 8).toString('ascii');
    const data = buf.slice(i + 8, i + 8 + len);
    if (type === 'IHDR') {
      width     = data.readUInt32BE(0);
      height    = data.readUInt32BE(4);
      bitDepth  = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') {
      idatParts.push(data);
    } else if (type === 'IEND') {
      break;
    }
    i += 12 + len;
  }

  if (!width || !height || !idatParts.length) return null;
  if (bitDepth !== 8) return null;         // only 8-bit supported
  if (colorType === 3) return null;        // palette PNG — skip (needs PLTE lookup)

  const hasAlpha = colorType === 4 || colorType === 6;
  const isGray   = colorType === 0 || colorType === 4;
  const srcCh    = isGray ? (hasAlpha ? 2 : 1) : (hasAlpha ? 4 : 3);
  const dstCh    = isGray ? 1 : 3;

  // Inflate concatenated IDAT chunks (they form one zlib stream)
  const raw = zlib.inflateSync(Buffer.concat(idatParts));

  const rowStride = 1 + width * srcCh; // filter byte + raw pixel data
  if (raw.length < height * rowStride) return null;

  const dst  = Buffer.allocUnsafe(height * width * dstCh);
  const prev = Buffer.alloc(width * srcCh, 0); // previous decoded row

  for (let row = 0; row < height; row++) {
    const base   = row * rowStride;
    const filter = raw[base];
    const cur    = raw.slice(base + 1, base + 1 + width * srcCh);
    const unf    = Buffer.allocUnsafe(width * srcCh);

    // Apply PNG row filter
    for (let j = 0; j < unf.length; j++) {
      const a = j >= srcCh ? unf[j - srcCh] : 0; // left
      const b = prev[j];                           // above
      const c = j >= srcCh ? prev[j - srcCh] : 0; // above-left
      switch (filter) {
        case 0: unf[j] = cur[j]; break;
        case 1: unf[j] = (cur[j] + a) & 0xFF; break;
        case 2: unf[j] = (cur[j] + b) & 0xFF; break;
        case 3: unf[j] = (cur[j] + Math.floor((a + b) / 2)) & 0xFF; break;
        case 4: unf[j] = (cur[j] + paethPredictor(a, b, c)) & 0xFF; break;
        default: unf[j] = cur[j];
      }
    }

    // Copy first dstCh channels per pixel to output (strips alpha)
    const dstOff = row * width * dstCh;
    for (let px = 0; px < width; px++) {
      for (let ch = 0; ch < dstCh; ch++) {
        dst[dstOff + px * dstCh + ch] = unf[px * srcCh + ch];
      }
    }
    unf.copy(prev); // save decoded row for next iteration
  }

  return {
    idat: zlib.deflateSync(dst), // re-compress raw pixels for FlateDecode
    width,
    height,
    colorSpace: isGray ? '/DeviceGray' : '/DeviceRGB'
  };
}

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawing primitives
// ─────────────────────────────────────────────────────────────────────────────
const RED = [0.82, 0.06, 0.06];

function pdfRect(cmd, x, y, w, h, lw) { cmd.push(`0 G ${lw} w ${x} ${y} ${w} ${h} re S`); }
function line(cmd, x1, y1, x2, y2, lw) { cmd.push(`0 G ${lw} w ${x1} ${y1} m ${x2} ${y2} l S`); }

function txt(cmd, text, x, y, size, opts = {}) {
  const font = opts.bold ? 'F2' : 'F1';
  const c = opts.color;
  if (c) {
    cmd.push(Array.isArray(c) ? `${c[0]} ${c[1]} ${c[2]} rg` : c);
  } else {
    cmd.push('0 g');
  }
  cmd.push(`BT /${font} ${size} Tf ${x} ${y} Td (${escapePdf(text)}) Tj ET`);
  if (c) cmd.push('0 g');
}

function ctr(cmd, text, x1, x2, y, size, opts = {}) {
  const textW = String(text || '').length * size * 0.52;
  txt(cmd, text, x1 + Math.max(0, (x2 - x1 - textW) / 2), y, size, opts);
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
  return String(value || '').normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

module.exports = { createOrderSheetPdf };
