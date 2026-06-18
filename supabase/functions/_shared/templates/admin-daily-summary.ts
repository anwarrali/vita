import type { OrderRow } from '../types.ts';
import { emailLayout, escapeHtml, formatMoney, formatOrderId, infoRow } from './layout.ts';

export interface DailySummaryData {
  dateLabel: string;
  orderCount: number;
  totalRevenue: number;
  latestOrders: OrderRow[];
}

export function adminDailySummaryTemplate(data: DailySummaryData): { subject: string; html: string } {
  const latestHtml = data.latestOrders.length === 0
    ? '<p style="margin:0;color:#666680;font-size:14px;">لا توجد طلبات جديدة اليوم.</p>'
    : data.latestOrders.map((order) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f5;font-size:14px;direction:ltr;text-align:left;">#${formatOrderId(order.id)}</td>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f5;font-size:14px;">${escapeHtml(order.customer_name)}</td>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f5;font-size:14px;text-align:left;direction:ltr;font-weight:700;">${formatMoney(order.total)}</td>
      </tr>
    `).join('');

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;color:#1a1a2e;">ملخص يومي للطلبات</h1>
    <p style="margin:0 0 24px;color:#666680;font-size:15px;">${escapeHtml(data.dateLabel)}</p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;background:#fafafe;border-radius:12px;padding:16px;">
      ${infoRow('عدد الطلبات', String(data.orderCount))}
      ${infoRow('إجمالي الإيرادات', formatMoney(data.totalRevenue))}
    </table>

    <h2 style="margin:0 0 12px;font-size:18px;color:#1a1a2e;">أحدث الطلبات</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <thead>
        <tr>
          <th style="text-align:left;padding:10px 0;border-bottom:2px solid #ececf5;font-size:13px;color:#666680;">الطلب</th>
          <th style="text-align:right;padding:10px 0;border-bottom:2px solid #ececf5;font-size:13px;color:#666680;">العميل</th>
          <th style="text-align:left;padding:10px 0;border-bottom:2px solid #ececf5;font-size:13px;color:#666680;">المجموع</th>
        </tr>
      </thead>
      <tbody>${latestHtml}</tbody>
    </table>
  `;

  return {
    subject: `ملخص يومي — ${data.orderCount} طلب — Vita Shop`,
    html: emailLayout({
      title: 'ملخص يومي للطلبات',
      preheader: `${data.orderCount} طلب بإجمالي ${formatMoney(data.totalRevenue)}`,
      body,
    }),
  };
}
