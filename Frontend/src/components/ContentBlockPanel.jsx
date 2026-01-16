import { useEffect, useMemo, useState } from "react";

function buildApiUrl(path) {
  const origin = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
  const prefixRaw = import.meta.env.VITE_API_PREFIX || "/api/v1";
  const prefix = String(prefixRaw || "/api/v1")
    .trim()
    .replace(/\/+$/, "");
  const p = String(path || "").startsWith("/") ? path : `/${path}`;

  // If VITE_API_URL is missing, fall back to relative (useful in some proxy setups)
  if (!origin) return `${prefix}${p}`;
  return `${origin}${prefix}${p}`;
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
    [contentKey]
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
        const url = buildApiUrl(`/content/${encodeURIComponent(key)}`);
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

  const shell = isDark
    ? "rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm"
    : "rounded-2xl border border-gray-200 bg-white";

  const titleCls = isDark ? "text-white" : "text-[#111827]";
  const bodyCls = isDark ? "text-white/75" : "text-gray-700";
  const metaCls = isDark ? "text-white/55" : "text-gray-500";

  const pad = compact ? "px-4 py-4" : "px-5 py-5 md:px-6 md:py-6";

  const title = titleOverride || block?.title || "";
  const updatedText = formatUpdated(block?.updatedAt);

  return (
    <div className={`${shell} ${pad} ${className}`}>
      {/* Top accent bar */}
      <div
        className={`h-1 w-full rounded-full mb-4 ${
          isDark ? "bg-[#FFA500]/70" : "bg-[#FFA500]"
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
              className={`h-3 w-2/3 rounded bg-white/10 ${
                !isDark ? "bg-gray-100" : ""
              }`}
            />
            <div
              className={`h-3 w-full rounded bg-white/10 ${
                !isDark ? "bg-gray-100" : ""
              }`}
            />
            <div
              className={`h-3 w-5/6 rounded bg-white/10 ${
                !isDark ? "bg-gray-100" : ""
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
