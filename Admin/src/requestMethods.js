import axios from "axios";

const API_ROOT_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
).replace(/\/+$/, "");

const API_V1_BASE_URL = `${API_ROOT_URL}/api/v1`;

const ADMIN_API_BASE_URL = (
  import.meta.env.VITE_ADMIN_API_BASE_URL || `${API_V1_BASE_URL}/admin`
).replace(/\/+$/, "");

// Admin-scoped keys
const ADMIN_TOKEN_KEY = "elx_admin_token";
const LEGACY_TOKEN_KEY = "token";

/**
 * Public / unauthenticated API client
 * Use for:
 * - /auth/*
 * - public API endpoints under /api/v1/*
 */
export const rootRequest = axios.create({
  baseURL: API_V1_BASE_URL,
});

/**
 * Public axios client (no auth)
 */
export const publicRequest = axios.create({
  baseURL: API_V1_BASE_URL,
});

/**
 * Protected endpoints — canonical /api/v1/*
 */
export const authRequest = axios.create({
  baseURL: API_V1_BASE_URL,
});

/**
 * Admin-only endpoints — canonical /api/v1/admin/*
 */
export const adminRequest = axios.create({
  baseURL: ADMIN_API_BASE_URL,
});

const getStoredToken = () =>
  localStorage.getItem(ADMIN_TOKEN_KEY) ||
  localStorage.getItem(LEGACY_TOKEN_KEY) ||
  "";

const attachToken = (config) => {
  const token = getStoredToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

authRequest.interceptors.request.use(attachToken, (error) =>
  Promise.reject(error),
);

adminRequest.interceptors.request.use(attachToken, (error) =>
  Promise.reject(error),
);
