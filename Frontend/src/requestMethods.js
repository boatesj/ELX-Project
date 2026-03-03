// Frontend/src/requestMethods.js

import axios from "axios";

export const API_V1_PREFIX = "/api/v1";

// Normalise root URL to avoid trailing-slash issues in composed URLs
const API_ROOT_URL_RAW =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
export const API_ROOT_URL = String(API_ROOT_URL_RAW || "").replace(/\/+$/, "");

const API_V1_BASE_URL = `${API_ROOT_URL}${API_V1_PREFIX}`;

/**
 * Customer auth storage keys
 * (keep aligned with CustomerLogin.jsx + customer pages)
 */
export const CUSTOMER_SESSION_KEY = "elx_customer_session_v1";
export const CUSTOMER_TOKEN_KEY = "elx_customer_token";
export const CUSTOMER_USER_KEY = "elx_customer_user";

export function clearCustomerAuth() {
  try {
    localStorage.removeItem(CUSTOMER_SESSION_KEY);
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_USER_KEY);

    sessionStorage.removeItem(CUSTOMER_SESSION_KEY);
    sessionStorage.removeItem(CUSTOMER_TOKEN_KEY);
    sessionStorage.removeItem(CUSTOMER_USER_KEY);
  } catch {
    // no-op
  }
}

function readCustomerToken() {
  return (
    localStorage.getItem(CUSTOMER_TOKEN_KEY) ||
    sessionStorage.getItem(CUSTOMER_TOKEN_KEY) ||
    null
  );
}

/**
 * ✅ ROOT axios client (no auth)
 * Use this for non-v1 endpoints like:
 * - /auth/*
 * - /config/*
 * - /health
 */
export const rootRequest = axios.create({
  baseURL: API_ROOT_URL,
});

/**
 * ✅ Public axios client (no auth) — ROOT
 * IMPORTANT:
 * - Keep this on ROOT so you can call public v1 endpoints as "/api/v1/..."
 * - Prevents accidental double prefix: "/api/v1/api/v1/..."
 *
 * Example:
 *   publicRequest.post("/api/v1/shipments/public-request", payload)
 */
export const publicRequest = axios.create({
  baseURL: API_ROOT_URL,
});

/**
 * ✅ Customer-protected axios client (customer portal) — v1 canonical
 * - Attaches Bearer token automatically
 *
 * IMPORTANT:
 * - With this client, DO NOT prefix paths with "/api/v1"
 *   Use "/shipments/..." etc.
 */
export const customerAuthRequest = axios.create({
  baseURL: API_V1_BASE_URL,
});

customerAuthRequest.interceptors.request.use(
  (config) => {
    const token = readCustomerToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Determine whether a 403 is truly an auth invalidation.
 * In ELX go-live, many 403s are *authorisation/business-rule* rejections
 * (e.g., forbidden field updates), and should NOT log the customer out.
 *
 * We only treat 401 as "token invalid / not logged in".
 * We treat 403 as "forbidden action" unless the backend explicitly signals
 * token/session invalidation.
 */
function isExplicitAuthInvalidation(error) {
  const status = error?.response?.status;
  if (status !== 403) return false;

  const data = error?.response?.data;
  const msg = String(
    data?.message || data?.error || error?.message || "",
  ).toLowerCase();

  // Only logout on 403 if it clearly indicates token/session invalidation.
  // (These patterns are conservative by design.)
  const tokenHints = [
    "jwt",
    "token",
    "unauthorized",
    "not authenticated",
    "authentication",
    "invalid signature",
    "signature verification failed",
    "expired",
    "session expired",
  ];

  return tokenHints.some((h) => msg.includes(h));
}

// If token expires / is invalid → clear auth + force redirect to login
customerAuthRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // ✅ Corporate behaviour:
    // - 401 => token missing/invalid => logout
    // - 403 => forbidden action => DO NOT logout (show error in UI)
    const shouldLogout =
      status === 401 || (status === 403 && isExplicitAuthInvalidation(error));

    if (shouldLogout) {
      clearCustomerAuth();

      // Avoid router hook usage inside axios interceptors
      // Use a hard redirect to guarantee we leave protected pages.
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
