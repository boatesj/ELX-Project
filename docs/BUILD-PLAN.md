# ELX Progressive Build Plan (Phase 4 → Deployment)

**Project:** Ellcworth Express (ELX-Project) — MERN (Admin + Frontend + Backend + BackgroundServices)  
**Goal:** Production deployment without merry-go-round rework.  
**Principle:** Forward-only delivery. Each micro-step produces a testable increment and a Git commit.

---

## 0) Locked Rules (Non-Negotiable)

### Forward-only rule

We do not revisit completed pages or refactor “for neatness” once a phase item is marked DONE, **unless it is a blocking defect**, defined as:

- Build fails / app won’t run
- Route is broken or unreachable (per route-map.md)
- Critical conversion path broken (e.g. booking CTA doesn’t land)
- Security flaw or data corruption risk
- Production deployment fails

### Workflow rule

- **Ask for FULL FILES only**
- **Return FULL FILES only**
- **Mandatory Git commit after each micro-step**
- No reordering of phases.

### Contract files (source of truth)

- `docs/route-map.md` (routing truth)
- `docs/navigation_contract.md` (nav truth)
- This file (execution truth)

Any change to routing/nav requires updating the contract files + commit.

---

## 1) Current Contracts Summary (V1)

### Public App (Frontend)

Wired:

- `/` Home (hash sections)
- `/services`
- `/services/:id`
- `/login`
- `*` NotFound

Hash navigation allowed ONLY on `/` and must work via `/#hash` deep-linking.

### Admin App

Protected routes under `/` + public `/login`.  
Operational routes are wired (shipments/users/elements/settings/backups/logs/calendar/charts).

### Key constraint

Frontend `/login` is customer login. Admin `/login` is admin login. Separate apps, OK.

---

## 2) Phase 4 — Public / Marketing UI (Finish → Freeze)

**Outcome:** Public site is consistent, conversion-ready, and contract-compliant.

### 4.1 Navigation + Hash Contract Compliance (Public)

**Work:**

- Ensure homepage section IDs match `navigation_contract.md`:
  - `#Header`, `#services`, `#whyus`, `#repackaging`, `#booking`, `#testimonials`
- Ensure all public CTAs that should land on booking navigate to `/#booking` then scroll.
- Ensure hash links are never used for non-home navigation.

**Exit criteria:**

- Clicking nav items from non-home routes correctly navigates to `/#hash` and scrolls.
- Booking CTA from `/services` and `/services/:id` lands reliably on `#booking`.
- No double-navbar padding artifacts.

**Micro-steps (each = 1 commit):**

- 4.1.1 Validate/standardize homepage anchor IDs
- 4.1.2 Validate navbar public hash behavior off-home (navigate + scroll)
- 4.1.3 Smoke pass public routes: `/`, `/services`, `/services/:id`, `/login`, `*`

### 4.2 Content Completeness Freeze (Public)

**Work:**

- Remove “coming soon” from public where it damages trust (unless intentional).
- Ensure footer & prefooter CTAs are correct and consistent.

**Exit criteria:**

- Public pages contain no credibility-breaking placeholders.
- Footer contact details correct and consistent.

### 4.3 Public Production Readiness (Frontend only)

**Work:**

- Add/verify SEO basics: titles/descriptions per route, OG tags.
- Ensure assets paths resolve under production build.

**Exit criteria:**

- Frontend production build succeeds.
- Pages render correctly with deployed base URLs.

### Phase 4 Status

- **DONE (frozen)** ✅  
  Public/Marketing UI is considered frozen. No redesigns afterwards unless blocking conversion defect.

---

## 3) Phase 5 — System Integration Readiness (All Apps)

**Outcome:** All services run together with stable environment contracts.

### 5.1 Environment Contract (Dev + Prod)

**Work:**

- Define env var requirements per app:
  - Frontend env (VITE_API_BASE_URL etc.)
  - Admin env
  - Backend env (Mongo URI, JWT secret, CORS allowlist)
  - BackgroundServices env (SMTP/API keys, backend base, queue settings)
