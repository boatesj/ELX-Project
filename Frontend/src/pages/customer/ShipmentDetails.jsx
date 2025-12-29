import { useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaWeightHanging,
  FaPoundSign,
  FaCalendarAlt,
  FaTruck,
  FaUser,
  FaFileAlt,
  FaCircle,
  FaClock,
  FaCheckCircle,
  FaDownload,
  FaEye,
  FaInfoCircle,
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { shipments } from "@/assets/shipments";

const getStatusClasses = (status) => {
  switch (status) {
    case "Booked":
      return "bg-[#FFA500]/15 text-[#FFA500] border border-[#FFA500]/50";
    case "Loaded":
      return "bg-[#9A9EAB]/20 text-[#1A2930] border border-[#9A9EAB]/60";
    case "Arrived":
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/50";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-300";
  }
};

const formatModeLabel = (mode) => {
  switch (mode) {
    case "roro":
      return "RoRo vehicle shipment";
    case "container":
      return "Containerised sea freight";
    case "documents":
      return "Secure document shipment";
    case "air":
      return "Air freight";
    case "cargo":
      return "General cargo";
    default:
      return "Shipment";
  }
};

const statusRank = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "arrived") return 3;
  if (s === "loaded") return 2;
  if (s === "booked") return 1;
  return 0;
};

