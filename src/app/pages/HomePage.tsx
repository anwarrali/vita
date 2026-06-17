import React from 'react';
import { Link } from 'react-router';
import { categories } from '../data/categories';
import { getFeaturedProducts, getBestSellers, getNewArrivals } from '../data/products';
import { ProductGrid } from '../components/product/ProductGrid';
import { CategoryCard } from '../components/category/CategoryCard';
import { Button } from '../components/ui/button';
import { Sparkles, TruckIcon, ShieldCheck, HeadphonesIcon } from 'lucide-react';

export const HomePage: React.FC = () => {
  const featuredProducts = getFeaturedProducts().slice(0, 8);
  const bestSellers = getBestSellers().slice(0, 4);
  const newArrivals = getNewArrivals().slice(0, 4);

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/20 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">مرحباً بك في Vita Shop</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              اكتشفي جمالك الطبيعي
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              منتجات عناية فاخرة بالبشرة والشعر والمكياج من أفضل العلامات التجارية
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/categories">
                <Button size="lg" className="rounded-full">
                  تصفح الفئات
                </Button>
              </Link>
              <Link to="/category/skincare">
                <Button size="lg" variant="outline" className="rounded-full">
                  العناية بالبشرة
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">الفئات الرئيسية</h2>
            <p className="text-muted-foreground">تصفحي حسب الفئة</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(0, 6).map((category) => (
              <CategoryCard key={category.id} category={category} showSubcategories />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/categories">
              <Button variant="outline" size="lg">
                عرض جميع الفئات
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">الأكثر مبيعاً</h2>
              <p className="text-muted-foreground">المنتجات المفضلة لدى عملائنا</p>
            </div>
            <ProductGrid products={bestSellers} />
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">وصل حديثاً</h2>
              <p className="text-muted-foreground">أحدث المنتجات في المتجر</p>
            </div>
            <ProductGrid products={newArrivals} />
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">منتجات مميزة</h2>
              <p className="text-muted-foreground">مختارات خاصة من المتجر</p>
            </div>
            <ProductGrid products={featuredProducts} />
          </div>
        </section>
      )}

      {/* Customer Benefits */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">توصيل سريع</h3>
              <p className="text-sm text-muted-foreground">
                توصيل لجميع المناطق خلال 2-5 أيام
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">منتجات أصلية</h3>
              <p className="text-sm text-muted-foreground">
                جميع منتجاتنا أصلية 100%
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeadphonesIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">دعم العملاء</h3>
              <p className="text-sm text-muted-foreground">
                خدمة عملاء متاحة طوال الوقت
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">جودة عالية</h3>
              <p className="text-sm text-muted-foreground">
                منتجات فاخرة بأفضل الأسعار
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
