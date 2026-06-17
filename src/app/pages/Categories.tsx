import { CategoryCard } from '../components/CategoryCard';
import { useCategories } from '../lib/useCategories';
import { Link } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Loader2 } from 'lucide-react';

export function Categories() {
  const { data: categories, loading } = useCategories();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">جميع الأقسام</h1>
          <p className="text-muted-foreground">
            تصفحي مجموعتنا الكاملة من منتجات الجمال والعناية
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* Subcategories List */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">تصفح حسب القسم الفرعي</h2>
          
          {categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 text-primary">
                  {category.nameAr}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/products?category=${category.slug}&subcategory=${sub.slug}`}
                      className="px-4 py-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-center"
                    >
                      {sub.nameAr}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
