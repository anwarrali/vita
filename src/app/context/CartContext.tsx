import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, SelectedVariant } from '../types';
import { getCartLineKey, getCartItemUnitPrice } from '../lib/productUtils';

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
    const lineKey = getCartLineKey(product.id, selectedVariants);
    setCart((prev) => {
      const existing = prev.find((item) => item.lineKey === lineKey);
      if (existing) {
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
    setCart((prev) =>
      prev.map((item) => (item.lineKey === lineKey ? { ...item, quantity } : item))
    );
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
