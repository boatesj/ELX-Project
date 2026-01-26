# docs/BUILD-PLAN.md

# ELX Progressive Build Plan (Phase 4 → Deployment)

**Project:** Ellcworth Express (ELX-Project)  
**Architecture:** MERN (Admin + Frontend + Backend + BackgroundServices)  
**Objective:** Reach production deployment without rework, churn, or scope drift.

**Execution Principle:**  
Forward-only delivery. Each micro-step produces a testable increment and a Git commit.

---

## 0) Locked Rules (Non-Negotiable)

### Forward-only rule

Once a phase or micro-step is marked **DONE**, it is closed permanently unless a **blocking defect** exists.

A blocking defect is defined as:

- Build fails / app will not run
- Route is broken or unreachable (per route-map)
- Critical conversion path broken (e.g. booking CTA, quote flow)
- Security flaw or data corruption risk
- Production deployment failure

No refactors “for neatness”. No revisits for preference.

---

### Workflow rule

- **Ask for FULL FILES only**
- **Return FULL FILES only**
- **Mandatory Git commit after each micro-step**
- No reordering of phases

---

### Contract files (source of truth)

- `docs/route-map.md` — routing truth
- `docs/navigation_contract.md` — navigation truth
- This file — execution truth

Any routing or navigation change **must** update the relevant contract file and be committed.

---

## 1) Phase Status Overview (Current Truth)

| Phase                                      | Status               |
| ------------------------------------------ | -------------------- |
| Phase 1 — Navigation Foundation            | ✅ COMPLETE          |
| Phase 2 — Navigation Contracts             | ✅ COMPLETE          |
| Phase 3A — Admin Wiring                    | ✅ COMPLETE (CLOSED) |
| Phase 4 — Public / Marketing UI            | ✅ COMPLETE (FROZEN) |
| **Phase 5 — System Integration Readiness** | 🔄 **IN PROGRESS**   |
| Phase 6 — Customer Booking MVP             | ⏳ NOT STARTED       |
| Phase 7 — Admin Operational MVP            | ⏳ NOT STARTED       |
| Phase 8 — Production Hardening             | ⏳ NOT STARTED       |
| Phase 9 — Deployment                       | ⏳ NOT STARTED       |

---

## 2) Phase 4 — Public / Marketing UI (DONE → FROZEN)

**Outcome:**  
Public site is consistent, conversion-ready, and contract-compliant.

### What is locked

- Public routes:
  - `/`
  - `/services`
  - `/services/:id`
  - `/login`
  - `*` (NotFound)
- Hash navigation allowed **only** on `/`
- Booking CTA scrolls reliably from all public pages
- Public lead capture form works end-to-end:
  - `POST /api/v1/shipments/public-request`
- Frontend production build passes

**Status:**  
✅ DONE — Public UI is frozen.  
No redesigns or content churn allowed unless conversion is broken.

---

## 3) Phase 5 — System Integration Readiness (CURRENT PHASE)

**Outcome:**  
All apps run together cleanly with stable environment + API contracts and a reproducible “fresh machine” setup.

---

### 5.0 Verified Running State (Baseline)

**Verified stable (already true):**

- Frontend, Admin, Backend run concurrently with no network/CORS errors
- Canonical API base confirmed and locked: `/api/v1`
- Admin shipment endpoints verified:
  - `GET /api/v1/shipments`
  - `GET /api/v1/shipments/:id`
  - `GET /api/v1/shipments/dashboard`
- Public lead submission works:
  - `POST /api/v1/shipments/public-request`
- Frontend production build passes
- Admin production build passes

This baseline is assumed going forward unless a blocking defect appears.

---

### 5.1 Environment Contract (Dev + Prod)

**Goal:**  
A fresh machine can run all services using documented environment variables only.

#### Status

✅ **DONE (CLOSED)** — Environment contracts are locked and a fresh-start smoke test has passed.

#### Completed (DONE)

- `.env.example` files created and locked for:
  - Frontend
  - Admin
  - Backend
  - BackgroundServices
- Fresh-start smoke test passed using examples-only values:
  - Backend started and connected successfully
  - Admin started successfully
  - Frontend started successfully
  - BackgroundServices started successfully
  - Public request submission works
  - Admin shipments list loads
  - Admin shipment detail loads
  - Admin dashboard loads

#### Locked notes (Phase 5 hygiene)

- Dev ports are stabilised and must remain consistent:
  - Frontend: `5173`
  - Admin: `3000`
  - Backend: `8000`
