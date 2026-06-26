# SETUH — Product Backlog
**Platform:** PWA (Progressive Web App) · **Languages:** English (launch) → Tamil (Phase 2)  
**Design principle:** Ultra-simple. Less-educated but app-savvy users. Every screen must work with one thumb.

---

## Caregiver Profile Model — DQEVFR

| Code | Field | Notes |
|---|---|---|
| **D** | Details | Name, phone, Aadhaar, photo, address |
| **Q** | Qualification | Certifications, training, skills |
| **E** | Experience | Years, prior families, specialisations |
| **V** | Verification status | Aadhaar eKYC, background check, reference checks |
| **W** | Feedback | Family reviews (registered engagements only) |
| **R** | Rate | Self-set daily/monthly rate |

---

## Browsing Access Model

| Tier | Visible fields | Profile limit | Gate |
|---|---|---|---|
| **Unsigned (Free)** | Q (anonymised), E, V, F, R — **no D** | 5 profiles | None |
| **Member (Premium)** | Full DQEVFR | Unlimited | Signup + ₹499/month |

> Unsigned users see skills, experience, verification status, feedback scores, and rate — but no name, photo, phone, or address. Enough to prove supply quality, not enough to contact.

---

## Engagement & Review Flow

```
Family subscribes (Member)
  → browses & contacts attender directly
    → hires (off-platform conversation)
      → family registers engagement on SETUH (attender + start date)
        → attender confirms via WhatsApp / SMS
          → engagement marked Active (timestamped)
            → review form unlocks after 30 days
              → verified review posted to profile
```

**Rules:**
- Reviews only added for registered engagements — never for off-platform hires
- No backdating — registration timestamp is system-generated, not user-entered
- Engagement states: `Pending Confirmation` → `Active` → `Ended`
- Profiles are never deleted by caregivers — only hidden (`Active` / `Hidden` toggle)

---

## BACKLOG

### EPIC 1 — Platform Foundation

| ID | Story | Priority |
|---|---|---|
| F-01 | PWA setup — installable, offline-capable, add-to-homescreen prompt | P0 |
| F-02 | Mobile-first responsive design, single-thumb usability | P0 |
| F-03 | English UI at launch | P0 |
| F-04 | Tamil language toggle (UI strings, not content) | P1 |
| F-05 | WhatsApp-based notifications for caregivers (primary channel) | P0 |
| F-06 | SMS fallback for caregivers without WhatsApp | P1 |
| F-07 | Admin panel — manage verifications, engagements, flagged profiles | P0 |

---

### EPIC 2 — Caregiver Onboarding & Profile

**Principle:** Progressive intake. Don't ask everything upfront. Get them live fast, fill details over time.

| ID | Story | Priority |
|---|---|---|
| C-01 | Caregiver registers with phone number (OTP) | P0 |
| C-02 | Step 1 onboarding: photo upload + name + address (3 fields, go live) | P0 |
| C-03 | Step 2 (prompted later): add skills / qualifications | P0 |
| C-04 | Step 3 (prompted later): add experience, prior families | P0 |
| C-05 | Step 4 (prompted later): set daily/monthly rate | P0 |
| C-06 | Caregiver can update any field post-onboarding | P0 |
| C-07 | Caregiver can hide profile (removes from browse, preserves all data) | P0 |
| C-08 | Caregiver cannot delete own profile — admin-only hard delete | P0 |
| C-09 | Profile completeness indicator ("Your profile is 60% complete — add skills to get more views") | P1 |
| C-10 | QR code auto-generated for every live profile — links to public profile URL | P0 |
| C-11 | Downloadable QR profile card (PDF) — shareable, printable | P1 |

---

### EPIC 3 — Caregiver Verification (V in DQEVFR)

| ID | Story | Priority |
|---|---|---|
| V-01 | Aadhaar eKYC verification (API: IDfy / OnGrid) | P0 |
| V-02 | Verification badge shows exactly what was checked + date — no vague labels | P0 |
| V-03 | Background check (criminal / court record) — manual trigger, admin managed | P0 |
| V-04 | Reference check — admin calls, marks "Verified by SETUH" vs self-reported | P0 |
| V-05 | Verification expiry — checks lapse after 12 months, badge updates automatically | P1 |
| V-06 | Re-verification reminder sent to caregiver via WhatsApp 30 days before expiry | P1 |
| V-07 | Lapsed verification → profile demoted in browse ranking, bookmarks flagged | P1 |

---

### EPIC 4 — Member (Family) Onboarding

