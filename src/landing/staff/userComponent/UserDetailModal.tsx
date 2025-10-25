import React from "react";
import { motion } from "framer-motion";
import {
  MdClose,
  MdPerson,
  MdEmail,
  MdPhone,
  MdCalendarToday,
  MdInfo,
  MdLock,
  MdBlock,
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
  if (!isOpen || !user) return null;

  return (
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
          <h2 className="text-xl font-semibold text-gray-900">
            User Details - {user.id}
          </h2>
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
                <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
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
                <p className="text-gray-900">{user.cccd || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Created At
                </label>
                <p className="text-gray-900 flex items-center">
                  <MdCalendarToday className="w-4 h-4 mr-1" />
                  {user.createdAt ? user.createdAt.split("T")[0] : "N/A"}
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
              <div>
                <label className="text-sm font-medium text-gray-600">
                  ID Front Image
                </label>
                <p className="text-gray-900">
                  {user.kyc?.idFrontImage ? "Uploaded" : "Not uploaded"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  License Front Image
                </label>
                <p className="text-gray-900">
                  {user.kyc?.licenseFrontImage ? "Uploaded" : "Not uploaded"}
                </p>
              </div>
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

          {/* Quick Actions */}
          <motion.div
            className="bg-gray-50 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <motion.button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MdLock className="w-4 h-4" />
                <span>Reset Password</span>
              </motion.button>
              <motion.button
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MdBlock className="w-4 h-4" />
                <span>
                  {user.status === "locked" ? "Unlock Account" : "Lock Account"}
                </span>
              </motion.button>
            </div>
          </motion.div>
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
  );
};

export default UserDetailModal;
