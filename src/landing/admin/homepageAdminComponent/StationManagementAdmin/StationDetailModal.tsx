import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdClose,
  MdLocationOn,
  MdCode,
  MdPlace,
  MdMyLocation,
  MdLanguage,
  MdNotes,
  MdImage,
  MdCalendarToday,
  MdUpdate,
  MdLocationCity,
} from "react-icons/md";
import type { Station } from "../../../../service/apiAdmin/apiStation/API";

interface StationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: Station | null;
}

const StationDetailModal: React.FC<StationDetailModalProps> = ({
  isOpen,
  onClose,
  station,
}) => {
  if (!station) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const isValid = !isNaN(date.getTime());
    if (!isValid) return "-";
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Get image URL from imgStation object
  const imageUrl = station.imgStation?.url;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
            >
              {/* ✅ Sticky Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-black via-gray-900 to-gray-800 rounded-t-3xl">
                <div className="flex items-center space-x-2.5">
                  <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-md">
                    <MdLocationOn className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Station Details
                    </h2>
                    <p className="text-xs text-gray-300">
                      Complete information about the station
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full p-1.5 transition-all duration-200"
                >
                  <MdClose className="w-5 h-5" />
                </button>
              </div>

              {/* ✅ Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Cover Image */}
                {imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
                    <img
                      src={imageUrl}
                      alt={station.name}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector(".fallback-icon")) {
                          parent.innerHTML = `
                            <div class="fallback-icon w-full h-64 bg-gray-100 flex flex-col items-center justify-center">
                              <svg class="w-20 h-20 text-gray-400 mb-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                              </svg>
                              <p class="text-gray-500 text-sm">Failed to load image</p>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50">
                    <div className="w-full h-64 flex flex-col items-center justify-center">
                      <MdImage className="w-20 h-20 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">No cover image</p>
                    </div>
                  </div>
                )}

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Station Name */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MdLocationOn className="w-5 h-5 text-blue-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        Station Name
                      </span>
                    </div>
                    <p className="text-base font-semibold text-gray-900">
                      {station.name}
                    </p>
                  </div>

                  {/* Station Code */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MdCode className="w-5 h-5 text-purple-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        Station Code
                      </span>
                    </div>
                    <p className="text-base font-mono font-semibold text-gray-900">
                      {station.code || "-"}
                    </p>
                  </div>

                  {/* ✅ Province Field */}
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4 md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <MdLocationCity className="w-5 h-5 text-green-600" />
                      <span className="text-xs font-medium text-gray-600 uppercase">
                        Province / City
                      </span>
                    </div>
                    <p className="text-base font-semibold text-gray-900">
                      {station.province || "-"}
                    </p>
                  </div>
                </div>

                {/* Location Information */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <MdPlace className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700 uppercase">
                      Location Information
                    </span>
                  </div>

                  {/* Address */}
                  <div className="mb-4">
                    <span className="text-xs font-medium text-gray-600 uppercase block mb-1">
                      Address
                    </span>
                    <p className="text-sm text-gray-900">
                      {station.location?.address || "-"}
                    </p>
                  </div>

                  {/* Coordinates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MdMyLocation className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-medium text-gray-600">
                          Latitude
                        </span>
                      </div>
                      <p className="text-sm font-mono text-gray-900">
                        {station.location?.lat || 0}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MdLanguage className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-medium text-gray-600">
                          Longitude
                        </span>
                      </div>
                      <p className="text-sm font-mono text-gray-900">
                        {station.location?.lng || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Note */}
                {station.note && (
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MdNotes className="w-5 h-5 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-800 uppercase">
                        Note
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{station.note}</p>
                  </div>
                )}

                {/* Status and Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <span className="text-xs font-medium text-gray-500 uppercase block mb-2">
                      Status
                    </span>
                    {station.isActive ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* Created Date */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MdCalendarToday className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        Created
                      </span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {formatDate(station.createdAt)}
                    </p>
                  </div>

                  {/* Updated Date */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MdUpdate className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        Updated
                      </span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {formatDate(station.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* ✅ Sticky Footer */}
              <div className="sticky bottom-0 z-10 flex items-center justify-end p-4 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default StationDetailModal;
