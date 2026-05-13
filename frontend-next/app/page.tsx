import type { Metadata } from "next";
import HeroSlider from "./components/HeroSlider";
import ServiceOverview from "./components/ServiceOverview";

export const metadata: Metadata = {
  title: "Ellcworth Express | UK to West Africa Freight Specialists",
  description:
    "12 years shipping containers, vehicles and sensitive cargo from the UK to Ghana, Nigeria and West Africa. Sealed, documented, on time.",
  alternates: {
    canonical: "https://www.ellcworth.com/",
  },
  openGraph: {
    title: "Ellcworth Express | UK to West Africa Freight Specialists",
    description:
      "12 years shipping containers, vehicles and sensitive cargo from the UK to Ghana, Nigeria and West Africa. Sealed, documented, on time.",
    url: "https://www.ellcworth.com/",
    type: "website",
    images: [{ url: "https://www.ellcworth.com/ellc_hero1.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ellcworth Express | UK to West Africa Freight Specialists",
    description:
      "12 years shipping containers, vehicles and sensitive cargo from the UK to Ghana, Nigeria and West Africa. Sealed, documented, on time.",
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
    </div>
  );
}
