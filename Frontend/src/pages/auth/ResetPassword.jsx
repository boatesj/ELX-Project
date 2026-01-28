import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function EyeIcon({ open }) {
  return open ? (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ) : (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12s3.5-7 9-7c2.2 0 4.1.7 5.6 1.6" />
      <path d="M21 12s-3.5 7-9 7c-2.2 0-4.1-.7-5.6-1.6" />
      <path d="M3 3l18 18" />
      <path d="M10.2 10.2a3 3 0 004.2 4.2" />
    </svg>
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const API_BASE = useMemo(() => import.meta.env.VITE_API_BASE_URL || "", []);

  // IMPORTANT: Your Frontend login route is /login (not /auth/login)
  const LOGIN_ROUTE = "/login";

  useEffect(() => {
    setError("");
    setSuccessMsg("");
  }, [newPassword, confirmPassword]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!token) {
      setError(
        "Reset link is missing or invalid. Please request a new password reset.",
      );
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please complete both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-check both entries.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/auth/reset-password/${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: newPassword }),
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          "Unable to reset password. Please request a new reset link or contact support.";
        throw new Error(msg);
      }

      setSuccessMsg(
        "Password updated successfully. You can now sign in with your new password.",
      );
      navigate(LOGIN_ROUTE, { replace: true });
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const ToggleIconButton = ({
    pressed,
    onClick,
    controlsId,
    labelShow,
    labelHide,
  }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        className="absolute inset-y-0 right-2 my-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
        aria-pressed={pressed}
        aria-label={pressed ? labelHide : labelShow}
        aria-controls={controlsId}
      >
        <EyeIcon open={pressed} />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mx-auto w-full max-w-[380px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h1 className="text-lg font-semibold tracking-tight text-slate-900">
                  Set a new password
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Choose a strong password you don’t use elsewhere. Need help?{" "}
                  <a
                    className="font-medium text-slate-900 underline underline-offset-4"
                    href="mailto:cs@ellcworth.com"
                  >
                    cs@ellcworth.com
                  </a>
                  .
                </p>
              </div>

              {error ? (
                <div
                  className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                  role="alert"
                  aria-live="polite"
                >
                  {error}
                </div>
              ) : null}

              {successMsg ? (
                <div
                  className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                  role="status"
                  aria-live="polite"
                >
                  {successMsg}
                </div>
              ) : null}

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-1 block text-sm font-medium text-slate-900"
                  >
                    New password
                  </label>

                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNew ? "text" : "password"}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pr-12 text-slate-900 shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      placeholder="Enter a new password"
                      required
                    />

                    <ToggleIconButton
                      pressed={showNew}
                      onClick={() => setShowNew((v) => !v)}
                      controlsId="newPassword"
                      labelShow="Show new password"
                      labelHide="Hide new password"
                    />
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Tip: 12+ characters is recommended.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1 block text-sm font-medium text-slate-900"
                  >
                    Confirm password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pr-12 text-slate-900 shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      placeholder="Re-enter your new password"
                      required
                    />

                    <ToggleIconButton
                      pressed={showConfirm}
                      onClick={() => setShowConfirm((v) => !v)}
                      controlsId="confirmPassword"
                      labelShow="Show confirm password"
                      labelHide="Hide confirm password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Updating…" : "Update password"}
                </button>

                <div className="pt-2 text-center text-sm text-slate-600">
                  Remembered it?{" "}
                  <Link
                    className="font-medium text-slate-900 underline underline-offset-4"
                    to={LOGIN_ROUTE}
                  >
                    Back to sign in
                  </Link>
                </div>
              </form>
            </div>

            <div className="mt-6 text-center text-xs text-slate-500">
              Need help? Email{" "}
              <a
                className="font-medium text-slate-900 underline underline-offset-4"
                href="mailto:cs@ellcworth.com"
              >
                cs@ellcworth.com
              </a>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
