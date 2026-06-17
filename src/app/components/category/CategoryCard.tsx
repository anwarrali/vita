import React from 'react';
import { Link } from 'react-router';
import { Category } from '../../types';
import { ChevronLeft } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  showSubcategories?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  showSubcategories = false 
}) => {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
      <Link 
        to={`/category/${category.slug}`}
        className="block p-6 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{category.nameAr}</h3>
        </div>
        {category.description && (
          <p className="text-sm text-muted-foreground text-right">{category.description}</p>
        )}
      </Link>

      {showSubcategories && category.subcategories && category.subcategories.length > 0 && (
        <div className="border-t border-border p-4 bg-muted/30">
          <div className="grid grid-cols-2 gap-2">
            {category.subcategories.slice(0, 4).map((sub) => (
              <Link
                key={sub.id}
                to={`/category/${sub.slug}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors text-right"
              >
                {sub.nameAr}
              </Link>
            ))}
          </div>
          {category.subcategories.length > 4 && (
            <Link
              to={`/category/${category.slug}`}
              className="text-sm text-primary hover:underline mt-2 block text-right"
            >
              عرض الكل ({category.subcategories.length})
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
