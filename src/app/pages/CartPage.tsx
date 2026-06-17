import React from 'react';
import { Link, useNavigate } from 'react-router';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">سلة التسوق فارغة</h1>
          <p className="text-muted-foreground mb-6">
            لم تقومي بإضافة أي منتجات إلى السلة بعد
          </p>
          <Link to="/">
            <Button size="lg">ابدأي التسوق</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-right">سلة التسوق</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.items.map((item) => {
              const price = item.product.salePrice || item.product.price;
              const itemTotal = price * item.quantity;

              return (
                <div
                  key={item.product.id}
                  className="bg-card border border-border rounded-lg p-4 flex gap-4"
                >
                  {/* Product Image */}
                  <Link
                    to={`/product/${item.product.id}`}
                    className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.nameAr}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 text-right">
                    <Link to={`/product/${item.product.id}`}>
                      <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
                        {item.product.nameAr}
                      </h3>
                    </Link>
                    {item.product.brand && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.product.brand}
                      </p>
                    )}
                    <p className="font-semibold" style={{ color: 'var(--price-color)' }}>
                      ₪{price}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-center justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <p className="font-semibold">₪{itemTotal.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
            <h2 className="font-semibold text-lg mb-4 text-right">ملخص الطلب</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-right">
                <span className="font-semibold">₪{cart.total.toFixed(2)}</span>
                <span className="text-muted-foreground">المجموع الفرعي</span>
              </div>
              <div className="flex justify-between text-right">
                <span className="text-muted-foreground">يتم حسابها في الخطوة التالية</span>
                <span className="text-muted-foreground">رسوم التوصيل</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 mb-6">
              <div className="flex justify-between text-right">
                <span className="font-bold text-lg" style={{ color: 'var(--price-color)' }}>
                  ₪{cart.total.toFixed(2)}
                </span>
                <span className="font-semibold">المجموع</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-right">
                + رسوم التوصيل
              </p>
            </div>

            <Button
              className="w-full mb-3"
              size="lg"
              onClick={() => navigate('/checkout')}
            >
              إتمام الطلب
            </Button>

            <Link to="/">
              <Button variant="outline" className="w-full" size="lg">
                متابعة التسوق
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
