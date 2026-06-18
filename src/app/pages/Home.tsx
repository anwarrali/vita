import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { ProductCard } from '../components/ProductCard';
import { CategoryCard } from '../components/CategoryCard';
import { HeroVisual } from '../components/HeroVisual';
import { BenefitsMarquee } from '../components/BenefitsMarquee';
import { EmptyProducts } from '../components/EmptyProducts';
import { useCategories } from '../lib/useCategories';
import { useProducts } from '../lib/useProducts';
import { ShoppingBag, Loader2 } from 'lucide-react';

const storeCategories = ['مكياج', 'عناية بالبشرة', 'عطور', 'إكسسوارات', 'ساعات', 'نظارات', 'حقائب'];

export function Home() {
  const { data: categories, loading: categoriesLoading } = useCategories();
  const { data: products, loading: productsLoading } = useProducts();

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 4);
  const newProducts = products.filter((p) => p.isNew).slice(0, 4);
  const saleProducts = products.filter((p) => p.isOnSale).slice(0, 4);
  const featuredCategories = categories.slice(0, 3);

  const ProductGrid = ({
    items,
    emptyTitle,
  }: {
    items: typeof products;
    emptyTitle: string;
  }) => {
    if (productsLoading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    if (items.length === 0) {
      return <EmptyProducts title={emptyTitle} />;
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--hero-gradient-from)] to-[var(--hero-gradient-to)] py-16 md:py-24">
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-primary/8 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7 text-right order-2 lg:order-1">
              <p className="text-sm md:text-base font-medium text-primary/80 tracking-wide mb-3">
                Everything You Love, All in One Place
              </p>

              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.2] mb-3">
                كل ما تحتاجينه في{' '}
                <span className="bg-gradient-to-l from-primary to-primary/70 bg-clip-text text-transparent">
                  مكان واحد
                </span>
              </h1>

              <p className="text-lg text-primary font-semibold mb-4">
                مرحباً بك في <span className="tracking-wide">Vita</span>
              </p>

              <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-5">
                متجر متكامل للجمال ونمط الحياة مكياج، عناية بالبشرة، عطور، إكسسوارات، حقائب،
                ومنتجات أناقة مختارة بعناية. كل ما تحبينه، في مكان واحد.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {storeCategories.map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary/8 border border-primary/15 text-foreground"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  asChild
                  className="text-base px-8 py-6 rounded-full shadow-md hover:shadow-lg hover:shadow-primary/15 transition-all font-semibold"
                >
                  <Link to="/products" className="flex items-center gap-2">
                    <span>تسوقي الآن</span>
                    <ShoppingBag className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="text-base px-8 py-6 rounded-full border-primary/25 hover:bg-primary/5 hover:border-primary transition-all font-semibold"
                >
                  <Link to="/categories">تصفح الأقسام</Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center items-center order-1 lg:order-2 py-4">
              <div className="relative w-full max-w-[360px]">
                <div className="absolute inset-4 rounded-[2rem] bg-primary/5 blur-2xl" />
                  <HeroVisual />
                
              </div>
            </div>
          </div>
        </div>
      </section>

      <BenefitsMarquee />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">الأقسام الرئيسية</h2>
            <Button variant="ghost" asChild>
              <Link to="/categories">عرض الكل</Link>
            </Button>
          </div>

          {categoriesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : featuredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <EmptyProducts
              title="لا توجد أقسام بعد"
              description="أضيفي الأقسام من لوحة التحكم لعرضها هنا."
            />
          )}
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">منتجات مميزة</h2>
              <p className="text-muted-foreground">باقة مختارة من أجود منتجاتنا</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/products">عرض الكل</Link>
            </Button>
          </div>
          <ProductGrid items={featuredProducts} emptyTitle="لا توجد منتجات مميزة بعد" />
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">وصل حديثاً</h2>
              <p className="text-muted-foreground">أحدث المنتجات في المتجر</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/products?filter=new">عرض الكل</Link>
            </Button>
          </div>
          <ProductGrid items={newProducts} emptyTitle="لا توجد منتجات جديدة بعد" />
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">عروض خاصة</h2>
              <p className="text-muted-foreground">خصومات مميزة على منتجات مختارة</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/products?filter=sale">عرض الكل</Link>
            </Button>
          </div>
          <ProductGrid items={saleProducts} emptyTitle="لا توجد عروض حالياً" />
        </div>
      </section>
    </div>
  );
}
