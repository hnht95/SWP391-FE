import { motion } from "framer-motion";
import { useState } from "react";
import { MdEdit, MdVerified, MdWarning } from "react-icons/md";
import profileApi from "../../../../../../service/apiUser/profile/API";
// import profileApi from '../../../service/apiUser/profile/API';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: "User" | "Staff" | "Admin";
  kycVerified: boolean;
}

interface UserProfileCardProps {
  user: UserData;
  onProfileUpdate?: () => void; // ✅ Callback to refresh user data
}

const UserProfileCard = ({ user, onProfileUpdate }: UserProfileCardProps) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // ✅ KYC document files
  const [idFrontImage, setIdFrontImage] = useState<File | null>(null);
  const [idBackImage, setIdBackImage] = useState<File | null>(null);
  const [licenseFrontImage, setLicenseFrontImage] = useState<File | null>(null);
  const [licenseBackImage, setLicenseBackImage] = useState<File | null>(null);

  // Preview URLs
  const [previewUrls, setPreviewUrls] = useState<{
    idFront?: string;
    idBack?: string;
    licenseFront?: string;
    licenseBack?: string;
  }>({});

  const handleEditAvatar = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await profileApi.uploadAvatar(file);
          alert("Avatar updated successfully!");
          onProfileUpdate?.(); // ✅ Refresh user data
        } catch (error) {
          console.error("Failed to upload avatar:", error);
          alert("Failed to upload avatar");
        }
      }
    };
    input.click();
  };

  const handleEditProfile = () => {
    console.log("Edit profile clicked");
  };

  const handleKYCUpload = () => {
    setIsUploadModalOpen(true);
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "idFront" | "idBack" | "licenseFront" | "licenseBack"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Set file
      switch (type) {
        case "idFront":
          setIdFrontImage(file);
          break;
        case "idBack":
          setIdBackImage(file);
          break;
        case "licenseFront":
          setLicenseFrontImage(file);
          break;
        case "licenseBack":
          setLicenseBackImage(file);
          break;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => ({
          ...prev,
          [type]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitKYC = async () => {
    // ✅ Must have at least ID front and back images
    if (!idFrontImage || !idBackImage) {
      alert("Please upload both ID card images (front and back)");
      return;
    }

    setIsUploading(true);

    try {
      await profileApi.uploadKYCDocuments({
        idFrontImage,
        idBackImage,
        licenseFrontImage: licenseFrontImage || undefined,
        licenseBackImage: licenseBackImage || undefined,
      });

      alert("KYC documents submitted successfully! Wait for verification.");

      // Reset state
      setIsUploadModalOpen(false);
      setIdFrontImage(null);
      setIdBackImage(null);
      setLicenseFrontImage(null);
      setLicenseBackImage(null);
      setPreviewUrls({});

      onProfileUpdate?.(); // ✅ Refresh user data
    } catch (error) {
      console.error("Failed to upload KYC:", error);
      alert("Failed to upload documents. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const renderFileUpload = (
    label: string,
    type: "idFront" | "idBack" | "licenseFront" | "licenseBack",
    required: boolean = false
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <label className="block">
        <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-black transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, type)}
            className="hidden"
          />
          {previewUrls[type] ? (
            <img
              src={previewUrls[type]}
              alt="Preview"
              className="max-h-32 mx-auto rounded-lg"
            />
          ) : (
            <>
              <div className="text-2xl mb-1">📄</div>
              <p className="text-xs text-gray-600">Click to upload</p>
            </>
          )}
        </div>
      </label>
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Avatar Section */}
          <div className="relative group">
            <div className="w-[150px] h-[150px] rounded-full overflow-hidden bg-gray-200 shadow-md">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleEditAvatar}
              className="absolute bottom-2 right-2 w-10 h-10 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors duration-300 ease-in-out flex items-center justify-center group-hover:shadow-xl"
            >
              <MdEdit className="w-4 h-4" />
            </motion.button>
          </div>

          {/* User Info */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>

            <div className="space-y-1">
              <p className="text-gray-600 text-sm">{user.email}</p>
              <p className="text-gray-600 text-sm">{user.phone}</p>
            </div>

            <div className="pt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black text-white">
                {user.role}
              </span>
            </div>
          </div>

          {/* KYC Verification Status */}
          <div className="w-full pt-4 border-t border-gray-200">
            {user.kycVerified ? (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <MdVerified className="w-5 h-5" />
                <span className="text-sm font-medium">KYC Verified</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2 text-orange-500">
                  <MdWarning className="w-5 h-5" />
                  <span className="text-sm font-medium">KYC Not Verified</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleKYCUpload}
                  className="w-full py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all duration-300 text-sm"
                >
                  Upload Documents for Verification
                </motion.button>
              </div>
            )}
          </div>

          {/* Edit Profile Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEditProfile}
            className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
          >
            Edit Profile
          </motion.button>
        </div>
      </div>

      {/* KYC Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Upload KYC Documents
              </h3>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setIdFrontImage(null);
                  setIdBackImage(null);
                  setLicenseFrontImage(null);
                  setLicenseBackImage(null);
                  setPreviewUrls({});
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Please upload clear photos of your documents. ID card images are
              required, license images are optional.
            </p>

            {/* File Upload Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {renderFileUpload("ID Card (Front)", "idFront", true)}
              {renderFileUpload("ID Card (Back)", "idBack", true)}
              {renderFileUpload("License (Front)", "licenseFront")}
              {renderFileUpload("License (Back)", "licenseBack")}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setIdFrontImage(null);
                  setIdBackImage(null);
                  setLicenseFrontImage(null);
                  setLicenseBackImage(null);
                  setPreviewUrls({});
                }}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitKYC}
                disabled={!idFrontImage || !idBackImage || isUploading}
                className="flex-1 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : "Submit"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default UserProfileCard;
