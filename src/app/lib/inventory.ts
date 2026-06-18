import type { Product, ProductVariant, ProductVariantOption, SelectedVariant } from '../types';

export const LOW_STOCK_THRESHOLD = 3;

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  in_stock: 'متوفر',
  low_stock: 'مخزون منخفض',
  out_of_stock: 'نفد المخزون',
};

export function getOptionStock(option: ProductVariantOption): number {
  if (typeof option.stockQuantity === 'number' && Number.isFinite(option.stockQuantity)) {
    return Math.max(0, Math.floor(option.stockQuantity));
  }
  if (option.inStock === false) return 0;
  return 0;
}

export function normalizeVariantOption(option: ProductVariantOption): ProductVariantOption {
  const stockQuantity =
    typeof option.stockQuantity === 'number'
      ? Math.max(0, Math.floor(option.stockQuantity))
      : option.stockQuantity;
  return {
    ...option,
    stockQuantity,
    inStock: typeof stockQuantity === 'number' ? stockQuantity > 0 : option.inStock !== false,
  };
}

export function normalizeVariants(variants: ProductVariant[] = []): ProductVariant[] {
  return variants.map((variant) => ({
    ...variant,
    options: variant.options.map(normalizeVariantOption),
  }));
}

export function getProductBaseStock(product: Pick<Product, 'stockQuantity' | 'variants'>): number {
  if (product.variants?.length) {
    const optionStocks = product.variants.flatMap((v) =>
      v.options.map((o) => getOptionStock(o))
    );
    if (optionStocks.some((n) => n > 0) || optionStocks.length > 0) {
      return optionStocks.reduce((sum, n) => sum + n, 0);
    }
  }
  return Math.max(0, product.stockQuantity ?? 0);
}

/** Stock quantity for listings/admin (no variant selection required). */
export function getListingStockQuantity(product: Pick<Product, 'stockQuantity' | 'variants'>): number {
  if (product.variants?.length) {
    const total = getProductBaseStock(product);
    if (total > 0) return total;
  }
  return Math.max(0, product.stockQuantity ?? 0);
}

export function getAvailableStock(product: Product, selectedVariants: SelectedVariant[] = []): number {
  if (!product.isActive || !product.inStock) return 0;

  if (product.variants?.length) {
    const hasOptionStock = product.variants.some((v) =>
      v.options.some((o) => typeof o.stockQuantity === 'number')
    );

    if (hasOptionStock && selectedVariants.length) {
      const stocks = selectedVariants.map((selected) => {
        const variant = product.variants?.find((v) => v.id === selected.variantId);
        const option = variant?.options.find((o) => o.id === selected.optionId);
        return option ? getOptionStock(option) : 0;
      });
      return stocks.length ? Math.min(...stocks) : 0;
    }

    if (hasOptionStock) {
      const maxOption = Math.max(
        0,
        ...product.variants.flatMap((v) => v.options.map((o) => getOptionStock(o)))
      );
      return maxOption;
    }

    return product.inStock ? Math.max(product.stockQuantity ?? 0, 1) : 0;
  }

  return Math.max(0, product.stockQuantity ?? 0);
}

export function getStockStatus(quantity: number): StockStatus {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity <= LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'in_stock';
}

/** Uses DB in_stock flag first (manual admin control), then quantity for low-stock hint. */
export function getProductStockStatus(
  product: Product,
  selectedVariants: SelectedVariant[] = []
): StockStatus {
  if (!product.isActive) return 'out_of_stock';
  if (!product.inStock) return 'out_of_stock';

  if (selectedVariants.length) {
    return getStockStatus(getAvailableStock(product, selectedVariants));
  }

  return getStockStatus(getListingStockQuantity(product));
}

export function isProductPurchasable(product: Product, selectedVariants: SelectedVariant[] = []): boolean {
  if (!product.isActive || !product.inStock) return false;

  if (product.variants?.length && selectedVariants.length !== (product.variants?.length ?? 0)) {
    return false;
  }

  const available = getAvailableStock(product, selectedVariants);
  return available > 0;
}

export function syncInventoryOnSave(input: {
  stockQuantity: number;
  variants: ProductVariant[];
}): {
  stockQuantity: number;
  variants: ProductVariant[];
} {
  const normalizedVariants = normalizeVariants(input.variants).map((variant) => ({
    ...variant,
    options: variant.options.map((option) => {
      const qty =
        typeof option.stockQuantity === 'number'
          ? Math.max(0, Math.floor(option.stockQuantity))
          : 0;
      return {
        ...option,
        stockQuantity: qty,
        inStock: qty > 0,
      };
    }),
  }));

  if (normalizedVariants.length > 0) {
    const totalOptionStock = getProductBaseStock({ stockQuantity: 0, variants: normalizedVariants });
    return {
      stockQuantity: totalOptionStock,
      variants: normalizedVariants,
    };
  }

  return {
    stockQuantity: Math.max(0, Math.floor(input.stockQuantity)),
    variants: [],
  };
}

export function getCartLineAvailableStock(item: {
  product: Product;
  selectedVariants?: SelectedVariant[];
  quantity: number;
}): number {
  return getAvailableStock(item.product, item.selectedVariants);
}
