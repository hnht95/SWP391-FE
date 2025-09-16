import FeaturesSection from "./aboutUsComponent/FeaturesSection";
import HeroSection from "./aboutUsComponent/HeroSection";
import KeyInfoSection from "./aboutUsComponent/KeyInfoSection";

const AboutUs = () => {
  return (
    <div className="font-sans text-gray-800">
      <HeroSection />
      <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <KeyInfoSection />
      </main>
      <FeaturesSection />
    </div>
  );
};

export default AboutUs;