| ID | Story | Priority |
|---|---|---|
| M-01 | Member registers with phone + OTP | P0 |
| M-02 | Member submits care need: city, care type, live-in/part-time, specialisation required | P0 |
| M-03 | Care need used for matching — surfaces relevant caregiver profiles first | P1 |
| M-04 | Member subscribes — ₹499/month, unlocks full DQEVFR access | P0 |
| M-05 | Payment via Razorpay / UPI | P0 |
| M-06 | Subscription status visible on member dashboard | P0 |
| M-07 | Subscription lapse → access reverts to unsigned (5 profiles, no D) | P0 |

---

### EPIC 5 — Browsing & Discovery

| ID | Story | Priority |
|---|---|---|
| B-01 | Unsigned browse — shows up to 5 profiles, QEVFR only, no D visible | P0 |
| B-02 | Filter by: city, specialisation, availability (live-in / part-time) | P0 |
| B-03 | Filter by: verification status (Aadhaar ✓, Background ✓) | P0 |
| B-04 | Sort by: rating, experience, rate | P1 |
| B-05 | Unsigned user hits 5-profile limit → soft prompt to subscribe | P0 |
| B-06 | Member (premium) — unlimited browse, full DQEVFR visible | P0 |
| B-07 | Search by skill tag ("dementia", "post-stroke", "bedridden") | P0 |
| B-08 | SEO — skill + city pages indexable by Google (drives organic traffic) | P1 |

---

### EPIC 6 — Bookmarks

| ID | Story | Priority |
|---|---|---|
| BK-01 | Member can bookmark caregiver profiles | P0 |
| BK-02 | Bookmarks dashboard — member's saved profiles in one view | P0 |
| BK-03 | Bookmark expires when caregiver's verification lapses — member notified | P1 |
| BK-04 | Expired bookmark shows "Verification lapsed — find a replacement" prompt | P1 |
| BK-05 | Caregiver notified when bookmarked — nudge to keep profile active | P1 |

---

### EPIC 7 — Engagement Registration & Reviews

| ID | Story | Priority |
|---|---|---|
| E-01 | Member registers engagement: select caregiver + start date | P0 |
| E-02 | System timestamps registration — no backdating possible | P0 |
| E-03 | Caregiver receives WhatsApp confirmation request | P0 |
| E-04 | Caregiver confirms → engagement status = Active | P0 |
| E-05 | Engagement states: Pending / Active / Ended | P0 |
| E-06 | Review form unlocks for member after 30 days from confirmed start | P0 |
| E-07 | Review dimensions: Reliability, Hygiene, Gentleness, Communication, Overall | P0 |
| E-08 | Verified review badge on profile ("From registered engagement") | P0 |
| E-09 | Unregistered engagements cannot generate verified reviews | P0 |
| E-10 | Member can mark engagement Ended — triggers review prompt | P1 |
| E-11 | Engagement history visible on caregiver profile (tenure signal) | P1 |

---

### EPIC 8 — Trust & Quality Layer (Phase 2)

*Build after 50 active engagements are registered.*

| ID | Story | Priority |
|---|---|---|
| T-01 | Spot check scheduling — admin assigns professional checker to active engagement | P1 |
| T-02 | Spot check score recorded against engagement + shown on profile | P1 |
| T-03 | Fortnightly family feedback form — structured check-in (WhatsApp link) | P1 |
| T-04 | Feedback scores aggregated into ongoing rating (not just one-time review) | P1 |
| T-05 | NRI dashboard — live view of attender's verification status, scores, feedback | P2 |
| T-06 | Quality monitoring badge on profiles with active registered engagement | P1 |

---

### EPIC 9 — Add-on Services (Phase 3)

*Layer on after traffic and engagement base is established.*

| ID | Story | Priority |
|---|---|---|
| S-01 | Physiotherapist directory (same DQEVFR model) | P2 |
| S-02 | Post-op nursing directory | P2 |
| S-03 | Replacement facilitation — member requests replacement, platform matches | P2 |
| S-04 | "Available now" filter — caregivers signal availability for urgent hire | P2 |

---

## Priority Summary

| Phase | Epics | Gate to unlock |
|---|---|---|
| **MVP** | F, C (1–10), V (1–4), M, B, BK (1–2), E (1–9) | 50 verified caregivers + 100 paying members |
| **Growth** | V (5–7), BK (3–5), E (10–11), T (1–4) | 50 active registered engagements |
| **Moat** | T (5–6), S (all) | 500+ active members, proven retention |

---

## What NOT to Build (MVP)

- ❌ In-app messaging — use phone / WhatsApp
- ❌ Payroll or escrow
- ❌ Native iOS / Android apps
- ❌ Automated background check pipeline — manual + API for first 50
- ❌ Tamil UI — English first, validate before translating
- ❌ Spot checks — manual visits before building scheduling feature
- ❌ Caregiver hard delete — hide only, always
