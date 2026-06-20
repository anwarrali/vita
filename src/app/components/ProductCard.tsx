import { Link } from 'react-router';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter } from './ui/card';
import { useCart } from '../context/CartContext';
import { getProductStockStatus, isProductPurchasable, STOCK_STATUS_LABELS } from '../lib/inventory';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const stockStatus = getProductStockStatus(product);
  const hasVariants = Boolean(product.variants?.length);
  const canQuickAdd = !hasVariants && isProductPurchasable(product);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasVariants) {
      toast.info('يرجى اختيار الخيارات من صفحة المنتج');
      return;
    }
    addToCart(product);
    toast.success('تمت الإضافة إلى السلة');
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.nameAr}
            loading="lazy"
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />

          <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 flex flex-col gap-1 md:gap-2">
            {product.isNew && (
              <Badge className="bg-success text-white text-[10px] md:text-xs px-1.5 py-0.5 md:px-2">جديد</Badge>
            )}
            {product.isOnSale && (
              <Badge variant="destructive" className="text-[10px] md:text-xs px-1.5 py-0.5 md:px-2">تخفيض</Badge>
            )}
            {stockStatus === 'low_stock' && (
              <Badge className="bg-amber-500 text-white text-[10px] md:text-xs px-1.5 py-0.5 md:px-2">مخزون منخفض</Badge>
            )}
          </div>

          {stockStatus === 'out_of_stock' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold text-xs md:text-sm">{STOCK_STATUS_LABELS.out_of_stock}</span>
            </div>
          )}
        </div>

        <CardContent className="p-3 md:p-4">
          <h3 className="font-medium mb-1 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem] text-sm md:text-base leading-snug">
            {product.nameAr}
          </h3>

          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-base md:text-lg font-bold text-primary">
              ₪{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs md:text-sm text-muted-foreground line-through">
                ₪{product.originalPrice}
              </span>
            )}
          </div>
        </CardContent>
      </Link>

      <CardFooter className="p-3 pt-0 md:p-4 md:pt-0">
        <Button
          className="w-full text-xs md:text-sm h-8 md:h-9"
          onClick={handleAddToCart}
          disabled={!canQuickAdd}
        >
          <ShoppingCart className="ml-1 h-3.5 w-3.5 md:ml-2 md:h-4 md:w-4" />
          <span className="truncate">
            {hasVariants ? 'اختر الخيارات' : canQuickAdd ? 'أضف إلى السلة' : STOCK_STATUS_LABELS.out_of_stock}
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}
