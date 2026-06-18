import type { OrderRow } from '../types.ts';
import { emailLayout, escapeHtml, formatMoney, formatOrderId, infoRow } from './layout.ts';

export function adminNewOrderTemplate(order: OrderRow): { subject: string; html: string } {
  const orderRef = formatOrderId(order.id);
  const itemsHtml = order.order_items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f5;font-size:14px;">${escapeHtml(item.product_name_ar)}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f5;font-size:14px;text-align:center;">${item.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f5;font-size:14px;text-align:left;direction:ltr;">${formatMoney(item.unit_price)}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f5;font-size:14px;text-align:left;direction:ltr;font-weight:700;">${formatMoney(item.total_price)}</td>
    </tr>
  `).join('');

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;color:#1a1a2e;">طلب جديد</h1>
    <p style="margin:0 0 24px;color:#666680;font-size:15px;line-height:1.7;">
      تم استلام طلب جديد من المتجر. التفاصيل أدناه:
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
      ${infoRow('رقم الطلب', orderRef)}
      ${infoRow('اسم العميل', order.customer_name)}
      ${infoRow('رقم الهاتف', order.customer_phone)}
      ${order.customer_email ? infoRow('البريد الإلكتروني', order.customer_email) : ''}
      ${infoRow('منطقة التوصيل', order.shipping_region_label || order.shipping_region || 'غير محدد')}
      ${infoRow('العنوان', order.customer_address)}
      ${order.notes ? infoRow('ملاحظات', order.notes) : ''}
    </table>

    <h2 style="margin:0 0 12px;font-size:18px;color:#1a1a2e;">المنتجات</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
      <thead>
        <tr>
          <th style="text-align:right;padding:10px 0;border-bottom:2px solid #ececf5;font-size:13px;color:#666680;">المنتج</th>
          <th style="text-align:center;padding:10px 0;border-bottom:2px solid #ececf5;font-size:13px;color:#666680;">الكمية</th>
          <th style="text-align:left;padding:10px 0;border-bottom:2px solid #ececf5;font-size:13px;color:#666680;">السعر</th>
          <th style="text-align:left;padding:10px 0;border-bottom:2px solid #ececf5;font-size:13px;color:#666680;">الإجمالي</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fafafe;border-radius:12px;padding:16px;">
      ${infoRow('المجموع الفرعي', formatMoney(order.subtotal))}
      ${infoRow('رسوم التوصيل', formatMoney(order.shipping_cost))}
      <tr>
        <td style="padding:12px 0;color:#292b99;font-size:16px;font-weight:700;">المجموع الكلي</td>
        <td style="padding:12px 0;color:#292b99;font-size:18px;font-weight:700;text-align:left;direction:ltr;">${formatMoney(order.total)}</td>
      </tr>
    </table>
  `;

  return {
    subject: `طلب جديد #${orderRef} — Vita Shop`,
    html: emailLayout({
      title: `طلب جديد #${orderRef}`,
      preheader: `طلب جديد من ${order.customer_name}`,
      body,
    }),
  };
}
