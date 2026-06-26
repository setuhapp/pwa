# SETUH MVP — Design Spec (non-integration build)

**Date:** 2026-06-05
**Scope:** Full MVP core minus excluded integrations (payment, Aadhaar eKYC/IDfy, WhatsApp/SMS).
**Goal:** A complete, clickable, locally-runnable SETUH MVP with real persistence and the full caregiver → browse → engage → review loop, with integration touchpoints substituted by local equivalents.

---

## 1. Product summary

SETUH is a PWA marketplace connecting families with verified eldercare caregivers. Caregivers
publish a profile (DQEVFR model); families browse with tiered access (unsigned see everything
except contact/identity details; paid members see all), bookmark, register engagements, and leave
verified reviews tied to those engagements.

**Caregiver profile model — DQEVFR:**
- **D** Details — name, phone, Aadhaar, photo, address (gated; members only)
- **Q** Qualification — certifications, training, skills
- **E** Experience — years, prior families, specialisations
- **V** Verification status — Aadhaar eKYC (manual here), background check, reference checks
- **F** Feedback — reviews from registered engagements only
- **R** Rate — self-set daily/monthly rate

**Browsing access model:**
| Tier | Visible | Profile limit |
|---|---|---|
| Unsigned (free) | Q (anonymised), E, V, F, R — **no D** | 5 profiles |
| Member (premium) | Full DQEVFR | Unlimited |

---

## 2. Excluded integrations & local substitutions

| Excluded | Spec intent | This build |
|---|---|---|
| Razorpay payment | ₹499/mo subscription unlocks member tier | "Subscribe" button flips tier to member, no charge |
| IDfy/OnGrid Aadhaar eKYC | API-driven Aadhaar verification | Admin manually records verification checks |
| WATI WhatsApp | Engagement confirm, expiry/review notifications | Caregiver confirms **in-app**; notifications are in-app rows |
| MSG91 SMS | OTP + SMS fallback | Mock OTP (fixed dev code), no SMS |
| Supabase Auth/DB/Storage | Hosted Postgres + phone OTP + RLS + storage | SQLite + Prisma; mock OTP cookie session; server-side access enforcement; local file storage |

---

## 3. Tech stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS, mobile-first / single-thumb
- **DB/ORM:** SQLite via Prisma
- **Auth:** mock phone-OTP — any phone, fixed dev code (`000000`); signed cookie session
- **Access control:** server-side `getViewerTier()` → `anon | member | caregiver | admin` (replaces Supabase RLS)
- **QR:** `qrcode.react`
- **PWA:** installable manifest + basic offline fallback (light pass; no offline data sync)
- **Testing:** Vitest (unit/logic + key route/component tests)
- **i18n:** English only (Tamil deferred)

---

## 4. Architecture

### App areas (route groups)
- **Public/unsigned:** landing, browse (capped 5, QEVFR-only, no D), public caregiver profile (QR target)
- **Caregiver:** OTP login, 4-step progressive onboarding, profile editor, hide toggle, QR card, engagement confirmations, notifications
- **Member:** OTP login, care-need intake, full browse, bookmarks dashboard, engagement registration, review forms, mock subscribe
- **Admin:** verification management, engagement oversight, flagged/hidden profiles, hard-delete

### Access enforcement (replaces RLS)
- `getViewerTier()` reads the cookie session and returns the tier.
- **Serialization is the gate:** a `toPublicCaregiver()` serializer strips D fields (name, photo, address, phone) for `anon`; `toFullCaregiver()` returns everything for `member`/`admin`. D fields never leave the server for unsigned viewers.
- **5-profile cap:** unsigned browse tracks distinct profiles viewed in a `BrowseSession` (cookie-keyed); the API returns at most 5 and signals the cap so the UI shows a soft subscribe prompt.

### Data model (Prisma)
```
Caregiver        id, phone, name(D), photoUrl(D), address(D), city,
                 skills(Q, JSON), qualifications(Q), experienceYears(E),
                 priorFamilies(E), specialisations(E, JSON), availability(live-in/part-time),
                 dailyRate(R), monthlyRate(R), isHidden, createdAt
Member           id, phone, name, subscriptionStatus, subscriptionExpiry,
                 careNeed(JSON: city, careType, liveIn, specialisation), createdAt
Verification     id, caregiverId, type(aadhaar|background|reference),
                 status(self_reported|verified|failed), checkedDate, expiryDate, checkedBy
Engagement       id, caregiverId, memberId, startDate, status(pending|active|ended),
                 registeredAt (server-set), confirmedAt, endedAt
Review           id, engagementId, reliability, hygiene, gentleness,
                 communication, overall, createdAt
Bookmark         id, memberId, caregiverId, createdAt, expiresAt
Session          id, userType(caregiver|member|admin), userId, token, createdAt
Notification     id, recipientType, recipientId, kind, body, read, createdAt
BrowseSession    id, cookieKey, viewedCaregiverIds(JSON), createdAt
```

