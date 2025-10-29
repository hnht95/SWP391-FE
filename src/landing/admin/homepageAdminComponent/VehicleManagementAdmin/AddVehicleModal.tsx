import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdDirectionsCar } from "react-icons/md";
import { createVehicle, type CreateVehicleData } from "../../../../service/apiAdmin/apiVehicles/API";
import { getAllStations, type Station } from "../../../../service/apiAdmin/apiStation/API";
import UploadCarPhotos from "./UploadCarPhotos";


interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  batteryCapacity: number;
  mileage: number;
  pricePerDay: number;
  pricePerHour: number;
  status: "available" | "reserved" | "rented" | "maintenance";
  station: string;
}

const defaultForm: FormData = {
  plateNumber: "",
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
};

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState<FormData>(defaultForm);
  const [stations, setStations] = useState<Station[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<{ exterior: any[]; interior: any[] }>({
    exterior: [],
    interior: []
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setForm(defaultForm);
      setErrors({});
      fetchStations();
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const fetchStations = async () => {
    try {
      console.log("Fetching stations for AddVehicleModal...");
      const stationsData = await getAllStations(1, 1000);
      console.log("Fetched stations in AddVehicleModal:", stationsData);
      console.log("Stations count:", stationsData.length);
      console.log("Stations type:", typeof stationsData);
      console.log("Is stations array?", Array.isArray(stationsData));
      
      if (Array.isArray(stationsData) && stationsData.length > 0) {
        setStations(stationsData);
        console.log("Stations set successfully");
      } else {
        console.error("Stations data is not an array or empty:", stationsData);
        // Fallback: Set some mock stations for testing
        const mockStations = [
          { 
            _id: "1", 
            name: "Station 1", 
            isActive: true,
            location: { address: "Address 1", lat: 0, lng: 0 }
          },
          { 
            _id: "2", 
            name: "Station 2", 
            isActive: true,
            location: { address: "Address 2", lat: 0, lng: 0 }
          },
          { 
            _id: "3", 
            name: "Station 3", 
            isActive: true,
            location: { address: "Address 3", lat: 0, lng: 0 }
          }
        ];
        console.log("Using mock stations:", mockStations);
        setStations(mockStations);
      }
    } catch (error) {
      console.error("Failed to fetch stations in AddVehicleModal:", error);
      console.error("Error details:", error);
      // Fallback: Set some mock stations for testing
      const mockStations = [
        { 
          _id: "1", 
          name: "Station 1", 
          isActive: true,
          location: { address: "Address 1", lat: 0, lng: 0 }
        },
        { 
          _id: "2", 
          name: "Station 2", 
          isActive: true,
          location: { address: "Address 2", lat: 0, lng: 0 }
        },
        { 
          _id: "3", 
          name: "Station 3", 
          isActive: true,
          location: { address: "Address 3", lat: 0, lng: 0 }
        }
      ];
      console.log("Using mock stations due to error:", mockStations);
      setStations(mockStations);
    }
  };

  const handleChange = (field: keyof FormData, value: string | number) => {
    // Special handling for station field - don't allow empty value
    if (field === "station" && value === "") {
      return; // Don't update if trying to set empty station
    }
    
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.plateNumber.trim()) newErrors.plateNumber = "Plate number is required";
    if (!form.brand.trim()) newErrors.brand = "Brand is required";
    if (!form.model.trim()) newErrors.model = "Model is required";
    if (!form.color.trim()) newErrors.color = "Color is required";
    if (!form.station || form.station === "") newErrors.station = "Station is required";
    if (form.year < 1900 || form.year > new Date().getFullYear() + 1) {
      newErrors.year = "Invalid year";
    }
    if (form.batteryCapacity < 0) newErrors.batteryCapacity = "Invalid battery capacity";
    if (form.mileage < 0) newErrors.mileage = "Invalid mileage";
    if (form.pricePerDay < 0) newErrors.pricePerDay = "Invalid daily rate";
    if (form.pricePerHour < 0) newErrors.pricePerHour = "Invalid hourly rate";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Send files directly with vehicle creation
      const exteriorFiles = photos.exterior.map(p => p.file).filter(Boolean) as File[];
      const interiorFiles = photos.interior.map(p => p.file).filter(Boolean) as File[];
      
      console.log("📤 Creating vehicle with files:", {
        exterior: exteriorFiles.length,
        interior: interiorFiles.length
      });

      const vehicleData: CreateVehicleData = {
        plateNumber: form.plateNumber,
        brand: form.brand,
        model: form.model,
        year: form.year,
        color: form.color,
        batteryCapacity: form.batteryCapacity,
        mileage: form.mileage,
        pricePerDay: form.pricePerDay,
        pricePerHour: form.pricePerHour,
        status: form.status,
        station: form.station,
        exteriorFiles: exteriorFiles,
        interiorFiles: interiorFiles,
      };

      console.log("Creating vehicle with data:", vehicleData);
      await createVehicle(vehicleData);
      
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        onClose();
        onSuccess();
      }, 2000);
    } catch (error: any) {
      console.error("Error creating vehicle:", error);
      alert(error.message || "Failed to create vehicle");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl h-[90vh] overflow-y-auto pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-black via-gray-900 to-gray-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-11 h-11 bg-gradient-to-br from-black-700 to-black rounded-2xl flex items-center justify-center shadow-md">
                    <MdDirectionsCar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Add New Vehicle</h2>
                    <p className="text-xs text-gray-200">Enter vehicle details below</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all duration-200"
                >
                  <MdClose className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Information */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Plate Number *</label>
                    <input
                      type="text"
                      value={form.plateNumber}
                      onChange={(e) => handleChange("plateNumber", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.plateNumber ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., 51H-12345"
                    />
                    {errors.plateNumber && (
                      <p className="text-xs text-red-500 mt-1">{errors.plateNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Brand *</label>
                    <input
                      type="text"
                      value={form.brand}
                      onChange={(e) => handleChange("brand", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.brand ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., VinFast"
                    />
                    {errors.brand && (
                      <p className="text-xs text-red-500 mt-1">{errors.brand}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Model *</label>
                    <input
                      type="text"
                      value={form.model}
                      onChange={(e) => handleChange("model", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.model ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., VF8"
                    />
                    {errors.model && (
                      <p className="text-xs text-red-500 mt-1">{errors.model}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Year *</label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      value={form.year === 0 ? '' : form.year}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value) || new Date().getFullYear();
                        handleChange("year", value);
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.year ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Select year"
                      style={{ 
                        appearance: 'none',
                        MozAppearance: 'textfield'
                      }}
                    />
                    {errors.year && (
                      <p className="text-xs text-red-500 mt-1">{errors.year}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Color *</label>
                    <input
                      type="text"
                      value={form.color}
                      onChange={(e) => handleChange("color", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.color ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., White"
                    />
                    {errors.color && (
                      <p className="text-xs text-red-500 mt-1">{errors.color}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Battery Capacity (kWh)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={form.batteryCapacity === 0 ? '' : form.batteryCapacity}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          handleChange("batteryCapacity", value);
                        }}
                        className={`w-full pl-4 pr-20 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.batteryCapacity ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="e.g., 90"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="flex items-center space-x-2">
                          {/* iPhone-style battery icon */}
                          <div className="relative w-8 h-4 bg-gray-200 rounded-sm border border-gray-300">
                            <div 
                              className={`absolute top-0.5 left-0.5 h-3 rounded-sm transition-all duration-300 ${
                                (form.batteryCapacity || 0) > 50 
                                  ? 'bg-gradient-to-r from-green-400 to-green-500'
                                  : (form.batteryCapacity || 0) > 20
                                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                                  : 'bg-gradient-to-r from-red-400 to-red-500'
                              }`}
                              style={{ 
                                width: `${Math.min(100, Math.max(0, (form.batteryCapacity || 0) / 100 * 100))}%` 
                              }}
                            />
                            <div className="absolute -right-0.5 top-1 w-0.5 h-2 bg-gray-300 rounded-r-sm"></div>
                          </div>
                          <span className="text-xs font-medium text-gray-600">
                            {form.batteryCapacity || 0} kWh
                          </span>
                        </div>
                      </div>
                    </div>
                    {errors.batteryCapacity && (
                      <p className="text-xs text-red-500 mt-1">{errors.batteryCapacity}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Mileage (km)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.mileage === 0 ? '' : form.mileage}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value);
                        handleChange("mileage", value);
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.mileage ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., 0"
                    />
                    {errors.mileage && (
                      <p className="text-xs text-red-500 mt-1">{errors.mileage}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Price Per Day (VND)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.pricePerDay === 0 ? '' : form.pricePerDay}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value);
                        handleChange("pricePerDay", value);
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.pricePerDay ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., 1200000"
                    />
                    {errors.pricePerDay && (
                      <p className="text-xs text-red-500 mt-1">{errors.pricePerDay}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Price Per Hour (VND)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.pricePerHour === 0 ? '' : form.pricePerHour}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value);
                        handleChange("pricePerHour", value);
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.pricePerHour ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., 60000"
                    />
                    {errors.pricePerHour && (
                      <p className="text-xs text-red-500 mt-1">{errors.pricePerHour}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => handleChange("status", e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="rented">Rented</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Station *</label>
                    <select
                      value={form.station}
                      onChange={(e) => handleChange("station", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                        errors.station ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      <option value="" disabled>
                        Select Station
                      </option>
                      {stations.map((station) => (
                        <option key={station._id} value={station._id}>
                          {station.name}
                        </option>
                      ))}
                    </select>
                    {errors.station && (
                      <p className="text-xs text-red-500 mt-1">{errors.station}</p>
                    )}
                  </div>
                </div>

                {/* Vehicle Photos Section */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-base font-semibold text-gray-800 mb-4">
                    Vehicle Photos
                  </h3>
                  <UploadCarPhotos
                    onPhotosChange={setPhotos}
                    initialPhotos={photos}
                    disabled={submitting}
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 border border-gray-200 text-gray-600 bg-white rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-black text-white rounded-xl font-semibold text-sm shadow-md transition-all duration-100 hover:bg-white hover:text-black hover:shadow-lg"
                    >
                    {submitting ? "Adding..." : "Add Vehicle"}
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
                      Vehicle Created Successfully!
                    </h3>
                    <p className="text-sm text-gray-600">
                      Vehicle has been added to the system.
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
  );
};

export default AddVehicleModal;


