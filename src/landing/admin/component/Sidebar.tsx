import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdDirectionsCar,
  MdLocationOn,
  MdPeople,
  MdWork,
  MdAssessment,
  MdChevronLeft,
  MdChevronRight,
  MdPerson,
  MdLogout,
  MdKeyboardArrowDown,
} from "react-icons/md";
import logoWeb from "../../../assets/loginImage/logoZami.png";
import { useAuth } from "../../../hooks/useAuth";

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { logout, showGlobalLoading, hideGlobalLoading } = useAuth();

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <MdDashboard className="w-5 h-5" />,
      path: "/admin/dashboard",
    },
    {
      id: "vehicle-management",
      label: "Vehicle Management",
      icon: <MdDirectionsCar className="w-5 h-5" />,
      path: "/admin/vehicles",
    },
    {
      id: "station-management",
      label: "Station Management",
      icon: <MdLocationOn className="w-5 h-5" />,
      path: "/admin/stations",
    },
    {
      id: "customer-management",
      label: "Customer Management",
      icon: <MdPeople className="w-5 h-5" />,
      path: "/admin/customers",
    },
    {
      id: "staff-management",
      label: "Staff Management",
      icon: <MdWork className="w-5 h-5" />,
      path: "/admin/staff",
    },
    {
      id: "reports-ai",
      label: "Reports & AI",
      icon: <MdAssessment className="w-5 h-5" />,
      path: "/admin/reports",
    },
  ];

  const handleMenuClick = (item: MenuItem) => {
    navigate(item.path);
  };

  // Helper function to check if menu item is active
  const isMenuItemActive = (item: MenuItem) => {
    // Special case for dashboard: active when at /admin or /admin/dashboard
    if (item.id === "dashboard") {
      return location.pathname === "/admin" || location.pathname === "/admin/dashboard";
    }
    return location.pathname === item.path;
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 shadow-lg z-50 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-slate-200">
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
              <h2 className="text-lg font-bold text-gray-900">Zami Admin</h2>
              <p className="text-xs text-gray-500">Management Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 px-3 py-6">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              className={`flex w-full items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isMenuItemActive(item)
                  ? "bg-gray-900 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className={`${isCollapsed ? "mx-auto" : "mr-3"} ${
                isMenuItemActive(item) ? "text-white" : ""
              }`}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {!isCollapsed && isMenuItemActive(item) && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* User Profile & Logout - giống Staff */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white">
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
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <MdKeyboardArrowDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showProfileMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border-2 border-black rounded-lg shadow-lg py-2">
                  <button 
                    onClick={async () => {
                      showGlobalLoading();
                      try {
                        await logout();
                        navigate("/");
                      } finally {
                        setTimeout(() => hideGlobalLoading(), 350);
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                  >
                    <MdLogout className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
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

export default Sidebar;
