import { Link } from 'react-router';
import { Category } from '../types';
import { Card } from './ui/card';
import { ChevronLeft } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link to={`/products?category=${category.slug}`}>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={category.image}
            alt={category.nameAr}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">{category.nameAr}</h3>
            <p className="text-sm opacity-90 flex items-center gap-1">
              {category.subcategories.length} قسم فرعي
              <ChevronLeft className="h-4 w-4" />
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
