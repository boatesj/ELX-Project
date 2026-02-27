// Frontend/src/pages/customer/EditBooking.jsx

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

const toNumOrNull = (s) => {
  const t = String(s ?? "").trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

/**
 * Deep-prune payload so we DO NOT send:
 * - empty strings ""
 * - undefined / null
 * - empty objects {}
 * - empty arrays []
 *
 * We DO keep:
 * - numbers (including 0)
 * - booleans
 * - non-empty strings
 */
function pruneDeep(value) {
  if (value === undefined || value === null) return undefined;

  if (typeof value === "string") {
    const s = value.trim();
    return s ? s : undefined;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "boolean") return value;

  if (Array.isArray(value)) {
    const cleanedArr = value
      .map((v) => pruneDeep(v))
      .filter((v) => v !== undefined);

    return cleanedArr.length ? cleanedArr : undefined;
  }

  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const cleaned = pruneDeep(v);
      if (cleaned !== undefined) out[k] = cleaned;
    }
    return Object.keys(out).length ? out : undefined;
  }

  return undefined;
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

  // ✅ Form covers editable fields ShipmentDetails reads
  const [form, setForm] = useState({
    shipperName: "",
    shipperAddress: "",
    shipperEmail: "",
    shipperPhone: "",

    consigneeName: "",
    consigneeAddress: "",
    consigneeEmail: "",
    consigneePhone: "",

    originAddress: "",
    destinationAddress: "",

    requestedPickupDate: "",
    shippingDate: "",
    eta: "",

    goodsDescription: "",
    pieces: "",
    packagingType: "",

    weightKg: "",
    volumeM3: "",

    declaredValueAmount: "",
    declaredValueCurrency: "GBP",

    customerNotes: "",
  });

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

        // Packaging: support current + older shapes
        const firstPackageType =
          picked?.cargo?.packages?.[0]?.type ||
          picked?.cargo?.packages?.type ||
          pick(picked, [
            "packagingType",
            "cargo.packagingType",
            "packageType",
          ]) ||
          "";

        // Origin/destination: mirror ShipmentDetails pick order
        const origin = firstNonEmpty(
          pick(picked, [
            "originAddress",
            "pickupAddress",
            "addresses.origin",
            "addresses.pickup",
            "ports.originPort",
          ]),
          picked?.origin,
        );

        const destination = firstNonEmpty(
          pick(picked, [
            "destinationAddress",
            "deliveryAddress",
            "addresses.destination",
            "addresses.delivery",
            "ports.destinationPort",
          ]),
          picked?.destination,
        );

        // Dates: mirror ShipmentDetails pick order
        const requestedPickupDate = firstNonEmpty(
          pick(picked, ["pickupDate", "dates.pickup", "requestedPickupDate"]),
          picked?.pickupDate,
        );

        const shippingDate = firstNonEmpty(
          pick(picked, [
            "shippingDate",
            "shipDate",
            "dates.shipping",
            "dates.ship",
          ]),
          picked?.shippingDate,
        );

        const eta = firstNonEmpty(
          pick(picked, [
            "eta",
            "estimatedDeliveryDate",
            "dates.eta",
            "dates.deliveryEta",
          ]),
          picked?.eta,
        );

        // Cargo values: mirror ShipmentDetails pickers
        const goodsDescription = firstNonEmpty(
          pick(picked, [
            "goodsDescription",
            "cargo.description",
            "cargo.goodsDescription",
            "cargo.goods",
            "itemsSummary",
          ]),
          picked?.description,
        );

        const packagesCount = pickNum(picked, [
          "packagesCount",
          "cargo.packagesCount",
          "pieces",
          "qty",
        ]);

        const weightKg = pickNum(picked, [
          "weightKg",
          "cargo.weightKg",
          "weight",
          "grossWeightKg",
        ]);

        const volumeM3 = pickNum(picked, [
          "volumeM3",
          "cargo.volumeM3",
          "volume",
          "cbm",
        ]);

        const declaredValue = pickNum(picked, [
          "declaredValue",
          "cargo.declaredValue",
          "value",
        ]);

        const notes = firstNonEmpty(
          pick(picked, [
            "notes",
            "customerNotes",
            "instructions",
            "specialInstructions",
            "cargo.notes",
          ]),
        );

        setForm({
          shipperName: pick(picked, ["shipper.name"]) || "",
          shipperAddress: pick(picked, ["shipper.address"]) || "",
          shipperEmail: pick(picked, ["shipper.email"]) || "",
          shipperPhone:
            pick(picked, [
              "shipper.phone",
              "shipper.mobile",
              "shipper.tel",
              "shipper.contactPhone",
            ]) || "",

          consigneeName: pick(picked, ["consignee.name"]) || "",
          consigneeAddress: pick(picked, ["consignee.address"]) || "",
          consigneeEmail:
            pick(picked, ["consignee.email", "consignee.contactEmail"]) || "",
          consigneePhone:
            pick(picked, [
              "consignee.phone",
              "consignee.mobile",
              "consignee.tel",
              "consignee.contactPhone",
            ]) || "",

          originAddress: origin || "",
          destinationAddress: destination || "",

          requestedPickupDate: requestedPickupDate || "",
          shippingDate: shippingDate || "",
          eta: eta || "",

          goodsDescription: goodsDescription || "",
          pieces: packagesCount === null ? "" : String(packagesCount),
          packagingType: firstPackageType || "",

          weightKg: weightKg === null ? "" : String(weightKg),
          volumeM3: volumeM3 === null ? "" : String(volumeM3),

          declaredValueAmount:
            declaredValue === null ? "" : String(declaredValue),
          declaredValueCurrency:
            picked?.cargoValue?.currency || picked?.quote?.currency || "GBP",

          customerNotes: notes || "",
        });
      } catch (e) {
        if (
          e?.name === "CanceledError" ||
          e?.name === "AbortError" ||
          e?.code === "ERR_CANCELED"
        )
          return;

        const status = e?.response?.status;

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
    return Boolean(
      cleanStr(form.shipperName) &&
      cleanStr(form.shipperEmail) &&
      cleanStr(form.originAddress) &&
      cleanStr(form.consigneeName) &&
      cleanStr(form.destinationAddress),
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
      const piecesNum = toNumOrNull(form.pieces);
      const weightNum = toNumOrNull(form.weightKg);
      const volumeNum = toNumOrNull(form.volumeM3);
      const declaredNum = toNumOrNull(form.declaredValueAmount);

      const origin = cleanStr(form.originAddress);
      const destination = cleanStr(form.destinationAddress);

      const pickup = cleanStr(form.requestedPickupDate);
      const ship = cleanStr(form.shippingDate);
      const eta = cleanStr(form.eta);

      const packagingType = cleanStr(form.packagingType);
      const goodsDescription = cleanStr(form.goodsDescription);
      const notes = cleanStr(form.customerNotes);

      // ✅ Build a "merge-safe" payload: only include values that are actually provided.
      const rawPayload = {
        shipper: {
          name: cleanStr(form.shipperName),
          email: cleanStr(form.shipperEmail),
          phone: cleanStr(form.shipperPhone),
          address: cleanStr(form.shipperAddress),
        },
        consignee: {
          name: cleanStr(form.consigneeName),
          email: cleanStr(form.consigneeEmail),
          phone: cleanStr(form.consigneePhone),
          address: cleanStr(form.consigneeAddress),
        },

        // Addresses / ports (all shapes ShipmentDetails checks)
        originAddress: origin,
        destinationAddress: destination,
        pickupAddress: origin,
        deliveryAddress: destination,
        addresses: {
          origin,
          pickup: origin,
          destination,
          delivery: destination,
        },
        ports: {
          originPort: origin,
          destinationPort: destination,
        },

        // Dates (only include if provided — prevent wiping)
        ...(pickup
          ? {
              pickupDate: pickup,
              requestedPickupDate: pickup,
              dates: { pickup },
            }
          : {}),
        ...(ship
          ? {
              shippingDate: ship,
              shipDate: ship,
              dates: { ...(pickup ? { pickup } : {}), shipping: ship, ship },
            }
          : {}),
        ...(eta
          ? {
              eta,
              estimatedDeliveryDate: eta,
              dates: {
                ...(pickup ? { pickup } : {}),
                ...(ship ? { shipping: ship, ship } : {}),
                eta,
                deliveryEta: eta,
              },
            }
          : {}),

        // Cargo fields (flat + cargo.* paths ShipmentDetails checks)
        ...(goodsDescription ? { goodsDescription } : {}),
        ...(packagingType ? { packagingType } : {}),

        ...(Number.isFinite(piecesNum)
          ? { pieces: piecesNum, qty: piecesNum }
          : {}),
        ...(Number.isFinite(piecesNum)
          ? { packageCount: piecesNum, packagesCount: piecesNum }
          : {}),

        ...(Number.isFinite(weightNum) ? { weightKg: weightNum } : {}),
        ...(Number.isFinite(volumeNum)
          ? { volumeM3: volumeNum, volumeCbm: volumeNum }
          : {}),

        ...(Number.isFinite(declaredNum)
          ? { declaredValue: declaredNum, value: declaredNum }
          : {}),

        // Notes (only include if provided — prevent wiping)
        ...(notes
          ? {
              notes,
              customerNotes: notes,
              instructions: notes,
              specialInstructions: notes,
            }
          : {}),

        // cargo object mirrors
        cargo: {
          ...(goodsDescription
            ? {
                description: goodsDescription,
                goodsDescription,
              }
            : {}),
          ...(packagingType
            ? {
                packagingType,
                packaging: packagingType,
              }
            : {}),
          ...(Number.isFinite(piecesNum)
            ? { packagesCount: piecesNum, packageCount: piecesNum }
            : {}),
          ...(Number.isFinite(weightNum) ? { weightKg: weightNum } : {}),
          ...(Number.isFinite(volumeNum)
            ? { volumeCbm: volumeNum, volumeM3: volumeNum }
            : {}),
          ...(Number.isFinite(declaredNum)
            ? { declaredValue: declaredNum }
            : {}),
          ...(notes ? { notes } : {}),
        },

        // cargoValue object
        ...(Number.isFinite(declaredNum) && declaredNum >= 0
          ? {
              cargoValue: {
                amount: declaredNum,
                currency: cleanStr(form.declaredValueCurrency) || "GBP",
              },
            }
          : {}),
      };

      // packages array only if packagingType present
      if (packagingType) {
        rawPayload.cargo = rawPayload.cargo || {};
        rawPayload.cargo.packages = [{ type: packagingType, quantity: 1 }];
      }

      // ✅ prune deeply to avoid sending "" or empty objects that wipe saved data
      const payload = pruneDeep(rawPayload) || {};

      await customerAuthRequest.patch(`${SHIPMENT_PATH(id)}/customer`, payload);

      setOkMsg("Changes saved. Returning to shipment details…");

      // Navigate immediately; ShipmentDetails will re-fetch and show persisted data
      navigate(`/shipmentdetails/${id}`, { replace: true });
    } catch (e2) {
      const msg =
        e2?.response?.data?.message ||
        e2?.response?.data?.error ||
        e2?.message ||
        "We couldn’t save your changes. Please try again.";

      setErrMsg(msg);
      console.error("EditBooking save error:", e2);
    } finally {
      setSaving(false);
    }
  };

  // helper in component scope
  function toDateInputValue(v) {
    if (!v) return "";
    if (typeof v === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
      if (v.includes("T")) return v.slice(0, 10);
    }
    const d = new Date(v);
    return Number.isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : "";
  }

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
              Update your delivery brief details. Milestones and documents are
              managed by Ellcworth Operations.
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

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Parties */}
              <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Shipper name
                    </label>
                    <input
                      value={form.shipperName}
                      onChange={onChange("shipperName")}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
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
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Shipper phone (optional)
                    </label>
                    <input
                      value={form.shipperPhone}
                      onChange={onChange("shipperPhone")}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. +44 7..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Shipper address (optional)
                    </label>
                    <input
                      value={form.shipperAddress}
                      onChange={onChange("shipperAddress")}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. Romford, UK"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Consignee name
                    </label>
                    <input
                      value={form.consigneeName}
                      onChange={onChange("consigneeName")}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Consignee email (optional)
                    </label>
                    <input
                      value={form.consigneeEmail}
                      onChange={onChange("consigneeEmail")}
                      type="email"
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. consignee@example.com"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Consignee phone (optional)
                    </label>
                    <input
                      value={form.consigneePhone}
                      onChange={onChange("consigneePhone")}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. +233 ..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Consignee address (optional)
                    </label>
                    <input
                      value={form.consigneeAddress}
                      onChange={onChange("consigneeAddress")}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. Tema, Ghana"
                    />
                  </div>
                </div>
              </div>

              {/* Route */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold block mb-2">
                    Origin / pickup address
                  </label>
                  <input
                    value={form.originAddress}
                    onChange={onChange("originAddress")}
                    className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-2">
                    Destination / delivery address
                  </label>
                  <input
                    value={form.destinationAddress}
                    onChange={onChange("destinationAddress")}
                    className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                    required
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-sm font-semibold mb-1">Dates</p>
                <p className="text-[12px] text-slate-600 mb-4">
                  Provide what you know — Operations will confirm the final
                  schedule.
                </p>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Requested pickup date
                    </label>
                    <input
                      value={toDateInputValue(form.requestedPickupDate)}
                      onChange={onChange("requestedPickupDate")}
                      type="date"
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Shipping date
                    </label>
                    <input
                      value={toDateInputValue(form.shippingDate)}
                      onChange={onChange("shippingDate")}
                      type="date"
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      ETA / estimated delivery
                    </label>
                    <input
                      value={toDateInputValue(form.eta)}
                      onChange={onChange("eta")}
                      type="date"
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                    />
                  </div>
                </div>
              </div>

              {/* Cargo */}
              <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-sm font-semibold mb-1">Cargo & handling</p>
                <p className="text-[12px] text-slate-600 mb-4">
                  These fields directly feed the “Delivery brief” view and the
                  missing checklist.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold block mb-2">
                      Goods description
                    </label>
                    <input
                      value={form.goodsDescription}
                      onChange={onChange("goodsDescription")}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. household items / cartons of books"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Quantity / pieces
                    </label>
                    <input
                      value={form.pieces}
                      onChange={onChange("pieces")}
                      inputMode="numeric"
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. 12"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Packaging type
                    </label>
                    <input
                      value={form.packagingType}
                      onChange={onChange("packagingType")}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. carton / box / pallet"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Weight (kg)
                    </label>
                    <input
                      value={form.weightKg}
                      onChange={onChange("weightKg")}
                      inputMode="decimal"
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. 75"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Volume (m³)
                    </label>
                    <input
                      value={form.volumeM3}
                      onChange={onChange("volumeM3")}
                      inputMode="decimal"
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. 1.8"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold block mb-2">
                      Declared value (insurance/customs)
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

              {/* Notes */}
              <div>
                <label className="text-sm font-semibold block mb-2">
                  Instructions & notes (optional)
                </label>
                <textarea
                  value={form.customerNotes}
                  onChange={onChange("customerNotes")}
                  rows={4}
                  maxLength={1000}
                  className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                  placeholder="Any special instructions for pickup, delivery, contact, documents, timing..."
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-slate-500">
                  You can edit your delivery brief fields here. Quote pricing
                  and milestones are managed by Operations.
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
          If the backend rejects any field, the UI will show the error message —
          we’ll only remove fields that the backend explicitly disallows.
        </div>
      </div>
    </div>
  );
}
