import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, SelectedVariant } from '../types';
import { getCartLineKey, getCartItemUnitPrice } from '../lib/productUtils';
import { getAvailableStock, isProductPurchasable } from '../lib/inventory';
import { shouldEnforceStockLimits } from '../lib/productInventory';
import { toast } from 'sonner';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedVariants?: SelectedVariant[]) => void;
  removeFromCart: (lineKey: string) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function normalizeCartItem(raw: Partial<CartItem> & { product: Product }): CartItem {
  const selectedVariants = raw.selectedVariants ?? [];
  const lineKey = raw.lineKey ?? getCartLineKey(raw.product.id, selectedVariants);
  return {
    lineKey,
    product: raw.product,
    quantity: raw.quantity ?? 1,
    selectedVariants,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('beauty-cart');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved) as Array<Partial<CartItem> & { product: Product }>;
      return parsed.map(normalizeCartItem);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('beauty-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    selectedVariants: SelectedVariant[] = []
  ) => {
    if (!product.isActive) {
      toast.error('هذا المنتج غير متاح حالياً');
      return;
    }

    if (product.variants?.length && selectedVariants.length !== product.variants.length) {
      toast.error('يرجى اختيار جميع خيارات المنتج');
      return;
    }

    if (!isProductPurchasable(product, selectedVariants)) {
      toast.error('هذا المنتج غير متوفر في المخزون');
      return;
    }

    const available = getAvailableStock(product, selectedVariants);
    const lineKey = getCartLineKey(product.id, selectedVariants);
    const enforceStock = shouldEnforceStockLimits(product);

    setCart((prev) => {
      const existingItem = prev.find((item) => item.lineKey === lineKey);
      const nextQty = (existingItem?.quantity ?? 0) + quantity;

      if (enforceStock && nextQty > available) {
        toast.error(`المتوفر في المخزون: ${available} قطعة فقط`);
        return prev;
      }

      if (existingItem) {
        return prev.map((item) =>
          item.lineKey === lineKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { lineKey, product, quantity, selectedVariants }];
    });
  };

  const removeFromCart = (lineKey: string) => {
    setCart((prev) => prev.filter((item) => item.lineKey !== lineKey));
  };

  const updateQuantity = (lineKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(lineKey);
      return;
    }
    setCart((prev) => {
      const item = prev.find((entry) => entry.lineKey === lineKey);
      if (item && shouldEnforceStockLimits(item.product)) {
        const available = getAvailableStock(item.product, item.selectedVariants);
        if (quantity > available) {
          toast.error(`المتوفر في المخزون: ${available} قطعة فقط`);
          return prev;
        }
      }
      return prev.map((entry) => (entry.lineKey === lineKey ? { ...entry, quantity } : entry));
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + getCartItemUnitPrice(item) * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
