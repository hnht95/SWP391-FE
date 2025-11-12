import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdClose,
  MdDeleteForever,
  MdWarning,
  MdUpload,
  MdDelete,
} from "react-icons/md";
import api from "../../../service/Utils";

interface DeletionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  onSuccess: () => void;
}

const DeletionRequestModal: React.FC<DeletionRequestModalProps> = ({
  isOpen,
  onClose,
  vehicleId,
  vehicleName,
  licensePlate,
  onSuccess,
}) => {
  const [reportText, setReportText] = useState("");
  const [evidencePhotos, setEvidencePhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      const validFiles = files.filter((file) => {
        if (file.size > 5 * 1024 * 1024) {
          setError(`File "${file.name}" is larger than 5MB`);
          return false;
        }
        return true;
      });

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

    if (!reportText.trim()) {
      setError("Please provide a reason for deletion");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("reportText", reportText.trim());
      evidencePhotos.forEach((photo) =>
        formData.append("evidencePhotos", photo)
      );

      const response = await api.post(
        `/vehicles/${vehicleId}/deletion-requests`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data?.success || response.data) {
        onSuccess();
        onClose();
        setReportText("");
        setEvidencePhotos([]);
      } else {
        throw new Error("Failed to submit deletion request");
      }
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "An error occurred while submitting the deletion request"
      );
      console.error("Deletion request error:", err);
    } finally {
      setIsSubmitting(false);
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
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-rose-50 to-red-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-rose-500 to-red-500 rounded-lg shadow-lg">
                    <MdDeleteForever className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Deletion Request
                    </h2>
                    <p className="text-sm text-gray-600">
                      {vehicleName} • {licensePlate}
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-100 rounded-full transition-colors"
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

              {/* Reason Field */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for deletion <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Explain why this vehicle should be deleted (e.g., severe damage, irreparable, administrative reasons...)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-200 focus:border-transparent resize-none"
                  rows={5}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {reportText.length}/500 characters
                </p>
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
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-rose-200 hover:bg-rose-50 transition-all cursor-pointer">
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
                <MdWarning className="inline w-4 h-4 mr-1 text-rose-500" />
                Vehicle will be reviewed for deletion by admin
              </p>
              <div className="flex space-x-3">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !reportText.trim()}
                  className={`px-6 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <MdDeleteForever className="w-5 h-5" />
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

export default DeletionRequestModal;