**Invariants:**
- `registeredAt` is always server-stamped — no backdating.
- `startDate` may be in the past (member-entered); review unlock = `now ≥ confirmedStart + 30 days`.
- Engagement transitions: `pending → active` (caregiver confirm) → `ended` (member). Reviews require a confirmed (active/ended) engagement.
- Caregivers are never deleted by themselves — `isHidden` toggle only; hard-delete is admin-only.

---

## 5. Feature flows (story mapping)

### Caregiver onboarding & profile (C-01…C-11)
- C-01 OTP register (mock). C-02 Step 1: photo + name + address → **go live**.
- C-03/04/05 Steps 2–4 (skills/quals, experience/prior families, rate) — prompted later, skippable.
- C-06 edit any field post-onboarding. C-07 hide (preserve data). C-08 no self-delete.
- C-09 completeness indicator (% from filled sections). C-10 QR per live profile → public URL. C-11 PDF QR card (stretch/P1).

### Verification (V-02…V-04, manual)
- Admin records each check with type, status (verified vs self-reported), checked date, expiry (+12mo), checkedBy.
- Badge shows exactly what was checked + date (no vague labels).
- (P1) Lapsed verification demotes browse ranking.

### Member & browsing (M-01…M-07, B-01…B-07)
- M-01 OTP register. M-02 care-need intake. M-04 mock subscribe → member tier. M-06 subscription status on dashboard. M-07 lapse reverts to unsigned behaviour.
- B-01 unsigned: ≤5 profiles, QEVFR, no D. B-05 cap → soft subscribe prompt. B-06 member: unlimited, full DQEVFR.
- B-02 filter city/specialisation/availability. B-03 filter verification status. B-04 sort rating/experience/rate (P1). B-07 search by skill tag.

### Bookmarks (BK-01, BK-02)
- Member bookmarks profiles; bookmarks dashboard lists saved profiles.

### Engagement & reviews (E-01…E-11)
- E-01 register engagement (caregiver + start date). E-02 server-stamped `registeredAt`. E-03 caregiver receives in-app confirmation request (WhatsApp substitute). E-04 caregiver confirms → `active`. E-05 states pending/active/ended.
- E-06 review form unlocks 30 days after confirmed start. E-07 dimensions: Reliability, Hygiene, Gentleness, Communication, Overall. E-08 verified-review badge. E-09 unregistered engagements cannot review. E-10 member marks ended → review prompt. E-11 engagement history on profile (tenure signal).

### Admin (F-07)
- Manage verifications, oversee engagements, view flagged/hidden profiles, hard-delete caregivers.

### Notifications (in-app substitute for F-05/F-06)
- `Notification` rows + a bell/list: engagement confirmation request, review-unlock, bookmarked nudge.

---

## 6. UI / UX
- Mobile-first single-thumb: large tap targets, bottom-anchored primary actions, one-column layouts.
- English only. PWA: installable manifest + basic offline fallback page.

---

## 7. Testing strategy
- **TDD** on trust-critical logic: tier-based field stripping (no D for unsigned), 5-profile cap, review-unlock-at-30-days, no-backdating timestamp, engagement state transitions, completeness %.
- Vitest unit tests for the above; a few route/component tests for access gating.

## 7a. Milestone demo-ability (hard requirement)
Every milestone must end in a state that is **demo-able and testable** on its own: the app
runs, the milestone's flow is clickable end-to-end (against seed data), and its tests pass.
No milestone leaves the app broken or its feature reachable only via later work. Seed data
grows with each milestone so the newest flow is immediately exercisable.

## 8. Seed data (`prisma/seed.ts`)
- ~8–10 caregivers: varied cities, skills, verification states, rates, some hidden.
- 2–3 members: one subscribed, one not.
- Engagements: at least one with a **past** start date so its review form is already unlocked.
- One admin login.

---

## 9. Out of scope (this build)
- Payment, Aadhaar eKYC API, WhatsApp/SMS sending.
- Tamil UI, SEO static pages (P1), full offline data sync, native apps.
- Phase 2/3 epics (T, S), V-05/06/07 automation, BK-03/04/05.
