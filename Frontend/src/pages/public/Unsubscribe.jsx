import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email) return;
    setStatus("loading");
    fetch(`${API_BASE_URL}/api/v1/marketing/unsubscribe?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => {
        setMessage(data.message || "Unsubscribed successfully.");
        setStatus("success");
      })
      .catch(() => {
        setMessage("Something went wrong. Please try again.");
        setStatus("error");
      });
  }, [email]);

  return (
    <div className="bg-[#1A2930] min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-xl border border-[#9A9EAB]/40 px-8 py-10 max-w-md w-full text-center">

        {/* Logo / brand mark */}
        <div className="w-12 h-12 rounded-full bg-[#1A2930] flex items-center justify-center mx-auto mb-5">
          <svg className="w-6 h-6 text-[#FFA500]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        {/* No email in URL */}
        {!email && (
          <>
            <h1 className="text-xl font-semibold text-[#1A2930] mb-2">Unsubscribe</h1>
            <p className="text-sm text-slate-600 mb-6">
              No email address found in this link. Please use the unsubscribe link from your email.
            </p>
          </>
        )}

        {/* Loading */}
        {email && status === "loading" && (
          <>
            <h1 className="text-xl font-semibold text-[#1A2930] mb-2">Processing…</h1>
            <p className="text-sm text-slate-500">Please wait while we update your preferences.</p>
            <div className="mt-6 flex justify-center">
              <div className="w-6 h-6 border-2 border-[#1A2930] border-t-transparent rounded-full animate-spin" />
            </div>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-[#1A2930] mb-2">You're unsubscribed</h1>
            <p className="text-sm text-slate-600 mb-1">{email}</p>
            <p className="text-sm text-slate-500 mb-6">
              You won't receive any more marketing emails from Ellcworth Express.
              Transactional emails about your shipments will continue as normal.
            </p>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-[#1A2930] mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-600 mb-6">{message}</p>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <button className="w-full sm:w-auto px-4 py-2 rounded-full text-sm font-semibold bg-[#1A2930] text-white hover:bg-[#FFA500] hover:text-[#1A2930] transition">
              Back to Home
            </button>
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-6">
          Changed your mind?{" "}
          <a href="mailto:cs@ellcworth.com" className="text-[#FFA500] hover:underline">
            Contact us
          </a>{" "}
          to resubscribe.
        </p>

      </div>
    </div>
  );
}

export default Unsubscribe;
