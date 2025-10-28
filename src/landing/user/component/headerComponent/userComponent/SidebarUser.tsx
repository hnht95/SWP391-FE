import {
  MdChevronLeft,
  MdChevronRight,
  MdLogout,
  MdEdit,
  MdHome,
  MdPerson,
  MdKeyboardArrowDown,
} from "react-icons/md";
import { ImProfile } from "react-icons/im";
import { FaCar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { logout as logoutApi } from "../../../../../service/apiUser/auth/API";
import type { UserProfile } from "../../../../../service/apiUser/profile/API"; // ✅ Import correct type

export interface SidebarUserProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: UserProfile; // ✅ Use UserProfile type
  onSignOut?: () => void;
}

const SidebarUser = ({
  isCollapsed,
  onToggleCollapse,
  activeTab,
  onTabChange,
  user,
  onSignOut,
}: SidebarUserProps) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    {
      id: "profile",
      label: "Profile",
      icon: <ImProfile className="w-5 h-5" />,
    },
    {
      id: "booking",
      label: "Booking History",
      icon: <FaCar className="w-5 h-5" />,
    },
  ];

  const handleMenuClick = (item: (typeof menuItems)[0]) => {
    onTabChange(item.id);
  };

  const handleEditAvatar = () => {
    console.log("Edit avatar clicked");
  };

  const handleSignOut = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logoutApi();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (onSignOut) {
        onSignOut();
      }
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleBackToHome = () => {
    setShowProfileMenu(false);
    navigate("/");
  };

  // ✅ Get avatar URL - handle nested object
  const getAvatarUrl = (): string | undefined => {
    if (!user) return undefined;

    // Handle nested object format
    if (typeof user.avatarUrl === "object" && user.avatarUrl?.url) {
      return user.avatarUrl.url;
    }
    // Handle string format
    if (typeof user.avatarUrl === "string") {
      return user.avatarUrl;
    }
    // Fallback to avatar field
    return user.avatar;
  };

  const avatarUrl = getAvatarUrl();

  // ✅ Get user role display
  const getRoleDisplay = (): string => {
    const roleMap: Record<string, string> = {
      renter: "User",
      staff: "Staff",
      admin: "Admin",
    };
    return roleMap[user.role] || user.role;
  };

  // ✅ Get initials for avatar placeholder
  const getInitials = (): string => {
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={`sticky left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-20 flex flex-col ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* ✅ User Avatar Section - Moved to Top */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shadow-md">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // ✅ Fallback if image fails to load
                      e.currentTarget.style.display = "none";
                      if (e.currentTarget.nextSibling) {
                        (
                          e.currentTarget.nextSibling as HTMLElement
                        ).style.display = "flex";
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center ${
                    avatarUrl ? "hidden" : ""
                  }`}
                >
                  <span className="text-black text-lg font-bold">
                    {getInitials()}
                  </span>
                </div>
              </div>
              <button
                onClick={handleEditAvatar}
                className="absolute bottom-0 right-0 w-4 h-4 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors duration-300 ease-in-out flex items-center justify-center"
              >
                <MdEdit className="w-2 h-2" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {user.name}
              </h3>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <div className="flex items-center space-x-1 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-black text-white">
                  {getRoleDisplay()}
                </span>
                {user.kyc?.verified && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
                    ✓
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shadow-md">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      if (e.currentTarget.nextSibling) {
                        (
                          e.currentTarget.nextSibling as HTMLElement
                        ).style.display = "flex";
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center ${
                    avatarUrl ? "hidden" : ""
                  }`}
                >
                  <span className="text-black text-xs font-bold">
                    {getInitials()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 px-3 flex-1 overflow-y-auto">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <div
              role="button"
              key={item.id}
              className={`flex w-full items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === item.id
                  ? "bg-black text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
              onClick={() => handleMenuClick(item)}
            >
              <span className={`${isCollapsed ? "mx-auto" : "mr-3"}`}>
                {item.icon}
              </span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {!isCollapsed && activeTab === item.id && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full" />
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 bg-white flex-shrink-0">
        {/* Profile Menu with Dropdown */}
        <div className="p-3">
          {isCollapsed ? (
            <div className="flex justify-center">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <MdPerson className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center mr-3">
                  <MdPerson className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{getRoleDisplay()}</p>
                </div>
                <MdKeyboardArrowDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown with Logout + Home */}
              {showProfileMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border-2 border-black rounded-lg shadow-lg py-2">
                  <button
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center ${
                      isLoggingOut
                        ? "text-red-400 bg-red-50 cursor-not-allowed"
                        : "text-red-600 hover:bg-red-50"
                    }`}
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                        Logging out...
                      </>
                    ) : (
                      <>
                        <MdLogout className="w-4 h-4 mr-2" />
                        Logout
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBackToHome}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center border-t border-gray-200"
                  >
                    <MdHome className="w-4 h-4 mr-2" />
                    Back to Home
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <MdChevronRight className="w-5 h-5" />
            ) : (
              <>
                <MdChevronLeft className="w-5 h-5" />
                <span className="ml-2 text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SidebarUser;
