import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { MdClose, MdEdit, MdEmail, MdPhone, MdLocationOn, MdBadge, MdPerson, MdWork } from "react-icons/md";

// Combined interface for unified user/staff management
interface CombinedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "staff" | "renter" | "partner" | "manager" | "technician";
  status: "active" | "inactive";
  joinDate: string;
  type: "user" | "staff";
  station?: string;
  performanceScore?: number;
  // Additional fields for users
  gender?: string;
  defaultRefundWallet?: string;
  kyc?: any;
  avatarUrl?: any;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

interface UserDetailModalProps {
  user: CombinedUser | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: CombinedUser) => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, isOpen, onClose, onEdit }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!user || !isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "staff":
        return "bg-blue-100 text-blue-800";
      case "renter":
        return "bg-green-100 text-green-800";
      case "partner":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />

          {/* Modal */}
          <div className="flex min-h-screen items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <MdPerson className="w-6 h-6 text-gray-700" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      User Details
                    </h2>
                    <p className="text-sm text-gray-500">
                      ID: {user._id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MdClose className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* User Avatar & Basic Info */}
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center">
                    {typeof user.avatarUrl === 'object' && user.avatarUrl?.url ? (
                      <img
                        src={user.avatarUrl.url}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-purple-600 text-3xl font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.status === "active" ? "Active" : "Inactive"}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          user.type === "user"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid of Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <MdEmail className="w-5 h-5 mr-2" />
                      Contact Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center space-x-3">
                        <MdEmail className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MdPhone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <MdPerson className="w-5 h-5 mr-2" />
                      Personal Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {user.gender && (
                        <div>
                          <p className="text-xs text-gray-500">Gender</p>
                          <p className="text-sm font-medium text-gray-900 capitalize">{user.gender}</p>
                        </div>
                      )}
                      {user.defaultRefundWallet && (
                        <div>
                          <p className="text-xs text-gray-500">Default Refund Wallet</p>
                          <p className="text-sm font-medium text-gray-900">
                            {user.defaultRefundWallet || "Not set"}
                          </p>
                        </div>
                      )}
                      {user.performanceScore && (
                        <div>
                          <p className="text-xs text-gray-500">Performance Score</p>
                          <p className="text-sm font-medium text-gray-900">
                            {user.performanceScore}/100
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Station Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <MdLocationOn className="w-5 h-5 mr-2" />
                      Station Assignment
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {user.station ? (
                        <div>
                          <p className="text-xs text-gray-500">Station Name</p>
                          <p className="text-sm font-medium text-gray-900">
                            {user.station}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Not assigned</p>
                      )}
                    </div>
                  </div>

                  {/* KYC Information - Only for users */}
                  {user.type === "user" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <MdBadge className="w-5 h-5 mr-2" />
                        KYC Status
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">Verification Status</p>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              user.kyc?.verified
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.kyc?.verified ? "Verified" : "Not Verified"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Timestamps */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Timestamps</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Created At</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(user.joinDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(user.updatedAt || user.joinDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Close
                </button>
                <button
                  onClick={() => onEdit(user)}
                  className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <MdEdit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default UserDetailModal;

