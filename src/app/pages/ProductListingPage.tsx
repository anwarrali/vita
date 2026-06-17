import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { getProductsByCategory, filterProducts } from '../data/products';
import { getCategoryBySlug, getAllSubcategories } from '../data/categories';
import { ProductGrid } from '../components/product/ProductGrid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';

export const ProductListingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'popular'>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Find category
  const category = getCategoryBySlug(slug || '');
  const allSubcategories = getAllSubcategories();
  const subcategory = allSubcategories.find((sub) => sub.slug === slug);
  
  const currentCategory = category || subcategory;

  // Get products
  const categoryProducts = useMemo(() => {
    return getProductsByCategory(slug || '');
  }, [slug]);

  // Apply filters
  const filteredProducts = useMemo(() => {
    return filterProducts(categoryProducts, {
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      inStock: inStockOnly,
      sortBy,
    });
  }, [categoryProducts, priceRange, inStockOnly, sortBy]);

  if (!currentCategory) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">الفئة غير موجودة</h1>
        <Link to="/categories" className="text-primary hover:underline">
          العودة إلى الفئات
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
        <Link to="/" className="hover:text-primary">الرئيسية</Link>
        <ChevronRight className="h-4 w-4 rotate-180" />
        <Link to="/categories" className="hover:text-primary">الفئات</Link>
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span className="text-foreground">{currentCategory.nameAr}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-right">{currentCategory.nameAr}</h1>
        <p className="text-muted-foreground text-right">
          {filteredProducts.length} منتج
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
            <h2 className="font-semibold mb-4 text-right">فلترة النتائج</h2>

            {/* Sort */}
            <div className="mb-6">
              <Label className="mb-2 block text-right">ترتيب حسب</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث</SelectItem>
                  <SelectItem value="price_asc">السعر: من الأقل للأعلى</SelectItem>
                  <SelectItem value="price_desc">السعر: من الأعلى للأقل</SelectItem>
                  <SelectItem value="popular">الأكثر شعبية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <Label className="mb-3 block text-right">
                نطاق السعر: ₪{priceRange[0]} - ₪{priceRange[1]}
              </Label>
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                min={0}
                max={200}
                step={10}
                className="mb-2"
              />
            </div>

            {/* Stock Filter */}
            <div className="flex items-center justify-between">
              <Switch
                checked={inStockOnly}
                onCheckedChange={setInStockOnly}
              />
              <Label className="cursor-pointer" onClick={() => setInStockOnly(!inStockOnly)}>
                المتوفر فقط
              </Label>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <ProductGrid 
            products={filteredProducts} 
            emptyMessage="لا توجد منتجات تطابق معايير البحث"
          />
        </div>
      </div>
    </div>
  );
};
