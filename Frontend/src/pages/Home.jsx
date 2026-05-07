import { Helmet } from "react-helmet-async";
import Header from "../components/Header";
import BusinessAccountSection from "../components/BusinessAccountSection";
import QuoteSection from "../components/QuoteSection";
import KeyDestinations from "../components/KeyDestinations";
import TrustStories from "../components/TrustStories";
import ServiceOverview from "../components/ServiceOverview";
import SocialProofBoard from "../components/SocialProofBoard";
import VesselTracker from "../components/VesselTracker";

const OFFSET_CLASSES =
  "scroll-mt-[120px] md:scroll-mt-[150px] lg:scroll-mt-[160px]";

const Home = () => {
  return (
    <div>
      <Helmet>
        <title>Ellcworth Express | UK to West Africa Freight Specialists</title>
        <link rel="canonical" href="https://www.ellcworth.com/" />
        <meta property="og:title" content="Ellcworth Express | UK to West Africa Freight Specialists" />
        <meta property="og:description" content="12 years shipping containers, vehicles and sensitive cargo from the UK to Ghana, Nigeria and West Africa. Sealed, documented, on time." />
        <meta property="og:url" content="https://www.ellcworth.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.ellcworth.com/ellc_hero1.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ellcworth Express | UK to West Africa Freight Specialists" />
        <meta name="twitter:description" content="12 years shipping containers, vehicles and sensitive cargo from the UK to Ghana, Nigeria and West Africa. Sealed, documented, on time." />
      </Helmet>

      {/* Header anchor target for /#Header */}
      <section id="Header" className={OFFSET_CLASSES}>
        <Header />
      </section>

      {/* Services anchor target for /#services */}
      <section id="services" className={OFFSET_CLASSES}>
        <ServiceOverview />
      </section>


      {/* Why Us anchor target for /#whyus */}
      <section id="whyus" className={OFFSET_CLASSES}>
        <BusinessAccountSection />
      </section>

      {/* Repackaging anchor target for /#repackaging */}
      <section id="repackaging" className={OFFSET_CLASSES}>
        <KeyDestinations />
      </section>

      {/* Booking anchor target for /#booking */}
      <section id="quote" className={OFFSET_CLASSES}>
        <QuoteSection />
      </section>

      {/* Vessel tracker */}
      <VesselTracker />

      {/* Testimonials / Client Stories anchor target for /#testimonials */}
      <section id="testimonials" className={OFFSET_CLASSES}>
        <TrustStories />
        <SocialProofBoard />
      </section>
    </div>
  );
};

export default Home;
