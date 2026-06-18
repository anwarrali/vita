import type { OrderEmailPayload } from './types.ts';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ParseResult =
  | { ok: true; data: OrderEmailPayload }
  | { ok: false; errors: string[] };

function toNumber(value: unknown, field: string, errors: string[]): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
    return Number(value);
  }
  errors.push(`${field} must be a valid number`);
  return null;
}

function toInt(value: unknown, field: string, errors: string[]): number | null {
  const num = toNumber(value, field, errors);
  if (num === null) return null;
  const int = Math.round(num);
  if (int < 1) {
    errors.push(`${field} must be at least 1`);
    return null;
  }
  return int;
}

function toString(value: unknown, field: string, errors: string[], max = 500): string | null {
  if (typeof value !== 'string' || !value.trim()) {
    errors.push(`${field} is required`);
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length > max) {
    errors.push(`${field} is too long`);
    return null;
  }
  return trimmed;
}

export function parseOrderEmailPayload(body: unknown): ParseResult {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { ok: false, errors: ['Request body must be a JSON object'] };
  }

  const data = body as Record<string, unknown>;

  const orderId = toString(data.orderId, 'orderId', errors, 64);
  if (orderId && !UUID_RE.test(orderId)) {
    errors.push('orderId must be a valid UUID');
  }

  const customerName = toString(data.customerName, 'customerName', errors, 120);
  const phone = toString(data.phone, 'phone', errors, 30);
  const address = toString(data.address, 'address', errors, 500);
  const region = toString(data.region, 'region', errors, 50);
  const regionLabel = toString(data.regionLabel, 'regionLabel', errors, 120);

  const subtotal = toNumber(data.subtotal, 'subtotal', errors);
  const shippingCost = toNumber(data.shippingCost, 'shippingCost', errors);
  const total = toNumber(data.total, 'total', errors);

  if (subtotal !== null && subtotal < 0) errors.push('subtotal cannot be negative');
  if (shippingCost !== null && shippingCost < 0) errors.push('shippingCost cannot be negative');
  if (total !== null && total < 0) errors.push('total cannot be negative');

  let notes: string | null = null;
  if (data.notes != null && data.notes !== '') {
    if (typeof data.notes !== 'string') {
      errors.push('notes must be a string');
    } else {
      notes = data.notes.trim().slice(0, 1000) || null;
    }
  }

  const items: OrderEmailPayload['items'] = [];
  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push('items must be a non-empty array');
  } else if (data.items.length > 100) {
    errors.push('items cannot exceed 100 entries');
  } else {
    data.items.forEach((raw, index) => {
      if (!raw || typeof raw !== 'object') {
        errors.push(`items[${index}] must be an object`);
        return;
      }
      const item = raw as Record<string, unknown>;
      const name = toString(item.name, `items[${index}].name`, errors, 300);
      const quantity = toInt(item.quantity, `items[${index}].quantity`, errors);
      const unitPrice = toNumber(item.unitPrice, `items[${index}].unitPrice`, errors);
      const totalPrice = toNumber(item.totalPrice, `items[${index}].totalPrice`, errors);

      if (name && quantity && unitPrice !== null && totalPrice !== null) {
        items.push({
          name,
          quantity,
          unitPrice: Math.round(unitPrice * 100) / 100,
          totalPrice: Math.round(totalPrice * 100) / 100,
        });
      }
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      orderId: orderId!,
      customerName: customerName!,
      phone: phone!,
      address: address!,
      region: region!,
      regionLabel: regionLabel!,
      notes,
      items,
      subtotal: Math.round(subtotal! * 100) / 100,
      shippingCost: Math.round(shippingCost! * 100) / 100,
      total: Math.round(total! * 100) / 100,
    },
  };
}
