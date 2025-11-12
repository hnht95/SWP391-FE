import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useStations } from "../../../../hooks/useStations";
import type { Station } from "../../../../service/apiAdmin/apiStation/API";

interface ProvinceData {
  province: string;
  count: number;
  imageUrl: string;
  stations: Station[];
}

const StationShowcase: React.FC = () => {
  const { stations, loading } = useStations({
    page: 1,
    limit: 100,
    activeOnly: true,
  });
  const navigate = useNavigate();

  // Group stations by province and count
  const provinceData = useMemo(() => {
    if (!stations || stations.length === 0) return [];

    const grouped = stations.reduce((acc, station) => {
      const province = station.province || "Unknown";
      if (!acc[province]) {
        acc[province] = {
          province,
          count: 0,
          imageUrl: station.imgStation?.url || "/placeholder-station.png",
          stations: [],
        };
      }
      acc[province].count++;
      acc[province].stations.push(station);
      return acc;
    }, {} as Record<string, ProvinceData>);

    // Convert to array and sort by count (descending)
    return Object.values(grouped).sort((a, b) => b.count - a.count);
  }, [stations]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!stations || stations.length === 0 || provinceData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">No stations available</p>
      </div>
    );
  }

  const handleProvinceClick = (province: string) => {
    navigate("/stations", {
      state: { filterProvince: province },
    });
  };

  // Get grid class based on index (biggest card for most stations - index 0)
  const getGridClass = (index: number) => {
    if (index === 0) {
      // Biggest card for most stations
      return "md:col-span-2 md:row-span-1";
    }
    return "md:col-span-1 md:row-span-1";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      {/* Header */}
      <motion.div
        className="max-w-7xl mx-auto mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1
          className="text-2xl md:text-3xl font-bold text-gray-900 mb-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Explore Stations by Province
        </motion.h1>
        <motion.p
          className="text-gray-600 text-base"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Browse our car parks across different provinces
        </motion.p>
      </motion.div>

      {/* Province Cards Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
          {provinceData.map((data, index) => (
            <motion.div
              key={data.province}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className={`relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ${getGridClass(
                index
              )} ${index === 0 ? "min-h-[280px]" : "min-h-[280px]"}`}
              onClick={() => handleProvinceClick(data.province)}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={data.imageUrl}
                  alt={data.province}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                <h3 className="text-xl md:text-2xl font-bold mb-2">
                  {data.province}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-white/90 text-sm">
                    {data.count} car park{data.count !== 1 ? "s" : ""}
                  </p>
                  <div className="w-9 h-9 rounded-full border-2 border-white/80 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                    <FaArrowRight className="text-xs" />
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StationShowcase;
