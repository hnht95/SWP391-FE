import React from "react";
import station from "../../../../assets/aboutus/station.png";
import map from "../../../../assets/aboutus/map2.png";
import parking from "../../../../assets/aboutus/parking.png";

interface FeatureCardProps {
  title: string;
  imageSrc: string;
  altText: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  imageSrc,
  altText,
}) => {
  return (
    <div className="relative h-64 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <img
        src={imageSrc}
        alt={altText}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
        <h3 className="text-white text-xl font-semibold drop-shadow-md">
          {title}
        </h3>
      </div>
    </div>
  );
};

const FeaturesSection: React.FC = () => {
  return (
    <>
      <section className="bg-gray-100 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="200+ available cars"
              imageSrc={parking}
              altText="Flexible parking products"
            />
            <FeatureCard
              title="Prime locations"
              imageSrc={map}
              altText="Prime parking locations"
            />
            <FeatureCard
              title="Park up, Plug in, Power on"
              imageSrc={station}
              altText="EV charging at parking"
            />
          </div>
        </div>
        {/* Đã sửa lại div bên dưới */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-16 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 max-w-3xl mx-auto leading-tight">
            Why Choose Zami – Smarter, Simpler,{" "}
            <br className="hidden sm:inline" /> and More Easier to rent
          </h2>
        </div>
      </section>
    </>
  );
};

export default FeaturesSection;
