import type { Product, ProductVariant } from '../types';

/** True when stock_quantity column exists in DB row (migration applied). */
export function rowHasExplicitInventory(row: Record<string, unknown>): boolean {
  return row.stock_quantity != null && row.stock_quantity !== '';
}

export function variantsHaveExplicitStock(variants: ProductVariant[] = []): boolean {
  return variants.some((variant) =>
    variant.options.some((option) => typeof option.stockQuantity === 'number')
  );
}

export function resolveStockFromRow(row: Record<string, unknown>, variants: ProductVariant[]): {
  stockQuantity: number;
  inStock: boolean;
  hasExplicitInventory: boolean;
} {
  const explicit = rowHasExplicitInventory(row) || variantsHaveExplicitStock(variants);
  const stockQuantity =
    row.stock_quantity != null && row.stock_quantity !== ''
      ? Math.max(0, Number(row.stock_quantity))
      : 0;

  // in_stock column is the admin/manual + auto-after-purchase flag (source of truth for visibility)
  const inStock = row.in_stock == null ? true : Boolean(row.in_stock);

  return {
    stockQuantity,
    inStock,
    hasExplicitInventory: explicit,
  };
}

export function shouldEnforceStockLimits(product: Pick<Product, 'inStock'>): boolean {
  return product.inStock;
}
