function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatMoney(amount: number): string {
  return `₪${Number(amount).toFixed(2)}`;
}

export function formatOrderId(orderId: string): string {
  return orderId.slice(0, 8).toUpperCase();
}

export function emailLayout(options: {
  title: string;
  preheader: string;
  body: string;
}): string {
  const title = escapeHtml(options.title);
  const preheader = escapeHtml(options.preheader);

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:Arial,Helvetica,sans-serif;color:#1a1a2e;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f8;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e8f0;">
          <tr>
            <td style="background:linear-gradient(135deg,#292b99,#1b1d6f);padding:28px 24px;text-align:center;">
              <div style="font-size:28px;font-weight:700;color:#ffffff;letter-spacing:0.08em;">VITA SHOP</div>
              <div style="font-size:12px;color:#d7d8ff;margin-top:6px;letter-spacing:0.2em;text-transform:uppercase;">Beauty & Lifestyle</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px;">
              ${options.body}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 24px;background:#fafafe;border-top:1px solid #ececf5;text-align:center;font-size:12px;color:#7a7a92;">
              © ${new Date().getFullYear()} Vita Shop. جميع الحقوق محفوظة.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f5;color:#666680;font-size:14px;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f5;color:#1a1a2e;font-size:14px;font-weight:600;text-align:left;direction:ltr;">${escapeHtml(value)}</td>
  </tr>`;
}

export { escapeHtml };
