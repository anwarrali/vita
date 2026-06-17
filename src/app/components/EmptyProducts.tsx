import { Link } from 'react-router';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Package } from 'lucide-react';

interface EmptyProductsProps {
  title?: string;
  description?: string;
  showAdminLink?: boolean;
}

export function EmptyProducts({
  title = 'لا توجد منتجات بعد',
  description = 'سيتم عرض المنتجات هنا بمجرد إضافتها من لوحة التحكم.',
  showAdminLink = false,
}: EmptyProductsProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">{description}</p>
        {showAdminLink && (
          <Button asChild variant="outline">
            <Link to="/admin/products/new">إضافة منتج</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
