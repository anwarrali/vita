import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { useAdminProducts } from '../../lib/useProducts';
import {
  getListingStockQuantity,
  getProductStockStatus,
  STOCK_STATUS_LABELS,
} from '../../lib/inventory';
import { buildQuickRestockPayload, productUsesVariantStock } from '../../lib/adminRestock';
import type { Product } from '../../types';
import {
  Plus, Pencil, Trash2, Search, Package, Tag, Loader2, Boxes, Eye, EyeOff, PackagePlus,
  CheckCircle2, XCircle,
} from 'lucide-react';

const STOCK_BADGE: Record<string, string> = {
  in_stock: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  low_stock: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  out_of_stock: 'bg-red-500/15 text-red-300 border-red-500/30',
};

const ACTION_BTN =
  'inline-flex items-center justify-center min-w-11 min-h-11 p-2.5 rounded-xl transition-colors';

export function AdminProducts() {
  const { data: products, loading, reload } = useAdminProducts();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState('');
  const [restocking, setRestocking] = useState<string | null>(null);
  const [stockToggling, setStockToggling] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.nameAr.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  async function toggleActive(id: string, current: boolean) {
    setToggling(id);
    setToggleError('');
    const { error } = await supabase.from('products').update({ is_active: !current }).eq('id', id);
    setToggling(null);
    if (error) {
      if (error.message.includes('is_active')) {
        setToggleError('عمود is_active غير موجود — شغّل inventory_migration.sql في Supabase أولاً');
      } else {
        setToggleError(error.message);
      }
      return;
    }
    reload();
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟ يُفضّل إخفاؤه بدلاً من الحذف.')) return;
    setDeleting(id);
    await supabase.from('products').delete().eq('id', id);
    setDeleting(null);
    reload();
  }

  async function quickRestock(product: Product) {
    if (product.variants?.length && productUsesVariantStock(product.variants)) {
      navigate(`/admin/products/${product.id}/edit#stock`);
      return;
    }

    const input = window.prompt(
      `تجديد مخزون "${product.nameAr}"\nأدخلي الكمية الجديدة:`,
      '5'
    );
    if (input == null) return;

    const quantity = parseInt(input, 10);
    if (Number.isNaN(quantity) || quantity < 0) {
      window.alert('يرجى إدخال رقم صحيح أكبر من أو يساوي صفر');
      return;
    }

    setRestocking(product.id);
    const payload = buildQuickRestockPayload(product, quantity);
    const { error } = await supabase.from('products').update(payload).eq('id', product.id);
    setRestocking(null);

    if (error) {
      if (error.message.includes('stock_quantity')) {
        setToggleError('شغّل inventory_migration.sql في Supabase لتفعيل تجديد المخزون');
      } else {
        setToggleError(error.message);
      }
      return;
    }
    reload();
  }

  async function toggleStock(product: Product) {
    const next = !product.inStock;
    const label = next ? 'متوفر' : 'نفد المخزون';
    if (!confirm(`تغيير حالة "${product.nameAr}" إلى: ${label}؟`)) return;

    setStockToggling(product.id);
    setToggleError('');
    const { error } = await supabase
      .from('products')
      .update({ in_stock: next })
      .eq('id', product.id);
    setStockToggling(null);

    if (error) {
      setToggleError(error.message);
      return;
    }
    reload();
  }

  function isOutOfStock(product: Product) {
    return !product.inStock;
  }

  function getStockInfo(product: Product) {
    const qty = getListingStockQuantity(product);
    const status = getProductStockStatus(product);
    const label = product.inStock ? STOCK_STATUS_LABELS[status] : STOCK_STATUS_LABELS.out_of_stock;
    return { qty, status, label };
  }

  function renderActions(product: Product) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => toggleStock(product)}
          disabled={stockToggling === product.id}
          className={`${ACTION_BTN} ${
            product.inStock
              ? 'bg-red-500/10 text-red-300 hover:bg-red-500/20'
              : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
          }`}
          title={product.inStock ? 'تعيين: نفد المخزون' : 'تعيين: متوفر'}
        >
          {stockToggling === product.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : product.inStock ? (
            <XCircle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
        </button>
        {!product.inStock && (
          <button
            type="button"
            onClick={() => quickRestock(product)}
            disabled={restocking === product.id}
            className={`${ACTION_BTN} bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25`}
            title="تجديد المخزون"
          >
            {restocking === product.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PackagePlus className="h-4 w-4" />
            )}
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate(`/admin/products/${product.id}/edit#stock`)}
          className={`${ACTION_BTN} bg-amber-500/15 text-amber-300 hover:bg-amber-500/25`}
          title="المخزون"
        >
          <Boxes className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
          className={`${ACTION_BTN} bg-[#292b99]/20 text-[#8c8eff] hover:bg-[#292b99]/40`}
          title="تعديل"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => toggleActive(product.id, product.isActive)}
          disabled={toggling === product.id}
          className={`${ACTION_BTN} ${product.isActive ? 'bg-white/10 text-white/70 hover:bg-white/15' : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'}`}
          title={product.isActive ? 'إخفاء من المتجر' : 'إظهار في المتجر'}
        >
          {toggling === product.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : product.isActive ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => handleDelete(product.id)}
          disabled={deleting === product.id}
          className={`${ACTION_BTN} bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-40`}
          title="حذف"
        >
          {deleting === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white">المنتجات</h2>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 bg-[#292b99] hover:bg-[#1b1d6f] text-white px-4 py-3 min-h-11 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-[#292b99]/30"
        >
          <Plus className="h-4 w-4" />
          إضافة منتج
        </Link>
      </div>

      {toggleError && (
        <p className="text-amber-300 text-sm bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
          {toggleError}
        </p>
      )}

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input
          type="text"
          placeholder="ابحث عن منتج..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 py-3 px-4 min-h-11 rounded-xl bg-[#0f0f1b] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#292b99] transition-colors text-right"
        />
      </div>

      <div className="bg-[#0f0f1b] border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#8c8eff]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <Package className="h-12 w-12 mb-3" />
            <p>{search ? 'لا توجد نتائج' : 'لا توجد منتجات بعد — أضف أول منتج!'}</p>
          </div>
        ) : (
          <>
            <div className="md:hidden divide-y divide-white/5 p-3 space-y-3">
              {filtered.map((product) => {
                const stock = getStockInfo(product);
                return (
                  <div key={product.id} className="rounded-xl border border-white/10 p-4 space-y-3 bg-white/[0.02]">
                    <div className="flex items-start gap-3">
                      {product.images[0] ? (
                        <img src={product.images[0]} alt="" className="w-14 h-14 rounded-lg object-cover border border-white/10 shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                          <Package className="h-5 w-5 text-white/20" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium line-clamp-2">{product.nameAr}</p>
                        <p className="text-white/30 text-xs mt-1">{product.id}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className={`text-[11px] px-2 py-1 rounded-lg border ${STOCK_BADGE[stock.status]}`}>
                            {stock.label}
                            {stock.qty != null ? ` (${stock.qty})` : ''}
                          </span>
                          {!product.isActive && (
                            <span className="text-[11px] px-2 py-1 rounded-lg border border-white/20 text-white/50">
                              مخفي
                            </span>
                          )}
                          {!product.hasExplicitInventory && (
                            <span className="text-[11px] px-2 py-1 rounded-lg border border-amber-500/30 text-amber-300">
                              مخزون قديم
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[#8c8eff] font-semibold shrink-0">₪{product.price}</span>
                    </div>
                    {renderActions(product)}
                  </div>
                );
              })}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-right px-4 py-3 text-white/40 font-medium">المنتج</th>
                    <th className="text-right px-4 py-3 text-white/40 font-medium">القسم</th>
                    <th className="text-right px-4 py-3 text-white/40 font-medium">السعر</th>
                    <th className="text-center px-4 py-3 text-white/40 font-medium">المخزون</th>
                    <th className="text-center px-4 py-3 text-white/40 font-medium">الحالة</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((product) => {
                    const stock = getStockInfo(product);
                    return (
                      <tr key={product.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {product.images[0] ? (
                              <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                <Package className="h-4 w-4 text-white/20" />
                              </div>
                            )}
                            <div>
                              <p className="text-white font-medium line-clamp-1">{product.nameAr}</p>
                              <p className="text-white/30 text-xs">{product.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs text-white/50 bg-white/5 rounded-lg px-2 py-1">
                            <Tag className="h-3 w-3" />
                            {product.category || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[#8c8eff] font-semibold">₪{product.price}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded-lg border ${STOCK_BADGE[stock.status]}`}>
                            {stock.label}
                            {stock.qty != null ? ` (${stock.qty})` : ''}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {product.isActive ? (
                            <span className="text-xs text-emerald-300">ظاهر</span>
                          ) : (
                            <span className="text-xs text-white/40">مخفي</span>
                          )}
                        </td>
                        <td className="px-4 py-3">{renderActions(product)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {!loading && (
        <p className="text-xs text-white/30 text-left">
          {filtered.length} منتج
          {products.length !== filtered.length && ` من ${products.length}`}
        </p>
      )}
    </div>
  );
}