- Create `.env.example` for each project folder.

**Exit criteria:**

- Fresh machine can start all services using documented env vars.
- No hardcoded localhost URLs in production paths.

**Status / Progress**

- ✅ **Admin production build passes** (`Admin/npm run build`).
- ✅ **Frontend production build passes** (`Frontend/npm run build`).
- ⚠️ Admin build reports **chunk > 500kB warning** (non-blocking).  
  This is a Phase 8.3 performance consideration unless it becomes a deployment blocker.
- ⏳ `.env.example` files not yet locked and committed (still pending as part of Phase 5.1).

**Micro-steps (each = 1 commit):**

- 5.1.1 Create/verify `.env.example` for Frontend
- 5.1.2 Create/verify `.env.example` for Admin
- 5.1.3 Create/verify `.env.example` for Backend
- 5.1.4 Create/verify `.env.example` for BackgroundServices
- 5.1.5 Fresh-start smoke: boot all services using docs-only env values

---

### 5.2 API Base + CORS Contract Freeze

**Work:**

- Confirm canonical API base: `/api/v1`
- Remove legacy route hits where possible or hard-deprecate them.
- Lock CORS:
  - Dev allows localhost ports needed
  - Prod allows only deployed domains (public + admin)

**Exit criteria:**

- Admin & Frontend talk only to `/api/v1/*`.
- CORS is correct for dev and prod.

**Status / Progress**

- ✅ Admin quote builder work is wired against `/api/v1` endpoints:
  - `PATCH /api/v1/shipments/:id/quote`
  - `POST /api/v1/shipments/:id/quote/send`
- ⏳ CORS allowlist still needs explicit dev/prod freeze + documentation + commit.

**Micro-steps (each = 1 commit):**

- 5.2.1 Audit Admin + Frontend requests to confirm `/api/v1/*` only
- 5.2.2 Lock Backend CORS for dev ports
- 5.2.3 Lock Backend CORS for prod domains (Frontend + Admin)
- 5.2.4 Document CORS + API base in README / env contract

---

### Phase 5 Blocking Defects Log (Live)

Blocking defects are fixed immediately; once fixed, we move forward.

- ✅ **Admin build failure (Shipment.jsx JSX parse error) — FIXED**
  - Symptom: `Expected "}" but found ")"` in Admin `src/pages/Shipment.jsx` (Quote builder “Line tax” render).
  - Resolution: corrected JSX expression/parentheses in the “Line tax” line.
  - Verification: `npm run build` passes in Admin; Frontend build also passes.

**Pending Git hygiene (must be done as micro-step):**

- ⏳ Stage + commit the fix:
  - `Admin/src/pages/Shipment.jsx` modified and not staged.
  - Branch: `Integration`.

---

## 4) Phase 6 — Customer Booking MVP (End-to-End)

**Outcome:** A real customer can create a booking, backend stores it, notifications fire.

### 6.1 Frontend Booking Submission

**Work:**

- Booking form (on `#booking`) submits to backend endpoint.
- Clear success/failure UI.
- Client-side validation (minimal).

**Exit criteria:**

- A customer can submit a booking from the public site.

### 6.2 Backend Booking Endpoint + Validation

**Work:**

- Implement/confirm booking endpoint:
  - `POST /api/v1/bookings` (or `/shipments/public` — choose and lock)
- Validate payload; store to Mongo.
- Return consistent response shape.

**Exit criteria:**

- Booking stored in DB; response includes booking/shipment id reference.

### 6.3 BackgroundServices Notification MVP

**Work:**

- On booking creation:
  - email internal ops
  - email customer confirmation
- Add retry + logging (minimum viable).

**Exit criteria:**

- Booking triggers emails reliably (success + error logged).

---

## 5) Phase 7 — Admin Operational Completion (MVP to Operate)

**Outcome:** Admin can process what customers submit.

### 7.1 Admin Intake Queue / View

**Work:**

- Admin list shows new bookings/shipments requiring action.
- Admin can open a booking/shipment detail.

