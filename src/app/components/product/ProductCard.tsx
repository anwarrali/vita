import React from 'react';
import { Link } from 'react-router';
import { ShoppingCart, Heart } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success('تمت الإضافة إلى السلة', {
      description: product.nameAr,
    });
  };

  const displayPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.images[0]}
            alt={product.nameAr}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-success-color text-white">جديد</Badge>
            )}
            {hasDiscount && (
              <Badge className="bg-sale-color text-white">-{discountPercent}%</Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              className="flex-1"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-medium text-right mb-1 line-clamp-2">{product.nameAr}</h3>
          
          {product.brand && (
            <p className="text-sm text-muted-foreground text-right mb-2">{product.brand}</p>
          )}

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2 justify-end">
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
              <span className="text-sm">⭐ {product.rating}</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 justify-end">
            <span className="font-semibold text-lg" style={{ color: 'var(--price-color)' }}>
              ₪{displayPrice}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ₪{product.price}
              </span>
            )}
          </div>

          {/* Stock Status */}
          {!product.inStock && (
            <p className="text-sm text-destructive text-right mt-2">غير متوفر</p>
          )}
        </div>
      </div>
    </Link>
  );
};
