import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ✅ Customer-only keys (match CustomerLogin.jsx)
const CUSTOMER_TOKEN_KEY = "elx_customer_token";

export const publicRequest = axios.create({
  baseURL: API_BASE_URL,
});

export const customerAuthRequest = axios.create({
  baseURL: API_BASE_URL,
});

customerAuthRequest.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(CUSTOMER_TOKEN_KEY) ||
      sessionStorage.getItem(CUSTOMER_TOKEN_KEY);

    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);
