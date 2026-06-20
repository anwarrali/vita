import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../lib/useProducts';
import { useCategories } from '../lib/useCategories';
import { EmptyProducts } from '../components/EmptyProducts';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Filter, X, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import type { Product } from '../types';

function interleaveCategories(productsList: Product[]): Product[] {
  const groups: { [category: string]: Product[] } = {};
  for (const product of productsList) {
    const cat = product.category || 'other';
    if (!groups[cat]) {
      groups[cat] = [];
    }
    groups[cat].push(product);
  }

  const categories = Object.keys(groups);
  const result: Product[] = [];
  let hasMore = true;
  let index = 0;

  while (hasMore) {
    hasMore = false;
    for (const cat of categories) {
      const group = groups[cat];
      if (index < group.length) {
        result.push(group[index]);
        hasMore = true;
      }
    }
    index++;
  }

  return result;
}

export function ProductListing() {
  const { data: categories } = useCategories();
  const { data: products, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlySale, setShowOnlySale] = useState(false);
  const [showOnlyNew, setShowOnlyNew] = useState(false);

  // Get initial filters from URL
  const categoryFromUrl = searchParams.get('category');
  const subcategoryFromUrl = searchParams.get('subcategory');
  const filterFromUrl = searchParams.get('filter');

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply URL filters
    if (categoryFromUrl) {
      filtered = filtered.filter(
        (p) =>
          p.category === categoryFromUrl ||
          p.subcategory === categoryFromUrl ||
          p.category === categoryFromUrl.replace(/-/g, '_')
      );
    }
    if (subcategoryFromUrl) {
      filtered = filtered.filter((p) => p.subcategory === subcategoryFromUrl);
    }
    if (filterFromUrl === 'new') {
      filtered = filtered.filter((p) => p.isNew);
    }
    if (filterFromUrl === 'sale') {
      filtered = filtered.filter((p) => p.isOnSale);
    }

    // Apply other filters
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => selectedCategories.includes(p.category));
    }
    if (selectedSubcategories.length > 0) {
      filtered = filtered.filter((p) => selectedSubcategories.includes(p.subcategory));
    }
    if (showOnlyInStock) {
      filtered = filtered.filter((p) => p.inStock);
    }
    if (showOnlySale) {
      filtered = filtered.filter((p) => p.isOnSale);
    }
    if (showOnlyNew) {
      filtered = filtered.filter((p) => p.isNew);
    }

    // Price range
    filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort & Interleave
    const isDefaultView =
      !categoryFromUrl &&
      !subcategoryFromUrl &&
      !filterFromUrl &&
      selectedCategories.length === 0 &&
      selectedSubcategories.length === 0 &&
      !showOnlyInStock &&
      !showOnlySale &&
      !showOnlyNew &&
      sortBy === 'newest' &&
      priceRange[0] === 0 &&
      priceRange[1] === 500;

    if (isDefaultView) {
      filtered = interleaveCategories(filtered);
    } else {
      switch (sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'name':
          filtered.sort((a, b) => a.nameAr.localeCompare(b.nameAr, 'ar'));
          break;
        case 'newest':
        default:
          filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
          break;
      }
    }

    return filtered;
  }, [
    products,
    categoryFromUrl,
    subcategoryFromUrl,
    filterFromUrl,
    selectedCategories,
    selectedSubcategories,
    showOnlyInStock,
    showOnlySale,
    showOnlyNew,
    priceRange,
    sortBy,
  ]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setShowOnlyInStock(false);
    setShowOnlySale(false);
    setShowOnlyNew(false);
    setPriceRange([0, 500]);
    setSearchParams({});
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-bold mb-3">الأقسام</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${cat.id}`}
                checked={selectedCategories.includes(cat.slug)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories([...selectedCategories, cat.slug]);
                  } else {
                    setSelectedCategories(selectedCategories.filter((c) => c !== cat.slug));
                  }
                }}
              />
              <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer">
                {cat.nameAr}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-bold mb-3">السعر</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={500}
          step={10}
          className="mb-2"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>₪{priceRange[0]}</span>
          <span>₪{priceRange[1]}</span>
        </div>
      </div>

      {/* Quick Filters */}
      <div>
        <h3 className="font-bold mb-3">تصفية سريعة</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="in-stock"
              checked={showOnlyInStock}
              onCheckedChange={(checked) => setShowOnlyInStock(!!checked)}
            />
            <Label htmlFor="in-stock" className="cursor-pointer">
              متوفر فقط
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="on-sale"
              checked={showOnlySale}
              onCheckedChange={(checked) => setShowOnlySale(!!checked)}
            />
            <Label htmlFor="on-sale" className="cursor-pointer">
              عروض فقط
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="new-only"
              checked={showOnlyNew}
              onCheckedChange={(checked) => setShowOnlyNew(!!checked)}
            />
            <Label htmlFor="new-only" className="cursor-pointer">
              جديد فقط
            </Label>
          </div>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        <X className="ml-2 h-4 w-4" />
        مسح الفلاتر
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">المنتجات</h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} منتج
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block">
            <Card>
              <CardContent className="p-6">
                <FilterPanel />
              </CardContent>
            </Card>
          </aside>

          {/* Products */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              {/* Mobile Filter */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Filter className="ml-2 h-4 w-4" />
                    فلاتر
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>فلاتر البحث</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterPanel />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="ترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث</SelectItem>
                  <SelectItem value="price-asc">السعر: من الأقل للأعلى</SelectItem>
                  <SelectItem value="price-desc">السعر: من الأعلى للأقل</SelectItem>
                  <SelectItem value="name">الاسم</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyProducts />
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  لا توجد منتجات تطابق معايير البحث
                </p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  مسح الفلاتر
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
