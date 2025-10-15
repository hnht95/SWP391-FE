import React, { useState } from "react";
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
import { createStation } from "../../../../service/apiAdmin/apiStation/API";
import type { CreateStationPayload } from "./types";

interface AddStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const AddStationModal: React.FC<AddStationModalProps> = ({
  isOpen,
  onClose,
  onCreated,
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Station name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Station name must be at least 2 characters";
    }

    if (!formData.code.trim()) {
      newErrors.code = "Station code is required";
    } else if (formData.code.trim().length < 2) {
      newErrors.code = "Station code must be at least 2 characters";
    }

    if (!formData.location.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.location.address.trim().length < 5) {
      newErrors.address = "Address must be at least 5 characters";
    }

    if (!formData.location.latitude || formData.location.latitude === 0) {
      newErrors.latitude = "Latitude is required";
    } else if (
      formData.location.latitude < -90 ||
      formData.location.latitude > 90
    ) {
      newErrors.latitude = "Latitude must be between -90 and 90";
    }

    if (!formData.location.longitude || formData.location.longitude === 0) {
      newErrors.longitude = "Longitude is required";
    } else if (
      formData.location.longitude < -180 ||
      formData.location.longitude > 180
    ) {
      newErrors.longitude = "Longitude must be between -180 and 180";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await createStation({
        name: formData.name.trim(),

        address: formData.location.address.trim(),
        lat: formData.location.latitude,
        lng: formData.location.longitude,
        note: formData.note?.trim(),
      });

      // Success
      handleClose();
      onCreated();
    } catch (error) {
      console.error("Error creating station:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "An error occurred while creating the station"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: "",
        code: "",
        location: { address: "", latitude: 0, longitude: 0 },
        note: "",
        isActive: true,
      });
      setErrors({});
      setSubmitError("");
      onClose();
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white sticky top-0 z-10">
                <div className="flex items-center space-x-2.5">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                    <MdLocationOn className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Add New Station
                    </h2>
                    <p className="text-xs text-gray-500">
                      Fill in the station information below
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all duration-200 disabled:opacity-50"
                >
                  <MdClose className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-5 space-y-3">
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
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: "" });
                      }}
                      className={`w-full pl-10 pr-3 py-2 text-sm border ${
                        errors.name
                          ? "border-red-300 bg-red-50/30"
                          : "border-gray-200 bg-gray-50/50"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                      placeholder="Enter station name"
                      disabled={loading}
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
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        });
                        if (errors.code) setErrors({ ...errors, code: "" });
                      }}
                      className={`w-full pl-10 pr-3 py-2 text-sm border font-mono uppercase ${
                        errors.code
                          ? "border-red-300 bg-red-50/30"
                          : "border-gray-200 bg-gray-50/50"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                      placeholder="e.g. ST01"
                      disabled={loading}
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
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          location: {
                            ...formData.location,
                            address: e.target.value,
                          },
                        });
                        if (errors.address)
                          setErrors({ ...errors, address: "" });
                      }}
                      className={`w-full pl-10 pr-3 py-2 text-sm border ${
                        errors.address
                          ? "border-red-300 bg-red-50/30"
                          : "border-gray-200 bg-gray-50/50"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                      placeholder="Enter full address"
                      disabled={loading}
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
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            location: {
                              ...formData.location,
                              latitude: parseFloat(e.target.value) || 0,
                            },
                          });
                          if (errors.latitude)
                            setErrors({ ...errors, latitude: "" });
                        }}
                        className={`w-full pl-10 pr-3 py-2 text-sm border ${
                          errors.latitude
                            ? "border-red-300 bg-red-50/30"
                            : "border-gray-200 bg-gray-50/50"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                        placeholder="10.762622"
                        disabled={loading}
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
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            location: {
                              ...formData.location,
                              longitude: parseFloat(e.target.value) || 0,
                            },
                          });
                          if (errors.longitude)
                            setErrors({ ...errors, longitude: "" });
                        }}
                        className={`w-full pl-10 pr-3 py-2 text-sm border ${
                          errors.longitude
                            ? "border-red-300 bg-red-50/30"
                            : "border-gray-200 bg-gray-50/50"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                        placeholder="106.660172"
                        disabled={loading}
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
                    Note{" "}
                    <span className="text-gray-400 text-xs">(optional)</span>
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
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4 mt-1 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="px-5 py-2 border border-gray-200 text-gray-600 bg-white rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-sm disabled:opacity-50"
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
                        <span>Adding...</span>
                      </>
                    ) : (
                      <span>Add Station</span>
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

export default AddStationModal;
