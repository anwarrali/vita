import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import {
  ShoppingBag, Search, Eye, Loader2, Calendar, MapPin, Phone, User,
  StickyNote, Mail, AlertCircle, RefreshCw, CheckCircle2, ChevronRight, X
} from 'lucide-react';

interface OrderItem {
  id: string;
  product_id: string;
  product_name_ar: string;
  product_image: string;
  variant_selection: Array<{ variantId: string; optionId: string; labelAr: string }> | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  customer_address: string;
  shipping_region: string;
  shipping_region_label: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  notes: string | null;
  confirmation_accepted: boolean;
  created_at: string;
  order_items?: OrderItem[];
}

const STATUS_BADGE: Record<Order['status'], string> = {
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  confirmed: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  shipped: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  delivered: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/30',
};

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'قيد الانتظار',
  confirmed: 'تم التأكيد',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

const ACTION_BTN =
  'inline-flex items-center justify-center min-w-11 min-h-11 p-2.5 rounded-xl transition-colors';

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setOrders(data as Order[] ?? []);
    } catch (e) {
      console.error('[admin_orders] Load error:', e);
      setError(e instanceof Error ? e.message : 'فشل تحميل الطلبات. تأكدي من تفعيل السياسات.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function updateOrderStatus(orderId: string, nextStatus: Order['status']) {
    setUpdatingStatus(orderId);
    setUpdateError('');
    try {
      const { error: err } = await supabase
        .from('orders')
        .update({ status: nextStatus })
        .eq('id', orderId);

      if (err) throw err;

      // Update state locally
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: nextStatus } : null);
      }
    } catch (e) {
      console.error('[admin_orders] Update error:', e);
      setUpdateError('فشل تحديث حالة الطلب');
    } finally {
      setUpdatingStatus(null);
    }
  }

  const filtered = orders.filter((order) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      order.customer_name.toLowerCase().includes(q) ||
      order.customer_phone.includes(q) ||
      order.id.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">إدارة الطلبات</h2>
          <p className="text-sm text-white/50">عرض الطلبات وإدارة حالاتها ومراجعة ملاحظات العملاء</p>
        </div>
        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 bg-[#292b99]/20 hover:bg-[#292b99]/40 border border-[#292b99]/30 text-[#8c8eff] px-4 py-2.5 rounded-xl text-sm transition-colors min-h-11"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث الطلبات
        </button>
      </div>

      {/* Errors */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            type="text"
            placeholder="ابحث باسم العميل أو رقم الهاتف أو رقم الطلب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 py-3 px-4 min-h-11 rounded-xl bg-[#0f0f1b] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#292b99] transition-colors text-right"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 min-h-11 rounded-xl bg-[#0f0f1b] border border-white/10 text-white focus:outline-none focus:border-[#292b99] transition-colors text-right cursor-pointer"
        >
          <option value="all">كل الحالات</option>
          <option value="pending">قيد الانتظار</option>
          <option value="confirmed">تم التأكيد</option>
          <option value="shipped">تم الشحن</option>
          <option value="delivered">تم التوصيل</option>
          <option value="cancelled">ملغي</option>
        </select>
      </div>

      {/* Order List */}
      <div className="bg-[#0f0f1b] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#8c8eff]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <ShoppingBag className="h-12 w-12 mb-3 text-white/10" />
            <p className="text-sm">{search || statusFilter !== 'all' ? 'لا توجد نتائج مطابقة لبحثك' : 'لا توجد طلبات في قاعدة البيانات بعد'}</p>
          </div>
        ) : (
          <>
            {/* Mobile List View */}
            <div className="md:hidden divide-y divide-white/5 p-3 space-y-3">
              {filtered.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="rounded-xl border border-white/10 p-4 space-y-3 bg-white/[0.02] hover:border-white/20 transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-semibold">{order.customer_name}</p>
                      <p className="text-xs text-white/40 mt-0.5">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <span className="text-[#8c8eff] font-bold">₪{order.total}</span>
                  </div>

                  <div className="text-xs text-white/60 space-y-1">
                    <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {order.customer_phone}</p>
                    <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {order.shipping_region_label}</p>
                    <p className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" /> 
                      {new Date(order.created_at).toLocaleDateString('ar-EG', { dateStyle: 'medium' })}
                    </p>
                  </div>

                  {/* Highlights notes on mobile list */}
                  {order.notes && (
                    <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg px-2.5 py-1.5 text-amber-200 text-xs flex items-start gap-1.5">
                      <StickyNote className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
                      <p className="line-clamp-2 leading-relaxed">ملاحظة: {order.notes}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full border ${STATUS_BADGE[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                    <span className="text-xs text-[#8c8eff] flex items-center gap-0.5 hover:underline">
                      عرض التفاصيل <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-white/50 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">رقم الطلب</th>
                    <th className="px-6 py-4">العميل</th>
                    <th className="px-6 py-4">رقم الهاتف</th>
                    <th className="px-6 py-4">المنطقة</th>
                    <th className="px-6 py-4">التاريخ</th>
                    <th className="px-6 py-4">الملاحظات</th>
                    <th className="px-6 py-4">الإجمالي</th>
                    <th className="px-6 py-4">الحالة</th>
                    <th className="px-6 py-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filtered.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-white/40">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        {order.customer_name}
                      </td>
                      <td className="px-6 py-4 text-white/70">
                        {order.customer_phone}
                      </td>
                      <td className="px-6 py-4 text-white/70">
                        {order.shipping_region_label}
                      </td>
                      <td className="px-6 py-4 text-white/70">
                        {new Date(order.created_at).toLocaleDateString('ar-EG', { dateStyle: 'medium' })}
                      </td>
                      <td className="px-6 py-4 max-w-[200px]">
                        {order.notes ? (
                          <div className="bg-amber-500/10 border border-amber-500/35 rounded-lg px-2 py-1 text-amber-200 text-xs flex items-center gap-1.5 w-fit max-w-full">
                            <StickyNote className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <span className="truncate" title={order.notes}>
                              {order.notes}
                            </span>
                          </div>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        ₪{order.total}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] inline-block px-2.5 py-1 rounded-full border ${STATUS_BADGE[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className={`${ACTION_BTN} bg-[#292b99]/20 text-[#8c8eff] hover:bg-[#292b99]/40`}
                          title="عرض تفاصيل الطلب"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Detail Overlay / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div 
            className="relative w-full max-w-2xl bg-[#0a0a14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-scale-in my-8 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0f0f1b]">
              <div>
                <h3 className="text-lg font-bold text-white">تفاصيل الطلب</h3>
                <p className="text-xs text-white/40 font-mono mt-0.5">#{selectedOrder.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Order Status Action Selector */}
              <div className="bg-[#0f0f1b] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-white/50 mb-1">حالة الطلب الحالية</h4>
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_BADGE[selectedOrder.status]}`}>
                    {STATUS_LABELS[selectedOrder.status]}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50 whitespace-nowrap">تغيير الحالة:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as Order['status'])}
                    disabled={updatingStatus === selectedOrder.id}
                    className="px-3 py-2 text-xs rounded-lg bg-[#0a0a14] border border-white/10 text-white focus:outline-none focus:border-[#292b99] cursor-pointer disabled:opacity-50"
                  >
                    <option value="pending">قيد الانتظار</option>
                    <option value="confirmed">تأكيد الطلب</option>
                    <option value="shipped">تم الشحن</option>
                    <option value="delivered">تم التوصيل</option>
                    <option value="cancelled">إلغاء الطلب</option>
                  </select>
                  {updatingStatus === selectedOrder.id && (
                    <Loader2 className="h-4 w-4 animate-spin text-[#8c8eff]" />
                  )}
                </div>
              </div>

              {updateError && (
                <p className="text-red-400 text-xs">{updateError}</p>
              )}

              {/* Dedicated highlighted notes section */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-white/50 flex items-center gap-1.5">
                  <StickyNote className="h-4 w-4 text-white/40" />
                  ملاحظات الطلب
                </h4>
                {selectedOrder.notes ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-200">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedOrder.notes}</p>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-white/30">
                    <p className="text-sm">لا توجد ملاحظات من العميل على هذا الطلب.</p>
                  </div>
                )}
              </div>

              {/* Client Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0f0f1b] border border-white/10 rounded-xl p-4 space-y-2.5">
                  <h4 className="font-semibold text-sm text-white/50 pb-2 border-b border-white/5">بيانات العميل</h4>
                  <div className="space-y-1.5 text-sm">
                    <p className="flex items-center gap-2"><User className="h-4 w-4 text-white/30" /> {selectedOrder.customer_name}</p>
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-white/30" /> {selectedOrder.customer_phone}</p>
                    {selectedOrder.customer_email && (
                      <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-white/30" /> {selectedOrder.customer_email}</p>
                    )}
                  </div>
                </div>

                <div className="bg-[#0f0f1b] border border-white/10 rounded-xl p-4 space-y-2.5">
                  <h4 className="font-semibold text-sm text-white/50 pb-2 border-b border-white/5">تفاصيل التوصيل والدفع</h4>
                  <div className="space-y-1.5 text-sm">
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-white/30" /> {selectedOrder.shipping_region_label}</p>
                    <p className="text-white/60 pr-6">العنوان: {selectedOrder.customer_address}</p>
                    <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-white/30" /> {new Date(selectedOrder.created_at).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-white/50">المنتجات المطلوبة</h4>
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10 text-white/40 font-medium">
                        <th className="px-4 py-3">المنتج</th>
                        <th className="px-4 py-3 text-center">الكمية</th>
                        <th className="px-4 py-3">سعر الوحدة</th>
                        <th className="px-4 py-3">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/80">
                      {selectedOrder.order_items?.map((item) => {
                        return (
                          <tr key={item.id} className="hover:bg-white/[0.01]">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                {item.product_image ? (
                                  <img src={item.product_image} alt="" className="w-9 h-9 rounded object-cover border border-white/10 shrink-0" />
                                ) : (
                                  <div className="w-9 h-9 rounded bg-white/5 flex items-center justify-center shrink-0">
                                    <ShoppingBag className="h-4 w-4 text-white/20" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-medium text-white truncate">{item.product_name_ar}</p>
                                  {item.variant_selection && (
                                    <p className="text-[10px] text-white/40 mt-0.5">
                                      {item.variant_selection.map((v) => v.labelAr).join(' - ')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-bold">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3">
                              ₪{item.unit_price}
                            </td>
                            <td className="px-4 py-3 font-semibold text-white">
                              ₪{item.total_price}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Price Calculation details summary */}
              <div className="bg-[#0f0f1b] border border-white/10 rounded-xl p-4 space-y-2 text-sm max-w-sm mr-auto">
                <div className="flex justify-between text-white/50">
                  <span>المجموع الفرعي:</span>
                  <span className="font-mono">₪{selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>تكلفة الشحن:</span>
                  <span className="font-mono">₪{selectedOrder.shipping_cost}</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-2 border-t border-white/5 text-base text-[#8c8eff]">
                  <span>الإجمالي الكلي:</span>
                  <span className="font-mono">₪{selectedOrder.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
