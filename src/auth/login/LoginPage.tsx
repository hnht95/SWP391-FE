import { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../AuthLayout";

const VALID_USERS = [
  { username: "admin", password: "123456" },
  { username: "user@example.com", password: "password" },
  { username: "test", password: "test123" },
];

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
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

    const validUser = VALID_USERS.find(
      (user) => user.username === username && user.password === password
    );

    if (validUser) {
      // Chuyển về trang chủ sau khi đăng nhập thành công
      navigate('/');
    } else {
      const userExists = VALID_USERS.find((user) => user.username === username);

      if (userExists) {
        newErrors.password = "Incorrect password";
      } else {
        newErrors.username = "Username or email not found";
      }
      setErrors(newErrors);
    }
  };

  // Animation variants cho form inputs
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
      subtitle="Welcome to Zami"
      bottomText="Don't have an account?"
      bottomLink="/signup"
      bottomLinkText="Sign up now"
      animationKey="login"
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
        {/* Username Field */}
        <motion.div variants={inputVariants}>
          <label className="text-sm font-medium text-black select-none">
            Email or Username
          </label>
          <motion.div
            className={`relative mt-1 justify-between p-2 flex items-center border rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white ${
              errors.username
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-black focus:border-black"
            }`}
            whileFocus={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FaUser size={20} className="text-gray-500 lg:mr-2 xl:mr-0" />
            <input
              name="username"
              className="w-[92%] p-1 lg:p-0 xl:p-1 lg:text-sm xl:text-md focus:outline-none bg-white"
              placeholder="Enter your email or username"
              autoComplete="username"
              onFocus={() => setErrors((prev) => ({ ...prev, username: "" }))}
            />
          </motion.div>
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
        <motion.div variants={inputVariants}>
          <label className="text-sm font-medium select-none text-black">
            Password
          </label>
          <motion.div
            className={`relative mt-1 justify-between p-2 flex items-center border rounded-lg focus:outline-none focus:ring-2 transition duration-200 bg-white ${
              errors.password
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-black focus:border-black"
            }`}
            whileFocus={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FaLock size={20} className="text-gray-500 lg:mr-2 xl:mr-0" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              className="w-[85%] p-1 lg:p-0 xl:p-1 lg:text-sm xl:text-md focus:outline-none bg-white"
              placeholder="Enter your password"
              autoComplete="current-password"
              onFocus={() => setErrors((prev) => ({ ...prev, password: "" }))}
            />
            <motion.button
              type="button"
              className="text-gray-500 hover:text-black transition duration-200"
              onClick={() => setShowPassword(!showPassword)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </motion.button>
          </motion.div>
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

        {/* Forgot Password */}
        <motion.div
          variants={inputVariants}
          className="flex items-center justify-between select-none"
        >
          <motion.a
            href="/forgot-password"
            className="text-sm ml-auto text-black hover:text-gray-700 underline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Forgot password?
          </motion.a>
        </motion.div>

        {/* Sign In Button */}
        <motion.button
          type="submit"
          className="w-full select-none bg-black text-white font-semibold py-4 lg:py-2 xl:py-4 px-6 rounded-lg shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transform hover:-translate-y-0.5 transition duration-200"
          variants={inputVariants}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          Sign In
        </motion.button>
      </motion.form>
    </AuthLayout>
  );
};

export default LoginPage;
