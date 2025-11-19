import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ThreeDots } from "react-loader-spinner";
import { useAuthRequired } from "../../../../../hooks/useAuthRequired";
import { useRoleBasedNavigation } from "../../../../../hooks/useRoleBasedNavigation";
import {
  getVehicleById,
  getSimilarVehicles,
  type Vehicle,
} from "../../../../../service/apiAdmin/apiVehicles/API";
import profileApi from "../../../../../service/apiUser/profile/API";
import {
  FaCar,
  FaArrowLeft,
  FaStar,
  FaUsers,
  FaBolt,
  FaTachometerAlt,
  FaPalette,
  FaGasPump,
  FaCogs,
  FaBatteryFull,
  FaRoad,
  FaCheckCircle,
} from "react-icons/fa";
import KYCRequiredModal from "./vehiclesDetailComponent/KYCRequiredModal";
import VehiclesCard from "./VehiclesCard";
import ImageCarousel from "./vehiclesDetailComponent/ImageCarousel";
import type { JSX } from "react/jsx-runtime";

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
  const [kycCheckComplete, setKycCheckComplete] = useState(false);

  // Check KYC status when authenticated
  useEffect(() => {
    const checkKYCStatus = async (): Promise<void> => {
      if (isAuthenticated) {
        try {
          const response = await profileApi.getCurrentUser();
          if (response.success && response.data) {
            const verified = response.data.kyc?.verified || false;
            setIsKYCVerified(verified);
            setKycCheckComplete(true);
          }
        } catch (err) {
          console.error("Failed to check KYC status:", err);
          setIsKYCVerified(false);
          setKycCheckComplete(true);
        }
      } else {
        setKycCheckComplete(true);
      }
    };

    checkKYCStatus();
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchVehicle = async (): Promise<void> => {
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

  // Fetch similar vehicles using API
  useEffect(() => {
    const fetchSimilarVehicles = async (): Promise<void> => {
      if (!vehicle || !id) return;

      try {
        const similar = await getSimilarVehicles(id, 4);
        setSimilarVehicles(similar);
      } catch (err) {
        console.error("Failed to fetch similar vehicles:", err);
      }
    };

    fetchSimilarVehicles();
  }, [vehicle, id]);

  // Handle booking with KYC check
  const handleBooking = (): void => {
    if (!vehicle || !kycCheckComplete) return;

    requireAuth(
      () => {
        if (!isKYCVerified) {
          setShowKYCModal(true);
          return;
        }

        if (navigationPaths.booking) {
          navigate(navigationPaths.booking(vehicle._id));
        }
      },
      {
        message: `Please login to book ${vehicle.brand} ${vehicle.model}`,
      }
    );
  };

  // Render star rating
  const renderStarRating = (rating: number, count: number): JSX.Element => {
    const stars = Array(5)
      .fill(0)
      .map((_, i) => {
        const filled = i < Math.round(rating);
        return (
          <FaStar
            key={i}
            className={`inline-block ${
              filled ? "text-yellow-400" : "text-gray-300"
            }`}
            size={20}
          />
        );
      });

    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-1">{stars}</div>
        <span className="text-gray-600 text-sm">
          {rating.toFixed(1)} ({count} {count === 1 ? "review" : "reviews"})
        </span>
      </div>
    );
  };

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

  // Prepare images for carousels
  const exteriorPhotos = vehicle.defaultPhotos?.exterior || [];
  const interiorPhotos = vehicle.defaultPhotos?.interior || [];
  const allPhotos = [...exteriorPhotos, ...interiorPhotos];
  const heroImage = typeof allPhotos[0] === "object" ? allPhotos[0]?.url : null;

  // Feature images for carousel (exterior + interior)
  const featureImages = [...exteriorPhotos, ...interiorPhotos]
    .map((photo) => (typeof photo === "object" ? photo.url : null))
    .filter((url): url is string => url !== null);

  return (
    <div className="min-h-screen bg-white">
      <div className="h-[88px] w-full bg-gradient-to-b from-gray-900/50 to-white"></div>

      {/* Hero Section with Image and Booking Button */}
      <div className="relative h-[750px] bg-gray-200">
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

        {/* Booking Button - Right Side */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2">
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onClick={handleBooking}
            disabled={vehicle.status !== "available"}
            className={`px-10 py-5 rounded-2xl text-xl font-bold transition-all ${
              vehicle.status === "available"
                ? "bg-black text-white hover:bg-gray-800 shadow-2xl hover:shadow-3xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {vehicle.status === "available"
              ? `Booking - ${vehicle.pricePerHour.toLocaleString()}đ/hour`
              : "Unavailable"}
          </motion.button>
        </div>

        {/* Title - Top Center */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
              {vehicle.brand} {vehicle.model}
            </h1>
            <div className="flex items-center gap-4 text-sm text-white/90 justify-center">
              <span className="font-medium">Automatic</span>
              <span className="w-1 h-1 bg-white/70 rounded-full"></span>
              <span className="font-medium">Model Year {vehicle.year}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Rating Section - Below Hero */}
      {vehicle.ratingAvg !== undefined && vehicle.ratingCount !== undefined && (
        <div className="bg-white border-b border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-center">
              {renderStarRating(vehicle.ratingAvg, vehicle.ratingCount)}
            </div>
          </div>
        </div>
      )}

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

        {/* Primary Features - Black Background with Bullets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8 mb-20"
        >
          <div className="bg-black rounded-2xl p-8">
            <h3 className="text-3xl font-bold text-white mb-6 uppercase tracking-wide">
              Primary Features
            </h3>
            <div className="space-y-4">
              <p className="text-white text-lg flex items-start gap-3">
                <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                <span>LED headlights</span>
              </p>
              <p className="text-white text-lg flex items-start gap-3">
                <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                <span>Push-button start</span>
              </p>
              <p className="text-white text-lg flex items-start gap-3">
                <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                <span>Cruise control</span>
              </p>
              <p className="text-white text-lg flex items-start gap-3">
                <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                <span>Lane departure warning</span>
              </p>
              <p className="text-white text-lg flex items-start gap-3">
                <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                <span>Front and rear parking sensors</span>
              </p>
              <p className="text-white text-lg flex items-start gap-3">
                <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                <span>Wireless device charging</span>
              </p>
            </div>
          </div>

          <div className="bg-black rounded-2xl p-8">
            <h3 className="text-3xl font-bold text-white mb-6 uppercase tracking-wide">
              Additional Features
            </h3>
            <div className="space-y-4">
              <p className="text-white text-lg flex items-start gap-3">
                <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                <span>Keyless access</span>
              </p>
              <p className="text-white text-lg flex items-start gap-3">
                <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                <span>Power moonroof</span>
              </p>
              <p className="text-white text-lg flex items-start gap-3">
                <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                <span>Heated front seats</span>
              </p>
              <p className="text-white text-lg flex items-start gap-3">
                <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                <span>Heated steering wheel</span>
              </p>
              <p className="text-white text-lg flex items-start gap-3">
                <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                <span>Premium sound system</span>
              </p>
              <p className="text-white text-lg flex items-start gap-3">
                <FaCheckCircle className="text-white mt-1 flex-shrink-0" />
                <span>Navigation system</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Feature Images Carousel */}
        {featureImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Exterior & Interior Gallery
            </h2>
            <ImageCarousel
              images={featureImages}
              altText={`${vehicle.brand} ${vehicle.model} Gallery`}
            />
          </motion.div>
        )}

        {/* Technical Specifications - With Border and Icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 border-2 border-gray-200 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-12">
            All technical specifications
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
            <div className="flex items-start gap-3">
              <FaUsers className="text-gray-700 text-2xl mt-1" />
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">
                  4-5 Seats
                </h4>
                <p className="text-sm text-gray-500">Number of seats</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaBolt className="text-gray-700 text-2xl mt-1" />
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">
                  Electric Motor
                </h4>
                <p className="text-sm text-gray-500">Engine</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaTachometerAlt className="text-gray-700 text-2xl mt-1" />
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">
                  {vehicle.mileage.toLocaleString()} km
                </h4>
                <p className="text-sm text-gray-500">Mileage</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaPalette className="text-gray-700 text-2xl mt-1" />
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">
                  {vehicle.color}
                </h4>
                <p className="text-sm text-gray-500">Exterior color</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaGasPump className="text-gray-700 text-2xl mt-1" />
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">
                  Electric
                </h4>
                <p className="text-sm text-gray-500">Fuel Type</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaCogs className="text-gray-700 text-2xl mt-1" />
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">
                  Automatic
                </h4>
                <p className="text-sm text-gray-500">Transmission</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaBatteryFull className="text-gray-700 text-2xl mt-1" />
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">
                  {vehicle.batteryCapacity}%
                </h4>
                <p className="text-sm text-gray-500">Battery</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaRoad className="text-gray-700 text-2xl mt-1" />
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">AWD</h4>
                <p className="text-sm text-gray-500">Drivetrain</p>
              </div>
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

      {/* KYC Required Modal */}
      <KYCRequiredModal
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        vehicleName={`${vehicle.brand} ${vehicle.model}`}
      />
    </div>
  );
};

export default VehiclesDetail;
