// Product Types
export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  subcategory: string;
  brand?: string;
  inStock: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isOnSale: boolean;
  variants?: ProductVariant[];
}

export type ProductVariantType = 'color' | 'shade' | 'size' | 'style' | 'other';

export interface ProductVariantOption {
  id: string;
  label: string;
  labelAr: string;
  priceModifier?: number;
  inStock?: boolean;
  colorHex?: string;
  imageUrl?: string;
  sku?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  nameAr: string;
  type: ProductVariantType;
  options: ProductVariantOption[];
}

export interface SelectedVariant {
  variantId: string;
  optionId: string;
  labelAr: string;
}

// Category Types
export interface Subcategory {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  image: string;
  subcategories: Subcategory[];
}

// Cart Types
export interface CartItem {
  lineKey: string;
  product: Product;
  quantity: number;
  selectedVariants?: SelectedVariant[];
}

// Shipping Regions
export type ShippingRegion = 'west-bank' | 'jerusalem' | 'inside-israel';

export interface ShippingOption {
  id: ShippingRegion;
  name: string;
  nameAr: string;
  cost: number;
}

// Order Types
export interface OrderDetails {
  orderId?: string;
  customerName: string;
  customerEmail?: string;
  phone: string;
  address: string;
  region: ShippingRegion;
  regionLabel?: string;
  notes?: string;
  confirmationAccepted: boolean;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  orderDate: Date;
}

// Filter Types
export interface ProductFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isOnSale?: boolean;
  isNew?: boolean;
  searchQuery?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'name' | 'newest';
}
