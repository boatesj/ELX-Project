import type { Metadata } from "next";
import HeroSlider from "./components/HeroSlider";
import ServiceOverview from "./components/ServiceOverview";
import QuoteSection from "./components/QuoteSection";
import KeyDestinations from "./components/KeyDestinations";
import BusinessAccountSection from "./components/BusinessAccountSection";
import VesselTracker from "./components/VesselTracker";
import TrustStories from "./components/TrustStories";
import SocialProofBoard from "./components/SocialProofBoard";

export const metadata: Metadata = {
  title: "Ellcworth Express | UK to West Africa Freight Specialists",
  description: "12 years shipping containers, vehicles and sensitive cargo from the UK to Ghana, Nigeria and West Africa. Sealed, documented, on time.",
  alternates: { canonical: "https://www.ellcworth.com/" },
  openGraph: {
    title: "Ellcworth Express | UK to West Africa Freight Specialists",
    description: "12 years shipping containers, vehicles and sensitive cargo from the UK to Ghana, Nigeria and West Africa. Sealed, documented, on time.",
    url: "https://www.ellcworth.com/",
    type: "website",
    images: [{ url: "https://www.ellcworth.com/ellc_hero1.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ellcworth Express | UK to West Africa Freight Specialists",
    description: "12 years shipping containers, vehicles and sensitive cargo from the UK to Ghana, Nigeria and West Africa. Sealed, documented, on time.",
  },
};

const OFFSET = "scroll-mt-[120px] md:scroll-mt-[150px] lg:scroll-mt-[160px]";

export default function HomePage() {
  return (
    <div>
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
