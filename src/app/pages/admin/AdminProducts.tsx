import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { useAdminProducts } from '../../lib/useProducts';
import {
  Plus, Pencil, Trash2, Search, Package, CheckCircle2, XCircle, Tag, Loader2,
} from 'lucide-react';

export function AdminProducts() {
  const { data: products, loading, reload } = useAdminProducts();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      String(p.name_ar).toLowerCase().includes(q) ||
      String(p.name).toLowerCase().includes(q) ||
      String(p.category).toLowerCase().includes(q)
    );
  });

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    setDeleting(id);
    await supabase.from('products').delete().eq('id', id);
    setDeleting(null);
    reload();
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white">المنتجات</h2>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 bg-[#292b99] hover:bg-[#1b1d6f] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-[#292b99]/30"
        >
          <Plus className="h-4 w-4" />
          إضافة منتج
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input
          type="text"
          placeholder="ابحث عن منتج..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 py-3 px-4 rounded-xl bg-[#0f0f1b] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#292b99] transition-colors text-right"
        />
      </div>

      {/* Table */}
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-right px-4 py-3 text-white/40 font-medium">المنتج</th>
                  <th className="text-right px-4 py-3 text-white/40 font-medium hidden md:table-cell">القسم</th>
                  <th className="text-right px-4 py-3 text-white/40 font-medium">السعر</th>
                  <th className="text-center px-4 py-3 text-white/40 font-medium">المخزن</th>
                  <th className="text-center px-4 py-3 text-white/40 font-medium hidden sm:table-cell">مميز</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((product) => {
                  const images = Array.isArray(product.images) ? product.images as string[] : [];
                  return (
                    <tr key={product.id as string} className="hover:bg-white/5 transition-colors group">
                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {images[0] ? (
                            <img
                              src={images[0] as string}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                              <Package className="h-4 w-4 text-white/20" />
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium line-clamp-1">{String(product.name_ar)}</p>
                            <p className="text-white/30 text-xs">{String(product.id)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="inline-flex items-center gap-1 text-xs text-white/50 bg-white/5 rounded-lg px-2 py-1">
                          <Tag className="h-3 w-3" />
                          {String(product.category || '—')}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-[#8c8eff] font-semibold">₪{product.price as number}</span>
                          {product.original_price && (
                            <span className="text-white/30 line-through text-xs mr-1">₪{product.original_price as number}</span>
                          )}
                        </div>
                      </td>

                      {/* In Stock */}
                      <td className="px-4 py-3 text-center">
                        {product.in_stock ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400 inline" />
                        )}
                      </td>

                      {/* Featured */}
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        {product.is_featured ? (
                          <CheckCircle2 className="h-4 w-4 text-amber-400 inline" />
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                            className="p-2 rounded-lg bg-[#292b99]/20 hover:bg-[#292b99]/40 text-[#8c8eff] transition-colors"
                            title="تعديل"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id as string)}
                            disabled={deleting === product.id}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-40"
                            title="حذف"
                          >
                            {deleting === product.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-xs text-white/30 text-left">
          {filtered.length} منتج
          {products.length !== filtered.length && ` من ${products.length}`}
        </p>
      )}
    </div>
  );
}
