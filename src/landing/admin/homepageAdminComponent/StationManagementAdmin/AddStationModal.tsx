import React, { useState } from "react";
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
  buildCreateStationFormData,
  createStation,
} from "../../../../service/apiAdmin/apiStation/API";

interface FormData {
  name: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  note: string;
  isActive: boolean;
}

interface AddStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

const AddStationModal: React.FC<AddStationModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);

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

    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    const timer = setTimeout(() => {
      searchAddress(value);
    }, 500);

    setSearchTimer(timer);
  };

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
      console.log("📸 File selected:", {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        sizeBytes: file.size,
      });

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
      setErrors({ ...errors, coverImage: "" });
      console.log("✅ Image set successfully and ready to upload");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Station name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Station name must be at least 2 characters";
    }

    if (!formData.location.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.location.address.trim().length < 5) {
      newErrors.address = "Address must be at least 5 characters";
    }

    if (!formData.location.latitude || formData.location.latitude === 0) {
      newErrors.latitude = "Latitude is required (search address to auto-fill)";
    } else if (
      formData.location.latitude < -90 ||
      formData.location.latitude > 90
    ) {
      newErrors.latitude = "Latitude must be between -90 and 90";
    }

    if (!formData.location.longitude || formData.location.longitude === 0) {
      newErrors.longitude =
        "Longitude is required (search address to auto-fill)";
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
      console.warn("⚠️ Form validation failed:", errors);
      return;
    }

    setLoading(true);

    try {
      console.log("\n");
      console.log("═══════════════════════════════════════════════════════");
      console.log("📤 STARTING STATION CREATION");
      console.log("═══════════════════════════════════════════════════════");

      // Step 1: Log form data
      console.log("\n📋 Form Data:");

      console.log("  name:", formData.name);
      console.log("  location:");
      console.log("    address:", formData.location.address);
      console.log("    lat:", formData.location.latitude);
      console.log("    lng:", formData.location.longitude);
      console.log("  note:", formData.note || "");
      console.log("  isActive:", formData.isActive);

      // Step 2: Log image info
      console.log("\n📸 Cover Image:");
      if (coverImage) {
        console.log("  ✅ Image attached");
        console.log("    name:", coverImage.name);
        console.log("    type:", coverImage.type);
        console.log(
          "    size:",
          `${(coverImage.size / 1024).toFixed(2)} KB (${coverImage.size} bytes)`
        );
        console.log(
          "    lastModified:",
          new Date(coverImage.lastModified).toISOString()
        );
      } else {
        console.log("  ⚠️ No image attached");
      }

      // Step 3: Build FormData
      console.log("\n🔨 Building FormData...");
      const formDataToSend = buildCreateStationFormData(
        {
          name: formData.name,
          address: formData.location.address,
          lat: formData.location.latitude,
          lng: formData.location.longitude,
          note: formData.note,
        },
        coverImage || undefined
      );

      // Step 4: Log FormData contents
      console.log("\n📦 FormData Contents (will be sent to backend):");
      console.log("═══════════════════════════════════════════════════════");
      let hasImage = false;
      const formDataEntries: Record<string, string> = {};

      for (const [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          hasImage = true;
          const fileInfo = {
            name: value.name,
            type: value.type,
            size: value.size,
            sizeKB: `${(value.size / 1024).toFixed(2)} KB`,
            lastModified: new Date(value.lastModified).toISOString(),
          };
          console.log(`  ${key}: [File Object]`);
          console.log(`    - name: ${fileInfo.name}`);
          console.log(`    - type: ${fileInfo.type}`);
          console.log(
            `    - size: ${fileInfo.sizeKB} (${fileInfo.size} bytes)`
          );
          console.log(`    - lastModified: ${fileInfo.lastModified}`);
          formDataEntries[key] = `[File: ${fileInfo.name}]`;
        } else {
          console.log(`  ${key}: ${value}`);
          formDataEntries[key] = value as string;

          // Parse location JSON to show structure
          if (key === "location") {
            try {
              const locationObj = JSON.parse(value as string);
              console.log(`    ↳ Parsed location object:`);
              console.log(`      - address: ${locationObj.address}`);
              console.log(`      - lat: ${locationObj.lat}`);
              console.log(`      - lng: ${locationObj.lng}`);
            } catch {
              console.warn(`    ⚠️ Could not parse location JSON`);
            }
          }
        }
      }

      console.log("\n🔍 Complete FormData Summary:");
      console.log(JSON.stringify(formDataEntries, null, 2));
      console.log("═══════════════════════════════════════════════════════");

      if (!hasImage && coverImage) {
        console.warn("\n⚠️ WARNING: Image selected but not found in FormData!");
      }

      if (hasImage) {
        console.log("\n✅ Image file is attached to FormData as 'coverFile'");
      }

      // Step 5: Call API
      console.log("\n🚀 Sending POST request to backend...");
      console.log("  Endpoint: POST /api/stations");
      console.log("  Content-Type: multipart/form-data (auto-set by browser)");

      const response = await createStation(formDataToSend);

      // Step 6: Log response matching backend structure
      console.log("\n✅ SUCCESS - Station Created!");
      console.log("═══════════════════════════════════════════════════════");
      console.log("\n📥 Backend Response (Station Object):");
      console.log(JSON.stringify(response, null, 2));

      console.log("\n📊 Response Breakdown:");
      console.log("  _id:", response._id);
      console.log("  name:", response.name);
      console.log("  code:", response.code);

      console.log("  location:");
      console.log("    address:", response.location.address);
      console.log("    lat:", response.location.lat);
      console.log("    lng:", response.location.lng);

      console.log("  note:", response.note || "(empty)");
      console.log("  isActive:", response.isActive);

      if (response.imgStation) {
        console.log("  imgStation: ✅ Image uploaded successfully");
        console.log("    _id:", response.imgStation._id);
        console.log("    url:", response.imgStation.url);
        console.log("    publicId:", response.imgStation.publicId);
        console.log("    type:", response.imgStation.type);
        console.log("    provider:", response.imgStation.provider);
        console.log("    tags:", response.imgStation.tags);
        console.log("    uploadedBy:", response.imgStation.uploadedBy);
        console.log("    createdAt:", response.imgStation.createdAt);
        console.log("    updatedAt:", response.imgStation.updatedAt);
        console.log("    __v:", response.imgStation);
      } else {
        console.log(
          "  imgStation: ❌ No image (field not present in response)"
        );
      }

      console.log("  createdAt:", response.createdAt);
      console.log("  updatedAt:", response.updatedAt);
      console.log("  __v:", response.__v);

      console.log("\n🔍 Validation Checks:");
      console.log("  ✓ Has _id:", !!response._id);
      console.log("  ✓ Has name:", !!response.name);
      console.log("  ✓ Has code:", !!response.code);
      console.log("  ✓ Has location:", !!response.location);
      console.log("  ✓ Has location.address:", !!response.location?.address);
      console.log(
        "  ✓ Has location.lat:",
        response.location?.lat !== undefined
      );
      console.log(
        "  ✓ Has location.lng:",
        response.location?.lng !== undefined
      );
      console.log("  ✓ Has imgStation:", !!response.imgStation);
      if (coverImage) {
        console.log(
          coverImage && !response.imgStation
            ? "  ⚠️ WARNING: Image was sent but not in response!"
            : "  ✓ Image processed correctly"
        );
      }

      console.log("═══════════════════════════════════════════════════════\n");

      handleClose();
      onCreated();
    } catch (error) {
      console.error("\n❌ ERROR - Station Creation Failed!");
      console.error("═══════════════════════════════════════════════════════");
      console.error("Error Object:", error);

      if (error instanceof Error) {
        console.error("  message:", error.message);
        console.error("  name:", error.name);
        console.error("  stack:", error.stack);
      }

      console.error(
        "═══════════════════════════════════════════════════════\n"
      );

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
      console.log("🔄 Resetting form...");
      setFormData({
        name: "",
        location: { address: "", latitude: 0, longitude: 0 },
        note: "",
        isActive: true,
      });
      setCoverImage(null);
      setImagePreview("");
      setErrors({});
      setSubmitError("");
      setAddressSuggestions([]);
      setShowSuggestions(false);
      if (searchTimer) clearTimeout(searchTimer);
      onClose();
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
              <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-black via-gray-900 to-gray-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-md">
                    <MdLocationOn className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Add New Station
                    </h2>
                    <p className="text-xs text-gray-200">
                      Fill in the station information below
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
                      placeholder="Type to search address... (e.g. 227 Nguyễn Văn Cừ)"
                      disabled={loading}
                    />
                    {searchingAddress && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>

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
                    💡 Example: "227 Nguyễn Văn Cừ, Quận 5, TP.HCM" -
                    coordinates will auto-fill
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
                        placeholder="Auto-filled from address"
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
                        placeholder="Auto-filled from address"
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

                {/* Cover Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Cover Image{" "}
                    <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
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
                      className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed ${
                        errors.coverImage
                          ? "border-red-300 bg-red-50/30"
                          : "border-gray-300 bg-gray-50/50"
                      } rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200`}
                    >
                      <div className="flex flex-col items-center">
                        <MdImage className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          {coverImage
                            ? coverImage.name
                            : "Click to upload cover image"}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          PNG, JPG up to 5MB
                        </span>
                      </div>
                    </label>
                  </div>
                  {errors.coverImage && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.coverImage}
                    </p>
                  )}
                  {imagePreview && (
                    <div className="mt-3 relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-xl border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          console.log("🗑️ Removing image...");
                          setCoverImage(null);
                          setImagePreview("");
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-all shadow-lg"
                      >
                        <MdClose className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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
                    className="px-6 py-2 bg-gradient-to-r from-black to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-black hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md text-sm flex items-center gap-2"
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
