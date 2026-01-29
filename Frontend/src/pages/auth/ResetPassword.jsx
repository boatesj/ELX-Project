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

const Pill = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-elx-paper/15 bg-elx-paper/5 px-3 py-1 text-[11px] font-semibold text-elx-paper/70 tracking-[0.14em] uppercase">
    {children}
  </span>
);

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
  const AUTH_BASE = "/auth"; // Backend mounts auth at /auth
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
        `${API_BASE}${AUTH_BASE}/reset-password/${encodeURIComponent(token)}`,
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
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="
        absolute inset-y-0 right-2 my-auto inline-flex h-9 w-9 items-center justify-center
        rounded-lg text-elx-neutral
        hover:bg-black/5 hover:text-elx-deep
        focus:outline-none focus-visible:ring-2 focus-visible:ring-elx-accent/40
      "
      aria-pressed={pressed}
      aria-label={pressed ? labelHide : labelShow}
      aria-controls={controlsId}
    >
      <EyeIcon open={pressed} />
    </button>
  );

  return (
    <div className="min-h-screen bg-elx-deep">
      {/* Modern corporate background: orange glow + subtle texture, no blue tint overlays */}
      <div className="relative min-h-screen overflow-hidden">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,165,0,0.28), rgba(255,165,0,0) 60%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-28 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(154,158,171,0.18), rgba(154,158,171,0) 60%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_1px_1px,rgba(237,236,236,0.12)_1px,transparent_0)] [background-size:18px_18px]" />

        <div className="relative mx-auto flex min-h-screen w-full items-center justify-center px-4 py-12">
          {/* Tight clamp (never takes over the page) */}
          <div className="w-full max-w-[420px]">
            {/* Brand marker */}
            <div className="mb-5 flex items-center justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-elx-paper/10 bg-elx-paper/5 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-elx-paper/70">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-elx-accent"
                />
                Ellcworth Express
              </div>
            </div>

            {/* Clear card (solid, readable) */}
            <div className="rounded-3xl border border-elx-paper/10 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
              {/* Accent bar */}
              <div className="h-1.5 w-full rounded-t-3xl bg-gradient-to-r from-elx-accent to-elx-deep" />

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap gap-2">
                  <Pill>Secure reset</Pill>
                  <Pill>Control tower standards</Pill>
                </div>

                <h1 className="mt-4 text-xl font-semibold tracking-tight text-elx-deep">
                  Set a new password
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-elx-plum">
                  Enter and confirm your new password. If you need help, email{" "}
                  <a
                    className="font-semibold text-elx-deep underline underline-offset-4 hover:opacity-90"
                    href="mailto:cs@ellcworth.com"
                  >
                    cs@ellcworth.com
                  </a>
                  .
                </p>

                {error ? (
                  <div
                    className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
                    role="alert"
                    aria-live="polite"
                  >
                    {error}
                  </div>
                ) : null}

                {successMsg ? (
                  <div
                    className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
                    role="status"
                    aria-live="polite"
                  >
                    {successMsg}
                  </div>
                ) : null}

                <form onSubmit={onSubmit} className="mt-5 space-y-4">
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="mb-1 block text-sm font-medium text-elx-deep"
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
                        className="block w-full rounded-2xl border border-elx-neutral/40 bg-white px-3 py-2 pr-12 text-elx-deep shadow-sm outline-none transition focus:border-elx-accent/60 focus:ring-2 focus:ring-elx-accent/20"
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

                    <p className="mt-1 text-xs text-elx-neutral">
                      Tip: 12+ characters is recommended.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-1 block text-sm font-medium text-elx-deep"
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
                        className="block w-full rounded-2xl border border-elx-neutral/40 bg-white px-3 py-2 pr-12 text-elx-deep shadow-sm outline-none transition focus:border-elx-accent/60 focus:ring-2 focus:ring-elx-accent/20"
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
                    className="mt-1 inline-flex w-full items-center justify-center rounded-2xl bg-elx-accent px-4 py-3 text-sm font-semibold tracking-[0.06em] text-elx-deep shadow-[0_18px_50px_-28px_rgba(255,165,0,0.75)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Updating…" : "Update password"}
                  </button>

                  <div className="pt-2 text-center text-sm text-elx-plum">
                    Remembered it?{" "}
                    <Link
                      className="font-semibold text-elx-deep underline underline-offset-4 hover:opacity-90"
                      to={LOGIN_ROUTE}
                    >
                      Back to sign in
                    </Link>
                  </div>
                </form>

                {/* Marketing nudge (subtle, on-brand, not distracting) */}
                <div className="mt-6 rounded-2xl border border-elx-neutral/25 bg-elx-paper px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-elx-neutral">
                    Ready to ship?
                  </p>
                  <p className="mt-2 text-sm text-elx-plum">
                    Explore services built for real-world export: clear
                    milestones, careful handling, faster decisions.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                      to="/services"
                      className="inline-flex items-center justify-center rounded-full border border-elx-neutral/30 bg-white px-4 py-2 text-sm font-semibold text-elx-deep hover:opacity-95 transition"
                    >
                      View services
                    </Link>
                    <Link
                      to="/#booking"
                      className="inline-flex items-center justify-center rounded-full border border-elx-accent/60 px-4 py-2 text-sm font-semibold text-elx-deep hover:bg-elx-accent/15 transition"
                    >
                      Start a booking
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs font-semibold tracking-[0.18em] text-elx-accent">
              Ellcworth Express · Built for reliable export operations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
