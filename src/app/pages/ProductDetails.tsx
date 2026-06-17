import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { ProductCard } from '../components/ProductCard';
import { ProductImageGallery } from '../components/ProductImageGallery';
import { useCart } from '../context/CartContext';
import { useProduct, useProducts } from '../lib/useProducts';
import { returnPolicy, shippingInfo } from '../data/storePolicies';
import {
  getProductImages,
  getItemUnitPrice,
  formatVariantLabels,
} from '../lib/productUtils';
import type { ProductVariant, SelectedVariant } from '../types';
import { toast } from 'sonner';
import { ShoppingCart, ChevronLeft, Minus, Plus, Loader2, Banknote, Truck, Package } from 'lucide-react';
import { cn } from '../components/ui/utils';

function VariantSelector({
  variant,
  selectedOptionId,
  onSelect,
}: {
  variant: ProductVariant;
  selectedOptionId?: string;
  onSelect: (optionId: string, labelAr: string) => void;
}) {
  return (
    <div>
      <label className="block mb-2 font-medium">{variant.nameAr}</label>
      <div className="flex flex-wrap gap-2">
        {variant.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const outOfStock = option.inStock === false;
          return (
            <button
              key={option.id}
              type="button"
              disabled={outOfStock}
              onClick={() => onSelect(option.id, option.labelAr)}
              className={cn(
                'px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/40',
                outOfStock && 'opacity-40 cursor-not-allowed line-through'
              )}
            >
              {(variant.type === 'color' || variant.type === 'shade') && option.colorHex && (
                <span
                  className="inline-block w-4 h-4 rounded-full ml-2 border border-border align-middle shrink-0"
                  style={{ backgroundColor: option.colorHex }}
                />
              )}
              {option.labelAr}
              {option.priceModifier ? (
                <span className="text-xs mr-1">
                  ({option.priceModifier > 0 ? '+' : ''}₪{option.priceModifier})
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { data: product, loading } = useProduct(id ?? '');
  const { data: allProducts } = useProducts();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const relatedProducts = useMemo(
    () =>
      product
        ? allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
        : [],
    [allProducts, product]
  );

  const selectedVariants: SelectedVariant[] = useMemo(() => {
    if (!product?.variants) return [];
    return product.variants
      .map((variant) => {
        const optionId = selectedOptions[variant.id];
        const option = variant.options.find((o) => o.id === optionId);
        if (!option) return null;
        return {
          variantId: variant.id,
          optionId: option.id,
          labelAr: option.labelAr,
        };
      })
      .filter((v): v is SelectedVariant => v !== null);
  }, [product, selectedOptions]);

  const unitPrice = product ? getItemUnitPrice(product, selectedVariants) : 0;

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const base = getProductImages(product);
    const variantImages = product.variants?.flatMap((v) => {
      const optionId = selectedOptions[v.id];
      const option = v.options.find((o) => o.id === optionId);
      return option?.imageUrl ? [option.imageUrl] : [];
    }) ?? [];
    const merged = [...variantImages, ...base];
    return [...new Set(merged)];
  }, [product, selectedOptions]);

  const variantsComplete =
    !product?.variants?.length ||
    product.variants.every((v) => selectedOptions[v.id]);

  const handleVariantSelect = (variantId: string, optionId: string, _labelAr: string) => {
    setSelectedOptions((prev) => ({ ...prev, [variantId]: optionId }));
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!variantsComplete) {
      toast.error('الرجاء اختيار جميع الخيارات المتاحة');
      return;
    }
    addToCart(product, quantity, selectedVariants);
    toast.success(`تمت إضافة ${quantity} من ${product.nameAr} إلى السلة`);
  };

  const handleBuyNow = () => {
    if (!product || !variantsComplete) {
      toast.error('الرجاء اختيار جميع الخيارات المتاحة');
      return;
    }
    addToCart(product, quantity, selectedVariants);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">المنتج غير موجود</h2>
          <p className="text-muted-foreground mb-6">عذراً، لم نتمكن من العثور على المنتج المطلوب</p>
          <Button onClick={() => navigate('/products')}>العودة للمنتجات</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <ChevronLeft className="h-4 w-4" />
          <Link to="/products" className="hover:text-primary">المنتجات</Link>
          <ChevronLeft className="h-4 w-4" />
          <span className="text-foreground">{product.nameAr}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <ProductImageGallery images={galleryImages} alt={product.nameAr} />

          <div>
            <div className="flex items-start gap-2 mb-4">
              {product.isNew && <Badge className="bg-success text-white">جديد</Badge>}
              {product.isOnSale && <Badge variant="destructive">تخفيض</Badge>}
              {!product.inStock && <Badge variant="secondary">غير متوفر</Badge>}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3">{product.nameAr}</h1>

            {product.brand && (
              <p className="text-sm text-muted-foreground mb-4">
                العلامة التجارية: <span className="font-medium text-foreground">{product.brand}</span>
              </p>
            )}

            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-bold text-primary">₪{unitPrice}</span>
              {product.originalPrice && product.originalPrice > unitPrice && (
                <span className="text-2xl text-muted-foreground line-through">
                  ₪{product.originalPrice}
                </span>
              )}
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">{product.descriptionAr}</p>

            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4 mb-6">
                {product.variants.map((variant) => (
                  <VariantSelector
                    key={variant.id}
                    variant={variant}
                    selectedOptionId={selectedOptions[variant.id]}
                    onSelect={(optionId, labelAr) =>
                      handleVariantSelect(variant.id, optionId, labelAr)
                    }
                  />
                ))}
                {selectedVariants.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    الخيار المحدد: {formatVariantLabels(selectedVariants)}
                  </p>
                )}
              </div>
            )}

            <div className="mb-6">
              <label className="block mb-2 font-medium">الكمية</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!product.inStock}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!product.inStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!product.inStock || !variantsComplete}
              >
                <ShoppingCart className="ml-2 h-5 w-5" />
                أضف إلى السلة
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={handleBuyNow}
                disabled={!product.inStock || !variantsComplete}
              >
                اشتري الآن
              </Button>
            </div>

            <Card>
              <CardContent className="p-6 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex items-center justify-between flex-1">
                    <span className="text-muted-foreground">الحالة</span>
                    <span className="font-medium">{product.inStock ? 'متوفر' : 'غير متوفر'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Banknote className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex items-center justify-between flex-1">
                    <span className="text-muted-foreground">الدفع</span>
                    <span className="font-medium">عند الاستلام</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex items-center justify-between flex-1">
                    <span className="text-muted-foreground">الشحن</span>
                    <span className="font-medium">حسب المنطقة — انظري أدناه</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="font-bold text-lg mb-4">تفاصيل المنتج</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.descriptionAr || 'لا يوجد وصف إضافي لهذا المنتج.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-bold text-lg mb-4">{shippingInfo.title}</h2>
              <p className="text-sm text-muted-foreground mb-4">{shippingInfo.intro}</p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                {shippingInfo.zones.map((zone) => (
                  <li key={zone.name} className="flex justify-between">
                    <span>{zone.name}</span>
                    <span className="font-medium text-foreground">₪{zone.cost}</span>
                  </li>
                ))}
              </ul>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                {shippingInfo.process.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-16">
          <CardContent className="p-6">
            <h2 className="font-bold text-lg mb-4">{returnPolicy.title}</h2>
            <p className="text-sm text-muted-foreground mb-4">{returnPolicy.intro}</p>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              {returnPolicy.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-6">منتجات مشابهة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
