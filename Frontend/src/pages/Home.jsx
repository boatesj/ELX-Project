import Header from "../components/Header";
import BusinessAccountSection from "../components/BusinessAccountSection";
import QuoteSection from "../components/QuoteSection";
import KeyDestinations from "../components/KeyDestinations";
import TrustStories from "../components/TrustStories";
import ServiceOverview from "../components/ServiceOverview";
import SocialProofBoard from "../components/SocialProofBoard";
import HowItWorks from "../components/HowItWorks";

const OFFSET_CLASSES =
  "scroll-mt-[120px] md:scroll-mt-[150px] lg:scroll-mt-[160px]";

const Home = () => {
  return (
    <div>
      {/* Header anchor target for /#Header */}
      <section id="Header" className={OFFSET_CLASSES}>
        <Header />
      </section>

      {/* Services anchor target for /#services */}
      <section id="services" className={OFFSET_CLASSES}>
        <ServiceOverview />
      </section>

      {/* Why Us anchor target for /#whyus */}
      {/* (Now used for destinations — keeping the ID to avoid breaking existing hash links) */}
      <section id="whyus" className={OFFSET_CLASSES}>
        <KeyDestinations />
      </section>

      {/* Repackaging anchor target for /#repackaging */}
      {/* (Now used for How It Works — keeping the ID to avoid breaking existing hash links) */}
      <section id="repackaging" className={OFFSET_CLASSES}>
        <HowItWorks />
      </section>

      {/* Booking anchor target for /#booking */}
      <section id="booking" className={OFFSET_CLASSES}>
        <QuoteSection />
      </section>

      {/* Business Account Section (placed after quote for a more corporate upgrade path) */}
      <section className={OFFSET_CLASSES}>
        <BusinessAccountSection />
      </section>

      {/* Testimonials / Client Stories anchor target for /#testimonials */}
      <section id="testimonials" className={OFFSET_CLASSES}>
        <TrustStories />
        <SocialProofBoard />
      </section>
    </div>
  );
};

export default Home;
