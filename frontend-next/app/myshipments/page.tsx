export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { Suspense } from "react";
import MyShipmentsClient from "../components/MyShipmentsClient";

export const metadata: Metadata = {
  title: "My Shipments | Ellcworth Express",
  robots: { index: false, follow: false },
};

export default function MyShipmentsPage() {
  return (
    <Suspense fallback={<div className="bg-[#1A2930] min-h-screen" />}>
      <MyShipmentsClient />
    </Suspense>
  );
}
