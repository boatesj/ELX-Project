import type { Metadata } from "next";
import GhanaClient from "./GhanaClient";

export const metadata: Metadata = {
  title: "Shipping to Ghana from the UK | Container, RoRo & Air Freight | Ellcworth Express",
  description: "Container shipping, RoRo vehicle shipping and air freight from the UK to Ghana. Tema Port and Accra International Airport. ICUMS customs clearance end-to-end.",
  alternates: { canonical: "https://www.ellcworth.com/destinations/ghana" },
};

export default function GhanaPage() {
  return <GhanaClient />;
}
