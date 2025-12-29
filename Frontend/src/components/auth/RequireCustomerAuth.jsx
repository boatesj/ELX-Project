import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ✅ Customer-only keys (must match CustomerLogin.jsx)
const CUSTOMER_SESSION_KEY = "elx_customer_session_v1";
const CUSTOMER_TOKEN_KEY = "elx_customer_token";
const CUSTOMER_USER_KEY = "elx_customer_user";

// ✅ Single source of truth: allowed roles for customer portal
const ALLOWED_CUSTOMER_ROLES = new Set(["customer", "user", "shipper"]);

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

  // Expiry enforcement (customer session only)
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

  // Fail closed: if no token or no user
  if (!token || !user) return { token: null, user: null };

  // Role enforcement: customer portal must never accept admin
  const role = String(user?.role || "").toLowerCase();
  if (role === "admin") {
    clearCustomerAuth();
    return { token: null, user: null };
  }

  // Role allowlist enforcement
  if (!ALLOWED_CUSTOMER_ROLES.has(role)) {
    clearCustomerAuth();
    return { token: null, user: null };
  }

  return { token, user };
}

export default function RequireCustomerAuth({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [auth, setAuth] = useState(() => readCustomerAuth());

  // Keep auth in sync (multi-tab logout/login)
  useEffect(() => {
    const onStorage = () => setAuth(readCustomerAuth());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isAllowed = useMemo(() => Boolean(auth?.token && auth?.user), [auth]);

  useEffect(() => {
    const current = readCustomerAuth();
    setAuth(current);

    if (!current.token || !current.user) {
      navigate("/login", {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [navigate, location.pathname]);

  if (!isAllowed) return null;

  return children;
}
