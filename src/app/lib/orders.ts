import { supabase } from './supabase';
import { getCartItemUnitPrice, formatVariantLabels } from './productUtils';
import { getAvailableStock, isProductPurchasable } from './inventory';
import { shouldEnforceStockLimits } from './productInventory';
import { mapProductRow } from './useProducts';
import { shippingOptions } from '../data/shipping';
import type { CartItem, ShippingRegion } from '../types';

export interface OrderEmailItem {
  id: string;
  image: string;
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

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
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
      const unitPrice = roundMoney(getCartItemUnitPrice(item));
      const variantLabel = formatVariantLabels(item.selectedVariants);
      const name = variantLabel
        ? `${item.product.nameAr} (${variantLabel})`
        : item.product.nameAr;

      return {
        id: item.product.id,
        image: item.product.image || '',
        name,
        quantity: item.quantity,
        unitPrice,
        totalPrice: roundMoney(unitPrice * item.quantity),
      };
    }),
    subtotal: roundMoney(input.subtotal),
    shippingCost: roundMoney(input.shippingCost),
    total: roundMoney(input.total),
  };
}

async function triggerOrderEmail(payload: OrderEmailPayload): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke('send-order-email', {
      body: payload,
    });

    if (error) {
      console.warn('[orders] Admin email invoke error:', error.message);
      return;
    }

    if (data && typeof data === 'object' && 'ok' in data && data.ok === false) {
      console.warn('[orders] Admin email failed:', data);
    }
  } catch (error) {
    console.warn('[orders] Admin email failed:', error);
  }
}

async function validateCartProducts(items: CartItem[]): Promise<void> {
  const productIds = [...new Set(items.map((item) => item.product.id))];

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds);

  if (error) {
    throw new Error('فشل التحقق من المنتجات في السلة');
  }

  const productMap = new Map(
    (data ?? []).map((row) => [String(row.id), mapProductRow(row as Record<string, unknown>)])
  );

  for (const item of items) {
    const product = productMap.get(item.product.id);
    if (!product) {
      throw new Error(
        'بعض المنتجات في السلة لم تعد متوفرة. يرجى إزالتها من السلة ثم إعادة المحاولة.'
      );
    }

    if (!product.isActive) {
      throw new Error(`المنتج "${product.nameAr}" غير متاح حالياً. يرجى إزالته من السلة.`);
    }

    const selectedVariants = item.selectedVariants ?? [];
    if (product.variants?.length && selectedVariants.length !== product.variants.length) {
      throw new Error(`يرجى اختيار جميع خيارات المنتج "${product.nameAr}" قبل إتمام الطلب.`);
    }

    if (!isProductPurchasable(product, selectedVariants)) {
      throw new Error(`المنتج "${product.nameAr}" غير متوفر في المخزون.`);
    }

    if (shouldEnforceStockLimits(product)) {
      const available = getAvailableStock(product, selectedVariants);
      if (item.quantity > available) {
        throw new Error(
          `الكمية المطلوبة من "${product.nameAr}" (${item.quantity}) أكبر من المتوفر (${available}).`
        );
      }
    }
  }
}

export async function submitOrder(input: SubmitOrderInput): Promise<SubmitOrderResult> {
  await validateCartProducts(input.items);

  const regionLabel = shippingOptions.find((o) => o.id === input.region)?.name ?? input.region;
  const orderId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const { error: orderError } = await supabase
    .from('orders')
    .insert({
      id: orderId,
      customer_name: input.customerName.trim(),
      customer_email: input.customerEmail.trim().toLowerCase(),
      customer_phone: input.phone.trim(),
      customer_address: input.address.trim(),
      shipping_region: input.region,
      shipping_region_label: regionLabel,
      subtotal: roundMoney(input.subtotal),
      shipping_cost: roundMoney(input.shippingCost),
      total: roundMoney(input.total),
      payment_method: 'cod',
      notes: input.notes?.trim() || null,
      confirmation_accepted: input.confirmationAccepted,
      status: 'pending',
    });

  if (orderError) {
    throw new Error(orderError?.message ?? 'فشل في حفظ الطلب');
  }

  const orderItems = input.items.map((item) => {
    const unitPrice = roundMoney(getCartItemUnitPrice(item));
    const variantLabel = formatVariantLabels(item.selectedVariants);
    const productName = variantLabel
      ? `${item.product.nameAr} (${variantLabel})`
      : item.product.nameAr;

    // variant_selection shape must match DB trigger (variantId, optionId)
    const variantSelection = item.selectedVariants?.length
      ? item.selectedVariants.map((v) => ({
          variantId: v.variantId,
          optionId: v.optionId,
          labelAr: v.labelAr,
        }))
      : null;

    return {
      order_id: orderId,
      product_id: item.product.id,
      product_name_ar: productName,
      product_image: item.product.image,
      variant_selection: variantSelection,
      quantity: item.quantity,
      unit_price: unitPrice,
      total_price: roundMoney(unitPrice * item.quantity),
    };
  });

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

  if (itemsError) {
    const msg = itemsError.message ?? '';
    if (msg.includes('insufficient_stock')) {
      throw new Error('الكمية المطلوبة أكبر من المتوفر في المخزون. يرجى تحديث السلة والمحاولة مرة أخرى.');
    }
    if (msg.includes('stock_quantity') || msg.includes('is_active')) {
      throw new Error(
        'نظام المخزون غير مفعّل في قاعدة البيانات. شغّل supabase_edits/inventory_migration.sql ثم inventory_stock_decrement.sql في Supabase SQL Editor.'
      );
    }
    if (msg.includes('order_items_product_id_fkey') || itemsError.code === '23503') {
      throw new Error(
        'بعض المنتجات في السلة غير صالحة. يرجى تحديث السلة ثم إعادة المحاولة.'
      );
    }
    throw new Error(itemsError.message ?? 'فشل في حفظ تفاصيل الطلب');
  }

  // Stock is reduced automatically by DB trigger `order_items_decrement_stock`
  // on each order_items INSERT (requires inventory_stock_decrement.sql in Supabase).
  if (import.meta.env.DEV) {
    console.info(
      '[orders] Order saved. Stock decrement handled by Supabase trigger order_items_decrement_stock.'
    );
  }

  // Fire-and-forget: checkout must succeed even if email fails
  void triggerOrderEmail(buildEmailPayload(orderId, input, regionLabel));

  return {
    orderId,
    createdAt,
  };
}
