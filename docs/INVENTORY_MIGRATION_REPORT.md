# Inventory Migration Report

This document describes the SQL migration for existing production products and how to verify it after running.

---

## Files

| File | Purpose |
|------|---------|
| `supabase_edits/inventory_migration.sql` | Forward migration (run this) |
| `supabase_edits/inventory_rollback.sql` | Partial rollback |

---

## Tables modified

| Table | Change |
|-------|--------|
| `products` | Added `stock_quantity` (INTEGER, default 5) |
| `products` | Added `is_active` (BOOLEAN, default TRUE) |
| `products` | Updated `variants` JSONB — each option gets `stockQuantity` if missing |
| `products` | Synced `in_stock` from inventory totals |
| `order_items` | New trigger `order_items_decrement_stock` (AFTER INSERT) |

No products are deleted. No existing product fields are overwritten except inventory-related columns and variant option stock metadata.

---

## SQL executed (summary)

1. `ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity ...`
2. `ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active ...`
3. `CREATE OR REPLACE FUNCTION migrate_product_variants_stock(...)`
4. `UPDATE products` — backfill `stock_quantity` / `is_active` defaults
5. `UPDATE products` — migrate `variants` JSONB with `stockQuantity: 5` per option
6. `UPDATE products` — set `stock_quantity = 5` for simple products at 0
7. `UPDATE products` — sync `in_stock` from stock totals
8. `CREATE OR REPLACE FUNCTION decrement_variant_option_stock(...)`
9. `CREATE OR REPLACE FUNCTION sync_product_inventory_flags(...)`
10. `CREATE OR REPLACE FUNCTION trg_decrement_stock_on_order_item()`
11. `CREATE TRIGGER order_items_decrement_stock ON order_items`

---

## Default values for existing products

| Scenario | Result |
|----------|--------|
| Product with no variants | `stock_quantity = 5` (if was 0 or null) |
| Product with variants | Each option gets `stockQuantity: 5` unless already set or `inStock: false` (then 0) |
| All products | `is_active = TRUE` unless already set |
| `in_stock` | Recalculated from actual stock |

---

## How to run manually (Supabase SQL Editor)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. Go to **SQL Editor** → **New query**
3. Paste the full contents of `supabase_edits/inventory_migration.sql`
4. Click **Run**
5. Run the verification queries below

---

## Verification queries (run after migration)

```sql
-- Total products in database
SELECT COUNT(*) AS total_products FROM products;

-- Products that received default stock of 5 (simple products)
SELECT COUNT(*) AS simple_products_with_stock_5
FROM products
WHERE (variants IS NULL OR variants = '[]'::JSONB)
  AND stock_quantity = 5;

-- Active vs inactive
SELECT
  COUNT(*) FILTER (WHERE is_active = TRUE) AS active_products,
  COUNT(*) FILTER (WHERE is_active = FALSE) AS inactive_products
FROM products;

-- Products currently in stock vs out of stock
SELECT
  COUNT(*) FILTER (WHERE in_stock = TRUE) AS in_stock_count,
  COUNT(*) FILTER (WHERE in_stock = FALSE) AS out_of_stock_count
FROM products;

-- Sample: inspect variant stock backfill
SELECT id, name_ar, stock_quantity, variants
FROM products
WHERE variants IS NOT NULL AND variants <> '[]'::JSONB
LIMIT 5;
```

### Expected results (typical)

- **`total_products`** = your current product count (unchanged)
- **`active_products`** = same as total (all default to active)
- **`simple_products_with_stock_5`** = count of non-variant products
- Variant products: each option in `variants` JSON should include `"stockQuantity": 5` (or 0 if was explicitly out of stock)

> **Note:** Exact counts depend on your production data. Re-run verification queries after migration to get your numbers.

---

## Rollback

Run `supabase_edits/inventory_rollback.sql` in SQL Editor.

**Limitations:**

- Does **not** restore previous `variants` JSON before migration
- Removes `stock_quantity`, `is_active`, and stock decrement trigger
- `in_stock` values set by migration are **not** reverted automatically

---

## Idempotency

Safe to re-run `inventory_migration.sql`:

- Columns use `IF NOT EXISTS`
- Trigger is dropped and recreated
- Variant migration re-applies `stockQuantity` only where logic applies; existing numeric values are preserved
