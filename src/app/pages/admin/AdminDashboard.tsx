import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { supabase } from '../../lib/supabase';
import { Package, Tag, AlertCircle, Plus, TrendingUp, ShoppingBag, Loader2, StickyNote } from 'lucide-react';

interface Stats {
  totalProducts: number;
  totalCategories: number;
  outOfStock: number;
  onSale: number;
  totalOrders: number;
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  confirmed: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  shipped: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  delivered: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/30',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'تم التأكيد',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [products, categories, outOfStock, onSale, orders] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('categories').select('id', { count: 'exact', head: true }),
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('in_stock', false),
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_on_sale', true),
          supabase.from('orders').select('id', { count: 'exact', head: true }),
        ]);
        
        setStats({
          totalProducts: products.count ?? 0,
          totalCategories: categories.count ?? 0,
          outOfStock: outOfStock.count ?? 0,
          onSale: onSale.count ?? 0,
          totalOrders: orders.count ?? 0,
        });
      } catch (e) {
        console.error('Failed to load stats:', e);
      } finally {
        setLoading(false);
      }
    }

    async function loadRecentOrders() {
      setOrdersLoading(true);
      try {
        const { data: ords } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        setRecentOrders(ords ?? []);
      } catch (e) {
        console.warn('Failed to load recent orders', e);
      } finally {
        setOrdersLoading(false);
      }
    }

    load();
    loadRecentOrders();
  }, []);

  const cards = [
    {
      label: 'الطلبات',
      value: stats?.totalOrders ?? '—',
      icon: ShoppingBag,
      color: 'from-blue-600 to-indigo-600',
      link: '/admin/orders',
    },
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
    <div className="space-y-8 animate-fade-in" dir="rtl">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
            to="/admin/orders"
            className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            إدارة الطلبات
          </Link>
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

      {/* Recent Orders Section */}
      <div className="bg-[#0f0f1b] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest">أحدث الطلبات</h3>
          <Link to="/admin/orders" className="text-xs text-[#8c8eff] hover:underline">
            عرض كل الطلبات ←
          </Link>
        </div>

        {ordersLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-[#8c8eff]" />
          </div>
        ) : recentOrders.length === 0 ? (
          <p className="text-sm text-white/30 text-center py-6">لا توجد طلبات بعد.</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div 
                key={order.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors gap-3"
              >
                <div className="space-y-1 text-right">
                  <div className="flex items-center gap-2 justify-start flex-row-reverse">
                    <span className="font-semibold text-white">{order.customer_name}</span>
                    <span className="text-xs text-white/40 font-mono">#{order.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-white/50 justify-start flex-row-reverse">
                    <span>{order.customer_phone}</span>
                    <span>•</span>
                    <span>{order.shipping_region_label}</span>
                    <span>•</span>
                    <span>{new Date(order.created_at).toLocaleDateString('ar-EG', { dateStyle: 'short' })}</span>
                  </div>
                  
                  {/* Highlight note if exists */}
                  {order.notes && (
                    <div className="mt-2 bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 w-fit mr-0 ml-auto">
                      <StickyNote className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="font-medium text-right">الملاحظة: {order.notes}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5 flex-row-reverse sm:flex-row">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_BADGE[order.status] || 'border-white/25 text-white/60'}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  <span className="font-bold text-white shrink-0">₪{order.total}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
