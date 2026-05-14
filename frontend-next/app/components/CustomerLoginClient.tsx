"use client";

import { useMemo, useState, useEffect } from "react";
import {
  FaLock, FaEye, FaEyeSlash, FaCheckCircle,
  FaPhoneAlt, FaEnvelope, FaSignOutAlt,
} from "react-icons/fa";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CUSTOMER_REMEMBER_EMAIL_KEY,
  ALLOWED_CUSTOMER_ROLES,
  CUSTOMER_SESSION_KEY,
  API_BASE_URL,
  clearCustomerAuth,
  readCustomerSession,
  writeCustomerSession,
  safeJsonParse,
  type CustomerUser,
} from "../lib/customerAuth";

const CUSTOMER_LOGIN_URL = `${API_BASE_URL}/auth/customer/login`;

export default function CustomerLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = useMemo(() => {
    const raw = searchParams.get("from");
    return raw && raw.startsWith("/") ? raw : "/myshipments";
  }, [searchParams]);

  const rememberedEmail = useMemo(() => {
    if (typeof window === "undefined") return "";
    const v = localStorage.getItem(CUSTOMER_REMEMBER_EMAIL_KEY);
    return typeof v === "string" ? v : "";
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState(() => ({
    email: rememberedEmail || "",
    password: "",
    remember: Boolean(rememberedEmail) || true,
  }));
  const [status, setStatus] = useState({ loading: false, error: "" });
  const [existing, setExisting] = useState(() => readCustomerSession());

  useEffect(() => {
    const onStorage = () => setExisting(readCustomerSession());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const alreadySignedIn = useMemo(() => {
    const role = String(existing.user?.role || "").toLowerCase();
    return Boolean(existing.token) && Boolean(existing.user) && ALLOWED_CUSTOMER_ROLES.has(role);
  }, [existing]);

  const onChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = key === "remember" ? e.target.checked : e.target.value;

    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "remember" && value === false) {
        localStorage.removeItem(CUSTOMER_REMEMBER_EMAIL_KEY);
      }

      if (key === "email") {
        const cleaned = String(value || "").trim().toLowerCase();
        if (next.remember) {
          if (cleaned) localStorage.setItem(CUSTOMER_REMEMBER_EMAIL_KEY, cleaned);
          else localStorage.removeItem(CUSTOMER_REMEMBER_EMAIL_KEY);
        }
      }

      return next;
    });

    if (status.error) setStatus((s) => ({ ...s, error: "" }));
  };

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      setStatus({ loading: false, error: "Please enter email and password." });
      return;
    }

    if (!isValidEmail(email)) {
      setStatus({ loading: false, error: "Please enter a valid email address." });
      return;
    }

    setStatus({ loading: true, error: "" });

    try {
      clearCustomerAuth();

      const resp = await fetch(CUSTOMER_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        throw new Error(data?.message || data?.error || "Login failed. Please check your credentials.");
      }

      if (!data?.ok || !data?.token || !data?.user) {
        throw new Error("Unexpected login response from server.");
      }

      const role = String(data.user.role || "").toLowerCase();

      if (role === "admin") {
        throw new Error("This account must sign in via the Admin portal.");
      }

      if (!ALLOWED_CUSTOMER_ROLES.has(role)) {
        throw new Error("This account is not authorised for the customer portal.");
      }

      if (form.remember) {
        localStorage.setItem(CUSTOMER_REMEMBER_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(CUSTOMER_REMEMBER_EMAIL_KEY);
      }

      writeCustomerSession({ remember: form.remember, token: data.token, user: data.user });

      setExisting({
        token: data.token,
        user: data.user,
        session: safeJsonParse(localStorage.getItem(CUSTOMER_SESSION_KEY)),
      });

      router.replace(from);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed. Please try again.";
      setStatus({ loading: false, error: msg });
    } finally {
      setStatus((s) => ({ ...s, loading: false }));
    }
  };

  const handleContinue = () => {
    const current = readCustomerSession();
    const role = String(current.user?.role || "").toLowerCase();
    const ok = Boolean(current.token) && Boolean(current.user) && ALLOWED_CUSTOMER_ROLES.has(role);

    if (!ok) {
      clearCustomerAuth();
      setExisting(readCustomerSession());
      setStatus({ loading: false, error: "Your session is not valid for the customer portal. Please sign in." });
      return;
    }

    router.replace(from);
  };

  const handleSignOut = () => {
    clearCustomerAuth();
    setExisting(readCustomerSession());
    setForm((prev) => ({ email: prev.remember ? prev.email : "", password: "", remember: prev.remember }));
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
              <span className="text-[#FFA500]">shipments and documents</span> in one secure place.
            </h1>
            <p className="text-sm md:text-base text-gray-200 max-w-xl">
              Sign in to track RoRo and container shipments, view secure documents, and stay ahead of every milestone — from booking to delivery.
            </p>
            <ul className="space-y-3 text-sm md:text-base">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="mt-0.5 text-[#FFA500]" />
                <span>Visibility on shipments and key milestones.</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="mt-0.5 text-[#FFA500]" />
                <span>Secure handling of time-sensitive documents.</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="mt-0.5 text-[#FFA500]" />
                <span>Clear communication on ETAs, cut-offs and delivery status.</span>
              </li>
            </ul>
            <div className="flex items-center gap-3 text-xs md:text-sm text-gray-300">
              <FaLock className="text-[#FFA500]" />
              <span>Secure login. Your details are encrypted and handled in line with our data protection policy.</span>
            </div>
            <div className="pt-3 border-t border-white/10 text-xs md:text-sm space-y-2">
              <p className="text-gray-300">Need help accessing your account?</p>
              <div className="flex flex-wrap gap-4">
                <a href="tel:+442089796054" className="inline-flex items-center gap-2 text-[#FFA500] hover:text-[#ffb733] transition">
                  <FaPhoneAlt className="text-xs" />
                  <span>+44 20 8979 6054</span>
                </a>
                <a href="mailto:cs@ellcworth.com" className="inline-flex items-center gap-2 text-[#FFA500] hover:text-[#ffb733] transition">
                  <FaEnvelope className="text-xs" />
                  <span>cs@ellcworth.com</span>
                </a>
              </div>
            </div>
          </section>

          {/* RIGHT */}
          <section className="w-full">
            <div className="w-full bg-white rounded-xl shadow-2xl px-7 py-8 md:px-8 md:py-10 text-[#1A2930]">
              <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">Sign in to your account</h2>

              {alreadySignedIn ? (
                <div className="space-y-4">
                  <div className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800">
                    You're already signed in as <span className="font-semibold">{signedInEmail}</span>.
                  </div>
                  <button type="button" onClick={handleContinue} className="w-full bg-[#FFA500] text-[#1A2930] py-3 rounded-md font-semibold hover:bg-[#ffb733] transition shadow-md">
                    Continue
                  </button>
                  <button type="button" onClick={handleSignOut} className="w-full border border-[#9A9EAB]/60 text-[#1A2930] py-3 rounded-md font-semibold hover:border-[#BF2918] hover:text-[#BF2918] transition flex items-center justify-center gap-2">
                    <FaSignOutAlt />
                    Sign out and use another account
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit}>
                  <div className="mb-5">
                    <label className="text-sm font-semibold mb-2 block">Email address</label>
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

                  <div className="mb-4">
                    <label className="text-sm font-semibold mb-2 block">Password</label>
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
                        onClick={() => setShowPassword((p) => !p)}
                        className="text-[#1A2930] opacity-70 hover:opacity-100 text-sm md:text-base"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

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
                    <a href="mailto:cs@ellcworth.com?subject=Password%20reset%20request%20(Customer%20Portal)" className="text-[#FFA500] hover:text-[#ffb733] transition">
                      Forgot password?
                    </a>
                  </div>

                  {status.error && (
                    <div className="mb-4 rounded-md border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                      {status.error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status.loading}
                    className="w-full bg-[#FFA500] text-[#1A2930] py-3 rounded-md font-semibold tracking-wide hover:bg-[#ffb733] transition shadow-md text-sm md:text-base disabled:opacity-60"
                  >
                    {status.loading ? "Signing in..." : "Sign in"}
                  </button>

                  <p className="mt-4 text-[11px] md:text-xs text-gray-500 text-center leading-relaxed">
                    By signing in you confirm that you are authorised to access this portal and agree to Ellcworth Express&apos; terms of use and privacy policy.
                  </p>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
