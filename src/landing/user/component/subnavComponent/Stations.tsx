import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThreeDots } from "react-loader-spinner";
import { MdLocationOn, MdSearch } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import { useStations } from "../../../../hooks/useStations";
import type { Station } from "../../../../service/apiAdmin/apiStation/API";
import stationHero from "../../../../assets/vehicles/Vehicle.svg";
import { FaCheck, FaChevronDown } from "react-icons/fa";

const StationsListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<string>("All");
  const [openDropdown, setOpenDropdown] = useState(false);

  const { stations, loading, error } = useStations({ page: 1, limit: 50 });
  const gridRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const provinceDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        provinceDropdownRef.current &&
        !provinceDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      setTimeout(() => {
        gridRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  // Get unique provinces from stations
  const provinces = React.useMemo(() => {
    const uniqueProvinces = [
      ...new Set(
        stations
          .filter((s) => s.province && s.isActive)
          .map((s) => s.province)
          .filter((p): p is string => Boolean(p)) // Type guard to remove undefined
      ),
    ].sort();
    return ["All", ...uniqueProvinces];
  }, [stations]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <ThreeDots
            visible={true}
            height="80"
            width="80"
            color="#000000"
            radius="9"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
          <p className="mt-4 text-gray-600 text-lg">Loading stations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-red-600 text-xl font-bold mb-2">Error</h2>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter stations: only active, search term, and province
  const filteredStations = stations.filter((station) => {
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

  const getImageUrl = (station: Station): string => {
    return station.imgStation?.url || "/placeholder-station.png";
  };

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>): void => {
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center overflow-hidden">
        <motion.img
          src={stationHero}
          alt="Stations network"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center text-white mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold drop-shadow-lg mb-6"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            >
              Find a <span className="text-green-400">Zami Station</span>
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg max-w-2xl mx-auto drop-shadow-md mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            >
              Locate the nearest pickup or return point across our growing EV
              infrastructure
            </motion.p>

            {/* Search Bar */}
            <motion.div
              className="relative max-w-3xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
            >
              <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl z-10" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name, address or code..."
                className="w-full pl-16 pr-6 py-4 rounded-2xl border-2 border-white/20 bg-white/95 backdrop-blur-sm text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-green-400/50 focus:border-green-400 shadow-2xl transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKey}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <div className="relative z-[100] py-8 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 select-none">
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          >
            {/* Province Filter Card */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredStations.length > 0
                  ? `Showing ${filteredStations.length} station${
                      filteredStations.length !== 1 ? "s" : ""
                    }`
                  : "No active stations found"}
              </h2>

              <motion.div
                className="bg-white rounded-2xl transition-all duration-300 border border-slate-100 shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="p-4 min-w-[280px]">
                  <div ref={provinceDropdownRef} className="relative">
                    <button
                      onClick={() => setOpenDropdown(!openDropdown)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-all text-left focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-200 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2">
                        <MdLocationOn className="text-gray-600 text-lg" />
                        <span className="text-gray-700 text-sm font-medium">
                          {selectedProvince === "All"
                            ? "All Provinces"
                            : selectedProvince}
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: openDropdown ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FaChevronDown className="text-gray-400 text-xs flex-shrink-0 ml-2 group-hover:text-gray-600" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {openDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-[9999] w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-64 overflow-y-auto"
                        >
                          {provinces.map((province) => (
                            <button
                              key={province}
                              onClick={() => {
                                setSelectedProvince(province);
                                setOpenDropdown(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left transition-all flex items-center justify-between text-sm ${
                                selectedProvince === province
                                  ? "bg-gray-100 text-gray-900 font-medium"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <span>
                                {province === "All"
                                  ? "All Provinces"
                                  : province}
                              </span>
                              {selectedProvince === province && (
                                <FaCheck className="text-gray-700 text-xs" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stations Grid */}
      <div className="bg-gray-50">
        <div
          ref={gridRef}
          className="relative z-20 max-w-7xl mx-auto px-6 py-12 pb-16"
        >
          {filteredStations.length > 0 ? (
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
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p className="text-xl">
                No stations found matching your criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationsListPage;
