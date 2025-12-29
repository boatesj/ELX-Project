# Ellcworth Navigation Contract (V1)

This document defines what must appear in navigation and what must not.

Rules:

1. Every visible navigation item must map to a route in `docs/route-map.md`.
2. “Hidden” routes (detail/edit) must not appear in nav menus.
3. Hash links on the public site are allowed ONLY for homepage sections.
4. Any change to nav labels, ordering, or destinations requires:
   - update `docs/route-map.md` (if route changes)
   - update this file (if nav changes)
   - commit

---

## Frontend Navigation

### Public Navbar (Homepage section nav)

Visible items (hash navigation on `/`):

- Home → `#Header`
- Our Services → `#services`
- Why Us → `#whyus`
- Repack & Consolidation → `#repackaging`
- Book a Shipment → `#booking`
- Client Stories → `#testimonials`

CTA buttons:

- Customer Login → `/login`
- View Services Directory → `/services` (from mobile drawer)

Constraints:

- Hash links must not be used to navigate to non-home pages.
- If not on home, click should navigate to `/#hash` and then scroll.

### Customer Navbar (Customer portal)

Purpose: provide portal navigation for authenticated customers.

Allowed items:

- My Shipments → `/myshipments`
- Logout → clears customer session keys and routes to `/login`

Explicitly disallowed:

- Any link to internal operational shipment lists (no “All Shipments”).
  Internal shipment operations live in the Admin app (`/shipments`) only.

---

## Admin Navigation

### Navbar (top, desktop links)

- Dashboard → `/`
- Shipments → `/shipments`
- New shipment → `/newshipment`
- Customers → `/users`
- Logout → clears token and goes to `/login`

### Sidebar Menu (desktop + mobile drawer)

Sections and items:

Main

- Home → `/`
- Profile → `/profile`

Operations

- Shipments → `/shipments`
- Users → `/users`
- Orders → `/orders`

System

- Elements → `/elements`
- Settings → `/settings`
- Backups → `/backups`

Insights

- Charts → `/charts`
- All logs → `/logs`
- Calendar → `/calendar`

Hidden routes (must NOT appear as direct nav items)

- Shipment detail: `/shipments/:shipmentId`
- User detail: `/users/:id`
- Edit user: `/users/:id/edit`
- New user: `/newuser` (may be linked from Users page actions only)

Logout rule:

- Logout must always remove `token` (and legacy `ellcworth_token` if present)
- Logout must route to `/login`
