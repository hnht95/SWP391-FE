import React from "react";
import { motion } from "framer-motion";
import station from "../../../../../assets/aboutus/station.png";
import map from "../../../../../assets/aboutus/map2.png";
import parking from "../../../../../assets/aboutus/parking.png";

interface FeatureCardProps {
  title: string;
  imageSrc: string;
  altText: string;
  index?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  imageSrc,
  altText,
  index = 0,
}) => {
  return (
    <motion.div
      className="group relative h-64 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 will-change-transform"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
      whileHover={{ y: -6 }}
    >
      <img
        src={imageSrc}
        alt={altText}
        className="w-full h-full object-cover transform-gpu transition-transform duration-500 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
        <h3 className="text-white text-xl font-semibold drop-shadow-md">
          {title}
        </h3>
      </div>
    </motion.div>
  );
};

const FeaturesSection: React.FC = () => {
  return (
    <>
      <section className="bg-gray-100 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              index={0}
              title="200+ available cars"
              imageSrc={parking}
              altText="Flexible parking products"
            />
            <FeatureCard
              index={1}
              title="Prime locations"
              imageSrc={map}
              altText="Prime parking locations"
            />
            <FeatureCard
              index={2}
              title="Park up, Plug in, Power on"
              imageSrc={station}
              altText="EV charging at parking"
            />
          </div>
        </div>
        {/* Đã sửa lại div bên dưới */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-16 text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-extrabold text-gray-900 max-w-3xl mx-auto leading-tight"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          >
            Why Choose Zami – Smarter, Simpler,{" "}
            <br className="hidden sm:inline" /> and More Easier to rent
          </motion.h2>
        </div>
      </section>
    </>
  );
};

export default FeaturesSection;
