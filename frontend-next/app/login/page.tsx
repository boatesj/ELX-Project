export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { Suspense } from "react";
import CustomerLoginClient from "../components/CustomerLoginClient";

export const metadata: Metadata = {
  title: "Customer Login | Ellcworth Express",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-[#1A2930] min-h-screen" />}>
      <CustomerLoginClient />
    </Suspense>
  );
}
