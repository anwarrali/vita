import { useState, FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdminCategories } from '../../lib/useCategories';
import { Plus, Pencil, Trash2, Save, X, Loader2, Tag } from 'lucide-react';

interface CatForm { id: string; name: string; name_ar: string; slug: string; image_url: string; parent_id: string; }
const EMPTY_CAT: CatForm = { id: '', name: '', name_ar: '', slug: '', image_url: '', parent_id: '' };

export function AdminCategories() {
  const { data: categories, loading, reload } = useAdminCategories();
  const [editing, setEditing] = useState<CatForm | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CatForm>(EMPTY_CAT);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');

  function startCreate() { setForm(EMPTY_CAT); setEditing(null); setCreating(true); setError(''); }
  function startEdit(cat: Record<string, unknown>) {
    setCreating(false);
    setEditing({
      id: String(cat.id ?? ''),
      name: String(cat.name ?? ''),
      name_ar: String(cat.name_ar ?? ''),
      slug: String(cat.slug ?? ''),
      image_url: String(cat.image_url ?? ''),
      parent_id: String(cat.parent_id ?? ''),
    });
    setForm({
      id: String(cat.id ?? ''),
      name: String(cat.name ?? ''),
      name_ar: String(cat.name_ar ?? ''),
      slug: String(cat.slug ?? ''),
      image_url: String(cat.image_url ?? ''),
      parent_id: String(cat.parent_id ?? ''),
    });
    setError('');
  }
  function cancel() { setEditing(null); setCreating(false); setError(''); }

  function autoSlug(nameAr: string) {
    return nameAr.trim().replace(/\s+/g, '-').replace(/[^\u0600-\u06FFa-z0-9-]/gi, '').toLowerCase() + '-' + Date.now();
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!form.name_ar) { setError('الاسم العربي مطلوب'); return; }
    setSaving(true);
    setError('');
    const slug = form.slug || autoSlug(form.name_ar);
    const payload = {
      name: form.name || form.name_ar,
      name_ar: form.name_ar,
      slug,
      image_url: form.image_url || null,
      parent_id: form.parent_id || null,
    };
    let err;
    if (editing) {
      ({ error: err } = await supabase.from('categories').update(payload).eq('id', editing.id));
    } else {
      ({ error: err } = await supabase.from('categories').insert({ id: slug, ...payload }));
    }
    setSaving(false);
    if (err) { setError(err.message); return; }
    cancel();
    reload();
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    setDeleting(id);
    await supabase.from('categories').delete().eq('id', id);
    setDeleting(null);
    reload();
  }

  const rootCats = (categories as Record<string, unknown>[]).filter((c) => !c.parent_id);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">الأقسام</h2>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 bg-[#292b99] hover:bg-[#1b1d6f] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-[#292b99]/30"
        >
          <Plus className="h-4 w-4" />
          إضافة قسم
        </button>
      </div>

      {/* Form */}
      {(creating || editing) && (
        <div className="bg-[#0f0f1b] border border-[#292b99]/40 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">{editing ? 'تعديل القسم' : 'قسم جديد'}</h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">الاسم بالعربية *</label>
              <input value={form.name_ar} onChange={(e) => setForm(f => ({ ...f, name_ar: e.target.value }))}
                placeholder="مثال: العناية بالبشرة" required
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#292b99] transition-colors text-right" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">الاسم بالإنجليزية</label>
              <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Skincare"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#292b99] transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Slug (اختياري)</label>
              <input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="سيتم توليده تلقائياً"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#292b99] transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">القسم الأب (اختياري)</label>
              <select value={form.parent_id} onChange={(e) => setForm(f => ({ ...f, parent_id: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#292b99] transition-colors">
                <option value="">— قسم رئيسي —</option>
                {rootCats.map((c) => <option key={c.id as string} value={c.id as string}>{c.name_ar as string}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-white/50 mb-1">رابط الصورة (اختياري)</label>
              <input value={form.image_url} onChange={(e) => setForm(f => ({ ...f, image_url: e.target.value }))}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#292b99] transition-colors" />
            </div>
            {error && <p className="sm:col-span-2 text-red-400 text-sm">{error}</p>}
            <div className="sm:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={cancel}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors">
                <X className="h-3.5 w-3.5" /> إلغاء
              </button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#292b99] hover:bg-[#1b1d6f] text-white text-sm font-medium transition-colors disabled:opacity-60">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                حفظ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-[#0f0f1b] border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#8c8eff]" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/30">
            <Tag className="h-10 w-10 mb-3" />
            <p>لا توجد أقسام بعد</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {(categories as Record<string, unknown>[]).map((cat) => (
              <div key={cat.id as string} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 group transition-colors">
                {cat.image_url ? (
                  <img src={cat.image_url as string} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <Tag className="h-4 w-4 text-white/20" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium">{cat.name_ar as string}</p>
                  <p className="text-white/30 text-xs">
                    {cat.slug as string}
                    {cat.parent_id && <span className="text-[#8c8eff] mr-2">↳ قسم فرعي</span>}
                  </p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(cat)}
                    className="p-2 rounded-lg bg-[#292b99]/20 hover:bg-[#292b99]/40 text-[#8c8eff] transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(cat.id as string)} disabled={deleting === cat.id}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-40">
                    {deleting === cat.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
