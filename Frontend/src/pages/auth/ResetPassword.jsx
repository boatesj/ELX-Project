import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

function getApiBase() {
  // Prefer env var if present; fallback to local backend dev port.
  // Adjust VITE_API_BASE_URL later if your project already standardises it.
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
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">
        Set your password
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Use the form below to complete your registration. If your link has
        expired, request a new one.
      </p>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {success ? (
          <>
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              Password set successfully. You can now log in.
            </div>
            <div className="mt-4">
              <Link className="text-sm font-medium underline" to="/login">
                Go to login
              </Link>
            </div>
          </>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            ) : null}

            <div>
              <label className="block text-sm font-medium">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={submitting}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={submitting}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-black px-4 py-2 text-white disabled:opacity-60"
            >
              {submitting ? "Setting password…" : "Set password"}
            </button>

            <div className="text-center">
              <Link className="text-sm text-gray-600 underline" to="/">
                Back to home
              </Link>
            </div>
          </form>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Dev note: API endpoint used:{" "}
        <span className="break-all">{endpoint}</span>
      </p>
    </div>
  );
}
