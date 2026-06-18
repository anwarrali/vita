# Category Images Guide — Vita Shop

This guide explains **where category images are defined** and how to change them manually. **No category images were modified** during the inventory/admin improvements.

---

## Primary data source (production)

Category images are stored in **Supabase**, in the `categories` table:

| Column | Purpose |
|--------|---------|
| `image_url` | Public URL of the category image (root categories only; subcategories usually use `NULL`) |

### Database table

- **Table:** `public.categories`
- **Column:** `image_url` (TEXT, nullable)

### Seed file (initial URLs)

Root category images are seeded in:

```
supabase_edits/supabase_seed_all_categories.sql
```

Example (lines 9–16):

```sql
INSERT INTO categories (id, name, name_ar, slug, image_url, parent_id)
VALUES 
  ('bags', 'Bags', 'الحقائب', 'bags', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80', NULL),
  ...
```

To change a category image **permanently in the database**, either:

1. **Supabase Dashboard → Table Editor → `categories`** — edit `image_url` for the row, or  
2. **Supabase SQL Editor** — run:

```sql
UPDATE categories
SET image_url = 'https://your-new-image-url.jpg'
WHERE id = 'bags';
```

---

## How images reach the storefront

### 1. Data hook

**File:** `src/app/lib/useCategories.ts`

- Reads `image_url` from Supabase
- Maps it to the frontend `Category.image` field

```typescript
image: (root.image_url as string) || '',
```

### 2. Display components

| Component | Path | Usage |
|-----------|------|--------|
| `CategoryCard` | `src/app/components/CategoryCard.tsx` | Home, Categories page — renders `<img src={category.image} />` |
| `CategoryCard` (alternate) | `src/app/components/category/CategoryCard.tsx` | Legacy/alternate layout pages |

**Pages that show category cards:**

- `src/app/pages/Home.tsx`
- `src/app/pages/Categories.tsx`
- `src/app/pages/HomePage.tsx`
- `src/app/pages/CategoriesPage.tsx`

---

## Admin panel (edit without SQL)

**File:** `src/app/pages/admin/AdminCategories.tsx`

- Form field: **"رابط الصورة (اختياري)"** → saves to `image_url`
- Route: `/admin/categories`
- List preview uses `cat.image_url` directly

This is the easiest way to update images after launch.

---

## Legacy static file (NOT used by live app)

**File:** `src/app/data/categories.ts`

Contains hardcoded Unsplash URLs for development/reference. The live storefront loads categories from **Supabase** via `useCategories()`, not from this file.

If you edit `categories.ts`, it will **not** change production unless the app is rewired to use it.

---

## Image requirements

- Use **HTTPS** URLs (Supabase Storage, CDN, or external host)
- Recommended aspect ratio: **4:3** (matches `CategoryCard` layout)
- Root categories should have `image_url`; subcategories typically leave it empty

---

## Quick reference

| What you want to do | Where to go |
|---------------------|-------------|
| Change image in production DB | Supabase → `categories.image_url` or Admin → الأقسام |
| See default seed URLs | `supabase_edits/supabase_seed_all_categories.sql` |
| Change how images render | `src/app/components/CategoryCard.tsx` |
| Change data mapping | `src/app/lib/useCategories.ts` |
