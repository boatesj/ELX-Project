import type { Metadata } from "next";
import { Suspense } from "react";
import MapPageClient from "../components/MapPageClient";

export const metadata: Metadata = {
  title: "Africa Shipment Map | Ellcworth Express Ltd",
  description: "Ellcworth Express port connections — UK departure points and West Africa destinations including Tema, Lagos, Mombasa and more.",
  alternates: { canonical: "https://www.ellcworth.com/map" },
};

export default function MapPage() {
  return (
    <Suspense fallback={<div className="bg-[#0B141A] min-h-screen" />}>
      <MapPageClient />
    </Suspense>
  );
}
