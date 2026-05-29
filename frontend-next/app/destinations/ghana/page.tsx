import type { Metadata } from "next";
import GhanaClient from "./GhanaClient";

export const metadata: Metadata = {
  title: "Shipping to Ghana from the UK | Container, RoRo & Air Freight | Ellcworth Express",
  description: "Container shipping, RoRo vehicle shipping and air freight from the UK to Ghana. Tema Port and Accra International Airport. ICUMS customs clearance end-to-end.",
  alternates: { canonical: "https://www.ellcworth.com/destinations/ghana" },
  openGraph: {
    title: "Shipping to Ghana from the UK | Container, RoRo & Air Freight | Ellcworth Express",
    description: "Container shipping, RoRo vehicle shipping and air freight from the UK to Ghana. Tema Port and Accra International Airport. ICUMS customs clearance end-to-end.",
    url: "https://www.ellcworth.com/destinations/ghana",
    siteName: "Ellcworth Express",
    type: "website",
    images: [{ url: "https://www.ellcworth.com/ellc_hero1.png" }],
  },
  twitter: { card: "summary_large_image", title: "Shipping to Ghana from the UK | Ellcworth Express", description: "Container shipping, RoRo and air freight UK to Ghana. Tema Port and Accra Airport. ICUMS clearance end-to-end." },
};

export default function GhanaPage() {
  return <GhanaClient />;
}
