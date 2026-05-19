'use strict';

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

function escapePdfText(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

module.exports = { createOrderSheetPdf };
