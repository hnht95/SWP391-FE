import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

import {
  MdDashboard,
  MdSwapHoriz,
  MdSupport,
  MdChevronLeft,
  MdChevronRight,
  MdKeyboardArrowDown,
  MdPerson,
  MdDirectionsCar,
} from "react-icons/md";
import logoWeb from "../../../assets/loginImage/logoZami.png";
import { FaUser } from "react-icons/fa";
import { TbContract } from "react-icons/tb";

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const SidebarStaff = ({ isCollapsed, onToggleCollapse }: SidebarProps) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  // Helper function to get avatar URL
  const getAvatarUrl = (): string | null => {
    if (!user?.avatarUrl) {
      return null;
    }
    if (
      typeof user.avatarUrl === "object" &&
      user.avatarUrl !== null &&
      "url" in user.avatarUrl
    ) {
      return user.avatarUrl.url;
    }

    // If avatarUrl is just an ID string (not populated by backend)
    if (typeof user.avatarUrl === "string") {
      return null;
    }
    return null;
  };

  const avatarUrl = getAvatarUrl();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <MdDashboard className="w-5 h-5" />,
      path: "/staff/dashboard",
    },
    {
      id: "users",
      label: "Users",
      icon: <FaUser className="w-5 h-5" />,
      path: "/staff/users",
    },
    {
      id: "handover",
      label: "Booking",
      icon: <MdSwapHoriz className="w-5 h-5" />,
      path: "/staff/handover",
    },
    {
      id: "vehicles",
      label: "Vehicles",
      icon: <MdDirectionsCar className="w-5 h-5" />,
      path: "/staff/vehicles",
    },
    {
      id: "contracts",
      label: "Contracts",
      icon: <TbContract className="w-5 h-5" />,
      path: "/staff/contracts",
    },
    {
      id: "reports",
      label: "Customer Support",
      icon: <MdSupport className="w-5 h-5" />,
      path: "/staff/reports",
    },
  ];

  const handleMenuClick = (item: (typeof menuItems)[0]) => {
    navigate(item.path);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, redirect to login
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
      setShowProfileMenu(false);
    }
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm z-50 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img
              src={logoWeb}
              alt="Zami Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-gray-900">Zami Staff</h2>
              <p className="text-xs text-gray-500">Vehicle Management</p>
            </div>
          )}
        </div>
      </div>

      <nav className="mt-6 px-3 flex-1">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <div
              key={item.id}
              role="button"
              className={`flex w-full items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                location.pathname === item.path
                  ? "bg-black text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
              onClick={() => handleMenuClick(item)}
            >
              <span className={`${isCollapsed ? "mx-auto" : "mr-3"}`}>
                {item.icon}
              </span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </div>
          ))}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
        <div className="p-3 border-t border-gray-100">
          {isCollapsed ? (
            <div className="flex justify-center">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors overflow-hidden"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user?.name || "User"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <MdPerson className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={user?.name || "User"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <MdPerson className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || "Staff Member"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.station?.name || "No Station"}
                    </p>
                  </div>
                  <MdKeyboardArrowDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      showProfileMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showProfileMenu && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      View Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      Settings
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center space-x-2 ${
                        isLoggingOut
                          ? "text-red-400 bg-red-25 cursor-not-allowed"
                          : "text-red-600 hover:bg-red-50"
                      }`}
                    >
                      {isLoggingOut ? (
                        <div className="w-3 h-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                      ) : (
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                      )}
                      <span>
                        {isLoggingOut ? "Signing out..." : "Sign Out"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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

export default SidebarStaff;
