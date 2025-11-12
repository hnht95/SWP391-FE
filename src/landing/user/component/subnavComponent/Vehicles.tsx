import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import VehiclesCard from "./vehiclesComponent/VehiclesCard";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCar,
  FaChevronDown,
  FaCheck,
} from "react-icons/fa";
import {
  getVehiclesPaginatedWithFilters,
  type Vehicle,
} from "../../../../service/apiAdmin/apiVehicles/API";
import {
  getAllStations,
  type Station,
} from "../../../../service/apiAdmin/apiStation/API";
import vehicleHeroImage from "../../../../assets/vehicles/Vehicle.svg";

const Vehicles: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus] = useState("available"); // Always filter available only
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedStation, setSelectedStation] = useState("All");
  const vehicleGridRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const brandDropdownRef = useRef<HTMLDivElement>(null);
  const stationDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(event.target as Node) &&
        stationDropdownRef.current &&
        !stationDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStationId = (station: Vehicle["station"]): string | null => {
    if (typeof station === "string") return station;
    if (station && typeof station === "object") return station._id;
    return null;
  };

  useEffect(() => {
    const urlSearchTerm = searchParams.get("search");
    if (urlSearchTerm) {
      setSearchTerm(decodeURIComponent(urlSearchTerm));
    }
  }, [searchParams]);

  // Check if navigated from station detail page
  useEffect(() => {
    const state = location.state as {
      stationId?: string;
      stationName?: string;
    } | null;
    if (state?.stationId) {
      setSelectedStation(state.stationId);
      // Optionally scroll to vehicle grid
      setTimeout(() => {
        vehicleGridRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setLoading(true);
        setError("");

        const [stationsData, vehiclesPage] = await Promise.all([
          getAllStations(),
          getVehiclesPaginatedWithFilters(1, 10, {}),
        ]);

        setStations(stationsData);
        setVehicles(vehiclesPage.items);
        setPage(1);
        setHasMore(
          vehiclesPage.pagination.page < vehiclesPage.pagination.totalPages
        );
      } catch (err: unknown) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  // Load more when sentinel visible
  const loadMore = React.useCallback(async () => {
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const statusParam =
        selectedStatus !== "All" &&
        ["available", "reserved", "rented", "maintenance"].includes(
          selectedStatus
        )
          ? (selectedStatus as
              | "available"
              | "reserved"
              | "rented"
              | "maintenance")
          : undefined;
      const vehiclesPage = await getVehiclesPaginatedWithFilters(nextPage, 10, {
        brand: selectedBrand !== "All" ? selectedBrand : undefined,
        status: statusParam,
        station: selectedStation !== "All" ? selectedStation : undefined,
      });
      setVehicles((prev) => [...prev, ...vehiclesPage.items]);
      setPage(nextPage);
      setHasMore(
        vehiclesPage.pagination.page < vehiclesPage.pagination.totalPages
      );
    } catch (e) {
      console.error("Load more failed", e);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [page, selectedBrand, selectedStatus, selectedStation]);

  useEffect(() => {
    if (!observerRef.current || loading || loadingMore || !hasMore) return;
    const sentinel = observerRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasMore, loadingMore, loading, loadMore]);

  // (moved loadMore above)

  // Reset pagination when filters change
  useEffect(() => {
    const resetAndFetch = async () => {
      setPage(1);
      setHasMore(true);
      setLoading(true);
      try {
        const statusParam =
          selectedStatus !== "All" &&
          ["available", "reserved", "rented", "maintenance"].includes(
            selectedStatus
          )
            ? (selectedStatus as
                | "available"
                | "reserved"
                | "rented"
                | "maintenance")
            : undefined;
        const vehiclesPage = await getVehiclesPaginatedWithFilters(1, 10, {
          brand: selectedBrand !== "All" ? selectedBrand : undefined,
          status: statusParam,
          station: selectedStation !== "All" ? selectedStation : undefined,
        });
        setVehicles(vehiclesPage.items);
        setHasMore(
          vehiclesPage.pagination.page < vehiclesPage.pagination.totalPages
        );
      } catch (e) {
        console.error("Filter fetch failed", e);
        setVehicles([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    // avoid initial run before stations loaded? run after stations fetched
    // we run whenever selected filters change
    resetAndFetch();
  }, [selectedBrand, selectedStatus, selectedStation]);

  const stationMap = useMemo(() => {
    return stations.reduce((map, station) => {
      map[station._id] = station;
      return map;
    }, {} as Record<string, Station>);
  }, [stations]);

  const allBrands = useMemo(() => {
    if (vehicles.length === 0) return ["All"];
    const brands = vehicles.map((car) => car.brand);
    return ["All", ...new Set(brands)];
  }, [vehicles]);

  // ✅ Get unique stations from vehicles
  const allStations = useMemo(() => {
    if (stations.length === 0) return ["All"];

    // Get unique station IDs from vehicles
    const stationIds = new Set(
      vehicles
        .map((car) => getStationId(car.station))
        .filter(Boolean) as string[]
    );

    // Filter stations that have vehicles
    const stationsWithVehicles = stations.filter((station) =>
      stationIds.has(station._id)
    );

    return ["All", ...stationsWithVehicles];
  }, [vehicles, stations]);

  // ✅ Filter logic - sửa lại station filter
  const filterCars = () => {
    return vehicles.filter((car) => {
      // ✅ Chỉ lấy xe có status "available"
      if (car.status !== "available") return false;

      // Search by brand + model + plate number
      let matchesSearchTerm = true;
      if (searchTerm.trim()) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const carFullName = `${car.brand} ${car.model}`.toLowerCase();
        const carPlate = car.plateNumber.toLowerCase();

        matchesSearchTerm =
          carFullName.includes(lowerSearchTerm) ||
          carPlate.includes(lowerSearchTerm) ||
          car.brand.toLowerCase().includes(lowerSearchTerm) ||
          car.model.toLowerCase().includes(lowerSearchTerm);
      }

      // Brand filter
      const matchesBrand =
        selectedBrand === "All" || car.brand === selectedBrand;

      // ✅ Station filter
      const matchesStation =
        selectedStation === "All" ||
        getStationId(car.station) === selectedStation;

      return matchesSearchTerm && matchesBrand && matchesStation;
    });
  };

  const filteredVehicles = filterCars();

  // ✅ Auto-scroll to vehicle grid when search or filter changes
  const scrollToVehicleGrid = () => {
    if (vehicleGridRef.current) {
      const yOffset = -100; // offset for fixed header
      const element = vehicleGridRef.current;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // ✅ Handle search submission (Enter key)
  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      scrollToVehicleGrid();
    }
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-red-600 text-xl font-bold mb-2">
              Error Loading Vehicles
            </h2>
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

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center overflow-hidden">
        <motion.img
          src={vehicleHeroImage}
          alt="Electric Vehicles Fleet"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />

        {/* Hero Content - Centered */}
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
              Browse Our{" "}
              <span className="text-green-400">Available Vehicles</span>
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg max-w-2xl mx-auto drop-shadow-md mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            >
              Use the filters below to find your ideal electric vehicle
            </motion.p>

            {/* Search Bar in Hero */}
            <motion.div
              className="relative max-w-3xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
            >
              <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl z-10" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by brand, model, or plate number..."
                className="w-full pl-16 pr-6 py-4 rounded-2xl border-2 border-white/20 bg-white/95 backdrop-blur-sm text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-green-400/50 focus:border-green-400 shadow-2xl transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchSubmit}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <div className="relative z-[100] py-8">
        <div className="container mx-auto px-4 select-none">
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          >
            {/* Filters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand Filter Card */}
              <motion.div
                className="bg-white rounded-2xl transition-all duration-300 border border-slate-100 shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12  flex items-center justify-center">
                      <FaCar size={30} className="text-gray-700 text-lg" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-800">
                        Brand
                      </h3>
                      <p className="text-xs text-gray-500">Select car brand</p>
                    </div>
                  </div>
                  {/* Custom Dropdown */}
                  <div ref={brandDropdownRef} className="relative">
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "brand" ? null : "brand"
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-all text-left focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-200 flex items-center justify-between group"
                    >
                      <span className="text-gray-700 text-sm truncate">
                        {selectedBrand}
                      </span>
                      <motion.div
                        animate={{ rotate: openDropdown === "brand" ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FaChevronDown className="text-gray-400 text-xs flex-shrink-0 ml-2 group-hover:text-gray-600" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {openDropdown === "brand" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-9999 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-64 overflow-y-auto"
                        >
                          {allBrands.map((brand) => (
                            <button
                              key={brand}
                              onClick={() => {
                                setSelectedBrand(brand);
                                setOpenDropdown(null);
                              }}
                              className={`w-full px-4 py-2.5 text-left transition-all flex items-center justify-between text-sm ${
                                selectedBrand === brand
                                  ? "bg-gray-100 text-gray-900 font-medium"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <span>{brand}</span>
                              {selectedBrand === brand && (
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

              {/* Station Filter Card */}
              <motion.div
                className="bg-white rounded-2xl transition-all duration-300 border border-slate-100 shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <FaMapMarkerAlt className="text-gray-700 text-lg" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-800">
                        Location
                      </h3>
                      <p className="text-xs text-gray-500">Choose station</p>
                    </div>
                  </div>
                  {/* Custom Dropdown */}
                  <div ref={stationDropdownRef} className="relative">
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "station" ? null : "station"
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-all text-left focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-200 flex items-center justify-between group"
                    >
                      <span className="text-gray-700 text-sm truncate">
                        {selectedStation === "All"
                          ? "All Stations"
                          : stations.find((s) => s._id === selectedStation)
                              ?.name || selectedStation}
                      </span>
                      <motion.div
                        animate={{
                          rotate: openDropdown === "station" ? 180 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <FaChevronDown className="text-gray-400 text-xs flex-shrink-0 ml-2 group-hover:text-gray-600" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {openDropdown === "station" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-64 overflow-y-auto"
                        >
                          {allStations.map((station) => {
                            const stationId =
                              typeof station === "string"
                                ? station
                                : station._id;
                            const stationName =
                              typeof station === "string"
                                ? "All Stations"
                                : station.name;

                            return (
                              <button
                                key={stationId}
                                onClick={() => {
                                  setSelectedStation(stationId);
                                  setOpenDropdown(null);
                                }}
                                className={`w-full px-4 py-2.5 text-left transition-all flex items-center justify-between text-sm ${
                                  selectedStation === stationId
                                    ? "bg-gray-100 text-gray-900 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                }`}
                              >
                                <span>{stationName}</span>
                                {selectedStation === stationId && (
                                  <FaCheck className="text-gray-700 text-xs" />
                                )}
                              </button>
                            );
                          })}
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

      {/* Vehicle Grid Section */}
      <div
        ref={vehicleGridRef}
        className=" mx-auto px-4 pb-12 select-none z-50"
      >
        {/* Vehicle Grid */}
        {filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredVehicles.map((car) => (
              <VehiclesCard
                key={car._id}
                car={car}
                station={
                  typeof car.station === "object" && car.station !== null
                    ? car.station
                    : stationMap[car.station as string]
                }
              />
            ))}
            {/* Sentinel for infinite scroll */}
            <div
              ref={observerRef}
              className="col-span-full h-8 flex items-center justify-center"
            >
              {loadingMore && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-gray-400 rounded-full" />
                  Loading more...
                </div>
              )}
              {!hasMore && !loadingMore && (
                <div className="text-gray-400 text-xs">No more vehicles</div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 text-xl py-10">
            No vehicles found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default Vehicles;
