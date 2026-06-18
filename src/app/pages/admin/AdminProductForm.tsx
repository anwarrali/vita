import { useState, useEffect, FormEvent, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { supabase } from '../../lib/supabase';
import { useAdminCategories } from '../../lib/useCategories';
import type { ProductVariant, ProductVariantType } from '../../types';
import { syncInventoryOnSave } from '../../lib/inventory';
import { buildInventoryPayload } from '../../lib/adminRestock';
import {
  Save, ArrowRight, ImagePlus, Upload, X, Loader2, CheckCircle2, Plus,
  ChevronUp, ChevronDown, Star, PackagePlus,
} from 'lucide-react';

interface FormState {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  price: string;
  original_price: string;
  category: string;
  category_slug: string;
  brand: string;
  stock_quantity: string;
  in_stock: boolean;
  is_active: boolean;
  restock_show_in_store: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_on_sale: boolean;
  images: string[];
  variants: ProductVariant[];
}

const VARIANT_TYPES: { value: ProductVariantType; label: string }[] = [
  { value: 'color', label: 'لون' },
  { value: 'shade', label: 'درجة (مكياج)' },
  { value: 'size', label: 'مقاس' },
  { value: 'style', label: 'نمط' },
  { value: 'other', label: 'أخرى' },
];

const VARIANT_PRESETS: Record<ProductVariantType, { name: string; nameAr: string }> = {
  color: { name: 'Color', nameAr: 'اللون' },
  shade: { name: 'Shade', nameAr: 'الدرجة' },
  size: { name: 'Size', nameAr: 'المقاس' },
  style: { name: 'Style', nameAr: 'النمط' },
  other: { name: 'Option', nameAr: 'خيار' },
};

const EMPTY: FormState = {
  id: '',
  name: '',
  name_ar: '',
  description: '',
  description_ar: '',
  price: '',
  original_price: '',
  category: '',
  category_slug: '',
  brand: '',
  stock_quantity: '5',
  in_stock: true,
  is_active: true,
  restock_show_in_store: true,
  is_featured: false,
  is_new: false,
  is_on_sale: false,
  images: [],
  variants: [],
};

const INPUT_CLASS =
  'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#292b99] focus:ring-1 focus:ring-[#292b99]/50 transition-colors text-right';

function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-white/60 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className={INPUT_CLASS}
      />
    </div>
  );
}

function FormToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-white/70 group-hover:text-white transition-colors">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-[#292b99]' : 'bg-white/10'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${
            checked ? 'right-1' : 'right-6'
          }`}
        />
      </button>
    </label>
  );
}

export function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { data: allCategories } = useAdminCategories();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loadingForm, setLoadingForm] = useState(isEdit);
  const [loadedOutOfStock, setLoadedOutOfStock] = useState(false);

  // Load existing product for edit
  useEffect(() => {
    if (!isEdit) return;
    async function load() {
      const { data, error: err } = await supabase.from('products').select('*').eq('id', id).single();
      if (err || !data) { navigate('/admin/products'); return; }
      const r = data as Record<string, unknown>;
      const stockQty = r.stock_quantity != null ? Number(r.stock_quantity) : null;
      const inStock = r.in_stock == null ? true : Boolean(r.in_stock);
      setLoadedOutOfStock(!inStock);
      setForm({
        id: String(r.id ?? ''),
        name: String(r.name ?? ''),
        name_ar: String(r.name_ar ?? ''),
        description: String(r.description ?? ''),
        description_ar: String(r.description_ar ?? ''),
        price: String(r.price ?? ''),
        original_price: String(r.original_price ?? ''),
        category: String(r.category ?? ''),
        category_slug: String(r.category_slug ?? ''),
        brand: String(r.brand ?? ''),
        stock_quantity: stockQty != null ? String(stockQty) : '0',
        in_stock: inStock,
        is_active: r.is_active == null ? true : Boolean(r.is_active),
        restock_show_in_store: true,
        is_featured: Boolean(r.is_featured),
        is_new: Boolean(r.is_new),
        is_on_sale: Boolean(r.is_on_sale),
        images: Array.isArray(r.images) ? r.images as string[] : [],
        variants: Array.isArray(r.variants) ? r.variants as ProductVariant[] : [],
      });
      setLoadingForm(false);
    }
    load();
  }, [id, isEdit, navigate]);

  function applyQuickRestock(quantity: number) {
    if (form.variants.length === 0) {
      setForm((prev) => ({
        ...prev,
        stock_quantity: String(Math.max(0, quantity)),
        in_stock: quantity > 0 ? true : prev.in_stock,
        restock_show_in_store: true,
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      in_stock: true,
      variants: prev.variants.map((variant) => ({
        ...variant,
        options: variant.options.map((option) => ({
          ...option,
          stockQuantity: Math.max(0, quantity),
          inStock: quantity > 0,
        })),
      })),
      restock_show_in_store: true,
    }));
  }

  useEffect(() => {
    if (window.location.hash === '#stock' && !loadingForm) {
      document.getElementById('stock')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loadingForm]);

  function set(field: keyof FormState, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addImageUrl() {
    const url = imageUrl.trim();
    if (!url) return;
    set('images', [...form.images, url]);
    setImageUrl('');
  }

  function removeImage(idx: number) {
    set('images', form.images.filter((_, i) => i !== idx));
  }

  function moveImage(idx: number, direction: 'up' | 'down') {
    const next = [...form.images];
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    set('images', next);
  }

  function setPrimaryImage(idx: number) {
    if (idx === 0) return;
    const next = [...form.images];
    const [img] = next.splice(idx, 1);
    next.unshift(img);
    set('images', next);
  }

  function addVariant(type: ProductVariantType = 'other') {
    const preset = VARIANT_PRESETS[type];
    set('variants', [
      ...form.variants,
      {
        id: `variant-${Date.now()}`,
        name: preset.name,
        nameAr: preset.nameAr,
        type,
        options: [{ id: `opt-${Date.now()}`, label: 'Option', labelAr: 'خيار', stockQuantity: 5, inStock: true }],
      },
    ]);
  }

  function updateVariant(index: number, patch: Partial<ProductVariant>) {
    set(
      'variants',
      form.variants.map((v, i) => (i === index ? { ...v, ...patch } : v))
    );
  }

  function removeVariant(index: number) {
    set('variants', form.variants.filter((_, i) => i !== index));
  }

  function addVariantOption(variantIndex: number) {
    set(
      'variants',
      form.variants.map((v, i) =>
        i === variantIndex
          ? {
              ...v,
              options: [
                ...v.options,
                { id: `opt-${Date.now()}`, label: 'Option', labelAr: 'خيار', stockQuantity: 5, inStock: true },
              ],
            }
          : v
      )
    );
  }

  function updateVariantOption(
    variantIndex: number,
    optionIndex: number,
    patch: Partial<ProductVariant['options'][number]>
  ) {
    set(
      'variants',
      form.variants.map((v, i) =>
        i === variantIndex
          ? {
              ...v,
              options: v.options.map((o, oi) =>
                oi === optionIndex ? { ...o, ...patch } : o
              ),
            }
          : v
      )
    );
  }

  function removeVariantOption(variantIndex: number, optionIndex: number) {
    set(
      'variants',
      form.variants.map((v, i) =>
        i === variantIndex
          ? { ...v, options: v.options.filter((_, oi) => oi !== optionIndex) }
          : v
      )
    );
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setError('');
    setUploading(true);
    const uploaded: string[] = [];

    for (const file of list) {
      const safeName = file.name
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9._-]/g, '');
      const extension = safeName.includes('.') ? '' : '.jpg';
      const path = `products/${Date.now()}_${Math.random().toString(36).slice(2)}_${safeName || 'image'}${extension}`;
      const { error: upErr } = await supabase.storage.from('product-images').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      });
      if (upErr) {
        setError(`فشل رفع الصورة (${file.name}): ${upErr.message}`);
        break;
      }
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
      uploaded.push(urlData.publicUrl);
    }

    if (uploaded.length > 0) {
      set('images', [...form.images, ...uploaded]);
    }
    setUploading(false);
  }

  async function uploadFile(file: File) {
    await uploadFiles([file]);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files?.length) uploadFiles(files);
    e.target.value = '';
  }

  function generateId(nameAr: string, category: string): string {
    const slug = nameAr
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FF\w-]/g, '')
      .slice(0, 20);
    return `${category || 'product'}-${slug}-${Date.now()}`;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name_ar) { setError('اسم المنتج بالعربية مطلوب'); return; }
    if (!form.price) { setError('السعر مطلوب'); return; }
    if (form.images.length === 0) { setError('أضف صورة واحدة على الأقل'); return; }

    const baseStock = parseInt(form.stock_quantity, 10);
    if (Number.isNaN(baseStock) || baseStock < 0) {
      setError('كمية المخزون يجب أن تكون رقمًا صحيحًا أكبر من أو يساوي صفر');
      return;
    }

    const restocking = loadedOutOfStock && form.in_stock;
    const inventoryFields = buildInventoryPayload({
      stockQuantity: baseStock,
      variants: form.variants,
      inStock: form.in_stock,
      isActive: form.is_active,
      forceVisibleOnRestock: restocking && form.restock_show_in_store,
    });

    setSaving(true);
    const payload = {
      name: form.name || form.name_ar,
      name_ar: form.name_ar,
      description: form.description || null,
      description_ar: form.description_ar || null,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      category: form.category || null,
      category_slug: form.category_slug || null,
      brand: form.brand || null,
      images: form.images,
      stock_quantity: inventoryFields.stock_quantity,
      in_stock: inventoryFields.in_stock,
      is_active: inventoryFields.is_active,
      is_featured: form.is_featured,
      is_new: form.is_new,
      is_on_sale: form.is_on_sale,
      variants: inventoryFields.variants,
    };

    let err;
    if (isEdit) {
      ({ error: err } = await supabase.from('products').update(payload).eq('id', id));
    } else {
      ({ error: err } = await supabase.from('products').insert({
        id: generateId(form.name_ar, form.category),
        ...payload,
      }));
    }

    if (err && (err.message.includes('stock_quantity') || err.message.includes('is_active'))) {
      const { stock_quantity: _sq, is_active: _ia, ...legacyPayload } = payload;
      // legacyPayload keeps in_stock + variants
      if (isEdit) {
        ({ error: err } = await supabase.from('products').update(legacyPayload).eq('id', id));
      } else {
        ({ error: err } = await supabase.from('products').insert({
          id: generateId(form.name_ar, form.category),
          ...legacyPayload,
        }));
      }
    }

    setSaving(false);
    if (err) {
      setError(
        err.message.includes('stock_quantity') || err.message.includes('is_active')
          ? `${err.message} — شغّل inventory_migration.sql في Supabase SQL Editor`
          : err.message
      );
      return;
    }
    setSuccess(true);
    setTimeout(() => navigate('/admin/products'), 1200);
  }

  if (loadingForm) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#8c8eff]" />
      </div>
    );
  }

  // Root categories (those without parent_id) for the dropdown
  const rootCategories = (allCategories as Record<string, unknown>[]).filter((c) => !c.parent_id);
  const subCategories = (allCategories as Record<string, unknown>[]).filter(
    (c) => c.parent_id && c.parent_id === form.category
  );

  return (
    <div dir="rtl">
      {/* Back */}
      <button
        onClick={() => navigate('/admin/products')}
        className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowRight className="h-4 w-4" />
        العودة للمنتجات
      </button>

      <h2 className="text-xl font-bold text-white mb-6">
        {isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main Info */}
        <div className="lg:col-span-2 space-y-5">

          {/* Basic Info */}
          <div className="bg-[#0f0f1b] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">معلومات المنتج</h3>
            <FormInput label="الاسم بالعربية" value={form.name_ar} onChange={(v) => set('name_ar', v)} placeholder="مثال: كريم مرطب للوجه" required />
            <FormInput label="الاسم بالإنجليزية" value={form.name} onChange={(v) => set('name', v)} placeholder="Hydrating Face Cream" />
            <div>
              <label className="block text-sm text-white/60 mb-1.5">الوصف بالعربية</label>
              <textarea
                value={form.description_ar}
                onChange={(e) => set('description_ar', e.target.value)}
                rows={3}
                placeholder="وصف المنتج..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#292b99] transition-colors text-right resize-none"
              />
            </div>
            <FormInput label="الماركة / العلامة التجارية" value={form.brand} onChange={(v) => set('brand', v)} placeholder="مثال: L'Oréal" />
          </div>

          {/* Pricing */}
          <div className="bg-[#0f0f1b] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">التسعير</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="السعر (₪)" value={form.price} onChange={(v) => set('price', v)} type="number" placeholder="0.00" required />
              <FormInput label="السعر قبل التخفيض (₪)" value={form.original_price} onChange={(v) => set('original_price', v)} type="number" placeholder="اختياري" />
            </div>
          </div>

          {/* Images */}
          <div className="bg-[#0f0f1b] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-2">الصور <span className="text-red-400">*</span></h3>

            {/* Image grid */}
            {form.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {form.images.map((src, idx) => (
                  <div key={`${src}-${idx}`} className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/20">
                    <img src={src} alt="" className="w-full aspect-square object-cover" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-1.5 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => setPrimaryImage(idx)} title="تعيين كصورة رئيسية" className="p-1 rounded bg-white/10 hover:bg-white/20 text-white">
                        <Star className={`h-3.5 w-3.5 ${idx === 0 ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </button>
                      <div className="flex gap-1">
                        <button type="button" disabled={idx === 0} onClick={() => moveImage(idx, 'up')} className="p-1 rounded bg-white/10 hover:bg-white/20 text-white disabled:opacity-30">
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" disabled={idx === form.images.length - 1} onClick={() => moveImage(idx, 'down')} className="p-1 rounded bg-white/10 hover:bg-white/20 text-white disabled:opacity-30">
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => removeImage(idx)} className="p-1 rounded bg-red-500/80 hover:bg-red-500 text-white">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {idx === 0 && (
                      <span className="absolute top-1 right-1 text-[9px] bg-[#292b99] text-white px-1.5 py-0.5 rounded">رئيسية</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* URL paste */}
            <div>
              <label className="block text-sm text-white/60 mb-1.5">رابط الصورة</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl(); } }}
                  placeholder="https://..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#292b99] transition-colors"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#292b99]/20 hover:bg-[#292b99]/40 border border-[#292b99]/30 text-[#8c8eff] rounded-xl text-sm transition-colors"
                >
                  <ImagePlus className="h-4 w-4" />
                  إضافة
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-white/10 hover:border-[#292b99]/50 rounded-xl text-white/40 hover:text-white/70 text-sm transition-all"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading ? 'جاري الرفع...' : 'رفع صور متعددة من الجهاز'}
              </button>
              <p className="text-xs text-white/20 mt-1.5 text-center">
                يتطلب تفعيل Supabase Storage bucket باسم "product-images"
              </p>
            </div>
          </div>

          {/* Inventory */}
          <div id="stock" className="bg-[#0f0f1b] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest">المخزون</h3>
            </div>

            {/* Manual in/out of stock — independent of quantity */}
            <div className="rounded-xl border border-white/10 p-4 space-y-3">
              <p className="text-sm text-white/70 font-medium">حالة التوفر في المتجر</p>
              <p className="text-xs text-white/40">
                اختاري يدوياً متوفر أو نفد المخزون. عند نفاد الكمية من الطلبات يُعاد تلقائياً إلى نفد المخزون.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => set('in_stock', true)}
                  className={`min-h-11 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    form.in_stock
                      ? 'bg-emerald-500/25 text-emerald-200 border-2 border-emerald-500/50'
                      : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  ✓ متوفر
                </button>
                <button
                  type="button"
                  onClick={() => set('in_stock', false)}
                  className={`min-h-11 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    !form.in_stock
                      ? 'bg-red-500/25 text-red-200 border-2 border-red-500/50'
                      : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  ✕ نفد المخزون
                </button>
              </div>
            </div>

            {!form.in_stock && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                المنتج مخفي كـ «نفد المخزون». اضغطي «متوفر» أو زيدي الكمية واحفظي.
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-white/40 w-full mb-1">تجديد سريع:</span>
              {[5, 10, 20].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => applyQuickRestock(qty)}
                  className="inline-flex items-center gap-1.5 min-h-11 px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 text-sm transition-colors"
                >
                  <PackagePlus className="h-4 w-4" />
                  {qty} قطعة
                </button>
              ))}
            </div>

            {form.variants.length === 0 ? (
              <FormInput
                label="كمية المخزون"
                value={form.stock_quantity}
                onChange={(v) => set('stock_quantity', v)}
                type="number"
                placeholder="0"
                required
              />
            ) : (
              <p className="text-sm text-white/50">
                عدّلي كمية كل خيار (لون / مقاس...) أدناه. أي كمية أكبر من 0 تعيد المنتج للمخزون.
              </p>
            )}

            {(loadedOutOfStock || !form.is_active) && form.in_stock && (
              <FormToggle
                label="إظهار المنتج في المتجر بعد التجديد"
                checked={form.restock_show_in_store}
                onChange={(v) => set('restock_show_in_store', v)}
              />
            )}
          </div>

          {/* Variants */}
          <div className="bg-[#0f0f1b] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest">الخيارات والمتغيرات</h3>
              <div className="flex flex-wrap gap-1.5">
                {(['color', 'shade', 'size'] as ProductVariantType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addVariant(type)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-[#292b99]/20 hover:bg-[#292b99]/40 border border-[#292b99]/30 text-[#8c8eff] rounded-lg transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    {VARIANT_PRESETS[type].nameAr}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => addVariant('other')}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] border border-white/10 text-white/50 hover:text-white rounded-lg transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  خيار آخر
                </button>
              </div>
            </div>

            {form.variants.length === 0 && (
              <p className="text-sm text-white/30">أضيفي ألوان، درجات مكياج، مقاسات، أو خيارات أخرى حسب المنتج.</p>
            )}

            {form.variants.map((variant, vi) => (
              <div key={variant.id} className="border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                    <input
                      value={variant.nameAr}
                      onChange={(e) => updateVariant(vi, { nameAr: e.target.value, name: e.target.value })}
                      placeholder="اسم الخيار (عربي)"
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm text-right"
                    />
                    <select
                      value={variant.type}
                      onChange={(e) => updateVariant(vi, { type: e.target.value as ProductVariantType })}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    >
                      {VARIANT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <button type="button" onClick={() => removeVariant(vi)} className="text-red-400 hover:text-red-300 p-1" title="حذف المجموعة">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {variant.options.map((option, oi) => (
                    <div key={option.id} className="p-3 rounded-lg bg-white/[0.03] border border-white/5 space-y-2">
                      <div className="flex flex-wrap gap-2 items-center">
                        <input
                          value={option.labelAr}
                          onChange={(e) =>
                            updateVariantOption(vi, oi, { labelAr: e.target.value, label: e.target.value })
                          }
                          placeholder="اسم القيمة (عربي)"
                          className="flex-1 min-w-[120px] px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm text-right"
                        />
                        {(variant.type === 'color' || variant.type === 'shade') && (
                          <input
                            type="color"
                            value={option.colorHex || '#cccccc'}
                            onChange={(e) => updateVariantOption(vi, oi, { colorHex: e.target.value })}
                            className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                            title="لون العينة"
                          />
                        )}
                        <input
                          type="number"
                          value={option.priceModifier ?? ''}
                          onChange={(e) =>
                            updateVariantOption(vi, oi, {
                              priceModifier: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                          }
                          placeholder="±₪"
                          className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                        />
                        <input
                          type="number"
                          min={0}
                          value={option.stockQuantity ?? 0}
                          onChange={(e) => {
                            const stockQuantity = Math.max(0, parseInt(e.target.value, 10) || 0);
                            updateVariantOption(vi, oi, {
                              stockQuantity,
                              inStock: stockQuantity > 0,
                            });
                          }}
                          placeholder="كمية"
                          title="كمية المخزون — 0 = نفد، أي رقم أكبر يعيد التوفر"
                          className="w-24 min-h-11 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                        />
                        <button type="button" onClick={() => removeVariantOption(vi, oi)} className="text-red-400 p-1 ml-auto" title="حذف القيمة">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={option.imageUrl ?? ''}
                        onChange={(e) => updateVariantOption(vi, oi, { imageUrl: e.target.value.trim() || undefined })}
                        placeholder="رابط صورة الخيار (اختياري — مفيد للدرجات والألوان)"
                        dir="ltr"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                      />
                      <input
                        type="text"
                        value={option.sku ?? ''}
                        onChange={(e) => updateVariantOption(vi, oi, { sku: e.target.value || undefined })}
                        placeholder="SKU / رمز المخزون (اختياري)"
                        dir="ltr"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addVariantOption(vi)}
                    className="text-xs text-[#8c8eff] hover:text-white transition-colors"
                  >
                    + إضافة قيمة
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Settings */}
        <div className="space-y-5">

          {/* Category */}
          <div className="bg-[#0f0f1b] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">التصنيف</h3>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">القسم الرئيسي</label>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value, category_slug: '' }))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#292b99] transition-colors"
              >
                <option value="">— اختر القسم —</option>
                {rootCategories.map((c) => (
                  <option key={c.id as string} value={c.id as string}>{c.name_ar as string}</option>
                ))}
              </select>
            </div>
            {subCategories.length > 0 && (
              <div>
                <label className="block text-sm text-white/60 mb-1.5">القسم الفرعي</label>
                <select
                  value={form.category_slug}
                  onChange={(e) => set('category_slug', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#292b99] transition-colors"
                >
                  <option value="">— القسم الفرعي —</option>
                  {subCategories.map((c) => (
                    <option key={c.id as string} value={c.slug as string}>{c.name_ar as string}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Flags */}
          <div className="bg-[#0f0f1b] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">الخصائص</h3>
            <FormToggle label="ظاهر في المتجر" checked={form.is_active} onChange={(v) => set('is_active', v)} />
            <FormToggle label="منتج مميز" checked={form.is_featured} onChange={(v) => set('is_featured', v)} />
            <FormToggle label="منتج جديد" checked={form.is_new} onChange={(v) => set('is_new', v)} />
            <FormToggle label="تخفيض" checked={form.is_on_sale} onChange={(v) => set('is_on_sale', v)} />
          </div>

          {/* Save */}
          <div className="bg-[#0f0f1b] border border-white/10 rounded-2xl p-6 space-y-3">
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            {success && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm justify-center">
                <CheckCircle2 className="h-4 w-4" />
                تم الحفظ بنجاح!
              </div>
            )}
            <button
              type="submit"
              disabled={saving || success}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#292b99] hover:bg-[#1b1d6f] text-white font-semibold rounded-xl transition-colors disabled:opacity-60 shadow-lg shadow-[#292b99]/30"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'جاري الحفظ...' : success ? 'تم!' : 'حفظ المنتج'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
