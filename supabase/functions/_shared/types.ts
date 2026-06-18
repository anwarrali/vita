export interface OrderItemRow {
  id: string;
  product_id: string;
  product_name_ar: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant_selection: unknown;
}

export interface OrderRow {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  customer_address: string;
  shipping_region: string | null;
  shipping_region_label: string | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  notes: string | null;
  status: string;
  created_at: string;
  order_items: OrderItemRow[];
}

export type EmailType = 'admin_new_order' | 'customer_confirmation' | 'daily_summary';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResult {
  provider: 'resend' | 'brevo';
  messageId?: string;
}
