import { useState } from "react";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaWeightHanging,
  FaPoundSign,
  FaCalendarAlt,
  FaTruck,
  FaUser,
  FaFileAlt,
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

/**
 * Lightweight feedback section for a single shipment.
 * Currently just logs to the console – you can later hook this
 * to your backend (POST /api/feedback, etc.).
 */
const ShipmentFeedback = ({ reference }) => {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);

    try {
      // TODO: Replace with real API call later
      // await fetch("/api/feedback", { method: "POST", body: JSON.stringify({ reference, message }) });

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

const ShipmentDetails = () => {
  const { id } = useParams(); // id is the reference string, e.g. ELLX-2025-001
  const shipment = shipments.find((s) => s.id === id);

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

  return (
    <div className="bg-[#1A2930] min-h-[60vh] py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Top bar: back + portal context */}
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

        {/* Main card */}
        <div className="bg-white rounded-xl shadow-xl border border-[#9A9EAB]/40 overflow-hidden">
          {/* Header strip */}
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

          {/* Body */}
          <div className="px-5 py-5 space-y-6">
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

            {/* Mode-specific details */}
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

            {/* Weight / Cost / Account */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-2">
                  Weight
                </p>
                <div className="flex items-center gap-2 text-sm text-[#1A2930]">
                  <FaWeightHanging className="text-[#1A2930]" />
                  <span>{shipment.weight} kg</span>
                </div>
              </div>

              <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-2">
                  Freight cost
                </p>
                <div className="flex items-center gap-2 text-sm text-[#1A2930]">
                  <FaPoundSign className="text-[#1A2930]" />
                  <span>{shipment.cost.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-2">
                  Account holder
                </p>
                <div className="flex items-center gap-2 text-sm text-[#1A2930]">
                  <FaUser className="text-[#1A2930]" />
                  <span>{shipment.accountHolder}</span>
                </div>
              </div>
            </div>

            {/* Parties – Shipper & Consignee */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-2">
                  Shipper details
                </p>
                <p className="text-sm font-semibold text-[#1A2930]">
                  {shipment.shipper}
                </p>
                {shipment.shipperContact && (
                  <div className="mt-2 text-xs md:text-sm text-slate-600 space-y-1">
                    <p>{shipment.shipperContact.address}</p>
                    <p>Email: {shipment.shipperContact.email}</p>
                    <p>Tel: {shipment.shipperContact.telephone}</p>
                  </div>
                )}
              </div>

              <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-2">
                  Consignee details
                </p>
                <p className="text-sm font-semibold text-[#1A2930]">
                  {shipment.consignee}
                </p>
                {shipment.consigneeContact && (
                  <div className="mt-2 text-xs md:text-sm text-slate-600 space-y-1">
                    <p>{shipment.consigneeContact.address}</p>
                    <p>Email: {shipment.consigneeContact.email}</p>
                    <p>Tel: {shipment.consigneeContact.telephone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-2">
                Documents
              </p>

              {shipment.documents && shipment.documents.length > 0 ? (
                <div className="space-y-2">
                  {shipment.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-xs md:text-sm text-[#1A2930]"
                    >
                      <div className="flex items-center gap-2">
                        <FaFileAlt className="text-[#9A9EAB]" />
                        <div>
                          <p className="font-semibold">{doc.type}</p>
                          <p className="text-[11px] text-slate-500">
                            {doc.status}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.available ? (
                          <>
                            <button
                              className="
                                px-3 py-1 rounded-full text-[11px] font-semibold
                                bg-[#1A2930] text-white
                                hover:bg-[#FFA500] hover:text-[#1A2930]
                                transition
                              "
                            >
                              View
                            </button>
                            <button
                              className="
                                px-3 py-1 rounded-full text-[11px] font-semibold
                                border border-[#1A2930] text-[#1A2930]
                                hover:border-[#FFA500] hover:text-[#FFA500]
                                transition
                              "
                            >
                              Download
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Not yet available
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs md:text-sm text-slate-500">
                  Documents for this shipment will appear here once available.
                </p>
              )}
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
