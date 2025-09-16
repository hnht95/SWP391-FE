// src/components/Services.tsx
import React from "react";
import { FaHeadset, FaDollarSign, FaCheckCircle, FaCar } from "react-icons/fa";
import bmwxm from "../../../assets/homepage/ourService/bmwxm.png";

const Services = () => {
  return (
    <section
      className="relative w-full h-screen bg-cover bg-center flex"
      style={{
        backgroundImage: `url(${bmwxm})`,
      }}
    >
      {/* Left overlay with blur */}
      <div className="w-full md:w-1/2 h-full bg-black/60 backdrop-blur-md flex items-center">
        <div className="px-6 md:px-12 text-white space-y-6">
          <h2 className="text-4xl font-bold">Our Services</h2>
          <p className="text-lg text-gray-200">
            Looking to Save More on Your rental car?
          </p>
          <p className="text-gray-300 max-w-xl">
            Discover unparalleled luxury and convenience with Zami Cars’ premium
            car rental services. From sleek sedans to spacious SUVs, our
            meticulously curated fleet ensures you’ll travel in style and
            comfort. With flexible rental options, seamless booking, and
            exceptional customer service, we’re your trusted partner for
            unforgettable journeys.
          </p>

          {/* Services list */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-400">
                <FaHeadset className="text-white w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Support 24/7</h3>
                <p className="text-gray-300 text-sm">
                  Our dedicated team is available 24/7 to ensure your car rental
                  experience is smooth and stress-free
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-400">
                <FaDollarSign className="text-white w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Money back Guarantee</h3>
                <p className="text-gray-300 text-sm">
                  Our money-back guarantee ensures your satisfaction, providing
                  peace of mind for every journey you embark on
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-400">
                <FaCheckCircle className="text-white w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Most Affordable Deals</h3>
                <p className="text-gray-300 text-sm">
                  Unlock unbeatable savings on top-tier rentals with EuroElite
                  Cars’ most affordable deals
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-400">
                <FaCar className="text-white w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Registered Vehicles</h3>
                <p className="text-gray-300 text-sm">
                  Explore our fleet of meticulously maintained registered
                  vehicles, ensuring safety, reliability, and peace of mind
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side image just shows the background */}
      <div className="hidden md:block w-1/2"></div>
    </section>
  );
};

export default Services;
