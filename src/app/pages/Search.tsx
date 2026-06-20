import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../lib/useProducts';
import { EmptyProducts } from '../components/EmptyProducts';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/card';

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);

  const { data: searchResults, loading } = useProducts({
    searchQuery: activeQuery.trim() || undefined,
    skip: !activeQuery.trim(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setActiveQuery(q);
    if (q) {
      setSearchParams({ q });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setActiveQuery('');
    setSearchParams({});
  };

  return (
    <div className="min-h-dvh py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">البحث عن المنتجات</h1>

        <Card className="p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ابحث عن المنتجات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <Button type="submit">بحث</Button>
          </form>
        </Card>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && activeQuery && (
          <div>
            <p className="text-muted-foreground mb-6">
              {searchResults.length} نتيجة لـ &quot;{activeQuery}&quot;
            </p>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {searchResults.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">لم يتم العثور على منتجات</p>
                <Button variant="outline" onClick={clearSearch}>
                  مسح البحث
                </Button>
              </Card>
            )}
          </div>
        )}

        {!loading && !activeQuery && (
          <EmptyProducts
            title="ابدئي البحث"
            description="اكتبي اسم المنتج أو الماركة للعثور على ما تبحثين عنه."
          />
        )}
      </div>
    </div>
  );
}
