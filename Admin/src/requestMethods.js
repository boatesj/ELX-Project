import axios from "axios";

const API_ROOT_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const API_V1_BASE_URL = `${API_ROOT_URL}/api/v1`;

const ADMIN_API_BASE_URL =
  import.meta.env.VITE_ADMIN_API_BASE_URL || "http://localhost:8000/admin";

// ✅ Admin-scoped keys (preferred)
const ADMIN_TOKEN_KEY = "elx_admin_token";
const ADMIN_USER_KEY = "elx_admin_user";

// ✅ Legacy keys (fallback for backwards compatibility)
const LEGACY_TOKEN_KEY = "token";
const LEGACY_USER_KEY = "user";

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

/**
 * ✅ ROOT axios client (no auth)
 * Use for:
 * - /auth/*
 * - /config/*
 * - /health
 * - /docs
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
 * This is the main workhorse for Admin data calls.
 */
export const authRequest = axios.create({
  baseURL: API_V1_BASE_URL,
});

/**
 * ✅ Admin-only endpoints (system ops already live under /admin/*)
 */
export const adminRequest = axios.create({
  baseURL: ADMIN_API_BASE_URL,
});

const attachToken = (config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authRequest.interceptors.request.use(attachToken, (error) =>
  Promise.reject(error)
);

adminRequest.interceptors.request.use(attachToken, (error) =>
  Promise.reject(error)
);
