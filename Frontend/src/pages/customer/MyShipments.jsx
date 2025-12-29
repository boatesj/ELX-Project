import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { customerAuthRequest, CUSTOMER_TOKEN_KEY } from "@/requestMethods";

const MY_SHIPMENTS_PATH = `/api/v1/shipments/me/list`;

function pickArray(payload) {
  // supports: { ok:true, data: [...] } OR just [...]
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.shipments)) return payload.shipments;
  if (payload && payload.data && Array.isArray(payload.data.shipments))
    return payload.data.shipments;
  return [];
}

function toDisplayDate(val) {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString("en-GB");
  } catch {
    return String(val);
  }
}

function getStatusClasses(status) {
  const s = String(status || "").toLowerCase();
  if (s === "arrived" || s === "delivered" || s === "completed") {
    return `bg-emerald-500/20 text-emerald-300 border border-emerald-500/60`;
  }
  if (s === "loaded" || s === "in transit" || s === "in_transit") {
    return `bg-[#9A9EAB]/20 text-[#9A9EAB] border border-[#9A9EAB]/60`;
  }
  return `bg-[#FFA500]/20 text-[#FFA500] border border-[#FFA500]/60`;
}

const MyShipments = () => {
  const navigate = useNavigate();

  // token presence check only (route guard handles auth; axios interceptor handles expiry)
  const [hasToken, setHasToken] = useState(() => {
    const local = localStorage.getItem(CUSTOMER_TOKEN_KEY);
    const session = sessionStorage.getItem(CUSTOMER_TOKEN_KEY);
    return Boolean(local || session);
  });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

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

  // Fetch my shipments
  useEffect(() => {
    if (!hasToken) {
      setLoading(false);
      setItems([]);
      setErrMsg("");
      navigate("/login", { replace: true });
      return;
    }

    const ac = new AbortController();

    (async () => {
      setLoading(true);
      setErrMsg("");

      try {
        const resp = await customerAuthRequest.get(MY_SHIPMENTS_PATH, {
          signal: ac.signal,
        });

        const payload = resp?.data ?? {};
        const arr = pickArray(payload);
        setItems(arr);
      } catch (e) {
        if (
          e?.name === "CanceledError" ||
          e?.name === "AbortError" ||
          e?.code === "ERR_CANCELED"
        )
          return;

        // 401/403 are handled globally by interceptor (auto-logout + redirect)
        setItems([]);
        setErrMsg(
          "We couldn’t load your shipments right now. Please refresh and try again."
        );
        console.error("MyShipments fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [navigate, hasToken]);

  const signedInLabel = useMemo(() => {
    // We keep this minimal to avoid duplicating user/session parsing logic here.
    // NavbarCustomer already shows identity; this label is optional.
    return "My Account";
  }, []);

  // Optional: newest first
  const myShipments = useMemo(() => {
    const arr = Array.isArray(items) ? items : [];
    return [...arr].sort((a, b) => {
      const ad = new Date(
        a?.createdAt || a?.bookingDate || a?.date || 0
      ).getTime();
      const bd = new Date(
        b?.createdAt || b?.bookingDate || b?.date || 0
      ).getTime();
      return bd - ad;
    });
  }, [items]);

  return (
    <div className="bg-[#1A2930] text-slate-100 min-h-[60vh]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-10 py-8 md:py-10">
        {/* Top bar: title */}
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-semibold tracking-wide">
            My Shipments
          </h1>
          <p className="text-xs md:text-sm text-slate-200 mt-1">
            A personalised overview of your active and completed shipments
            handled by Ellcworth Express.
          </p>
          <p className="text-[11px] md:text-xs text-slate-400 mt-2">
            Signed in as <span className="text-slate-200">{signedInLabel}</span>
          </p>
        </div>

        {/* Loading / error */}
        {loading ? (
          <div className="rounded-lg border border-white/10 bg-[#111827] p-6 text-sm text-slate-200">
            Loading your shipments…
          </div>
        ) : errMsg ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-100">
            {errMsg}
          </div>
        ) : null}

        {/* Shipments list */}
        {!loading && !errMsg ? (
          <div className="space-y-4">
            {myShipments.map((shipment) => {
              const id = shipment?._id || shipment?.id;
              const reference =
                shipment?.referenceNo ||
                shipment?.reference ||
                shipment?.referenceNumber ||
                "—";

              const origin =
                shipment?.origin ||
                shipment?.from ||
                shipment?.pickupAddress ||
                shipment?.pickupCity ||
                "—";

              const destination =
                shipment?.destination ||
                shipment?.to ||
                shipment?.deliveryAddress ||
                shipment?.deliveryCity ||
                "—";

              const bookedAt =
                shipment?.bookingDate ||
                shipment?.date ||
                shipment?.createdAt ||
                "";

              const accountHolder =
                shipment?.customer?.fullname ||
                shipment?.accountHolder ||
                shipment?.customerName ||
                shipment?.shipperName ||
                "—";

              const weight =
                shipment?.weightKg ||
                shipment?.weight ||
                shipment?.grossWeight ||
                "";

              const status =
                shipment?.status || shipment?.shipmentStatus || "Booked";

              return (
                <div
                  key={id || reference}
                  className="
                    rounded-lg
                    bg-[#111827]
                    border border-[#9A9EAB]/40
                    p-4 md:p-5
                    flex flex-col md:flex-row
                    justify-between
                    gap-4
                    hover:border-[#FFA500]/70
                    hover:shadow-md
                    transition
                  "
                >
                  {/* Left block */}
                  <div className="space-y-2">
                    <p className="text-[11px] md:text-xs font-semibold tracking-[0.16em] uppercase text-[#9A9EAB]">
                      Shipment Ref:{" "}
                      <span className="text-slate-200">{reference}</span>
                    </p>

                    <div className="text-sm md:text-base">
                      <p>
                        <span className="text-slate-400">Origin:&nbsp;</span>
                        {origin}
                      </p>
                      <p>
                        <span className="text-slate-400">
                          Destination:&nbsp;
                        </span>
                        {destination}
                      </p>

                      {weight !== "" ? (
                        <p>
                          <span className="text-slate-400">Weight:&nbsp;</span>
                          {weight} kg
                        </p>
                      ) : null}

                      <p>
                        <span className="text-slate-400">Booked by:&nbsp;</span>
                        {accountHolder}
                      </p>
                    </div>
                  </div>

                  {/* Right block */}
                  <div className="flex flex-col items-start md:items-end justify-between gap-3">
                    <div className="text-sm text-slate-200">
                      <span className="text-slate-400">
                        Booking date:&nbsp;
                      </span>
                      {bookedAt ? toDisplayDate(bookedAt) : "—"}
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`
                          inline-flex items-center justify-center
                          rounded-full px-3 py-1
                          text-xs md:text-sm font-semibold
                          ${getStatusClasses(status)}
                        `}
                      >
                        {String(status || "Booked")}
                      </span>

                      {id ? (
                        <Link to={`/shipmentdetails/${id}`}>
                          <button
                            className="
                              text-xs md:text-sm
                              px-3 py-1.5
                              rounded-full
                              border border-[#9A9EAB]
                              text-slate-100
                              hover:border-[#FFA500]
                              hover:text-[#FFA500]
                              hover:bg-[#FFA500]/10
                              transition
                            "
                          >
                            View details
                          </button>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}

            {myShipments.length === 0 && (
              <div className="rounded-lg border border-dashed border-[#9A9EAB]/60 bg-[#111827] p-6 text-sm text-slate-200">
                You don’t have any shipments yet for this account. If you’ve
                just booked, allow a short time for your shipment to appear — or
                contact Ellcworth Operations for assistance.
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MyShipments;
