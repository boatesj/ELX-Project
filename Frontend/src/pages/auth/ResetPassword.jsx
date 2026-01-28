import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

function getApiBase() {
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
}

export default function ResetPassword() {
  const { token } = useParams();

  const apiBase = useMemo(() => getApiBase().replace(/\/+$/, ""), []);
  const endpoint = `${apiBase}/api/v1/auth/reset-password/${token}`;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing. Please request a new link.");
      return;
    }
    if (password.length < 8) {
      setError("Please use a password of at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          "Password reset failed. The link may be invalid or expired.";
        throw new Error(msg);
      }

      setSuccess(true);
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full px-4 py-10">
      {/* Center + hard width clamp (inline style beats any global CSS) */}
      <div className="mx-auto w-full" style={{ maxWidth: "420px" }}>
        {/* Panel wrapper so it looks correct on the dark RootLayout background */}
        <div className="rounded-3xl border border-white/10 bg-white shadow-lg">
          <div className="px-6 pt-7 pb-6">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-orange-600">
              ELLCWORTH EXPRESS
            </p>
            <h1 className="mt-2 text-xl font-semibold text-gray-900">
              Set your password
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              To complete your registration and secure your account, set a
              password below.
            </p>

            {success ? (
              <>
                <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  Password set successfully. You can now log in.
                </div>

                <Link
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black"
                  to="/login"
                >
                  Continue to login
                </Link>

                <Link
                  className="mt-3 block text-center text-sm text-gray-600 underline"
                  to="/"
                >
                  Back to home
                </Link>
              </>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {error}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                    Choose a strong password (8+ characters).
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-800">
                    New password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={submitting}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={submitting}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
                >
                  {submitting ? "Setting password…" : "Set password"}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <Link className="text-gray-600 underline" to="/">
                    Home
                  </Link>
                  <Link className="text-gray-600 underline" to="/login">
                    Login
                  </Link>
                </div>
              </form>
            )}

            <p className="mt-6 text-xs text-gray-500">
              If your link has expired, request a new welcome link from support.
            </p>
          </div>
        </div>

        {/* Small note outside card to match dark shell, no debug data */}
        <p className="mt-4 text-center text-xs text-white/60">
          Need help? Contact support.
        </p>
      </div>
    </div>
  );
}
