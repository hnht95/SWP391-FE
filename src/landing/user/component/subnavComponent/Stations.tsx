import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MdLocationOn, MdSearch } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import { useStations } from "../../../../hooks/useStations";
import type { Station } from "../../../../service/apiAdmin/apiStation/API";
import stationHero from "../../../../assets/vehicles/Vehicle.svg";

const StationsListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<string>("All");

  const { stations, loading, error } = useStations({ page: 1, limit: 50 });
  const gridRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Auto focus search on mount
  useEffect(() => {
    const t = setTimeout(() => searchInputRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  // Check if navigated from province card
  useEffect(() => {
    const state = location.state as { filterProvince?: string } | null;
    if (state?.filterProvince) {
      setSelectedProvince(state.filterProvince);
      // Scroll to grid
      setTimeout(() => {
        gridRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900/80">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  // Filter stations: only active, search term, and province
  const filteredStations = stations.filter((station) => {
    // Only show active stations
    if (!station.isActive) return false;

    const matchesSearch =
      station.name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      station.location?.address
        ?.toLowerCase()
        .includes(searchTerm?.toLowerCase()) ||
      station.code?.toLowerCase().includes(searchTerm?.toLowerCase());

    const matchesProvince =
      selectedProvince === "All" || station.province === selectedProvince;

    return matchesSearch && matchesProvince;
  });

  const getImageUrl = (station: Station) => {
    return station.imgStation?.url || "/placeholder-station.png";
  };

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (gridRef.current) {
        const y =
          gridRef.current.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-800 text-white">
      {/* Hero Section similar to Vehicles */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.img
          src={stationHero}
          alt="Stations network"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.75)_100%)]" />
        <div className="relative z-10 w-full max-w-5xl px-6 mx-auto text-center">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold drop-shadow-lg mb-6"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            Find a <span className="text-green-400">Zami Station</span>
          </motion.h1>
          <motion.p
            className="text-base sm:text-lg max-w-2xl mx-auto drop-shadow-md mb-10 text-gray-200"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.35 }}
          >
            Locate the nearest pickup or return point across our growing EV
            infrastructure.
          </motion.p>
          <motion.div
            className="relative max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.45 }}
          >
            <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by name, address or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKey}
              className="w-full pl-16 pr-6 py-4 rounded-2xl border-2 border-white/20 bg-white/95 backdrop-blur-sm text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-green-400/50 focus:border-green-400 shadow-2xl transition-all"
            />
          </motion.div>
        </div>
      </section>

      {/* Stations Grid */}
      <div className="w-full bg-gray-50">
        <div
          ref={gridRef}
          className="relative z-20 max-w-7xl mx-auto px-6 py-6 pb-16"
        >
          <motion.h2
            className="text-2xl font-semibold text-black mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {filteredStations.length > 0
              ? `Showing ${filteredStations.length} active station${
                  filteredStations.length !== 1 ? "s" : ""
                }`
              : "No active stations found"}
          </motion.h2>

          {filteredStations.length > 0 && (
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStations.map((station, index) => (
                <motion.div
                  key={station._id}
                  className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100/60"
                  whileHover={{ y: -6, scale: 1.02 }}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    ease: "easeOut",
                    delay: index * 0.05,
                  }}
                  onClick={() => navigate(`/stations/${station._id}`)}
                >
                  <div className="relative h-52 bg-gray-200 overflow-hidden">
                    <img
                      src={getImageUrl(station)}
                      alt={station.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Active Badge - Always shows "Active" now */}
                    <div className="absolute top-3 right-3 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm shadow-lg border border-white/10 bg-green-500/90 text-white">
                      Active
                    </div>
                    {station.code && (
                      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm shadow border border-white/10 bg-white/70 text-gray-800">
                        {station.code}
                      </div>
                    )}
                  </div>
                  <div className="p-6 text-gray-800">
                    <h3 className="text-xl font-bold mb-2 line-clamp-1">
                      {station.name}
                    </h3>
                    <div className="flex items-start gap-2 text-gray-600 mb-3">
                      <MdLocationOn className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm line-clamp-2">
                        {station.location.address}
                      </p>
                    </div>
                    {station.note && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {station.note}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/stations/${station._id}`);
                        }}
                        className="flex-1 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg active:scale-[0.97]"
                      >
                        View Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            `https://www.google.com/maps?q=${station.location.lat},${station.location.lng}`,
                            "_blank"
                          );
                        }}
                        className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Map
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationsListPage;
