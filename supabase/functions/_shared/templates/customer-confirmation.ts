import type { OrderRow } from '../types.ts';
import { emailLayout, escapeHtml, formatMoney, formatOrderId } from './layout.ts';

export function customerConfirmationTemplate(order: OrderRow): { subject: string; html: string } {
  const orderRef = formatOrderId(order.id);
  const itemsHtml = order.order_items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f5;font-size:14px;">${escapeHtml(item.product_name_ar)}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f5;font-size:14px;text-align:center;">${item.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f5;font-size:14px;text-align:left;direction:ltr;font-weight:700;">${formatMoney(item.total_price)}</td>
    </tr>
  `).join('');

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;color:#1a1a2e;">شكراً لطلبك من Vita</h1>
    <p style="margin:0 0 20px;color:#666680;font-size:15px;line-height:1.8;">
      مرحباً ${escapeHtml(order.customer_name)}،<br />
      تم استلام طلبك بنجاح. سنتواصل معك قريباً لتأكيد الطلب وترتيب التوصيل.
    </p>

    <div style="background:#f7f7ff;border:1px solid #e4e4ff;border-radius:12px;padding:16px;margin-bottom:24px;">
      <div style="font-size:13px;color:#666680;margin-bottom:4px;">رقم الطلب</div>
      <div style="font-size:20px;font-weight:700;color:#292b99;letter-spacing:0.08em;direction:ltr;text-align:left;">#${orderRef}</div>
    </div>

    <h2 style="margin:0 0 12px;font-size:18px;color:#1a1a2e;">ملخص الطلب</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
      <thead>
        <tr>
          <th style="text-align:right;padding:10px 0;border-bottom:2px solid #ececf5;font-size:13px;color:#666680;">المنتج</th>
          <th style="text-align:center;padding:10px 0;border-bottom:2px solid #ececf5;font-size:13px;color:#666680;">الكمية</th>
          <th style="text-align:left;padding:10px 0;border-bottom:2px solid #ececf5;font-size:13px;color:#666680;">الإجمالي</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fafafe;border-radius:12px;padding:16px;margin-bottom:24px;">
      <tr>
        <td style="padding:8px 0;color:#666680;font-size:14px;">المجموع الفرعي</td>
        <td style="padding:8px 0;text-align:left;direction:ltr;font-size:14px;">${formatMoney(order.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#666680;font-size:14px;">رسوم التوصيل</td>
        <td style="padding:8px 0;text-align:left;direction:ltr;font-size:14px;">${formatMoney(order.shipping_cost)}</td>
      </tr>
      <tr>
        <td style="padding:12px 0;color:#292b99;font-size:16px;font-weight:700;">المجموع الكلي</td>
        <td style="padding:12px 0;text-align:left;direction:ltr;color:#292b99;font-size:18px;font-weight:700;">${formatMoney(order.total)}</td>
      </tr>
    </table>

    <div style="background:#fff8ef;border:1px solid #ffe2b8;border-radius:12px;padding:16px;">
      <div style="font-size:15px;font-weight:700;color:#8a5a00;margin-bottom:8px;">ماذا بعد؟</div>
      <p style="margin:0;color:#7a6040;font-size:14px;line-height:1.8;">
        سنتصل بك على الرقم ${escapeHtml(order.customer_phone)} خلال 24 ساعة لتأكيد الطلب.<br />
        الدفع عند الاستلام نقداً.<br />
        مدة التوصيل تعتمد على منطقتك وتوفر المنتجات.
      </p>
    </div>
  `;

  return {
    subject: `تأكيد طلبك #${orderRef} — Vita Shop`,
    html: emailLayout({
      title: `تأكيد الطلب #${orderRef}`,
      preheader: 'تم استلام طلبك بنجاح من Vita Shop',
      body,
    }),
  };
}
