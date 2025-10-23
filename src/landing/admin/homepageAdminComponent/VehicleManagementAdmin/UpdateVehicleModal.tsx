import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdClose,
  MdDirectionsCar,
  MdCode,
  MdBusiness,
  MdModelTraining,
  MdCalendarToday,
  MdColorLens,
  MdSpeed,
  MdAttachMoney,
  MdLocationOn,
  MdEdit,
} from "react-icons/md";
import { updateVehicle } from "../../../../service/apiAdmin/apiVehicles/API";
import type { Vehicle, UpdateVehicleData } from "../../../../service/apiAdmin/apiVehicles/API";
import UploadCarPhotos from "./UploadCarPhotos";


interface UpdateVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  vehicle: Vehicle | null;
}

const UpdateVehicleModal: React.FC<UpdateVehicleModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
  vehicle,
}) => {
  const [formData, setFormData] = useState<UpdateVehicleData>({
    plateNumber: "",
    vin: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    batteryCapacity: 0,
    mileage: 0,
    pricePerDay: 0,
    pricePerHour: 0,
    status: "available",
    station: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [photos, setPhotos] = useState<{ exterior: any[]; interior: any[] }>({
    exterior: [],
    interior: []
  });

  // Populate form when vehicle changes
  useEffect(() => {
    if (vehicle) {
      console.log("Pre-filling form with vehicle data:", vehicle);
      setFormData({
        plateNumber: vehicle.plateNumber || "",
        vin: vehicle.vin || "",
        brand: vehicle.brand || "",
        model: vehicle.model || "",
        year: vehicle.year || new Date().getFullYear(),
        color: vehicle.color || "",
        batteryCapacity: vehicle.batteryCapacity || 0,
        mileage: vehicle.mileage || 0,
        pricePerDay: vehicle.pricePerDay || 0,
        pricePerHour: vehicle.pricePerHour || 0,
        status: vehicle.status || "available",
        station: vehicle.station || "",
      });
      
      // Pre-fill photos from vehicle data
      if (vehicle.defaultPhotos) {
        const existingPhotos = {
          exterior: vehicle.defaultPhotos.exterior.map((url, index) => ({
            id: `existing-exterior-${index}`,
            file: null as any, // We don't have the original file
            preview: url,
            type: "exterior" as const
          })),
          interior: vehicle.defaultPhotos.interior.map((url, index) => ({
            id: `existing-interior-${index}`,
            file: null as any, // We don't have the original file
            preview: url,
            type: "interior" as const
          }))
        };
        console.log("Pre-filling photos:", existingPhotos);
        setPhotos(existingPhotos);
      }
    }
  }, [vehicle]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.plateNumber?.trim()) {
      newErrors.plateNumber = "Plate number is required";
    } else if (formData.plateNumber.trim().length < 4) {
      newErrors.plateNumber = "Plate number must be at least 4 characters";
    }

    if (!formData.vin?.trim()) {
      newErrors.vin = "VIN is required";
    } else if (formData.vin.trim().length < 10) {
      newErrors.vin = "VIN must be at least 10 characters";
    }

    if (!formData.brand?.trim()) {
      newErrors.brand = "Brand is required";
    }

    if (!formData.model?.trim()) {
      newErrors.model = "Model is required";
    }

    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = "Year must be between 1900 and " + (new Date().getFullYear() + 1);
    }

    if (!formData.color?.trim()) {
      newErrors.color = "Color is required";
    }

    if (!formData.batteryCapacity || formData.batteryCapacity <= 0) {
      newErrors.batteryCapacity = "Battery capacity must be greater than 0";
    }

    if (formData.mileage && formData.mileage < 0) {
      newErrors.mileage = "Mileage cannot be negative";
    }

    if (!formData.pricePerDay || formData.pricePerDay <= 0) {
      newErrors.pricePerDay = "Price per day must be greater than 0";
    }

    if (!formData.pricePerHour || formData.pricePerHour <= 0) {
      newErrors.pricePerHour = "Price per hour must be greater than 0";
    }

    if (!formData.station?.trim()) {
      newErrors.station = "Station is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm() || !vehicle) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Upload photos when backend endpoint is ready
      let updatedPhotos = { exterior: [] as string[], interior: [] as string[] };
      
      // Get existing photos (from vehicle.defaultPhotos)
      if (vehicle.defaultPhotos) {
        updatedPhotos.exterior = [...(vehicle.defaultPhotos.exterior || [])];
        updatedPhotos.interior = [...(vehicle.defaultPhotos.interior || [])];
      }
      
      console.log("Photos will be uploaded when backend endpoint is ready:", {
        existing: { exterior: updatedPhotos.exterior.length, interior: updatedPhotos.interior.length },
        new: { exterior: photos.exterior.filter(p => p.file).length, interior: photos.interior.filter(p => p.file).length }
      });

      await updateVehicle(vehicle._id, {
        plateNumber: formData.plateNumber?.trim() || "",
        vin: formData.vin?.trim() || "",
        brand: formData.brand?.trim() || "",
        model: formData.model?.trim() || "",
        year: formData.year || new Date().getFullYear(),
        color: formData.color?.trim() || "",
        batteryCapacity: formData.batteryCapacity || 0,
        mileage: formData.mileage || 0,
        pricePerDay: formData.pricePerDay || 0,
        pricePerHour: formData.pricePerHour || 0,
        status: formData.status || "available",
        station: formData.station?.trim() || "",
        defaultPhotos: updatedPhotos,
      });

      // Success - Show popup first, then close modal
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        handleClose();
        onUpdated();
      }, 2000);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "An error occurred while updating the vehicle"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        plateNumber: "",
        vin: "",
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        color: "",
        batteryCapacity: 0,
        mileage: 0,
        pricePerDay: 0,
        pricePerHour: 0,
        status: "available",
        station: "",
      });
      setErrors({});
      setSubmitError("");
      onClose();
    }
  };

  if (!vehicle) return null;

  return (
    <>
      {createPortal(
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
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white sticky top-0 z-10">
                <div className="flex items-center space-x-2.5">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                    <MdEdit className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Update Vehicle
                    </h2>
                    <p className="text-xs text-gray-500">
                      Edit vehicle information below
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
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {submitError && (
                  <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl">
                    <p className="text-xs text-red-600">{submitError}</p>
                  </div>
                )}

                {/* Row 1: Plate Number & VIN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Plate Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MdDirectionsCar className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={formData.plateNumber || ""}
                        onChange={(e) => {
                          setFormData({ ...formData, plateNumber: e.target.value });
                          if (errors.plateNumber) setErrors({ ...errors, plateNumber: "" });
                        }}
                        className={`w-full pl-10 pr-3 py-2 text-sm border ${
                          errors.plateNumber
                            ? "border-red-300 bg-red-50/30"
                            : "border-gray-200 bg-gray-50/50"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                        placeholder="Enter plate number"
                        disabled={loading}
                      />
                    </div>
                    {errors.plateNumber && (
                      <p className="mt-1 text-xs text-red-500">{errors.plateNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      VIN <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MdCode className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={formData.vin || ""}
                        onChange={(e) => {
                          setFormData({ ...formData, vin: e.target.value.toUpperCase() });
                          if (errors.vin) setErrors({ ...errors, vin: "" });
                        }}
                        className={`w-full pl-10 pr-3 py-2 text-sm border font-mono uppercase ${
                          errors.vin
                            ? "border-red-300 bg-red-50/30"
                            : "border-gray-200 bg-gray-50/50"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                        placeholder="Enter VIN"
                        disabled={loading}
                      />
                    </div>
                    {errors.vin && (
                      <p className="mt-1 text-xs text-red-500">{errors.vin}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Brand & Model */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Brand <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MdBusiness className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={formData.brand || ""}
                        onChange={(e) => {
                          setFormData({ ...formData, brand: e.target.value });
                          if (errors.brand) setErrors({ ...errors, brand: "" });
                        }}
                        className={`w-full pl-10 pr-3 py-2 text-sm border ${
                          errors.brand
                            ? "border-red-300 bg-red-50/30"
                            : "border-gray-200 bg-gray-50/50"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                        placeholder="Enter brand"
                        disabled={loading}
                      />
                    </div>
                    {errors.brand && (
                      <p className="mt-1 text-xs text-red-500">{errors.brand}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Model <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MdModelTraining className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={formData.model || ""}
                        onChange={(e) => {
                          setFormData({ ...formData, model: e.target.value });
                          if (errors.model) setErrors({ ...errors, model: "" });
                        }}
                        className={`w-full pl-10 pr-3 py-2 text-sm border ${
                          errors.model
                            ? "border-red-300 bg-red-50/30"
                            : "border-gray-200 bg-gray-50/50"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                        placeholder="Enter model"
                        disabled={loading}
                      />
                    </div>
                    {errors.model && (
                      <p className="mt-1 text-xs text-red-500">{errors.model}</p>
                    )}
                  </div>
                </div>

                {/* Row 3: Year & Color */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MdCalendarToday className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        value={formData.year || new Date().getFullYear()}
                        onChange={(e) => {
                          setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() });
                          if (errors.year) setErrors({ ...errors, year: "" });
                        }}
                        className={`w-full pl-10 pr-3 py-2 text-sm border ${
                          errors.year
                            ? "border-red-300 bg-red-50/30"
                            : "border-gray-200 bg-gray-50/50"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                        placeholder="Enter year"
                        disabled={loading}
                      />
                    </div>
                    {errors.year && (
                      <p className="mt-1 text-xs text-red-500">{errors.year}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Color <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MdColorLens className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={formData.color || ""}
                        onChange={(e) => {
                          setFormData({ ...formData, color: e.target.value });
                          if (errors.color) setErrors({ ...errors, color: "" });
                        }}
                        className={`w-full pl-10 pr-3 py-2 text-sm border ${
                          errors.color
                            ? "border-red-300 bg-red-50/30"
                            : "border-gray-200 bg-gray-50/50"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                        placeholder="Enter color"
                        disabled={loading}
                      />
                    </div>
                    {errors.color && (
                      <p className="mt-1 text-xs text-red-500">{errors.color}</p>
                    )}
                  </div>
                </div>

                {/* Row 4: Battery Capacity & Mileage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Battery Capacity <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={formData.batteryCapacity === 0 ? '' : formData.batteryCapacity || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          setFormData({ ...formData, batteryCapacity: value });
                          if (errors.batteryCapacity) setErrors({ ...errors, batteryCapacity: "" });
                        }}
                        className={`w-full pl-4 pr-3 py-2 text-sm border ${
                          errors.batteryCapacity
                            ? "border-red-300 bg-red-50/30"
                            : "border-gray-200 bg-gray-50/50"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                        placeholder="Enter battery capacity"
                        disabled={loading}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="flex items-center space-x-2">
                          {/* iPhone-style battery icon */}
                          <div className="relative w-8 h-4 bg-gray-200 rounded-sm border border-gray-300">
                            <div 
                              className={`absolute top-0.5 left-0.5 h-3 rounded-sm transition-all duration-300 ${
                                (formData.batteryCapacity || 0) > 50 
                                  ? 'bg-gradient-to-r from-green-400 to-green-500'
                                  : (formData.batteryCapacity || 0) > 20
                                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                                  : 'bg-gradient-to-r from-red-400 to-red-500'
                              }`}
                              style={{ 
                                width: `${Math.min(100, Math.max(0, (formData.batteryCapacity || 0) / 100 * 100))}%` 
                              }}
                            />
                            <div className="absolute -right-0.5 top-1 w-0.5 h-2 bg-gray-300 rounded-r-sm"></div>
                          </div>
                          <span className="text-xs font-medium text-gray-600">
                            {formData.batteryCapacity || 0} kWh
                          </span>
                        </div>
                      </div>
                    </div>
                    {errors.batteryCapacity && (
                      <p className="mt-1 text-xs text-red-500">{errors.batteryCapacity}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mileage (km)
                    </label>
                    <div className="relative">
                      <MdSpeed className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        value={formData.mileage || 0}
                        onChange={(e) => {
                          setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 });
                          if (errors.mileage) setErrors({ ...errors, mileage: "" });
                        }}
                        className={`w-full pl-10 pr-3 py-2 text-sm border ${
                          errors.mileage
                            ? "border-red-300 bg-red-50/30"
                            : "border-gray-200 bg-gray-50/50"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                        placeholder="Enter mileage"
                        disabled={loading}
                      />
                    </div>
                    {errors.mileage && (
                      <p className="mt-1 text-xs text-red-500">{errors.mileage}</p>
                    )}
                  </div>
                </div>

                {/* Row 5: Price Per Day & Price Per Hour */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Price Per Day (VND) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MdAttachMoney className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        value={formData.pricePerDay || 0}
                        onChange={(e) => {
                          setFormData({ ...formData, pricePerDay: parseInt(e.target.value) || 0 });
                          if (errors.pricePerDay) setErrors({ ...errors, pricePerDay: "" });
                        }}
                        className={`w-full pl-10 pr-3 py-2 text-sm border ${
                          errors.pricePerDay
                            ? "border-red-300 bg-red-50/30"
                            : "border-gray-200 bg-gray-50/50"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                        placeholder="Enter price per day"
                        disabled={loading}
                      />
                    </div>
                    {errors.pricePerDay && (
                      <p className="mt-1 text-xs text-red-500">{errors.pricePerDay}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Price Per Hour (VND) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MdAttachMoney className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        value={formData.pricePerHour || 0}
                        onChange={(e) => {
                          setFormData({ ...formData, pricePerHour: parseInt(e.target.value) || 0 });
                          if (errors.pricePerHour) setErrors({ ...errors, pricePerHour: "" });
                        }}
                        className={`w-full pl-10 pr-3 py-2 text-sm border ${
                          errors.pricePerHour
                            ? "border-red-300 bg-red-50/30"
                            : "border-gray-200 bg-gray-50/50"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                        placeholder="Enter price per hour"
                        disabled={loading}
                      />
                    </div>
                    {errors.pricePerHour && (
                      <p className="mt-1 text-xs text-red-500">{errors.pricePerHour}</p>
                    )}
                  </div>
                </div>

                {/* Row 6: Status & Station */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) => {
                          setFormData({ ...formData, status: e.target.value });
                          if (errors.status) setErrors({ ...errors, status: "" });
                        }}
                        className={`w-full px-4 py-3 text-sm border ${
                          errors.status
                            ? "border-red-300 bg-red-50/30"
                            : "border-gray-200 bg-white hover:border-blue-300 focus:border-blue-500"
                        } rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 ease-in-out shadow-sm hover:shadow-md focus:shadow-lg`}
                        disabled={loading}
                        style={{
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 1rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.25em 1.25em',
                          paddingRight: '3rem'
                        }}
                      >
                        <option value="available" className="py-2">Available</option>
                        <option value="reserved" className="py-2">Reserved</option>
                        <option value="rented" className="py-2">Rented</option>
                        <option value="maintenance" className="py-2">Maintenance</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
                      </div>
                    </div>
                    {errors.status && (
                      <p className="mt-1 text-xs text-red-500">{errors.status}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Station ID <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MdLocationOn className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={formData.station || ""}
                        onChange={(e) => {
                          setFormData({ ...formData, station: e.target.value });
                          if (errors.station) setErrors({ ...errors, station: "" });
                        }}
                        className={`w-full pl-10 pr-3 py-2 text-sm border font-mono ${
                          errors.station
                            ? "border-red-300 bg-red-50/30"
                            : "border-gray-200 bg-gray-50/50"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                        placeholder="Enter station ID"
                        disabled={loading}
                      />
                    </div>
                    {errors.station && (
                      <p className="mt-1 text-xs text-red-500">{errors.station}</p>
                    )}
                  </div>
                </div>

                {/* Upload Car Photos */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-base font-semibold text-gray-800 mb-4">
                    Vehicle Photos
                  </h3>
                  <UploadCarPhotos
                    onPhotosChange={setPhotos}
                    initialPhotos={photos}
                    disabled={loading}
                  />
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
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Vehicle</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Success Modal */}
          <AnimatePresence>
            {showSuccessModal && (
              <motion.div
                className="fixed inset-0 bg-black/40 z-[10000] flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm mx-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Update Vehicle Successfully!
                    </h3>
                    <p className="text-sm text-gray-600">
                      Vehicle has been updated successfully.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>,
    document.body
      )}
    </>
  );
};

export default UpdateVehicleModal;

