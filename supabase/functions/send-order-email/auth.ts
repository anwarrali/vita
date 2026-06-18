import { createServiceClient } from '../_shared/supabase-admin.ts';

export async function orderExists(orderId: string): Promise<boolean> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .maybeSingle();

    if (error) {
      console.error('[send-order-email] order lookup failed:', error.message);
      return false;
    }

    return Boolean(data);
  } catch (error) {
    console.error('[send-order-email] order lookup error:', error);
    return false;
  }
}

function hasClientCredentials(req: Request): boolean {
  const apikey = req.headers.get('apikey');
  const authorization = req.headers.get('authorization');
  return Boolean(apikey?.trim() || authorization?.trim());
}

export function checkRequestAuth(req: Request): { ok: true } | { ok: false; reason: string } {
  if (!hasClientCredentials(req)) {
    return { ok: false, reason: 'Missing apikey or authorization header' };
  }
  return { ok: true };
}
