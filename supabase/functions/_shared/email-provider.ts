import type { SendEmailInput, SendEmailResult } from './types.ts';

type ProviderName = 'resend' | 'brevo';

function getFromAddress(): { name: string; email: string } {
  const email = Deno.env.get('FROM_EMAIL')?.trim();
  const name = Deno.env.get('FROM_NAME')?.trim() || 'Vita Shop';

  if (!email) {
    throw new Error('FROM_EMAIL secret is not configured');
  }

  return { name, email };
}

async function sendWithResend(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = Deno.env.get('RESEND_API_KEY')?.trim();
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const from = getFromAddress();
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${from.name} <${from.email}>`,
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof payload?.message === 'string'
      ? payload.message
      : JSON.stringify(payload);
    throw new Error(`Resend error: ${message}`);
  }

  return { provider: 'resend', messageId: payload?.id };
}

async function sendWithBrevo(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = Deno.env.get('BREVO_API_KEY')?.trim();
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  const from = getFromAddress();
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: from.name, email: from.email },
      to: [{ email: input.to }],
      subject: input.subject,
      htmlContent: input.html,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof payload?.message === 'string'
      ? payload.message
      : JSON.stringify(payload);
    throw new Error(`Brevo error: ${message}`);
  }

  return { provider: 'brevo', messageId: payload?.messageId };
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const provider = (Deno.env.get('EMAIL_PROVIDER') || 'auto').toLowerCase();
  const providers: ProviderName[] = provider === 'brevo'
    ? ['brevo']
    : provider === 'resend'
      ? ['resend']
      : ['resend', 'brevo'];

  let lastError: Error | null = null;

  for (const current of providers) {
    try {
      if (current === 'resend') return await sendWithResend(input);
      return await sendWithBrevo(input);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[email] ${current} failed:`, lastError.message);
    }
  }

  throw lastError ?? new Error('No email provider available');
}

export function getAdminEmail(): string {
  const adminEmail = Deno.env.get('ADMIN_EMAIL')?.trim();
  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL secret is not configured');
  }
  return adminEmail;
}
