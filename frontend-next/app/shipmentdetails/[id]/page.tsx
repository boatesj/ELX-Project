export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import ShipmentDetailsClient from "../../components/ShipmentDetailsClient";

export const metadata: Metadata = {
  title: "Shipment Details | Ellcworth Express",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function ShipmentDetailsPage({ params }: Props) {
  const { id } = await params;
  return <ShipmentDetailsClient id={id} />;
}
