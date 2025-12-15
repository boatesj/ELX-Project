import axios from "axios";

const BASE_URL = "http://localhost:8000"; // backend root

// For login, register, public stuff
export const publicRequest = axios.create({
  baseURL: BASE_URL,
});

// For protected endpoints (shipments, users, dashboard)
export const authRequest = axios.create({
  baseURL: BASE_URL,
});

authRequest.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
