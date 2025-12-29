import { useEffect, useMemo, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";

/**
 * ✅ Customer-only keys (must match CustomerLogin.jsx)
 */
const CUSTOMER_SESSION_KEY = "elx_customer_session_v1";
const CUSTOMER_TOKEN_KEY = "elx_customer_token";
const CUSTOMER_USER_KEY = "elx_customer_user";

function safeJsonParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearCustomerAuth() {
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_USER_KEY);
  sessionStorage.removeItem(CUSTOMER_TOKEN_KEY);
  sessionStorage.removeItem(CUSTOMER_USER_KEY);
}

function readCustomerAuth() {
  const token =
    localStorage.getItem(CUSTOMER_TOKEN_KEY) ||
    sessionStorage.getItem(CUSTOMER_TOKEN_KEY);

  const session = safeJsonParse(localStorage.getItem(CUSTOMER_SESSION_KEY));

  // expiry enforcement (customer session only)
  if (session?.expiresAt) {
    const exp = new Date(session.expiresAt).getTime();
    if (!Number.isNaN(exp) && Date.now() > exp) {
      clearCustomerAuth();
      return { token: null, user: null };
    }
  }

  const userRaw =
    localStorage.getItem(CUSTOMER_USER_KEY) ||
    sessionStorage.getItem(CUSTOMER_USER_KEY);

  const user = safeJsonParse(userRaw) || session?.user || null;

  // Fail closed: if no token, treat as logged out
  if (!token) return { token: null, user: null };

  // Extra safety: customer portal must never treat admin as authenticated
  const role = String(user?.role || "").toLowerCase();
  if (role === "admin") {
    clearCustomerAuth();
    return { token: null, user: null };
  }

  return { token, user };
}

export default function RequireCustomerAuth({ children }) {
  const location = useLocation();
  const [auth, setAuth] = useState(() => readCustomerAuth());

  // keep in sync across tabs
  useEffect(() => {
    const onStorage = () => setAuth(readCustomerAuth());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // recompute on route changes (covers expiry / cleared auth mid-session)
  useEffect(() => {
    setAuth(readCustomerAuth());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const ok = useMemo(() => {
    if (!auth?.token || !auth?.user) return false;
    const role = String(auth.user.role || "").toLowerCase();
    return ["customer", "user", "shipper", "consignee"].includes(role);
  }, [auth]);

  if (!ok) {
    // Fail closed + redirect to login, preserving intended destination
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
