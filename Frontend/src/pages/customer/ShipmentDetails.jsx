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
} from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authRequest } from "../../requestMethods";

// ✅ Customer-only keys (must match CustomerLogin.jsx)
const CUSTOMER_SESSION_KEY = "elx_customer_session_v1";
const CUSTOMER_TOKEN_KEY = "elx_customer_token";
const CUSTOMER_USER_KEY = "elx_customer_user";

const SHIPMENT_BY_ID_PATH = (id) => `/api/v1/shipments/${id}`;

function safeJsonParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearCustomerAuth() {
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_USER_KEY);
  sessionStorage.removeItem(CUSTOMER_TOKEN_KEY);
  sessionStorage.removeItem(CUSTOMER_USER_KEY);
}

function readCustomerAuth() {
  const token =
    localStorage.getItem(CUSTOMER_TOKEN_KEY) ||
    sessionStorage.getItem(CUSTOMER_TOKEN_KEY);

  const session = safeJsonParse(localStorage.getItem(CUSTOMER_SESSION_KEY));

  // expiry enforcement (customer session only)
  if (session?.expiresAt) {
    const exp = new Date(session.expiresAt).getTime();
    if (!Number.isNaN(exp) && Date.now() > exp) {
      clearCustomerAuth();
      return { token: null, user: null };
    }
  }

  const userRaw =
    localStorage.getItem(CUSTOMER_USER_KEY) ||
    sessionStorage.getItem(CUSTOMER_USER_KEY);

  const user = safeJsonParse(userRaw) || session?.user || null;

  // Extra safety: customer portal must never treat admin as authenticated
  const role = String(user?.role || "").toLowerCase();
  if (role === "admin") {
    clearCustomerAuth();
    return { token: null, user: null };
  }

  return { token: token || null, user };
}

const getStatusClasses = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "booked") {
    return "bg-[#FFA500]/15 text-[#FFA500] border border-[#FFA500]/50";
  }
  if (
    ["at_origin_yard", "loaded", "sailed", "in transit", "in_transit"].includes(
      s
    )
  ) {
    return "bg-[#9A9EAB]/20 text-[#1A2930] border border-[#9A9EAB]/60";
  }
  if (["arrived", "cleared", "delivered"].includes(s)) {
    return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/50";
  }
  if (s === "cancelled") {
    return "bg-red-500/15 text-red-600 border border-red-500/40";
  }
  return "bg-gray-100 text-gray-700 border border-gray-300";
};

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

/**
 * Backend shape:
 * trackingEvents[]: { status, event, location, date }
 */
function buildTimeline(shipment) {
  const raw = Array.isArray(shipment?.trackingEvents)
    ? shipment.trackingEvents
    : [];

  if (raw.length) {
    // Sort oldest -> newest by date
    const sorted = [...raw].sort((a, b) => {
      const ad = new Date(a?.date || 0).getTime();
      const bd = new Date(b?.date || 0).getTime();
      return ad - bd;
    });

    // Mark latest as current, previous as done
    return sorted
      .map((e, idx) => {
        const isLast = idx === sorted.length - 1;
        return {
          id: `${shipment?._id || shipment?.id}-t-${idx}`,
          label: String(e?.event || "Update"),
          location: String(e?.location || ""),
          at: e?.date ? toDisplayDate(e.date) : "",
          state: isLast ? "current" : "done",
          badge: String(e?.status || "").trim(),
        };
      })
      .filter((e) => e.label.trim().length > 0);
  }

  // Fallback timeline from status
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

  // Normalize "current" for low ranks
  if (rank === 0) base[0].state = "current";

  return base;
}

/**
 * Backend documents[]: { name, fileUrl, uploadedAt, uploadedBy }
 */
function canActOnDoc(doc) {
  const url = String(doc?.fileUrl || "").trim();
  return url.length > 0;
}
function getDocUrl(doc) {
  return String(doc?.fileUrl || "").trim();
}

// ✅ Robustly pick shipment from various response shapes
function pickShipment(payload) {
  // preferred future shapes:
  if (payload && typeof payload === "object") {
    if (payload.data && typeof payload.data === "object") return payload.data;
    if (payload.shipment && typeof payload.shipment === "object")
      return payload.shipment;
  }
  // current controller returns shipment object directly
  if (payload && typeof payload === "object" && payload._id) return payload;
  return null;
}

