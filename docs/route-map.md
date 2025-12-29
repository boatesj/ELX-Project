# Ellcworth Route Map (V1)

This file is the single source of truth for routing across:

- Frontend (public + customer portal)
- Admin (internal operations)

Rules:

- Every nav link must point to a route listed here.
- Every route listed here must exist in code (or be explicitly marked as "Planned").
- Route names must not change without updating this file and committing the change.

Status values:

- Wired = route exists and page renders
- Stub = route exists but feature is placeholder/coming soon
- Planned = not yet implemented
- Removed = route previously existed but has been removed for security/product reasons

---

## Frontend App (Public + Customer)

Base router:

- Parent: `/` uses `RootLayout`

### Public routes (no auth)

| Path            | Page            | Purpose                   | Nav surface                    | Status |
| --------------- | --------------- | ------------------------- | ------------------------------ | ------ |
| `/`             | `Home`          | Marketing home / sections | NavbarPublic hash-nav          | Wired  |
| `/services`     | `Services`      | Services directory page   | Menu “View Services Directory” | Wired  |
| `/services/:id` | `ServiceDetail` | Service detail view       | Services page                  | Wired  |
| `/login`        | `CustomerLogin` | Customer authentication   | CTA button                     | Wired  |
| `*`             | `NotFound`      | 404                       | System                         | Wired  |

### Customer routes (RequireCustomerAuth)

| Path                   | Page              | Purpose                           | Nav surface     | Status |
| ---------------------- | ----------------- | --------------------------------- | --------------- | ------ |
| `/myshipments`         | `MyShipments`     | Customer shipment list (scoped)   | Customer navbar | Wired  |
| `/shipmentdetails/:id` | `ShipmentDetails` | Customer shipment detail (scoped) | From list       | Wired  |

Security note (locked):

- A customer must NEVER have access to “All shipments (internal)”.
- Internal operational shipment lists belong ONLY in the Admin app (`/shipments`).

Removed customer route:

| Path            | Page           | Reason                                                           | Status  |
| --------------- | -------------- | ---------------------------------------------------------------- | ------- |
| `/allshipments` | `AllShipments` | Internal-only data view; removing prevents customer data leakage | Removed |

Notes:

- Public navbar uses hash navigation on `/` (e.g., `/#services`) and deep-links via `navigate("/#hash")`.

---

## Admin App (Internal)

Auth gate:

- All routes under `/` are protected by `RequireAuth`.
- `/login` is public.

### Admin top-level routes

| Path       | Page      | Purpose              | Menu/Nav            | Status |
| ---------- | --------- | -------------------- | ------------------- | ------ |
| `/login`   | `Login`   | Admin login          | Public              | Wired  |
| `/`        | `Home`    | Dashboard            | Navbar + Menu: Home | Wired  |
| `/profile` | `Profile` | Admin profile        | Menu: Profile       | Wired  |
| `/orders`  | `Orders`  | Orders/invoices view | Menu: Orders        | Wired  |

### Shipments

| Path                     | Page          | Purpose                      | Menu/Nav             | Status |
| ------------------------ | ------------- | ---------------------------- | -------------------- | ------ |
| `/shipments`             | `Shipments`   | Internal shipment list + ops | Menu: Shipments      | Wired  |
| `/newshipment`           | `NewShipment` | Create new shipment          | Navbar: New shipment | Wired  |
| `/shipments/:shipmentId` | `Shipment`    | Shipment detail view         | From list            | Wired  |

### Users / Customers

| Path              | Page          | Purpose         | Menu/Nav        | Status |
| ----------------- | ------------- | --------------- | --------------- | ------ |
| `/users`          | `Users`       | Users list      | Menu: Users     | Wired  |
| `/newuser`        | `NewUser`     | Create new user | From users page | Wired  |
| `/users/:id`      | `UserDetails` | User detail     | From list       | Wired  |
| `/users/:id/edit` | `EditUser`    | Edit user       | From details    | Wired  |

### System (Master Data)

| Path                         | Page              | Purpose                      | Menu/Nav       | Status |
| ---------------------------- | ----------------- | ---------------------------- | -------------- | ------ |
| `/elements`                  | `Elements`        | Entry/master data hub        | Menu: Elements | Wired  |
| `/elements/ports`            | `Ports`           | Ports master data            | From Elements  | Wired  |
| `/elements/service-types`    | `ServiceTypes`    | Service types master data    | From Elements  | Wired  |
| `/elements/cargo-categories` | `CargoCategories` | Cargo categories master data | From Elements  | Wired  |

### Ops Tools

| Path        | Page       | Purpose                      | Menu/Nav       | Status |
| ----------- | ---------- | ---------------------------- | -------------- | ------ |
| `/settings` | `Settings` | System configuration         | Menu: Settings | Wired  |
| `/backups`  | `Backups`  | Backup jobs                  | Menu: Backups  | Wired  |
| `/logs`     | `Logs`     | System logs                  | Menu: All logs | Wired  |
| `/calendar` | `Calendar` | Calendar events              | Menu: Calendar | Wired  |
| `/charts`   | `Charts`   | Operational analytics/charts | Menu: Charts   | Wired  |

---

## Naming Conventions (locked for now)

- Admin currently uses:
  - `/newshipment`, `/newuser` (flat “new” routes)
- We may later migrate to:
  - `/shipments/new`, `/users/new`
    but only via an intentional Phase change + redirects + nav update.

---

## Cross-app Constraints

- Frontend `/login` is customer login.
- Admin `/login` is admin login.
  These are separate apps, so collision is acceptable.
