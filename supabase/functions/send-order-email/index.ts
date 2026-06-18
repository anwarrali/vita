import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { logEmailEvent } from '../_shared/email-logs.ts';
import { getAdminEmail, sendWithResend } from './resend.ts';
import { buildOrderEmailHtml, ORDER_EMAIL_SUBJECT } from './template.ts';
import { parseOrderEmailPayload } from './validate.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let orderId: string | undefined;

  try {
    const body = await req.json().catch(() => null);
    const order = parseOrderEmailPayload(body);

    if (!order) {
      return jsonResponse({ error: 'Invalid order payload' }, 400);
    }

    orderId = order.orderId;
    const adminEmail = getAdminEmail();
    const html = buildOrderEmailHtml(order);

    const messageId = await sendWithResend({
      to: adminEmail,
      subject: ORDER_EMAIL_SUBJECT,
      html,
    });

    await logEmailEvent({
      orderId: order.orderId,
      emailType: 'admin_new_order',
      recipient: adminEmail,
      provider: 'resend',
      status: 'sent',
    });

    return jsonResponse({
      ok: true,
      orderId: order.orderId,
      messageId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[send-order-email] failed:', message);

    if (orderId) {
      try {
        await logEmailEvent({
          orderId,
          emailType: 'admin_new_order',
          recipient: Deno.env.get('ADMIN_EMAIL') || 'unknown',
          provider: 'resend',
          status: 'failed',
          errorMessage: message,
        });
      } catch (logError) {
        console.error('[send-order-email] failed to log error:', logError);
      }
    }

    return jsonResponse({ ok: false, error: message }, 500);
  }
});
