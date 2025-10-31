import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdClose,
  MdLocationOn,
  MdMyLocation,
  MdLanguage,
  MdNotes,
  MdImage,
  MdSearch,
} from "react-icons/md";
import {
  updateStation,
  buildUpdateStationFormData,
  type Station,
} from "../../../../service/apiAdmin/apiStation/API";

// ✅ Form data interface
interface FormData {
  name: string;
  code: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  note: string;
  isActive: boolean;
}

// ✅ Address suggestion từ OpenStreetMap
interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

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
  const [formData, setFormData] = useState<FormData>({
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

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [existingImageUrl, setExistingImageUrl] = useState<string>("");
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ✅ Address autocomplete states
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);

  // Load station data when modal opens
  useEffect(() => {
    if (station && isOpen) {
      console.log("Loading station data:", station);
      setFormData({
        name: station.name,
        code: station.code || "",
        location: {
          address: station.location.address,
          latitude: station.location.lat,
          longitude: station.location.lng,
        },
        note: station.note || "",
        isActive: station.isActive,
      });

      // Load existing image from imgStation.url
      if (station.imgStation?.url) {
        setExistingImageUrl(station.imgStation.url);
        setImagePreview("");
        setCoverImage(null);
        setRemoveExistingImage(false);
      } else {
        setExistingImageUrl("");
        setImagePreview("");
        setCoverImage(null);
        setRemoveExistingImage(false);
      }
    }
  }, [station, isOpen]);

  // ✅ Search address from OpenStreetMap
  const searchAddress = async (query: string) => {
    if (query.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }

    setSearchingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          `format=json&` +
          `q=${encodeURIComponent(query)}&` +
          `countrycodes=vn&` +
          `limit=5&` +
          `addressdetails=1`,
        {
          headers: {
            "User-Agent": "StationManagementApp/1.0",
          },
        }
      );

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      console.log("🔍 Address search results:", data);
      setAddressSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("❌ Address search error:", error);
      setAddressSuggestions([]);
    } finally {
      setSearchingAddress(false);
    }
  };

  // ✅ Handle address input change with debounce
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setFormData({
      ...formData,
      location: {
        ...formData.location,
        address: value,
      },
    });

    if (errors.address) {
      setErrors({ ...errors, address: "" });
    }

    // Clear previous timer
    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    // Set new timer for debounce
    const timer = setTimeout(() => {
      searchAddress(value);
    }, 500);

    setSearchTimer(timer);
  };

  // ✅ Handle address selection
  const handleSelectAddress = (suggestion: AddressSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);

    console.log("✅ Address selected:", {
      address: suggestion.display_name,
      lat,
      lng,
    });

    setFormData({
      ...formData,
      location: {
        address: suggestion.display_name,
        latitude: lat,
        longitude: lng,
      },
    });

    setShowSuggestions(false);
    setAddressSuggestions([]);

    // Clear errors
    setErrors({
      ...errors,
      address: "",
      latitude: "",
      longitude: "",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors({
          ...errors,
          coverImage: "Please select a valid image file",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          coverImage: "Image size must be less than 5MB",
        });
        return;
      }

      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file));
      setRemoveExistingImage(false);
      setErrors({ ...errors, coverImage: "" });
    }
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    setImagePreview("");
    setExistingImageUrl("");
    setRemoveExistingImage(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Station name is required";
    }

    if (!formData.location.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.location.latitude || formData.location.latitude === 0) {
      newErrors.latitude = "Latitude is required (search address to auto-fill)";
    }

    if (!formData.location.longitude || formData.location.longitude === 0) {
      newErrors.longitude =
        "Longitude is required (search address to auto-fill)";
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
      const formDataToSend = buildUpdateStationFormData(
        {
          name: formData.name,
          code: formData.code,
          address: formData.location.address,
          lat: formData.location.latitude,
          lng: formData.location.longitude,
          note: formData.note,
          isActive: formData.isActive,
        },
        coverImage || undefined,
        removeExistingImage
      );

      console.log("📤 Updating station...");
      await updateStation(station._id, formDataToSend);

      onUpdated();
      handleClose();
    } catch (error) {
      console.error("❌ Error updating station:", error);
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
      setCoverImage(null);
      setImagePreview("");
      setExistingImageUrl("");
      setRemoveExistingImage(false);
      setAddressSuggestions([]);
      setShowSuggestions(false);
      if (searchTimer) clearTimeout(searchTimer);
      onClose();
    }
  };

  if (!station) return null;

  const displayImage = imagePreview || existingImageUrl;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
            >
              {/* ✅ Sticky Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-black via-gray-900 to-gray-800 rounded-t-3xl">
                <div className="flex items-center space-x-2.5">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                    <MdLocationOn className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Edit Station
                    </h2>
                    <p className="text-xs text-gray-200">
                      Update station information
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full p-1.5 transition-all duration-200 disabled:opacity-50"
                >
                  <MdClose className="w-5 h-5" />
                </button>
              </div>

              {/* ✅ Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto">
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

                  {/* Address with Autocomplete */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MdSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                      <input
                        type="text"
                        value={formData.location.address}
                        onChange={handleAddressChange}
                        onFocus={() => {
                          if (addressSuggestions.length > 0) {
                            setShowSuggestions(true);
                          }
                        }}
                        className={`w-full pl-10 pr-10 py-2 text-sm border ${
                          errors.address
                            ? "border-red-300 bg-red-50/30"
                            : "border-gray-200 bg-gray-50/50"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                        placeholder="Type to search address..."
                        disabled={loading}
                      />
                      {searchingAddress && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && addressSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {addressSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.place_id}
                            type="button"
                            onClick={() => handleSelectAddress(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-2"
                          >
                            <MdLocationOn className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">
                              {suggestion.display_name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {errors.address && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.address}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-blue-500">
                      💡 Type to search - coordinates will auto-fill
                    </p>
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
                              : formData.location.latitude !== 0
                              ? "border-green-300 bg-green-50/30 font-semibold text-green-700"
                              : "border-gray-200 bg-gray-50/50"
                          } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                          placeholder="Auto-filled"
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
                              : formData.location.longitude !== 0
                              ? "border-green-300 bg-green-50/30 font-semibold text-green-700"
                              : "border-gray-200 bg-gray-50/50"
                          } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                          placeholder="Auto-filled"
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

                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Cover Image{" "}
                      <span className="text-gray-400 text-xs">(optional)</span>
                    </label>

                    {displayImage ? (
                      <div className="space-y-3">
                        <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                          <img
                            src={displayImage}
                            alt="Station cover"
                            className="w-full h-48 object-cover"
                          />
                          {imagePreview && (
                            <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg">
                              ✓ New image selected
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="file"
                            id="coverImage"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={loading}
                          />

                          <label
                            htmlFor="coverImage"
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all ${
                              loading
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            <MdImage className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Replace Image
                            </span>
                          </label>

                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
                          >
                            <MdClose className="w-4 h-4" />
                            <span className="text-sm font-medium">Remove</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          id="coverImage"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={loading}
                        />
                        <label
                          htmlFor="coverImage"
                          className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 bg-gray-50/50 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200"
                        >
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                              <MdImage className="w-6 h-6 text-gray-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 mb-1">
                              Click to upload cover image
                            </span>
                            <span className="text-xs text-gray-500">
                              PNG, JPG up to 5MB
                            </span>
                          </div>
                        </label>
                      </div>
                    )}

                    {errors.coverImage && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {errors.coverImage}
                      </p>
                    )}
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
                        placeholder="Additional notes (optional)"
                        disabled={loading}
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
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                        disabled={loading}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        Station is active
                      </span>
                    </label>
                  </div>
                </form>
              </div>

              {/* ✅ Sticky Footer */}
              <div className="sticky bottom-0 z-10 flex items-center justify-end space-x-3 px-5 py-4 border-t border-gray-100 bg-white rounded-b-3xl">
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
                  onClick={handleSubmit}
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
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default EditStationModal;
