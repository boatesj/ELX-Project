"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft, FaMapMarkerAlt, FaCalendarAlt, FaTruck,
  FaFileAlt, FaCircle, FaClock, FaCheckCircle,
  FaDownload, FaEye, FaInfoCircle, FaEdit,
} from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { readCustomerToken, CUSTOMER_TOKEN_KEY, API_BASE_URL } from "../lib/customerAuth";
import RequireCustomerAuth from "./RequireCustomerAuth";

const API_V1 = `${API_BASE_URL}/api/v1`;

// ── Helpers ──────────────────────────────────────────────────────────────────

function getStatusClasses(status: unknown): string {
  const s = String(status || "").toLowerCase();
  if (["quoted","quote_sent","quote_ready"].includes(s)) return "bg-[#FFA500]/15 text-[#A16207] border border-[#FFA500]/40";
  if (["customer_requested_changes"].includes(s)) return "bg-amber-500/15 text-amber-700 border border-amber-500/40";
  if (["customer_approved","quote_accepted"].includes(s)) return "bg-emerald-500/15 text-emerald-700 border border-emerald-500/40";
  if (s === "booked") return "bg-[#FFA500]/15 text-[#FFA500] border border-[#FFA500]/50";
  if (["at_origin_yard","loaded","sailed","in transit","in_transit"].includes(s)) return "bg-[#9A9EAB]/20 text-[#1A2930] border border-[#9A9EAB]/60";
  if (["arrived","cleared","delivered"].includes(s)) return "bg-emerald-500/15 text-emerald-700 border border-emerald-500/40";
  if (s === "cancelled") return "bg-red-500/15 text-red-600 border border-red-500/40";
  return "bg-gray-100 text-gray-700 border border-gray-300";
}

function formatModeLabel(mode: unknown): string {
  const m = String(mode || "").toLowerCase();
  const map: Record<string,string> = { roro:"RoRo vehicle shipment", container:"Containerised sea freight", documents:"Secure document shipment", air:"Air freight", lcl:"Less-than-container load (LCL)", pallets:"Palletised freight", parcels:"Parcels / small packages" };
  return map[m] || "Shipment";
}

function statusRank(status: unknown): number {
  const s = String(status || "").toLowerCase();
  if (["delivered"].includes(s)) return 5;
  if (["cleared"].includes(s)) return 4;
  if (["arrived"].includes(s)) return 3;
  if (["sailed","loaded","at_origin_yard"].includes(s)) return 2;
  if (["booked"].includes(s)) return 1;
  return 0;
}

function toTitleCase(s: unknown): string {
  const str = String(s || "").trim();
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toDisplayDate(val: unknown): string {
  if (!val) return "";
  try {
    const d = new Date(String(val));
    if (Number.isNaN(d.getTime())) return String(val);
    return d.toLocaleString("en-GB", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" });
  } catch { return String(val); }
}

function toMoney(value: unknown, currency = "GBP"): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat("en-GB", { style:"currency", currency: String(currency || "GBP").toUpperCase(), maximumFractionDigits:2 }).format(amount);
  } catch { return `${amount.toFixed(2)} ${currency || "GBP"}`; }
}

function pickShipment(payload: unknown): Record<string,unknown> | null {
  const p = payload as Record<string,unknown>;
  if (p?.data && typeof p.data === "object") return p.data as Record<string,unknown>;
  if (p?.shipment && typeof p.shipment === "object") return p.shipment as Record<string,unknown>;
  if (p?._id) return p;
  return null;
}

function canActOnDoc(doc: unknown): boolean {
  return String((doc as Record<string,unknown>)?.fileUrl || "").trim().length > 0;
}

function getDocUrl(doc: unknown): string {
  return String((doc as Record<string,unknown>)?.fileUrl || "").trim();
}

interface TimelineItem {
  id: string; label: string; location: string; at: string;
  state: "done" | "current" | "upcoming"; badge?: string;
}

