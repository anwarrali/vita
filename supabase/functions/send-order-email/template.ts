import type { OrderEmailPayload } from './types.ts';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatMoney(amount: number): string {
  return `₪${amount.toFixed(2)}`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f5;color:#666680;font-size:14px;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f5;color:#1a1a2e;font-size:14px;font-weight:600;text-align:left;direction:ltr;">${escapeHtml(value)}</td>
  </tr>`;
}

export function buildOrderEmailHtml(order: OrderEmailPayload): string {
  const orderRef = order.orderId.slice(0, 8).toUpperCase();

  const itemsHtml = order.items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f5;font-size:14px;">${escapeHtml(item.name)}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f5;font-size:14px;text-align:center;">${item.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f5;font-size:14px;text-align:left;direction:ltr;">${formatMoney(item.unitPrice)}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f5;font-size:14px;text-align:left;direction:ltr;font-weight:700;">${formatMoney(item.totalPrice)}</td>
    </tr>
  `).join('');

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;color:#1a1a2e;">New Order</h1>
    <p style="margin:0 0 24px;color:#666680;font-size:15px;line-height:1.7;">
      A new order was placed on Vita Shop.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
      ${infoRow('Order ID', orderRef)}
      ${infoRow('Customer', order.customerName)}
      ${infoRow('Phone', order.phone)}
      ${infoRow('Region', order.regionLabel)}
      ${infoRow('Address', order.address)}
      ${order.notes ? infoRow('Notes', order.notes) : ''}
    </table>

    <h2 style="margin:0 0 12px;font-size:18px;color:#1a1a2e;">Items</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
      <thead>
        <tr>
          <th style="text-align:right;padding:10px 0;border-bottom:2px solid #ececf5;font-size:13px;color:#666680;">Product</th>
          <th style="text-align:center;padding:10px 0;border-bottom:2px solid #ececf5;font-size:13px;color:#666680;">Qty</th>
          <th style="text-align:left;padding:10px 0;border-bottom:2px solid #ececf5;font-size:13px;color:#666680;">Price</th>
          <th style="text-align:left;padding:10px 0;border-bottom:2px solid #ececf5;font-size:13px;color:#666680;">Total</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fafafe;border-radius:12px;padding:16px;">
      ${infoRow('Subtotal', formatMoney(order.subtotal))}
      ${infoRow('Shipping', formatMoney(order.shippingCost))}
      <tr>
        <td style="padding:12px 0;color:#292b99;font-size:16px;font-weight:700;">Total</td>
        <td style="padding:12px 0;color:#292b99;font-size:18px;font-weight:700;text-align:left;direction:ltr;">${formatMoney(order.total)}</td>
      </tr>
    </table>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Order - Vita Shop</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:Arial,Helvetica,sans-serif;color:#1a1a2e;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f8;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e8f0;">
          <tr>
            <td style="background:linear-gradient(135deg,#292b99,#1b1d6f);padding:28px 24px;text-align:center;">
              <div style="font-size:28px;font-weight:700;color:#ffffff;letter-spacing:0.08em;">VITA SHOP</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px;">${body}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const ORDER_EMAIL_SUBJECT = 'New Order - Vita Shop';
