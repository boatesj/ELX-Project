// Frontend/src/pages/customer/ShipmentDetails.jsx

import { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTruck,
  FaFileAlt,
  FaCircle,
  FaClock,
  FaCheckCircle,
  FaDownload,
  FaEye,
  FaInfoCircle,
  FaEdit,
  FaPoundSign,
  FaPaperPlane,
  FaBoxOpen,
  FaUser,
  FaRoute,
  FaClipboardCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { customerAuthRequest, CUSTOMER_TOKEN_KEY } from "@/requestMethods";

const SHIPMENT_PATH = (id) => `/shipments/${id}`;

// Backend root for serving /uploads/*
const API_ROOT_URL_RAW =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const API_ROOT_URL = String(API_ROOT_URL_RAW || "").replace(/\/+$/, "");

/* -----------------------
   Helpers (safe pickers)
------------------------ */

const cleanStr = (v) => String(v ?? "").trim();

const firstNonEmpty = (...vals) => {
  for (const v of vals) {
    const s = cleanStr(v);
    if (s) return s;
  }
  return "";
};

const pick = (obj, paths = []) => {
  for (const p of paths) {
    const parts = String(p).split(".");
    let cur = obj;
    let ok = true;
    for (const part of parts) {
      if (!cur || typeof cur !== "object" || !(part in cur)) {
        ok = false;
        break;
      }
      cur = cur[part];
    }
    if (ok) {
      const s = cleanStr(cur);
      if (s) return s;
      if (typeof cur === "number" && Number.isFinite(cur)) return cur;
    }
  }
  return "";
};

const pickNum = (obj, paths = []) => {
  for (const p of paths) {
    const parts = String(p).split(".");
    let cur = obj;
    let ok = true;
    for (const part of parts) {
      if (!cur || typeof cur !== "object" || !(part in cur)) {
        ok = false;
        break;
      }
      cur = cur[part];
    }
    if (ok) {
      const n = Number(cur);
      if (Number.isFinite(n) && n !== 0) return n;
      if (Number.isFinite(n) && n === 0) return 0;
    }
  }
  return null;
};

function toTitleCase(s) {
  const str = String(s || "").trim();
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toDisplayDate(val) {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(val);
  }
}

function formatCurrency(amount, currency = "GBP") {
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

function canActOnDoc(doc) {
  const url = String(doc?.fileUrl || "").trim();
  return url.length > 0;
}

function getDocUrl(doc) {
  const raw = String(doc?.fileUrl || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/uploads/")) return `${API_ROOT_URL}${raw}`;
  return raw;
}

function pickShipment(payload) {
  if (payload && typeof payload === "object") {
    if (payload.data && typeof payload.data === "object") return payload.data;
    if (payload.shipment && typeof payload.shipment === "object")
      return payload.shipment;
  }
  if (payload && typeof payload === "object" && payload._id) return payload;
  return null;
}

/* -----------------------
   Normalisers (schema-safe)
------------------------ */

function normalizePackagingType(shipment) {
  const p = shipment?.cargo?.packages;

  // ✅ schema-first: packages: [{ type, quantity }]
  if (Array.isArray(p) && p.length) {
    const first = p[0];

    if (typeof first === "string") return cleanStr(first);

    if (first && typeof first === "object") {
      return firstNonEmpty(first.type, first.packageType, first.name);
    }
  }

  // sometimes saved as { type: "box" }
  if (p && typeof p === "object" && !Array.isArray(p)) {
    return firstNonEmpty(p.type, p.packageType, p.name);
  }

  // fallbacks (flat + cargo.*)
  return firstNonEmpty(
    pick(shipment, [
      "packagingType",
      "cargo.packagingType",
      "cargo.packaging",
      "cargo.packages.type", // legacy non-array shape
      "packageType",
    ]),
    shipment?.packaging,
  );
}

function normalizeDeclaredCurrency(shipment) {
  return (
    cleanStr(shipment?.cargoValue?.currency) ||
    cleanStr(shipment?.quote?.currency) ||
    "GBP"
  );
}

function parseNumberFromText(text) {
  const m = String(text || "").match(/[\d.]+/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
}

/* -----------------------
   Status + labels
------------------------ */

const getStatusClasses = (status) => {
  const s = String(status || "").toLowerCase();

  if (s === "booked") {
    return "bg-[#FFA500]/15 text-[#1A2930] border border-[#FFA500]/40";
  }
  if (
    ["at_origin_yard", "loaded", "sailed", "in transit", "in_transit"].includes(
      s,
    )
  ) {
    return "bg-[#9A9EAB]/15 text-[#1A2930] border border-[#9A9EAB]/40";
  }
  if (["arrived", "cleared", "delivered"].includes(s)) {
    return "bg-emerald-500/10 text-emerald-800 border border-emerald-500/25";
  }
  if (s === "cancelled") {
    return "bg-red-500/10 text-red-700 border border-red-500/25";
  }

  if (["quoted", "customer_requested_changes"].includes(s)) {
    return "bg-[#FFA500]/10 text-[#1A2930] border border-[#FFA500]/25";
  }
  if (s === "customer_approved") {
    return "bg-emerald-500/10 text-emerald-800 border border-emerald-500/25";
  }
  if (["request_received", "under_review"].includes(s)) {
    return "bg-[#1A2930]/5 text-[#1A2930] border border-[#1A2930]/15";
  }

  return "bg-slate-100 text-slate-700 border border-slate-200";
};

function formatCustomerStatusLabel(status) {
  const s = String(status || "pending").toLowerCase();
  switch (s) {
    case "request_received":
      return "Request received";
    case "under_review":
      return "Under review";
    case "quoted":
      return "Quotation issued";
    case "customer_requested_changes":
      return "Changes requested";
    case "customer_approved":
      return "Quotation approved";

    case "pending":
      return "Preparing booking";
    case "booked":
      return "Booking confirmed";
    case "at_origin_yard":
      return "At origin facility";
    case "loaded":
      return "Loaded";
    case "sailed":
    case "in_transit":
    case "in transit":
      return "In transit";
    case "arrived":
      return "Arrived";
    case "cleared":
      return "Customs cleared";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return s ? toTitleCase(s.replaceAll("_", " ")) : "";
  }
}

const formatModeLabel = (mode) => {
  const m = String(mode || "").toLowerCase();
  switch (m) {
    case "roro":
      return "RoRo vehicle shipment";
    case "container":
      return "Containerised sea freight";
    case "documents":
      return "Secure document shipment";
    case "air":
      return "Air freight";
    case "lcl":
      return "Less-than-container load (LCL)";
    case "pallets":
      return "Palletised freight";
    case "parcels":
      return "Parcels / small packages";
    default:
      return "Shipment";
  }
};

const statusRank = (status) => {
  const s = String(status || "").toLowerCase();
  if (["delivered"].includes(s)) return 5;
  if (["cleared"].includes(s)) return 4;
  if (["arrived"].includes(s)) return 3;
  if (["sailed", "loaded", "at_origin_yard"].includes(s)) return 2;
  if (["booked"].includes(s)) return 1;
  return 0;
};

/* -----------------------
   Tracking timeline
------------------------ */

function shouldHideCustomerEvent(rawEventText = "") {
  const t = String(rawEventText || "").toLowerCase();
  if (t.includes("mail_transport=console")) return true;
  if (t.includes("simulated")) return true;
  if (t.includes("smtp send did not return")) return true;
  return false;
}

function sanitizeEmailLeak(text) {
  return String(text || "")
    .replace(/\([^\)]*@[^)]*\)/g, "")
    .trim();
}

function translateCustomerEvent(e) {
  const rawStatus = String(e?.status || "").trim();
  const rawEvent = String(e?.event || "Update").trim();

  if (!rawEvent) return null;
  if (shouldHideCustomerEvent(rawEvent)) return null;

  const cleanEvent = sanitizeEmailLeak(rawEvent);
  const eventLower = cleanEvent.toLowerCase();

  if (eventLower.startsWith("quote sent to customer")) {
    return { label: "Quotation sent to you", badge: "Quote" };
  }
  if (eventLower.startsWith("customer assigned to shipment")) {
    return {
      label: "Your shipment has been linked to your account",
      badge: "Account",
    };
  }
  if (eventLower.startsWith("customer approved quote")) {
    return { label: "You approved the quotation", badge: "Quote" };
  }
  if (eventLower.startsWith("customer requested changes")) {
    const parts = cleanEvent.split(":");
    const msg = parts.length > 1 ? parts.slice(1).join(":").trim() : "";
    return {
      label: msg
        ? `You requested a change: ${msg}`
        : "You requested changes to the quotation",
      badge: "Quote",
    };
  }
  if (eventLower.startsWith("booking confirmed and emailed to customer")) {
    return { label: "Booking confirmed", badge: "Booking" };
  }

  const statusLower = rawStatus.toLowerCase();
  if (statusLower === "customer_approved")
    return { label: "Quotation approved", badge: "Quote" };
  if (statusLower === "customer_requested_changes")
    return { label: "Changes requested", badge: "Quote" };

  return {
    label: cleanEvent,
    badge: rawStatus ? formatCustomerStatusLabel(rawStatus) : "",
  };
}

function dedupeTimeline(items) {
  const out = [];
  const WINDOW_MS = 5 * 60 * 1000;

  for (const it of items) {
    const last = out[out.length - 1];
    if (!last) {
      out.push(it);
      continue;
    }

    const sameLabel = String(last.label) === String(it.label);
    const sameBadge = String(last.badge || "") === String(it.badge || "");
    const lastTs = last._ts || 0;
    const itTs = it._ts || 0;

    if (
      sameLabel &&
      sameBadge &&
      itTs &&
      lastTs &&
      itTs - lastTs <= WINDOW_MS
    ) {
      out[out.length - 1] = it;
      continue;
    }

    out.push(it);
  }

  return out;
}

function buildTimeline(shipment) {
  const raw = Array.isArray(shipment?.trackingEvents)
    ? shipment.trackingEvents
    : [];

  if (raw.length) {
    const sorted = [...raw].sort((a, b) => {
      const ad = new Date(a?.date || 0).getTime();
      const bd = new Date(b?.date || 0).getTime();
      return ad - bd;
    });

    const translated = sorted
      .map((e, idx) => {
        const ts = new Date(e?.date || 0).getTime();
        const t = translateCustomerEvent(e);
        if (!t) return null;

        return {
          id: `${shipment?._id || shipment?.id}-t-${idx}`,
          label: String(t.label || "").trim(),
          location: String(e?.location || ""),
          at: e?.date ? toDisplayDate(e.date) : "",
          state: "done",
          badge: String(t.badge || "").trim(),
          _ts: ts || 0,
        };
      })
      .filter(Boolean);

    const compact = dedupeTimeline(translated).filter(
      (e) => String(e.label || "").trim().length > 0,
    );
    if (!compact.length) return [];

    return compact.map((e, idx) => {
      const isLast = idx === compact.length - 1;
      return { ...e, state: isLast ? "current" : "done" };
    });
  }

  const rank = statusRank(shipment?.status);
  const bookedAt = shipment?.createdAt ? toDisplayDate(shipment.createdAt) : "";

  const base = [
    {
      id: `${shipment?._id || shipment?.id}-m-1`,
      label: "Booking confirmed",
      location: shipment?.ports?.originPort || shipment?.originAddress || "",
      at: bookedAt,
      state: rank >= 1 ? "done" : "upcoming",
    },
    {
      id: `${shipment?._id || shipment?.id}-m-2`,
      label: "In transit",
      location: "",
      at: "",
      state: rank >= 2 ? (rank === 2 ? "current" : "done") : "upcoming",
    },
    {
      id: `${shipment?._id || shipment?.id}-m-3`,
      label: "Arrived at destination",
      location:
        shipment?.ports?.destinationPort || shipment?.destinationAddress || "",
      at: "",
      state: rank >= 3 ? (rank === 3 ? "current" : "done") : "upcoming",
    },
    {
      id: `${shipment?._id || shipment?.id}-m-4`,
      label: "Customs cleared",
      location: "",
      at: "",
      state: rank >= 4 ? (rank === 4 ? "current" : "done") : "upcoming",
    },
    {
      id: `${shipment?._id || shipment?.id}-m-5`,
      label: "Delivered",
      location: shipment?.destinationAddress || "",
      at: "",
      state: rank >= 5 ? "current" : "upcoming",
    },
  ];

  if (rank === 0) base[0].state = "current";
  return base;
}

/* -----------------------
   UI atoms
------------------------ */

const MiniField = ({ label, value, icon }) => {
  const v = cleanStr(value);
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
        {icon ? <span className="text-[#9A9EAB]">{icon}</span> : null}
        {label}
      </div>
      <div
        className={`mt-1 text-sm font-semibold ${
          v ? "text-[#1A2930]" : "text-slate-400"
        }`}
      >
        {v || "Not provided yet"}
      </div>
    </div>
  );
};

const InfoCallout = ({ title, text, variant = "info" }) => {
  const styles =
    variant === "warn"
      ? "bg-amber-500/10 border-amber-500/25 text-amber-900"
      : variant === "good"
        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-900"
        : "bg-[#1A2930]/5 border-[#1A2930]/10 text-[#1A2930]";
  return (
    <div className={`rounded-2xl border px-4 py-3 ${styles}`}>
      <div className="text-sm font-semibold flex items-center gap-2">
        {variant === "warn" ? <FaExclamationTriangle /> : <FaInfoCircle />}
        {title}
      </div>
      <div className="mt-1 text-xs md:text-sm opacity-90">{text}</div>
    </div>
  );
};

const MilestoneRow = ({ item, isLast }) => {
  const state = String(item?.state || "upcoming").toLowerCase();
  const done = state === "done";
  const current = state === "current";

  const dot = done ? (
    <FaCheckCircle className="text-emerald-600" />
  ) : current ? (
    <FaCircle className="text-[#FFA500]" />
  ) : (
    <FaCircle className="text-[#9A9EAB]" />
  );

  const badge = done ? "Completed" : current ? "In progress" : "Upcoming";
  const badgeClass = done
    ? "bg-emerald-500/10 text-emerald-800 border border-emerald-500/20"
    : current
      ? "bg-[#FFA500]/10 text-[#1A2930] border border-[#FFA500]/25"
      : "bg-slate-500/10 text-slate-700 border border-slate-500/20";

  const smallTag = item?.badge ? String(item.badge).trim() : "";

  return (
    <div className="flex items-start gap-3 group">
      <div className="flex flex-col items-center">
        <div className="h-9 w-9 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center shadow-sm group-hover:shadow transition">
          {dot}
        </div>
        {!isLast ? <div className="w-px flex-1 bg-[#E5E7EB] mt-2" /> : null}
      </div>

      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm md:text-base font-semibold text-[#1A2930]">
                {toTitleCase(item.label)}
              </p>
              {smallTag ? (
                <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1A2930]/5 text-[#1A2930] border border-[#1A2930]/10">
                  {smallTag}
                </span>
              ) : null}
            </div>

            <div className="mt-1 text-xs md:text-sm text-slate-600 space-y-1">
              {item.location ? (
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-[#9A9EAB]" />
                  <span className="truncate">{item.location}</span>
                </div>
              ) : null}

              {item.at ? (
                <div className="flex items-center gap-2">
                  <FaClock className="text-[#9A9EAB]" />
                  <span className="truncate">{item.at}</span>
                </div>
              ) : null}
            </div>
          </div>

          <span
            className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold ${badgeClass}`}
          >
            {badge}
          </span>
        </div>
      </div>
    </div>
  );
};

const ShipmentFeedback = ({ reference }) => {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      console.log("Feedback submitted:", { reference, message });
      setSubmitted(true);
      setMessage("");
    } catch (err) {
      console.error("Failed to submit feedback", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#E5E7EB] shadow-sm">
      <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-2">
        Feedback on this shipment
      </p>

      {submitted && (
        <div className="mb-3 text-xs md:text-sm text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
          Thank you. Your feedback has been received by the Ellcworth team.
        </div>
      )}

      <p className="text-xs md:text-sm text-slate-600 mb-3">
        Tell us briefly how this shipment went or if there&apos;s anything we
        should review. This isn&apos;t a live chat, but our operations team uses
        this feedback to improve service.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={800}
          placeholder="Share any comments about timing, communication or documentation..."
          className="w-full text-sm border border-[#D1D5DB] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500] bg-white"
        />

        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            Reference: {reference}
          </span>
          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className={`
              px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition
              ${
                submitting || !message.trim()
                  ? "bg-[#9A9EAB] text-white cursor-not-allowed"
                  : "bg-[#1A2930] text-white hover:bg-[#FFA500] hover:text-[#1A2930]"
              }
            `}
          >
            {submitting ? "Sending..." : "Submit feedback"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* -----------------------
   Main
------------------------ */

const ShipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hasToken, setHasToken] = useState(() => {
    const local = localStorage.getItem(CUSTOMER_TOKEN_KEY);
    const session = sessionStorage.getItem(CUSTOMER_TOKEN_KEY);
    return Boolean(local || session);
  });

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // Quote actions UI state
  const [quoteMsg, setQuoteMsg] = useState("");
  const [quoteActionMsg, setQuoteActionMsg] = useState("");
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  useEffect(() => {
    const onStorage = () => {
      const local = localStorage.getItem(CUSTOMER_TOKEN_KEY);
      const session = sessionStorage.getItem(CUSTOMER_TOKEN_KEY);
      setHasToken(Boolean(local || session));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const fetchShipment = async (signal) => {
    const res = await customerAuthRequest.get(SHIPMENT_PATH(id), {
      ...(signal ? { signal } : {}),
    });
    const payload = res?.data ?? {};
    return pickShipment(payload);
  };

  const refreshShipment = async () => {
    try {
      const picked = await fetchShipment();
      if (picked) setShipment(picked);
    } catch (e) {
      // silent refresh failure (don’t replace page state)
      console.warn("ShipmentDetails refresh skipped:", e?.message || e);
    }
  };

  useEffect(() => {
    if (!hasToken) {
      setLoading(false);
      setShipment(null);
      setErrMsg("");
      navigate("/login", { replace: true });
      return;
    }

    const ac = new AbortController();

    (async () => {
      setLoading(true);
      setErrMsg("");

      try {
        const picked = await fetchShipment(ac.signal);

        if (!picked) {
          setShipment(null);
          setErrMsg("We received an unexpected response for this shipment.");
          return;
        }

        setShipment(picked);
      } catch (e) {
        if (
          e?.name === "CanceledError" ||
          e?.name === "AbortError" ||
          e?.code === "ERR_CANCELED"
        )
          return;

        const status = e?.response?.status;
        if (status === 404) {
          setShipment(null);
          setErrMsg("Shipment not found.");
          return;
        }

        setShipment(null);
        setErrMsg(
          "We couldn’t load this shipment right now. Please go back and try again.",
        );
        console.error("ShipmentDetails fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [id, navigate, hasToken]);

  // ✅ Prevent “edits not retained” feeling: refresh on focus / tab return.
  useEffect(() => {
    if (!hasToken || !id) return;

    const onFocus = () => refreshShipment();
    const onVis = () => {
      if (document.visibilityState === "visible") refreshShipment();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken, id]);

  const timeline = useMemo(
    () => (shipment ? buildTimeline(shipment) : []),
    [shipment],
  );

  // ---- Model-agnostic “Brief Confirmation” fields ----

  const reference =
    firstNonEmpty(
      shipment?.referenceNo,
      shipment?.reference,
      shipment?.ref,
      shipment?._id,
    ) || "—";

  const status = shipment?.status || "pending";
  const statusLabel = formatCustomerStatusLabel(status);

  const mode = firstNonEmpty(
    shipment?.mode,
    shipment?.shipmentMode,
    shipment?.service?.mode,
  );
  const modeLabel = formatModeLabel(mode);

  const bookedAt = shipment?.createdAt ? toDisplayDate(shipment.createdAt) : "";

  // Parties
  const shipperName =
    firstNonEmpty(
      pick(shipment, [
        "shipper.name",
        "shipper.fullname",
        "shipper.company",
        "customer.fullname",
        "customer.name",
      ]),
      shipment?.shipperName,
    ) || "—";

  const shipperPhone = firstNonEmpty(
    pick(shipment, [
      "shipper.phone",
      "shipper.mobile",
      "shipper.tel",
      "shipper.contactPhone",
    ]),
    shipment?.shipperPhone,
  );

  const shipperEmail = firstNonEmpty(
    pick(shipment, ["shipper.email", "shipper.contactEmail"]),
    shipment?.shipperEmail,
  );

  const consigneeName =
    firstNonEmpty(
      pick(shipment, [
        "consignee.name",
        "consignee.fullname",
        "consignee.company",
      ]),
      shipment?.consigneeName,
    ) || "—";

  const consigneePhone = firstNonEmpty(
    pick(shipment, [
      "consignee.phone",
      "consignee.mobile",
      "consignee.tel",
      "consignee.contactPhone",
    ]),
    shipment?.consigneePhone,
  );

  const consigneeEmail = firstNonEmpty(
    pick(shipment, ["consignee.email", "consignee.contactEmail"]),
    shipment?.consigneeEmail,
  );

  // Route / addresses / ports
  const origin =
    firstNonEmpty(
      pick(shipment, [
        "originAddress",
        "pickupAddress",
        "addresses.origin",
        "addresses.pickup",
        "ports.originPort",
      ]),
      shipment?.origin,
    ) || "—";

  const destination =
    firstNonEmpty(
      pick(shipment, [
        "destinationAddress",
        "deliveryAddress",
        "addresses.destination",
        "addresses.delivery",
        "ports.destinationPort",
      ]),
      shipment?.destination,
    ) || "—";

  const shippingDate = firstNonEmpty(
    pick(shipment, [
      "shippingDate",
      "shipDate",
      "dates.shipping",
      "dates.ship",
    ]),
    shipment?.shippingDate,
  );

  const requestedPickupDate = firstNonEmpty(
    pick(shipment, ["pickupDate", "dates.pickup", "requestedPickupDate"]),
    shipment?.pickupDate,
  );

  const eta = firstNonEmpty(
    pick(shipment, [
      "eta",
      "estimatedDeliveryDate",
      "dates.eta",
      "dates.deliveryEta",
    ]),
    shipment?.eta,
  );

  // Cargo
  const goodsDescription = firstNonEmpty(
    pick(shipment, [
      "goodsDescription",
      "cargo.description",
      "cargo.goodsDescription",
      "cargo.goods",
      "itemsSummary",
    ]),
    shipment?.description,
  );

  const packagesCount = pickNum(shipment, [
    "packagesCount",
    "cargo.packagesCount",
    "cargo.packageCount",
    "pieces",
    "qty",
  ]);

  // ✅ FIX: packaging type reads schema-first (EditBooking writes cargo.packages[0].type)
  const packagingType = cleanStr(normalizePackagingType(shipment));

  // accept either numeric weights OR string "75 kg"
  const weightText = firstNonEmpty(pick(shipment, ["cargo.weight", "weight"]));

  const weightKg = (() => {
    const n = pickNum(shipment, [
      "weightKg",
      "cargo.weightKg",
      "grossWeightKg",
    ]);
    if (n !== null) return n;
    return parseNumberFromText(weightText);
  })();

  const volumeM3 = pickNum(shipment, [
    "volumeM3",
    "cargo.volumeM3",
    "cargo.volumeCbm",
    "volume",
    "cbm",
  ]);

  const declaredValue = pickNum(shipment, [
    "declaredValue",
    "cargo.declaredValue",
    "value",
    "cargoValue.amount",
  ]);

  const declaredCurrency = normalizeDeclaredCurrency(shipment);

  const customerNotes = firstNonEmpty(
    pick(shipment, [
      "notes",
      "customerNotes",
      "instructions",
      "specialInstructions",
      "cargo.notes",
    ]),
  );

  // Docs + quote
  const documents = Array.isArray(shipment?.documents)
    ? shipment.documents
    : [];

  const quote = shipment?.quote || null;
  const quoteCurrency = quote?.currency || "GBP";
  const quoteLineItems = Array.isArray(quote?.lineItems) ? quote.lineItems : [];
  const hasQuote = Boolean(quote && quoteLineItems.length > 0);
  const canApprove = hasQuote && String(status).toLowerCase() === "quoted";
  const isApproved = String(status).toLowerCase() === "customer_approved";
  const changesRequested =
    String(status).toLowerCase() === "customer_requested_changes";

  // Missing info checklist
  const missing = useMemo(() => {
    const out = [];

    if (!cleanStr(shipperName) || shipperName === "—") out.push("Shipper name");
    if (!cleanStr(origin) || origin === "—")
      out.push("Origin / pickup address");
    if (!cleanStr(consigneeName) || consigneeName === "—")
      out.push("Consignee name");
    if (!cleanStr(destination) || destination === "—")
      out.push("Destination / delivery address");

    if (!cleanStr(goodsDescription)) out.push("Goods description");
    if (packagesCount === null) out.push("Quantity / pieces");
    if (!cleanStr(packagingType)) out.push("Packaging type");

    const hasWeightOrVolume =
      weightKg !== null || volumeM3 !== null || cleanStr(weightText);
    if (!hasWeightOrVolume) out.push("Weight or volume");

    if (!cleanStr(requestedPickupDate) && !cleanStr(shippingDate))
      out.push("Pickup / shipping date");

    if (declaredValue === null)
      out.push("Declared value (for insurance/customs)");

    return out;
  }, [
    shipperName,
    origin,
    consigneeName,
    destination,
    goodsDescription,
    packagesCount,
    packagingType,
    weightKg,
    volumeM3,
    weightText,
    requestedPickupDate,
    shippingDate,
    declaredValue,
  ]);

  const handleViewDoc = (doc) => {
    const url = getDocUrl(doc);
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadDoc = (doc) => {
    const url = getDocUrl(doc);
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const onApproveQuote = async () => {
    if (!canApprove || quoteSubmitting) return;

    setQuoteSubmitting(true);
    setQuoteActionMsg("");

    try {
      await customerAuthRequest.post(`/shipments/${id}/quote/approve`, {});
      setQuoteActionMsg(
        "Thank you — your approval has been sent to Ellcworth.",
      );
      await refreshShipment();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        "We couldn’t submit your approval. Please try again.";
      setQuoteActionMsg(msg);
      console.error("Approve quote failed:", e);
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const onRequestChanges = async () => {
    if (!hasQuote || quoteSubmitting) return;

    const message = String(quoteMsg || "").trim();
    if (!message) {
      setQuoteActionMsg("Please type a short message describing the changes.");
      return;
    }

    setQuoteSubmitting(true);
    setQuoteActionMsg("");

    try {
      await customerAuthRequest.post(`/shipments/${id}/quote/request-changes`, {
        message,
      });
      setQuoteActionMsg(
        "Thanks — your change request has been sent to Ellcworth.",
      );
      setQuoteMsg("");
      await refreshShipment();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        "We couldn’t submit your request. Please try again.";
      setQuoteActionMsg(msg);
      console.error("Request changes failed:", e);
    } finally {
      setQuoteSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] py-10 bg-gradient-to-b from-[#1A2930] via-[#1A2930] to-[#0f1a1f]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 text-sm text-slate-200 shadow-lg">
            Loading shipment…
          </div>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-[70vh] py-10 bg-gradient-to-b from-[#1A2930] via-[#1A2930] to-[#0f1a1f]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <Link to="/myshipments">
            <button className="inline-flex items-center gap-2 text-xs md:text-sm text-slate-200 hover:text-[#FFA500] transition mb-5">
              <FaArrowLeft />
              <span>Back to shipments</span>
            </button>
          </Link>

          <div className="bg-white rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="h-1 w-full bg-[#FFA500]" />
            <div className="p-8">
              <h1 className="text-lg md:text-xl font-semibold text-[#1A2930] mb-2">
                {errMsg || "Shipment not found"}
              </h1>
              <p className="text-sm text-slate-600">
                We couldn&apos;t load a shipment matching this reference. Please
                return to your shipments overview and try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] py-10 bg-gradient-to-b from-[#1A2930] via-[#1A2930] to-[#0f1a1f]">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <Link to="/myshipments">
            <button className="inline-flex items-center gap-2 text-xs md:text-sm text-slate-200 hover:text-[#FFA500] transition">
              <FaArrowLeft />
              <span>Back to my shipments</span>
            </button>
          </Link>

          <div className="flex items-center gap-3">
            <Link to={`/shipmentedit/${id}`}>
              <button className="inline-flex items-center gap-2 text-xs md:text-sm px-3 py-2 rounded-full border border-white/20 text-slate-100 hover:border-[#FFA500] hover:text-[#FFA500] hover:bg-[#FFA500]/10 transition">
                <FaEdit />
                Edit booking
              </button>
            </Link>

            <div className="hidden md:flex items-center text-[11px] uppercase tracking-[0.2em] text-[#9A9EAB]">
              CUSTOMER PORTAL · ELLCWORTH EXPRESS
            </div>
          </div>
        </div>

        {/* Main shell */}
        <div className="bg-white rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#FFA500] via-[#FFA500] to-[#1A2930]" />

          {/* Header */}
          <div className="px-5 py-5 border-b border-[#E5E7EB] bg-gradient-to-b from-white to-[#F9FAFB] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB]">
                Shipment reference
              </p>
              <h1 className="text-lg md:text-xl font-black text-[#1A2930]">
                {reference}
              </h1>
              <p className="text-xs md:text-sm text-slate-600 mt-1">
                {modeLabel}
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              <span
                className={`
                  inline-flex items-center justify-center
                  px-3 py-1 rounded-full text-xs font-semibold
                  ${getStatusClasses(status)}
                `}
              >
                {statusLabel}
              </span>

              <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                <FaCalendarAlt className="text-[#9A9EAB]" />
                <span>Booked: {bookedAt || "—"}</span>
              </div>

              <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                <FaTruck className="text-[#9A9EAB]" />
                <span className="truncate">{destination}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-6 space-y-6 bg-[#F9FAFB]">
            <InfoCallout
              title="Confirm your delivery brief"
              text="Please review the details below. If anything is missing or incorrect, use “Edit booking” or send a message in “Request changes”."
            />

            {missing.length ? (
              <InfoCallout
                variant="warn"
                title="We still need a few details to process smoothly"
                text={`Missing: ${missing.join(", ")}.`}
              />
            ) : (
              <InfoCallout
                variant="good"
                title="Brief looks complete"
                text="All key operational details appear to be captured. Ellcworth Operations will proceed based on this brief."
              />
            )}

            {/* Delivery brief confirmation */}
            <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#E5E7EB] shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB]">
                    Delivery brief
                  </p>
                  <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-2xl">
                    This is what Ellcworth will use to manage your shipment.
                    Please confirm names, addresses, cargo and timing.
                  </p>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#1A2930]/5 text-[#1A2930] border border-[#1A2930]/10 inline-flex items-center gap-2">
                  <FaClipboardCheck />
                  Assurance view
                </span>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 flex items-center gap-2">
                    <FaUser className="text-[#9A9EAB]" />
                    Shipper (sender)
                  </div>
                  <div className="mt-2 text-sm font-extrabold text-[#1A2930]">
                    {shipperName || "Not provided yet"}
                  </div>
                  <div className="mt-2 text-xs text-slate-700 space-y-1">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-[#9A9EAB]" />
                      <span className="truncate">{origin}</span>
                    </div>
                    {shipperPhone || shipperEmail ? (
                      <div className="text-[11px] text-slate-600">
                        {shipperPhone ? `Tel: ${shipperPhone}` : null}
                        {shipperPhone && shipperEmail ? " · " : null}
                        {shipperEmail ? `Email: ${shipperEmail}` : null}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500">
                        Contact details not provided yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 flex items-center gap-2">
                    <FaUser className="text-[#9A9EAB]" />
                    Consignee (receiver)
                  </div>
                  <div className="mt-2 text-sm font-extrabold text-[#1A2930]">
                    {consigneeName || "Not provided yet"}
                  </div>
                  <div className="mt-2 text-xs text-slate-700 space-y-1">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-[#9A9EAB]" />
                      <span className="truncate">{destination}</span>
                    </div>
                    {consigneePhone || consigneeEmail ? (
                      <div className="text-[11px] text-slate-600">
                        {consigneePhone ? `Tel: ${consigneePhone}` : null}
                        {consigneePhone && consigneeEmail ? " · " : null}
                        {consigneeEmail ? `Email: ${consigneeEmail}` : null}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500">
                        Contact details not provided yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <MiniField
                  label="Service"
                  value={modeLabel}
                  icon={<FaTruck />}
                />
                <MiniField label="Origin" value={origin} icon={<FaRoute />} />
                <MiniField
                  label="Destination"
                  value={destination}
                  icon={<FaRoute />}
                />

                <MiniField
                  label="Requested pickup"
                  value={
                    requestedPickupDate
                      ? toDisplayDate(requestedPickupDate)
                      : ""
                  }
                  icon={<FaCalendarAlt />}
                />
                <MiniField
                  label="Shipping date"
                  value={shippingDate ? toDisplayDate(shippingDate) : ""}
                  icon={<FaCalendarAlt />}
                />
                <MiniField
                  label="Estimated delivery"
                  value={eta ? toDisplayDate(eta) : ""}
                  icon={<FaClock />}
                />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
                    <FaBoxOpen className="text-[#9A9EAB]" />
                    Cargo & handling
                  </div>

                  <div className="mt-2 text-sm text-slate-700">
                    <span className="font-semibold text-[#1A2930]">Goods:</span>{" "}
                    {goodsDescription ? (
                      goodsDescription
                    ) : (
                      <span className="text-slate-400">Not provided yet</span>
                    )}
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <MiniField
                      label="Quantity / pieces"
                      value={
                        packagesCount === null ? "" : String(packagesCount)
                      }
                    />
                    <MiniField label="Packaging type" value={packagingType} />
                    <MiniField
                      label="Weight (kg)"
                      value={weightKg === null ? "" : String(weightKg)}
                    />
                    <MiniField
                      label="Volume (m³)"
                      value={volumeM3 === null ? "" : String(volumeM3)}
                    />
                  </div>

                  <div className="mt-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      Declared value (insurance/customs)
                    </div>
                    <div
                      className={`mt-1 text-sm font-semibold ${
                        declaredValue === null
                          ? "text-slate-400"
                          : "text-[#1A2930]"
                      }`}
                    >
                      {declaredValue === null
                        ? "Not provided yet"
                        : formatCurrency(declaredValue, declaredCurrency)}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
                    <FaInfoCircle className="text-[#9A9EAB]" />
                    Instructions & notes
                  </div>

                  <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                    {customerNotes ? (
                      customerNotes
                    ) : (
                      <span className="text-slate-400">
                        No special instructions provided yet.
                      </span>
                    )}
                  </div>

                  <div className="mt-4 rounded-xl border border-[#FFA500]/25 bg-[#FFA500]/10 p-3">
                    <div className="text-[11px] font-semibold text-[#1A2930]">
                      Need to correct the brief?
                    </div>
                    <div className="mt-1 text-xs text-slate-700">
                      Use <span className="font-semibold">Edit booking</span> to
                      update addresses, dates, and cargo details. If something
                      urgent can’t be edited, contact Ellcworth Operations with
                      your reference:{" "}
                      <span className="font-semibold">{reference}</span>.
                    </div>

                    <div className="mt-3">
                      <Link to={`/shipmentedit/${id}`}>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-[12px] font-semibold bg-[#1A2930] text-white hover:bg-[#0f1a1f] transition"
                        >
                          <FaEdit />
                          Edit booking
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote */}
            <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#E5E7EB] shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB]">
                    Quote
                  </p>
                  <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-2xl">
                    If a quote has been issued, review it here. You can approve
                    to proceed or request adjustments.
                  </p>
                </div>

                <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#1A2930]/5 text-[#1A2930] border border-[#1A2930]/10 inline-flex items-center gap-2">
                  <FaPoundSign />
                  {hasQuote
                    ? formatCurrency(quote?.total || 0, quoteCurrency)
                    : "No quote yet"}
                </span>
              </div>

              {!hasQuote ? (
                <div className="mt-4 bg-[#F9FAFB] rounded-2xl border border-dashed border-[#D1D5DB] p-4 text-xs md:text-sm text-slate-600">
                  Your quote is not yet available. Please check back soon, or
                  contact Ellcworth Operations if you need urgency.
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E5E7EB] bg-white flex items-center justify-between">
                      <div className="text-sm font-semibold text-[#1A2930]">
                        Quote summary
                      </div>
                      <div className="text-xs text-slate-500">
                        Currency: {quoteCurrency}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white">
                        {quoteLineItems.map((li, idx) => {
                          const label =
                            String(li?.label || "").trim() || "Item";
                          const qty = Number(li?.qty ?? 1);
                          const unitPrice = Number(li?.unitPrice ?? 0);
                          const amount = Number(li?.amount ?? qty * unitPrice);

                          return (
                            <div
                              key={`${label}-${idx}`}
                              className="px-4 py-3 flex items-center justify-between gap-4 bg-white"
                            >
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-[#1A2930] truncate">
                                  {label}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  Qty: {Number.isFinite(qty) ? qty : 1} · Unit:{" "}
                                  {formatCurrency(unitPrice, quoteCurrency)}
                                </div>
                              </div>
                              <div className="text-sm font-extrabold text-[#1A2930]">
                                {formatCurrency(amount, quoteCurrency)}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 grid gap-2 md:grid-cols-3">
                        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-3">
                          <div className="text-[11px] text-slate-500 uppercase tracking-[0.16em]">
                            Subtotal
                          </div>
                          <div className="text-sm font-extrabold text-[#1A2930] mt-1">
                            {formatCurrency(
                              quote?.subtotal || 0,
                              quoteCurrency,
                            )}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-3">
                          <div className="text-[11px] text-slate-500 uppercase tracking-[0.16em]">
                            Tax
                          </div>
                          <div className="text-sm font-extrabold text-[#1A2930] mt-1">
                            {formatCurrency(
                              quote?.taxTotal || 0,
                              quoteCurrency,
                            )}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-[#FFA500]/30 bg-[#FFA500]/10 p-3">
                          <div className="text-[11px] text-[#1A2930] uppercase tracking-[0.16em]">
                            Total
                          </div>
                          <div className="text-sm font-black text-[#1A2930] mt-1">
                            {formatCurrency(quote?.total || 0, quoteCurrency)}
                          </div>
                        </div>
                      </div>

                      {quote?.notesToCustomer ? (
                        <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-white p-3">
                          <div className="text-[11px] text-slate-500 uppercase tracking-[0.16em]">
                            Notes
                          </div>
                          <div className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                            {String(quote.notesToCustomer)}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 md:p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[#1A2930]">
                          Approve or request changes
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          Status:{" "}
                          <span className="font-semibold">{statusLabel}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={onApproveQuote}
                          disabled={!canApprove || quoteSubmitting}
                          className={`
                            inline-flex items-center gap-2
                            px-4 py-2 rounded-full text-[12px] font-semibold
                            border transition
                            ${
                              !canApprove || quoteSubmitting
                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                : "bg-[#1A2930] text-white border-[#1A2930] hover:bg-[#FFA500] hover:text-[#1A2930] hover:border-[#FFA500]"
                            }
                          `}
                          title={
                            !canApprove
                              ? isApproved
                                ? "Quote already approved"
                                : "Approve is available once the quote is issued (status: quoted)"
                              : "Approve quote"
                          }
                        >
                          <FaCheckCircle />
                          {quoteSubmitting ? "Submitting…" : "Approve quote"}
                        </button>
                      </div>
                    </div>

                    {(isApproved || changesRequested) && (
                      <div className="mt-4 text-xs text-slate-700 bg-[#1A2930]/5 border border-[#1A2930]/10 rounded-xl px-3 py-2">
                        {isApproved
                          ? "You have approved this quote. Ellcworth will send a booking confirmation shortly."
                          : "You have requested changes to this quote. Ellcworth will review and respond."}
                      </div>
                    )}

                    <div className="mt-4">
                      <label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB]">
                        Request changes (message to Ellcworth)
                      </label>
                      <textarea
                        value={quoteMsg}
                        onChange={(e) => setQuoteMsg(e.target.value)}
                        rows={3}
                        maxLength={800}
                        placeholder="Briefly describe what you’d like adjusted (e.g., address, dates, cargo details, or pricing)..."
                        className="mt-2 w-full text-sm border border-[#D1D5DB] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500] bg-white"
                        disabled={quoteSubmitting}
                      />

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-[11px] text-slate-400">
                          Reference: {reference}
                        </span>

                        <button
                          type="button"
                          onClick={onRequestChanges}
                          disabled={!hasQuote || quoteSubmitting}
                          className={`
                            inline-flex items-center gap-2
                            px-4 py-2 rounded-full text-[12px] font-semibold
                            border transition
                            ${
                              !hasQuote || quoteSubmitting
                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                : "bg-white text-[#1A2930] border-[#1A2930]/25 hover:border-[#FFA500] hover:bg-[#FFA500]/10"
                            }
                          `}
                          title={
                            !hasQuote
                              ? "Quote not available yet"
                              : "Request changes"
                          }
                        >
                          <FaPaperPlane />
                          {quoteSubmitting ? "Sending…" : "Request changes"}
                        </button>
                      </div>

                      {quoteActionMsg ? (
                        <div className="mt-3 text-xs text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                          {quoteActionMsg}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tracking */}
            <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#E5E7EB] shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB]">
                    Tracking & milestones
                  </p>
                  <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-2xl">
                    We post milestone updates as your shipment moves through the
                    process. This is not live GPS tracking, but it will show key
                    changes as they happen.
                  </p>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#1A2930]/5 text-[#1A2930] border border-[#1A2930]/10">
                  Current status: {statusLabel}
                </span>
              </div>

              <div className="mt-5">
                {timeline.length ? (
                  <div className="bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] p-4 md:p-5">
                    {timeline.map((item, idx) => (
                      <MilestoneRow
                        key={item.id}
                        item={item}
                        isLast={idx === timeline.length - 1}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#F9FAFB] rounded-2xl border border-dashed border-[#D1D5DB] p-4 text-xs md:text-sm text-slate-600">
                    No tracking updates are available for this shipment yet.
                    Please check back shortly.
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E7EB] bg-gradient-to-b from-white to-[#F9FAFB]">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB]">
                  Documents
                </p>
                <p className="text-xs md:text-sm text-slate-600 mt-1">
                  View or download documents shared by Ellcworth Operations.
                  Some documents are only released at specific milestones.
                </p>
              </div>

              <div className="p-5 bg-[#F9FAFB]">
                {documents.length > 0 ? (
                  <div className="divide-y divide-[#E5E7EB] rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden">
                    {documents.map((doc, index) => {
                      const actionable = canActOnDoc(doc);
                      const nameText = String(doc?.name || "Document").trim();
                      const uploadedAt = doc?.uploadedAt
                        ? toDisplayDate(doc.uploadedAt)
                        : "";

                      return (
                        <div
                          key={`${nameText}-${index}`}
                          className="px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-xl bg-[#1A2930]/5 border border-[#1A2930]/10 flex items-center justify-center text-[#1A2930]">
                              <FaFileAlt />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#1A2930] truncate">
                                {nameText}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {uploadedAt
                                  ? `Uploaded: ${uploadedAt}`
                                  : "Uploaded: —"}
                              </p>

                              {!actionable ? (
                                <p className="mt-2 text-[11px] text-slate-500 inline-flex items-center gap-2">
                                  <FaInfoCircle className="text-[#9A9EAB]" />
                                  Link not provided yet
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewDoc(doc)}
                              disabled={!actionable}
                              className={`
                                inline-flex items-center gap-2
                                px-3 py-2 rounded-full text-[12px] font-semibold
                                border transition
                                ${
                                  !actionable
                                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                    : "bg-[#1A2930] text-white border-[#1A2930] hover:bg-[#FFA500] hover:text-[#1A2930] hover:border-[#FFA500]"
                                }
                              `}
                              title={
                                !actionable
                                  ? "Link not provided yet"
                                  : "View document"
                              }
                            >
                              <FaEye />
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDownloadDoc(doc)}
                              disabled={!actionable}
                              className={`
                                inline-flex items-center gap-2
                                px-3 py-2 rounded-full text-[12px] font-semibold
                                border transition
                                ${
                                  !actionable
                                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                    : "bg-white text-[#1A2930] border-[#1A2930]/25 hover:border-[#FFA500] hover:bg-[#FFA500]/10"
                                }
                              `}
                              title={
                                !actionable
                                  ? "Link not provided yet"
                                  : "Download document"
                              }
                            >
                              <FaDownload />
                              Download
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-white p-4 text-xs md:text-sm text-slate-600">
                    Documents for this shipment will appear here once available.
                  </div>
                )}
              </div>
            </div>

            <ShipmentFeedback reference={reference} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetails;