const ShipmentFeedback = ({ reference }) => {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);

    try {
      // Phase 5: minimal, operational (no backend wiring yet)
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
    <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
      <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-2">
        Feedback on this shipment
      </p>

      {submitted && (
        <div className="mb-3 text-xs md:text-sm text-emerald-600">
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
          className="w-full text-sm border border-[#D1D5DB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500] bg-white"
        />

        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            Reference: {reference}
          </span>
          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className={`
              px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold transition
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

  const titleColor = done
    ? "text-[#1A2930]"
    : current
    ? "text-[#1A2930]"
    : "text-slate-700";

  const metaColor = done
    ? "text-slate-600"
    : current
    ? "text-slate-600"
    : "text-slate-500";

  const badge = done ? "Completed" : current ? "In progress" : "Upcoming";

  const badgeClass = done
    ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
    : current
    ? "bg-[#FFA500]/10 text-[#A16207] border border-[#FFA500]/25"
    : "bg-slate-500/10 text-slate-700 border border-slate-500/20";

  const smallTag = item?.badge ? String(item.badge).trim() : "";

  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center shadow-sm">
          {dot}
        </div>
        {!isLast ? <div className="w-px flex-1 bg-[#E5E7EB] mt-2" /> : null}
      </div>

      <div className="flex-1 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className={`text-sm md:text-base font-semibold ${titleColor}`}>
                {toTitleCase(item.label)}
              </p>
              {smallTag ? (
                <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1A2930]/5 text-[#1A2930] border border-[#1A2930]/10">
                  {smallTag}
                </span>
              ) : null}
            </div>

            <div className={`mt-1 text-xs md:text-sm ${metaColor} space-y-0.5`}>
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

const ShipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const { token } = readCustomerAuth();
    if (!token) {
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
        // ✅ Using Frontend/src/requestMethods.js (axios instance)
        const resp = await authRequest.get(SHIPMENT_BY_ID_PATH(id), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: ac.signal,
        });

        const payload = resp?.data ?? {};
        const picked = pickShipment(payload);

        if (!picked) {
          setShipment(null);
          setErrMsg("We received an unexpected response for this shipment.");
          return;
        }

        setShipment(picked);
      } catch (e) {
        if (e?.name === "CanceledError" || e?.name === "AbortError") return;

        const status = e?.response?.status;

        if (status === 401) {
          clearCustomerAuth();
          setShipment(null);
          setErrMsg("Your session has expired. Please sign in again.");
          navigate("/login", { replace: true });
          return;
        }

        if (status === 404) {
          setShipment(null);
          setErrMsg("Shipment not found.");
          return;
        }

        setShipment(null);
        setErrMsg(
          "We couldn’t load this shipment right now. Please go back and try again."
        );
        console.error("ShipmentDetails fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [id, navigate]);

  const timeline = useMemo(
    () => (shipment ? buildTimeline(shipment) : []),
    [shipment]
  );

  const reference = shipment?.referenceNo || "—";
  const bookedAt = shipment?.createdAt ? toDisplayDate(shipment.createdAt) : "";
  const status = shipment?.status || "pending";
  const mode = shipment?.mode || "";

  const origin = shipment?.originAddress || shipment?.ports?.originPort || "—";
  const destination =
    shipment?.destinationAddress || shipment?.ports?.destinationPort || "—";

  const shipperName =
    shipment?.shipper?.name || shipment?.customer?.fullname || "—";
  const consigneeName = shipment?.consignee?.name || "—";

  const documents = Array.isArray(shipment?.documents)
    ? shipment.documents
    : [];

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

  if (loading) {
    return (
      <div className="bg-[#1A2930] min-h-[60vh] py-8">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="rounded-lg border border-white/10 bg-[#111827] p-6 text-sm text-slate-200">
            Loading shipment…
          </div>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="bg-[#1A2930] min-h-[60vh] py-8">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <Link to="/myshipments">
            <button className="inline-flex items-center gap-2 text-xs md:text-sm text-slate-200 hover:text-[#FFA500] transition mb-4">
              <FaArrowLeft />
              <span>Back to shipments</span>
            </button>
          </Link>

          <div className="bg-white rounded-xl shadow-xl border border-[#9A9EAB]/40 p-8">
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
    );
  }

  return (
    <div className="bg-[#1A2930] min-h-[60vh] py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/myshipments">
            <button className="inline-flex items-center gap-2 text-xs md:text-sm text-slate-200 hover:text-[#FFA500] transition">
              <FaArrowLeft />
              <span>Back to my shipments</span>
            </button>
          </Link>
          <div className="hidden md:flex items-center text-[11px] uppercase tracking-[0.2em] text-[#9A9EAB]">
            CUSTOMER PORTAL · ELLCWORTH EXPRESS
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-[#9A9EAB]/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB]">
                Shipment reference
              </p>
              <h1 className="text-lg md:text-xl font-semibold text-[#1A2930]">
                {reference}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                {formatModeLabel(mode)}
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
                {String(status || "pending")}
              </span>

              <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                <FaCalendarAlt className="text-[#9A9EAB]" />
                <span>Booked: {bookedAt || "—"}</span>
              </div>

              <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                <FaTruck className="text-[#9A9EAB]" />
                <span>{shipment?.ports?.destinationPort || destination}</span>
              </div>
            </div>
          </div>

          <div className="px-5 py-5 space-y-6">
            {/* Tracking */}
            <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
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
                  Live status: {String(status || "pending")}
                </span>
              </div>

              <div className="mt-4">
                {timeline.length ? (
                  <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
                    {timeline.map((item, idx) => (
                      <MilestoneRow
                        key={item.id}
                        item={item}
                        isLast={idx === timeline.length - 1}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-dashed border-[#D1D5DB] p-4 text-xs md:text-sm text-slate-600">
                    No tracking updates are available for this shipment yet.
                    Please check back shortly.
                  </div>
                )}
              </div>
            </div>

            {/* Origin / Destination */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-2">
                  Origin
                </p>
                <div className="flex items-start gap-2 text-sm text-[#1A2930]">
                  <FaMapMarkerAlt className="mt-0.5 text-[#1A2930]" />
                  <div>
                    <p className="font-semibold">{origin}</p>
                    <p className="text-xs text-slate-500">
                      Shipper: {shipperName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-2">
                  Destination
                </p>
                <div className="flex items-start gap-2 text-sm text-[#1A2930]">
                  <FaMapMarkerAlt className="mt-0.5 text-[#1A2930]" />
                  <div>
                    <p className="font-semibold">{destination}</p>
                    <p className="text-xs text-slate-500">
                      Consignee: {consigneeName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E7EB] bg-white">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB]">
                  Documents
                </p>
                <p className="text-xs md:text-sm text-slate-600 mt-1">
                  View or download documents shared by Ellcworth Operations.
                  Some documents are only released at specific milestones.
                </p>
              </div>

              <div className="p-4">
                {documents.length > 0 ? (
                  <div className="divide-y divide-[#E5E7EB] rounded-lg border border-[#E5E7EB] bg-white">
                    {documents.map((doc, index) => {
                      const actionable = canActOnDoc(doc);
                      const nameText = String(doc?.name || "Document").trim();
                      const uploadedAt = doc?.uploadedAt
                        ? toDisplayDate(doc.uploadedAt)
                        : "";

                      return (
                        <div
                          key={`${nameText}-${index}`}
                          className="px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-[#1A2930]/5 border border-[#1A2930]/10 flex items-center justify-center text-[#1A2930]">
                              <FaFileAlt />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#1A2930]">
                                {nameText}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {uploadedAt
                                  ? `Uploaded: ${uploadedAt}`
                                  : "Uploaded: —"}
                              </p>

                              {!actionable ? (
                                <p className="mt-1 text-[11px] text-slate-500 inline-flex items-center gap-2">
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
                                    : "bg-white text-[#1A2930] border-[#1A2930]/40 hover:border-[#FFA500] hover:text-[#FFA500]"
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
                  <div className="rounded-lg border border-dashed border-[#D1D5DB] bg-white p-4 text-xs md:text-sm text-slate-600">
                    Documents for this shipment will appear here once available.
                  </div>
                )}
              </div>
            </div>

            {/* Feedback */}
            <ShipmentFeedback reference={reference} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetails;
