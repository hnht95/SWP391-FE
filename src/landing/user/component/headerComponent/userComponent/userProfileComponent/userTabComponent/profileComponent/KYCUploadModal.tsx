import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import {
  X,
  Upload,
  CreditCard,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { createPortal } from "react-dom";
import profileApi from "../../../../../../../../service/apiUser/profile/API";

interface PhotoFile {
  id: string;
  file: File;
  preview: string;
  type: "id_front" | "id_back" | "license_front" | "license_back";
}

interface KYCUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const KYCUploadModal = ({
  isOpen,
  onClose,
  onSuccess,
}: KYCUploadModalProps) => {
  const [photos, setPhotos] = useState<{
    id_front: PhotoFile | null;
    id_back: PhotoFile | null;
    license_front: PhotoFile | null;
    license_back: PhotoFile | null;
  }>({
    id_front: null,
    id_back: null,
    license_front: null,
    license_back: null,
  });

  // ✅ Added state for ID and License numbers
  const [idNumber, setIdNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const uploadSections = [
    {
      type: "id_front" as const,
      label: "ID Card - Front",
      icon: <CreditCard className="w-5 h-5" />,
      color: "blue",
    },
    {
      type: "id_back" as const,
      label: "ID Card - Back",
      icon: <CreditCard className="w-5 h-5" />,
      color: "blue",
    },
    {
      type: "license_front" as const,
      label: "Driver License - Front",
      icon: <FileText className="w-5 h-5" />,
      color: "green",
    },
    {
      type: "license_back" as const,
      label: "Driver License - Back",
      icon: <FileText className="w-5 h-5" />,
      color: "green",
    },
  ];

  const handleFileSelect = (
    file: File,
    type: "id_front" | "id_back" | "license_front" | "license_back"
  ) => {
    const photo: PhotoFile = {
      id: generateId(),
      file,
      preview: URL.createObjectURL(file),
      type,
    };

    setPhotos((prev) => ({
      ...prev,
      [type]: photo,
    }));
  };

  const openFileDialog = (
    type: "id_front" | "id_back" | "license_front" | "license_back"
  ) => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("data-type", type);
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const type = e.target.getAttribute("data-type") as
      | "id_front"
      | "id_back"
      | "license_front"
      | "license_back";
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file, type);
    }
  };

  const removePhoto = (
    type: "id_front" | "id_back" | "license_front" | "license_back"
  ) => {
    setPhotos((prev) => ({
      ...prev,
      [type]: null,
    }));
  };

  // ✅ Updated validation
  const isAllRequiredFieldsFilled =
    photos.id_front &&
    photos.id_back &&
    photos.license_front &&
    photos.license_back &&
    idNumber.trim() !== "" &&
    licenseNumber.trim() !== "";

  // ✅ Updated submit with numbers
  const handleSubmit = async () => {
    if (!isAllRequiredFieldsFilled) return;

    setIsUploading(true);
    setError(null);

    try {
      await profileApi.uploadKYCDocuments({
        idNumber: idNumber.trim(),
        licenseNumber: licenseNumber.trim(),
        idFrontImage: photos.id_front!.file,
        idBackImage: photos.id_back!.file,
        licenseFrontImage: photos.license_front!.file,
        licenseBackImage: photos.license_back!.file,
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error("KYC upload failed:", err);
      setError(err.message || "Failed to upload KYC documents");
    } finally {
      setIsUploading(false);
    }
  };

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 px-8 py-6 flex items-center justify-between flex-shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative flex items-center space-x-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                  >
                    <Upload className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      KYC Verification
                    </h2>
                    <p className="text-sm text-blue-100">
                      Upload your ID and Driver License
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  disabled={isUploading}
                  className="relative w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors backdrop-blur-sm disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* ✅ ID Number and License Number Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ID Card Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="Enter your ID card number"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      License Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="Enter your driver license number"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    />
                  </motion.div>
                </div>

                {/* Image Upload Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {uploadSections.map((section, index) => (
                    <motion.div
                      key={section.type}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (index + 3) * 0.1 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2 text-gray-700">
                        <div className={`text-${section.color}-600`}>
                          {section.icon}
                        </div>
                        <h3 className="font-semibold">{section.label}</h3>
                      </div>

                      {!photos[section.type] ? (
                        <div
                          onClick={() => openFileDialog(section.type)}
                          className={`border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:border-${section.color}-400 hover:bg-${section.color}-50/30 border-gray-300`}
                        >
                          <div className="text-center">
                            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-600 mb-1">
                              Click to upload
                            </p>
                            <p className="text-xs text-gray-500">
                              JPG, PNG (Max 10MB)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative group">
                          <img
                            src={photos[section.type]!.preview}
                            alt={section.label}
                            className="w-full h-48 object-cover rounded-2xl border-2 border-gray-200"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removePhoto(section.type)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center space-x-2"
                            >
                              <X className="w-4 h-4" />
                              <span>Remove</span>
                            </motion.button>
                          </div>
                          <div className="absolute top-3 right-3 bg-green-500 text-white p-2 rounded-full">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Instructions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4"
                >
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Upload Requirements
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• All 4 photos are required</li>
                        <li>• ID number and License number are required</li>
                        <li>• Photos must be clear and readable</li>
                        <li>• No edited or cropped images</li>
                        <li>• Maximum file size: 10MB per photo</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="bg-white px-8 py-6 flex justify-between items-center border-t border-gray-200 flex-shrink-0">
                <div className="text-sm text-gray-600">
                  {Object.values(photos).filter(Boolean).length} / 4 photos
                  uploaded
                </div>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    disabled={isUploading}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={!isAllRequiredFieldsFilled || isUploading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-700 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg shadow-blue-500/30"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Submit for Verification</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(
    modalContent,
    document.getElementById("modal-root") || document.body
  );
};

export default KYCUploadModal;
