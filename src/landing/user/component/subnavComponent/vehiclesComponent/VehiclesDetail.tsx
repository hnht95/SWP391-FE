// VehiclesDetail.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthRequired } from "../../../../../hooks/useAuthRequired";
import { useRoleBasedNavigation } from "../../../../../hooks/useRoleBasedNavigation";
import {
  getVehicleById,
  type Vehicle,
} from "../../../../../service/apiAdmin/apiVehicles/API";
import profileApi from "../../../../../service/apiUser/profile/API";
import { FaCar, FaArrowLeft } from "react-icons/fa";
import KYCRequiredModal from "./vehiclesDetailComponent/KYCRequiredModal";
import VehiclesCard from "./VehiclesCard";

const VehiclesDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requireAuth, isAuthenticated } = useAuthRequired();
  const { getNavigationPaths } = useRoleBasedNavigation();
  const navigationPaths = getNavigationPaths();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [isKYCVerified, setIsKYCVerified] = useState<boolean>(false);
  const [similarVehicles, setSimilarVehicles] = useState<Vehicle[]>([]);

  // ✅ Check KYC status when authenticated
  useEffect(() => {
    const checkKYCStatus = async () => {
      if (isAuthenticated) {
        try {
          const response = await profileApi.getCurrentUser();
          if (response.success && response.data) {
            setIsKYCVerified(response.data.kyc?.verified || false);
          }
        } catch (err) {
          console.error("Failed to check KYC status:", err);
          setIsKYCVerified(false);
        }
      }
    };

    checkKYCStatus();
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) {
        setError("No vehicle ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await getVehicleById(id);
        console.log("Fetched vehicle:", data);
        setVehicle(data);
      } catch (err) {
        console.error("Failed to fetch vehicle:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load vehicle details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  // Fetch similar vehicles when vehicle is loaded
  useEffect(() => {
    const fetchSimilarVehicles = async () => {
      if (!vehicle) return;

      try {
        const { getVehiclesPaginatedWithFilters } = await import(
          "../../../../../service/apiAdmin/apiVehicles/API"
        );

        // Fetch vehicles with same brand, available status, exclude current vehicle
        const response = await getVehiclesPaginatedWithFilters(1, 4, {
          brand: vehicle.brand,
          status: "available",
        });

        // Filter out current vehicle and limit to 5
        const filtered = response.items
          .filter((v) => v._id !== vehicle._id)
          .slice(0, 5);

        setSimilarVehicles(filtered);
      } catch (err) {
        console.error("Failed to fetch similar vehicles:", err);
      }
    };

    fetchSimilarVehicles();
  }, [vehicle]);

  // ✅ Handle booking with KYC check
  const handleBooking = () => {
    if (!vehicle) return;

    requireAuth(
      () => {
        // Check KYC verification
        if (!isKYCVerified) {
          setShowKYCModal(true);
          return;
        }

        // Proceed to booking if KYC verified
        if (navigationPaths.booking) {
          navigate(navigationPaths.booking(vehicle._id));
        }
      },
      {
        message: `Please login to book ${vehicle.brand} ${vehicle.model}`,
      }
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
          <p className="mt-4 text-gray-600 text-lg">
            Loading vehicle details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-red-600 text-xl font-bold mb-2">
            {error || "Vehicle Not Found"}
          </h2>
          <p className="text-red-500 mb-4">
            The vehicle you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition inline-flex items-center gap-2"
          >
            <FaArrowLeft />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const exteriorPhotos = vehicle.defaultPhotos?.exterior || [];
  const interiorPhotos = vehicle.defaultPhotos?.interior || [];
  const allPhotos = [...exteriorPhotos, ...interiorPhotos];
  const heroImage = typeof allPhotos[0] === "object" ? allPhotos[0]?.url : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="h-[88px] w-full bg-gradient-to-b from-gray-900/50 to-white"></div>
      <div className="relative h-[calc(100%-88px)] bg-gray-900">
        {heroImage ? (
          <img
            src={heroImage}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-400 to-gray-500">
            <FaCar className="text-gray-600 text-9xl" />
          </div>
        )}
        <div className="absolute top-0 flex items-center justify-center w-full">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className=" p-8 max-w-sm flex flex-col items-center justify-between"
          >
            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
              {vehicle.brand} {vehicle.model}
            </h1>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
              <span className="font-medium">Automatic</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="font-medium">Model Year {vehicle.year}</span>
            </div>

            {/* Price and CTA */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBooking}
                disabled={vehicle.status !== "available"}
                className={`px-6 py-3 rounded-full cursor-pointer text-sm font-semibold transition-all ${
                  vehicle.status === "available"
                    ? "bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {vehicle.status === "available"
                  ? `Rent this Car ${vehicle.pricePerHour.toLocaleString()}đ`
                  : "Unavailable"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Specs Badges */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
              <h4 className="font-bold text-gray-900 text-lg mb-1">Electric</h4>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Body Type
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
              <h4 className="font-bold text-gray-900 text-lg mb-1">
                Automatic
              </h4>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Transmission
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
              <h4 className="font-bold text-gray-900 text-lg mb-1">Premium</h4>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Rental Class
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
              <h4 className="font-bold text-gray-900 text-lg mb-1">
                {vehicle.batteryCapacity}%
              </h4>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Battery
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-20"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {vehicle.brand} {vehicle.model} overview and introduction
          </h2>
          <p className="text-gray-600 text-base leading-relaxed mb-4">
            This {vehicle.brand} {vehicle.model} ({vehicle.year}) is a premium
            electric vehicle offering exceptional performance and comfort. With
            a battery capacity of {vehicle.batteryCapacity}% and low mileage of{" "}
            {vehicle.mileage.toLocaleString()} km, it's perfect for both city
            commutes and long road trips.
          </p>
          <p className="text-gray-600 text-base leading-relaxed">
            Experience the future of sustainable transportation with
            cutting-edge technology and elegant design. This vehicle combines
            power, efficiency, and luxury in one package.
          </p>
        </motion.div>

        {/* Primary Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-16 mb-20"
        >
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-6 uppercase tracking-wide">
              Primary Features
            </h3>
            <div className="space-y-3">
              <p className="text-gray-700 text-sm">LED headlights</p>
              <p className="text-gray-700 text-sm">Push-button start</p>
              <p className="text-gray-700 text-sm">Cruise control</p>
              <p className="text-gray-700 text-sm">Lane departure warning</p>
              <p className="text-gray-700 text-sm">
                Front and rear parking sensors
              </p>
              <p className="text-gray-700 text-sm">Wireless device charging</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-6 uppercase tracking-wide">
              Additional Features
            </h3>
            <div className="space-y-3">
              <p className="text-gray-700 text-sm">Keyless access</p>
              <p className="text-gray-700 text-sm">Power moonroof</p>
              <p className="text-gray-700 text-sm">Heated front seats</p>
              <p className="text-gray-700 text-sm">Heated steering wheel</p>
              <p className="text-gray-700 text-sm">Premium sound system</p>
              <p className="text-gray-700 text-sm">Navigation system</p>
            </div>
          </div>
        </motion.div>

        {/* Feature Images */}
        {exteriorPhotos[1] && typeof exteriorPhotos[1] === "object" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[500px] rounded-3xl overflow-hidden mb-12"
          >
            <img
              src={exteriorPhotos[1].url}
              alt="Exterior view"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-8 left-8">
              <p className="text-white text-sm font-medium drop-shadow-lg">
                Perfect attention to the every exterior details
              </p>
            </div>
          </motion.div>
        )}

        {interiorPhotos[0] && typeof interiorPhotos[0] === "object" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[500px] rounded-3xl overflow-hidden mb-20"
          >
            <img
              src={interiorPhotos[0].url}
              alt="Interior view"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-8 left-8">
              <p className="text-white text-sm font-medium drop-shadow-lg">
                Where every detail unveils a world of wonder
              </p>
            </div>
          </motion.div>
        )}

        {/* Technical Specifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-12">
            All technical specifications
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                4-5 Seats
              </h4>
              <p className="text-sm text-gray-500">Number of seats</p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                Electric Motor
              </h4>
              <p className="text-sm text-gray-500">Engine</p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                {vehicle.mileage.toLocaleString()} km
              </h4>
              <p className="text-sm text-gray-500">Consumption</p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                {vehicle.color}
              </h4>
              <p className="text-sm text-gray-500">Exterior and interior</p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">Electric</h4>
              <p className="text-sm text-gray-500">Fuel Type</p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                Automatic
              </h4>
              <p className="text-sm text-gray-500">Transmission</p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                {vehicle.batteryCapacity}%
              </h4>
              <p className="text-sm text-gray-500">Battery</p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">AWD</h4>
              <p className="text-sm text-gray-500">Drivetrain</p>
            </div>
          </div>

          {/* Warranty Info */}
          <div className="border-t border-gray-200 pt-8">
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Certified Pre-Owned Elite with less than 15,000 km; Certified
              Pre-Owned with less than {vehicle.mileage.toLocaleString()} km.
            </p>
            <p className="text-gray-600 text-sm">
              1 year/unlimited km warranty coverage included
            </p>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to book our car or a private service?
          </h2>
          <button
            onClick={() => navigate("/contactus")}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors underline"
          >
            Contact us to get started
          </button>
        </motion.div>
      </div>

      {/* Similar Cars Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-12">
            Explore similar cars
          </h2>
          {similarVehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {similarVehicles.map((car) => (
                <VehiclesCard key={car._id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              No similar vehicles available at the moment
            </div>
          )}
        </div>
      </div>

      {/* ✅ KYC Required Modal */}
      <KYCRequiredModal
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        vehicleName={`${vehicle.brand} ${vehicle.model}`}
      />
    </div>
  );
};

export default VehiclesDetail;
