import Header from "../components/Header";
import BusinessAccountSection from "../components/BusinessAccountSection";
import QuoteSection from "../components/QuoteSection";
import KeyDestinations from "../components/KeyDestinations";
import TrustStories from "../components/TrustStories";
import ServiceOverview from "../components/ServiceOverview";
import SocialProofBoard from "../components/SocialProofBoard";

const Home = () => {
  return (
    <div>
      <Header />

      {/* Booking anchor target for /#booking */}
      <section
        id="booking"
        className="scroll-mt-[120px] md:scroll-mt-[150px] lg:scroll-mt-[160px]"
      >
        <QuoteSection />
      </section>

      <KeyDestinations />
      <TrustStories />
      <BusinessAccountSection />
      <ServiceOverview />
      <SocialProofBoard />

      {/* Your other Home sections */}
      {/* <Services /> */}
      {/* <WhyUs /> */}
      {/* <Testimonials /> */}
    </div>
  );
};

export default Home;
