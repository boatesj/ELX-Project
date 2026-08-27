"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/app/lib/customerAuth";

type LoadState = "loading" | "ready" | "used" | "not-found" | "submitted" | "error";

interface FeedbackContext {
  clientName: string;
  organisation: string;
  context: string;
}

export default function FeedbackPage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<LoadState>("loading");
  const [data, setData] = useState<FeedbackContext | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [rating, setRating] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [timeliness, setTimeliness] = useState<"Yes" | "Mostly" | "No" | "">("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [recommendReason, setRecommendReason] = useState("");
  const [improvementNote, setImprovementNote] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/feedback/${token}`)
      .then(async (res) => {
        if (res.status === 404) return setState("not-found");
        if (res.status === 410) return setState("used");
        if (!res.ok) return setState("error");
        const json = await res.json();
        setData(json);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!rating || !communication || !timeliness || wouldRecommend === null) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/feedback/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          communication,
          timeliness,
          wouldRecommend,
          recommendReason,
          improvementNote,
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      setState("submitted");
    } catch {
      setState("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (state === "loading") return <CenteredMessage>Loading…</CenteredMessage>;
  if (state === "not-found") return <CenteredMessage>We couldn&rsquo;t find this feedback link.</CenteredMessage>;
  if (state === "used")
    return <CenteredMessage>This link has already been used — thank you for your feedback.</CenteredMessage>;
  if (state === "error") return <CenteredMessage>Something went wrong. Please try again shortly.</CenteredMessage>;
  if (state === "submitted") {
    return (
      <CenteredMessage>
        Thank you{data?.clientName ? `, ${data.clientName}` : ""} — we&rsquo;ve received your feedback and
        genuinely appreciate it.
      </CenteredMessage>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-[#111827]">How did we do?</h1>
      <p className="mt-2 text-gray-600">
        {data?.organisation ? `${data.organisation} — ` : ""}
        {data?.context || "Thanks for shipping with Ellcworth Express."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <StarField label="Overall, how would you rate your experience?" value={rating} onChange={setRating} />
        <StarField label="How was our communication throughout?" value={communication} onChange={setCommunication} />

        <div>
          <label className="block text-sm font-medium text-[#111827]">
            Did your shipment arrive within the timeframe you were given?
          </label>
          <div className="mt-2 flex gap-3">
            {(["Yes", "Mostly", "No"] as const).map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => setTimeliness(opt)}
                className={`rounded-md border px-4 py-2 text-sm ${
                  timeliness === opt
                    ? "border-[#1A2930] bg-[#1A2930] text-white"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#111827]">
            Would you recommend Ellcworth Express to another institution?
          </label>
          <div className="mt-2 flex gap-3">
            {[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ].map((opt) => (
              <button
                type="button"
                key={opt.label}
                onClick={() => setWouldRecommend(opt.value)}
                className={`rounded-md border px-4 py-2 text-sm ${
                  wouldRecommend === opt.value
                    ? "border-[#1A2930] bg-[#1A2930] text-white"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <textarea
            className="mt-3 w-full rounded-md border border-gray-300 p-3 text-sm"
            rows={3}
            placeholder="Tell us why — this may be shared as a testimonial on our website, with your permission implied by submitting."
            value={recommendReason}
            onChange={(e) => setRecommendReason(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#111827]">
            Anything we could have done better? (kept private, not published)
          </label>
          <textarea
            className="mt-2 w-full rounded-md border border-gray-300 p-3 text-sm"
            rows={3}
            value={improvementNote}
            onChange={(e) => setImprovementNote(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !rating || !communication || !timeliness || wouldRecommend === null}
          className="w-full rounded-md bg-[#1A2930] py-3 text-sm font-semibold text-[#FFA500] disabled:opacity-40"
        >
          {submitting ? "Submitting…" : "Submit feedback"}
        </button>
      </form>
    </div>
  );
}

function StarField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#111827]">{label}</label>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => onChange(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className={`text-3xl leading-none ${n <= value ? "text-[#FFA500]" : "text-gray-300"}`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

function CenteredMessage({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
      <p className="text-lg text-gray-700</p>
    </div>
  );
}
