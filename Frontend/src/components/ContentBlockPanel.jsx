// Frontend/src/components/ContentBlockPanel.jsx
import { useEffect, useMemo, useState } from "react";
import { API_ROOT_URL, API_V1_PREFIX } from "../requestMethods";

function buildPublicContentUrl(key) {
  const base = String(API_ROOT_URL || "").replace(/\/+$/, "");
  const prefix = String(API_V1_PREFIX || "/api/v1")
    .trim()
    .replace(/\/+$/, "");
  const k = encodeURIComponent(
    String(key || "")
      .trim()
      .toLowerCase(),
  );

  return `${base}${prefix}/content/${k}`;
}

function formatUpdated(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * ContentBlockPanel (Public)
 * - Fetches /api/v1/content/:key (public)
 * - Renders Title + Body + UpdatedAt
 * - No auth / no tokens
 *
 * Styling intent (corporate):
 * - Always visually distinct from adjacent sections (no "merged blob")
 * - Uses a subtle frame + inset highlight (rather than plain white slab)
 */
export default function ContentBlockPanel({
  contentKey,
  tone = "dark", // "dark" | "light"
  compact = false,
  titleOverride = "",
  hideTitle = false,
  className = "",
}) {
  const key = useMemo(
    () =>
      String(contentKey || "")
        .trim()
        .toLowerCase(),
    [contentKey],
  );

  const [loading, setLoading] = useState(true);
  const [block, setBlock] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoading(true);
      setError("");
      setBlock(null);

      if (!key) {
        setLoading(false);
        return;
      }

      try {
        const url = buildPublicContentUrl(key);
        const res = await fetch(url, { method: "GET" });

        if (!alive) return;

        if (res.status === 404) {
          // Missing block should not break the UI (silent corporate fallback)
          setBlock(null);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || `Request failed (${res.status})`);
        }

        const data = await res.json();
        if (!alive) return;

        setBlock(data || null);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load content.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [key]);

  // If missing block or key, render nothing (corporate: no noise)
  if (!key) return null;
  if (!loading && !block && !error) return null;

  const isDark = tone === "dark";

  // Corporate separation:
  // - light mode becomes an elevated "card" on a light background (never plain white slab)
  // - dark mode keeps a glassy panel but adds a subtle inset ring
  const shell = isDark
    ? "relative rounded-2xl border border-white/12 bg-black/25 backdrop-blur-sm shadow-[0_18px_55px_-32px_rgba(0,0,0,0.55)]"
    : "relative rounded-2xl border border-gray-200/90 bg-white shadow-[0_18px_55px_-38px_rgba(15,23,42,0.30)]";

  const titleCls = isDark ? "text-white" : "text-[#111827]";
  const bodyCls = isDark ? "text-white/75" : "text-gray-700";
  const metaCls = isDark ? "text-white/55" : "text-gray-500";

  const pad = compact ? "px-4 py-4" : "px-5 py-5 md:px-6 md:py-6";

  const title = titleOverride || block?.title || "";
  const updatedText = formatUpdated(block?.updatedAt);

  return (
    <div className={`${shell} ${pad} ${className}`}>
      {/* Subtle inset highlight to prevent "flat slab" merging */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-2xl ${
          isDark ? "ring-1 ring-white/8" : "ring-1 ring-black/5"
        }`}
        aria-hidden="true"
      />

      {/* Top accent bar (slimmer + refined) */}
      <div
        className={`h-[3px] w-full rounded-full mb-4 ${
          isDark ? "bg-[#FFA500]/75" : "bg-[#FFA500]"
        }`}
        aria-hidden="true"
      />

      {loading ? (
        <div className={metaCls}>
          <p className="text-[11px] uppercase tracking-[0.22em] font-semibold">
            Loading update…
          </p>
          <div className="mt-3 space-y-2">
            <div
              className={`h-3 w-2/3 rounded ${
                isDark ? "bg-white/10" : "bg-gray-100"
              }`}
            />
            <div
              className={`h-3 w-full rounded ${
                isDark ? "bg-white/10" : "bg-gray-100"
              }`}
            />
            <div
              className={`h-3 w-5/6 rounded ${
                isDark ? "bg-white/10" : "bg-gray-100"
              }`}
            />
          </div>
        </div>
      ) : error ? (
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-red-300">
            Update unavailable
          </p>
          <p className={`mt-2 text-sm ${bodyCls}`}>
            We couldn’t load the latest update right now.
          </p>
        </div>
      ) : (
        <>
          {!hideTitle && title ? (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p
                  className={`text-sm md:text-[15px] font-semibold ${titleCls}`}
                >
                  {title}
                </p>
                {updatedText ? (
                  <p
                    className={`mt-1 text-[11px] uppercase tracking-[0.18em] ${metaCls}`}
                  >
                    Updated {updatedText}
                  </p>
                ) : null}
              </div>

              <span
                className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                  isDark
                    ? "bg-white/5 border border-white/10 text-white/70"
                    : "bg-gray-50 border border-gray-200 text-gray-600"
                }`}
              >
                Live
              </span>
            </div>
          ) : null}

          {block?.body ? (
            <div
              className={`mt-3 text-sm leading-relaxed whitespace-pre-line ${bodyCls}`}
            >
              {block.body}
            </div>
          ) : (
            <p className={`mt-3 text-sm ${bodyCls}`}>
              No details provided yet.
            </p>
          )}
        </>
      )}
    </div>
  );
}
