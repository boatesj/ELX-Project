"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  readCustomerSession,
  clearCustomerAuth,
  readCustomerToken,
  API_BASE_URL,
  type CustomerUser,
} from "../lib/customerAuth";
import RequireCustomerAuth from "./RequireCustomerAuth";

const API_V1 = `${API_BASE_URL}/api/v1`;

function pickArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const p = payload as Record<string, unknown>;
  if (p && Array.isArray(p.data)) return p.data as unknown[];
  if (p && Array.isArray(p.shipments)) return p.shipments as unknown[];
  if (p?.data && Array.isArray((p.data as Record<string, unknown>).shipments))
    return (p.data as Record<string, unknown>).shipments as unknown[];
  return [];
}

function toDisplayDate(val: unknown): string {
  if (!val) return "";
  try {
    const d = new Date(String(val));
    if (Number.isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString("en-GB");
  } catch {
    return String(val);
  }
}

function getStatusClasses(status: unknown): string {
  const s = String(status || "").toLowerCase();
  if (["arrived", "delivered", "completed"].includes(s))
    return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/60";
  if (["loaded", "in transit", "in_transit"].includes(s))
    return "bg-[#9A9EAB]/20 text-[#9A9EAB] border border-[#9A9EAB]/60";
  return "bg-[#FFA500]/20 text-[#FFA500] border border-[#FFA500]/60";
}

function MyShipmentsInner() {
  const router = useRouter();
  const [auth, setAuth] = useState<ReturnType<typeof readCustomerSession> | null>(null);
  const [items, setItems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => { setAuth(readCustomerSession()); }, []);

  useEffect(() => {
    const onStorage = () => setAuth(readCustomerSession());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const token = readCustomerToken();
    if (!token) {
      setLoading(false);
      router.replace("/login");
      return;
    }

    const ac = new AbortController();

    (async () => {
      setLoading(true);
      setErrMsg("");
      try {
        const resp = await fetch(`${API_V1}/shipments/me/list`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: ac.signal,
        });

        if (resp.status === 401 || resp.status === 403) {
          clearCustomerAuth();
          router.replace("/login");
          return;
        }

        const payload = await resp.json().catch(() => ({}));
        setItems(pickArray(payload));
      } catch (e: unknown) {
        if ((e as Error)?.name === "AbortError") return;
        setItems([]);
        setErrMsg("We couldn't load your shipments right now. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [router, auth?.token]);

  const signedInLabel = useMemo(() => {
    const u = auth?.user as CustomerUser | null;
    return u?.accountHolderName as string || u?.fullname as string || u?.email as string || "My Account";
  }, [auth]);

  const myShipments = useMemo(() => {
    const arr = Array.isArray(items) ? items : [];
    return [...arr].sort((a, b) => {
      const s = (x: unknown) => new Date(
        (x as Record<string, unknown>)?.createdAt as string ||
        (x as Record<string, unknown>)?.bookingDate as string || 0
      ).getTime();
      return s(b) - s(a);
    });
  }, [items]);

  return (
    <div className="bg-[#1A2930] text-slate-100 min-h-[60vh]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-10 py-8 md:py-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-wide">My Shipments</h1>
            <p className="text-xs md:text-sm text-slate-200 mt-1">
              A personalised overview of your active and completed shipments handled by Ellcworth Express.
            </p>
            <p className="text-[11px] md:text-xs text-slate-400 mt-2">
              Signed in as <span className="text-slate-200">{signedInLabel}</span>
            </p>
          </div>
          <Link
            href="/newbooking"
            className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs md:text-sm font-semibold bg-[#FFA500] text-[#1A2930] hover:bg-[#ffb733] transition"
          >
            Create a booking
          </Link>
        </div>

        {loading && (
          <div className="rounded-lg border border-white/10 bg-[#111827] p-6 text-sm text-slate-200">
            Loading your shipments…
          </div>
        )}

        {!loading && errMsg && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-100">
            {errMsg}
          </div>
        )}

        {!loading && !errMsg && (
          <div className="space-y-4">
            {myShipments.map((shipment) => {
              const s = shipment as Record<string, unknown>;
              const id = s?._id || s?.id;
              const reference = s?.referenceNo || s?.reference || s?.referenceNumber || "—";
              const origin = s?.origin || s?.from || s?.pickupAddress || s?.pickupCity || "—";
              const destination = s?.destination || s?.to || s?.deliveryAddress || s?.deliveryCity || "—";
              const bookedAt = s?.bookingDate || s?.date || s?.createdAt || "";
              const accountHolder = (s?.customer as Record<string, unknown>)?.fullname || s?.accountHolder || s?.customerName || s?.shipperName || (auth?.user as CustomerUser)?.fullname || "—";
              const weight = s?.weightKg || s?.weight || s?.grossWeight || "";
              const status = s?.status || s?.shipmentStatus || "Booked";

              return (
                <div
                  key={String(id || reference)}
                  className="rounded-lg bg-[#111827] border border-[#9A9EAB]/40 p-4 md:p-5 flex flex-col md:flex-row justify-between gap-4 hover:border-[#FFA500]/70 hover:shadow-md transition"
                >
                  <div className="space-y-2">
                    <p className="text-[11px] md:text-xs font-semibold tracking-[0.16em] uppercase text-[#9A9EAB]">
                      Shipment Ref: <span className="text-slate-200">{String(reference)}</span>
                    </p>
                    <div className="text-sm md:text-base">
                      <p><span className="text-slate-400">Origin: </span>{String(origin)}</p>
                      <p><span className="text-slate-400">Destination: </span>{String(destination)}</p>
                      {weight !== "" && <p><span className="text-slate-400">Weight: </span>{String(weight)} kg</p>}
                      <p><span className="text-slate-400">Booked by: </span>{String(accountHolder)}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end justify-between gap-3">
                    <div className="text-sm text-slate-200">
                      <span className="text-slate-400">Booking date: </span>
                      {bookedAt ? toDisplayDate(bookedAt) : "—"}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs md:text-sm font-semibold ${getStatusClasses(status)}`}>
                        {String(status || "Booked")}
                      </span>
                      {String(id) && (
                        <Link
                          href={`/shipmentdetails/${String(id as string)}`}
                          className="text-xs md:text-sm px-3 py-1.5 rounded-full border border-[#9A9EAB] text-slate-100 hover:border-[#FFA500] hover:text-[#FFA500] hover:bg-[#FFA500]/10 transition"
                        >
                          View details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {myShipments.length === 0 && (
              <div className="rounded-lg border border-dashed border-[#9A9EAB]/60 bg-[#111827] p-6 text-sm text-slate-200">
                You don't have any shipments yet for this account. Create a booking to get started — or contact Ellcworth Operations for assistance.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyShipmentsClient() {
  return (
    <RequireCustomerAuth>
      <MyShipmentsInner />
    </RequireCustomerAuth>
  );
}