function toTitleCase(s) {
  const str = String(s || "").trim();
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildTimeline(shipment) {
  const raw = Array.isArray(shipment?.trackingEvents)
    ? shipment.trackingEvents
    : null;

  if (raw && raw.length) {
    return raw
      .map((e, idx) => ({
        id: `${shipment.id}-t-${idx}`,
        label: String(e?.label || e?.title || "Update"),
        location: String(e?.location || ""),
        at: String(e?.at || e?.date || ""),
        state: String(e?.status || e?.state || "").toLowerCase(),
      }))
      .filter((e) => e.label.trim().length > 0);
  }

  const rank = statusRank(shipment?.status);
  const bookedAt = shipment?.date ? String(shipment.date) : "";

  const base = [
    {
      id: `${shipment.id}-m-1`,
      label: "Booking confirmed",
      location: shipment?.from ? String(shipment.from) : "",
      at: bookedAt,
      state: rank >= 1 ? "done" : "upcoming",
    },
    {
      id: `${shipment.id}-m-2`,
      label: "Loaded / in transit",
      location: "",
      at: "",
      state: rank === 2 ? "current" : rank >= 3 ? "done" : "upcoming",
    },
    {
      id: `${shipment.id}-m-3`,
      label: "Arrived at destination",
      location: shipment?.destination ? String(shipment.destination) : "",
      at: "",
      state: rank === 3 ? "current" : "upcoming",
    },
  ];

  if (rank === 1) {
    base[0].state = "current";
    base[1].state = "upcoming";
    base[2].state = "upcoming";
  }
  if (rank === 2) {
    base[0].state = "done";
    base[1].state = "current";
    base[2].state = "upcoming";
  }
  if (rank === 3) {
    base[0].state = "done";
    base[1].state = "done";
    base[2].state = "current";
  }

  return base;
}

/**
 * Doc action rules (corporate-safe, fail-closed):
 * - If doc.available is false => no actions.
 * - If doc.url exists => View opens new tab; Download opens new tab (still ok for now).
 * - If no url => disable actions and show a clear message.
 *
 * Later, backend can return signed URLs for real downloads.
 */
function canActOnDoc(doc) {
  if (!doc?.available) return false;
  const url = String(doc?.url || doc?.href || "");
  return url.trim().length > 0;
}

function getDocUrl(doc) {
  const url = String(doc?.url || doc?.href || "");
  return url.trim();
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
              px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold
              transition
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
            <p className={`text-sm md:text-base font-semibold ${titleColor}`}>
              {toTitleCase(item.label)}
            </p>

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
  const shipment = shipments.find((s) => s.id === id);

  const timeline = useMemo(() => {
    if (!shipment) return [];
    return buildTimeline(shipment);
  }, [shipment]);

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
              Shipment not found
            </h1>
            <p className="text-sm text-slate-600">
              We couldn&apos;t find a shipment matching this reference. Please
              return to your shipments overview and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { mode } = shipment;

  const handleViewDoc = (doc) => {
    if (!doc?.available) return;
    const url = getDocUrl(doc);
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadDoc = (doc) => {
    if (!doc?.available) return;
    const url = getDocUrl(doc);
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

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
                {shipment.reference}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                {formatModeLabel(shipment.mode)}
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              <span
                className={`
                  inline-flex items-center justify-center
                  px-3 py-1 rounded-full text-xs font-semibold
                  ${getStatusClasses(shipment.status)}
                `}
              >
                {shipment.status}
              </span>
              <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                <FaCalendarAlt className="text-[#9A9EAB]" />
                <span>Booked: {shipment.date}</span>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                <FaTruck className="text-[#9A9EAB]" />
                <span>{shipment.destination}</span>
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
                  Live status: {shipment.status}
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
                    <p className="font-semibold">{shipment.from}</p>
                    <p className="text-xs text-slate-500">
                      Shipper: {shipment.shipper}
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
                    <p className="font-semibold">{shipment.destination}</p>
                    <p className="text-xs text-slate-500">
                      Consignee: {shipment.consignee}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mode-specific (unchanged) */}
            {mode === "roro" && shipment.vehicle && (
              <div className="bg-[#FFF7E6] rounded-lg p-4 border border-[#FFE0A8]">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#A16207] mb-2">
                  Vehicle details (RoRo)
                </p>
                <div className="grid gap-3 md:grid-cols-2 text-xs md:text-sm text-[#92400E]">
                  <div>
                    <p>
                      <span className="font-semibold">Make / Model: </span>
                      {shipment.vehicle.makeModel}
                    </p>
                    <p>
                      <span className="font-semibold">Chassis number: </span>
                      {shipment.vehicle.chassisNumber}
                    </p>
                    <p>
                      <span className="font-semibold">Registration: </span>
                      {shipment.vehicle.registrationNumber}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-semibold">Units: </span>
                      {shipment.vehicle.units}
                    </p>
                    <p>
                      <span className="font-semibold">Dimensions: </span>
                      {shipment.vehicle.dimensions}
                    </p>
                    <p>
                      <span className="font-semibold">Commercial value: </span>
                      {shipment.vehicle.commercialValue}
                    </p>
                    <p>
                      <span className="font-semibold">Customs required: </span>
                      {shipment.vehicle.customsRequired ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {mode === "container" && shipment.container && (
              <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-2">
                  Container details
                </p>
                <div className="grid gap-3 md:grid-cols-2 text-xs md:text-sm text-[#1A2930]">
                  <div>
                    <p>
                      <span className="font-semibold">Container no.: </span>
                      {shipment.container.containerNumber}
                    </p>
                    <p>
                      <span className="font-semibold">Size / type: </span>
                      {shipment.container.sizeType}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-semibold">Pieces: </span>
                      {shipment.container.pieces}
                    </p>
                    <p>
                      <span className="font-semibold">Cargo: </span>
                      {shipment.container.cargoDescription}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {mode === "air" && shipment.air && (
              <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-2">
                  Air freight details
                </p>
                <div className="grid gap-3 md:grid-cols-2 text-xs md:text-sm text-[#1A2930]">
                  <div>
                    <p>
                      <span className="font-semibold">Service level: </span>
                      {shipment.air.serviceLevel}
                    </p>
                    <p>
                      <span className="font-semibold">AWB number: </span>
                      {shipment.air.awbNumber}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-semibold">Pieces: </span>
                      {shipment.air.pieces}
                    </p>
                    <p>
                      <span className="font-semibold">Cargo: </span>
                      {shipment.air.cargoDescription}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(mode === "cargo" || mode === "documents") &&
              shipment.cargoDescription && (
                <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                  <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-2">
                    Cargo details
                  </p>
                  <p className="text-xs md:text-sm text-[#1A2930]">
                    {shipment.cargoDescription}
                  </p>
                </div>
              )}

            {/* Documents (B) */}
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
                {shipment.documents && shipment.documents.length > 0 ? (
                  <div className="divide-y divide-[#E5E7EB] rounded-lg border border-[#E5E7EB] bg-white">
                    {shipment.documents.map((doc, index) => {
                      const available = Boolean(doc?.available);
                      const actionable = canActOnDoc(doc);

                      const statusText = String(doc?.status || "").trim();
                      const typeText = String(doc?.type || "Document").trim();

                      return (
                        <div
                          key={index}
                          className="px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-[#1A2930]/5 border border-[#1A2930]/10 flex items-center justify-center text-[#1A2930]">
                              <FaFileAlt />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#1A2930]">
                                {typeText}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {statusText || "Status pending"}
                              </p>

                              {!available ? (
                                <p className="mt-1 text-[11px] text-slate-500 inline-flex items-center gap-2">
                                  <FaInfoCircle className="text-[#9A9EAB]" />
                                  Not yet available
                                </p>
                              ) : !actionable ? (
                                <p className="mt-1 text-[11px] text-slate-500 inline-flex items-center gap-2">
                                  <FaInfoCircle className="text-[#9A9EAB]" />
                                  Available — link will be provided shortly
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewDoc(doc)}
                              disabled={!available || !actionable}
                              className={`
                                inline-flex items-center gap-2
                                px-3 py-2 rounded-full text-[12px] font-semibold
                                border transition
                                ${
                                  !available || !actionable
                                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                    : "bg-[#1A2930] text-white border-[#1A2930] hover:bg-[#FFA500] hover:text-[#1A2930] hover:border-[#FFA500]"
                                }
                              `}
                              title={
                                !available
                                  ? "Not yet available"
                                  : !actionable
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
                              disabled={!available || !actionable}
                              className={`
                                inline-flex items-center gap-2
                                px-3 py-2 rounded-full text-[12px] font-semibold
                                border transition
                                ${
                                  !available || !actionable
                                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                    : "bg-white text-[#1A2930] border-[#1A2930]/40 hover:border-[#FFA500] hover:text-[#FFA500]"
                                }
                              `}
                              title={
                                !available
                                  ? "Not yet available"
                                  : !actionable
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
            <ShipmentFeedback reference={shipment.reference} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetails;
