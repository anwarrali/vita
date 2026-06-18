import { syncInventoryOnSave } from './inventory';
import type { Product, ProductVariant } from '../types';

export function productUsesVariantStock(variants: ProductVariant[] = []): boolean {
  return variants.some((v) => v.options.some((o) => typeof o.stockQuantity === 'number'));
}

export function buildInventoryPayload(input: {
  stockQuantity: number;
  variants: ProductVariant[];
  inStock: boolean;
  isActive: boolean;
  forceVisibleOnRestock?: boolean;
}) {
  const inventory = syncInventoryOnSave({
    stockQuantity: input.stockQuantity,
    variants: input.variants,
  });

  const isActive =
    input.forceVisibleOnRestock && input.inStock ? true : input.isActive;

  return {
    stock_quantity: inventory.stockQuantity,
    in_stock: input.inStock,
    variants: inventory.variants,
    is_active: isActive,
  };
}

export function buildQuickRestockPayload(product: Product, quantity: number) {
  return buildInventoryPayload({
    stockQuantity: quantity,
    variants: product.variants ?? [],
    inStock: true,
    isActive: product.isActive,
    forceVisibleOnRestock: true,
  });
}
