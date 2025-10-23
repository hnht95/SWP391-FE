import React, { useState, useEffect } from "react";
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
} from "react-icons/md";
// import { updateStationAPI } from "../../../../service/apiAdmin/StationAPI/UpdateStationAPI";
import type { Station, CreateStationPayload } from "./types.d";
import { updateStation } from "../../../../service/apiAdmin/apiStation/API";

interface EditStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  station: Station | null;
}

const EditStationModal: React.FC<EditStationModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
  station,
}) => {
  const [formData, setFormData] = useState<CreateStationPayload>({
    name: "",
    code: "",
    location: {
      address: "",
      latitude: 0,
      longitude: 0,
    },
    note: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Load station data when modal opens
  useEffect(() => {
    if (station && isOpen) {
      console.log("Loading station data:", station);
      setFormData({
        name: station.name,
        code: station.code,
        location: {
          address: station.location.address,
          latitude: station.location.latitude,
          longitude: station.location.longitude,
        },
        note: station.note || "",
        isActive: station.isActive,
      });
      console.log("Form data set:", {
        name: station.name,
        address: station.location.address,
        isActive: station.isActive,
      });
    }
  }, [station, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Station name is required";
    }

    if (!formData.code.trim()) {
      newErrors.code = "Station code is required";
    }

    if (!formData.location.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.location.latitude || formData.location.latitude === 0) {
      newErrors.latitude = "Latitude is required";
    }

    if (!formData.location.longitude || formData.location.longitude === 0) {
      newErrors.longitude = "Longitude is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!station) return;

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Transform data to match API format
      const apiData = {
        name: formData.name,
        code: formData.code,
        address: formData.location.address,
        lat: formData.location.latitude,
        lng: formData.location.longitude,
        note: formData.note,
        isActive: formData.isActive,
      };

      console.log("Submitting station update:", apiData);
      console.log("Address:", apiData.address);
      console.log("IsActive:", apiData.isActive);

      await updateStation(station.id, apiData);

      // Success
      onUpdated();
      handleClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setErrors({});
      setSubmitError("");
      onClose();
    }
  };

  if (!station) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Full screen */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal Container - Centered */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
                <div className="flex items-center space-x-2.5">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                    <MdLocationOn className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Edit Station
                    </h2>
                    <p className="text-xs text-gray-500">
                      Update station information
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all duration-200"
                >
                  <MdClose className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-5 space-y-3">
                {/* Submit Error */}
                {submitError && (
                  <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl">
                    <p className="text-xs text-red-600">{submitError}</p>
                  </div>
                )}

                {/* Station Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Station Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MdLocationOn className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={`w-full pl-10 pr-3 py-2 text-sm border ${
                        errors.name
                          ? "border-red-300 bg-red-50/30"
                          : "border-gray-200 bg-gray-50/50"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                      placeholder="Enter station name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Station Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Station Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MdCode className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      className={`w-full pl-10 pr-3 py-2 text-sm border font-mono ${
                        errors.code
                          ? "border-red-300 bg-red-50/30"
                          : "border-gray-200 bg-gray-50/50"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                      placeholder="e.g. STA001"
                    />
                  </div>
                  {errors.code && (
                    <p className="mt-1 text-xs text-red-500">{errors.code}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MdPlace className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.location.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: {
                            ...formData.location,
                            address: e.target.value,
                          },
                        })
                      }
                      className={`w-full pl-10 pr-3 py-2 text-sm border ${
                        errors.address
                          ? "border-red-300 bg-red-50/30"
                          : "border-gray-200 bg-gray-50/50"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                      placeholder="Enter full address"
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* Latitude & Longitude */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Latitude <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MdMyLocation className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        step="any"
                        value={formData.location.latitude || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            location: {
                              ...formData.location,
                              latitude: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className={`w-full pl-10 pr-3 py-2 text-sm border ${
                          errors.latitude
                            ? "border-red-300 bg-red-50/30"
                            : "border-gray-200 bg-gray-50/50"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                        placeholder="10.762622"
                      />
                    </div>
                    {errors.latitude && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.latitude}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Longitude <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MdLanguage className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        step="any"
                        value={formData.location.longitude || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            location: {
                              ...formData.location,
                              longitude: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className={`w-full pl-10 pr-3 py-2 text-sm border ${
                          errors.longitude
                            ? "border-red-300 bg-red-50/30"
                            : "border-gray-200 bg-gray-50/50"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                        placeholder="106.660172"
                      />
                    </div>
                    {errors.longitude && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.longitude}
                      </p>
                    )}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Note
                  </label>
                  <div className="relative">
                    <MdNotes className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                    <textarea
                      value={formData.note}
                      onChange={(e) =>
                        setFormData({ ...formData, note: e.target.value })
                      }
                      rows={2}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
                      placeholder="Additional notes about the station (optional)"
                    />
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3 py-1">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      Station is active
                    </span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4 mt-1 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="px-5 py-2 border border-gray-200 text-gray-600 bg-white rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md text-sm flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Station</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default EditStationModal;
