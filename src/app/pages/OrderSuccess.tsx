import { Link, useLocation } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle2, Home, Package, Phone } from 'lucide-react';
import { shippingOptions } from '../data/shipping';
import { OrderDetails } from '../types';

export function OrderSuccess() {
  const location = useLocation();
  const orderData = location.state?.orderData as OrderDetails | undefined;

  const regionLabel =
    orderData?.regionLabel ??
    shippingOptions.find((o) => o.id === orderData?.region)?.name;

  return (
    <div className="min-h-screen flex items-center justify-center py-16">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 md:p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">تم استلام طلبك بنجاح</h1>

            <p className="text-lg text-muted-foreground mb-8">
              شكراً لثقتك بـ <span className="font-semibold text-primary">Vita</span>.
              سنتواصل معك على رقم الهاتف المُدخل لتأكيد الطلب وترتيب التوصيل.
              {orderData?.customerEmail && (
                <> تم إرسال تأكيد الطلب إلى بريدك الإلكتروني.</>
              )}
            </p>

            {orderData && (
              <div className="bg-muted/30 rounded-lg p-6 mb-8 text-right">
                <h2 className="font-bold mb-4 text-lg">ملخص الطلب</h2>

                {orderData.orderId && (
                  <div className="flex items-center justify-between text-sm mb-3 pb-3 border-b border-border">
                    <span className="text-muted-foreground">رقم الطلب:</span>
                    <span className="font-mono text-xs font-medium" dir="ltr">
                      {orderData.orderId.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">الاسم:</span>
                    <span className="font-medium">{orderData.customerName}</span>
                  </div>

                  {orderData.customerEmail && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">البريد الإلكتروني:</span>
                      <span className="font-medium" dir="ltr">{orderData.customerEmail}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">رقم الهاتف:</span>
                    <span className="font-medium" dir="ltr">{orderData.phone}</span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground flex-shrink-0">العنوان:</span>
                    <span className="font-medium text-left">{orderData.address}</span>
                  </div>

                  {regionLabel && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">منطقة التوصيل:</span>
                      <span className="font-medium">{regionLabel}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">مجموع المنتجات:</span>
                    <span className="font-medium">₪{orderData.subtotal}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">رسوم الشحن:</span>
                    <span className="font-medium">₪{orderData.shippingCost}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="font-bold">المجموع الكلي (دفع عند الاستلام):</span>
                    <span className="font-bold text-xl text-primary">₪{orderData.total}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg text-right">
                <Phone className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-1">الخطوة التالية</h3>
                  <p className="text-sm text-muted-foreground">
                    سنتصل بك على الرقم الذي أدخلته لتأكيد الطلب. يرجى إبقاء هاتفك متاحاً.
                    الدفع نقداً عند استلام الطلب من المندوب.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg text-right">
                <Package className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-1">ماذا تحتاجين أن تعرفي؟</h3>
                  <p className="text-sm text-muted-foreground">
                    لا حاجة لحساب أو بطاقة ائتمان. احتفظي برقم الطلب أعلاه للمتابعة إذا تواصلت معنا.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/">
                  <Home className="ml-2 h-5 w-5" />
                  العودة للرئيسية
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/products">متابعة التسوق</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
