import React, { useEffect, useMemo, useState } from "react";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { motion, type Variants } from "framer-motion";
import AuthLayout from "../AuthLayout";
import { forgotPassword, resetPassword } from "../../service/apiUser/auth/API";

/* Local loading dots component (bouncing) */
const LoadingDots: React.FC<{ color?: string }> = ({ color = "bg-white" }) => (
  <div className="flex items-center gap-1">
    <span className={`w-2 h-2 rounded-full ${color}`} />
    <span className={`w-2 h-2 rounded-full ${color}`} />
    <span className={`w-2 h-2 rounded-full ${color}`} />
    <style jsx>{`
      div > span {
        animation: bounce 0.9s infinite ease-in-out;
      }
      div > span:nth-child(2) {
        animation-delay: 0.15s;
      }
      div > span:nth-child(3) {
        animation-delay: 0.3s;
      }
      @keyframes bounce {
        0%,
        80%,
        100% {
          transform: translateY(0);
          opacity: 0.6;
        }
        40% {
          transform: translateY(-6px);
          opacity: 1;
        }
      }
    `}</style>
  </div>
);

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [errors, setErrors] = useState<{
    email?: string;
    code?: string;
    newPassword?: string;
    confirm?: string;
    common?: string;
  }>({});

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastResendAt, setLastResendAt] = useState<number>(0);

  // OTP: 6 inputs
  const [otpDigits, setOtpDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const otpValue = useMemo(() => otpDigits.join(""), [otpDigits]);

  // New password
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [showPass, setShowPass] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [resetDone, setResetDone] = useState<boolean>(false);

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const passStrong = useMemo(
    () => /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(newPassword),
    [newPassword]
  );

  // Focus OTP first box when in submitted screen
  useEffect(() => {
    if (isSubmitted) {
      const el = document.getElementById("otp-0") as HTMLInputElement | null;
      el?.focus();
    }
  }, [isSubmitted]);

  // Framer variants
  const inputVariants: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  const successVariants: Variants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.68, -0.55, 0.265, 1.55] },
    },
  };

  // OTP handlers
  const handleOtpChange = (index: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(0, 1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });
    if (v && index < 5) {
      const nextEl = document.getElementById(
        `otp-${index + 1}`
      ) as HTMLInputElement | null;
      nextEl?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevEl = document.getElementById(
        `otp-${index - 1}`
      ) as HTMLInputElement | null;
      prevEl?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      const prevEl = document.getElementById(
        `otp-${index - 1}`
      ) as HTMLInputElement | null;
      prevEl?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      const nextEl = document.getElementById(
        `otp-${index + 1}`
      ) as HTMLInputElement | null;
      nextEl?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData
      .getData("text/plain")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!text) return;
    const arr = text.split("");
    setOtpDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < 6; i += 1) next[i] = arr[i] || "";
      return next;
    });
    const focusTo = Math.min(text.length, 5);
    const el = document.getElementById(
      `otp-${focusTo}`
    ) as HTMLInputElement | null;
    el?.focus();
  };

  // Submit email
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!email) return setErrors({ email: "Please enter your email address" });
    if (!emailValid)
      return setErrors({ email: "Please enter a valid email address" });

    setIsLoading(true);
    try {
      const response = await forgotPassword(email);
      if (response?.success) {
        setIsSubmitted(true);
      } else {
        setErrors({
          email:
            response?.message ||
            "Failed to send reset email. Please try again.",
        });
      }
    } catch (error) {
      setErrors({
        email:
          error instanceof Error
            ? error.message
            : "Failed to send reset email. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendEmail = async () => {
    if (!email || !emailValid) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }
    const now = Date.now();
    if (now - lastResendAt < 20000) {
      alert("Please wait a few seconds before resending.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await forgotPassword(email);
      if (response?.success) {
        setLastResendAt(now);
        alert("Password reset email has been resent!");
      } else {
        alert(response?.message || "Failed to resend email. Please try again.");
      }
    } catch {
      alert("Failed to resend email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password with OTP
  const handleReset = async () => {
    setErrors({});
    if (!otpValue || otpValue.length !== 6) {
      setErrors({ code: "Please enter the 6-digit OTP sent to your email" });
      return;
    }
    if (!newPassword) {
      setErrors({ newPassword: "Please enter a new password" });
      return;
    }
    if (!passStrong) {
      setErrors({
        newPassword:
          "Password must be at least 8 chars, include uppercase, lowercase and a number",
      });
      return;
    }
    if (confirm !== newPassword) {
      setErrors({ confirm: "Passwords do not match" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(email, otpValue, newPassword);
      if (res?.success) {
        setResetDone(true);
      } else {
        setErrors({
          common: res?.message || "Failed to reset password. Please try again.",
        });
      }
    } catch (e) {
      setErrors({
        common: e instanceof Error ? e.message : "Failed to reset password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Success screen with OTP + New pass
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
          className="w-full space-y-6"
        >
          {/* Icon */}
          <motion.div
            className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <FaEnvelope className="text-2xl text-green-600" />
          </motion.div>

          {/* Text */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-black">
              OTP Sent Successfully!
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              We've sent a password reset OTP to <br />
              <span className="font-medium text-black">{email}</span>
            </p>
            <p className="text-xs text-gray-500">
              Enter the OTP and your new password below.
            </p>
          </div>

          {/* OTP 6 inputs */}
          <div>
            <label className="text-sm font-medium text-black select-none">
              OTP Code
            </label>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {otpDigits.map((d, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  className={`h-11 text-center text-lg rounded-lg border ${
                    errors.code
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-gray-300 focus:ring-2 focus:ring-black"
                  }`}
                  aria-invalid={!!errors.code}
                />
              ))}
            </div>
            {errors.code && (
              <p className="text-red-500 text-xs mt-1">{errors.code}</p>
            )}
          </div>

          {/* New password */}
          <div>
            <label
              htmlFor="newPassword"
              className="text-sm font-medium text-black select-none"
            >
              New Password
            </label>
            <div
              className={`mt-1 flex items-center border rounded-lg px-3 ${
                errors.newPassword
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300 focus-within:ring-2 focus-within:ring-black"
              }`}
            >
              <input
                id="newPassword"
                type={showPass ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full py-2 text-sm focus:outline-none"
                placeholder="At least 8 chars, upper, lower, number"
                autoComplete="new-password"
                aria-invalid={!!errors.newPassword}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="text-xs text-gray-600 hover:text-black ml-2"
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm */}
          <div>
            <label
              htmlFor="confirm"
              className="text-sm font-medium text-black select-none"
            >
              Confirm Password
            </label>
            <div
              className={`mt-1 flex items-center border rounded-lg px-3 ${
                errors.confirm
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300 focus-within:ring-2 focus-within:ring-black"
              }`}
            >
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full py-2 text-sm focus:outline-none"
                placeholder="Re-enter your new password"
                autoComplete="new-password"
                aria-invalid={!!errors.confirm}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="text-xs text-gray-600 hover:text-black ml-2"
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
            {errors.confirm && (
              <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>
            )}
          </div>

          {/* Error common */}
          {errors.common && (
            <p className="text-red-600 text-xs">{errors.common}</p>
          )}

          {/* Actions */}
          {!resetDone ? (
            <motion.button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className={`w-full font-semibold py-3 px-6 rounded-lg transition ${
                isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingDots />
                  <span>Processing...</span>
                </div>
              ) : (
                "Reset Password"
              )}
            </motion.button>
          ) : (
            <div className="text-center">
              <p className="text-green-700 text-sm font-medium">
                Password changed successfully.
              </p>
              <a
                href="/login"
                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
              >
                Go to Sign In
              </a>
            </div>
          )}

          {/* Resend + back */}
          <div className="flex flex-col gap-3 mt-3">
            <motion.button
              type="button"
              onClick={handleResendEmail}
              disabled={isLoading}
              className={`w-full font-semibold py-3 px-6 rounded-lg transition ${
                isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-100 text-black hover:bg-gray-200"
              }`}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingDots color="bg-black" />
                  <span>Sending...</span>
                </div>
              ) : (
                "Resend OTP"
              )}
            </motion.button>

            <div className="flex items-center justify-center">
              <a
                href="/login"
                className="flex items-center text-sm text-gray-600 hover:text-black"
              >
                <FaArrowLeft className="mr-2" />
                Back to Sign In
              </a>
            </div>
          </div>
        </motion.div>
      </AuthLayout>
    );
  }

  // Initial email form
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
        variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        noValidate
      >
        <motion.div variants={inputVariants} className="text-center mb-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Don't worry! It happens. Please enter the email address associated
            with your account.
          </p>
        </motion.div>

        <motion.div variants={inputVariants}>
          <label
            htmlFor="email"
            className="text-sm font-medium text-black select-none"
          >
            Email Address
          </label>
          <div
            className={`relative mt-1 justify-between p-2 flex items-center border rounded-lg bg-white ${
              errors.email
                ? "border-red-500 ring-1 ring-red-500"
                : "border-gray-300 focus-within:ring-2 focus-within:ring-black"
            }`}
          >
            <FaEnvelope size={20} className="text-gray-500 lg:mr-2 xl:mr-0" />
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-[92%] p-1 lg:p-0 xl:p-1 lg:text-sm xl:text-md focus:outline-none bg-white"
              placeholder="Enter your email address"
              autoComplete="email"
              onFocus={() => setErrors({})}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              required
            />
          </div>
          {errors.email && (
            <motion.p
              id="email-error"
              className="text-red-500 text-xs mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
            >
              {errors.email}
            </motion.p>
          )}
        </motion.div>

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
              ? { scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }
              : {}
          }
          whileTap={!isLoading ? { scale: 0.98 } : {}}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <LoadingDots />
              <span>Sending...</span>
            </div>
          ) : (
            "Send Reset OTP"
          )}
        </motion.button>

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
