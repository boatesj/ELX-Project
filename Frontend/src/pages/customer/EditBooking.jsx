import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { customerAuthRequest, CUSTOMER_TOKEN_KEY } from "@/requestMethods";

const SHIPMENT_PATH = (id) => `/shipments/${id}`;

function pickShipment(payload) {
  if (payload && typeof payload === "object") {
    if (payload.data && typeof payload.data === "object") return payload.data;
    if (payload.shipment && typeof payload.shipment === "object")
      return payload.shipment;
  }
  if (payload && typeof payload === "object" && payload._id) return payload;
  return null;
}

export default function EditBooking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hasToken, setHasToken] = useState(() => {
    const local = localStorage.getItem(CUSTOMER_TOKEN_KEY);
    const session = sessionStorage.getItem(CUSTOMER_TOKEN_KEY);
    return Boolean(local || session);
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const [shipmentMeta, setShipmentMeta] = useState({
    referenceNo: "—",
    mode: "",
    status: "",
  });

  const [form, setForm] = useState({
    shipperName: "",
    shipperAddress: "",
    shipperEmail: "",
    consigneeName: "",
    consigneeAddress: "",
    originPort: "",
    destinationPort: "",

    // ✅ Missing-details fields (Job Card)
    packagingType: "",
    weightText: "", // keep as string to match schema cargo.weight
    volumeCbm: "", // string in form -> converted to number on save
    declaredValueAmount: "",
    declaredValueCurrency: "GBP",
  });

  // Keep in sync if user logs in/out in another tab
  useEffect(() => {
    const onStorage = () => {
      const local = localStorage.getItem(CUSTOMER_TOKEN_KEY);
      const session = sessionStorage.getItem(CUSTOMER_TOKEN_KEY);
      setHasToken(Boolean(local || session));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!hasToken) {
      setLoading(false);
      navigate("/login", { replace: true });
      return;
    }

    const ac = new AbortController();

    (async () => {
      setLoading(true);
      setErrMsg("");
      setOkMsg("");

      try {
        const res = await customerAuthRequest.get(SHIPMENT_PATH(id), {
          signal: ac.signal,
        });

        const payload = res?.data ?? {};
        const picked = pickShipment(payload);

        if (!picked) {
          setErrMsg("We received an unexpected response for this shipment.");
          setLoading(false);
          return;
        }

        setShipmentMeta({
          referenceNo: picked?.referenceNo || "—",
          mode: picked?.mode || "",
          status: picked?.status || "",
        });

        const firstPackageType =
          picked?.cargo?.packages?.[0]?.type ||
          picked?.cargo?.packages?.type ||
          "";

        setForm({
          shipperName: picked?.shipper?.name || "",
          shipperAddress: picked?.shipper?.address || "",
          shipperEmail: picked?.shipper?.email || "",
          consigneeName: picked?.consignee?.name || "",
          consigneeAddress: picked?.consignee?.address || "",
          originPort: picked?.ports?.originPort || picked?.originAddress || "",
          destinationPort:
            picked?.ports?.destinationPort || picked?.destinationAddress || "",

          // ✅ Missing-details fields (Job Card)
          packagingType: firstPackageType,
          weightText: picked?.cargo?.weight || "",
          volumeCbm:
            picked?.cargo?.volumeCbm === 0 || picked?.cargo?.volumeCbm
              ? String(picked.cargo.volumeCbm)
              : "",
          declaredValueAmount:
            picked?.cargoValue?.amount === 0 || picked?.cargoValue?.amount
              ? String(picked.cargoValue.amount)
              : "",
          declaredValueCurrency: picked?.cargoValue?.currency || "GBP",
        });
      } catch (e) {
        if (
          e?.name === "CanceledError" ||
          e?.name === "AbortError" ||
          e?.code === "ERR_CANCELED"
        )
          return;

        const status = e?.response?.status;

        // 401/403 handled by interceptor (auto-logout + redirect)
        if (status === 404) {
          setErrMsg("Shipment not found.");
          setLoading(false);
          return;
        }

        setErrMsg(
          "We couldn’t load this shipment right now. Please go back and try again.",
        );
        console.error("EditBooking fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [id, navigate, hasToken]);

  const canSave = useMemo(() => {
    // Backend validators require these (based on your 422 output + successful create)
    return Boolean(
      form.shipperName.trim() &&
      form.shipperAddress.trim() &&
      form.shipperEmail.trim() &&
      form.consigneeName.trim() &&
      form.consigneeAddress.trim() &&
      form.originPort.trim() &&
      form.destinationPort.trim(),
    );
  }, [form]);

  const onChange = (key) => (e) => {
    const value = e.target.value;
    setForm((p) => ({ ...p, [key]: value }));
    if (errMsg) setErrMsg("");
    if (okMsg) setOkMsg("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSave || saving) return;

    setSaving(true);
    setErrMsg("");
    setOkMsg("");

    try {
      const volumeNum =
        form.volumeCbm.trim() === "" ? undefined : Number(form.volumeCbm);

      const declaredNum =
        form.declaredValueAmount.trim() === ""
          ? undefined
          : Number(form.declaredValueAmount);

      // Minimal PATCH-like PUT payload: only fields we allow customers to edit
      const payload = {
        shipper: {
          name: form.shipperName.trim(),
          address: form.shipperAddress.trim(),
          email: form.shipperEmail.trim(),
        },
        consignee: {
          name: form.consigneeName.trim(),
          address: form.consigneeAddress.trim(),
        },
        ports: {
          originPort: form.originPort.trim(),
          destinationPort: form.destinationPort.trim(),
        },

        // ✅ Missing-details fields (Job Card)
        cargo: {
          weight: form.weightText.trim(),
          volumeCbm: Number.isFinite(volumeNum) ? volumeNum : undefined,

          // Keep it minimal: set/update the first package type only
          packages: form.packagingType.trim()
            ? [{ type: form.packagingType.trim(), quantity: 1 }]
            : undefined,
        },

        cargoValue:
          Number.isFinite(declaredNum) && declaredNum >= 0
            ? {
                amount: declaredNum,
                currency:
                  String(form.declaredValueCurrency || "GBP").trim() || "GBP",
              }
            : undefined,
      };

      await customerAuthRequest.put(SHIPMENT_PATH(id), payload);

      setOkMsg("Changes saved. Returning to shipment details…");

      setTimeout(() => {
        navigate(`/shipmentdetails/${id}`, { replace: true });
      }, 350);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "We couldn’t save your changes. Please try again.";

      setErrMsg(msg);
      console.error("EditBooking save error:", e);
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="bg-[#1A2930] min-h-[70vh] py-8 text-white">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <Link to={`/shipmentdetails/${id}`}>
            <button className="inline-flex items-center gap-2 text-xs md:text-sm text-slate-200 hover:text-[#FFA500] transition">
              <FaArrowLeft />
              <span>Back to shipment details</span>
            </button>
          </Link>

          <div className="hidden md:flex items-center text-[11px] uppercase tracking-[0.2em] text-[#9A9EAB]">
            CUSTOMER PORTAL · EDIT BOOKING
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-[#9A9EAB]/40 overflow-hidden text-[#1A2930]">
          <div className="px-6 py-5 border-b border-[#E5E7EB]">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB]">
              Edit shipment
            </p>
            <h1 className="text-lg md:text-xl font-semibold mt-1">
              {shipmentMeta.referenceNo}
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Update key booking details. Milestones and documents are managed
              by Ellcworth Operations.
            </p>
            <div className="mt-2 text-[11px] text-slate-500">
              Mode:{" "}
              <span className="text-slate-700">{shipmentMeta.mode || "—"}</span>{" "}
              · Status:{" "}
              <span className="text-slate-700">
                {shipmentMeta.status || "—"}
              </span>
            </div>
          </div>

          <div className="p-6">
            {errMsg ? (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                {errMsg}
              </div>
            ) : null}

            {okMsg ? (
              <div className="mb-4 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800">
                {okMsg}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold block mb-2">
                    Shipper name
                  </label>
                  <input
                    value={form.shipperName}
                    onChange={onChange("shipperName")}
                    className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                    placeholder="e.g. Jake Boateng"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-2">
                    Shipper email
                  </label>
                  <input
                    value={form.shipperEmail}
                    onChange={onChange("shipperEmail")}
                    type="email"
                    className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                    placeholder="e.g. jake@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2">
                  Shipper address
                </label>
                <input
                  value={form.shipperAddress}
                  onChange={onChange("shipperAddress")}
                  className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                  placeholder="e.g. London, UK"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold block mb-2">
                    Consignee name
                  </label>
                  <input
                    value={form.consigneeName}
                    onChange={onChange("consigneeName")}
                    className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                    placeholder="e.g. Kofi Mensah"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-2">
                    Consignee address
                  </label>
                  <input
                    value={form.consigneeAddress}
                    onChange={onChange("consigneeAddress")}
                    className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                    placeholder="e.g. Tema, Ghana"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold block mb-2">
                    Origin port / city
                  </label>
                  <input
                    value={form.originPort}
                    onChange={onChange("originPort")}
                    className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                    placeholder="e.g. London"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-2">
                    Destination port / city
                  </label>
                  <input
                    value={form.destinationPort}
                    onChange={onChange("destinationPort")}
                    className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                    placeholder="e.g. Tema"
                    required
                  />
                </div>
              </div>

              {/* ✅ Missing-details fields (to remove Job Card warning) */}
              <div className="mt-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-sm font-semibold mb-1">Cargo basics</p>
                <p className="text-[12px] text-slate-600 mb-4">
                  These details help us process insurance/customs and plan
                  handling.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Packaging type
                    </label>
                    <select
                      value={form.packagingType}
                      onChange={onChange("packagingType")}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                    >
                      <option value="">Select…</option>
                      <option value="box">Box</option>
                      <option value="carton">Carton</option>
                      <option value="pallet">Pallet</option>
                      <option value="parcel">Parcel</option>
                      <option value="bag">Bag</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Weight{" "}
                      <span className="text-[11px] text-slate-500 font-normal">
                        (e.g. 1300 kg)
                      </span>
                    </label>
                    <input
                      value={form.weightText}
                      onChange={onChange("weightText")}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. 75 kg"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Volume (CBM){" "}
                      <span className="text-[11px] text-slate-500 font-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      value={form.volumeCbm}
                      onChange={onChange("volumeCbm")}
                      inputMode="decimal"
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. 1.8"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Declared value{" "}
                      <span className="text-[11px] text-slate-500 font-normal">
                        (insurance/customs)
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={form.declaredValueCurrency}
                        onChange={onChange("declaredValueCurrency")}
                        className="w-28 rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      >
                        <option value="GBP">GBP</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GHS">GHS</option>
                      </select>

                      <input
                        value={form.declaredValueAmount}
                        onChange={onChange("declaredValueAmount")}
                        inputMode="decimal"
                        className="flex-1 rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                        placeholder="e.g. 2500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-slate-500">
                  For security, customers can only edit core booking details.
                </p>

                <button
                  type="submit"
                  disabled={!canSave || saving}
                  className={`
                    inline-flex items-center gap-2
                    px-5 py-2.5 rounded-full text-sm font-semibold transition
                    ${
                      !canSave || saving
                        ? "bg-[#9A9EAB] text-white cursor-not-allowed"
                        : "bg-[#1A2930] text-white hover:bg-[#FFA500] hover:text-[#1A2930]"
                    }
                  `}
                >
                  <FaSave />
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 text-[11px] text-white/50">
          If the backend rejects any field, we’ll follow the error message and
          add only what’s mandatory — nothing extra.
        </div>
      </div>
    </div>
  );
}
