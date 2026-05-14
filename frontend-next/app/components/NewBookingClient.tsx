"use client";

import { useMemo, useState } from "react";
import { FaArrowLeft, FaCheckCircle, FaShip, FaTruck } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { readCustomerToken, API_BASE_URL } from "../lib/customerAuth";
import RequireCustomerAuth from "./RequireCustomerAuth";

const API_V1 = `${API_BASE_URL}/api/v1`;

const modes = [
  { value: "RoRo", label: "RoRo vehicle shipment", icon: <FaTruck /> },
  { value: "Container", label: "Containerised sea freight", icon: <FaShip /> },
  { value: "Documents", label: "Secure document shipment", icon: <FaCheckCircle /> },
];

interface FieldError { field: string; message: string; }

function normalizeValidationErrors(data: unknown): FieldError[] {
  const d = data as Record<string, unknown>;
  const list = Array.isArray(d?.errors) ? d.errors as Record<string, unknown>[] : [];
  return list
    .map((e) => ({ field: String(e?.field || "").trim(), message: String(e?.message || "").trim() }))
    .filter((x) => x.field || x.message);
}

function NewBookingInner() {
  const router = useRouter();

  const [form, setForm] = useState({
    mode: "RoRo",
    shipperName: "", shipperAddress: "", shipperEmail: "",
    consigneeName: "", consigneeAddress: "",
    originPort: "", destinationPort: "",
  });

  const [status, setStatus] = useState({
    loading: false, error: "", success: "", fieldErrors: [] as FieldError[],
  });

  const canSubmit = useMemo(() => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(form.shipperEmail || "").trim());
    return Boolean(
      form.mode && form.shipperName.trim() && form.shipperAddress.trim() &&
      emailOk && form.consigneeName.trim() && form.consigneeAddress.trim() &&
      form.originPort.trim() && form.destinationPort.trim()
    );
  }, [form]);

  const onChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    if (status.error || status.fieldErrors.length)
      setStatus((s) => ({ ...s, error: "", fieldErrors: [] }));
  };

  const onPickMode = (value: string) => {
    setForm((p) => ({ ...p, mode: value }));
    if (status.error || status.fieldErrors.length)
      setStatus((s) => ({ ...s, error: "", fieldErrors: [] }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || status.loading) return;

    setStatus({ loading: true, error: "", success: "", fieldErrors: [] });

    try {
      const token = readCustomerToken();
      const payload = {
        mode: form.mode,
        shipper: { name: form.shipperName.trim(), address: form.shipperAddress.trim(), email: form.shipperEmail.trim().toLowerCase() },
        consignee: { name: form.consigneeName.trim(), address: form.consigneeAddress.trim() },
        ports: { originPort: form.originPort.trim(), destinationPort: form.destinationPort.trim() },
      };

      const resp = await fetch(`${API_V1}/shipments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const body = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        const fieldErrors = normalizeValidationErrors(body);
        const msg = (body as Record<string, unknown>)?.message as string || (body as Record<string, unknown>)?.error as string || "We couldn't create this booking. Please try again.";
        setStatus({ loading: false, error: msg, success: "", fieldErrors });
        return;
      }

      const b = body as Record<string, unknown>;
      const created = (b?.shipment || b?.data || b) as Record<string, unknown>;
      const id = created?._id || created?.id;

      setStatus({ loading: false, error: "", success: "Booking created. Redirecting to shipment details…", fieldErrors: [] });
      setTimeout(() => {
        if (id) router.replace(`/shipmentdetails/${String(id)}`);
        else router.replace("/myshipments");
      }, 350);
    } catch (err: unknown) {
      setStatus({ loading: false, error: (err as Error)?.message || "We couldn't create this booking. Please try again.", success: "", fieldErrors: [] });
    }
  };

  return (
    <div className="bg-[#1A2930] min-h-[70vh] py-8 text-white">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/myshipments" className="inline-flex items-center gap-2 text-xs md:text-sm text-slate-200 hover:text-[#FFA500] transition">
            <FaArrowLeft /><span>Back to my shipments</span>
          </Link>
          <div className="hidden md:flex items-center text-[11px] uppercase tracking-[0.2em] text-[#9A9EAB]">
            CUSTOMER PORTAL · NEW BOOKING
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-[#9A9EAB]/40 overflow-hidden text-[#1A2930]">
          <div className="px-6 py-5 border-b border-[#E5E7EB]">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB]">Create a booking</p>
            <h1 className="text-lg md:text-xl font-semibold mt-1">Start a new shipment request</h1>
            <p className="text-sm text-slate-600 mt-2">This form captures the minimum required details to create a shipment. Additional details can be added later by Operations.</p>
          </div>

          <div className="p-6">
            {status.error && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                <div className="font-semibold">Couldn't create booking</div>
                <div className="mt-1">{status.error}</div>
                {status.fieldErrors.length > 0 && (
                  <ul className="mt-3 text-[12px] list-disc pl-5 space-y-1">
                    {status.fieldErrors.map((e, idx) => (
                      <li key={`${e.field}-${idx}`}><span className="font-semibold">{e.field}:</span> {e.message}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {status.success && (
              <div className="mb-4 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800">
                {status.success}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-semibold block mb-2">Shipping mode</label>
                <div className="grid gap-3 md:grid-cols-3">
                  {modes.map((m) => {
                    const active = form.mode === m.value;
                    return (
                      <button key={m.value} type="button" onClick={() => onPickMode(m.value)}
                        className={`rounded-xl border px-4 py-3 text-left transition ${active ? "border-[#FFA500] bg-[#FFA500]/10" : "border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]"}`}>
                        <div className="flex items-center gap-2">
                          <span className={active ? "text-[#FFA500]" : "text-[#1A2930]"}>{m.icon}</span>
                          <span className="text-sm font-semibold">{m.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-3">Shipper details</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold block mb-2">Shipper name</label>
                    <input value={form.shipperName} onChange={onChange("shipperName")} className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]" placeholder="e.g. Jake Boateng" required />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-2">Shipper email</label>
                    <input value={form.shipperEmail} onChange={onChange("shipperEmail")} type="email" className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]" placeholder="e.g. name@company.com" required />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-semibold block mb-2">Shipper address</label>
                  <input value={form.shipperAddress} onChange={onChange("shipperAddress")} className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]" placeholder="e.g. London, UK" required />
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-3">Consignee details</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold block mb-2">Consignee name</label>
                    <input value={form.consigneeName} onChange={onChange("consigneeName")} className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]" placeholder="e.g. Kofi Mensah" required />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-2">Consignee address</label>
                    <input value={form.consigneeAddress} onChange={onChange("consigneeAddress")} className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]" placeholder="e.g. Tema, Ghana" required />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-3">Ports</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold block mb-2">Origin port</label>
                    <input value={form.originPort} onChange={onChange("originPort")} className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]" placeholder="e.g. London" required />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-2">Destination port</label>
                    <input value={form.destinationPort} onChange={onChange("destinationPort")} className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]" placeholder="e.g. Tema" required />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <p className="text-[11px] text-slate-500">After creation, you'll see the shipment reference and milestones on the details page.</p>
                <button type="submit" disabled={!canSubmit || status.loading}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition ${!canSubmit || status.loading ? "bg-[#9A9EAB] text-white cursor-not-allowed" : "bg-[#1A2930] text-white hover:bg-[#FFA500] hover:text-[#1A2930]"}`}>
                  {status.loading ? "Creating…" : "Create booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="mt-6 text-[11px] text-white/50">If validation fails, the server will return field errors — shown above.</div>
      </div>
    </div>
  );
}

export default function NewBookingClient() {
  return (
    <RequireCustomerAuth>
      <NewBookingInner />
    </RequireCustomerAuth>
  );
}
