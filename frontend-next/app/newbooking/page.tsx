export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { Suspense } from "react";
import NewBookingClient from "../components/NewBookingClient";

export const metadata: Metadata = {
  title: "New Booking | Ellcworth Express",
  robots: { index: false, follow: false },
};

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div className="bg-[#1A2930] min-h-screen" />}>
      <NewBookingClient />
    </Suspense>
  );
}
