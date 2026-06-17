import React from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';

export const NotFound: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">الصفحة غير موجودة</h2>
        <p className="text-muted-foreground mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة
        </p>
        <Link to="/">
          <Button size="lg">العودة إلى الرئيسية</Button>
        </Link>
      </div>
    </div>
  );
};
