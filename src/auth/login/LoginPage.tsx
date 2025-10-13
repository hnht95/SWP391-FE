import { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../AuthLayout";
import { useAuth } from "../../hooks/useAuth";
import { login } from "../../service/apiUser/API";

const LoginPage = () => {
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
          const { role } = user;

          if (role === "admin") {
            navigate("/admin");
          } else if (role === "staff") {
            navigate("/staff");
          } else if (role === "renter") {
            navigate("/home");
          } else {
            navigate("/home");
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

        <motion.button
          type="submit"
          disabled={loading}
          className={`w-full select-none font-semibold py-4 lg:py-2 xl:py-4 px-6 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transform transition duration-200 ${
            loading
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800 hover:-translate-y-0.5"
          }`}
          variants={inputVariants}
          whileHover={
            loading
              ? {}
              : {
                  scale: 1.02,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                }
          }
          whileTap={loading ? {} : { scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {loading ? "Signing In..." : "Sign In"}
        </motion.button>
      </motion.form>
    </AuthLayout>
  );
};

export default LoginPage;
