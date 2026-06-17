import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import type { Product, ProductVariant } from '../types';

function parseVariants(raw: unknown): ProductVariant[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (v): v is ProductVariant =>
      typeof v === 'object' &&
      v !== null &&
      typeof (v as ProductVariant).id === 'string' &&
      Array.isArray((v as ProductVariant).options)
  );
}

export function mapProductRow(row: Record<string, unknown>): Product {
  const images = Array.isArray(row.images) ? (row.images as string[]) : [];
  return {
    id: row.id as string,
    name: (row.name as string) || '',
    nameAr: (row.name_ar as string) || '',
    description: (row.description as string) || '',
    descriptionAr: (row.description_ar as string) || '',
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    image: images[0] || '',
    images,
    category: (row.category as string) || '',
    subcategory: (row.category_slug as string) || '',
    brand: (row.brand as string) || undefined,
    inStock: Boolean(row.in_stock),
    isFeatured: Boolean(row.is_featured),
    isNew: Boolean(row.is_new),
    isOnSale: Boolean(row.is_on_sale),
    variants: parseVariants(row.variants),
  };
}

interface UseProductsOptions {
  category?: string;
  subcategory?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
  inStock?: boolean;
  searchQuery?: string;
  limit?: number;
  skip?: boolean;
}

export function useProducts(opts: UseProductsOptions = {}) {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (opts.skip) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase.from('products').select('*');

      if (opts.category) query = query.eq('category', opts.category);
      if (opts.subcategory) query = query.eq('category_slug', opts.subcategory);
      if (opts.isFeatured !== undefined) query = query.eq('is_featured', opts.isFeatured);
      if (opts.isNew !== undefined) query = query.eq('is_new', opts.isNew);
      if (opts.isOnSale !== undefined) query = query.eq('is_on_sale', opts.isOnSale);
      if (opts.inStock !== undefined) query = query.eq('in_stock', opts.inStock);
      if (opts.searchQuery) {
        query = query.or(
          `name_ar.ilike.%${opts.searchQuery}%,name.ilike.%${opts.searchQuery}%,description_ar.ilike.%${opts.searchQuery}%`
        );
      }
      if (opts.limit) query = query.limit(opts.limit);

      query = query.order('created_at', { ascending: false });

      const { data: rows, error: err } = await query;
      if (err) throw err;

      setData((rows ?? []).map((row) => mapProductRow(row as Record<string, unknown>)));
    } catch (e) {
      setData([]);
      setError(e instanceof Error ? e.message : 'فشل تحميل المنتجات');
      console.error('Supabase products error:', e);
    } finally {
      setLoading(false);
    }
  }, [
    opts.category,
    opts.subcategory,
    opts.isFeatured,
    opts.isNew,
    opts.isOnSale,
    opts.inStock,
    opts.searchQuery,
    opts.limit,
    opts.skip,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}

export function useProduct(id: string) {
  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data: row, error: err } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (cancelled) return;
        if (err) throw err;
        setData(mapProductRow(row as Record<string, unknown>));
      } catch (e) {
        if (!cancelled) {
          setData(null);
          setError(e instanceof Error ? e.message : 'المنتج غير موجود');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data, loading, error };
}

export function useAdminProducts() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: rows, error: err } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
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
