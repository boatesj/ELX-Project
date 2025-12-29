import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ✅ Customer-only key (must match CustomerLogin.jsx)
const CUSTOMER_TOKEN_KEY = "elx_customer_token";

/**
 * For customer-protected endpoints (customer portal)
 * - Reads token from localStorage OR sessionStorage
 * - Attaches Bearer token automatically
 */
export const customerAuthRequest = axios.create({
  baseURL: API_BASE_URL,
});

function readCustomerToken() {
  return (
    localStorage.getItem(CUSTOMER_TOKEN_KEY) ||
    sessionStorage.getItem(CUSTOMER_TOKEN_KEY) ||
    null
  );
}

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
