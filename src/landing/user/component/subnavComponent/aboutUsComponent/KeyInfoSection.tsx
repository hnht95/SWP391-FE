import React from "react";
import vf3 from "../../../../../assets/aboutus/vf3.png";
import byd from "../../../../../assets/aboutus/byd.png";
import { FaRegCircleCheck } from "react-icons/fa6";
import { FiClock } from "react-icons/fi";

const KeyInfoSection: React.FC = () => {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-700 mt-12 mb-16 text-left relative">
          EV-Car <span className="text-gray-500">Renting </span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16 lg:mb-24">
          <div className="order-2 lg:order-1">
            {" "}
            <img
              src={byd}
              alt="Car on a scenic road"
              className="rounded-2xl shadow-xl w-full h-auto object-cover max-h-[400px]"
            />
          </div>
          <div className="order-1 lg:order-2">
            {" "}
            <div className="flex items-start">
              <FaRegCircleCheck className="w-8 h-8 text-black flex-shrink-0 mt-1 mr-4" />
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  9,500 spaces in 6 key locations
                </h3>
                <p className="text-gray-600 text-lg">
                  With over 20 towns across the UK, Citipark concentrate on an
                  innovative approach to parking. Utilising the latest parking
                  technology with ANPR cameras, we ensure you can park with the
                  best value.
                </p>
                <p className="text-gray-600 text-lg mt-4">
                  We employ a large complement of staff throughout the UK with a
                  mixture of head office, 24/7 customer support, consultants.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            {" "}
            <div className="flex items-start">
              <FiClock className="w-8 h-8 text-black flex-shrink-0 mt-1 mr-4" />
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Over 60 years experience
                </h3>
                <p className="text-gray-600 text-lg">
                  Citipark is a wholly owned subsidiary of{" "}
                  <span className="font-semibold">
                    Town Centre Securities PLC (TCS)
                  </span>{" "}
                  who have many years of experience in the car park industry.
                </p>
                <p className="text-gray-600 text-lg mt-4">
                  We always have (and continue to) implement the latest and most
                  reliable parking management systems across all of our
                  branches.
                </p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            {" "}
            {/* order-1 trên mobile, order-2 trên lg để ảnh nằm bên phải */}
            <img
              src={vf3} // <-- Sử dụng hình ảnh thứ hai
              alt="Luxury car parked"
              className="rounded-2xl shadow-xl w-full h-auto object-cover max-h-[400px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default KeyInfoSection;
