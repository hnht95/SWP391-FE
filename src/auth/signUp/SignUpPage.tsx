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

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: "",
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
    const terms = (form.elements.namedItem("terms") as HTMLInputElement)
      .checked;

    // Validation logic...
    let hasError = false;
    const newErrors = {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: "",
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

    if (!terms) {
      newErrors.terms = "Please agree to terms and conditions";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    alert(`Account created successfully for ${fullName}!`);
  };

  const inputVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <AuthLayout
      subtitle="Join Zami for amazing car rental experience"
      bottomText="Already have an account?"
      bottomLink="/login"
      bottomLinkText="Sign in here"
      animationKey="signup" // Key để trigger animation
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
        {/* Full Name Field */}
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

        {/* Email Field */}
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

        {/* Phone Field */}
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

        {/* Password Field */}
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

        {/* Confirm Password Field */}
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

        {/* Sign Up Button */}
        <motion.button
          type="submit"
          className="w-full select-none bg-black text-white font-semibold py-4 lg:py-2 xl:py-4 px-6 rounded-lg shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transform hover:-translate-y-0.5 transition duration-200"
          variants={{
            initial: { opacity: 0 },
            animate: {
              opacity: 1,
              transition: { duration: 0.3 },
            },
          }}
        >
          Create Account
        </motion.button>
      </motion.form>
    </AuthLayout>
  );
};

export default SignUpPage;
