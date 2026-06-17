import React from 'react';
import { categories } from '../data/categories';
import { CategoryCard } from '../components/category/CategoryCard';

export const CategoriesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-right">جميع الفئات</h1>
        <p className="text-muted-foreground text-right">
          تصفحي جميع فئات المنتجات المتوفرة في المتجر
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} showSubcategories />
        ))}
      </div>
    </div>
  );
};
