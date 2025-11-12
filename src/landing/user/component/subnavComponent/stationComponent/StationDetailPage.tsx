import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MdLocationOn,
  MdArrowBack,
  MdPhone,
  MdEmail,
  MdAccessTime,
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

  useEffect(() => {
    const fetchStation = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getStationById(id);
        setStation(data);
      } catch (err) {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <p className="text-red-500 text-xl mb-4">
          {error || "Station not found"}
        </p>
        <button
          onClick={() => navigate("/stations")}
          className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
        >
          Back to Stations
        </button>
      </div>
    );
  }

  const imageUrl = station.imgStation?.url || "/placeholder-station.png";

  return (
    <div className="min-h-screen mt-20 bg-gray-50">
      {/* Header with Back Button */}
      {/* <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <MdArrowBack className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero Section */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image */}
              <div className="relative h-96 md:h-auto">
                <img
                  src={imageUrl}
                  alt={station.name}
                  className="w-full h-full object-cover"
                />
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <div
                    className={`px-4 py-2 rounded-full font-semibold ${
                      station.isActive
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {station.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-8">
                <div className="mb-6">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {station.name}
                  </h1>
                  {station.code && (
                    <p className="text-gray-500 text-lg">
                      Station Code:{" "}
                      <span className="font-semibold">{station.code}</span>
                    </p>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-start gap-3 mb-6">
                  <MdLocationOn className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-gray-700 font-medium">Location</p>
                    <p className="text-gray-600">{station.location.address}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Lat: {station.location.lat.toFixed(6)}, Lng:{" "}
                      {station.location.lng.toFixed(6)}
                    </p>
                  </div>
                </div>

                {/* Note */}
                {station.note && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-gray-700 font-medium mb-2">Note</p>
                    <p className="text-gray-600">{station.note}</p>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps?q=${station.location.lat},${station.location.lng}`,
                        "_blank"
                      )
                    }
                    className="flex-1 px-6 py-3 bg-gray-900 text-white font-medium rounded hover:bg-gray-800 transition-colors"
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
                    className="flex-1 px-6 py-3 border-2 border-gray-900 text-gray-900 font-medium rounded hover:bg-gray-900 hover:text-white transition-colors"
                  >
                    Book Vehicle
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <MdPhone className="w-6 h-6 text-blue-500" />
                <h3 className="text-xl font-semibold text-gray-900">Contact</h3>
              </div>
              <p className="text-gray-600 mb-2">Phone: +84 123 456 789</p>
              <p className="text-gray-600 mb-2">
                Email: {station.code?.toLowerCase()}@zami.com
              </p>
            </div>

            {/* Operating Hours Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <MdAccessTime className="w-6 h-6 text-green-500" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Operating Hours
                </h3>
              </div>
              <p className="text-gray-600 mb-2">
                Monday - Friday: 8:00 AM - 8:00 PM
              </p>
              <p className="text-gray-600 mb-2">
                Saturday - Sunday: 9:00 AM - 6:00 PM
              </p>
            </div>

            {/* Services Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <MdEmail className="w-6 h-6 text-purple-500" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Services
                </h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li>• Vehicle Rental</li>
                <li>• Maintenance & Service</li>
                <li>• 24/7 Support</li>
              </ul>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-8">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Station Location
              </h2>
            </div>
            <div className="h-96 bg-gray-200 relative">
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
            </div>
          </div>

          {/* Metadata */}
          {(station.createdAt || station.updatedAt) && (
            <div className="bg-white rounded-lg shadow p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Station Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                {station.createdAt && (
                  <p>
                    <span className="font-medium">Created:</span>{" "}
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
        </motion.div>
      </div>
    </div>
  );
};

export default StationDetailPage;
