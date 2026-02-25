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

  // ✅ Form now covers ALL editable fields ShipmentDetails reads
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

    requestedPickupDate: "", // pickupDate / requestedPickupDate / dates.pickup
    shippingDate: "", // shippingDate / shipDate / dates.shipping
    eta: "", // eta / dates.eta

    goodsDescription: "", // goodsDescription / cargo.description
    pieces: "", // packagesCount / pieces / qty / cargo.packagesCount
    packagingType: "", // packagingType / cargo.packagingType

    weightKg: "", // weightKg / cargo.weightKg
    volumeM3: "", // volumeM3 / cargo.volumeM3

    declaredValueAmount: "", // declaredValue / cargo.declaredValue
    declaredValueCurrency: "GBP",

    customerNotes: "", // notes / customerNotes / instructions / cargo.notes
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
    // Core required to avoid breaking saves
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

      // ✅ Multi-write payload so ShipmentDetails will re-read everything
      const payload = {
        shipper: {
          name: cleanStr(form.shipperName),
          address: cleanStr(form.shipperAddress),
          email: cleanStr(form.shipperEmail),
          phone: cleanStr(form.shipperPhone),
        },
        consignee: {
          name: cleanStr(form.consigneeName),
          address: cleanStr(form.consigneeAddress),
          email: cleanStr(form.consigneeEmail),
          phone: cleanStr(form.consigneePhone),
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

        // Dates (all shapes ShipmentDetails checks)
        pickupDate: cleanStr(form.requestedPickupDate),
        requestedPickupDate: cleanStr(form.requestedPickupDate),
        shippingDate: cleanStr(form.shippingDate),
        shipDate: cleanStr(form.shippingDate),
        eta: cleanStr(form.eta),
        estimatedDeliveryDate: cleanStr(form.eta),
        dates: {
          pickup: cleanStr(form.requestedPickupDate),
          shipping: cleanStr(form.shippingDate),
          ship: cleanStr(form.shippingDate),
          eta: cleanStr(form.eta),
          deliveryEta: cleanStr(form.eta),
        },

        // Cargo fields (both “flat” + cargo.* paths ShipmentDetails checks)
        goodsDescription: cleanStr(form.goodsDescription),
        packagingType: cleanStr(form.packagingType),
        pieces: Number.isFinite(piecesNum) ? piecesNum : undefined,
        qty: Number.isFinite(piecesNum) ? piecesNum : undefined,

        // Cargo fields (flat) — align with Admin immutable card fallbacks
        packageCount: Number.isFinite(piecesNum) ? piecesNum : undefined,
        weightKg: Number.isFinite(weightNum) ? weightNum : undefined,
        volumeCbm: Number.isFinite(volumeNum) ? volumeNum : undefined,

        // legacy/compat (keep for older reads)
        packagesCount: Number.isFinite(piecesNum) ? piecesNum : undefined,
        volumeM3: Number.isFinite(volumeNum) ? volumeNum : undefined,

        declaredValue: Number.isFinite(declaredNum) ? declaredNum : undefined,
        value: Number.isFinite(declaredNum) ? declaredNum : undefined,

        // Notes (all shapes ShipmentDetails checks)
        notes: cleanStr(form.customerNotes),
        customerNotes: cleanStr(form.customerNotes),
        instructions: cleanStr(form.customerNotes),
        specialInstructions: cleanStr(form.customerNotes),
      };

      // cargo object mirrors + preserves your current schema usage too
      const cargo = {
        description: cleanStr(form.goodsDescription),
        goodsDescription: cleanStr(form.goodsDescription),
        packagingType: cleanStr(form.packagingType),
        packaging: cleanStr(form.packagingType),

        packagesCount: Number.isFinite(piecesNum) ? piecesNum : undefined,
        packageCount: Number.isFinite(piecesNum) ? piecesNum : undefined,

        // Make ShipmentDetails happy (numeric pickNum)
        weightKg: Number.isFinite(weightNum) ? weightNum : undefined,

        // ✅ Admin immutable card + ShipmentDetails both
        volumeCbm: Number.isFinite(volumeNum) ? volumeNum : undefined,
        volumeM3: Number.isFinite(volumeNum) ? volumeNum : undefined,

        declaredValue: Number.isFinite(declaredNum) ? declaredNum : undefined,

        notes: cleanStr(form.customerNotes),
      };

      // packages array (keep prior behaviour, but also keep packagingType flat)
      if (cleanStr(form.packagingType)) {
        cargo.packages = [{ type: cleanStr(form.packagingType), quantity: 1 }];
      }

      payload.cargo = cargo;

      // cargoValue object (for systems that use it)
      if (Number.isFinite(declaredNum) && declaredNum >= 0) {
        payload.cargoValue = {
          amount: declaredNum,
          currency: cleanStr(form.declaredValueCurrency) || "GBP",
        };
      }

      // Clean undefined keys at top-level (avoid sending junk)
      Object.keys(payload).forEach((k) => {
        if (payload[k] === undefined) delete payload[k];
      });

      await customerAuthRequest.put(SHIPMENT_PATH(id), payload);

      setOkMsg("Changes saved. Returning to shipment details…");

      setTimeout(() => {
        navigate(`/shipmentdetails/${id}`, { replace: true });
      }, 350);
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
                      value={form.requestedPickupDate}
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
                      value={form.shippingDate}
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
                      value={form.eta}
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
