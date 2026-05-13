import type { Metadata } from "next";
import ServicesClient from "../components/ServicesClient";

export const metadata: Metadata = {
  title: "RoRo, Container & Air Freight to West Africa | Ellcworth Express",
  description:
    "Container shipping, RoRo vehicle export, air freight, document logistics and repacking — UK to West Africa shipping services from Ellcworth Express.",
  alternates: { canonical: "https://www.ellcworth.com/services" },
};

export default function ServicesPage() {
  return <ServicesClient />;
}
