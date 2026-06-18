import { getCorsHeaders, jsonResponse } from '../_shared/cors.ts';
import { logEmailEvent } from '../_shared/email-logs.ts';
import { checkRequestAuth, orderExists } from './auth.ts';
import { getAdminEmail, sendWithResend } from './resend.ts';
import { buildOrderEmailHtml, ORDER_EMAIL_SUBJECT } from './template.ts';
import { parseOrderEmailPayload } from './validate.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  if (req.method !== 'POST') {
    return jsonResponse(req, { ok: false, error: 'Method not allowed' }, 405);
  }

  const auth = checkRequestAuth(req);
  console.log('[send-order-email] auth:', auth.ok ? 'credentials-present' : auth.reason);

  if (!auth.ok) {
    return jsonResponse(req, { ok: false, error: auth.reason }, 401);
  }

  let orderId: string | undefined;

  try {
    const body = await req.json().catch(() => null);
    console.log('[send-order-email] payload received:', JSON.stringify(body));

    const parsed = parseOrderEmailPayload(body);

    if (!parsed.ok) {
      console.error('[send-order-email] validation failed:', parsed.errors);
      return jsonResponse(req, { ok: false, error: 'Invalid order payload', details: parsed.errors }, 400);
    }

    const order = parsed.data;
    orderId = order.orderId;

    const exists = await orderExists(order.orderId);
    if (!exists) {
      console.error('[send-order-email] order not found:', order.orderId);
      return jsonResponse(req, { ok: false, error: 'Order not found' }, 404);
    }

    const adminEmail = getAdminEmail();
    const html = buildOrderEmailHtml(order);

    console.log('[send-order-email] sending via Resend to:', adminEmail);

    const messageId = await sendWithResend({
      to: adminEmail,
      subject: ORDER_EMAIL_SUBJECT,
      html,
    });

    console.log('[send-order-email] Resend success:', messageId);

    // Logging must never fail the response after a successful send
    try {
      await logEmailEvent({
        orderId: order.orderId,
        emailType: 'admin_new_order',
        recipient: adminEmail,
        provider: 'resend',
        status: 'sent',
      });
    } catch (logError) {
      console.error('[send-order-email] log success failed (email was sent):', logError);
    }

    return jsonResponse(req, {
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
        console.error('[send-order-email] log failure failed:', logError);
      }
    }

    return jsonResponse(req, { ok: false, error: message }, 500);
  }
});
