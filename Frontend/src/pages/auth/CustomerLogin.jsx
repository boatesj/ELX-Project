import { useMemo, useState } from "react";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";

const CustomerLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [status, setStatus] = useState({ loading: false, error: "" });

  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(
    () => location.state?.from || "/myshipments",
    [location]
  );

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const onChange = (key) => (e) => {
    const value = key === "remember" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    if (status.error) setStatus((s) => ({ ...s, error: "" }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Minimal client-side validation (production-safe, not overbearing)
    if (!form.email.trim() || !form.password.trim()) {
      setStatus({ loading: false, error: "Please enter email and password." });
      return;
    }

    setStatus({ loading: true, error: "" });

    try {
      // ✅ Placeholder "original" login flow:
      // Replace this block with your real API call when backend auth is ready.
      // Example later:
      // const data = await loginCustomer({ email: form.email, password: form.password });
      // login({ token: data.token, user: data.user });
      await new Promise((r) => setTimeout(r, 500));

      // Simulate session token for now (keeps ProtectedRoute plan consistent later)
      const token = "dev-token";
      const user = { email: form.email };

      if (form.remember) {
        localStorage.setItem("elx_token", token);
        localStorage.setItem("elx_user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("elx_token", token);
        sessionStorage.setItem("elx_user", JSON.stringify(user));
      }

      navigate(from, { replace: true });
    } catch (err) {
      setStatus({
        loading: false,
        error: err?.message || "Login failed. Please try again.",
      });
    }
  };

  return (
    <div className="bg-[#1A2930] text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-10 py-10 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 items-center">
          {/* LEFT: Marketing / value prop */}
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

            {/* Help / contact */}
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

          {/* RIGHT: Login card */}
          <section className="w-full">
            <div className="w-full bg-white rounded-xl shadow-2xl px-7 py-8 md:px-8 md:py-10 text-[#1A2930]">
              <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">
                Sign in to your account
              </h2>

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
                  this portal and agree to Ellcworth Express&apos; terms of use
                  and privacy policy.
                </p>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
