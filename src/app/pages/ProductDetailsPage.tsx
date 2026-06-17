import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ChevronRight, ShoppingCart, Plus, Minus, Star } from 'lucide-react';
import { getProductById, products } from '../data/products';
import { getCategoryBySlug, getAllSubcategories } from '../data/categories';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ProductCard } from '../components/product/ProductCard';
import { toast } from 'sonner';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = getProductById(id || '');

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">المنتج غير موجود</h1>
        <Link to="/" className="text-primary hover:underline">
          العودة إلى الرئيسية
        </Link>
      </div>
    );
  }

  const allSubcategories = getAllSubcategories();
  const category = allSubcategories.find((cat) => cat.slug === product.categorySlug);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success('تمت الإضافة إلى السلة', {
      description: `${product.nameAr} - الكمية: ${quantity}`,
    });
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  const relatedProducts = products
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4);

  const displayPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
        <Link to="/" className="hover:text-primary">الرئيسية</Link>
        <ChevronRight className="h-4 w-4 rotate-180" />
        {category && (
          <>
            <Link to={`/category/${category.slug}`} className="hover:text-primary">
              {category.nameAr}
            </Link>
            <ChevronRight className="h-4 w-4 rotate-180" />
          </>
        )}
        <span className="text-foreground">{product.nameAr}</span>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Images */}
        <div>
          {/* Main Image */}
          <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4 relative">
            <img
              src={product.images[selectedImage]}
              alt={product.nameAr}
              className="w-full h-full object-cover"
            />
            {/* Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {product.isNew && (
                <Badge className="bg-success-color text-white">جديد</Badge>
              )}
              {hasDiscount && (
                <Badge className="bg-sale-color text-white">-{discountPercent}%</Badge>
              )}
            </div>
          </div>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-primary' : 'border-border'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.nameAr} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="text-right">
          {product.brand && (
            <p className="text-primary mb-2">{product.brand}</p>
          )}
          <h1 className="text-3xl font-bold mb-4">{product.nameAr}</h1>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2 mb-4 justify-end">
              <span className="text-sm text-muted-foreground">({product.reviewCount} تقييم)</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.rating!)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="mr-1">{product.rating}</span>
              </div>
            </div>
          )}

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-center gap-3 justify-end mb-2">
              <span className="text-3xl font-bold" style={{ color: 'var(--price-color)' }}>
                ₪{displayPrice}
              </span>
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through">
                  ₪{product.price}
                </span>
              )}
            </div>
            {hasDiscount && (
              <p className="text-sm" style={{ color: 'var(--sale-color)' }}>
                وفّري ₪{product.price - product.salePrice!} ({discountPercent}%)
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="font-semibold mb-2">الوصف</h2>
            <p className="text-muted-foreground leading-relaxed">{product.descriptionAr}</p>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.inStock ? (
              <p className="text-success-color flex items-center gap-2 justify-end">
                <span>متوفر في المخزون</span>
                <span className="w-2 h-2 bg-success-color rounded-full"></span>
              </p>
            ) : (
              <p className="text-destructive">غير متوفر حالياً</p>
            )}
          </div>

          {/* Quantity Selector */}
          {product.inStock && (
            <div className="mb-6">
              <Label className="mb-2 block">الكمية</Label>
              <div className="flex items-center gap-3 justify-end">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {product.inStock && (
            <div className="flex gap-3">
              <Button onClick={handleBuyNow} size="lg" className="flex-1">
                اشترِ الآن
              </Button>
              <Button
                onClick={handleAddToCart}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <ShoppingCart className="h-5 w-5 ml-2" />
                أضف للسلة
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-right">منتجات ذات صلة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Label component for local use
const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return <label className={`font-medium text-right block ${className}`}>{children}</label>;
};
