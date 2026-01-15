# ELX API + CORS Contract (Phase 5.2 Freeze)

**Project:** Ellcworth Express (ELX)  
**Status:** Locked contract — do not change without a dedicated phase + commit.

---

## 1) Canonical API Base

All active application traffic uses:

- **Base prefix:** `/api/v1`

### Examples

- `GET /api/v1/shipments`
- `GET /api/v1/shipments/:id`
- `PATCH /api/v1/shipments/:id/quote`
- `POST /api/v1/shipments/:id/quote/send`
- `GET /api/v1/shipments/dashboard`
- `GET /api/v1/users`

---

## 2) Legacy Routes (Temporary)

Legacy mounts exist for backwards compatibility only:

- `/users`
- `/shipments`

**Rule:** New work must not depend on legacy mounts.  
Removal will be scheduled in a future phase once no consumers remain.

---

## 3) Auth Handling Standard

### Admin + Customer apps

- Pages/components do **not** read tokens directly.
- All protected requests use the standard axios clients (e.g. `authRequest`).
- Auth headers and expiry handling are performed by interceptors.
- `401/403` are handled centrally (redirect to login where applicable).

---

## 4) CORS Contract (Backend)

### Development (NODE_ENV != production)

Backend allows requests only from an explicit dev allowlist:

- `http://localhost:5173` (Frontend)
- `http://localhost:5174` (alt Frontend port)
- `http://localhost:3000` (Admin dev)
- plus loopback variants (`127.0.0.1`) and any explicitly configured env origins.

Environment variables used:

- `CLIENT_URL`
- `ADMIN_URL`
- `ALLOWED_ORIGINS` (comma-separated list)

### Production (NODE_ENV=production)

Backend allows requests from locked registered domains:

- `https://ellcworth.com`
- `https://www.ellcworth.com`
- `https://admin.ellcworth.com`

Plus any additional origins explicitly provided via:

- `ALLOWED_ORIGINS` (comma-separated list)

**Rule:** No wildcards in production.

---

## 5) Environment Variables Summary

Backend (CORS):

- `CLIENT_URL`
- `ADMIN_URL`
- `ALLOWED_ORIGINS`

Frontend (Vite):

- `VITE_API_URL`
- `VITE_API_PREFIX`

Admin (Vite):

- `VITE_API_BASE_URL`
- `VITE_ADMIN_API_BASE_URL`

---

## 6) Change Control

This contract is considered frozen after Phase 5.2.

Any change must include:

- Updated documentation here
- Updated `.env.example` if impacted
- A dedicated commit referencing the phase step
