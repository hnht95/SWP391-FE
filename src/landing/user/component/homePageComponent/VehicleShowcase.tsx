import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useVehicles } from "../../../../hooks/useVehicles";

const VehicleShowcase: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { vehicles, loading } = useVehicles({ page: 1, limit: 5 });
  const navigate = useNavigate();

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (!vehicles || vehicles.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % vehicles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [vehicles]);

  if (loading || !vehicles || vehicles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const activeVehicle = vehicles[activeIndex];

  // Get the image URL from the photo object
  interface PhotoObject {
    _id: string;
    type: string;
    url: string;
  }

  const getImageUrl = () => {
    const exteriorPhoto = activeVehicle?.defaultPhotos
      ?.exterior?.[0] as unknown as PhotoObject;
    const interiorPhoto = activeVehicle?.defaultPhotos
      ?.interior?.[0] as unknown as PhotoObject;

    if (
      exteriorPhoto &&
      typeof exteriorPhoto === "object" &&
      exteriorPhoto.url
    ) {
      return exteriorPhoto.url;
    }
    if (
      interiorPhoto &&
      typeof interiorPhoto === "object" &&
      interiorPhoto.url
    ) {
      return interiorPhoto.url;
    }
    return "/placeholder-car.png";
  };

  const mainImage = getImageUrl();

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev - 1 + vehicles.length) % vehicles.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % vehicles.length);
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 flex flex-col transition-colors duration-700`}
    >
      {/* Header */}
      <div className="text-center pt-20 pb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Explore all the Zami models
        </h1>

        {/* Vehicle Tabs */}
        <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap px-4">
          {vehicles.map((vehicle, index) => (
            <button
              key={vehicle.id}
              onClick={() => setActiveIndex(index)}
              className={`text-lg md:text-lg font-medium transition-all duration-300 px-4 py-2 ${
                index === activeIndex
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {vehicle.model}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 relative">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          className="absolute left-8 md:left-16 z-10 p-3 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Previous vehicle"
        >
          <MdChevronLeft className="w-8 h-8 text-gray-900" />
        </button>

        {/* Vehicle Image with Animation */}
        <div className="max-w-6xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeVehicle.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <img
                src={mainImage}
                alt={`${activeVehicle.brand} ${activeVehicle.model}`}
                className="w-full h-auto object-contain max-h-[500px]"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="absolute right-8 md:right-16 z-10 p-3 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Next vehicle"
        >
          <MdChevronRight className="w-8 h-8 text-gray-900" />
        </button>
      </div>

      {/* Bottom Info */}
      <div className="pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between">
            {/* Vehicle Name & Button */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {activeVehicle.model}
              </h2>
              <p className="text-gray-600 mb-4">
                {activeVehicle.brand} - {activeVehicle.year}
              </p>
              <button
                onClick={() => navigate(`/vehicles/${activeVehicle.id}`)}
                className="px-8 py-3 border-2 border-gray-900 text-gray-900 font-medium rounded hover:bg-gray-900 hover:text-white transition-all duration-200"
              >
                Explore More
              </button>
            </div>

            {/* Specifications */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeVehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex gap-8 md:gap-12"
              >
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {activeVehicle.model}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Model</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {activeVehicle.batteryCapacity}kWh
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Battery</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {activeVehicle.mileage.toLocaleString()}km
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Mileage</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {activeVehicle.pricePerDay.toLocaleString()}đ
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Price/Day</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleShowcase;
