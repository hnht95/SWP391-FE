import React, { useState } from "react";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { motion } from "framer-motion";
import AuthLayout from "../AuthLayout";
import SuccessModal from "../../components/SuccessModal";

import { useNavigate } from "react-router-dom";
import { register } from "../../service/apiUser/API";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [gender, setGender] = useState("male");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredUserName, setRegisteredUserName] = useState("");
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      gender: "",
    });

    const form = e.target as HTMLFormElement;
    const fullName = (form.elements.namedItem("fullName") as HTMLInputElement)
      .value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    const confirmPassword = (
      form.elements.namedItem("confirmPassword") as HTMLInputElement
    ).value;

    // Validation logic...
    let hasError = false;
    const newErrors = {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      gender: "",
    };

    if (!fullName) {
      newErrors.fullName = "Please enter your full name";
      hasError = true;
    }

    if (!email) {
      newErrors.email = "Please enter your email";
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
      hasError = true;
    }

    if (!phone) {
      newErrors.phone = "Please enter your phone number";
      hasError = true;
    }

    if (!password) {
      newErrors.password = "Please enter your password";
      hasError = true;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      hasError = true;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      hasError = true;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const userData = {
        name: fullName,
        email,
        password,
        phone,
        gender,
      };

      await register(userData);

      // Hiển thị success modal thay vì alert
      setRegisteredUserName(fullName);
      setShowSuccessModal(true);
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || "Registration failed";
      setErrors({
        fullName: "",
        email: errorMessage,
        phone: "",
        password: "",
        confirmPassword: "",
        gender: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <>
      <AuthLayout
        subtitle="Join Zami for amazing car rental experience"
        bottomText="Already have an account?"
        bottomLink="/login"
        bottomLinkText="Sign in here"
        animationKey="signup"
      >
        <motion.form
          className="w-full space-y-4"
          onSubmit={handleSubmit}
          initial="initial"
          animate="animate"
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          <motion.div variants={inputVariants}>
            <label className="text-sm font-medium text-black select-none">
              Full Name
            </label>
            <div
              className={`relative mt-1 justify-between p-2 flex items-center border rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white ${
                errors.fullName
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-black focus:border-black"
              }`}
            >
              <FaUser size={20} className="text-gray-500 lg:mr-2 xl:mr-0" />
              <input
                name="fullName"
                className="w-[92%] p-1 lg:p-0 xl:p-1 lg:text-sm xl:text-md focus:outline-none bg-white"
                placeholder="Enter your full name"
                autoComplete="name"
                onFocus={() => setErrors((prev) => ({ ...prev, fullName: "" }))}
              />
            </div>
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
            )}
          </motion.div>

          <motion.div variants={inputVariants}>
            <label className="text-sm font-medium text-black select-none">
              Email Address
            </label>
            <div
              className={`relative mt-1 justify-between p-2 flex items-center border rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white ${
                errors.email
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-black focus:border-black"
              }`}
            >
              <FaEnvelope size={20} className="text-gray-500 lg:mr-2 xl:mr-0" />
              <input
                name="email"
                type="email"
                className="w-[92%] p-1 lg:p-0 xl:p-1 lg:text-sm xl:text-md focus:outline-none bg-white"
                placeholder="Enter your email address"
                autoComplete="email"
                onFocus={() => setErrors((prev) => ({ ...prev, email: "" }))}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </motion.div>

          <motion.div variants={inputVariants}>
            <label className="text-sm font-medium text-black select-none">
              Phone Number
            </label>
            <div
              className={`relative mt-1 justify-between p-2 flex items-center border rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white ${
                errors.phone
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-black focus:border-black"
              }`}
            >
              <FaPhone size={20} className="text-gray-500 lg:mr-2 xl:mr-0" />
              <input
                name="phone"
                type="tel"
                className="w-[92%] p-1 lg:p-0 xl:p-1 lg:text-sm xl:text-md focus:outline-none bg-white"
                placeholder="Enter your phone number"
                autoComplete="tel"
                onFocus={() => setErrors((prev) => ({ ...prev, phone: "" }))}
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </motion.div>

          <motion.div variants={inputVariants}>
            <label className="text-sm font-medium select-none text-black">
              Password
            </label>
            <div
              className={`relative mt-1 justify-between p-2 flex items-center border rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white ${
                errors.password
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-black focus:border-black"
              }`}
            >
              <FaLock size={20} className="text-gray-500 lg:mr-2 xl:mr-0" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                className="w-[85%] p-1 lg:p-0 xl:p-1 lg:text-sm xl:text-md focus:outline-none bg-white"
                placeholder="Create a password"
                autoComplete="new-password"
                onFocus={() => setErrors((prev) => ({ ...prev, password: "" }))}
              />
              <button
                type="button"
                className="text-gray-500 hover:text-black transition duration-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </motion.div>

          <motion.div variants={inputVariants}>
            <label className="text-sm font-medium select-none text-black">
              Confirm Password
            </label>
            <div
              className={`relative mt-1 justify-between p-2 flex items-center border rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white ${
                errors.confirmPassword
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-black focus:border-black"
              }`}
            >
              <FaLock size={20} className="text-gray-500 lg:mr-2 xl:mr-0" />
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="w-[85%] p-1 lg:p-0 xl:p-1 lg:text-sm xl:text-md focus:outline-none bg-white"
                placeholder="Confirm your password"
                autoComplete="new-password"
                onFocus={() =>
                  setErrors((prev) => ({ ...prev, confirmPassword: "" }))
                }
              />
              <button
                type="button"
                className="text-gray-500 hover:text-black transition duration-200"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash size={20} />
                ) : (
                  <FaEye size={20} />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </motion.div>

          <motion.div variants={inputVariants}>
            <label className="text-sm font-medium select-none text-black">
              Gender
            </label>
            <div className="mt-2 flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === "male"}
                  onChange={(e) => setGender(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Male</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === "female"}
                  onChange={(e) => setGender(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Female</span>
              </label>
            </div>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
            )}
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full select-none font-semibold py-4 lg:py-2 xl:py-4 px-6 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transform transition duration-200 ${
              loading
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800 hover:-translate-y-0.5"
            }`}
            variants={{
              initial: { opacity: 0 },
              animate: {
                opacity: 1,
                transition: { duration: 0.3 },
              },
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </motion.button>
        </motion.form>
      </AuthLayout>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        onLoginClick={handleLoginClick}
        userName={registeredUserName}
        autoCloseDelay={10000}
      />
    </>
  );
};

export default SignUpPage;
