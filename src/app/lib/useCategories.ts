import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import {
  fetchCategoryProductImageMap,
  resolveCategoryImage,
} from './categoryImages';
import type { Category } from '../types';

function mapCategoryRows(
  rows: Record<string, unknown>[],
  productImages: Map<string, string>
): Category[] {
  const rootRows = rows.filter((r) => !r.parent_id);
  return rootRows.map((root) => {
    const rootId = root.id as string;
    const subs = rows
      .filter((r) => r.parent_id === rootId)
      .map((r) => ({
        id: r.id as string,
        name: (r.name as string) || '',
        nameAr: (r.name_ar as string) || '',
        slug: (r.slug as string) || '',
      }));

    let image = resolveCategoryImage(
      rootId,
      root.image_url as string | undefined,
      productImages
    );

    if (!image && subs.length > 0) {
      for (const sub of subs) {
        const subImage = productImages.get(sub.id) ?? productImages.get(sub.slug);
        if (subImage) {
          image = subImage;
          break;
        }
      }
    }

    return {
      id: rootId,
      name: (root.name as string) || '',
      nameAr: (root.name_ar as string) || '',
      slug: (root.slug as string) || '',
      image,
      subcategories: subs,
    };
  });
}

export function useCategories() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [categoriesRes, productImages] = await Promise.all([
          supabase.from('categories').select('*').order('name'),
          fetchCategoryProductImageMap(),
        ]);

        if (cancelled) return;
        if (categoriesRes.error) throw categoriesRes.error;

        setData(
          mapCategoryRows(
            (categoriesRes.data ?? []) as Record<string, unknown>[],
            productImages
          )
        );
      } catch (e) {
        if (!cancelled) {
          setData([]);
          setError(e instanceof Error ? e.message : 'فشل تحميل الأقسام');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}

export function useCategory(slug: string) {
  const [data, setData] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [rowRes, productImages] = await Promise.all([
          supabase.from('categories').select('*').eq('slug', slug).single(),
          fetchCategoryProductImageMap(),
        ]);

        if (cancelled) return;
        if (rowRes.error) throw rowRes.error;
        const row = rowRes.data;

        const { data: children } = await supabase
          .from('categories')
          .select('*')
          .eq('parent_id', row.id);

        if (cancelled) return;

        const rootId = row.parent_id ? String(row.parent_id) : String(row.id);
        const image = resolveCategoryImage(
          rootId,
          row.image_url as string | undefined,
          productImages
        );

        setData({
          id: row.id as string,
          name: (row.name as string) || '',
          nameAr: (row.name_ar as string) || '',
          slug: (row.slug as string) || '',
          image,
          subcategories: (children ?? []).map((r) => ({
            id: r.id as string,
            name: (r.name as string) || '',
            nameAr: (r.name_ar as string) || '',
            slug: (r.slug as string) || '',
          })),
        });
      } catch (e) {
        if (!cancelled) {
          setData(null);
          setError(e instanceof Error ? e.message : 'القسم غير موجود');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { data, loading, error };
}

export function useAdminCategories() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: rows, error: err } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setData(rows ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
