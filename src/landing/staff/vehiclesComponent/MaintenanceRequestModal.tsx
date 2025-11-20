import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdClose,
  MdBuild,
  MdWarning,
  MdUpload,
  MdDelete,
} from "react-icons/md";
import api from "../../../service/Utils";

interface MaintenanceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  onSuccess: () => void;
}

type UrgencyLevel = "low" | "medium" | "high";

const MaintenanceRequestModal: React.FC<MaintenanceRequestModalProps> = ({
  isOpen,
  onClose,
  vehicleId,
  vehicleName,
  licensePlate,
  onSuccess,
}) => {
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<UrgencyLevel>("medium");
  const [evidencePhotos, setEvidencePhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Validate file size (max 5MB per file)
      const validFiles = files.filter((file) => {
        if (file.size > 5 * 1024 * 1024) {
          setError(`File "${file.name}" is larger than 5MB`);
          return false;
        }
        return true;
      });

      // Limit to 5 photos
      if (evidencePhotos.length + validFiles.length > 5) {
        setError("Maximum 5 photos allowed");
        return;
      }

      setEvidencePhotos([...evidencePhotos, ...validFiles]);
      setError(null);
    }
  };

  const removePhoto = (index: number) => {
    setEvidencePhotos(evidencePhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      setError("Please provide a description of the issue");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("description", description.trim());
      formData.append("urgency", urgency);

      // Append all photos
      evidencePhotos.forEach((photo) => {
        formData.append("evidencePhotos", photo);
      });

      // Use api instance from Utils.tsx which handles auth automatically
      const response = await api.post(
        `/vehicles/${vehicleId}/report-maintenance`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Check response
      if (response.data.success || response.data) {
        // Success
        onSuccess();
        onClose();

        // Reset form
        setDescription("");
        setUrgency("medium");
        setEvidencePhotos([]);
      } else {
        throw new Error("Failed to submit maintenance request");
      }
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while submitting the request";
      setError(errorMessage);
      console.error("Maintenance request error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyColor = (level: UrgencyLevel) => {
    switch (level) {
      case "low":
        return "from-green-200 to-green-50";
      case "medium":
        return "from-amber-200 to-amber-50";
      case "high":
        return "from-rose-200 to-rose-50";
    }
  };

  const getUrgencyTextColor = (level: UrgencyLevel) => {
    switch (level) {
      case "low":
        return "text-green-600 border-green-300 bg-green-50";
      case "medium":
        return "text-orange-600 border-orange-300 bg-orange-50";
      case "high":
        return "text-red-600 border-red-300 bg-red-50";
    }
  };

  // Text color helper for the Submit button so the label follows the urgency color
  const getUrgencyTextOnButton = (level: UrgencyLevel) => {
    switch (level) {
      case "low":
        return "text-green-700";
      case "medium":
        return "text-amber-700";
      case "high":
        return "text-rose-700";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-white to-orange-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2  rounded-lg">
                    <MdBuild className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Maintenance Request
                    </h2>
                    <p className="text-sm text-gray-600">
                      {vehicleName} • {licensePlate}
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-full transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MdClose className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* Form Content */}
            <form
              onSubmit={handleSubmit}
              className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]"
            >
              {error && (
                <motion.div
                  className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <MdWarning className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <MdClose className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Issue Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the maintenance issue in detail (e.g., flat tire, engine noise, broken lights, etc.)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-200 focus:border-transparent resize-none"
                  rows={5}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {description.length}/500 characters
                </p>
              </div>

              {/* Urgency Level */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Urgency Level <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["low", "medium", "high"] as UrgencyLevel[]).map(
                    (level) => (
                      <motion.button
                        key={level}
                        type="button"
                        onClick={() => setUrgency(level)}
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          urgency === level
                            ? `${getUrgencyTextColor(level)} border-2`
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {urgency === level && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br opacity-10 rounded-xl"
                            layoutId="urgencySelector"
                            initial={false}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                            style={{
                              background: `linear-gradient(to bottom right, ${
                                level === "low"
                                  ? "#10b981"
                                  : level === "medium"
                                  ? "#f59e0b"
                                  : "#ef4444"
                              }, transparent)`,
                            }}
                          />
                        )}
                        <div className="relative">
                          <div className="text-center">
                            <p className="font-bold capitalize">{level}</p>
                            <p className="text-xs mt-1">
                              {level === "low" && "Can wait"}
                              {level === "medium" && "Soon needed"}
                              {level === "high" && "Urgent!"}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    )
                  )}
                </div>
              </div>

              {/* Evidence Photos */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Evidence Photos{" "}
                  <span className="text-gray-400">
                    (Optional, max 5 photos)
                  </span>
                </label>
                <div className="space-y-3">
                  {/* Upload Button */}
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-200 hover:bg-orange-50 transition-all cursor-pointer">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <MdUpload className="w-10 h-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 font-medium">
                        Click to upload photos
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG (Max 5MB per file)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png,image/jpeg,image/jpg"
                      multiple
                      onChange={handleFileSelect}
                      disabled={evidencePhotos.length >= 5}
                    />
                  </label>

                  {/* Preview Photos */}
                  {evidencePhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {evidencePhotos.map((photo, index) => (
                        <motion.div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <MdDelete className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            {(photo.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <MdWarning className="inline w-4 h-4 mr-1 text-orange-500" />
                Vehicle will be marked for maintenance review
              </p>
              <div className="flex space-x-3">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 cursor-pointer text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-slate-100 transition-colors font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !description.trim()}
                  className={`px-6 py-2.5 cursor-pointer rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 bg-gradient-to-r ${getUrgencyColor(
                    urgency
                  )} ${getUrgencyTextOnButton(
                    urgency
                  )} disabled:opacity-50 disabled:cursor-not-allowed`}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <MdBuild className="w-5 h-5" />
                      <span>Submit Request</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MaintenanceRequestModal;
