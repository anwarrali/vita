import type { CartItem, Product, SelectedVariant } from '../types';
import { getAvailableStock, getProductStockStatus } from './inventory';

export { getAvailableStock, getProductStockStatus };

export function getProductImages(product: Product): string[] {
  if (product.images.length > 0) return product.images;
  if (product.image) return [product.image];
  return [];
}

export function getCartLineKey(productId: string, selectedVariants: SelectedVariant[] = []): string {
  if (selectedVariants.length === 0) return productId;
  const variantKey = [...selectedVariants]
    .sort((a, b) => a.variantId.localeCompare(b.variantId))
    .map((v) => `${v.variantId}:${v.optionId}`)
    .join('|');
  return `${productId}::${variantKey}`;
}

export function getVariantPriceModifier(product: Product, selectedVariants: SelectedVariant[]): number {
  return selectedVariants.reduce((sum, selected) => {
    const variant = product.variants?.find((v) => v.id === selected.variantId);
    const option = variant?.options.find((o) => o.id === selected.optionId);
    return sum + (option?.priceModifier ?? 0);
  }, 0);
}

export function getItemUnitPrice(product: Product, selectedVariants: SelectedVariant[] = []): number {
  return product.price + getVariantPriceModifier(product, selectedVariants);
}

export function getCartItemUnitPrice(item: CartItem): number {
  return getItemUnitPrice(item.product, item.selectedVariants);
}

export function formatVariantLabels(selectedVariants: SelectedVariant[] = []): string {
  return selectedVariants.map((v) => v.labelAr).join(' · ');
}
