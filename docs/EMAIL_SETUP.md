# Vita Shop — Resend Admin Email Notifications

Production-ready admin email alerts when a new order is placed.

**Stack:** React + Supabase Edge Functions + Resend  
**Function name:** `send-order-email`  
**Subject:** `New Order - Vita Shop`

---

## Architecture

```
Checkout (React)
    ↓
Save order → Supabase `orders` + `order_items`
    ↓
Invoke Edge Function `send-order-email` (fire-and-forget)
    ↓
Resend API → ADMIN_EMAIL
```

- `RESEND_API_KEY` never touches the browser
- Order save always succeeds even if email fails
- Failures logged to `email_logs`

### Auth note (important)

This store uses **guest checkout** with Supabase **publishable keys** (`sb_publishable_...`).
These are not user JWTs. The Edge Function must use:

```toml
[functions.send-order-email]
verify_jwt = false
```

Without this, the gateway returns **401 Invalid JWT** before your function runs.
Security is handled by requiring `apikey`/`authorization` headers and verifying the order exists in the database.

---

## 1. Database setup

Run in **Supabase → SQL Editor**:

```
supabase_edits/supabase_migration_emails.sql
```

Or use the full schema:

```
supabase_edits/supabase_schema.sql
```

Required tables: `orders`, `order_items`, `email_logs`

---

## 2. Resend account

1. Create account: [https://resend.com](https://resend.com)
2. **API Keys** → Create key → copy `re_...`
3. **Domains** → Verify your domain (production)
4. For testing without a domain:
   - Use `onboarding@resend.dev` as sender
   - Emails can only go to your verified Resend account email

---

## 3. Supabase secrets

**Dashboard → Project Settings → Edge Functions → Secrets**

| Secret | Required | Example |
|--------|----------|---------|
| `RESEND_API_KEY` | Yes | `re_xxxxxxxx` |
| `ADMIN_EMAIL` | Yes | `owner@yourstore.com` |
| `FROM_EMAIL` | Recommended | `orders@yourdomain.com` |
| `FROM_NAME` | Optional | `Vita Shop` |

CLI alternative:

```bash
supabase secrets set RESEND_API_KEY=re_xxxx
supabase secrets set ADMIN_EMAIL=owner@yourstore.com
supabase secrets set FROM_EMAIL=orders@yourdomain.com
supabase secrets set FROM_NAME="Vita Shop"
```

---

## 4. Deploy Edge Function

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy send-order-email --no-verify-jwt
```

Or ensure `supabase/config.toml` has `verify_jwt = false`.

**Dashboard:** Edge Functions → `send-order-email` → disable "Enforce JWT Verification" if 401 persists.

---

## 5. Frontend environment

`.env` (already in your project):

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

No Resend key in frontend.

---

## 6. Order flow (implemented)

`src/app/lib/orders.ts`:

1. Inserts order into `orders`
2. Inserts line items into `order_items`
3. Calls `send-order-email` with full payload (non-blocking)
4. Returns success to checkout

`src/app/pages/Checkout.tsx`:

- Shows toast: **تم استلام طلبك بنجاح**
- Redirects to order success page

---

## 7. Edge Function payload

`POST /functions/v1/send-order-email`

```json
{
  "orderId": "uuid",
  "customerName": "Sara Ahmad",
  "phone": "0599123456",
  "address": "Ramallah, Main St 12",
  "region": "west-bank",
  "regionLabel": "الضفة الغربية",
  "notes": "Call before delivery",
  "items": [
    {
      "name": "كريم مرطب",
      "quantity": 2,
      "unitPrice": 45,
      "totalPrice": 90
    }
  ],
  "subtotal": 90,
  "shippingCost": 20,
  "total": 110
}
```

Validation rejects invalid/missing fields with `400`.

---

## 8. Testing

### A. Place a real order

1. Deploy function + set secrets
2. Run SQL migration
3. Add products to cart → `/checkout`
4. Complete form and submit
5. Check admin inbox + `email_logs` table

### B. Test function directly

```bash
curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/send-order-email" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "customerName": "Test Customer",
    "phone": "0599000000",
    "address": "Test Address",
    "region": "west-bank",
    "regionLabel": "West Bank",
    "notes": null,
    "items": [{"name": "Test Product", "quantity": 1, "unitPrice": 50, "totalPrice": 50}],
    "subtotal": 50,
    "shippingCost": 20,
    "total": 70
  }'
```

Expected: `{"ok":true,"orderId":"...","messageId":"..."}`

### C. Verify logs

```sql
SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 10;
```

---

## 9. Troubleshooting

| Issue | Solution |
|-------|----------|
| Order saves but no email | Check `email_logs.error_message` |
| `RESEND_API_KEY is not configured` | Add secret in Supabase |
| Resend 403 on recipient | Verify domain or use verified test email |
| `Invalid order payload` | Ensure all required fields are sent |
| Function 401 | Anon key must be sent via `supabase.functions.invoke` |

---

## 10. Project files

```
supabase/functions/send-order-email/
  index.ts          # Edge Function entry
  validate.ts       # Payload validation
  template.ts       # HTML email template
  resend.ts         # Resend API client
  types.ts

supabase/functions/_shared/
  cors.ts
  email-logs.ts

src/app/lib/orders.ts       # Order save + email trigger
src/app/pages/Checkout.tsx  # Checkout UI

supabase_edits/
  supabase_schema.sql
  supabase_migration_emails.sql
```

---

## Production checklist

- [ ] Verify domain in Resend
- [ ] Set `FROM_EMAIL` to your domain address
- [ ] Set `ADMIN_EMAIL` to store owner inbox
- [ ] Deploy `send-order-email`
- [ ] Run email migration SQL
- [ ] Place test order and confirm delivery
- [ ] Monitor `email_logs` weekly
