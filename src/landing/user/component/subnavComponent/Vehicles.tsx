import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import VehiclesCard from "./vehiclesComponent/VehiclesCard";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaUsers,
  FaChevronDown,
  FaCar,
} from "react-icons/fa";
import {
  getAllVehicles,
  type Vehicle,
} from "../../../../service/apiAdmin/apiVehicles/API";
import {
  getAllStations,
  type Station,
} from "../../../../service/apiAdmin/apiStation/API";

const Vehicles: React.FC = () => {
  const [searchParams] = useSearchParams();

  // ✅ State cho API data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // ✅ Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedStation, setSelectedStation] = useState("All"); // ✅ NEW

  // ✅ Set initial search term from URL params
  useEffect(() => {
    const urlSearchTerm = searchParams.get("search");
    if (urlSearchTerm) {
      setSearchTerm(decodeURIComponent(urlSearchTerm));
    }
  }, [searchParams]);

  // ✅ Fetch vehicles and stations from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch both vehicles and stations in parallel
        const [vehiclesData, stationsData] = await Promise.all([
          getAllVehicles(),
          getAllStations(),
        ]);

        setVehicles(vehiclesData);
        setStations(stationsData);
      } catch (err: unknown) {
        console.error("Failed to fetch data:", err);
        if (typeof err === "object" && err !== null && "message" in err) {
          setError(
            (err as { message?: string }).message ||
              "Failed to load data. Please try again."
          );
        } else {
          setError("Failed to load data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Create station map for quick lookup
  const stationMap = useMemo(() => {
    return stations.reduce((map, station) => {
      map[station._id] = station;
      return map;
    }, {} as Record<string, Station>);
  }, [stations]);

  // ✅ Get unique brands from vehicles
  const allBrands = useMemo(() => {
    if (vehicles.length === 0) return ["All"];
    const brands = vehicles.map((car) => car.brand);
    return ["All", ...new Set(brands)];
  }, [vehicles]);

  // ✅ Get unique stations from vehicles (only stations that have vehicles)
  const allStations = useMemo(() => {
    if (stations.length === 0) return ["All"];

    // Get unique station IDs from vehicles
    const stationIds = new Set(
      vehicles
        .map((car) => (typeof car.station === "string" ? car.station : null))
        .filter(Boolean) as string[]
    );

    // Filter stations that have vehicles
    const stationsWithVehicles = stations.filter((station) =>
      stationIds.has(station._id)
    );

    return ["All", ...stationsWithVehicles];
  }, [vehicles, stations]);

  // ✅ Get status options
  const statusOptions = [
    "All",
    "available",
    "reserved",
    "rented",
    "maintenance",
  ];

  // ✅ Filter logic based on actual API fields
  const filterCars = () => {
    return vehicles.filter((car) => {
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

      // Status filter
      const matchesStatus =
        selectedStatus === "All" || car.status === selectedStatus;

      // Brand filter
      const matchesBrand =
        selectedBrand === "All" || car.brand === selectedBrand;

      // ✅ Station filter
      const matchesStation =
        selectedStation === "All" ||
        (typeof car.station === "string" && car.station === selectedStation);

      return (
        matchesSearchTerm && matchesStatus && matchesBrand && matchesStation
      );
    });
  };

  const filteredVehicles = filterCars();

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
    <div className="container mx-auto px-4 py-10 select-none">
      <h1 className="text-4xl font-bold text-center mb-4">
        Our Fleet of Electric Vehicles Available
      </h1>
      <p className="text-gray-600 text-center mb-12">
        Search and filter our extensive fleet to find the car that suits your
        journey.
      </p>

      {/* Search and Filter Bar */}
      <div className="bg-gray-100 p-6 rounded-xl shadow-lg mb-12 flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by brand, model, or plate number..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Brand Dropdown */}
        <div className="relative w-full md:w-48">
          <FaCar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            className="w-full pl-12 pr-10 py-3 rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-2 focus:ring-black cursor-pointer bg-white"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            {allBrands.map((brand, index) => (
              <option key={index} value={brand}>
                {brand}
              </option>
            ))}
          </select>
          <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* ✅ Station Dropdown */}
        <div className="relative w-full md:w-64">
          <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            className="w-full pl-12 pr-10 py-3 rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-2 focus:ring-black cursor-pointer bg-white"
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
          >
            {allStations.map((station, index) => (
              <option
                key={index}
                value={typeof station === "string" ? station : station._id}
              >
                {typeof station === "string" ? "All Stations" : station.name}
              </option>
            ))}
          </select>
          <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Status Dropdown */}
        <div className="relative w-full md:w-48">
          <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            className="w-full pl-12 pr-10 py-3 rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-2 focus:ring-black cursor-pointer bg-white"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statusOptions.map((status, index) => (
              <option key={index} value={status}>
                {status === "All"
                  ? "All Status"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Vehicle Grid */}
      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredVehicles.map((car) => (
            <VehiclesCard
              key={car._id}
              car={car}
              station={
                typeof car.station === "string"
                  ? stationMap[car.station]
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 text-xl py-10">
          No vehicles found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default Vehicles;
