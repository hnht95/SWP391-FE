import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MdClose,
  MdPerson,
  MdEmail,
  MdPhone,
  MdCalendarToday,
  MdInfo,
} from "react-icons/md";
import type { User } from "../../../types/userTypes";
import {
  getStatusBadge,
  getTypeBadge,
  getTypeText,
} from "../../../utils/userUtils";
import { formatDate } from "../../../utils/dateUtils";

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  // Extract safe image url from various BE shapes
  const extractUrl = (val: unknown): string | null => {
    if (!val) return null;
    if (typeof val === "string") return val.startsWith("http") ? val : null;
    if (typeof val === "object") {
      const v = val as { url?: unknown; secure_url?: unknown };
      if (typeof v.url === "string") return v.url;
      if (typeof v.secure_url === "string") return v.secure_url;
    }
    return null;
  };

  const kycImages = {
    idFront: extractUrl(user.kyc?.idFrontImage as unknown),
    idBack: extractUrl(user.kyc?.idBackImage as unknown),
    licenseFront: extractUrl(user.kyc?.licenseFrontImage as unknown),
    licenseBack: extractUrl(user.kyc?.licenseBackImage as unknown),
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <motion.div
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <MdPerson className="w-7 h-7 text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h2>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(
                      user.type
                    )}`}
                  >
                    {getTypeText(user.type)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                      user.status
                    )}`}
                  >
                    {user.status === "active" && "Active"}
                    {user.status === "locked" && "Locked"}
                    {user.status === "verify" && "Need Verify"}
                  </span>
                </div>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MdClose className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <motion.div
              className="bg-gray-50 rounded-lg p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MdPerson className="w-5 h-5 mr-2" />
                Personal Information
              </h3>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <MdPerson className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {user.name}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(
                      user.type
                    )}`}
                  >
                    {getTypeText(user.type)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <MdEmail className="w-4 h-4 mr-1" />
                    {user.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Phone
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <MdPhone className="w-4 h-4 mr-1" />
                    {user.phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Gender
                  </label>
                  <p className="text-gray-900 capitalize">{user.gender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Station
                  </label>
                  <p className="text-gray-900">
                    {user.station?.name || "No station"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    CCCD
                  </label>
                  <p className="text-gray-900">{user.kyc.idNumber || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Created At
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <MdCalendarToday className="w-4 h-4 mr-1" />
                    {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Account Status */}
            <motion.div
              className="bg-gray-50 rounded-lg p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Account Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <span
                    className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                      user.status
                    )}`}
                  >
                    {user.status === "active" && "Active"}
                    {user.status === "locked" && "Locked"}
                    {user.status === "verify" && "Need Verify"}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Account Type
                  </label>
                  <span
                    className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(
                      user.type
                    )}`}
                  >
                    {getTypeText(user.type)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* KYC Information */}
            <motion.div
              className="bg-gray-50 rounded-lg p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                KYC Verification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    ID Number (CCCD)
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {user.kyc?.idNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Verified
                  </label>
                  <p
                    className={`font-semibold ${
                      user.kyc?.verified ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {user.kyc?.verified ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Verified At
                  </label>
                  <p className="text-gray-900">
                    {user.kyc?.verifiedAt
                      ? formatDate(user.kyc.verifiedAt)
                      : "Not verified"}
                  </p>
                </div>
              </div>

              {/* KYC Images Grid */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "ID Front Image", url: kycImages.idFront },
                  { label: "ID Back Image", url: kycImages.idBack },
                  { label: "License Front Image", url: kycImages.licenseFront },
                  { label: "License Back Image", url: kycImages.licenseBack },
                ].map(({ label, url }) => (
                  <div
                    key={label}
                    className="border border-gray-200 rounded-lg bg-white overflow-hidden"
                  >
                    <div className="px-3 py-2 border-b border-gray-100 text-sm font-medium text-gray-700">
                      {label}
                    </div>
                    <div className="p-3">
                      {url ? (
                        <motion.img
                          src={url}
                          alt={label}
                          className="w-full h-40 object-cover rounded-md cursor-pointer"
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setPreviewUrl(url)}
                        />
                      ) : (
                        <div className="h-40 flex items-center justify-center bg-gray-50 rounded-md text-gray-400 text-sm">
                          Not uploaded
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Rental Statistics */}
            <motion.div
              className="bg-gray-50 rounded-lg p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Rental Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Total Rentals
                  </label>
                  <p className="text-gray-900 font-semibold text-lg">
                    {user.rentalCount ?? 0}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </label>
                  <p className="text-gray-900 font-semibold text-lg">
                    {user.revenue
                      ? user.revenue.toLocaleString() + " VND"
                      : "0 VND"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feedback */}
            {user.feedback && (
              <motion.div
                className="bg-gray-50 rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MdInfo className="w-5 h-5 mr-2" />
                  Feedback & Notes
                </h3>
                <p className="text-gray-700">{user.feedback}</p>
              </motion.div>
            )}

            {/* Quick Actions removed as requested */}
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
            <motion.button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </div>
      {/* Image Preview Lightbox */}
      {previewUrl && (
        <motion.div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="max-w-4xl w-full max-h-[85vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2 flex justify-end">
              <button
                onClick={() => setPreviewUrl(null)}
                className="text-white/80 hover:text-white"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>
            <div className="px-4 pb-6 flex items-center justify-center">
              <img
                src={previewUrl as string}
                alt="Preview"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default UserDetailModal;
