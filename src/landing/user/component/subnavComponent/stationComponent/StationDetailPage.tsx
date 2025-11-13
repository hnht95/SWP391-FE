import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MdLocationOn,
  MdPhone,
  MdAccessTime,
  MdArrowBack,
} from "react-icons/md";

import {
  getStationById,
  type Station,
} from "../../../../../service/apiAdmin/apiStation/API";

const StationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set body background color
  useEffect(() => {
    document.body.style.backgroundColor = "#f9fafb"; // gray-50

    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  useEffect(() => {
    const fetchStation = async () => {
      if (!id) {
        setError("No station ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await getStationById(id);
        console.log("Fetched station:", data);
        setStation(data);
      } catch (err) {
        console.error("Failed to fetch station:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load station details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStation();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900"></div>
          <p className="mt-4 text-gray-600 text-lg">
            Loading station details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-red-600 text-xl font-bold mb-2">
            {error || "Station Not Found"}
          </h2>
          <p className="text-red-500 mb-4">
            The station you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition inline-flex items-center gap-2"
          >
            <MdArrowBack />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = station.imgStation?.url || "/placeholder-station.png";

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Overlay */}
      <div className="h-[88px] w-full bg-gradient-to-b from-gray-900/50 to-white"></div>
      <div className="relative h-[600px] bg-gray-900">
        <img
          src={imageUrl}
          alt={station.name}
          className="w-full h-full object-cover"
        />

        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>

        {/* Content Overlay */}
        <div className="absolute top-0 flex items-center justify-center w-full h-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="p-8 max-w-2xl flex flex-col items-center justify-center text-center"
          >
            {/* Status Badge */}
            <div
              className={`px-6 py-2 rounded-full font-semibold mb-6 ${
                station.isActive
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {station.isActive ? "Active Station" : "Inactive"}
            </div>

            {/* Title */}
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
              {station.name}
            </h1>

            {/* Station Code */}
            {station.code && (
              <p className="text-xl text-gray-200 mb-6 drop-shadow">
                Station Code:{" "}
                <span className="font-semibold">{station.code}</span>
              </p>
            )}

            {/* Location Preview */}
            <div className="flex items-center gap-2 text-white mb-8 drop-shadow">
              <MdLocationOn className="w-6 h-6 text-green-400" />
              <p className="text-lg">{station.location.address}</p>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps?q=${station.location.lat},${station.location.lng}`,
                    "_blank"
                  )
                }
                className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 shadow-xl hover:shadow-2xl transition-all"
              >
                View on Map
              </button>
              <button
                onClick={() =>
                  navigate("/vehicles", {
                    state: {
                      stationId: station._id,
                      stationName: station.name,
                    },
                  })
                }
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-gray-900 transition-all"
              >
                Browse Vehicles
              </button>
            </div>
          </motion.div>
        </div>

        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 w-12 h-12 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-200 hover:border-gray-900 z-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MdArrowBack className="w-6 h-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
        </motion.button>
      </div>

      {/* Quick Info Badges */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
              <h4 className="font-bold text-gray-900 text-lg mb-1">
                {station.isActive ? "Active" : "Inactive"}
              </h4>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Station Status
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
              <h4 className="font-bold text-gray-900 text-lg mb-1">
                {station.code || "N/A"}
              </h4>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Station Code
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
              <h4 className="font-bold text-gray-900 text-lg mb-1">24/7</h4>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Availability
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
              <h4 className="font-bold text-gray-900 text-lg mb-1">Premium</h4>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Service Level
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
            {station.name} - Overview and Services
          </h2>
          <p className="text-gray-600 text-base leading-relaxed mb-4">
            Located at {station.location.address}, this station serves as a key
            hub in our EV rental network. With state-of-the-art facilities and
            convenient access, we ensure a seamless experience for all our
            customers.
          </p>
          {station.note && (
            <p className="text-gray-600 text-base leading-relaxed">
              {station.note}
            </p>
          )}
        </motion.div>

        {/* Services and Amenities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-16 mb-20"
        >
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-6 uppercase tracking-wide">
              Station Services
            </h3>
            <div className="space-y-3">
              <p className="text-gray-700 text-sm">• Vehicle Rental & Return</p>
              <p className="text-gray-700 text-sm">• EV Charging Stations</p>
              <p className="text-gray-700 text-sm">• Maintenance & Service</p>
              <p className="text-gray-700 text-sm">• 24/7 Customer Support</p>
              <p className="text-gray-700 text-sm">• Contactless Check-in</p>
              <p className="text-gray-700 text-sm">• Vehicle Inspection</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-6 uppercase tracking-wide">
              Amenities & Facilities
            </h3>
            <div className="space-y-3">
              <p className="text-gray-700 text-sm">• Secure Parking</p>
              <p className="text-gray-700 text-sm">• Waiting Lounge</p>
              <p className="text-gray-700 text-sm">• Free WiFi</p>
              <p className="text-gray-700 text-sm">• Restrooms</p>
              <p className="text-gray-700 text-sm">• Refreshments Available</p>
              <p className="text-gray-700 text-sm">• Wheelchair Accessible</p>
            </div>
          </div>
        </motion.div>

        {/* Location Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-12">
            Location Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Contact Info */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <MdPhone className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">Contact</h3>
              </div>
              <p className="text-gray-600 text-sm mb-2">
                Phone: +84 123 456 789
              </p>
              <p className="text-gray-600 text-sm">
                Email: {station.code?.toLowerCase()}@zami.com
              </p>
            </div>

            {/* Operating Hours */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <MdAccessTime className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Operating Hours
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-2">
                Monday - Friday: 8:00 AM - 8:00 PM
              </p>
              <p className="text-gray-600 text-sm">
                Saturday - Sunday: 9:00 AM - 6:00 PM
              </p>
            </div>

            {/* Coordinates */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <MdLocationOn className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Coordinates
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-2">
                Lat: {station.location.lat.toFixed(6)}
              </p>
              <p className="text-gray-600 text-sm">
                Lng: {station.location.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative h-[500px] rounded-3xl overflow-hidden mb-20"
        >
          <iframe
            src={`https://www.google.com/maps?q=${station.location.lat},${station.location.lng}&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map of ${station.name}`}
          ></iframe>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to rent a vehicle from this station?
          </h2>
          <button
            onClick={() =>
              navigate("/vehicles", {
                state: {
                  stationId: station._id,
                  stationName: station.name,
                },
              })
            }
            className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors underline"
          >
            Browse available vehicles
          </button>
        </motion.div>

        {/* Metadata */}
        {(station.createdAt || station.updatedAt) && (
          <div className="mt-20 pt-8 border-t border-gray-200">
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              {station.createdAt && (
                <p>
                  <span className="font-medium">Station Created:</span>{" "}
                  {new Date(station.createdAt).toLocaleString()}
                </p>
              )}
              {station.updatedAt && (
                <p>
                  <span className="font-medium">Last Updated:</span>{" "}
                  {new Date(station.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StationDetailPage;
