import React, { useState } from "react";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { motion, type Variants } from "framer-motion";
import AuthLayout from "../AuthLayout";
import { forgotPassword } from "../../service/apiUser/auth/API";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({ email: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ email: "" });

    const form = e.target as HTMLFormElement;
    const emailValue = (form.elements.namedItem("email") as HTMLInputElement)
      .value;

    // Validation
    if (!emailValue) {
      setErrors({ email: "Please enter your email address" });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(emailValue)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    // ✅ Real API call
    setIsLoading(true);
    try {
      const response = await forgotPassword(emailValue);

      console.log("✅ Forgot password response:", response);

      // ✅ Check response format
      if (response?.success) {
        // Success - show success screen
        setIsSubmitted(true);
        setEmail(emailValue);
      } else {
        // Handle unexpected response
        setErrors({
          email:
            response?.message ||
            "Failed to send reset email. Please try again.",
        });
      }
    } catch (error) {
      console.error("❌ Forgot password error:", error);

      // Handle error
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send reset email. Please try again.";

      setErrors({ email: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      const response = await forgotPassword(email);

      if (response?.success) {
        alert("Password reset email has been resent!");
      } else {
        alert("Failed to resend email. Please try again.");
      }
    } catch (error) {
      console.error("❌ Resend error:", error);
      alert("Failed to resend email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const inputVariants: Variants = {
    initial: {
      opacity: 0,
      x: -20,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const successVariants: Variants = {
    initial: {
      opacity: 0,
      scale: 0.8,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.68, -0.55, 0.265, 1.55],
      },
    },
  };

  // Success screen content
  if (isSubmitted) {
    return (
      <AuthLayout
        subtitle="We've sent a reset OTP to your email"
        bottomText="Remember your password?"
        bottomLink="/login"
        bottomLinkText="Back to Sign In"
        animationKey="forgot-success"
      >
        <motion.div
          variants={successVariants}
          initial="initial"
          animate="animate"
          className="w-full text-center space-y-6"
        >
          {/* Success Icon */}
          <motion.div
            className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <FaEnvelope className="text-2xl text-green-600" />
          </motion.div>

          {/* Success Message */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-black">
              OTP Sent Successfully!
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              We've sent a password reset OTP to <br />
              <span className="font-medium text-black">{email}</span>
            </p>
            <p className="text-xs text-gray-500">
              Please check your inbox and use the OTP to reset your password.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <motion.button
              onClick={handleResendEmail}
              disabled={isLoading}
              className={`w-full font-semibold py-4 lg:py-2 xl:py-4 px-6 rounded-lg transition duration-200 ${
                isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-100 text-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              }`}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? "Sending..." : "Resend OTP"}
            </motion.button>

            <motion.a
              href="/login"
              className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-black transition duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaArrowLeft className="mr-2" />
              Back to Sign In
            </motion.a>
          </div>
        </motion.div>
      </AuthLayout>
    );
  }

  // Main forgot password form
  return (
    <AuthLayout
      subtitle="Enter your email to reset your password"
      bottomText="Remember your password?"
      bottomLink="/login"
      bottomLinkText="Back to Sign In"
      animationKey="forgot-password"
    >
      <motion.form
        className="w-full space-y-4"
        onSubmit={handleSubmit}
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {/* Instructions */}
        <motion.div variants={inputVariants} className="text-center mb-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Don't worry! It happens. Please enter the email address associated
            with your account.
          </p>
        </motion.div>

        {/* Email Field */}
        <motion.div variants={inputVariants}>
          <label className="text-sm font-medium text-black select-none">
            Email Address
          </label>
          <motion.div
            className={`relative mt-1 justify-between p-2 flex items-center border rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white ${
              errors.email
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-black focus:border-black"
            }`}
            whileFocus={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FaEnvelope size={20} className="text-gray-500 lg:mr-2 xl:mr-0" />
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-[92%] p-1 lg:p-0 xl:p-1 lg:text-sm xl:text-md focus:outline-none bg-white"
              placeholder="Enter your email address"
              autoComplete="email"
              onFocus={() => setErrors({ email: "" })}
            />
          </motion.div>
          {errors.email && (
            <motion.p
              className="text-red-500 text-xs mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.email}
            </motion.p>
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          className={`w-full select-none font-semibold py-4 lg:py-2 xl:py-4 px-6 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transform transition duration-200 ${
            isLoading
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800 hover:-translate-y-0.5"
          }`}
          variants={inputVariants}
          whileHover={
            !isLoading
              ? {
                  scale: 1.02,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                }
              : {}
          }
          whileTap={!isLoading ? { scale: 0.98 } : {}}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {isLoading ? (
            <motion.div
              className="flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              <span className="ml-2">Sending...</span>
            </motion.div>
          ) : (
            "Send Reset OTP"
          )}
        </motion.button>

        {/* Back Link */}
        <motion.div
          variants={inputVariants}
          className="flex items-center justify-center pt-2"
        >
          <motion.a
            href="/login"
            className="flex items-center text-sm text-gray-600 hover:text-black transition duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowLeft className="mr-2" />
            Back to Sign In
          </motion.a>
        </motion.div>
      </motion.form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
