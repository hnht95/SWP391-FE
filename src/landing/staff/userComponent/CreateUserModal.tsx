import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdLock,
  MdClose,
  MdCheckCircle,
} from "react-icons/md";

import type {
  CreateUserForm,
  RawApiUser,
  User,
} from "../../../types/userTypes";
import { register } from "../../../service/apiUser/auth/API";
import staffAPI from "../../../service/apiStaff/API";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUsers: User[], total: number) => void;
  currentPage: number;
  pageSize: number;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPage,
  pageSize,
}) => {
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    name: "",
    email: "",
    phone: "",
    gender: "male",
    password: "",
    confirmPassword: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  // Validate password strength
  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!/[A-Z]/.test(password)) {
      return "Mật khẩu phải có ít nhất 1 chữ HOA";
    }
    if (!/[a-z]/.test(password)) {
      return "Mật khẩu phải có ít nhất 1 chữ thường";
    }
    if (!/[0-9]/.test(password)) {
      return "Mật khẩu phải có ít nhất 1 số";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
    }
    return null;
  };

  // Validate phone number
  const validatePhone = (phone: string): string | null => {
    if (!/^0\d{9}$/.test(phone)) {
      return "Số điện thoại phải có 10 số và bắt đầu bằng 0";
    }
    return null;
  };

  // Validate email
  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Email không hợp lệ";
    }
    return null;
  };

  const handleCreateSubmit: React.FormEventHandler<HTMLFormElement> = async (
    e
  ) => {
    e.preventDefault();
    setCreateError(null);

    // Validate all required fields
    if (!createForm.name || !createForm.email || !createForm.phone) {
      setCreateError("Vui lòng nhập đầy đủ họ tên, email và số điện thoại.");
      return;
    }

    // Validate email
    const emailError = validateEmail(createForm.email);
    if (emailError) {
      setCreateError(emailError);
      return;
    }

    // Validate phone
    const phoneError = validatePhone(createForm.phone);
    if (phoneError) {
      setCreateError(phoneError);
      return;
    }

    // Validate password
    const passwordError = validatePassword(createForm.password);
    if (passwordError) {
      setCreateError(passwordError);
      return;
    }

    if (createForm.password !== createForm.confirmPassword) {
      setCreateError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setCreating(true);
      // Call register API
      await register({
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        phone: createForm.phone,
        gender: createForm.gender,
      });

      // Refresh users list with renters only
      const data = await staffAPI.getRenters({
        page: currentPage,
        limit: pageSize,
      });
      const mapped = (data.items || []).map((u: RawApiUser) => ({
        id: u._id,
        avatar: u.avatarUrl,
        name: u.name,
        email: u.email,
        phone: u.phone,
        type: u.role || "regular",
        createdAt: u.createdAt || "",
        updatedAt: u.updatedAt || "",
        status: u.isActive ? "active" : "locked",
        gender: u.gender,
        station: u.station,
        kyc: u.kyc,
        defaultRefundWallet: u.defaultRefundWallet,
        cccd: u.cccd,
        rentalCount: u.rentalCount || 0,
        revenue: u.revenue || 0,
        feedback: u.feedback,
      }));
      onSuccess(mapped, data.total || 0);

      // Reset form
      setCreateForm({
        name: "",
        email: "",
        phone: "",
        gender: "male",
        password: "",
        confirmPassword: "",
      });

      // Show success popup
      setShowSuccess(true);

      // Auto close after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 3000);
    } catch (error: unknown) {
      console.error("Create user error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Không thể tạo tài khoản.";
      setCreateError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <MdCheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Tạo tài khoản thành công!
              </h3>
              <p className="text-gray-600">
                Tài khoản mới đã được tạo và thêm vào danh sách người dùng.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl max-w-[700px] w-full shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <div className="p-8 relative">
            <div className="absolute cursor-pointer right-0 top-0 p-4">
              <button
                type="button"
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create new account
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Already A Member?{" "}
              <button
                type="button"
                onClick={onClose}
                className="text-blue-600 hover:underline"
              >
                Log In
              </button>
            </p>
            <form className="space-y-4" onSubmit={handleCreateSubmit}>
              <div className="flex items-center justify-between gap-2">
                {" "}
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Họ tên
                  </label>
                  <div className="relative">
                    <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50"
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm((s) => ({ ...s, name: e.target.value }))
                      }
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50"
                      value={createForm.email}
                      onChange={(e) =>
                        setCreateForm((s) => ({ ...s, email: e.target.value }))
                      }
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <MdPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50"
                      value={createForm.phone}
                      onChange={(e) =>
                        setCreateForm((s) => ({ ...s, phone: e.target.value }))
                      }
                      required
                      placeholder="0901234567"
                    />
                  </div>
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Giới tính
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50"
                    value={createForm.gender}
                    onChange={(e) =>
                      setCreateForm((s) => ({
                        ...s,
                        gender: e.target.value as "male" | "female" | "other",
                      }))
                    }
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm((s) => ({
                        ...s,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Tối thiểu 6 ký tự, bao gồm chữ HOA, số và ký tự đặc biệt"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50"
                    value={createForm.confirmPassword}
                    onChange={(e) =>
                      setCreateForm((s) => ({
                        ...s,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Nhập lại mật khẩu"
                    required
                  />
                </div>
              </div>
              {createError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  {createError}
                </div>
              )}
              <motion.button
                type="submit"
                disabled={creating}
                className={`w-full py-3 rounded-lg transition-colors text-white font-semibold ${
                  creating
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-900 hover:bg-gray-800"
                }`}
                whileHover={{ scale: creating ? 1 : 1.02 }}
                whileTap={{ scale: creating ? 1 : 0.98 }}
              >
                {creating ? "Đang tạo..." : "Create account"}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default CreateUserModal;
