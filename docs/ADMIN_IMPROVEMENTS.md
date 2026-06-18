# Admin & Inventory Improvements — Vita Shop

Summary of inventory management, product visibility, mobile admin UX, and related documentation.

---

## Features added

### 1. Inventory / stock management

- **`stock_quantity`** on `products` — base/total stock for simple products; sum of variant stocks for variant products
- **`stockQuantity`** per variant option in `products.variants` JSONB (color, size, shade, etc.)
- Stock status labels: **متوفر** / **مخزون منخفض** (≤3) / **نفد المخزون**
- Cart and checkout block quantities above available stock
- Stock decrements automatically via DB trigger on `order_items` INSERT
- Products are **never deleted** when stock hits zero

### 2. Product visibility (`is_active`)

- **`is_active`** boolean on `products` (default `true`)
- Storefront queries filter `is_active = true`
- Admin shows all products; toggle visibility with eye icon (no delete required)

### 3. Mobile admin

- Product and category lists: **stacked cards** on small screens, tables on `md+`
- Edit, Delete, Stock, and visibility buttons always visible (no hover-only)
- Touch targets ≥ **44×44px** (`min-w-11 min-h-11`)
- Product form uses stable `FormInput` / `FormToggle` (no scroll jump on mobile)

### 4. Category images

- **Not modified.** See [`CATEGORY_IMAGES_GUIDE.md`](./CATEGORY_IMAGES_GUIDE.md).

---

## Files changed

### New files

| File | Purpose |
|------|---------|
| `src/app/lib/inventory.ts` | Stock helpers, thresholds, `syncInventoryOnSave` |
| `supabase_edits/inventory_migration.sql` | DB migration + stock decrement trigger |
| `supabase_edits/inventory_rollback.sql` | Partial rollback (drops columns/triggers) |
| `docs/CATEGORY_IMAGES_GUIDE.md` | Where to edit category images |
| `docs/ADMIN_IMPROVEMENTS.md` | This document |

### Modified files

| File | Changes |
|------|---------|
| `src/app/types/index.ts` | `stockQuantity`, `isActive` on Product; `stockQuantity` on options |
| `src/app/lib/useProducts.ts` | Maps new columns; storefront filters `is_active` |
| `src/app/lib/productUtils.ts` | Re-exports inventory helpers |
| `src/app/lib/orders.ts` | Stock + `is_active` validation at checkout |
| `src/app/context/CartContext.tsx` | Stock limits on add/update quantity |
| `src/app/pages/admin/AdminProductForm.tsx` | Stock fields, variant stock, `is_active` toggle |
| `src/app/pages/admin/AdminProducts.tsx` | Stock badges, mobile cards, visible actions |
| `src/app/pages/admin/AdminCategories.tsx` | Mobile cards, visible edit/delete |
| `src/app/pages/ProductDetails.tsx` | Stock-aware variants, quantity cap, status badges |
| `src/app/components/ProductCard.tsx` | Stock status, variant-aware quick add |
| `supabase_edits/supabase_schema.sql` | `stock_quantity`, `is_active` in base schema |

---

## Database changes

### New columns on `products`

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `stock_quantity` | INTEGER | 5 | CHECK `>= 0` |
| `is_active` | BOOLEAN | TRUE | Hidden from storefront when false |

### Variant JSONB shape (per option)

```json
{
  "id": "opt-123",
  "labelAr": "أسود",
  "stockQuantity": 10,
  "inStock": true,
  "colorHex": "#000000"
}
```

### New functions & trigger

- `migrate_product_variants_stock(JSONB)` — backfill option stock
- `decrement_variant_option_stock(...)` — decrement one option
- `sync_product_inventory_flags(product_id)` — sync `in_stock` + total
- `trg_decrement_stock_on_order_item` — AFTER INSERT on `order_items`

---

## Migration instructions

### Run in Supabase SQL Editor (in order)

1. Prior migrations if not yet applied (`supabase_migration_emails.sql`, `supabase_migration_order_items_fk.sql`)
2. **`supabase_edits/inventory_migration.sql`**

### What the migration does

1. Adds `stock_quantity` and `is_active` if missing
2. Sets default stock **5** for existing products without variant stock
3. Adds `stockQuantity: 5` to each variant option missing it
4. Syncs `in_stock` from inventory totals
5. Creates stock decrement trigger on new orders

### Idempotency

- `ADD COLUMN IF NOT EXISTS`
- `DROP TRIGGER IF EXISTS` before recreate
- Safe to re-run; variant backfill only adds missing `stockQuantity`

### Rollback

Run `supabase_edits/inventory_rollback.sql` — **warning:** does not restore previous variant JSON values.

### Post-migration report queries

```sql
SELECT COUNT(*) AS total_products FROM products;
SELECT COUNT(*) AS products_with_default_stock FROM products WHERE stock_quantity = 5;
SELECT COUNT(*) AS active_products FROM products WHERE is_active = TRUE;
SELECT COUNT(*) AS inactive_products FROM products WHERE is_active = FALSE;
```

---

## How stock management works

### Simple product (no variants)

- Admin sets **كمية المخزون** in product form
- Storefront uses `stock_quantity`
- On order: trigger subtracts `order_items.quantity` from `stock_quantity`

### Variant product (color / size / etc.)

- Admin sets **كمية المخزون** per option in variant section
- `stock_quantity` = sum of all option stocks (auto on save)
- Customer must select all variants; available = min stock of selected options
- On order: trigger decrements matching `variant_selection` options

### Low stock threshold

- `LOW_STOCK_THRESHOLD = 3` in `src/app/lib/inventory.ts`
- ≤3 shows "مخزون منخفض"; 0 shows "نفد المخزون"

### Restocking

- Admin edits product → increase `stock_quantity` or option `stockQuantity` → save
- Toggle **ظاهر في المتجر** (`is_active`) to bring hidden products back

---

## Category images

See **[`CATEGORY_IMAGES_GUIDE.md`](./CATEGORY_IMAGES_GUIDE.md)** for:

- Database: `categories.image_url`
- Seed: `supabase_edits/supabase_seed_all_categories.sql`
- Admin: `/admin/categories` → رابط الصورة
- Component: `src/app/components/CategoryCard.tsx`

---

## Verification checklist

- [ ] Run `inventory_migration.sql` in Supabase
- [ ] `npm run build` passes
- [ ] Storefront hides `is_active = false` products
- [ ] Admin shows all products with stock badges
- [ ] Checkout rejects over-stock quantities
- [ ] After order, `stock_quantity` / variant stock decreases
- [ ] Mobile admin: buttons visible without hover
