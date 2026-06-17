import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router';
import { Search } from 'lucide-react';
import { searchProducts } from '../data/products';
import { ProductGrid } from '../components/product/ProductGrid';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchProducts(query);
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4 justify-end">
          <h1 className="text-3xl font-bold">نتائج البحث</h1>
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        
        {query && (
          <p className="text-muted-foreground text-right">
            البحث عن: "<span className="font-semibold text-foreground">{query}</span>"
            {results.length > 0 && ` - ${results.length} نتيجة`}
          </p>
        )}
      </div>

      {!query.trim() ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">
            الرجاء إدخال كلمة بحث
          </p>
          <Link to="/" className="text-primary hover:underline">
            العودة إلى الرئيسية
          </Link>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">
            لا توجد نتائج للبحث عن "{query}"
          </p>
          <Link to="/" className="text-primary hover:underline">
            العودة إلى الرئيسية
          </Link>
        </div>
      ) : (
        <ProductGrid products={results} />
      )}
    </div>
  );
};
