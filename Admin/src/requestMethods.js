import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const ADMIN_API_BASE_URL =
  import.meta.env.VITE_ADMIN_API_BASE_URL || "http://localhost:8000/admin";

// For login, register, public stuff
export const publicRequest = axios.create({
  baseURL: API_BASE_URL,
});

// For protected endpoints (shipments, users, dashboard)
export const authRequest = axios.create({
  baseURL: API_BASE_URL,
});

// For admin-only endpoints (optional; use when you add /admin routes)
export const adminRequest = axios.create({
  baseURL: ADMIN_API_BASE_URL,
});

const attachToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
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
