import type { EmailType, OrderRow } from '../types.ts';
import { createServiceClient } from './supabase-admin.ts';

export async function fetchOrderWithItems(orderId: string): Promise<OrderRow | null> {
  const supabase = createServiceClient();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    console.error('[email] order fetch failed:', orderError?.message);
    return null;
  }

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('id, product_id, product_name_ar, product_image, quantity, unit_price, total_price, variant_selection')
    .eq('order_id', orderId)
    .order('product_name_ar', { ascending: true });

  if (itemsError) {
    console.error('[email] order items fetch failed:', itemsError.message);
    return null;
  }

  return {
    ...(order as Omit<OrderRow, 'order_items'>),
    order_items: items ?? [],
  };
}

export async function wasEmailAlreadySent(orderId: string, emailType: EmailType): Promise<boolean> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('email_logs')
    .select('id')
    .eq('order_id', orderId)
    .eq('email_type', emailType)
    .eq('status', 'sent')
    .maybeSingle();

  if (error) {
    console.error('[email] email_logs lookup failed:', error.message);
    return false;
  }

  return Boolean(data);
}

export async function logEmailEvent(input: {
  orderId?: string;
  emailType: EmailType;
  recipient: string;
  provider?: string;
  status: 'sent' | 'failed';
  errorMessage?: string;
}): Promise<void> {
  const supabase = createServiceClient();

  const { error } = await supabase.from('email_logs').insert({
    order_id: input.orderId ?? null,
    email_type: input.emailType,
    recipient: input.recipient,
    provider: input.provider ?? null,
    status: input.status,
    error_message: input.errorMessage ?? null,
  });

  if (error) {
    console.error('[email] failed to write email_logs:', error.message);
  }
}
