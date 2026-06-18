import type { OrderEmailPayload } from './types.ts';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PHONE_RE = /^[\d\s+()-]{7,20}$/;

function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;
}

function isMoney(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function parseItem(value: unknown): OrderEmailPayload['items'][number] | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;

  if (!isNonEmptyString(item.name, 300)) return null;
  if (typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) {
    return null;
  }
  if (!isMoney(item.unitPrice) || !isMoney(item.totalPrice)) return null;

  return {
    name: item.name.trim(),
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
  };
}

export function parseOrderEmailPayload(body: unknown): OrderEmailPayload | null {
  if (!body || typeof body !== 'object') return null;
  const data = body as Record<string, unknown>;

  if (!isNonEmptyString(data.orderId, 64) || !UUID_RE.test(data.orderId.trim())) return null;
  if (!isNonEmptyString(data.customerName, 120)) return null;
  if (!isNonEmptyString(data.phone, 30) || !PHONE_RE.test(data.phone.trim())) return null;
  if (!isNonEmptyString(data.address, 500)) return null;
  if (!isNonEmptyString(data.region, 50)) return null;
  if (!isNonEmptyString(data.regionLabel, 120)) return null;
  if (!isMoney(data.subtotal) || !isMoney(data.shippingCost) || !isMoney(data.total)) return null;

  if (!Array.isArray(data.items) || data.items.length === 0 || data.items.length > 100) {
    return null;
  }

  const items = data.items.map(parseItem).filter((item): item is OrderEmailPayload['items'][number] => item !== null);
  if (items.length !== data.items.length) return null;

  const notes = data.notes == null
    ? null
    : typeof data.notes === 'string'
      ? data.notes.trim().slice(0, 1000) || null
      : null;

  return {
    orderId: data.orderId.trim(),
    customerName: data.customerName.trim(),
    phone: data.phone.trim(),
    address: data.address.trim(),
    region: data.region.trim(),
    regionLabel: data.regionLabel.trim(),
    notes,
    items,
    subtotal: data.subtotal,
    shippingCost: data.shippingCost,
    total: data.total,
  };
}
