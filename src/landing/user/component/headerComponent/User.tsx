import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdPerson, MdKeyboardArrowDown, MdLogout } from "react-icons/md";
import { useRoleBasedNavigation } from "../../../../hooks/useRoleBasedNavigation";
import { useAuth } from "../../../../hooks/useAuth";

interface UserProps {
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
  isLoggedIn?: boolean;
}

const User: React.FC<UserProps> = ({
  userName,
  userAvatar,
  onLogout,
  isLoggedIn = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { getNavigationPaths } = useRoleBasedNavigation();
  const { user } = useAuth();
  const navigationPaths = getNavigationPaths();

  // ✅ Close dropdown when logged out
  useEffect(() => {
    if (!isLoggedIn) {
      setIsDropdownOpen(false);
    }
  }, [isLoggedIn]);

  // ✅ Get avatar with proper memoization
  const displayAvatar = useMemo(() => {
    // If not logged in, always return null
    if (!isLoggedIn) return null;

    const avatarValue = userAvatar || user?.avatarUrl;

    if (!avatarValue) return null;

    if (typeof avatarValue === "string") {
      return avatarValue;
    }

    if (typeof avatarValue === "object" && "url" in avatarValue) {
      return (avatarValue as { url: string }).url || null;
    }

    return null;
  }, [userAvatar, user?.avatarUrl, isLoggedIn]);

  const displayName = useMemo(() => {
    if (!isLoggedIn) return "Guest User";
    return userName || user?.name || "Guest User";
  }, [userName, user?.name, isLoggedIn]);

  // Get role display text
  const getRoleDisplay = () => {
    if (!user?.role) return "Member";
    switch (user.role) {
      case "admin":
        return "Admin";
      case "staff":
        return "Staff";
      case "renter":
        return "Renter";
      default:
        return "Member";
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (onLogout) {
        await onLogout();
      }
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/");
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  const handleProfileClick = () => {
    if (navigationPaths.profile) {
      navigate(navigationPaths.profile);
    }
    setIsDropdownOpen(false);
  };

  const handleLoginClick = () => {
    navigate("/login");
    setIsDropdownOpen(false);
  };

  // ✅ Generate initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative">
      {/* User Avatar/Login Button */}
      <button
        onClick={
          isLoggedIn
            ? () => setIsDropdownOpen(!isDropdownOpen)
            : handleLoginClick
        }
        aria-expanded={isDropdownOpen}
        className={`group flex items-center space-x-2 px-2 py-1 transition duration-200 focus:outline-none hover:brightness-200 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] cursor-pointer ${
          isLoggedIn ? "rounded-full" : "rounded-lg"
        }`}
      >
        <div className="w-7 h-7 flex items-center justify-center text-white overflow-hidden rounded-full">
          {isLoggedIn ? (
            displayAvatar ? (
              // ✅ Show avatar image
              <img
                src={displayAvatar}
                alt="User Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    const initials = getInitials(displayName);
                    parent.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span class="text-white text-xs font-bold">${initials}</span>
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              // ✅ Show initials as fallback
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {getInitials(displayName)}
                </span>
              </div>
            )
          ) : (
            // ✅ Show login icon
            <MdPerson className="w-5 h-5 text-white group-hover:brightness-150 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
          )}
        </div>

        {/* Login Text */}
        {!isLoggedIn && (
          <span
            className="text-white font-normal text-[16px] hidden sm:block group-hover:brightness-150 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
            style={{ fontFamily: '"MBCorpo Text", sans-serif' }}
          >
            Login
          </span>
        )}

        {/* Arrow - Only show when logged in */}
        {isLoggedIn && (
          <MdKeyboardArrowDown
            className={`w-5 h-5 text-white/80 group-hover:text-white group-hover:brightness-150 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] transform transition-transform duration-300 ${
              isDropdownOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isLoggedIn && isDropdownOpen && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white text-black rounded-lg shadow-xl border border-gray-200 py-2 z-50 transform origin-top-right transition-all duration-300 ease-out opacity-100 scale-100 translate-y-0 pointer-events-auto"
          role="menu"
          aria-hidden="false"
          onMouseLeave={() => setHoveredItem(null)}
        >
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-gray-500">{getRoleDisplay()}</p>
          </div>

          <div className="relative">
            {/* Moving white dot indicator */}
            <motion.div
              className="absolute right-3 top-3 w-2.5 h-2.5 bg-white rounded-full shadow-md border border-gray-200"
              style={{
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.1)",
              }}
              initial={{ opacity: 0 }}
              animate={{
                y:
                  hoveredItem === "profile"
                    ? 0
                    : hoveredItem === "logout"
                    ? 40
                    : 20,
                opacity: hoveredItem ? 1 : 0,
                scale: hoveredItem ? 1 : 0.5,
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 15,
                mass: 0.8,
                bounce: 0.6,
              }}
            />

            {/* Profile Button */}
            <motion.button
              onClick={handleProfileClick}
              onMouseEnter={() => setHoveredItem("profile")}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 relative"
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              <MdPerson className="w-4 h-4" />
              <span>View Profile</span>
            </motion.button>

            {/* Logout Button */}
            <motion.button
              onClick={handleLogout}
              onMouseEnter={() => setHoveredItem("logout")}
              disabled={isLoggingOut}
              className={`w-full px-4 py-2 text-left text-sm transition-colors duration-200 flex items-center space-x-2 relative ${
                isLoggingOut
                  ? "text-red-400 bg-red-25 cursor-not-allowed"
                  : "text-red-600 hover:bg-red-50"
              }`}
              whileHover={isLoggingOut ? {} : { x: 2 }}
              transition={{ duration: 0.2 }}
            >
              {isLoggingOut ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
              ) : (
                <MdLogout className="w-4 h-4" />
              )}
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </motion.button>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default User;
