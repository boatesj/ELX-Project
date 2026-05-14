export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { Suspense } from "react";
import EditBookingClient from "../../components/EditBookingClient";

export const metadata: Metadata = {
  title: "Edit Booking | Ellcworth Express",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function EditBookingPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="bg-[#1A2930] min-h-screen" />}>
      <EditBookingClient id={id} />
    </Suspense>
  );
}
