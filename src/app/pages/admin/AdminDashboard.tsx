import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { supabase } from '../../lib/supabase';
import { Package, Tag, AlertCircle, Plus, TrendingUp } from 'lucide-react';

interface Stats {
  totalProducts: number;
  totalCategories: number;
  outOfStock: number;
  onSale: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [products, categories, outOfStock, onSale] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('in_stock', false),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_on_sale', true),
      ]);
      setStats({
        totalProducts: products.count ?? 0,
        totalCategories: categories.count ?? 0,
        outOfStock: outOfStock.count ?? 0,
        onSale: onSale.count ?? 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    {
      label: 'إجمالي المنتجات',
      value: stats?.totalProducts ?? '—',
      icon: Package,
      color: 'from-[#292b99] to-[#4547cc]',
      link: '/admin/products',
    },
    {
      label: 'الأقسام',
      value: stats?.totalCategories ?? '—',
      icon: Tag,
      color: 'from-purple-600 to-purple-800',
      link: '/admin/categories',
    },
    {
      label: 'غير متوفر في المخزن',
      value: stats?.outOfStock ?? '—',
      icon: AlertCircle,
      color: 'from-red-600 to-red-800',
      link: '/admin/products',
    },
    {
      label: 'منتجات بتخفيض',
      value: stats?.onSale ?? '—',
      icon: TrendingUp,
      color: 'from-emerald-600 to-emerald-800',
      link: '/admin/products',
    },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">لوحة التحكم</h2>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 bg-[#292b99] hover:bg-[#1b1d6f] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-[#292b99]/30"
        >
          <Plus className="h-4 w-4" />
          إضافة منتج
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="group block bg-[#0f0f1b] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg`}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {loading ? (
                <span className="inline-block w-8 h-7 bg-white/10 rounded animate-pulse" />
              ) : (
                card.value
              )}
            </p>
            <p className="text-sm text-white/50">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-[#0f0f1b] border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">إجراءات سريعة</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 bg-[#292b99]/20 hover:bg-[#292b99]/40 border border-[#292b99]/30 text-[#8c8eff] px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            إضافة منتج جديد
          </Link>
          <Link
            to="/admin/categories"
            className="flex items-center gap-2 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-400 px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <Tag className="h-4 w-4" />
            إدارة الأقسام
          </Link>
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 px-4 py-2 rounded-xl text-sm transition-colors"
          >
            عرض المتجر ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
