# Production Fix Report — Products Missing from Storefront

**Date:** 2026-06-18  
**Issue:** Products visible in Admin but not on public website; Admin shows fake stock (5 / In Stock) without DB columns.

---

## Root cause

### Primary: Storefront queried a non-existent column

The storefront filtered products in Supabase with:

```typescript
query = query.eq('is_active', true);  // useProducts.ts (before fix)
```

**Production database did not have `is_active` or `stock_quantity` columns** (inventory migration never run).

PostgREST returns an error like `column products.is_active does not exist`. The hook caught the error and set `products = []`, so the storefront showed **zero products**.

### Secondary: Admin showed misleading data (fake fallbacks)

| Location | Fake behavior |
|----------|----------------|
| `useProducts.ts` `mapProductRow` | `stock_quantity ?? 5` |
| `inventory.ts` `getOptionStock` | Returned `5` when `stockQuantity` missing |
| `AdminProducts.tsx` | `is_active !== false` when column missing → always "visible" |
| `AdminProductForm.tsx` | Default `stock_quantity: '5'` in form |

Admin loaded products **without** the `is_active` filter (raw `select('*')`), so all DB rows appeared. UI fallbacks made everything look in-stock with quantity 5.

### Not the cause

- **RLS:** `Public read products USING (TRUE)` — allows read; not blocking
- **Stock = 0 filter on storefront:** Main listing does not filter by stock at DB level
- **Category filter:** Minor issue fixed (slug vs id mismatch on some URLs)

---

## Files modified (fix)

| File | Change |
|------|--------|
| `src/app/lib/useProducts.ts` | Removed DB filter on `is_active`; client-side visibility filter; diagnostic logging |
| `src/app/lib/inventory.ts` | Removed fake `5` fallback; legacy `in_stock` support |
| `src/app/lib/productInventory.ts` | **New** — detects real vs legacy inventory |
| `src/app/lib/productDiagnostics.ts` | **New** — debug logging (`VITE_DEBUG_PRODUCTS=true`) |
| `src/app/types/index.ts` | Added `hasExplicitInventory` |
| `src/app/pages/admin/AdminProducts.tsx` | Uses `mapProductRow`; shows "مخزون قديم" when not migrated |
| `src/app/context/CartContext.tsx` | Stock limits only when migration applied |
| `src/app/lib/orders.ts` | Stock quantity check only when migration applied |
| `src/app/pages/ProductDetails.tsx` | Removed fake option stock `5` |
| `src/app/pages/ProductListing.tsx` | Improved category URL matching |
| `src/app/pages/admin/AdminProductForm.tsx` | Legacy save fallback + migration hint |
| `supabase_edits/inventory_migration.sql` | Added indexes |
| `supabase_edits/supabase_migration_admin_policies.sql` | **New** — admin write RLS |

---

## SQL migrations to run (in order)

1. **`supabase_edits/inventory_migration.sql`** — REQUIRED  
   - Adds `stock_quantity`, `is_active`  
   - Backfills stock = 5 for existing products  
   - Adds variant `stockQuantity` in JSONB  
   - Stock decrement trigger on orders  

2. **`supabase_edits/supabase_migration_admin_policies.sql`** — if admin save/update fails  
   - INSERT/UPDATE/DELETE policies for products & categories  

---

## How inventory works now

### Before migration (legacy mode)

- Storefront shows products where `in_stock` is not false
- No quantity enforcement in cart/checkout
- Admin shows badge **"مخزون قديم"**

### After migration

| Type | Storage |
|------|---------|
| Simple product | `products.stock_quantity` |
| Variants (color/size) | `products.variants[].options[].stockQuantity` |
| Visibility | `products.is_active` |
| Status flag | `products.in_stock` (auto-synced) |

- Stock **0** → "نفد المخزون" / Out of Stock  
- Stock **1–3** → "مخزون منخفض"  
- Stock **> 3** → "متوفر"  
- Order placed → trigger decrements stock  

### Variant example (after migration)

```json
{
  "id": "variant-color",
  "nameAr": "اللون",
  "type": "color",
  "options": [
    { "id": "black", "labelAr": "أسود", "stockQuantity": 5 },
    { "id": "pink", "labelAr": "وردي", "stockQuantity": 2 },
    { "id": "white", "labelAr": "أبيض", "stockQuantity": 0 }
  ]
}
```

---

## Debugging

Set in `.env`:

```
VITE_DEBUG_PRODUCTS=true
```

Open browser console → see which products are excluded and why.

---

## Remaining risks

1. **Admin security:** Write policies use anon key; protect `/admin` password strongly.
2. **Until migration runs:** Stock quantities in admin are estimates; visibility toggle may fail.
3. **Concurrent orders:** No row-level stock lock beyond `FOR UPDATE` in trigger; high traffic may need extra checks.

---

## Immediate action

1. Deploy this frontend fix (storefront works again without migration).
2. Run `inventory_migration.sql` in Supabase SQL Editor.
3. Run `inventory_stock_decrement.sql` — **enables automatic stock reduction on every purchase**.
4. Verify with:

```sql
SELECT id, name_ar, stock_quantity, is_active, in_stock FROM products LIMIT 10;

-- Confirm triggers exist:
SELECT tgname FROM pg_trigger
WHERE tgname IN ('order_items_decrement_stock', 'order_items_validate_stock');
```

5. Place a test order, then check:

```sql
SELECT * FROM stock_movements ORDER BY created_at DESC LIMIT 5;
```

6. Refresh storefront — products should appear with real stock values.

---

## Automatic stock reduction on purchase

| Step | What happens |
|------|----------------|
| Checkout | `order_items` rows inserted with `product_id`, `quantity`, `variant_selection` |
| DB trigger (BEFORE) | Rejects order if quantity > available stock |
| DB trigger (AFTER) | Reduces `stock_quantity` or variant `stockQuantity` in `products` |
| Audit | Row added to `stock_movements` table |

No frontend code needed beyond checkout — triggers run inside the same database transaction.
