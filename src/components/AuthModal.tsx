import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { login } from "../service/apiUser/auth/API";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  message = "Please login to continue",
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ username: "", password: "" });

    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem("username") as HTMLInputElement)
      .value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    let hasError = false;
    const newErrors = { username: "", password: "" };

    if (!username) {
      newErrors.username = "Please enter your username or email";
      hasError = true;
    }

    if (!password) {
      newErrors.password = "Please enter your password";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await login(username, password);

      if (response?.success && response?.data) {
        const { token, user } = response.data;

        if (token && user) {
          authLogin({ token, user });
          onClose();
          if (onSuccess) {
            onSuccess();
          }
        } else {
          setErrors({
            username: "",
            password: "Invalid login response - missing token or user data",
          });
        }
      } else {
        setErrors({
          username: "",
          password: "Login failed - invalid response",
        });
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || "Login failed";
      setErrors({
        username: "",
        password: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoToSignup = () => {
    onClose();
    navigate("/signup");
  };

  const handleGoToLogin = () => {
    onClose();
    navigate("/login");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-gray-900 to-black text-white p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              >
                <FaTimes size={20} />
              </button>
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Login Required</h2>
                <p className="text-gray-300 text-sm">{message}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="text-sm font-medium text-black">
                    Email or Username
                  </label>
                  <div
                    className={`relative mt-1 p-3 flex items-center border rounded-lg transition duration-200 bg-white ${
                      errors.username
                        ? "border-red-500 focus-within:ring-red-500 focus-within:border-red-500"
                        : "border-gray-300 focus-within:ring-2 focus-within:ring-black focus-within:border-black"
                    }`}
                  >
                    <FaUser size={18} className="text-gray-500 mr-3" />
                    <input
                      name="username"
                      className="flex-1 focus:outline-none bg-white"
                      placeholder="Enter your email or username"
                      autoComplete="username"
                      onFocus={() =>
                        setErrors((prev) => ({ ...prev, username: "" }))
                      }
                    />
                  </div>
                  {errors.username && (
                    <motion.p
                      className="text-red-500 text-xs mt-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.username}
                    </motion.p>
                  )}
                </motion.div>

                {/* Password Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="text-sm font-medium text-black">
                    Password
                  </label>
                  <div
                    className={`relative mt-1 p-3 flex items-center border rounded-lg transition duration-200 bg-white ${
                      errors.password
                        ? "border-red-500 focus-within:ring-red-500 focus-within:border-red-500"
                        : "border-gray-300 focus-within:ring-2 focus-within:ring-black focus-within:border-black"
                    }`}
                  >
                    <FaLock size={18} className="text-gray-500 mr-3" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className="flex-1 focus:outline-none bg-white"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      onFocus={() =>
                        setErrors((prev) => ({ ...prev, password: "" }))
                      }
                    />
                    <button
                      type="button"
                      className="text-gray-500 hover:text-black transition duration-200 ml-2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FaEyeSlash size={18} />
                      ) : (
                        <FaEye size={18} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      className="text-red-500 text-xs mt-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </motion.div>

                {/* Buttons */}
                <div className="space-y-3 pt-4">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className={`w-full font-semibold py-3 px-6 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transform transition duration-200 ${
                      loading
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-black text-white hover:bg-gray-800 hover:-translate-y-0.5"
                    }`}
                    whileHover={
                      loading
                        ? {}
                        : {
                            scale: 1.02,
                            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                          }
                    }
                    whileTap={loading ? {} : { scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </motion.button>

                  <div className="flex space-x-3">
                    <motion.button
                      type="button"
                      onClick={handleGoToLogin}
                      className="flex-1 bg-gray-100 text-black font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      Full Login Page
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleGoToSignup}
                      className="flex-1 bg-gray-100 text-black font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      Sign Up
                    </motion.button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
