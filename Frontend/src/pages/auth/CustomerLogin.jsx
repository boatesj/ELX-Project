import { useMemo, useState, useEffect } from "react";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaPhoneAlt,
  FaEnvelope,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";

/**
 * ✅ Customer-only keys (prevents Admin portal collisions)
 */
const CUSTOMER_SESSION_KEY = "elx_customer_session_v1";
const CUSTOMER_TOKEN_KEY = "elx_customer_token";
const CUSTOMER_USER_KEY = "elx_customer_user";

/**
 * ✅ Customer login UX key (email only)
 * - This is what "Remember me on this device" should remember.
 * - NavbarCustomer "Clear remembered login" should remove this key too.
 */
const CUSTOMER_REMEMBER_EMAIL_KEY = "elx_customer_login_email_v1";

function clearCustomerAuth() {
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_USER_KEY);
  sessionStorage.removeItem(CUSTOMER_TOKEN_KEY);
  sessionStorage.removeItem(CUSTOMER_USER_KEY);
}

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCustomerSession({ remember, token, user }) {
  const session = {
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

function readCustomerSession() {
  const token =
    localStorage.getItem(CUSTOMER_TOKEN_KEY) ||
    sessionStorage.getItem(CUSTOMER_TOKEN_KEY);

  const session = readJson(CUSTOMER_SESSION_KEY);

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

  let user = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }
  if (!user && session?.user) user = session.user;

  return { token: token || null, user, session };
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const CUSTOMER_LOGIN_URL = `${API_BASE_URL}/auth/customer/login`;

const CustomerLogin = () => {
  const [showPassword, setShowPassword] = useState(false);

  // Prefill email only from customer remember key (NOT from any admin portal keys)
  const rememberedEmailRaw = useMemo(() => {
    const v = localStorage.getItem(CUSTOMER_REMEMBER_EMAIL_KEY);
    return typeof v === "string" ? v : "";
  }, []);

  const [form, setForm] = useState(() => ({
    email: rememberedEmailRaw || "",
    password: "",
    // If we have a remembered email, assume remember=true by default.
    remember: Boolean(rememberedEmailRaw) || true,
  }));

  const [status, setStatus] = useState({ loading: false, error: "" });

  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => {
    const raw = location.state?.from;
    if (!raw) return "/myshipments";
    if (typeof raw === "string") return raw;
    if (typeof raw === "object" && raw?.pathname) return raw.pathname;
    return "/myshipments";
  }, [location.state]);

  const [existing, setExisting] = useState(() => readCustomerSession());

  useEffect(() => {
    const onStorage = () => setExisting(readCustomerSession());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const alreadySignedIn =
    Boolean(existing.token) &&
    existing.user != null &&
    (existing.user?.role === "customer" || existing.user?.role === "user");

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const onChange = (key) => (e) => {
    const value = key === "remember" ? e.target.checked : e.target.value;

    setForm((prev) => {
      const next = { ...prev, [key]: value };

      // If user unchecks "remember", also remove stored email (device clean)
      if (key === "remember" && value === false) {
        localStorage.removeItem(CUSTOMER_REMEMBER_EMAIL_KEY);
      }

      // If remember is true and they are typing email, persist it (best UX)
      if (key === "email") {
        const cleaned = String(value || "")
          .trim()
          .toLowerCase();
        if (next.remember) {
          if (cleaned)
            localStorage.setItem(CUSTOMER_REMEMBER_EMAIL_KEY, cleaned);
          else localStorage.removeItem(CUSTOMER_REMEMBER_EMAIL_KEY);
        }
      }

      return next;
    });

    if (status.error) setStatus((s) => ({ ...s, error: "" }));
  };

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const onSubmit = async (e) => {
    e.preventDefault();

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      setStatus({ loading: false, error: "Please enter email and password." });
      return;
    }

    if (!isValidEmail(email)) {
      setStatus({
        loading: false,
        error: "Please enter a valid email address.",
      });
      return;
    }

    setStatus({ loading: true, error: "" });

    try {
      // Always overwrite stale customer sessions before writing new one
      clearCustomerAuth();

      const resp = await fetch(CUSTOMER_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        const msg =
          data?.message ||
          data?.error ||
          "Login failed. Please check your credentials.";
        throw new Error(msg);
      }

      if (!data?.ok || !data?.token || !data?.user) {
        throw new Error("Unexpected login response from server.");
      }

      // Enforce: customer portal must NEVER accept admin user
      const role = String(data.user.role || "").toLowerCase();
      if (role === "admin") {
        throw new Error("This account must sign in via the Admin portal.");
      }

      // ✅ Persist remembered email only if remember is checked
      if (form.remember) {
        localStorage.setItem(CUSTOMER_REMEMBER_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(CUSTOMER_REMEMBER_EMAIL_KEY);
      }

      writeCustomerSession({
        remember: form.remember,
        token: data.token,
        user: data.user,
      });

      setExisting({
        token: data.token,
        user: data.user,
        session: readJson(CUSTOMER_SESSION_KEY),
      });

      navigate(from, { replace: true });
    } catch (err) {
      setStatus({
        loading: false,
        error: err?.message || "Login failed. Please try again.",
      });
    } finally {
      setStatus((s) => ({ ...s, loading: false }));
    }
  };

  const handleContinue = () => {
    const current = readCustomerSession();
    const ok =
      Boolean(current.token) &&
      (String(current.user?.role || "").toLowerCase() === "customer" ||
        String(current.user?.role || "").toLowerCase() === "user");

    if (!ok) {
      clearCustomerAuth();
      setExisting(readCustomerSession());
      setStatus({
        loading: false,
        error:
          "Your session is not valid for the customer portal. Please sign in.",
      });
      return;
    }

    navigate(from, { replace: true });
  };

  const handleSignOut = () => {
    clearCustomerAuth();
    setExisting(readCustomerSession());
    setForm((prev) => ({
      email: prev.remember ? prev.email : "",
      password: "",
      remember: prev.remember,
    }));
    setStatus({ loading: false, error: "" });
  };

  const signedInEmail = existing.user?.email || "your account";

  return (
    <div className="bg-[#1A2930] text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-10 py-10 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 items-center">
          {/* LEFT */}
          <section className="space-y-6">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FFA500]">
              ELLCWORTH CUSTOMER PORTAL
            </p>

            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight uppercase">
              Manage your{" "}
              <span className="text-[#FFA500]">shipments and documents</span> in
              one secure place.
            </h1>

            <p className="text-sm md:text-base text-gray-200 max-w-xl">
              Sign in to track RoRo and container shipments, view secure
              documents, and stay ahead of every milestone—from booking to
              delivery.
            </p>

            <ul className="space-y-3 text-sm md:text-base">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="mt-0.5 text-[#FFA500]" />
                <span>
                  Real-time visibility on shipments and key milestones.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="mt-0.5 text-[#FFA500]" />
                <span>
                  Secure handling of time-sensitive documents for institutions
                  and corporate clients.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="mt-0.5 text-[#FFA500]" />
                <span>
                  Clear communication on ETAs, port cut-offs and delivery
                  status.
                </span>
              </li>
            </ul>

            <div className="flex items-center gap-3 text-xs md:text-sm text-gray-300">
              <FaLock className="text-[#FFA500]" />
              <span>
                Secure login. Your details are encrypted and handled in line
                with our data protection policy.
              </span>
            </div>

            <div className="pt-3 border-t border-white/10 text-xs md:text-sm space-y-2">
              <p className="text-gray-300">Need help accessing your account?</p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="tel:+442089796054"
                  className="inline-flex items-center gap-2 text-[#FFA500] hover:text-[#ffb733] transition"
                >
                  <FaPhoneAlt className="text-xs" />
                  <span>+44 20 8979 6054</span>
                </a>
                <a
                  href="mailto:cs@ellcworth.com"
                  className="inline-flex items-center gap-2 text-[#FFA500] hover:text-[#ffb733] transition"
                >
                  <FaEnvelope className="text-xs" />
                  <span>cs@ellcworth.com</span>
                </a>
              </div>
            </div>
          </section>

          {/* RIGHT */}
          <section className="w-full">
            <div className="w-full bg-white rounded-xl shadow-2xl px-7 py-8 md:px-8 md:py-10 text-[#1A2930]">
              <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">
                Sign in to your account
              </h2>

              {alreadySignedIn ? (
                <div className="space-y-4">
                  <div className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800">
                    You’re already signed in as{" "}
                    <span className="font-semibold">{signedInEmail}</span>.
                  </div>

                  <button
                    type="button"
                    onClick={handleContinue}
                    className="w-full bg-[#FFA500] text-[#1A2930] py-3 rounded-md font-semibold hover:bg-[#ffb733] transition shadow-md"
                  >
                    Continue
                  </button>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full border border-[#9A9EAB]/60 text-[#1A2930] py-3 rounded-md font-semibold hover:border-[#BF2918] hover:text-[#BF2918] transition flex items-center justify-center gap-2"
                  >
                    <FaSignOutAlt />
                    Sign out and use another account
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit}>
                  {/* Email */}
                  <div className="mb-5">
                    <label className="text-sm font-semibold mb-2 block">
                      Email address
                    </label>
                    <div className="flex items-center bg-gray-100 rounded-md px-3">
                      <FaEnvelope className="text-[#1A2930] opacity-70 text-sm" />
                      <input
                        value={form.email}
                        onChange={onChange("email")}
                        type="email"
                        autoComplete="email"
                        placeholder="name@company.com"
                        className="w-full bg-transparent outline-none px-3 py-3 text-sm md:text-base placeholder-gray-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <label className="text-sm font-semibold mb-2 block">
                      Password
                    </label>
                    <div className="flex items-center bg-gray-100 rounded-md px-3">
                      <FaLock className="text-[#1A2930] opacity-70 text-sm" />
                      <input
                        value={form.password}
                        onChange={onChange("password")}
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className="w-full bg-transparent outline-none px-3 py-3 text-sm md:text-base placeholder-gray-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleTogglePassword}
                        className="text-[#1A2930] opacity-70 hover:opacity-100 text-sm md:text-base"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {/* Remember + Forgot */}
                  <div className="flex items-center justify-between mb-4 text-xs md:text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        checked={form.remember}
                        onChange={onChange("remember")}
                        type="checkbox"
                        className="accent-[#FFA500] h-4 w-4"
                      />
                      <span>Remember me on this device</span>
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-[#FFA500] hover:text-[#ffb733] transition"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {status.error ? (
                    <div className="mb-4 rounded-md border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                      {status.error}
                    </div>
                  ) : null}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status.loading}
                    className="
                      w-full
                      bg-[#FFA500]
                      text-[#1A2930]
                      py-3
                      rounded-md
                      font-semibold
                      tracking-wide
                      hover:bg-[#ffb733]
                      transition
                      shadow-md
                      text-sm md:text-base
                      disabled:opacity-60
                    "
                  >
                    {status.loading ? "Signing in..." : "Sign in"}
                  </button>

                  <p className="mt-4 text-[11px] md:text-xs text-gray-500 text-center leading-relaxed">
                    By signing in you confirm that you are authorised to access
                    this portal and agree to Ellcworth Express&apos; terms of
                    use and privacy policy.
                  </p>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
