import { useMemo, useState } from "react";
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const ResetPassword = () => {
  const { token = "" } = useParams();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState({
    loading: false,
    success: "",
    error: "",
  });

  const hasToken = useMemo(() => Boolean(token && token.trim()), [token]);

  const onChange = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    if (status.error || status.success) {
      setStatus((prev) => ({ ...prev, error: "", success: "" }));
    }
  };

  const validate = () => {
    if (!hasToken) return "This reset link is invalid or incomplete.";
    if (!form.password || !form.confirmPassword) {
      return "Please enter and confirm your new password.";
    }
    if (form.password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setStatus({ loading: false, success: "", error: validationError });
      return;
    }

    setStatus({ loading: true, success: "", error: "" });

    try {
      const resp = await fetch(
        `${API_BASE_URL}/auth/reset-password/${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: form.password }),
        },
      );

      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to reset password. The link may have expired.",
        );
      }

      setStatus({
        loading: false,
        success: "Password set successfully. Redirecting to login...",
        error: "",
      });

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            resetSuccess:
              "Your password has been set. Please sign in to continue.",
          },
        });
      }, 1200);
    } catch (err) {
      setStatus({
        loading: false,
        success: "",
        error:
          err?.message ||
          "Unable to reset password. Please request a new link.",
      });
    }
  };

  return (
    <div className="bg-[#1A2930] text-white min-h-[70vh]">
      <div className="max-w-3xl mx-auto px-4 md:px-8 lg:px-10 py-10 md:py-16">
        <div className="w-full bg-white rounded-xl shadow-2xl px-7 py-8 md:px-8 md:py-10 text-[#1A2930]">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FFA500] text-center mb-3">
            ELLCWORTH CUSTOMER PORTAL
          </p>

          <h1 className="text-xl md:text-2xl font-bold text-center mb-2">
            Set your password
          </h1>

          <p className="text-sm text-gray-600 text-center mb-6">
            Create a secure password to activate your customer portal access.
          </p>

          {!hasToken ? (
            <div className="rounded-md border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-700">
              This reset link is invalid. Please request a fresh activation
              email.
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <label className="text-sm font-semibold mb-2 block">
                  New password
                </label>
                <div className="flex items-center bg-gray-100 rounded-md px-3">
                  <FaLock className="text-[#1A2930] opacity-70 text-sm" />
                  <input
                    value={form.password}
                    onChange={onChange("password")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    className="w-full bg-transparent outline-none px-3 py-3 text-sm md:text-base placeholder-gray-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-[#1A2930] opacity-70 hover:opacity-100 text-sm md:text-base"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-semibold mb-2 block">
                  Confirm new password
                </label>
                <div className="flex items-center bg-gray-100 rounded-md px-3">
                  <FaLock className="text-[#1A2930] opacity-70 text-sm" />
                  <input
                    value={form.confirmPassword}
                    onChange={onChange("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    className="w-full bg-transparent outline-none px-3 py-3 text-sm md:text-base placeholder-gray-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="text-[#1A2930] opacity-70 hover:opacity-100 text-sm md:text-base"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {status.error ? (
                <div className="mb-4 rounded-md border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                  {status.error}
                </div>
              ) : null}

              {status.success ? (
                <div className="mb-4 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 flex items-start gap-2">
                  <FaCheckCircle className="mt-0.5" />
                  <span>{status.success}</span>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={status.loading}
                className="w-full bg-[#FFA500] text-[#1A2930] py-3 rounded-md font-semibold hover:bg-[#ffb733] transition shadow-md text-sm md:text-base disabled:opacity-60"
              >
                {status.loading ? "Setting password..." : "Set password"}
              </button>

              <div className="mt-5 text-center">
                <Link
                  to="/login"
                  className="text-sm text-[#FFA500] hover:text-[#ffb733] transition"
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
