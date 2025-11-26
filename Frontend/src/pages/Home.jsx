import Header from "../components/Header";
import BusinessAccountSection from "../components/BusinessAccountSection";
import QuoteSection from "../components/QuoteSection";
import KeyDestinations from "../components/KeyDestinations";
import TrustStories from "../components/TrustStories";
import ServiceOverview from "../components/ServiceOverview";

const Home = () => {
  return (
    <div>
      <Header />
      <QuoteSection />
      <KeyDestinations />
      <TrustStories />
      <BusinessAccountSection />
      <ServiceOverview />

      {/* Your other Home sections */}
      {/* <Services /> */}
      {/* <WhyUs /> */}
      {/* <Testimonials /> */}
    </div>
  );
};

export default Home;
