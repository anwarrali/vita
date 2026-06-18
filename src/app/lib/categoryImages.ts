import { supabase } from './supabase';

const PLACEHOLDER_PATTERN = /unsplash\.com|placeholder|picsum\.photos|placehold\.co/i;

export function isPlaceholderCategoryImage(url: string | null | undefined): boolean {
  if (!url || !url.trim()) return true;
  return PLACEHOLDER_PATTERN.test(url);
}

export function getFirstProductImage(images: unknown): string | null {
  if (!Array.isArray(images) || images.length === 0) return null;
  const first = images[0];
  return typeof first === 'string' && first.trim() ? first.trim() : null;
}

export function resolveCategoryImage(
  categoryId: string,
  dbImageUrl: string | null | undefined,
  productImageByCategory: Map<string, string>
): string {
  const fromProduct = productImageByCategory.get(categoryId);
  if (fromProduct) return fromProduct;
  if (dbImageUrl && !isPlaceholderCategoryImage(dbImageUrl)) return dbImageUrl;
  return '';
}

/** Latest product image per root category id (and per category_slug for sub-only assignments). */
export async function fetchCategoryProductImageMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  const { data, error } = await supabase
    .from('products')
    .select('category, category_slug, images, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[categoryImages] Failed to load product images:', error.message);
    return map;
  }

  for (const row of data ?? []) {
    const image = getFirstProductImage(row.images);
    if (!image) continue;

    const categoryId = String(row.category ?? '').trim();
    const subSlug = String(row.category_slug ?? '').trim();

    if (categoryId && !map.has(categoryId)) {
      map.set(categoryId, image);
    }
    if (subSlug && !map.has(subSlug)) {
      map.set(subSlug, image);
    }
  }

  return map;
}

/**
 * Persist category image from a product when category has no real image yet.
 * Called after admin saves a product (first product in watches, etc.).
 */
export async function syncCategoryImageFromProduct(
  categoryId: string | null | undefined,
  productImage: string | null | undefined
): Promise<void> {
  const cat = String(categoryId ?? '').trim();
  const img = productImage?.trim();
  if (!cat || !img) return;

  const { data: category, error: readErr } = await supabase
    .from('categories')
    .select('id, image_url, parent_id')
    .eq('id', cat)
    .maybeSingle();

  if (readErr || !category) return;

  const targetId = category.parent_id ? String(category.parent_id) : cat;

  const { data: rootCat } = await supabase
    .from('categories')
    .select('image_url')
    .eq('id', targetId)
    .maybeSingle();

  if (!rootCat) return;

  const current = String(rootCat.image_url ?? '');
  if (!isPlaceholderCategoryImage(current)) return;

  const { error: updateErr } = await supabase
    .from('categories')
    .update({ image_url: img })
    .eq('id', targetId);

  if (updateErr) {
    console.warn('[categoryImages] Could not sync category image:', updateErr.message);
  }
}
