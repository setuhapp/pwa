# SETUH — Tech Stack Decisions

---

## Stack Summary

| Layer | Choice | Why |
|---|---|---|
| **Frontend** | Next.js (React) | SSR for SEO + PWA support + routing |
| **Backend / DB** | Supabase | Phone OTP auth + PostgreSQL + file storage — one tool |
| **Hosting** | Vercel (frontend) + Supabase cloud (backend) | Both free tier, zero DevOps |
| **Payments** | Razorpay | UPI + subscriptions + India-first |
| **WhatsApp** | WATI | No-code WhatsApp automation, cheapest for MVP |
| **SMS fallback** | MSG91 | OTP + notifications |
| **Aadhaar eKYC** | IDfy or OnGrid | API-based, per-check pricing |
| **i18n** | next-i18next | EN → Tamil toggle, same codebase |
| **PWA** | next-pwa | Service worker, offline, add-to-homescreen |
| **QR codes** | qrcode.react | Auto-generate per caregiver profile |

---

## Key Decisions Explained

### Next.js over plain React
SEO is critical — "dementia care attender Chennai verified" must rank on Google.
Plain React (CSR) is invisible to search engines. Next.js SSR/SSG renders
skill+city pages server-side, making them indexable from day one.

### Supabase over Firebase
- **Phone OTP auth built-in** — caregivers and members log in with phone number,
  no passwords. Critical for low-literacy users.
- **PostgreSQL** — relational data (engagements → reviews → verifications) needs
  proper joins, not a document store.
- **Row-level security** — unsigned users can only read Q,E,V,F,R fields;
  D fields locked behind member auth. Enforced at DB level, not just UI.
- **Storage** — caregiver photo uploads handled natively.
- Free tier handles ~50,000 monthly active users comfortably.

### WATI over Twilio for WhatsApp
Twilio WhatsApp API requires Business Account approval (slow).
WATI gives a pre-approved WhatsApp number, a no-code automation builder,
and costs ₹2,500/month. Use it to send:
- Engagement confirmation requests to caregivers
- Verification expiry reminders
- Review unlock notifications ("Your 30 days are up — leave a review")

### Razorpay
- Supports UPI, cards, net banking
- Has a Subscription API — handles ₹499/month recurring billing natively
- Webhook to Supabase: payment confirmed → member tier upgraded automatically

---

## Data Model (core tables)

```
caregivers          members
───────────         ───────────
id                  id
phone               phone
name (D)            name
photo_url (D)       subscription_status
address (D)         subscription_expiry
skills (Q)          care_need (JSON)
experience (E)      created_at
rate (R)
verification_status (V)
is_hidden
created_at

verifications       engagements
─────────────       ───────────
id                  id
caregiver_id        caregiver_id
type                member_id
(aadhaar/bg/ref)    start_date
status              status
checked_date        (pending/active/ended)
expiry_date         registered_at (system timestamp)
checked_by          confirmed_at

reviews             bookmarks
───────             ─────────
id                  id
engagement_id       member_id
reliability         caregiver_id
hygiene             created_at
gentleness          expires_at
communication
overall
created_at
```

---

## Browsing Access — enforced at DB level (Row Level Security)

```sql
-- Unsigned / unauthenticated: see only Q,E,V,F,R — no D fields
-- Capped at 5 rows per session (enforced in API route)

-- Members (paid): full DQEVFR, unlimited rows

-- Supabase RLS policy example:
CREATE POLICY "unsigned_no_details" ON caregivers
  FOR SELECT
  USING (
    auth.role() = 'anon'
    -- name, phone, aadhaar excluded via view, not base table
  );
```

Create a `caregivers_public` view that omits D fields — serve this to unsigned users. Members query the full table after subscription check.

---

## Development Sequence

```
Week 1–2   Supabase project setup, schema, RLS policies
           Next.js PWA scaffold, EN UI, mobile-first layout

Week 3–4   Caregiver onboarding flow (C-01 to C-05)
           Photo upload → Supabase Storage
           OTP login (Supabase Auth)

Week 5–6   Browse page — unsigned view (5 profiles, no D)
           Member signup + Razorpay subscription
           Member view — full DQEVFR unlock

Week 7–8   Engagement registration flow
           WATI WhatsApp confirmation to caregiver
           Review unlock at 30 days

Week 9–10  Admin panel — verification management
           IDfy Aadhaar eKYC integration
           QR code generation + PDF profile card

Week 11–12 PWA polish — add-to-homescreen, offline fallback
           SEO — skill+city static pages
           Beta with first 10 caregivers + 20 families
```

---

## Costs at MVP Scale (monthly)

| Service | Free tier | Paid from |
|---|---|---|
| Vercel | 100GB bandwidth free | ~$20/month at scale |
| Supabase | 50,000 MAU free | $25/month (Pro) |
| WATI | ₹2,500/month | — |
| MSG91 | Pay per SMS ~₹0.20 | — |
| Razorpay | 2% per transaction | — |
| IDfy / OnGrid | ~₹150–300 per check | Pay per verification |

**Total MVP burn: ~₹5,000–8,000/month** until you hit Supabase/Vercel free tier limits.
Revenue from 100 members at ₹499 = ₹49,900/month. Profitable from month 1 if you hit 100 members.

---

## What NOT to build yet
- ❌ Separate mobile app (PWA is the app)
- ❌ Custom auth (Supabase handles it)
- ❌ Tamil UI (add via i18next in Phase 2, same codebase)
- ❌ Automated background check pipeline (manual + API trigger)
- ❌ In-app chat (WhatsApp + phone)
