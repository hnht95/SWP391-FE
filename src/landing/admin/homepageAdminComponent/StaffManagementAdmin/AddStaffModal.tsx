import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdPerson, MdEmail, MdLock, MdPhone, MdWork, MdVisibility, MdVisibilityOff, MdLocationOn } from "react-icons/md";
import { staffManagementAPI } from "../../../../service/apiAdmin/StaffManagementAPI";
import StationDropdown from "./StationDropdown";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  gender: string;
  station: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  gender?: string;
  station?: string;
}

const AddStaffModal: React.FC<AddStaffModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "male",
    station: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name can only contain letters and spaces";
    } else if (formData.name.trim().includes('  ')) {
      newErrors.name = "Name cannot contain consecutive spaces";
    } else if (formData.name.trim().includes('\t')) {
      newErrors.name = "Name cannot contain tabs";
    } else if (formData.name.trim().includes('-')) {
      newErrors.name = "Name cannot contain hyphens";
    } else if (formData.name.trim().includes('+')) {
      newErrors.name = "Name cannot contain plus signs";
    } else if (formData.name.trim().includes('(')) {
      newErrors.name = "Name cannot contain parentheses";
    } else if (formData.name.trim().includes(')')) {
      newErrors.name = "Name cannot contain parentheses";
    } else if (formData.name.trim().includes('.')) {
      newErrors.name = "Name cannot contain dots";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    } else if (formData.email.length > 100) {
      newErrors.email = "Email must be less than 100 characters";
    } else if (formData.email.includes(' ')) {
      newErrors.email = "Email cannot contain spaces";
    } else if (formData.email.includes('..')) {
      newErrors.email = "Email cannot contain tabs";
    } else if (formData.email.includes('-')) {
      newErrors.email = "Email cannot contain hyphens";
    } else if (formData.email.includes('+')) {
      newErrors.email = "Email cannot contain plus signs";
    } else if (formData.email.includes('(')) {
      newErrors.email = "Email cannot contain parentheses";
    
    }

    if (!formData.password) {
      newErrors.password = "Please enter password";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (formData.password.length > 50) {
      newErrors.password = "Password must be less than 50 characters";
    } else if (formData.password.includes(' ')) {
      newErrors.password = "Password cannot contain spaces";
    } else if (formData.password.includes('\t')) {
      newErrors.password = "Password cannot contain tabs";
    } else if (formData.password.includes('-')) {
      newErrors.password = "Password cannot contain hyphens";
    } else if (formData.password.includes('+')) {
      newErrors.password = "Password cannot contain plus signs";
    } else if (formData.password.includes('(')) {
      newErrors.password = "Password cannot contain parentheses";
    } else if (formData.password.includes(')')) {
      newErrors.password = "Password cannot contain parentheses";
    } else if (formData.password.includes('.')) {
      newErrors.password = "Password cannot contain dots";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Please enter phone number";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    } else if (!formData.phone.startsWith('0')) {
      newErrors.phone = "Phone number must start with 0";
    } else if (formData.phone.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    } else if (formData.phone.includes(' ')) {
      newErrors.phone = "Phone number cannot contain spaces";
    } else if (formData.phone.includes('\t')) {
      newErrors.phone = "Phone number cannot contain tabs";
    } else if (formData.phone.includes('-')) {
      newErrors.phone = "Phone number cannot contain hyphens";
    } else if (formData.phone.includes('+')) {
      newErrors.phone = "Phone number cannot contain plus signs";
    } else if (formData.phone.includes('(')) {
      newErrors.phone = "Phone number cannot contain parentheses";
    } else if (formData.phone.includes(')')) {
      newErrors.phone = "Phone number cannot contain parentheses";
    } else if (formData.phone.includes('.')) {
      newErrors.phone = "Phone number cannot contain dots";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select gender";
    } else if (!["male", "female"].includes(formData.gender)) {
      newErrors.gender = "Gender must be male or female";
    }

    if (!formData.station.trim()) {
      newErrors.station = "Please enter station ID";
    } else if (formData.station.trim().length < 10) {
      newErrors.station = "Station ID must be at least 10 characters";
    } else if (formData.station.trim().length > 50) {
      newErrors.station = "Station ID must be less than 50 characters";
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.station.trim())) {
      newErrors.station = "Station ID can only contain letters and numbers";
    } else if (formData.station.trim().includes(' ')) {
      newErrors.station = "Station ID cannot contain spaces";
    } else if (formData.station.trim().includes('\t')) {
      newErrors.station = "Station ID cannot contain tabs";
    } else if (formData.station.trim().includes('-')) {
      newErrors.station = "Station ID cannot contain hyphens";
    } else if (formData.station.trim().includes('+')) {
      newErrors.station = "Station ID cannot contain plus signs";
    } else if (formData.station.trim().includes('(')) {
      newErrors.station = "Station ID cannot contain parentheses";
    } else if (formData.station.trim().includes(')')) {
      newErrors.station = "Station ID cannot contain parentheses";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Remove confirmPassword from data before sending to API
      const { confirmPassword, ...dataToSend } = formData;
      
      await staffManagementAPI.createStaff({
        ...dataToSend,
        gender: dataToSend.gender as "male" | "female"
      });
      
      // Success - Close this modal first, then show success modal
      handleClose();
      // Trigger success callback after a short delay to ensure modal closes first
      setTimeout(() => {
        onSuccess();
      }, 100);
    } catch (error: any) {
      console.error("Error adding staff:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      // Handle specific errors
      if (error.response?.data?.error && error.response.data.error.includes("Email already exists")) {
        setErrors({ email: "This email is already in use" });
      } else if (error.response?.data?.message && error.response.data.message.includes("Email already exists")) {
        setErrors({ email: "This email is already in use" });
      } else {
        alert(error.response?.data?.error || error.response?.data?.message || "An error occurred. Please try again!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      gender: "male",
      station: "",
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };


  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Full screen */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal Container - Centered */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
            >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
              <div className="flex items-center space-x-2.5">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                  <MdPerson className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Add New Staff</h2>
                  <p className="text-xs text-gray-500">Fill in the staff information below</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all duration-200"
              >
                <MdClose className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
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
                      errors.name ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-gray-50/50"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                    placeholder="Enter full name"
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
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
                      errors.email ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-gray-50/50"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                    placeholder="Enter email"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MdLock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-11 py-2 text-sm border ${
                      errors.password ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-gray-50/50"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <MdVisibilityOff className="w-4 h-4" />
                    ) : (
                      <MdVisibility className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MdLock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-11 py-2 text-sm border ${
                      errors.confirmPassword ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-gray-50/50"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                    placeholder="Re-enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showConfirmPassword ? (
                      <MdVisibilityOff className="w-4 h-4" />
                    ) : (
                      <MdVisibility className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
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
                      errors.phone ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-gray-50/50"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                    placeholder="Enter phone number (10 digits)"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MdWork className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                </div>
                {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
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
                {errors.station && <p className="mt-1 text-xs text-red-500">{errors.station}</p>}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 mt-1 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2 border border-gray-200 text-gray-600 bg-white rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md text-sm"
                >
                  {isSubmitting ? "Adding..." : "Add Staff"}
                </button>
              </div>
            </form>
            </motion.div>
          </div>

        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AddStaffModal;

