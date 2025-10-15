import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MdClose, 
  MdPerson, 
  MdEmail, 
  MdPhone, 
  MdWork, 
  MdLocationOn, 
  MdEdit, 
  MdDelete,
  MdSave,
  MdCancel,
  MdVisibility,
  MdVisibilityOff
} from "react-icons/md";
import { staffManagementAPI } from "../../../../service/apiAdmin/StaffManagementAPI";
import StationDropdown from "./StationDropdown";

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "manager" | "staff" | "technician";
  station: string;
  performanceScore: number;
  status: "active" | "inactive";
  joinDate: string;
}

interface UpdateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  station: string;
  status: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  station?: string;
  status?: string;
}

const UpdateStaffModal: React.FC<UpdateStaffModalProps> = ({ isOpen, onClose, staff, onSuccess }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    role: "staff",
    station: "",
    status: "active",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form data when staff changes
  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        station: staff.station,
        status: staff.status,
      });
    }
  }, [staff]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleStationChange = (stationId: string) => {
    setFormData((prev) => ({ ...prev, station: stationId }));
    // Clear error when user selects
    if (errors.station) {
      setErrors((prev) => ({ ...prev, station: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter full name";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Please enter phone number";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    } else if (!formData.phone.startsWith('0')) {
      newErrors.phone = "Phone number must start with 0";
    }

    if (!formData.role) {
      newErrors.role = "Please select role";
    }

    if (!formData.station.trim()) {
      newErrors.station = "Please enter station";
    }

    if (!formData.status) {
      newErrors.status = "Please select status";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement update staff API
      console.log("Updating staff:", formData);
      // Close this modal first, then show success modal
      handleClose();
      // Trigger success callback after a short delay
      setTimeout(() => {
        onSuccess();
      }, 100);
    } catch (error: any) {
      console.error("Error updating staff:", error);
      alert("Failed to update staff. Please try again!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (staff?.status !== "inactive") {
      alert("Staff must be set to Inactive before deletion!");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement delete staff API
      console.log("Deleting staff:", staff.id);
      // Close this modal first, then show success modal
      handleClose();
      // Trigger success callback after a short delay
      setTimeout(() => {
        onSuccess();
      }, 100);
    } catch (error: any) {
      console.error("Error deleting staff:", error);
      alert("Failed to delete staff. Please try again!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    setShowDeleteConfirm(false);
    setErrors({});
    onClose();
  };

  const getRoleBadge = (role: string) => {
    const config = {
      manager: { color: "bg-blue-100 text-blue-700 border-2 border-blue-500", text: "Manager" },
      staff: { color: "bg-gray-200 text-gray-800", text: "Staff" },
      technician: { color: "bg-gray-600 text-white", text: "Technician" },
    };
    return config[role as keyof typeof config] || config.staff;
  };

  const getStatusBadge = (status: string) => {
    return status === "active" 
      ? { color: "bg-green-100 text-green-700", text: "Active" }
      : { color: "bg-gray-200 text-gray-600", text: "Inactive" };
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    if (score >= 20) return "text-orange-600";
    return "text-red-600";
  };

  const getPerformanceBarColor = (score: number) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 50) return "bg-yellow-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-600";
  };

  if (!staff) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                    <MdPerson className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Staff Details</h2>
                    <p className="text-sm text-gray-500">View and manage staff information</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200"
                    >
                      <MdEdit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
                  >
                    <MdClose className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                    
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-3 py-2 text-sm border ${
                              errors.name ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-gray-50/50"
                            } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                          />
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-gray-800">{staff.name}</span>
                        </div>
                      )}
                      {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-3 py-2 text-sm border ${
                              errors.email ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-gray-50/50"
                            } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                          />
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-gray-800">{staff.email}</span>
                        </div>
                      )}
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <MdPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-3 py-2 text-sm border ${
                              errors.phone ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-gray-50/50"
                            } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                          />
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-gray-800">{staff.phone}</span>
                        </div>
                      )}
                      {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Right Column - Work Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Work Information</h3>
                    
                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <MdWork className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                          <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                          >
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                            <option value="technician">Technician</option>
                          </select>
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(staff.role).color}`}>
                            {getRoleBadge(staff.role).text}
                          </span>
                        </div>
                      )}
                      {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role}</p>}
                    </div>

                    {/* Station */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Station <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <StationDropdown
                          value={formData.station}
                          onChange={handleStationChange}
                          error={errors.station}
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-gray-800">{staff.station}</span>
                        </div>
                      )}
                      {errors.station && <p className="mt-1 text-xs text-red-500">{errors.station}</p>}
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm border border-gray-200 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(staff.status).color}`}>
                            {getStatusBadge(staff.status).text}
                          </span>
                        </div>
                      )}
                      {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
                    </div>

                    {/* Performance Score */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Performance Score
                      </label>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${getPerformanceBarColor(staff.performanceScore)}`}
                              style={{ width: `${staff.performanceScore}%` }}
                            />
                          </div>
                          <span className={`text-sm font-semibold ${getPerformanceColor(staff.performanceScore)}`}>
                            {staff.performanceScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Join Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Join Date
                      </label>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="text-gray-800">{staff.joinDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    {staff.status === "inactive" && (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200"
                        disabled={isSubmitting}
                      >
                        <MdDelete className="w-4 h-4" />
                        <span>Delete Staff</span>
                      </button>
                    )}
                    {staff.status === "active" && (
                      <div className="text-sm text-gray-500">
                        Set status to Inactive to enable deletion
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 border border-gray-200 text-gray-600 bg-white rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                          disabled={isSubmitting}
                        >
                          <MdCancel className="w-4 h-4 inline mr-2" />
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdate}
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md"
                        >
                          <MdSave className="w-4 h-4 inline mr-2" />
                          {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleClose}
                        className="px-4 py-2 border border-gray-200 text-gray-600 bg-white rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MdDelete className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Staff</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete <strong>{staff.name}</strong>? This action cannot be undone.
                  </p>
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 border border-gray-200 text-gray-600 bg-white rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 disabled:opacity-50"
                    >
                      {isSubmitting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default UpdateStaffModal;