**Exit criteria:**

- Admin can see new items without manual DB inspection.

### 7.2 Admin Workflow: Convert Booking → Shipment

**Work:**

- Define minimal status model (e.g. NEW → QUOTED → BOOKED → IN_TRANSIT → DELIVERED).
- Admin can update status and key fields.

**Exit criteria:**

- Admin can move booking through lifecycle to completion.

### 7.3 Audit Logging (Minimum)

**Work:**

- Log key admin actions (status changes, edits).
- Simple log retention.

**Exit criteria:**

- Operational changes are traceable.

---

## 6) Phase 8 — Production Hardening (Release Candidate)

**Outcome:** Safe, stable, deployable.

### 8.1 Security Hardening

**Work:**

- Helmet, rate limiting, input sanitization.
- JWT secret rotation readiness (documented).
- Remove debug configs in production.

**Exit criteria:**

- Security middleware active in production mode.
- No secrets committed; env required.

### 8.2 Observability + Healthchecks

**Work:**

- Health endpoints:
  - Backend: `/health`
  - BackgroundServices: `/health` or heartbeat log
- Structured logging.

**Exit criteria:**

- Deployed services can be monitored simply.

### 8.3 Build + Performance

**Work:**

- Production builds for Frontend + Admin.
- Bundle sanity checks; remove dead code if clearly safe.
- Optional code-splitting if bundle size becomes a deployment or UX blocker.

**Exit criteria:**

- “Release Candidate” build completes consistently.

---

## 7) Phase 9 — Deployment (Go Live)

**Outcome:** Public + Admin + Backend + BackgroundServices running on real infrastructure.

### Recommended deployment shape (split apps)

- **Frontend:** Vercel (or Netlify)
- **Admin:** Vercel (or Netlify) — separate deploy
- **Backend:** Render / Fly.io / Railway (Node/Express)
- **Mongo:** MongoDB Atlas
- **BackgroundServices:** Render Worker / Railway Worker

### 9.1 Deployment Configuration

**Work:**

- Configure env vars in hosting dashboards.
- Configure CORS allowlist to deployed domains.
- Configure API base URLs in Frontend/Admin.

**Exit criteria:**

- All apps boot successfully in hosted environments.

### 9.2 Domain + SSL + Email Deliverability

**Work:**

- Domains wired
- SSL active
- Email sender verified (SPF/DKIM/DMARC if used)

**Exit criteria:**

- Emails land reliably; no “blocked sender” problems.

### 9.3 Final Smoke Tests (Go/No-Go)

**Must pass:**

- Public site routes render
- Booking submission works end-to-end
- Admin login works
- Admin can view and update booking/shipment
- Notification emails fire
- Healthchecks OK

**Exit criteria:**

- Go-live approved.

---

## 8) How We Mark Work “DONE”

A phase item becomes DONE only when:

- It meets its exit criteria
- It has a Git commit
- It is documented (if contract impacted)

After DONE:

- We move forward.
- We do not revisit unless blocking defect.

---

## 9) Commit Message Pattern (Locked)

Use:

- `Phase X: <micro-step summary>`

Examples:

- `Phase 4: public hash navigation contract compliance`
- `Phase 6: booking endpoint + validation`
- `Phase 9: deploy admin to vercel`

---

## 10) Immediate Next Execution Step

**We are in Phase 5.1 → 5.2 now (forward-only).**

### Next micro-step (must commit)

**5.1.x / Blocking defect closure commit:**

- Stage and commit the Admin fix that made builds pass:
  - `Admin/src/pages/Shipment.jsx`

Suggested commit message:

- `Phase 5: fix admin quote builder JSX build error`

Then proceed immediately to:

### Phase 5.1 completion

- Create `.env.example` per app folder and document required vars.

### Phase 5.2 freeze

- Audit all requests to ensure `/api/v1/*` only.
- Lock Backend CORS for dev + prod domains.
- Document API/CORS contract.

(Do not start Phase 6 until Phase 5 environment/API contract is locked.)
