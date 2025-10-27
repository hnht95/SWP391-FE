import React, { useState } from "react";
import { motion } from "framer-motion";
import { MdPerson, MdEmail, MdPhone, MdLock, MdClose } from "react-icons/md";
import { register } from "../../../service/apiUser/auth/API";
import type {
  CreateUserForm,
  RawApiUser,
  User,
} from "../../../types/userTypes";

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
    gender: "female",
    password: "",
    confirmPassword: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateSubmit: React.FormEventHandler<HTMLFormElement> = async (
    e
  ) => {
    e.preventDefault();
    setCreateError(null);

    // Simple validation
    if (!createForm.name || !createForm.email || !createForm.phone) {
      setCreateError("Vui lòng nhập đầy đủ họ tên, email và số điện thoại.");
      return;
    }
    // Validate phone: 10 số
    if (!/^\d{10}$/.test(createForm.phone)) {
      setCreateError("Số điện thoại phải có đúng 10 chữ số.");
      return;
    }
    if (!createForm.password || createForm.password.length < 6) {
      setCreateError("Mật khẩu tối thiểu 6 ký tự.");
      return;
    }
    if (createForm.password !== createForm.confirmPassword) {
      setCreateError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setCreating(true);
      // Call register API (same payload as normal signup)
      await register({
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        phone: createForm.phone,
        gender: createForm.gender,
      });

      // Refresh users list after creation
      const { getAllUsers } = await import("../../../service/apiUser/auth/API");
      const data = await getAllUsers({ page: currentPage, limit: pageSize });
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

      // Reset and close
      setCreateForm({
        name: "",
        email: "",
        phone: "",
        gender: "female",
        password: "",
        confirmPassword: "",
      });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Create failed";
      setCreateError(message);
    } finally {
      setCreating(false);
    }
  };

  return (
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
  );
};

export default CreateUserModal;