function buildTimeline(shipment: Record<string,unknown>): TimelineItem[] {
  const raw = Array.isArray(shipment?.trackingEvents) ? shipment.trackingEvents as Record<string,unknown>[] : [];
  const sid = String(shipment?._id || shipment?.id || "");

  if (raw.length) {
    return [...raw]
      .sort((a,b) => new Date(String(a?.date||0)).getTime() - new Date(String(b?.date||0)).getTime())
      .map((e,idx,arr) => ({
        id: `${sid}-t-${idx}`,
        label: String(e?.event || "Update"),
        location: String(e?.location || ""),
        at: e?.date ? toDisplayDate(e.date) : "",
        state: (idx === arr.length-1 ? "current" : "done") as "done"|"current"|"upcoming",
        badge: String(e?.status || "").trim(),
      }))
      .filter(e => e.label.trim().length > 0);
  }

  const rank = statusRank(shipment?.status);
  const bookedAt = shipment?.createdAt ? toDisplayDate(shipment.createdAt) : "";
  const ports = shipment?.ports as Record<string,unknown> || {};

  const base: TimelineItem[] = [
    { id:`${sid}-m-1`, label:"Booking confirmed", location: String(ports?.originPort || shipment?.originAddress || ""), at:bookedAt, state: rank>=1?"done":"upcoming" },
    { id:`${sid}-m-2`, label:"In transit", location:"", at:"", state: rank>=2?(rank===2?"current":"done"):"upcoming" },
    { id:`${sid}-m-3`, label:"Arrived at destination", location: String(ports?.destinationPort || shipment?.destinationAddress || ""), at:"", state: rank>=3?(rank===3?"current":"done"):"upcoming" },
    { id:`${sid}-m-4`, label:"Customs cleared", location:"", at:"", state: rank>=4?(rank===4?"current":"done"):"upcoming" },
    { id:`${sid}-m-5`, label:"Delivered", location: String(shipment?.destinationAddress || ""), at:"", state: rank>=5?"current":"upcoming" },
  ];
  if (rank === 0) base[0].state = "current";
  return base;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MilestoneRow({ item, isLast }: { item: TimelineItem; isLast: boolean }) {
  const state = item.state;
  const done = state === "done";
  const current = state === "current";

  const dot = done ? <FaCheckCircle className="text-emerald-600" /> : current ? <FaCircle className="text-[#FFA500]" /> : <FaCircle className="text-[#9A9EAB]" />;
  const titleColor = done || current ? "text-[#1A2930]" : "text-slate-700";
  const metaColor = done || current ? "text-slate-600" : "text-slate-500";
  const badge = done ? "Completed" : current ? "In progress" : "Upcoming";
  const badgeClass = done ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20" : current ? "bg-[#FFA500]/10 text-[#A16207] border border-[#FFA500]/25" : "bg-slate-500/10 text-slate-700 border border-slate-500/20";

  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center shadow-sm">{dot}</div>
        {!isLast && <div className="w-px flex-1 bg-[#E5E7EB] mt-2" />}
      </div>
      <div className="flex-1 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className={`text-sm md:text-base font-semibold ${titleColor}`}>{toTitleCase(item.label)}</p>
              {item.badge && <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1A2930]/5 text-[#1A2930] border border-[#1A2930]/10">{item.badge}</span>}
            </div>
            <div className={`mt-1 text-xs md:text-sm ${metaColor} space-y-0.5`}>
              {item.location && <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-[#9A9EAB]" /><span className="truncate">{item.location}</span></div>}
              {item.at && <div className="flex items-center gap-2"><FaClock className="text-[#9A9EAB]" /><span className="truncate">{item.at}</span></div>}
            </div>
          </div>
          <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold ${badgeClass}`}>{badge}</span>
        </div>
      </div>
    </div>
  );
}

function ShipmentFeedback({ reference }: { reference: string }) {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-2">Feedback on this shipment</p>
      {submitted && <div className="mb-3 text-xs md:text-sm text-emerald-600">Thank you. Your feedback has been received by the Ellcworth team.</div>}
      <p className="text-xs md:text-sm text-slate-600 mb-3">Tell us briefly how this shipment went or if there&apos;s anything we should review. This isn&apos;t a live chat, but our operations team uses this feedback to improve service.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={800} placeholder="Share any comments about timing, communication or documentation..." className="w-full text-sm border border-[#D1D5DB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500] bg-white" />
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">Reference: {reference}</span>
          <button type="submit" disabled={submitting || !message.trim()}
            className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold transition ${submitting || !message.trim() ? "bg-[#9A9EAB] text-white cursor-not-allowed" : "bg-[#1A2930] text-white hover:bg-[#FFA500] hover:text-[#1A2930]"}`}>
            {submitting ? "Sending..." : "Submit feedback"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function ShipmentDetailsInner({ id }: { id: string }) {
  const router = useRouter();

  const [hasToken, setHasToken] = useState(false);
  useEffect(() => { setHasToken(Boolean(localStorage.getItem(CUSTOMER_TOKEN_KEY) || sessionStorage.getItem(CUSTOMER_TOKEN_KEY))); }, []);


  const [shipment, setShipment] = useState<Record<string,unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [quoteOkMsg, setQuoteOkMsg] = useState("");
  const [quoteErrMsg, setQuoteErrMsg] = useState("");

  useEffect(() => {
    const onStorage = () => setHasToken(Boolean(localStorage.getItem(CUSTOMER_TOKEN_KEY) || sessionStorage.getItem(CUSTOMER_TOKEN_KEY)));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const fetchShipment = async () => {
    const token = readCustomerToken();
    const resp = await fetch(`${API_V1}/shipments/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    const payload = await resp.json().catch(() => ({}));
    const picked = pickShipment(payload);
    if (picked) setShipment(picked);
  };

  useEffect(() => {
    if (!hasToken) { setLoading(false); router.replace("/login"); return; }
    const ac = new AbortController();
    (async () => {
      setLoading(true); setErrMsg("");
      try {
        const token = readCustomerToken();
        const resp = await fetch(`${API_V1}/shipments/${id}`, { headers: { Authorization: `Bearer ${token}` }, signal: ac.signal });
        if (resp.status === 401 || resp.status === 403) { router.replace("/login"); return; }
        if (resp.status === 404) { setShipment(null); setErrMsg("Shipment not found."); return; }
        const payload = await resp.json().catch(() => ({}));
        const picked = pickShipment(payload);
        if (!picked) { setShipment(null); setErrMsg("We received an unexpected response for this shipment."); return; }
        setShipment(picked);
      } catch (e: unknown) {
        if ((e as Error)?.name === "AbortError") return;
        setShipment(null);
        setErrMsg("We couldn't load this shipment right now. Please go back and try again.");
      } finally { setLoading(false); }
    })();
    return () => ac.abort();
  }, [id, router, hasToken]);

  const timeline = useMemo(() => shipment ? buildTimeline(shipment) : [], [shipment]);

  const reference = String(shipment?.referenceNo || "—");
  const bookedAt = shipment?.createdAt ? toDisplayDate(shipment.createdAt) : "";
  const status = shipment?.status || "pending";
  const mode = shipment?.mode || "";
  const ports = shipment?.ports as Record<string,unknown> || {};
  const origin = String(shipment?.originAddress || ports?.originPort || "—");
  const destination = String(shipment?.destinationAddress || ports?.destinationPort || "—");
  const shipperName = String((shipment?.shipper as Record<string,unknown>)?.name || (shipment?.customer as Record<string,unknown>)?.fullname || "—");
  const consigneeName = String((shipment?.consignee as Record<string,unknown>)?.name || "—");
  const documents = Array.isArray(shipment?.documents) ? shipment.documents as Record<string,unknown>[] : [];
  const quote = shipment?.quote && typeof shipment.quote === "object" ? shipment.quote as Record<string,unknown> : null;
  const quoteCurrency = String(quote?.currency || "GBP").trim() || "GBP";
  const quoteLineItems = Array.isArray(quote?.lineItems) ? quote.lineItems as Record<string,unknown>[] : [];
  const quoteSubtotal = quote?.subtotal;
  const quoteTaxTotal = quote?.taxTotal;
  const quoteTotal = quote?.total;
  const quoteValidUntil = quote?.validUntil ? toDisplayDate(quote.validUntil) : "";
  const quoteNotes = String(quote?.notes || "").trim();
  const statusLower = String(status || "").toLowerCase();
  const canApproveQuote = ["quoted","customer_requested_changes"].includes(statusLower);
  const hasApprovedQuote = ["customer_approved","quote_accepted","booked"].includes(statusLower);

  const handleApproveQuote = async () => {
    if (!canApproveQuote || quoteBusy) return;
    setQuoteBusy(true); setQuoteErrMsg(""); setQuoteOkMsg("");
    try {
      const token = readCustomerToken();
      const payload = { action:"approve", response:"approve", decision:"approved", approve:true, message: String(quoteMessage||"").trim(), comments: String(quoteMessage||"").trim() };
      const resp = await fetch(`${API_V1}/shipments/${id}/quote/respond`, { method:"PATCH", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`}, body:JSON.stringify(payload) });
      const data = await resp.json().catch(() => ({}));
      const maybeShipment = pickShipment(data);
      if (maybeShipment) setShipment(maybeShipment); else await fetchShipment();
      setQuoteOkMsg("Thank you. Your quote approval has been sent to Ellcworth Operations.");
      setQuoteMessage("");
    } catch (e: unknown) {
      const d = (e as Record<string,unknown>);
      setQuoteErrMsg(String(((d?.response as Record<string,unknown>)?.data as Record<string,unknown>)?.message || "We could not submit your approval just now. Please try again."));
    } finally { setQuoteBusy(false); }
  };

  const handleRequestChanges = async () => {
    const trimmed = String(quoteMessage || "").trim();
    if (!canApproveQuote || quoteBusy || !trimmed) return;
    setQuoteBusy(true); setQuoteErrMsg(""); setQuoteOkMsg("");
    try {
      const token = readCustomerToken();
      const payload = { action:"request_changes", response:"request_changes", decision:"requested_changes", approve:false, message:trimmed, comments:trimmed, requestedChanges:trimmed };
      const resp = await fetch(`${API_V1}/shipments/${id}/quote/respond`, { method:"PATCH", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`}, body:JSON.stringify(payload) });
      const data = await resp.json().catch(() => ({}));
      const maybeShipment = pickShipment(data);
      if (maybeShipment) setShipment(maybeShipment); else await fetchShipment();
      setQuoteOkMsg("Your requested changes have been sent to Ellcworth Operations.");
      setQuoteMessage("");
    } catch {
      setQuoteErrMsg("We couldn't submit your request right now. Please try again.");
    } finally { setQuoteBusy(false); }
  };

  if (loading) return (
    <div className="bg-[#1A2930] min-h-[60vh] py-8">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <div className="rounded-lg border border-white/10 bg-[#111827] p-6 text-sm text-slate-200">Loading shipment…</div>
      </div>
    </div>
  );

  if (!shipment) return (
    <div className="bg-[#1A2930] min-h-[60vh] py-8">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <Link href="/myshipments" className="inline-flex items-center gap-2 text-xs md:text-sm text-slate-200 hover:text-[#FFA500] transition mb-4">
          <FaArrowLeft /><span>Back to shipments</span>
        </Link>
        <div className="bg-white rounded-xl shadow-xl border border-[#9A9EAB]/40 p-8">
          <h1 className="text-lg md:text-xl font-semibold text-[#1A2930] mb-2">{errMsg || "Shipment not found"}</h1>
          <p className="text-sm text-slate-600">We couldn&apos;t load a shipment matching this reference. Please return to your shipments overview and try again.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#1A2930] min-h-[60vh] py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/myshipments" className="inline-flex items-center gap-2 text-xs md:text-sm text-slate-200 hover:text-[#FFA500] transition">
            <FaArrowLeft /><span>Back to my shipments</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href={`/editbooking/${id}`} className="inline-flex items-center gap-2 text-xs md:text-sm px-3 py-2 rounded-full border border-white/20 text-slate-100 hover:border-[#FFA500] hover:text-[#FFA500] hover:bg-[#FFA500]/10 transition">
              <FaEdit />Edit booking
            </Link>
            <div className="hidden md:flex items-center text-[11px] uppercase tracking-[0.2em] text-[#9A9EAB]">CUSTOMER PORTAL · ELLCWORTH EXPRESS</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-[#9A9EAB]/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB]">Shipment reference</p>
              <h1 className="text-lg md:text-xl font-semibold text-[#1A2930]">{reference}</h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1">{formatModeLabel(mode)}</p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(status)}`}>{String(status || "pending")}</span>
              <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600"><FaCalendarAlt className="text-[#9A9EAB]" /><span>Booked: {bookedAt || "—"}</span></div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600"><FaTruck className="text-[#9A9EAB]" /><span>{String(ports?.destinationPort || destination)}</span></div>
            </div>
          </div>

          <div className="px-5 py-5 space-y-6">
            {/* Quote section */}
            {(quote || canApproveQuote || hasApprovedQuote) && (
              <div className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E5E7EB] bg-white">
                  <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB]">Quote response</p>
                  <p className="text-xs md:text-sm text-slate-600 mt-1">Review the quotation details below. You can approve the quote or request adjustments before Ellcworth confirms booking.</p>
                </div>
                <div className="p-4 space-y-4">
                  {quote && (
                    <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
                      <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB] flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="text-sm font-semibold text-[#1A2930]">Current quotation</div>
                        <div className="text-xs text-slate-500">{quoteValidUntil ? `Valid until: ${quoteValidUntil}` : "Validity: —"}</div>
                      </div>
                      <div className="p-4 space-y-4">
                        {quoteLineItems.length > 0 ? (
                          <div className="rounded-lg border border-[#E5E7EB] overflow-hidden">
                            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                              <div className="col-span-5">Item</div><div className="col-span-2 text-right">Qty</div><div className="col-span-2 text-right">Unit</div><div className="col-span-3 text-right">Amount</div>
                            </div>
                            {quoteLineItems.map((item, index) => {
                              const label = String(item?.label || `Item ${index+1}`).trim();
                              const qty = Number(item?.qty ?? 1);
                              const unitPrice = Number(item?.unitPrice ?? 0);
                              const amount = item?.amount !== undefined && item?.amount !== null ? Number(item.amount) : qty * unitPrice;
                              return (
                                <div key={`${label}-${index}`} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm border-b border-[#E5E7EB] last:border-b-0">
                                  <div className="col-span-5 text-[#1A2930] font-medium">{label}</div>
                                  <div className="col-span-2 text-right text-slate-600">{Number.isFinite(qty) ? qty : "—"}</div>
                                  <div className="col-span-2 text-right text-slate-600">{toMoney(unitPrice, quoteCurrency)}</div>
                                  <div className="col-span-3 text-right text-[#1A2930] font-semibold">{toMoney(amount, quoteCurrency)}</div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="rounded-lg border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-4 text-xs md:text-sm text-slate-600">Line items were not included in the saved quote, but the total below is available.</div>
                        )}
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3"><p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold">Subtotal</p><p className="mt-1 text-base font-semibold text-[#1A2930]">{toMoney(quoteSubtotal, quoteCurrency)}</p></div>
                          <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3"><p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold">Tax</p><p className="mt-1 text-base font-semibold text-[#1A2930]">{toMoney(quoteTaxTotal, quoteCurrency)}</p></div>
                          <div className="rounded-lg border border-[#FFA500]/30 bg-[#FFA500]/10 px-4 py-3"><p className="text-[11px] uppercase tracking-[0.14em] text-[#A16207] font-semibold">Total</p><p className="mt-1 text-lg font-bold text-[#1A2930]">{toMoney(quoteTotal, quoteCurrency)}</p></div>
                        </div>
                        {quoteNotes && <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3"><p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold mb-1">Notes</p><p className="text-sm text-slate-700 whitespace-pre-wrap">{quoteNotes}</p></div>}
                      </div>
                    </div>
                  )}

                  {quoteOkMsg && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{quoteOkMsg}</div>}
                  {quoteErrMsg && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{quoteErrMsg}</div>}

                  {canApproveQuote ? (
                    <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
                      <div className="flex items-start gap-3">
                        <FaInfoCircle className="mt-0.5 text-[#FFA500]" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#1A2930]">Respond to this quotation</p>
                          <p className="mt-1 text-xs md:text-sm text-slate-600">Approve if everything looks right, or request changes if you need Ellcworth to revise the quote first.</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-3">
                        <textarea value={quoteMessage} onChange={(e) => { setQuoteMessage(e.target.value); if (quoteErrMsg) setQuoteErrMsg(""); if (quoteOkMsg) setQuoteOkMsg(""); }} rows={4} maxLength={1200} placeholder="Optional note for approval, or describe the changes you need..." className="w-full text-sm border border-[#D1D5DB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500] bg-white" />
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <p className="text-[11px] text-slate-400">Tip: if requesting changes, briefly explain what needs to be adjusted.</p>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={handleRequestChanges} disabled={quoteBusy || !String(quoteMessage).trim()}
                              className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold border transition ${quoteBusy || !String(quoteMessage).trim() ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-white text-[#1A2930] border-[#1A2930]/30 hover:border-[#FFA500] hover:text-[#FFA500]"}`}>
                              {quoteBusy ? "Sending..." : "Request changes"}
                            </button>
                            <button type="button" onClick={handleApproveQuote} disabled={quoteBusy}
                              className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition ${quoteBusy ? "bg-[#9A9EAB] text-white cursor-not-allowed" : "bg-[#1A2930] text-white hover:bg-[#FFA500] hover:text-[#1A2930]"}`}>
                              {quoteBusy ? "Sending..." : "Approve quote"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : hasApprovedQuote ? (
                    <div className="bg-white rounded-lg border border-emerald-200 p-4">
                      <div className="flex items-start gap-3">
                        <FaCheckCircle className="mt-0.5 text-emerald-600" />
                        <div>
                          <p className="text-sm font-semibold text-[#1A2930]">Quote already approved</p>
                          <p className="mt-1 text-xs md:text-sm text-slate-600">Your approval has been recorded. Ellcworth Operations will continue with booking and next-step coordination.</p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Tracking */}
            <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB]">Tracking & milestones</p>
                  <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-2xl">We post milestone updates as your shipment moves through the process. This is not live GPS tracking, but it will show key changes as they happen.</p>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#1A2930]/5 text-[#1A2930] border border-[#1A2930]/10">Live status: {String(status || "pending")}</span>
              </div>
              <div className="mt-4">
                {timeline.length ? (
                  <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
                    {timeline.map((item, idx) => <MilestoneRow key={item.id} item={item} isLast={idx === timeline.length-1} />)}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-dashed border-[#D1D5DB] p-4 text-xs md:text-sm text-slate-600">No tracking updates are available for this shipment yet. Please check back shortly.</div>
                )}
              </div>
            </div>

            {/* Origin / Destination */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-2">Origin</p>
                <div className="flex items-start gap-2 text-sm text-[#1A2930]">
                  <FaMapMarkerAlt className="mt-0.5 text-[#1A2930]" />
                  <div><p className="font-semibold">{origin}</p><p className="text-xs text-slate-500">Shipper: {shipperName}</p></div>
                </div>
              </div>
              <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-2">Destination</p>
                <div className="flex items-start gap-2 text-sm text-[#1A2930]">
                  <FaMapMarkerAlt className="mt-0.5 text-[#1A2930]" />
                  <div><p className="font-semibold">{destination}</p><p className="text-xs text-slate-500">Consignee: {consigneeName}</p></div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E7EB] bg-white">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB]">Documents</p>
                <p className="text-xs md:text-sm text-slate-600 mt-1">View or download documents shared by Ellcworth Operations. Some documents are only released at specific milestones.</p>
              </div>
              <div className="p-4">
                {documents.length > 0 ? (
                  <div className="divide-y divide-[#E5E7EB] rounded-lg border border-[#E5E7EB] bg-white">
                    {documents.map((doc, index) => {
                      const actionable = canActOnDoc(doc);
                      const nameText = String(doc?.name || "Document").trim();
                      const uploadedAt = doc?.uploadedAt ? toDisplayDate(doc.uploadedAt) : "";
                      return (
                        <div key={`${nameText}-${index}`} className="px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-[#1A2930]/5 border border-[#1A2930]/10 flex items-center justify-center text-[#1A2930]"><FaFileAlt /></div>
                            <div>
                              <p className="text-sm font-semibold text-[#1A2930]">{nameText}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{uploadedAt ? `Uploaded: ${uploadedAt}` : "Uploaded: —"}</p>
                              {!actionable && <p className="mt-1 text-[11px] text-slate-500 inline-flex items-center gap-2"><FaInfoCircle className="text-[#9A9EAB]" />Link not provided yet</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => { const url = getDocUrl(doc); if (url) window.open(url,"_blank","noopener,noreferrer"); }} disabled={!actionable}
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-[12px] font-semibold border transition ${!actionable ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-[#1A2930] text-white border-[#1A2930] hover:bg-[#FFA500] hover:text-[#1A2930] hover:border-[#FFA500]"}`}>
                              <FaEye />View
                            </button>
                            <button type="button" onClick={() => { const url = getDocUrl(doc); if (url) window.open(url,"_blank","noopener,noreferrer"); }} disabled={!actionable}
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-[12px] font-semibold border transition ${!actionable ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-white text-[#1A2930] border-[#1A2930]/40 hover:border-[#FFA500] hover:text-[#FFA500]"}`}>
                              <FaDownload />Download
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[#D1D5DB] bg-white p-4 text-xs md:text-sm text-slate-600">Documents for this shipment will appear here once available.</div>
                )}
              </div>
            </div>

            <ShipmentFeedback reference={reference} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShipmentDetailsClient({ id }: { id: string }) {
  return (
    <RequireCustomerAuth>
      <ShipmentDetailsInner id={id} />
    </RequireCustomerAuth>
  );
}
