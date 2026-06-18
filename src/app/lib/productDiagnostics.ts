/**
 * Product load diagnostics — logs why products are included or excluded.
 * Enable in production via: VITE_DEBUG_PRODUCTS=true
 */

const DEBUG = import.meta.env.VITE_DEBUG_PRODUCTS === 'true' || import.meta.env.DEV;

export interface ProductFilterReason {
  productId: string;
  nameAr: string;
  included: boolean;
  reasons: string[];
}

export interface ProductLoadDiagnostics {
  context: string;
  totalFromDb: number;
  totalAfterFilter: number;
  queryError?: string;
  excluded: ProductFilterReason[];
  included: ProductFilterReason[];
}

function logDiagnostics(diag: ProductLoadDiagnostics) {
  if (!DEBUG) return;

  console.group(`[Vita Shop Products] ${diag.context}`);
  console.log('Rows from DB:', diag.totalFromDb);
  console.log('After storefront filter:', diag.totalAfterFilter);
  if (diag.queryError) console.error('Query error:', diag.queryError);
  if (diag.excluded.length > 0) {
    console.table(
      diag.excluded.map((e) => ({
        id: e.productId,
        name: e.nameAr,
        reasons: e.reasons.join('; '),
      }))
    );
  }
  if (diag.included.length > 0 && diag.included.length <= 20) {
    console.log('Included products:', diag.included.map((i) => i.productId));
  }
  console.groupEnd();
}

export function diagnoseStorefrontProduct(
  row: Record<string, unknown>,
  opts: { includeInactive?: boolean }
): ProductFilterReason {
  const id = String(row.id ?? '');
  const nameAr = String(row.name_ar ?? '');
  const reasons: string[] = [];

  const isActive = row.is_active == null ? true : Boolean(row.is_active);
  if (!opts.includeInactive && !isActive) {
    reasons.push('is_active=false (hidden from storefront)');
  }

  const inStockFlag = row.in_stock == null ? true : Boolean(row.in_stock);
  if (!inStockFlag) {
    reasons.push('in_stock=false (marked out of stock)');
  }

  return {
    productId: id,
    nameAr,
    included: reasons.length === 0,
    reasons,
  };
}

export function reportProductLoad(
  context: string,
  rows: Record<string, unknown>[],
  filtered: Record<string, unknown>[],
  opts: { includeInactive?: boolean },
  queryError?: string
) {
  const excluded: ProductFilterReason[] = [];
  const included: ProductFilterReason[] = [];

  for (const row of rows) {
    const diag = diagnoseStorefrontProduct(row, opts);
    if (diag.included) included.push(diag);
    else excluded.push(diag);
  }

  logDiagnostics({
    context,
    totalFromDb: rows.length,
    totalAfterFilter: filtered.length,
    queryError,
    excluded,
    included,
  });
}

export function logProductQueryError(context: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[Vita Shop Products] ${context} FAILED:`, message);

  if (message.includes('is_active') || message.includes('stock_quantity')) {
    console.error(
      '[Vita Shop Products] Likely cause: inventory migration not applied. ' +
        'Run supabase_edits/inventory_migration.sql in Supabase SQL Editor.'
    );
  }
}
