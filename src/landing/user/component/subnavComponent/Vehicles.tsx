import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import VehiclesCard from "./vehiclesComponent/VehiclesCard";
import { carData } from "../../../../data/carData";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaUsers,
  FaChevronDown,
} from "react-icons/fa";

// Định nghĩa kiểu dữ liệu cho một chiếc xe
interface Car {
  id: number;
  name: string;
  price: number;
  transmission: string;
  seats: number;
  range: string;
  image: string;
  location: string;
  station: string; // Thêm station vào interface
  type: string;
}

const Vehicles: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // Initialize state from URL params
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedStation, setSelectedStation] = useState("All");
  const [selectedSeats, setSelectedSeats] = useState("All");

  // Set initial search term from URL params
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search');
    if (urlSearchTerm) {
      setSearchTerm(decodeURIComponent(urlSearchTerm));
    }
  }, [searchParams]);

  // Sử dụng useMemo để tối ưu hóa, chỉ tính toán lại khi carData thay đổi
  const allLocations = useMemo(() => {
    return ["All", ...new Set(carData.map((car) => car.location))];
  }, []);

  const stationsByLocation = useMemo(() => {
    const stations = carData
      .filter(
        (car) => selectedLocation === "All" || car.location === selectedLocation
      )
      .map((car) => car.station);
    return ["All", ...new Set(stations)];
  }, [selectedLocation]);

  const filterCars = () => {
    return carData.filter((car) => {
      // Enhanced search logic with better precision
      let matchesSearchTerm = true;
      if (searchTerm.trim()) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const carName = car.name.toLowerCase();
        const carBrand = car.name.split(' ')[0].toLowerCase();
        
        // 1. Exact full match (highest priority)
        if (carName === lowerSearchTerm) {
          matchesSearchTerm = true;
        }
        // 2. Contains full search term (high priority)  
        else if (carName.includes(lowerSearchTerm)) {
          matchesSearchTerm = true;
        }
        // 3. Brand only match (e.g., "vinfast" matches all VinFast cars)
        else if (lowerSearchTerm === carBrand) {
          matchesSearchTerm = true;
        }
        // 4. Partial brand match (e.g., "vin" matches "vinfast")
        else if (carBrand.includes(lowerSearchTerm) && lowerSearchTerm.length >= 3) {
          matchesSearchTerm = true;
        }
        // 5. Smart word matching (more strict)
        else {
          const searchWords = lowerSearchTerm.split(' ').filter(word => word.length >= 2);
          const carWords = carName.split(' ').filter(word => word.length >= 2);
          
          // All search words must match at least one car word
          matchesSearchTerm = searchWords.length > 0 && searchWords.every(searchWord => 
            carWords.some(carWord => 
              carWord.startsWith(searchWord) || 
              (searchWord.length >= 3 && carWord.includes(searchWord))
            )
          );
        }
      }

      // Location filter
      const matchesLocation =
        selectedLocation === "All" || car.location === selectedLocation;

      // Lọc theo trạm đỗ xe (chỉ áp dụng nếu có trạm được chọn)
      const matchesStation =
        selectedStation === "All" || car.station === selectedStation;

      // Lọc theo số chỗ ngồi
      const matchesSeats =
        selectedSeats === "All" ||
        (selectedSeats === "4-5" && car.seats >= 4 && car.seats <= 5) ||
        (selectedSeats === "6-7" && car.seats >= 6 && car.seats <= 7);

      return (
        matchesSearchTerm && matchesLocation && matchesStation && matchesSeats
      );
    });
  };

  const filteredVehicles = filterCars();

  return (
    <div className="container mx-auto px-4 py-15">
      <h1 className="text-4xl font-bold text-center mb-4">
        Our Fleet of Electric Vehicles Available
      </h1>
      <p className="text-gray-600 text-center mb-12">
        Search and filter our extensive fleet to find the car that suits your
        journey.
      </p>

      {/* Search and Filter Bar */}
      <div className="bg-gray-100 p-6 rounded-xl shadow-lg mb-12 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by car name..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Location Dropdown */}
        <div className="relative w-full md:w-auto">
          <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            className="w-full pl-12 pr-10 py-3 rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setSelectedStation("All"); // Reset station khi thay đổi location
            }}
          >
            {allLocations.map((loc, index) => (
              <option key={index} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Station Dropdown */}
        {selectedLocation !== "All" && (
          <div className="relative w-full md:w-auto transition-opacity duration-300">
            <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              className="w-full pl-12 pr-10 py-3 rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
            >
              {stationsByLocation.map((station, index) => (
                <option key={index} value={station}>
                  {station}
                </option>
              ))}
            </select>
            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        )}

        {/* Seats Dropdown */}
        <div className="relative w-full md:w-auto">
          <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            className="w-full pl-12 pr-10 py-3 rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
            value={selectedSeats}
            onChange={(e) => setSelectedSeats(e.target.value)}
          >
            <option value="All">All Seats</option>
            <option value="4-5">4-5 Seats</option>
            <option value="6-7">6-7 Seats</option>
          </select>
          <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Vehicle Grid */}
      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredVehicles.map((car: Car) => (
            <VehiclesCard key={car.id} car={car} />
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
