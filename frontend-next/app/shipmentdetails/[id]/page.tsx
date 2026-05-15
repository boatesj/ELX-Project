export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { Suspense } from "react";
import ShipmentDetailsClient from "../../components/ShipmentDetailsClient";

export const metadata: Metadata = {
  title: "Shipment Details | Ellcworth Express",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function ShipmentDetailsPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="bg-[#1A2930] min-h-screen" />}>
      <ShipmentDetailsClient id={id} />
    </Suspense>
  );
}
