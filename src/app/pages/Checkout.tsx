import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { shippingOptions } from '../data/shipping';
import { ShippingRegion } from '../types';
import { submitOrder } from '../lib/orders';
import { toast } from 'sonner';
import { CheckCircle2, Package, MapPin, Check } from 'lucide-react';
import { cn } from '../components/ui/utils';

export function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    region: '' as ShippingRegion | '',
    notes: '',
  });
  const [confirmationAccepted, setConfirmationAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const selectedShipping = shippingOptions.find((opt) => opt.id === formData.region);
  const shippingCost = selectedShipping?.cost ?? 0;
  const total = cartTotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.region) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    if (!confirmationAccepted) {
      toast.error('يجب تأكيد صحة المعلومات قبل إتمام الطلب');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitOrder({
        customerName: formData.customerName,
        phone: formData.phone,
        address: formData.address,
        region: formData.region,
        notes: formData.notes,
        confirmationAccepted,
        items: cart,
        subtotal: cartTotal,
        shippingCost,
        total,
      });

      const orderData = {
        orderId: result.orderId,
        customerName: formData.customerName,
        phone: formData.phone,
        address: formData.address,
        region: formData.region,
        regionLabel: selectedShipping?.name,
        notes: formData.notes,
        confirmationAccepted,
        items: cart,
        subtotal: cartTotal,
        shippingCost,
        total,
        orderDate: new Date(result.createdAt),
      };

      clearCart();
      navigate('/order-success', { state: { orderData } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حدث خطأ أثناء إرسال الطلب';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2">إتمام الطلب</h1>
        <p className="text-muted-foreground mb-8">الدفع عند الاستلام — لا حاجة لإنشاء حساب</p>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات العميل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">الاسم الكامل *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData({ ...formData, customerName: e.target.value })
                      }
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      dir="ltr"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="05X-XXX-XXXX"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>معلومات الشحن والتوصيل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">العنوان الكامل *</Label>
                    <Textarea
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="المدينة، الشارع، رقم البناية، رقم الشقة"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className="mb-3 block">منطقة التوصيل *</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="منطقة التوصيل">
                      {shippingOptions.map((option) => {
                        const isSelected = formData.region === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => setFormData({ ...formData, region: option.id })}
                            className={cn(
                              'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all',
                              'hover:border-primary/50 hover:bg-primary/5',
                              isSelected
                                ? 'border-primary bg-primary/10 shadow-sm'
                                : 'border-border bg-card'
                            )}
                          >
                            {isSelected && (
                              <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </span>
                            )}
                            <MapPin className={cn('h-5 w-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                            <span className="font-semibold text-sm">{option.name}</span>
                            <span className="text-lg font-bold text-primary">₪{option.cost}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="أي ملاحظات خاصة بالطلب أو التوصيل"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>طريقة الدفع</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border border-border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-bold">الدفع عند الاستلام</div>
                        <p className="text-sm text-muted-foreground">
                          ادفعي المبلغ الكلي نقداً عند استلام الطلب من المندوب
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="confirmation"
                      checked={confirmationAccepted}
                      onCheckedChange={(checked) => setConfirmationAccepted(checked === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="confirmation" className="cursor-pointer text-sm leading-relaxed">
                      أؤكد أن المعلومات المقدمة صحيحة وأنني أتعمد استلام هذا الطلب. *
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center gap-3 pb-3 border-b border-border last:border-0"
                      >
                        <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.nameAr}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.nameAr}</p>
                          <p className="text-xs text-muted-foreground">الكمية: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-bold">
                          ₪{item.product.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">مجموع المنتجات:</span>
                      <span className="font-medium">₪{cartTotal}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">رسوم الشحن:</span>
                      <span className="font-medium">
                        {selectedShipping ? (
                          <>₪{shippingCost} — {selectedShipping.name}</>
                        ) : (
                          <span className="text-muted-foreground">اختر منطقة التوصيل</span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="font-bold text-lg">المجموع الكلي:</span>
                      <span className="font-bold text-2xl text-primary">₪{total}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting || !confirmationAccepted}
                  >
                    {isSubmitting ? (
                      <span>جاري إتمام الطلب...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="ml-2 h-5 w-5" />
                        تأكيد الطلب
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    سيتم حفظ طلبك وسنتواصل معك لتأكيد التوصيل
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
