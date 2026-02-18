// Admin/src/requestMethods.js
import axios from "axios";

export const API_V1_PREFIX = "/api/v1";
export const ADMIN_API_PREFIX = "/admin";

// -----------------------------
// API ROOT (shared)
// -----------------------------
const API_ROOT_URL_RAW =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Normalise to prevent double slashes in composed URLs
export const API_ROOT_URL = String(API_ROOT_URL_RAW || "").replace(/\/+$/, "");

// Canonical v1 base
export const API_V1_BASE_URL = `${API_ROOT_URL}${API_V1_PREFIX}`;

// -----------------------------
// ADMIN ROOT + ADMIN BASE
// IMPORTANT: VITE_ADMIN_API_BASE_URL should be the backend root (NO /admin)
// Example: http://localhost:8000
// -----------------------------
const ADMIN_ROOT_RAW = import.meta.env.VITE_ADMIN_API_BASE_URL || API_ROOT_URL;
export const ADMIN_ROOT_URL = String(ADMIN_ROOT_RAW || "")
  .replace(/\/+$/, "")
  .replace(/(\/admin)+$/i, "");

// Final admin base (exactly one /admin)
export const ADMIN_API_BASE_URL = `${ADMIN_ROOT_URL}${ADMIN_API_PREFIX}`;

// -----------------------------
// AUTH STORAGE KEYS
// -----------------------------

// ✅ Admin-scoped keys (preferred)
export const ADMIN_TOKEN_KEY = "elx_admin_token";
export const ADMIN_USER_KEY = "elx_admin_user";

// ✅ Legacy keys (fallback for backwards compatibility)
export const LEGACY_TOKEN_KEY = "token";
export const LEGACY_USER_KEY = "user";

/**
 * Resolve admin token with safe fallback:
 * 1) elx_admin_token
 * 2) token (legacy)
 */
const getAuthToken = () => {
  const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (adminToken) return adminToken;

  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
  if (legacyToken) return legacyToken;

  return null;
};

/**
 * Resolve admin user (optional helper)
 * 1) elx_admin_user
 * 2) user (legacy)
 */
export const getAdminUser = () => {
  const raw =
    localStorage.getItem(ADMIN_USER_KEY) ||
    localStorage.getItem(LEGACY_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export function clearAdminAuth() {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);

    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_USER_KEY);
    sessionStorage.removeItem(LEGACY_TOKEN_KEY);
    sessionStorage.removeItem(LEGACY_USER_KEY);
  } catch {
    // no-op
  }
}

// -----------------------------
// AXIOS CLIENTS
// -----------------------------

/**
 * ✅ ROOT axios client
 * Use for:
 * - /auth/*
 * - /config/*
 * - /health
 * - /docs
 *
 * IMPORTANT:
 * Root routes like /auth/me still require Bearer token,
 * so we attach token here too.
 */
export const rootRequest = axios.create({
  baseURL: API_ROOT_URL,
});

/**
 * ✅ Public axios client (no auth) — ROOT
 * Keep on ROOT so admin login/register flows keep working if they hit /auth/*
 */
export const publicRequest = axios.create({
  baseURL: API_ROOT_URL,
});

/**
 * ✅ Protected endpoints (shipments, users, dashboard) — v1 canonical
 */
export const authRequest = axios.create({
  baseURL: API_V1_BASE_URL,
});

/**
 * ✅ Admin-only endpoints (system ops live under /admin/*)
 * Examples:
 * - GET  /admin/settings
 * - PUT  /admin/settings
 * - POST /admin/settings/test-email
 */
export const adminRequest = axios.create({
  baseURL: ADMIN_API_BASE_URL,
});

// -----------------------------
// INTERCEPTORS
// -----------------------------
const attachToken = (config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// ✅ Attach token to ALL protected clients (including rootRequest for /auth/me)
authRequest.interceptors.request.use(attachToken, (error) =>
  Promise.reject(error),
);
adminRequest.interceptors.request.use(attachToken, (error) =>
  Promise.reject(error),
);
rootRequest.interceptors.request.use(attachToken, (error) =>
  Promise.reject(error),
);

/**
 * ✅ Optional: consistent admin auto-logout on 401/403
 * Prevents “stale token” loops and keeps UX predictable.
 */
const handleAuthFailure = (error) => {
  const status = error?.response?.status;
  if (status === 401 || status === 403) {
    clearAdminAuth();
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }
  }
  return Promise.reject(error);
};

authRequest.interceptors.response.use((r) => r, handleAuthFailure);
adminRequest.interceptors.response.use((r) => r, handleAuthFailure);
rootRequest.interceptors.response.use((r) => r, handleAuthFailure);