- Public marketing anchors are stable and must not regress:
  - Duplicate section IDs removed from child components (Home owns anchors)
  - `/` hash navigation confirmed working (e.g. `/#repackaging` → How It Works)

---

### 5.2 API Base + CORS Contract Freeze

**Goal:**  
API usage and CORS behaviour are locked for dev and prod (no accidental regressions).

#### Completed (already true)

- Canonical API base locked to `/api/v1`
- Admin quote builder wired to:
  - `PATCH /api/v1/shipments/:id/quote`
  - `POST /api/v1/shipments/:id/quote/send`
- Legacy route usage eliminated from active flows

#### Remaining (TODO)

- Lock dev CORS allowlist explicitly (documented)
- Lock prod CORS domains (Frontend + Admin) explicitly (documented)
- Document API base + CORS rules in README / env docs

#### Micro-steps (each = 1 commit)

- **5.2.1 Audit all Admin + Frontend requests: canonical `/api/v1` only**
- **5.2.2 Lock Backend CORS allowlist for dev ports**
- **5.2.3 Lock Backend CORS allowlist for prod domains**
- **5.2.4 Document API + CORS contract (README / env docs)**

> Note (locked): Feature work such as “CTA deep-links”, “new booking field expansions”, etc. belongs in **Phase 6** unless it is blocking the verified baseline above.

---

### Phase 5 Blocking Defects Log (Only blocking items)

Blocking defects are fixed immediately and logged here.

- ✅ Admin build failure — FIXED
  - File: `Admin/src/pages/Shipment.jsx`
  - Issue: JSX parse error in quote builder
  - Status: Build passes
  - **Rule:** If this fix is already present on the branch with no staged changes, do **not** force a redundant commit. Only commit when there is an actual diff.

---

## 4) Phase 6 — Customer Booking MVP (END-TO-END)

**Outcome:**  
A real customer can submit a booking and receive confirmation.

### 6.1 Frontend Booking Submission

- Booking form submits successfully
- Clear success / failure UI
- Minimal client validation

### 6.2 Backend Booking Endpoint

- Booking endpoint implemented and validated
- Booking stored in Mongo
- Response includes booking / shipment reference

### 6.3 BackgroundServices Notifications

- Email internal ops
- Email customer confirmation
- Retry + logging (minimum viable)

**Phase exit:**  
Booking submission works end-to-end.

---

## 5) Phase 7 — Admin Operational MVP

**Outcome:**  
Admin can process customer submissions without manual DB work.

### 7.1 Admin Intake View

- Admin can see new bookings/shipments
- Detail view accessible

### 7.2 Workflow & Status Model

- Minimal lifecycle:
  - NEW → QUOTED → BOOKED → IN_TRANSIT → DELIVERED
- Admin can update status and key fields

### 7.3 Audit Logging (Minimum)

- Key admin actions logged
- Simple retention

---

## 6) Phase 8 — Production Hardening

**Outcome:**  
Safe, stable, deployable release candidate.

### 8.1 Security

- Helmet, rate limiting, sanitization
- JWT secret hygiene
- Debug configs removed in prod

### 8.2 Observability

- Health endpoints:
  - Backend `/health`
  - BackgroundServices heartbeat
- Structured logging

### 8.3 Build & Performance

- Production builds verified
- Bundle size reviewed
- Optional code-splitting if needed

---

## 7) Phase 9 — Deployment (Go Live)

**Outcome:**  
Public + Admin + Backend + BackgroundServices live on real infrastructure.

### Recommended deployment shape

- Frontend → Vercel / Netlify
- Admin → Vercel / Netlify (separate)
- Backend → Render / Fly.io / Railway
- Mongo → MongoDB Atlas
- BackgroundServices → Render Worker / Railway Worker

### Final smoke tests (must pass)

- Public routes render
- Booking submission works
- Admin login works
- Admin can process booking
- Emails fire
- Healthchecks OK

---

## 8) Definition of DONE (Locked)

A phase or micro-step is DONE only when:

- Exit criteria are met
- Git commit exists
- Contracts are updated (if impacted)

After DONE:

- Move forward
- No revisits unless blocking

---

## 9) Commit Message Pattern (Locked)

Examples:

- `Phase 5: lock frontend env example`
- `Phase 5: lock backend env example`
- `Phase 6: booking endpoint MVP`
- `Phase 9: deploy backend to render`

---

## 10) Immediate Next Execution Step (Locked)

We are executing **Phase 5.2**.

### Next micro-step (one commit)

- **5.2.1 Audit all Admin + Frontend requests: canonical `/api/v1` only**
