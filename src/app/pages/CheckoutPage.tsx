import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { shippingOptions, getShippingCost } from '../data/shipping';
import { ShippingRegion, CheckoutFormData } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    phoneNumber: '',
    address: '',
    city: '',
    region: 'west_bank',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingCost = getShippingCost(formData.region);
  const total = cart.total + shippingCost;

  // Redirect if cart is empty
  React.useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart.items.length, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, region: value as ShippingRegion }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customerName.trim()) {
      toast.error('يرجى إدخال الاسم');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      toast.error('يرجى إدخال رقم الهاتف');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('يرجى إدخال العنوان');
      return;
    }
    if (!formData.city.trim()) {
      toast.error('يرجى إدخال المدينة');
      return;
    }

    setIsSubmitting(true);

    // Simulate order submission
    setTimeout(() => {
      // In production, this would send to Supabase
      const order = {
        ...formData,
        items: cart.items,
        subtotal: cart.total,
        shippingCost,
        total,
        status: 'pending' as const,
        paymentMethod: 'cod' as const,
        createdAt: new Date().toISOString(),
      };

      console.log('Order submitted:', order);

      // Clear cart
      clearCart();

      // Show success message
      toast.success('تم إرسال طلبك بنجاح!', {
        description: 'سنتواصل معك قريباً لتأكيد الطلب',
        duration: 5000,
      });

      setIsSubmitting(false);
      
      // Navigate to success page (or home)
      navigate('/', { replace: true });
    }, 1500);
  };

  if (cart.items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-right">إتمام الطلب</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-semibold text-lg mb-4 text-right">معلومات العميل</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName" className="text-right block mb-2">
                    الاسم الكامل *
                  </Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="أدخل الاسم الكامل"
                    className="text-right"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber" className="text-right block mb-2">
                    رقم الهاتف *
                  </Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="05xxxxxxxx"
                    className="text-right"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-semibold text-lg mb-4 text-right">معلومات التوصيل</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="region" className="text-right block mb-2">
                    المنطقة *
                  </Label>
                  <Select value={formData.region} onValueChange={handleRegionChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.nameAr} - ₪{option.cost}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="city" className="text-right block mb-2">
                    المدينة *
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم المدينة"
                    className="text-right"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-right block mb-2">
                    العنوان التفصيلي *
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="الشارع، رقم البناية، الطابق، إلخ..."
                    className="text-right min-h-[100px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-right block mb-2">
                    ملاحظات إضافية (اختياري)
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="أي ملاحظات إضافية للطلب..."
                    className="text-right"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-semibold text-lg mb-4 text-right">طريقة الدفع</h2>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <div className="flex-1 text-right">
                  <p className="font-medium">الدفع عند الاستلام</p>
                  <p className="text-sm text-muted-foreground">
                    ادفعي نقداً عند استلام الطلب
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'جاري إرسال الطلب...' : 'تأكيد الطلب'}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
            <h2 className="font-semibold text-lg mb-4 text-right">ملخص الطلب</h2>

            {/* Order Items */}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {cart.items.map((item) => {
                const price = item.product.salePrice || item.product.price;
                return (
                  <div key={item.product.id} className="flex gap-3 text-right">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.product.nameAr}</p>
                      <p className="text-xs text-muted-foreground">
                        الكمية: {item.quantity} × ₪{price}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      ₪{(price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex justify-between text-right">
                <span className="font-semibold">₪{cart.total.toFixed(2)}</span>
                <span className="text-muted-foreground">المجموع الفرعي</span>
              </div>
              <div className="flex justify-between text-right">
                <span className="font-semibold">₪{shippingCost.toFixed(2)}</span>
                <span className="text-muted-foreground">رسوم التوصيل</span>
              </div>
            </div>

            <div className="border-t border-border mt-4 pt-4">
              <div className="flex justify-between text-right">
                <span className="font-bold text-xl" style={{ color: 'var(--price-color)' }}>
                  ₪{total.toFixed(2)}
                </span>
                <span className="font-semibold text-lg">المجموع الكلي</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
