import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

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
 * ✅ Public axios client (no auth)
 * Used for public quote requests / lead capture.
 */
export const publicRequest = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Customer-protected axios client (customer portal)
 * - Attaches Bearer token automatically
 * - Auto-logout on 401/403
 */
export const customerAuthRequest = axios.create({
  baseURL: API_BASE_URL,
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
  (error) => Promise.reject(error)
);

// If token expires / is invalid → clear auth + force redirect to login
customerAuthRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      clearCustomerAuth();

      // Avoid router hook usage inside axios interceptors
      // Use a hard redirect to guarantee we leave protected pages.
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
