import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  AlertCircle,
  Upload,
  Clock,
  CheckCircle,
  Eye,
  X,
  Camera,
  Loader2,
  MapPin,
  CreditCard,
  Building2,
} from "lucide-react";
import KYCUploadModal from "./profileComponent/KYCUploadModal";
import BankAccountModal from "./profileComponent/BankAccountModal";
import type { UserProfile } from "../../../../../../../service/apiUser/profile/API";
import profileApi from "../../../../../../../service/apiUser/profile/API";

interface ProfileTabProps {
  user: UserProfile;
  onRefresh?: () => void;
}

const ProfileTab = ({ user, onRefresh }: ProfileTabProps) => {
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // ✅ Avatar upload states
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch (error) {
      return "N/A";
    }
  };

  const formatGender = (gender?: "male" | "female" | "other"): string => {
    if (!gender) return "Not specified";
    if (gender === "male") return "Male";
    if (gender === "female") return "Female";
    return "Other";
  };

  const handleKYCSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  // ✅ Handle avatar file selection and upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("📸 Avatar file selected:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image size must be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarError(null);

    try {
      console.log("📤 Uploading avatar...");
      await profileApi.uploadAvatar(file);
      console.log("✅ Avatar uploaded successfully");

      // Trigger refresh to fetch updated user data
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      console.error("❌ Avatar upload failed:", err);
      setAvatarError(err.message || "Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getKYCImageUrl = (image: any): string | undefined => {
    if (!image) return undefined;
    if (typeof image === "object" && image.url) {
      return image.url;
    }
    if (typeof image === "string") {
      return image;
    }
    return undefined;
  };

  const getKYCStatus = (): "not_uploaded" | "pending" | "verified" => {
    if (!user.kyc) {
      return "not_uploaded";
    }

    const hasIdFront = getKYCImageUrl(user.kyc.idFrontImage);
    const hasIdBack = getKYCImageUrl(user.kyc.idBackImage);
    const hasLicenseFront = getKYCImageUrl(user.kyc.licenseFrontImage);
    const hasLicenseBack = getKYCImageUrl(user.kyc.licenseBackImage);

    const hasAllImages =
      hasIdFront && hasIdBack && hasLicenseFront && hasLicenseBack;

    if (!hasAllImages) {
      return "not_uploaded";
    }

    if (user.kyc.verified === true) {
      return "verified";
    }

    return "pending";
  };

  const kycStatus = getKYCStatus();

  // ✅ Updated profile fields with date of birth and address
  const profileFields = [
    {
      label: "Full Name",
      value: user.name,
      icon: <User className="w-5 h-5" />,
    },
    {
      label: "Email Address",
      value: user.email,
      icon: <Mail className="w-5 h-5" />,
    },
    {
      label: "Phone Number",
      value: user.phone || "Not provided",
      icon: <Phone className="w-5 h-5" />,
    },
    {
      label: "Gender",
      value: formatGender(user.gender),
      icon: <User className="w-5 h-5" />,
    },
    {
      label: "Date of Birth",
      value: formatDate(user.dateOfBirth),
      icon: <Calendar className="w-5 h-5" />,
    },
  ];

  const additionalInfo = [
    {
      label: "Member Since",
      value: formatDate(user.createdAt),
      icon: <Calendar className="w-5 h-5 text-black" />,
    },
    {
      label: "Account Status",
      value: user.isActive ? "Active" : "Inactive",
      icon: <CheckCircle className="w-5 h-5 text-black" />,
    },
  ];

  const getAvatarUrl = (): string | undefined => {
    if (typeof user.avatarUrl === "object" && user.avatarUrl?.url) {
      return user.avatarUrl.url;
    }
    if (typeof user.avatarUrl === "string") {
      return user.avatarUrl;
    }
    return user.avatar;
  };

  const avatarUrl = getAvatarUrl();

  // ✅ Check if bank info is complete
  const hasBankInfo =
    user.bankInfo && user.bankInfo.accountNumber && user.bankInfo.accountName;

  return (
    <>
      <div className="space-y-8">
        {/* ✅ Avatar Section with Upload on Hover */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center space-x-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-lg"
        >
          <div className="relative group">
            {/* Avatar Image */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-400 shadow-lg">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-10 h-10 text-black" />
                </div>
              )}
            </div>

            {/* ✅ Hover Overlay with Edit Icon */}
            <div
              className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
              onClick={() =>
                !isUploadingAvatar && fileInputRef.current?.click()
              }
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={isUploadingAvatar}
            />
          </div>

          <div className="flex-1">
            <h4 className="text-xl font-bold text-black">{user.name}</h4>
            <p className="text-gray-600 text-sm">{user.email}</p>
            <div className="flex items-center mt-2 space-x-2">
              <span className="px-3 py-1 bg-black text-white text-xs font-medium rounded-full">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              {kycStatus === "verified" && (
                <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center space-x-1">
                  <span>✓</span>
                  <span>Verified</span>
                </span>
              )}
            </div>
            {avatarError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-600 mt-2 flex items-center"
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                {avatarError}
              </motion.p>
            )}
            {isUploadingAvatar && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-blue-600 mt-2 flex items-center"
              >
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Uploading avatar...
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Profile Fields */}
        <div className="space-y-4">
          {profileFields.map((field, index) => (
            <motion.div
              key={field.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.1,
                duration: 0.4,
                ease: "easeOut",
              }}
              whileHover={{ y: -2 }}
              className="flex items-center space-x-4 p-6 bg-white rounded-2xl hover:bg-gray-50 transition-all duration-300 ease-in-out border border-gray-200 shadow-lg group cursor-pointer"
            >
              <div className="text-black group-hover:scale-110 transition-transform duration-300">
                {field.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium">
                  {field.label}
                </p>
                <p className="text-black font-semibold mt-1 group-hover:text-gray-700 transition-colors duration-300">
                  {field.value}
                </p>
              </div>
            </motion.div>
          ))}

          {/* ✅ Bank Account Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -2 }}
            className={`flex items-start space-x-4 p-6 rounded-2xl transition-all duration-300 ease-in-out border shadow-lg ${
              hasBankInfo
                ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <div
              className={`transition-transform duration-300 ${
                hasBankInfo ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium mb-2">
                Bank Account Information
              </p>

              {hasBankInfo ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-blue-300 rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        Account Number
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.bankInfo.accountNumber}
                      </p>
                    </div>
                    <div className="bg-white border border-blue-300 rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        Account Name
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.bankInfo.accountName}
                      </p>
                    </div>
                  </div>

                  {user.bankInfo.bankCode && (
                    <div className="bg-white border border-blue-300 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">
                            Bank
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {user.bankInfo.bankName || user.bankInfo.bankCode}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {user.bankInfo.updatedAt && (
                    <p className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Last updated: {formatDate(user.bankInfo.updatedAt)}
                    </p>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowBankModal(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Update Bank Info</span>
                  </motion.button>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    Add your bank account information for refunds and
                    withdrawals
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowBankModal(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg text-xs font-medium hover:bg-gray-600 transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Add Bank Account</span>
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>

          {/* KYC Status Section - Keep all existing KYC code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -2 }}
            className={`flex items-start space-x-4 p-6 rounded-2xl transition-all duration-300 ease-in-out border shadow-lg ${
              kycStatus === "verified"
                ? "bg-green-50 border-green-200 hover:bg-green-100"
                : kycStatus === "pending"
                ? "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                : "bg-orange-50 border-orange-200 hover:bg-orange-100"
            }`}
          >
            <div
              className={`transition-transform duration-300 ${
                kycStatus === "verified"
                  ? "text-green-600"
                  : kycStatus === "pending"
                  ? "text-yellow-600"
                  : "text-orange-600"
              }`}
            >
              {kycStatus === "verified" ? (
                <Shield className="w-5 h-5" />
              ) : kycStatus === "pending" ? (
                <Clock className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium">KYC Status</p>

              {/* Case 1: Verified */}
              {kycStatus === "verified" && user.kyc && (
                <div className="mt-2">
                  <p className="text-green-700 font-semibold flex items-center mb-3">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verified
                  </p>
                  <p className="text-xs text-green-600 mb-3">
                    Your identity has been verified
                    {user.kyc.verifiedAt &&
                      ` on ${formatDate(user.kyc.verifiedAt)}`}
                  </p>

                  {/* ID and License Numbers */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white border border-green-300 rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        ID Card Number
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.kyc.idNumber || "N/A"}
                      </p>
                    </div>
                    <div className="bg-white border border-green-300 rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        License Number
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.kyc.licenseNumber || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* 4 Images Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {[
                      {
                        label: "ID Front",
                        url: getKYCImageUrl(user.kyc.idFrontImage),
                      },
                      {
                        label: "ID Back",
                        url: getKYCImageUrl(user.kyc.idBackImage),
                      },
                      {
                        label: "License Front",
                        url: getKYCImageUrl(user.kyc.licenseFrontImage),
                      },
                      {
                        label: "License Back",
                        url: getKYCImageUrl(user.kyc.licenseBackImage),
                      },
                    ].map((image, idx) => (
                      <div key={idx} className="relative group flex flex-col">
                        {image.url && (
                          <>
                            <div className="relative">
                              <img
                                src={image.url}
                                alt={image.label}
                                className="w-full h-90 object-cover rounded-lg border-2 border-green-300 cursor-pointer transition-transform hover:scale-105"
                                onClick={() =>
                                  setSelectedImage(image.url || null)
                                }
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <Eye className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            <p className="text-xs text-green-700 mt-2 font-medium">
                              {image.label}
                            </p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Update Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowKYCModal(true)}
                    className="mt-8 w-full flex items-center justify-center space-x-2 px-4 py-2 p-4 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Update Documents</span>
                  </motion.button>
                </div>
              )}

              {/* Case 2: Pending */}
              {kycStatus === "pending" && (
                <div className="mt-1">
                  <p className="text-yellow-700 font-semibold flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Pending Verification
                  </p>
                  <p className="text-xs text-yellow-600 mt-2 leading-relaxed">
                    Your documents have been uploaded and are under review. You
                    will be notified once verified.
                  </p>

                  {/* Show ID/License Numbers if available */}
                  {(user.kyc?.idNumber || user.kyc?.licenseNumber) && (
                    <div className="grid grid-cols-2 gap-3 mt-3 mb-3">
                      {user.kyc.idNumber && (
                        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            ID Card Number
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {user.kyc.idNumber}
                          </p>
                        </div>
                      )}
                      {user.kyc.licenseNumber && (
                        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            License Number
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {user.kyc.licenseNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-3 bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                    <p className="text-xs text-yellow-800 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Verification typically takes 1-2 business days
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowKYCModal(true)}
                    className="mt-3 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg text-xs font-medium hover:bg-yellow-600 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Re-upload Documents</span>
                  </motion.button>
                </div>
              )}

              {/* Case 3: Not Uploaded */}
              {kycStatus === "not_uploaded" && (
                <div className="mt-1">
                  <p className="text-orange-700 font-semibold flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Not Verified
                  </p>
                  <p className="text-xs text-orange-600 mt-2 leading-relaxed">
                    Upload 4 photos: ID Card (Front & Back) + Driver License
                    (Front & Back)
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowKYCModal(true)}
                    className="mt-3 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Documents</span>
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Additional Info Section */}
        <div className="space-y-4">
          <h4 className="text-xl font-bold text-black">Account Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {additionalInfo.map((info, index) => (
              <motion.div
                key={info.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: (index + 8) * 0.1,
                  duration: 0.4,
                  ease: "easeOut",
                }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="p-6 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 ease-out cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  {info.icon}
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      {info.label}
                    </p>
                    <p className="text-black font-bold text-lg mt-1">
                      {info.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-4 bg-gray-50 text-black rounded-2xl font-medium hover:bg-gray-100 transition-all duration-300 ease-in-out border border-gray-300 shadow-lg"
          >
            Change Password
          </motion.button>
        </motion.div>
      </div>

      {/* KYC Upload Modal */}
      <KYCUploadModal
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        onSuccess={handleKYCSuccess}
      />

      {/* Bank Account Modal */}
      <BankAccountModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        currentBankInfo={user.bankInfo}
        onSuccess={handleKYCSuccess}
      />

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Preview"
                className="w-full h-auto rounded-2xl"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfileTab;
