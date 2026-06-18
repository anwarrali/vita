import { supabase } from './supabase';
import { getCartItemUnitPrice, formatVariantLabels } from './productUtils';
import { shippingOptions } from '../data/shipping';
import type { CartItem, ShippingRegion } from '../types';

export interface OrderEmailItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderEmailPayload {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  region: string;
  regionLabel: string;
  notes: string | null;
  items: OrderEmailItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

export interface SubmitOrderInput {
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  region: ShippingRegion;
  notes?: string;
  confirmationAccepted: boolean;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

export interface SubmitOrderResult {
  orderId: string;
  createdAt: string;
}

function buildEmailPayload(
  orderId: string,
  input: SubmitOrderInput,
  regionLabel: string
): OrderEmailPayload {
  return {
    orderId,
    customerName: input.customerName.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    region: input.region,
    regionLabel,
    notes: input.notes?.trim() || null,
    items: input.items.map((item) => {
      const unitPrice = getCartItemUnitPrice(item);
      const variantLabel = formatVariantLabels(item.selectedVariants);
      const name = variantLabel
        ? `${item.product.nameAr} (${variantLabel})`
        : item.product.nameAr;

      return {
        name,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      };
    }),
    subtotal: input.subtotal,
    shippingCost: input.shippingCost,
    total: input.total,
  };
}

async function triggerOrderEmail(payload: OrderEmailPayload): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('send-order-email', {
      body: payload,
    });

    if (error) {
      console.warn('[orders] Admin email failed:', error.message);
    }
  } catch (error) {
    console.warn('[orders] Admin email failed:', error);
  }
}

export async function submitOrder(input: SubmitOrderInput): Promise<SubmitOrderResult> {
  const regionLabel = shippingOptions.find((o) => o.id === input.region)?.name ?? input.region;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: input.customerName.trim(),
      customer_email: input.customerEmail.trim().toLowerCase(),
      customer_phone: input.phone.trim(),
      customer_address: input.address.trim(),
      shipping_region: input.region,
      shipping_region_label: regionLabel,
      subtotal: input.subtotal,
      shipping_cost: input.shippingCost,
      total: input.total,
      payment_method: 'cod',
      notes: input.notes?.trim() || null,
      confirmation_accepted: input.confirmationAccepted,
      status: 'pending',
    })
    .select('id, created_at')
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? 'فشل في حفظ الطلب');
  }

  const orderItems = input.items.map((item) => {
    const unitPrice = getCartItemUnitPrice(item);
    const variantLabel = formatVariantLabels(item.selectedVariants);
    const productName = variantLabel
      ? `${item.product.nameAr} (${variantLabel})`
      : item.product.nameAr;

    return {
      order_id: order.id,
      product_id: item.product.id,
      product_name_ar: productName,
      product_image: item.product.image,
      variant_selection: item.selectedVariants?.length ? item.selectedVariants : null,
      quantity: item.quantity,
      unit_price: unitPrice,
      total_price: unitPrice * item.quantity,
    };
  });

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

  if (itemsError) {
    throw new Error(itemsError.message ?? 'فشل في حفظ تفاصيل الطلب');
  }

  // Fire-and-forget: checkout must succeed even if email fails
  void triggerOrderEmail(buildEmailPayload(order.id, input, regionLabel));

  return {
    orderId: order.id,
    createdAt: order.created_at,
  };
}
