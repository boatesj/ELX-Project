import type { Metadata } from "next";
import HeroSlider from "./components/HeroSlider";
import ServiceOverview from "./components/ServiceOverview";
import QuoteSection from "./components/QuoteSection";
import KeyDestinations from "./components/KeyDestinations";
import BusinessAccountSection from "./components/BusinessAccountSection";
import VesselTracker from "./components/VesselTracker";
import TrustStories from "./components/TrustStories";
import SocialProofBoard from "./components/SocialProofBoard";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Ellcworth Express",
  "description": "UK freight forwarder specialising in shipping containers, vehicles, and sensitive cargo to Ghana, Nigeria, and West Africa.",
  "url": "https://www.ellcworth.com",
  "telephone": "+44-208-979-6054",
  "email": "cs@ellcworth.com",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "GB"
  },
  "areaServed": ["Ghana", "Nigeria", "Kenya", "Sierra Leone", "Côte d'Ivoire", "West Africa", "East Africa"],
  "serviceType": ["Freight Forwarding", "Container Shipping", "Air Freight", "RoRo Vehicle Shipping", "LCL Groupage", "Customs Clearance"],
  "sameAs": [
    "https://www.ellcworth.com"
  ]
};

export const metadata: Metadata = {
  title: "UK to Ghana Freight Forwarder | Ellcworth Express",
  description: "15+ years shipping containers, vehicles and sensitive cargo from the UK to Ghana, Nigeria and West Africa. Sealed, documented, on time.",
  alternates: { canonical: "https://www.ellcworth.com/" },
  openGraph: {
    title: "UK to Ghana Freight Forwarder | Ellcworth Express",
    description: "15+ years shipping containers, vehicles and sensitive cargo from the UK to Ghana, Nigeria and West Africa. Sealed, documented, on time.",
    url: "https://www.ellcworth.com/",
    type: "website",
    images: [{ url: "https://www.ellcworth.com/ellc_hero1.webp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "UK to Ghana Freight Forwarder | Ellcworth Express",
    description: "15+ years shipping containers, vehicles and sensitive cargo from the UK to Ghana, Nigeria and West Africa. Sealed, documented, on time.",
  },
};

const OFFSET = "scroll-mt-[120px] md:scroll-mt-[150px] lg:scroll-mt-[160px]";

export default function HomePage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section id="Header" className={OFFSET}>
        <HeroSlider />
      </section>

      <section id="services" className={OFFSET}>
        <ServiceOverview />
      </section>

      <section id="quote" className={OFFSET}>
        <QuoteSection />
      </section>

      <section id="repackaging" className={OFFSET}>
        <KeyDestinations />
      </section>

      <section id="whyus" className={OFFSET}>
        <BusinessAccountSection />
      </section>

      <VesselTracker />

      <section id="testimonials" className={OFFSET}>
        <TrustStories />
        <SocialProofBoard />
      </section>
    </div>
  );
}
