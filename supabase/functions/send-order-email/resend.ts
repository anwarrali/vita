interface ResendResponse {
  id?: string;
  message?: string;
}

export async function sendWithResend(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<string> {
  const apiKey = Deno.env.get('RESEND_API_KEY')?.trim();
  const adminEmail = Deno.env.get('ADMIN_EMAIL')?.trim();
  const fromEmail = Deno.env.get('FROM_EMAIL')?.trim() || 'onboarding@resend.dev';
  const fromName = Deno.env.get('FROM_NAME')?.trim() || 'Vita Shop';

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL is not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [input.to || adminEmail],
      subject: input.subject,
      html: input.html,
    }),
  });

  const payload = await response.json().catch(() => ({} as ResendResponse));

  if (!response.ok) {
    const message = payload.message || JSON.stringify(payload);
    throw new Error(`Resend API error (${response.status}): ${message}`);
  }

  return payload.id || 'sent';
}

export function getAdminEmail(): string {
  const adminEmail = Deno.env.get('ADMIN_EMAIL')?.trim();
  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL is not configured');
  }
  return adminEmail;
}
