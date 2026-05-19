'use strict';

const nodemailer = require('nodemailer');
const { createOrderSheetPdf } = require('./pdf');

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
  const pdf = createOrderSheetPdf(order);

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
  const pdf = createOrderSheetPdf(order);

  const response = await fetch(process.env.GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
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
  const pdf = createOrderSheetPdf(order);

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

module.exports = { sendOrderEmail };
