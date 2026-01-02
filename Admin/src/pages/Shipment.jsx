import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { authRequest } from "../requestMethods";

import {
  STATUS_OPTIONS,
  CARGO_TYPE_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  MODE_OPTIONS,
  backendModeToUiMode,
  uiModeToBackendMode,
  formatStatusLabel,
  getStatusClasses,
  formatServiceLabelShort,
  formatModeBadge,
  REQUEST_STATUSES,
} from "./shipment/shipmentConstants";

import {
  toMoney,
  formatMoney,
  computeUiTotals,
} from "./shipment/shipmentMoney";

import DocumentsPanel from "./shipment/DocumentsPanel";

// ---------- Small UI helpers (mobile-first) ----------
const Card = ({ title, children, right }) => (
  <div className="bg-white rounded-md p-4 shadow-sm space-y-3">
    <div className="flex items-start justify-between gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
        {title}
      </h2>
      {right ? <div>{right}</div> : null}
    </div>
    {children}
  </div>
);

const Section = ({ title, subtitle, open, onToggle, children }) => (
  <div className="bg-white rounded-md shadow-sm">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-start justify-between gap-4 px-4 py-3 text-left border-b border-slate-100"
    >
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
          {title}
        </h3>
        {subtitle ? (
          <p className="text-[11px] text-gray-500 mt-1">{subtitle}</p>
        ) : null}
      </div>
      <span className="text-xs font-semibold text-[#1A2930]">
        {open ? "Hide" : "Show"}
      </span>
    </button>

    {open ? <div className="px-4 pb-4 pt-3">{children}</div> : null}
  </div>
);

const Field = ({ label, children, hint }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-700">{label}</label>
    {children}
    {hint ? <p className="text-[10px] text-gray-500 mt-0.5">{hint}</p> : null}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className={`border border-gray-300 rounded px-3 py-2 text-sm w-full bg-white ${
      props.className || ""
    }`}
  />
);

const Select = (props) => (
  <select
    {...props}
    className={`border border-gray-300 rounded px-3 py-2 text-sm w-full bg-white ${
      props.className || ""
    }`}
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className={`border border-gray-300 rounded px-3 py-2 text-sm w-full bg-white ${
      props.className || ""
    }`}
  />
);

// ✅ normalize docs returned by backend safely
const extractDocumentsFromResponse = (res) => {
  const d1 = res?.data?.data;
  const d2 = res?.data?.documents;
  const d3 = res?.data?.shipment?.documents;
  const d4 = res?.data?.shipment?.data?.documents;
  const docs = d3 || d4 || d2 || d1;
  return Array.isArray(docs) ? docs : [];
};

