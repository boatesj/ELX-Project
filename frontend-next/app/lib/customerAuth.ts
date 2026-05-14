export const CUSTOMER_SESSION_KEY = "elx_customer_session_v1";
export const CUSTOMER_TOKEN_KEY = "elx_customer_token";
export const CUSTOMER_USER_KEY = "elx_customer_user";
export const CUSTOMER_REMEMBER_EMAIL_KEY = "elx_customer_login_email_v1";
export const ALLOWED_CUSTOMER_ROLES = new Set(["customer", "user", "shipper"]);
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

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

export function safeJsonParse<T = unknown>(raw: string | null): T | null {
  try {
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export interface CustomerUser {
  email?: string;
  role?: string;
  [key: string]: unknown;
}

export interface CustomerSession {
  isAuthenticated?: boolean;
  token?: string;
  user?: CustomerUser;
  createdAt?: string;
  expiresAt?: string;
}

export interface CustomerAuth {
  token: string | null;
  user: CustomerUser | null;
  session: CustomerSession | null;
}

export function readCustomerSession(): CustomerAuth {
  const token =
    localStorage.getItem(CUSTOMER_TOKEN_KEY) ||
    sessionStorage.getItem(CUSTOMER_TOKEN_KEY);

  const session = safeJsonParse<CustomerSession>(
    localStorage.getItem(CUSTOMER_SESSION_KEY)
  );

  if (session?.expiresAt) {
    const exp = new Date(session.expiresAt).getTime();
    if (!Number.isNaN(exp) && Date.now() > exp) {
      clearCustomerAuth();
      return { token: null, user: null, session: null };
    }
  }

  const userRaw =
    localStorage.getItem(CUSTOMER_USER_KEY) ||
    sessionStorage.getItem(CUSTOMER_USER_KEY);

  const user = safeJsonParse<CustomerUser>(userRaw) || session?.user || null;

  if (!token || !user) return { token: null, user: null, session: null };

  const role = String(user?.role || "").toLowerCase();

  if (role === "admin") {
    clearCustomerAuth();
    return { token: null, user: null, session: null };
  }

  if (!ALLOWED_CUSTOMER_ROLES.has(role)) {
    clearCustomerAuth();
    return { token: null, user: null, session: null };
  }

  return { token, user, session };
}

export function writeCustomerSession({
  remember,
  token,
  user,
}: {
  remember: boolean;
  token: string;
  user: CustomerUser;
}) {
  const session: CustomerSession = {
    isAuthenticated: true,
    token,
    user,
    createdAt: new Date().toISOString(),
    expiresAt: remember
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  };

  localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));

  if (remember) {
    localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
    localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user));
    sessionStorage.removeItem(CUSTOMER_TOKEN_KEY);
    sessionStorage.removeItem(CUSTOMER_USER_KEY);
  } else {
    sessionStorage.setItem(CUSTOMER_TOKEN_KEY, token);
    sessionStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user));
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_USER_KEY);
  }
}

export function readCustomerToken(): string | null {
  return (
    localStorage.getItem(CUSTOMER_TOKEN_KEY) ||
    sessionStorage.getItem(CUSTOMER_TOKEN_KEY) ||
    null
  );
}
