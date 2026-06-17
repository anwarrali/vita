import { Link } from 'react-router';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { getCartItemUnitPrice, formatVariantLabels } from '../lib/productUtils';

export function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-4">السلة فارغة</h2>
            <p className="text-muted-foreground mb-6">
              لم تقومي بإضافة أي منتجات إلى السلة بعد
            </p>
            <Button size="lg" asChild>
              <Link to="/products">تسوقي الآن</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">سلة التسوق</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const unitPrice = getCartItemUnitPrice(item);
              const variantLabel = formatVariantLabels(item.selectedVariants);
              return (
              <Card key={item.lineKey}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Link
                      to={`/product/${item.product.id}`}
                      className="flex-shrink-0"
                    >
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={item.product.image}
                          alt={item.product.nameAr}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product.id}`}>
                        <h3 className="font-bold mb-1 hover:text-primary transition-colors">
                          {item.product.nameAr}
                        </h3>
                      </Link>
                      {variantLabel && (
                        <p className="text-xs text-primary mb-1">{variantLabel}</p>
                      )}
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.product.descriptionAr}
                      </p>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 border border-border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.lineKey, item.quantity - 1)
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.lineKey, item.quantity + 1)
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.lineKey)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-left">
                      <div className="font-bold text-lg mb-1">
                        ₪{unitPrice * item.quantity}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-sm text-muted-foreground">
                          ₪{unitPrice} × {item.quantity}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">ملخص الطلب</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">المجموع الفرعي:</span>
                    <span className="font-medium">₪{cartTotal}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">الشحن:</span>
                    <span className="font-medium">يُحسب عند الدفع</span>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">المجموع:</span>
                      <span className="font-bold text-2xl text-primary">
                        ₪{cartTotal}
                      </span>
                    </div>
                  </div>
                </div>

                <Button size="lg" className="w-full mb-3" asChild>
                  <Link to="/checkout">إتمام الطلب</Link>
                </Button>

                <Button variant="outline" className="w-full" asChild>
                  <Link to="/products">متابعة التسوق</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