const Shipment = () => {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Document section state
  const [newDocName, setNewDocName] = useState("");
  const [docError, setDocError] = useState("");

  // Document upload state
  const [newDocFile, setNewDocFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ✅ NEW: lets us clear the actual browser file input value
  const fileInputRef = useRef(null);

  // Quote section state
  const [quoteSaving, setQuoteSaving] = useState(false);
  const [quoteSending, setQuoteSending] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [quoteMsg, setQuoteMsg] = useState("");
  const [statusActing, setStatusActing] = useState(false);

  // Mobile section toggles
  const [openService, setOpenService] = useState(true);
  const [openVessel, setOpenVessel] = useState(false);
  const [openParties, setOpenParties] = useState(false);
  const [openCargo, setOpenCargo] = useState(false);
  const [openDocs, setOpenDocs] = useState(false);
  const [openServices, setOpenServices] = useState(false);
  const [openQuote, setOpenQuote] = useState(false);

  const [form, setForm] = useState({
    // Core identifiers
    referenceNo: "",
    cargoType: "",
    serviceType: "sea_freight",
    mode: "roro",

    // Route & schedule
    originPort: "",
    destinationPort: "",
    status: "pending",
    paymentStatus: "unpaid",
    shippingDate: "",
    eta: "",

    // Shipper
    shipperName: "",
    shipperAddress: "",
    shipperEmail: "",
    shipperPhone: "",

    // Consignee
    consigneeName: "",
    consigneeAddress: "",
    consigneeEmail: "",
    consigneePhone: "",

    // Notify party
    notifyName: "",
    notifyAddress: "",
    notifyEmail: "",
    notifyPhone: "",

    // Vessel / Flight
    vesselName: "",
    vesselVoyage: "",

    // Cargo – generic
    cargoDescription: "",
    cargoWeight: "",

    // Vehicle (RoRo)
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    vehicleVin: "",

    // Container
    containerNo: "",
    containerSize: "",
    containerSealNo: "",

    // Repacking / value-added services
    repackingRequired: false,
    repackingNotes: "",
  });

  const [quoteForm, setQuoteForm] = useState({
    currency: "GBP",
    validUntil: "",
    notesToCustomer: "",
    internalNotes: "",
    lineItems: [
      {
        code: "",
        label: "Freight",
        qty: 1,
        unitPrice: 0,
        amount: "",
        taxRate: 0,
      },
    ],
  });

  const handleBack = () => navigate("/shipments");

  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    setForm((prev) => {
      if (field === "serviceType") {
        const newServiceType = value;
        const firstMode = MODE_OPTIONS[newServiceType]?.[0]?.value || "";
        return { ...prev, serviceType: newServiceType, mode: firstMode };
      }
      return { ...prev, [field]: value };
    });
  };

  // Deep link: #documents / #quote
  useEffect(() => {
    if (location.hash === "#documents") {
      setOpenDocs(true);
      window.setTimeout(() => {
        const el = document.getElementById("documents-anchor");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }

    if (location.hash === "#quote") {
      setOpenQuote(true);
      window.setTimeout(() => {
        const el = document.getElementById("quote-anchor");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  }, [location.hash]);

  // ---------------- FETCH EXISTING SHIPMENT (EDIT MODE) ----------------
  useEffect(() => {
    const fetchShipment = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await authRequest.get(`/shipments/${shipmentId}`);
        const s = res.data?.shipment || res.data?.data || res.data;

        if (!s) {
          setShipment(null);
          setErrorMsg("Shipment not found.");
          return;
        }

        const inferredServiceType =
          s.serviceType ||
          (s.mode && String(s.mode).toLowerCase().startsWith("air")
            ? "air_freight"
            : "sea_freight");

        const uiMode = backendModeToUiMode(inferredServiceType, s.mode);

        setShipment({ ...s, documents: s.documents || [] });

        setForm({
          referenceNo: s.referenceNo || "",
          cargoType: s.cargoType || "",
          serviceType: inferredServiceType,
          mode: uiMode,

          originPort: s.ports?.originPort || "",
          destinationPort: s.ports?.destinationPort || "",
          status: s.status || "pending",
          paymentStatus: s.paymentStatus || "unpaid",
          shippingDate: s.shippingDate
            ? new Date(s.shippingDate).toISOString().slice(0, 10)
            : "",
          eta: s.eta ? new Date(s.eta).toISOString().slice(0, 10) : "",

          shipperName: s.shipper?.name || "",
          shipperAddress: s.shipper?.address || "",
          shipperEmail: s.shipper?.email || "",
          shipperPhone: s.shipper?.phone || "",

          consigneeName: s.consignee?.name || "",
          consigneeAddress: s.consignee?.address || "",
          consigneeEmail: s.consignee?.email || "",
          consigneePhone: s.consignee?.phone || "",

          notifyName: s.notify?.name || "",
          notifyAddress: s.notify?.address || "",
          notifyEmail: s.notify?.email || "",
          notifyPhone: s.notify?.phone || "",

          vesselName: s.vessel?.name || "",
          vesselVoyage: s.vessel?.voyage || "",

          cargoDescription: s.cargo?.description || "",
          cargoWeight: s.cargo?.weight || "",

          vehicleMake: s.cargo?.vehicle?.make || "",
          vehicleModel: s.cargo?.vehicle?.model || "",
          vehicleYear: s.cargo?.vehicle?.year || "",
          vehicleVin: s.cargo?.vehicle?.vin || "",

          containerNo: s.cargo?.container?.containerNo || "",
          containerSize: s.cargo?.container?.size || "",
          containerSealNo: s.cargo?.container?.sealNo || "",

          repackingRequired: s.services?.repacking?.required ?? false,
          repackingNotes: s.services?.repacking?.notes || "",
        });

        // Quote -> Admin UI form
        const q = s.quote || null;
        const quoteLineItems =
          Array.isArray(q?.lineItems) && q.lineItems.length > 0
            ? q.lineItems.map((li) => ({
                code: li.code || "",
                label: li.label || "",
                qty: li.qty ?? 1,
                unitPrice: li.unitPrice ?? 0,
                amount: li.amount ?? "",
                taxRate: li.taxRate ?? 0,
              }))
            : [
                {
                  code: "",
                  label: "Freight",
                  qty: 1,
                  unitPrice: 0,
                  amount: "",
                  taxRate: 0,
                },
              ];

        setQuoteForm({
          currency: q?.currency || "GBP",
          validUntil: q?.validUntil
            ? new Date(q.validUntil).toISOString().slice(0, 10)
            : "",
          notesToCustomer: q?.notesToCustomer || "",
          internalNotes: q?.internalNotes || "",
          lineItems: quoteLineItems,
        });

        // Auto-open quote section if in request pipeline
        if (REQUEST_STATUSES.has(s.status)) {
          setOpenQuote(true);
        }
      } catch (error) {
        console.error(
          "❌ Error fetching shipment:",
          error.response?.data || error
        );
        setErrorMsg(
          error.response?.data?.message || "Could not load shipment details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (shipmentId) fetchShipment();
  }, [shipmentId]);

  // ---------------- PAYLOAD BUILDER (single source of truth) ----------------
  const buildUpdatePayload = (override = {}) => {
    const backendMode = uiModeToBackendMode(form.serviceType, form.mode);

    const payload = {
      referenceNo: form.referenceNo || shipment?.referenceNo,
      serviceType: form.serviceType,
      mode: backendMode,
      status: form.status,
      paymentStatus: form.paymentStatus || "unpaid",

      ports: {
        originPort: form.originPort,
        destinationPort: form.destinationPort,
      },

      shipper: {
        name: form.shipperName,
        address: form.shipperAddress,
        email: form.shipperEmail,
        phone: form.shipperPhone,
      },
      consignee: {
        name: form.consigneeName,
        address: form.consigneeAddress,
        email: form.consigneeEmail,
        phone: form.consigneePhone,
      },
      notify: {
        name: form.notifyName,
        address: form.notifyAddress,
        email: form.notifyEmail,
        phone: form.notifyPhone,
      },
      vessel: {
        name: form.vesselName,
        voyage: form.vesselVoyage,
      },
      shippingDate: form.shippingDate
        ? new Date(form.shippingDate)
        : shipment?.shippingDate,
      eta: form.eta ? new Date(form.eta) : shipment?.eta,

      cargo: {
        description: form.cargoDescription,
        weight: form.cargoWeight,
        vehicle: {
          make: form.vehicleMake,
          model: form.vehicleModel,
          year: form.vehicleYear,
          vin: form.vehicleVin,
        },
        container: {
          containerNo: form.containerNo,
          size: form.containerSize,
          sealNo: form.containerSealNo,
        },
      },
      services: {
        repacking: {
          required: form.repackingRequired,
          notes: form.repackingNotes,
        },
      },
      ...override,
    };

    if (form.cargoType) payload.cargoType = form.cargoType;
    return payload;
  };

  // ---------------- SAVE / UPDATE BOOKING ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shipmentId || !shipment) return;

    try {
      setSaving(true);
      setErrorMsg("");

      const payload = buildUpdatePayload();

      const res = await authRequest.put(`/shipments/${shipmentId}`, payload);
      const updated = res.data?.shipment || res.data?.data || res.data;

      setShipment((prev) => ({ ...(prev || {}), ...(updated || {}) }));

      alert("Shipment updated successfully.");
    } catch (error) {
      console.error(
        "❌ Error updating shipment:",
        error.response?.data || error
      );
      setErrorMsg(
        error.response?.data?.message || "Failed to update this shipment."
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------- QUICK STATUS ACTIONS (Option B) ----------------
  const quickSetStatus = async (nextStatus, opts = {}) => {
    if (!shipmentId || !shipment) return;

    try {
      setStatusActing(true);
      setErrorMsg("");
      setQuoteError("");
      setQuoteMsg("");

      // Keep form in sync immediately (UI feedback)
      setForm((p) => ({ ...p, status: nextStatus }));

      const payload = buildUpdatePayload({ status: nextStatus });

      const res = await authRequest.put(`/shipments/${shipmentId}`, payload);
      const updated = res.data?.shipment || res.data?.data || res.data;

      if (updated) {
        setShipment((prev) => ({ ...(prev || {}), ...(updated || {}) }));
        if (updated?.status) setForm((p) => ({ ...p, status: updated.status }));
      }

      setQuoteMsg(
        opts?.successMsg ||
          `Status updated to ${formatStatusLabel(nextStatus)}.`
      );
    } catch (err) {
      console.error("❌ Error updating status:", err?.response?.data || err);

      // revert to current shipment status if possible
      const fallback = shipment?.status || form.status;
      setForm((p) => ({ ...p, status: fallback }));

      setQuoteError(
        err?.response?.data?.message ||
          "Failed to update status. Please try again."
      );
    } finally {
      setStatusActing(false);
    }
  };

  // ---------------- DOCUMENTS: UPLOAD FILE ----------------
  const handleUploadDocument = async () => {
    if (!shipmentId) return;

    if (!newDocName.trim()) {
      setDocError("Please provide a document name before uploading.");
      return;
    }

    if (!newDocFile) {
      setDocError("Please choose a file to upload.");
      return;
    }

    try {
      setUploadingDoc(true);
      setUploadProgress(0);
      setDocError("");

      const formData = new FormData();
      formData.append("name", newDocName.trim());
      formData.append("file", newDocFile);

      const res = await authRequest.post(
        `/shipments/${shipmentId}/documents/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (evt) => {
            const total = evt.total || 0;
            if (!total) return;
            const pct = Math.round((evt.loaded * 100) / total);
            setUploadProgress(pct);
          },
        }
      );

      const docs = extractDocumentsFromResponse(res);
      if (Array.isArray(docs)) {
        setShipment((prev) => ({ ...(prev || {}), documents: docs }));
      }

      // Reset upload UI (including browser input value)
      setNewDocFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Clear name after success (keeps flow clean)
      setNewDocName("");
    } catch (error) {
      console.error(
        "❌ Error uploading document:",
        error.response?.data || error
      );
      setDocError(
        error.response?.data?.message || "Failed to upload document."
      );
    } finally {
      setUploadingDoc(false);
    }
  };

  // ---------------- QUOTE: UI handlers ----------------
  const quoteTotals = useMemo(() => {
    return computeUiTotals(quoteForm.lineItems);
  }, [quoteForm.lineItems]);

  const setQuoteField = (field) => (e) => {
    const val = e.target.value;
    setQuoteForm((prev) => ({ ...prev, [field]: val }));
  };

  const updateQuoteItem = (idx, field, value) => {
    setQuoteForm((prev) => {
      const items = Array.isArray(prev.lineItems) ? [...prev.lineItems] : [];
      const current = items[idx] || {};
      items[idx] = { ...current, [field]: value };
      return { ...prev, lineItems: items };
    });
  };

  const addQuoteItem = () => {
    setQuoteForm((prev) => ({
      ...prev,
      lineItems: [
        ...(Array.isArray(prev.lineItems) ? prev.lineItems : []),
        { code: "", label: "", qty: 1, unitPrice: 0, amount: "", taxRate: 0 },
      ],
    }));
  };

  const removeQuoteItem = (idx) => {
    setQuoteForm((prev) => {
      const items = Array.isArray(prev.lineItems) ? [...prev.lineItems] : [];
      if (items.length <= 1) return prev; // keep at least one row
      items.splice(idx, 1);
      return { ...prev, lineItems: items };
    });
  };

  const validateQuoteDraft = () => {
    const items = Array.isArray(quoteForm.lineItems) ? quoteForm.lineItems : [];
    const ok = items.some((li) => String(li.label || "").trim());
    if (!ok) return "Quote must contain at least one line item label.";
    if (!form.shipperEmail)
      return "Shipper email is missing (needed to send quote).";
    return "";
  };

  // ✅ FIXED: returns boolean so send flow can stop safely
  const handleSaveQuoteDraft = async () => {
    if (!shipmentId) return false;

    setQuoteMsg("");
    setQuoteError("");

    const vErr = validateQuoteDraft();
    if (vErr) {
      setQuoteError(vErr);
      return false;
    }

    try {
      setQuoteSaving(true);

      const payload = {
        quote: {
          currency: String(quoteForm.currency || "GBP").trim() || "GBP",
          validUntil: quoteForm.validUntil
            ? new Date(quoteForm.validUntil)
            : undefined,
          notesToCustomer: quoteForm.notesToCustomer || "",
          internalNotes: quoteForm.internalNotes || "",
          lineItems: (quoteForm.lineItems || []).map((li) => ({
            code: li.code || "",
            label: li.label || "",
            qty: Number(li.qty ?? 1),
            unitPrice: Number(li.unitPrice ?? 0),
            amount:
              li.amount === "" || li.amount === null || li.amount === undefined
                ? undefined
                : Number(li.amount),
            taxRate: Number(li.taxRate ?? 0),
          })),
        },
      };

      const res = await authRequest.patch(
        `/shipments/${shipmentId}/quote`,
        payload
      );
      const updated = res.data?.shipment || res.data?.data || res.data;

      if (updated)
        setShipment((prev) => ({ ...(prev || {}), ...(updated || {}) }));

      // If backend bumped status from request_received -> under_review, reflect in local form
      const newStatus = updated?.status;
      if (newStatus) setForm((p) => ({ ...p, status: newStatus }));

      setQuoteMsg("Quote draft saved.");
      return true;
    } catch (err) {
      console.error("❌ Error saving quote:", err?.response?.data || err);
      setQuoteError(
        err?.response?.data?.message || "Failed to save quote draft."
      );
      return false;
    } finally {
      setQuoteSaving(false);
    }
  };

  // ✅ FIXED: stop if save fails + use backend status if returned
  const handleSendQuoteEmail = async () => {
    if (!shipmentId) return;

    setQuoteMsg("");
    setQuoteError("");

    const vErr = validateQuoteDraft();
    if (vErr) {
      setQuoteError(vErr);
      return;
    }

    // Best UX: ensure latest draft saved before sending
    const ok = await handleSaveQuoteDraft();
    if (!ok) return;

    try {
      setQuoteSending(true);

      const res = await authRequest.post(
        `/shipments/${shipmentId}/quote/send`,
        {
          // optional override: toEmail
        }
      );

      const updated = res.data?.shipment || res.data?.data || res.data;
      if (updated)
        setShipment((prev) => ({ ...(prev || {}), ...(updated || {}) }));

      const newStatus = updated?.status || "quoted";
      setForm((p) => ({ ...p, status: newStatus }));
      setQuoteMsg(
        `Quote emailed successfully. Status set to ${String(
          newStatus
        ).toUpperCase()}.`
      );
    } catch (err) {
      console.error("❌ Error sending quote:", err?.response?.data || err);
      setQuoteError(err?.response?.data?.message || "Failed to email quote.");
    } finally {
      setQuoteSending(false);
    }
  };

  const isSea = form.serviceType === "sea_freight";
  const isDocs = form.mode === "air_docs";
  const isRoRo = form.mode === "roro" || form.cargoType === "vehicle";
  const isContainerMode =
    form.mode === "fcl" ||
    form.mode === "lcl" ||
    form.cargoType === "container" ||
    form.cargoType === "lcl";

  const currentModeOptions = MODE_OPTIONS[form.serviceType] || [];
  const quoteCurrency = quoteForm.currency || "GBP";
  const sentAt = shipment?.quote?.sentAt
    ? new Date(shipment.quote.sentAt).toLocaleString("en-GB")
    : "";
  const quoteVersion = shipment?.quote?.version || 0;

  // ----- Option B gating -----
  const isRequestPipeline = REQUEST_STATUSES.has(form.status);
  const isQuotedStage =
    form.status === "quoted" || form.status === "customer_requested_changes";
  const isApprovedStage = form.status === "customer_approved";
  const isBookedStage = form.status === "booked";

  const canMarkApproved =
    !statusActing && !saving && !quoteSending && !quoteSaving && isQuotedStage;
  const canConfirmBooking =
    !statusActing &&
    !saving &&
    !quoteSending &&
    !quoteSaving &&
    isApprovedStage;

  if (loading) {
    return (
      <div className="bg-[#D9D9D9] p-3 sm:p-5 lg:m-[30px] lg:p-[20px] rounded-md">
        <button
          onClick={handleBack}
          className="mb-4 inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-[#1A2930] text-white hover:bg-[#FFA500] transition"
        >
          ← Back to all shipments
        </button>
        <p className="text-sm text-gray-700">Loading shipment details...</p>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="bg-[#D9D9D9] p-3 sm:p-5 lg:m-[30px] lg:p-[20px] rounded-md">
        <button
          onClick={handleBack}
          className="mb-4 inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-[#1A2930] text-white hover:bg-[#FFA500] transition"
        >
          ← Back to all shipments
        </button>
        <p className="text-sm text-red-600">
          {errorMsg || "Shipment not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#D9D9D9] rounded-md p-3 sm:p-5 lg:m-[30px] lg:p-[20px] space-y-4 font-montserrat">
      {/* Top bar (mobile-first stack) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={handleBack}
            className="shrink-0 inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-[#1A2930] text-white hover:bg-[#FFA500] transition"
          >
            ← Back
          </button>

          <div>
            <h1 className="text-[18px] sm:text-[20px] font-semibold text-[#1A2930]">
              Admin booking – Shipment
            </h1>
            <p className="text-xs text-gray-600 mt-1 font-mono">
              {form.referenceNo}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px]">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#1A2930] text-white">
                {formatServiceLabelShort(form.serviceType)}
              </span>

              {form.mode ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FFA500]/15 text-[#1A2930] border border-[#FFA500]/40">
                  {formatModeBadge(form.mode)}
                </span>
              ) : null}

              {form.repackingRequired ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Repacking requested
                </span>
              ) : null}

              {isDocs ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Secure documents
                </span>
              ) : null}

              {shipment?.quote?.total ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                  Quote:{" "}
                  {formatMoney(
                    shipment.quote.total,
                    shipment.quote.currency || "GBP"
                  )}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${getStatusClasses(
              form.status
            )}`}
          >
            {formatStatusLabel(form.status)}
          </span>

          <div className="text-[11px] text-gray-500 sm:text-right">
            {shipment.createdAt ? (
              <p>
                Created: {new Date(shipment.createdAt).toLocaleString("en-GB")}
              </p>
            ) : null}
            {shipment.updatedAt ? (
              <p>
                Updated: {new Date(shipment.updatedAt).toLocaleString("en-GB")}
              </p>
            ) : null}
            {sentAt ? <p>Quote sent: {sentAt}</p> : null}
          </div>
        </div>
      </div>

      {errorMsg ? (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
          {errorMsg}
        </p>
      ) : null}

      {/* Desktop layout: 2 columns | Mobile: accordions */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 xl:grid-cols-[1.1fr_1.1fr] gap-4 xl:gap-6 items-start"
      >
        {/* LEFT column */}
        <div className="space-y-4">
          {/* Mobile accordion: Service/Route/Status */}
          <div className="xl:hidden">
            <Section
              title="Service, route & status"
              subtitle="Service type, mode, status, payment, ports and dates."
              open={openService}
              onToggle={() => setOpenService((v) => !v)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Service type">
                  <Select
                    value={form.serviceType}
                    onChange={handleChange("serviceType")}
                  >
                    {SERVICE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Product / mode">
                  <Select value={form.mode} onChange={handleChange("mode")}>
                    {currentModeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Status">
                  <Select value={form.status} onChange={handleChange("status")}>
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {formatStatusLabel(st)}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <Field
                  label="Payment status"
                  hint="Controls how this order appears in the Orders view."
                >
                  <Select
                    value={form.paymentStatus}
                    onChange={handleChange("paymentStatus")}
                  >
                    {PAYMENT_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Cargo type (internal)"
                  hint="Vehicle / container / LCL – used for internal reporting."
                >
                  <Select
                    value={form.cargoType}
                    onChange={handleChange("cargoType")}
                  >
                    <option value="">Select…</option>
                    {CARGO_TYPE_OPTIONS.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct.charAt(0).toUpperCase() + ct.slice(1)}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <Field
                  label={isSea ? "Origin port" : "Origin airport / location"}
                >
                  <Input
                    type="text"
                    value={form.originPort}
                    onChange={handleChange("originPort")}
                    placeholder={isSea ? "Southampton" : "Heathrow (LHR)"}
                  />
                </Field>
                <Field
                  label={
                    isSea ? "Destination port" : "Destination airport / city"
                  }
                >
                  <Input
                    type="text"
                    value={form.destinationPort}
                    onChange={handleChange("destinationPort")}
                    placeholder={isSea ? "Tema" : "Accra (ACC)"}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <Field
                  label={`ETD (${isSea ? "sailing date" : "departure date"})`}
                >
                  <Input
                    type="date"
                    value={form.shippingDate}
                    onChange={handleChange("shippingDate")}
                  />
                </Field>
                <Field label="ETA (arrival)">
                  <Input
                    type="date"
                    value={form.eta}
                    onChange={handleChange("eta")}
                  />
                </Field>
              </div>
            </Section>
          </div>

          {/* Desktop cards (left) */}
          <div className="hidden xl:block space-y-4">
            <Card title="Service, route & status">
              <div className="grid grid-cols-3 gap-4">
                <Field label="Service type">
                  <Select
                    value={form.serviceType}
                    onChange={handleChange("serviceType")}
                  >
                    {SERVICE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Product / mode">
                  <Select value={form.mode} onChange={handleChange("mode")}>
                    {currentModeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Status">
                  <Select value={form.status} onChange={handleChange("status")}>
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {formatStatusLabel(st)}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-2">
                <Field label="Payment status" hint="Controls Orders view.">
                  <Select
                    value={form.paymentStatus}
                    onChange={handleChange("paymentStatus")}
                  >
                    {PAYMENT_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Cargo type (internal)" hint="Reporting helper.">
                  <Select
                    value={form.cargoType}
                    onChange={handleChange("cargoType")}
                  >
                    <option value="">Select…</option>
                    {CARGO_TYPE_OPTIONS.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct.charAt(0).toUpperCase() + ct.slice(1)}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <Field
                  label={isSea ? "Origin port" : "Origin airport / location"}
                >
                  <Input
                    value={form.originPort}
                    onChange={handleChange("originPort")}
                    placeholder={isSea ? "Southampton" : "Heathrow (LHR)"}
                  />
                </Field>
                <Field
                  label={
                    isSea ? "Destination port" : "Destination airport / city"
                  }
                >
                  <Input
                    value={form.destinationPort}
                    onChange={handleChange("destinationPort")}
                    placeholder={isSea ? "Tema" : "Accra (ACC)"}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <Field
                  label={`ETD (${isSea ? "sailing date" : "departure date"})`}
                >
                  <Input
                    type="date"
                    value={form.shippingDate}
                    onChange={handleChange("shippingDate")}
                  />
                </Field>
                <Field label="ETA (arrival)">
                  <Input
                    type="date"
                    value={form.eta}
                    onChange={handleChange("eta")}
                  />
                </Field>
              </div>
            </Card>
          </div>

          {/* Vessel / Flight */}
          <div className="xl:hidden">
            <Section
              title={
                isSea ? "Vessel (optional)" : "Airline / flight (optional)"
              }
              subtitle="Carrier and reference numbers."
              open={openVessel}
              onToggle={() => setOpenVessel((v) => !v)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={isSea ? "Vessel name" : "Airline / carrier"}>
                  <Input
                    value={form.vesselName}
                    onChange={handleChange("vesselName")}
                    placeholder={isSea ? "MV Great Africa" : "British Airways"}
                  />
                </Field>
                <Field
                  label={isSea ? "Voyage / rotation" : "Flight no. / MAWB"}
                >
                  <Input
                    value={form.vesselVoyage}
                    onChange={handleChange("vesselVoyage")}
                    placeholder={isSea ? "GA123W" : "BA081 / 125-1234 5678"}
                  />
                </Field>
              </div>
            </Section>
          </div>

          <div className="hidden xl:block">
            <Card
              title={
                isSea ? "Vessel (optional)" : "Airline / flight (optional)"
              }
            >
              <div className="grid grid-cols-2 gap-4">
                <Field label={isSea ? "Vessel name" : "Airline / carrier"}>
                  <Input
                    value={form.vesselName}
                    onChange={handleChange("vesselName")}
                    placeholder={isSea ? "MV Great Africa" : "British Airways"}
                  />
                </Field>
                <Field
                  label={isSea ? "Voyage / rotation" : "Flight no. / MAWB"}
                >
                  <Input
                    value={form.vesselVoyage}
                    onChange={handleChange("vesselVoyage")}
                    placeholder={isSea ? "GA123W" : "BA081 / 125-1234 5678"}
                  />
                </Field>
              </div>
            </Card>
          </div>

          {/* Value-added services */}
          <div className="xl:hidden">
            <Section
              title="Value-added services"
              subtitle="Repacking and consolidation needs."
              open={openServices}
              onToggle={() => setOpenServices((v) => !v)}
            >
              <div className="flex items-start gap-2">
                <input
                  id="repackingRequired"
                  type="checkbox"
                  checked={form.repackingRequired}
                  onChange={handleChange("repackingRequired")}
                  className="mt-1 h-4 w-4 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label
                    htmlFor="repackingRequired"
                    className="text-xs font-medium text-gray-700"
                  >
                    Repacking / consolidation required
                  </label>
                  <p className="text-[10px] text-gray-500">
                    For loose items, pallets or secure documents needing
                    re-boxing, tamper-proof packaging or consolidation.
                  </p>
                </div>
              </div>

              {form.repackingRequired ? (
                <div className="mt-3">
                  <Textarea
                    value={form.repackingNotes}
                    onChange={handleChange("repackingNotes")}
                    className="h-[90px]"
                    placeholder="E.g. Repack certificates into tamper-proof envelopes; add bubble wrap; label as 'Secure documents – handle with care'."
                  />
                </div>
              ) : null}
            </Section>
          </div>

          <div className="hidden xl:block">
            <Card title="Value-added services">
              <div className="flex items-start gap-2">
                <input
                  id="repackingRequiredDesk"
                  type="checkbox"
                  checked={form.repackingRequired}
                  onChange={handleChange("repackingRequired")}
                  className="mt-1 h-4 w-4 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label
                    htmlFor="repackingRequiredDesk"
                    className="text-xs font-medium text-gray-700"
                  >
                    Repacking / consolidation required
                  </label>
                  <p className="text-[10px] text-gray-500">
                    For loose items, pallets or secure documents needing
                    re-boxing, tamper-proof packaging or consolidation.
                  </p>
                </div>
              </div>

              {form.repackingRequired ? (
                <div className="mt-3">
                  <Textarea
                    value={form.repackingNotes}
                    onChange={handleChange("repackingNotes")}
                    className="h-[80px]"
                    placeholder="E.g. Repack certificates into tamper-proof envelopes; add bubble wrap; label as 'Secure documents – handle with care'."
                  />
                </div>
              ) : null}
            </Card>
          </div>
        </div>

        {/* RIGHT column */}
        <div className="space-y-4">
          {/* ✅ QUOTE BUILDER (mobile accordion) */}
          <div className="xl:hidden">
            <Section
              title="Quote builder"
              subtitle="Create the quote lines, save, then email customer."
              open={openQuote}
              onToggle={() => setOpenQuote((v) => !v)}
            >
              <div id="quote-anchor" />

              {quoteError ? (
                <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
                  {quoteError}
                </p>
              ) : null}

              {quoteMsg ? (
                <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-md">
                  {quoteMsg}
                </p>
              ) : null}

              {isRequestPipeline ? (
                <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
                  <span className="font-semibold">Next steps:</span> Email quote
                  → mark approval → confirm booking.
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Currency">
                  <Select
                    value={quoteForm.currency}
                    onChange={setQuoteField("currency")}
                  >
                    {["GBP", "USD", "EUR", "GHS", "NGN"].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Valid until">
                  <Input
                    type="date"
                    value={quoteForm.validUntil}
                    onChange={setQuoteField("validUntil")}
                  />
                </Field>
              </div>

              <div className="mt-3">
                <p className="text-[11px] font-semibold text-gray-700">
                  Line items
                </p>

                <div className="mt-2 space-y-2">
                  {(quoteForm.lineItems || []).map((li, idx) => (
                    <div
                      key={`${idx}-${li.code || "li"}`}
                      className="border border-slate-200 rounded-md p-3 bg-white"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          value={li.label || ""}
                          onChange={(e) =>
                            updateQuoteItem(idx, "label", e.target.value)
                          }
                          placeholder="Label (e.g. Ocean freight, UK handling)"
                        />
                        <Input
                          value={li.code || ""}
                          onChange={(e) =>
                            updateQuoteItem(idx, "code", e.target.value)
                          }
                          placeholder="Code (optional)"
                          className="font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                        <Input
                          type="number"
                          value={li.qty ?? 1}
                          onChange={(e) =>
                            updateQuoteItem(idx, "qty", e.target.value)
                          }
                          placeholder="Qty"
                          min="0"
                          step="1"
                        />
                        <Input
                          type="number"
                          value={li.unitPrice ?? 0}
                          onChange={(e) =>
                            updateQuoteItem(idx, "unitPrice", e.target.value)
                          }
                          placeholder="Unit price"
                          min="0"
                          step="0.01"
                        />
                        <Input
                          type="number"
                          value={li.amount ?? ""}
                          onChange={(e) =>
                            updateQuoteItem(idx, "amount", e.target.value)
                          }
                          placeholder="Amount (optional)"
                          min="0"
                          step="0.01"
                        />
                        <Input
                          type="number"
                          value={li.taxRate ?? 0}
                          onChange={(e) =>
                            updateQuoteItem(idx, "taxRate", e.target.value)
                          }
                          placeholder="Tax %"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-gray-600">
                          Line tax:{" "}
                          {formatMoney(
                            (toMoney(
                              li.amount ||
                                Number(li.qty || 1) * Number(li.unitPrice || 0)
                            ) *
                              Number(li.taxRate || 0)) /
                              100,
                            quoteCurrency
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeQuoteItem(idx)}
                          className="text-[11px] font-semibold text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={addQuoteItem}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-900 hover:bg-slate-200 transition"
                  >
                    + Add line
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3">
                <Field label="Notes to customer">
                  <Textarea
                    value={quoteForm.notesToCustomer}
                    onChange={setQuoteField("notesToCustomer")}
                    className="h-[80px]"
                    placeholder="Customer-visible notes (e.g. exclusions, required documents, delivery window)."
                  />
                </Field>

                <Field label="Internal notes (admin only)">
                  <Textarea
                    value={quoteForm.internalNotes}
                    onChange={setQuoteField("internalNotes")}
                    className="h-[70px]"
                    placeholder="Internal notes (margin, supplier refs, caveats)."
                  />
                </Field>
              </div>

              <div className="mt-3 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    {formatMoney(quoteTotals.subtotal, quoteCurrency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px] mt-1">
                  <span className="text-slate-600">Tax</span>
                  <span className="font-semibold text-slate-900">
                    {formatMoney(quoteTotals.taxTotal, quoteCurrency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px] mt-2">
                  <span className="text-slate-900 font-semibold">Total</span>
                  <span className="font-extrabold text-slate-900">
                    {formatMoney(quoteTotals.total, quoteCurrency)}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleSaveQuoteDraft}
                    disabled={quoteSaving || quoteSending || statusActing}
                    className="inline-flex items-center justify-center px-3 py-2 text-xs font-semibold rounded-md bg-[#1A2930] text-white hover:bg-[#0f1a1f] transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {quoteSaving
                      ? "Saving..."
                      : `Save quote draft${
                          quoteVersion ? ` (v${quoteVersion})` : ""
                        }`}
                  </button>

                  <button
                    type="button"
                    onClick={handleSendQuoteEmail}
                    disabled={quoteSaving || quoteSending || statusActing}
                    className="inline-flex items-center justify-center px-3 py-2 text-xs font-semibold rounded-md bg-[#FFA500] text-black hover:bg-[#e69300] transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {quoteSending ? "Sending..." : "Email quote to customer"}
                  </button>
                </div>

                {/* Option B status actions */}
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const ok = window.confirm(
                        "Mark this quote as customer approved?"
                      );
                      if (!ok) return;
                      quickSetStatus("customer_approved", {
                        successMsg:
                          "Customer approval recorded. You can now confirm booking.",
                      });
                    }}
                    disabled={!canMarkApproved}
                    className="inline-flex items-center justify-center px-3 py-2 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      canMarkApproved
                        ? "Record approval and move to booking step"
                        : "Available when status is Quoted / Requested changes"
                    }
                  >
                    {statusActing ? "Updating..." : "Mark customer approved"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const ok = window.confirm(
                        "Confirm booking now? This will move the shipment to BOOKED."
                      );
                      if (!ok) return;
                      quickSetStatus("booked", {
                        successMsg:
                          "Booking confirmed. Shipment moved to BOOKED.",
                      });
                    }}
                    disabled={!canConfirmBooking}
                    className="inline-flex items-center justify-center px-3 py-2 text-xs font-semibold rounded-md bg-[#1A2930] text-white hover:bg-[#0f1a1f] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      canConfirmBooking
                        ? "Confirm booking and move to operational pipeline"
                        : "Available after customer approval"
                    }
                  >
                    {statusActing ? "Updating..." : "Confirm booking"}
                  </button>
                </div>

                <p className="text-[10px] text-slate-500 mt-2">
                  Recipient:{" "}
                  <span className="font-mono">{form.shipperEmail || "—"}</span>
                </p>

                {isBookedStage ? (
                  <p className="text-[10px] text-slate-600 mt-1">
                    Status is <span className="font-semibold">BOOKED</span>.
                    Continue operational updates as shipment progresses.
                  </p>
                ) : null}
              </div>
            </Section>
          </div>

          {/* ✅ QUOTE BUILDER (desktop card) */}
          <div className="hidden xl:block">
            <Card
              title="Quote builder"
              right={
                shipment?.quote?.sentAt ? (
                  <span className="text-[11px] px-2 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                    Sent · {sentAt}
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                    Draft
                  </span>
                )
              }
            >
              <div id="quote-anchor" />

              {quoteError ? (
                <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
                  {quoteError}
                </p>
              ) : null}

              {quoteMsg ? (
                <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-md">
                  {quoteMsg}
                </p>
              ) : null}

              {isRequestPipeline ? (
                <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
                  <span className="font-semibold">Next steps:</span> Email quote
                  → mark approval → confirm booking.
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <Field label="Currency">
                  <Select
                    value={quoteForm.currency}
                    onChange={setQuoteField("currency")}
                  >
                    {["GBP", "USD", "EUR", "GHS", "NGN"].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Valid until">
                  <Input
                    type="date"
                    value={quoteForm.validUntil}
                    onChange={setQuoteField("validUntil")}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-700">
                  Line items
                </p>
                <div className="mt-2 space-y-2">
                  {(quoteForm.lineItems || []).map((li, idx) => (
                    <div
                      key={`${idx}-${li.code || "li"}`}
                      className="border border-slate-200 rounded-md p-3 bg-white"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          value={li.label || ""}
                          onChange={(e) =>
                            updateQuoteItem(idx, "label", e.target.value)
                          }
                          placeholder="Label (e.g. Ocean freight, UK handling)"
                        />
                        <Input
                          value={li.code || ""}
                          onChange={(e) =>
                            updateQuoteItem(idx, "code", e.target.value)
                          }
                          placeholder="Code (optional)"
                          className="font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-4 gap-3 mt-2">
                        <Input
                          type="number"
                          value={li.qty ?? 1}
                          onChange={(e) =>
                            updateQuoteItem(idx, "qty", e.target.value)
                          }
                          placeholder="Qty"
                          min="0"
                          step="1"
                        />
                        <Input
                          type="number"
                          value={li.unitPrice ?? 0}
                          onChange={(e) =>
                            updateQuoteItem(idx, "unitPrice", e.target.value)
                          }
                          placeholder="Unit price"
                          min="0"
                          step="0.01"
                        />
                        <Input
                          type="number"
                          value={li.amount ?? ""}
                          onChange={(e) =>
                            updateQuoteItem(idx, "amount", e.target.value)
                          }
                          placeholder="Amount (optional)"
                          min="0"
                          step="0.01"
                        />
                        <Input
                          type="number"
                          value={li.taxRate ?? 0}
                          onChange={(e) =>
                            updateQuoteItem(idx, "taxRate", e.target.value)
                          }
                          placeholder="Tax %"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-gray-600">
                          Line tax:{" "}
                          {formatMoney(
                            (toMoney(
                              li.amount ||
                                Number(li.qty || 1) * Number(li.unitPrice || 0)
                            ) *
                              Number(li.taxRate || 0)) /
                              100,
                            quoteCurrency
                          )}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeQuoteItem(idx)}
                          className="text-[11px] font-semibold text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={addQuoteItem}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-900 hover:bg-slate-200 transition"
                  >
                    + Add line
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <Field label="Notes to customer">
                  <Textarea
                    value={quoteForm.notesToCustomer}
                    onChange={setQuoteField("notesToCustomer")}
                    className="h-[90px]"
                    placeholder="Customer-visible notes (e.g. exclusions, required documents, delivery window)."
                  />
                </Field>

                <Field label="Internal notes (admin only)">
                  <Textarea
                    value={quoteForm.internalNotes}
                    onChange={setQuoteField("internalNotes")}
                    className="h-[90px]"
                    placeholder="Internal notes (margin, supplier refs, caveats)."
                  />
                </Field>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-end gap-10">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-500">Subtotal</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {formatMoney(quoteTotals.subtotal, quoteCurrency)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-slate-500">Tax</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {formatMoney(quoteTotals.taxTotal, quoteCurrency)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-slate-500">Total</div>
                    <div className="text-[16px] font-extrabold text-slate-900">
                      {formatMoney(quoteTotals.total, quoteCurrency)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-[11px] text-slate-600">
                    Recipient:{" "}
                    <span className="font-mono">
                      {form.shipperEmail || "—"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveQuoteDraft}
                      disabled={quoteSaving || quoteSending || statusActing}
                      className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-md bg-[#1A2930] text-white hover:bg-[#0f1a1f] transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {quoteSaving
                        ? "Saving..."
                        : `Save quote draft${
                            quoteVersion ? ` (v${quoteVersion})` : ""
                          }`}
                    </button>

                    <button
                      type="button"
                      onClick={handleSendQuoteEmail}
                      disabled={quoteSaving || quoteSending || statusActing}
                      className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-md bg-[#FFA500] text-black hover:bg-[#e69300] transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {quoteSending ? "Sending..." : "Email quote to customer"}
                    </button>
                  </div>
                </div>

                {/* Option B status actions */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const ok = window.confirm(
                        "Mark this quote as customer approved?"
                      );
                      if (!ok) return;
                      quickSetStatus("customer_approved", {
                        successMsg:
                          "Customer approval recorded. You can now confirm booking.",
                      });
                    }}
                    disabled={!canMarkApproved}
                    className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      canMarkApproved
                        ? "Record approval and move to booking step"
                        : "Available when status is Quoted / Requested changes"
                    }
                  >
                    {statusActing ? "Updating..." : "Mark customer approved"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const ok = window.confirm(
                        "Confirm booking now? This will move the shipment to BOOKED."
                      );
                      if (!ok) return;
                      quickSetStatus("booked", {
                        successMsg:
                          "Booking confirmed. Shipment moved to BOOKED.",
                      });
                    }}
                    disabled={!canConfirmBooking}
                    className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-md bg-[#1A2930] text-white hover:bg-[#0f1a1f] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      canConfirmBooking
                        ? "Confirm booking and move to operational pipeline"
                        : "Available after customer approval"
                    }
                  >
                    {statusActing ? "Updating..." : "Confirm booking"}
                  </button>
                </div>

                {isBookedStage ? (
                  <p className="text-[10px] text-slate-600 mt-2">
                    Status is <span className="font-semibold">BOOKED</span>.
                    Continue operational updates as shipment progresses.
                  </p>
                ) : null}
              </div>
            </Card>
          </div>

          {/* Parties (mobile accordion) */}
          <div className="xl:hidden">
            <Section
              title="Parties"
              subtitle="Shipper, consignee and optional notify party."
              open={openParties}
              onToggle={() => setOpenParties((v) => !v)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700">Shipper</p>
                  <Input
                    value={form.shipperName}
                    onChange={handleChange("shipperName")}
                    placeholder="Shipper name"
                  />
                  <Input
                    value={form.shipperAddress}
                    onChange={handleChange("shipperAddress")}
                    placeholder="Address"
                  />
                  <Input
                    type="email"
                    value={form.shipperEmail}
                    onChange={handleChange("shipperEmail")}
                    placeholder="Email"
                  />
                  <Input
                    value={form.shipperPhone}
                    onChange={handleChange("shipperPhone")}
                    placeholder="Phone"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700">
                    Consignee
                  </p>
                  <Input
                    value={form.consigneeName}
                    onChange={handleChange("consigneeName")}
                    placeholder="Consignee name"
                  />
                  <Input
                    value={form.consigneeAddress}
                    onChange={handleChange("consigneeAddress")}
                    placeholder="Address"
                  />
                  <Input
                    type="email"
                    value={form.consigneeEmail}
                    onChange={handleChange("consigneeEmail")}
                    placeholder="Email"
                  />
                  <Input
                    value={form.consigneePhone}
                    onChange={handleChange("consigneePhone")}
                    placeholder="Phone"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-gray-700">
                  Notify party (optional)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Input
                      value={form.notifyName}
                      onChange={handleChange("notifyName")}
                      placeholder="Notify name"
                    />
                    <Input
                      value={form.notifyAddress}
                      onChange={handleChange("notifyAddress")}
                      placeholder="Address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      value={form.notifyEmail}
                      onChange={handleChange("notifyEmail")}
                      placeholder="Email"
                    />
                    <Input
                      value={form.notifyPhone}
                      onChange={handleChange("notifyPhone")}
                      placeholder="Phone"
                    />
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* Parties (desktop card) */}
          <div className="hidden xl:block">
            <Card title="Parties">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700">Shipper</p>
                  <Input
                    value={form.shipperName}
                    onChange={handleChange("shipperName")}
                    placeholder="Shipper name"
                  />
                  <Input
                    value={form.shipperAddress}
                    onChange={handleChange("shipperAddress")}
                    placeholder="Address"
                  />
                  <Input
                    type="email"
                    value={form.shipperEmail}
                    onChange={handleChange("shipperEmail")}
                    placeholder="Email"
                  />
                  <Input
                    value={form.shipperPhone}
                    onChange={handleChange("shipperPhone")}
                    placeholder="Phone"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700">
                    Consignee
                  </p>
                  <Input
                    value={form.consigneeName}
                    onChange={handleChange("consigneeName")}
                    placeholder="Consignee name"
                  />
                  <Input
                    value={form.consigneeAddress}
                    onChange={handleChange("consigneeAddress")}
                    placeholder="Address"
                  />
                  <Input
                    type="email"
                    value={form.consigneeEmail}
                    onChange={handleChange("consigneeEmail")}
                    placeholder="Email"
                  />
                  <Input
                    value={form.consigneePhone}
                    onChange={handleChange("consigneePhone")}
                    placeholder="Phone"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-gray-700">
                  Notify party (optional)
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Input
                      value={form.notifyName}
                      onChange={handleChange("notifyName")}
                      placeholder="Notify name"
                    />
                    <Input
                      value={form.notifyAddress}
                      onChange={handleChange("notifyAddress")}
                      placeholder="Address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      value={form.notifyEmail}
                      onChange={handleChange("notifyEmail")}
                      placeholder="Email"
                    />
                    <Input
                      value={form.notifyPhone}
                      onChange={handleChange("notifyPhone")}
                      placeholder="Phone"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Cargo (mobile accordion) */}
          <div className="xl:hidden">
            <Section
              title="Cargo details"
              subtitle="Description, weight and mode-specific details."
              open={openCargo}
              onToggle={() => setOpenCargo((v) => !v)}
            >
              <Field label="Description">
                <Textarea
                  value={form.cargoDescription}
                  onChange={handleChange("cargoDescription")}
                  className="h-[90px]"
                  placeholder={
                    isDocs
                      ? "Secure academic certificates and transcripts; tamper-proof envelopes."
                      : "Used Nissan Qashqai 1.6 petrol, 5-door, metallic grey…"
                  }
                />
              </Field>

              <div className="mt-3">
                <Field label={isDocs ? "Chargeable weight" : "Weight"}>
                  <Input
                    type="text"
                    value={form.cargoWeight}
                    onChange={handleChange("cargoWeight")}
                    placeholder={isDocs ? "e.g. 5 kg (chargeable)" : "1450 kg"}
                  />
                </Field>
              </div>

              {isRoRo ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700">
                      Vehicle (RoRo)
                    </p>
                    <Input
                      value={form.vehicleMake}
                      onChange={handleChange("vehicleMake")}
                      placeholder="Make"
                    />
                    <Input
                      value={form.vehicleModel}
                      onChange={handleChange("vehicleModel")}
                      placeholder="Model"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      value={form.vehicleYear}
                      onChange={handleChange("vehicleYear")}
                      placeholder="Year"
                    />
                    <Input
                      value={form.vehicleVin}
                      onChange={handleChange("vehicleVin")}
                      placeholder="VIN / chassis no."
                      className="font-mono"
                    />
                  </div>
                </div>
              ) : null}

              {isContainerMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700">
                      Container
                    </p>
                    <Input
                      value={form.containerNo}
                      onChange={handleChange("containerNo")}
                      placeholder={
                        form.mode === "lcl"
                          ? "Groupage container ref (if known)"
                          : "Container no."
                      }
                    />
                    <Input
                      value={form.containerSize}
                      onChange={handleChange("containerSize")}
                      placeholder={
                        form.mode === "lcl"
                          ? "CBM / pallet count"
                          : "Size (20ft / 40ft / 40HC)"
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      value={form.containerSealNo}
                      onChange={handleChange("containerSealNo")}
                      placeholder={
                        form.mode === "lcl" ? "Internal ref / seal" : "Seal no."
                      }
                    />
                  </div>
                </div>
              ) : null}
            </Section>
          </div>

          {/* Cargo (desktop card) */}
          <div className="hidden xl:block">
            <Card title="Cargo details">
              <Field label="Description">
                <Textarea
                  value={form.cargoDescription}
                  onChange={handleChange("cargoDescription")}
                  className="h-[80px]"
                  placeholder={
                    isDocs
                      ? "Secure academic certificates and transcripts; tamper-proof envelopes."
                      : "Used Nissan Qashqai 1.6 petrol, 5-door, metallic grey…"
                  }
                />
              </Field>

              <div className="mt-3">
                <Field label={isDocs ? "Chargeable weight" : "Weight"}>
                  <Input
                    type="text"
                    value={form.cargoWeight}
                    onChange={handleChange("cargoWeight")}
                    placeholder={isDocs ? "e.g. 5 kg (chargeable)" : "1450 kg"}
                  />
                </Field>
              </div>

              {isRoRo ? (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700">
                      Vehicle (RoRo)
                    </p>
                    <Input
                      value={form.vehicleMake}
                      onChange={handleChange("vehicleMake")}
                      placeholder="Make"
                    />
                    <Input
                      value={form.vehicleModel}
                      onChange={handleChange("vehicleModel")}
                      placeholder="Model"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      value={form.vehicleYear}
                      onChange={handleChange("vehicleYear")}
                      placeholder="Year"
                    />
                    <Input
                      value={form.vehicleVin}
                      onChange={handleChange("vehicleVin")}
                      placeholder="VIN / chassis no."
                      className="font-mono"
                    />
                  </div>
                </div>
              ) : null}

              {isContainerMode ? (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700">
                      Container
                    </p>
                    <Input
                      value={form.containerNo}
                      onChange={handleChange("containerNo")}
                      placeholder={
                        form.mode === "lcl"
                          ? "Groupage container ref (if known)"
                          : "Container no."
                      }
                    />
                    <Input
                      value={form.containerSize}
                      onChange={handleChange("containerSize")}
                      placeholder={
                        form.mode === "lcl"
                          ? "CBM / pallet count"
                          : "Size (20ft / 40ft / 40HC)"
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      value={form.containerSealNo}
                      onChange={handleChange("containerSealNo")}
                      placeholder={
                        form.mode === "lcl" ? "Internal ref / seal" : "Seal no."
                      }
                    />
                  </div>
                </div>
              ) : null}
            </Card>
          </div>

          {/* Documents (mobile accordion) */}
          <div className="xl:hidden">
            <Section
              title="Documents"
              subtitle="View and attach shipment documents."
              open={openDocs}
              onToggle={() => setOpenDocs((v) => !v)}
            >
              <div id="documents-anchor" />

              <DocumentsPanel
                documents={shipment.documents || []}
                docError={docError}
                newDocName={newDocName}
                setNewDocName={setNewDocName}
                newDocFile={newDocFile}
                setNewDocFile={(f) => {
                  setNewDocFile(f);
                  setUploadProgress(0);
                }}
                uploadingDoc={uploadingDoc}
                uploadProgress={uploadProgress}
                onUpload={handleUploadDocument}
                fileInputRef={fileInputRef}
              />
            </Section>
          </div>

          {/* Documents (desktop card) */}
          <div className="hidden xl:block">
            <Card title="Documents">
              <div id="documents-anchor" />

              <DocumentsPanel
                documents={shipment.documents || []}
                docError={docError}
                newDocName={newDocName}
                setNewDocName={setNewDocName}
                newDocFile={newDocFile}
                setNewDocFile={(f) => {
                  setNewDocFile(f);
                  setUploadProgress(0);
                }}
                uploadingDoc={uploadingDoc}
                uploadProgress={uploadProgress}
                onUpload={handleUploadDocument}
                fileInputRef={fileInputRef}
              />
            </Card>
          </div>

          {/* Desktop save button */}
          <div className="hidden xl:flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="
                bg-[#1A2930] text-white
                px-6 py-2.5 rounded-md
                hover:bg-[#FFA500] hover:text-black
                font-semibold text-sm transition
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {saving ? "Saving changes..." : "Update shipment"}
            </button>
          </div>
        </div>

        {/* Mobile sticky CTA */}
        <div className="xl:hidden sticky bottom-0 left-0 right-0 pb-3 mt-2">
          <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-md p-3 shadow-lg flex items-center justify-between gap-3">
            <div className="text-[11px] text-gray-600">
              <p className="font-semibold text-[#1A2930]">Ready to save?</p>
              <p>Updates status, payment, route, parties, cargo & docs.</p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="
                shrink-0
                bg-[#1A2930] text-white
                px-4 py-2 rounded-md
                hover:bg-[#FFA500] hover:text-black
                font-semibold text-sm transition
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Shipment;
