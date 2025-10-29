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
} from "react-icons/md";

import StationDropdown from "./StationDropdown";
import { updateStaff, deleteStaff } from "../../../../service/apiAdmin/StaffAPI/API";

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
  gender?: string;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

interface UpdateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: CombinedUser | null;
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

const UpdateStaffModal: React.FC<UpdateStaffModalProps> = ({
  isOpen,
  onClose,
  staff,
  onSuccess,
}) => {
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
        station: staff.station || "",
        status: staff.status,
      });
    }
  }, [staff]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
    }

    if (!formData.role) {
      newErrors.role = "Please select role";
    }

    if (!formData.station.trim()) {
      newErrors.station = "Please select a station";
    }

    if (!formData.status) {
      newErrors.status = "Please select status";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !staff) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateStaff(staff._id || staff.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        station: formData.station,
        isActive: formData.status === "active",
      });

      handleClose();
      setTimeout(() => {
        onSuccess();
      }, 100);
    } catch (error: any) {
      console.error("Error updating staff:", error);
      const errorMessage = error.message || "Unknown error";
      
      if (errorMessage.includes("Email already exists")) {
        setErrors({ email: "This email is already in use" });
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!staff) return;

    setIsSubmitting(true);
    try {
      await deleteStaff(staff._id || staff.id);
      handleClose();
      setTimeout(() => {
        onSuccess();
      }, 100);
    } catch (error: any) {
      console.error("Error deleting staff:", error);
      alert(error.message || "Failed to delete staff");
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    setShowDeleteConfirm(false);
    setErrors({});
    onClose();
  };

  if (!staff) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal Container */}
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
                  <div className="w-11 h-11 bg-gradient-to-br from-black-700 to-black rounded-2xl flex items-center justify-center shadow-md">
                    <MdPerson className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {isEditing ? "Edit Staff" : "Staff Details"}
                    </h2>
                    <p className="text-xs text-gray-200">
                      {isEditing ? "Update staff information" : "View staff details"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all duration-200"
                >
                  <MdClose className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MdPerson className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-3 py-2 text-sm border ${
                            errors.name
                              ? "border-red-300 bg-red-50/30"
                              : "border-gray-200 bg-gray-50/50"
                          } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                          placeholder="Enter full name"
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MdEmail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-3 py-2 text-sm border ${
                            errors.email
                              ? "border-red-300 bg-red-50/30"
                              : "border-gray-200 bg-gray-50/50"
                          } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                          placeholder="Enter email"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MdPhone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-3 py-2 text-sm border ${
                            errors.phone
                              ? "border-red-300 bg-red-50/30"
                              : "border-gray-200 bg-gray-50/50"
                          } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                          placeholder="Enter phone number"
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                      )}
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MdWork className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                        >
                          <option value="staff">Staff</option>
                          <option value="manager">Manager</option>
                          <option value="technician">Technician</option>
                        </select>
                      </div>
                      {errors.role && (
                        <p className="mt-1 text-xs text-red-500">{errors.role}</p>
                      )}
                    </div>

                    {/* Station */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Station <span className="text-red-500">*</span>
                      </label>
                      <StationDropdown
                        value={formData.station}
                        onChange={handleStationChange}
                        error={errors.station}
                      />
                      {errors.station && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.station}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MdWork className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      {errors.status && (
                        <p className="mt-1 text-xs text-red-500">{errors.status}</p>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-between pt-4 mt-1 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all duration-200 font-medium text-sm flex items-center space-x-2"
                        disabled={isSubmitting}
                      >
                        <MdDelete className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-5 py-2 border border-gray-200 text-gray-600 bg-white rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-sm"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-6 py-2 bg-black text-white rounded-xl font-semibold text-sm shadow-md transition-all duration-100 hover:bg-white hover:text-black hover:shadow-lg"
                        >
                          {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {/* Staff Info Display */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <p className="text-sm text-gray-900">{staff.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <p className="text-sm text-gray-900">{staff.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <p className="text-sm text-gray-900">{staff.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role
                        </label>
                        <p className="text-sm text-gray-900 capitalize">{staff.role}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Station
                        </label>
                        <p className="text-sm text-gray-900">{staff.station || "Not assigned"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            staff.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {staff.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2 bg-black text-white rounded-xl font-semibold text-sm shadow-md transition-all duration-100 hover:bg-white hover:text-black hover:shadow-lg flex items-center space-x-2"
                      >
                        <MdEdit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <motion.div
              className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirm Delete
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete this staff member? This action cannot be undone.
                </p>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default UpdateStaffModal;
