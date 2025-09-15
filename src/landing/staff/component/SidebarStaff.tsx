import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdSwapHoriz,
  MdSettings,
  MdSupport,
  MdChevronLeft,
  MdChevronRight,
  MdNotifications,
  MdKeyboardArrowDown,
  MdPerson,
} from "react-icons/md";
import logoWeb from "../../../assets/loginImage/logoZami.png";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const SidebarStaff = ({ isCollapsed, onToggleCollapse }: SidebarProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <MdDashboard className="w-5 h-5" />,
      path: "/staff/dashboard",
    },
    {
      id: "pickup-return",
      label: "Vehicle Handover",
      icon: <MdSwapHoriz className="w-5 h-5" />,
      path: "/staff/pickup-return",
    },
    {
      id: "maintenance",
      label: "Vehicle Maintenance",
      icon: <MdSettings className="w-5 h-5" />,
      path: "/staff/maintenance",
    },
    {
      id: "support",
      label: "Customer Support",
      icon: <MdSupport className="w-5 h-5" />,
      path: "/staff/support",
    },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-50 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo Section */}
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

      {/* Navigation Menu */}
      <nav className="mt-6 px-3 flex-1">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-black text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
              onClick={() => setActiveMenu(item.id)}
            >
              <span className={`${isCollapsed ? "mx-auto" : "mr-3"}`}>
                {item.icon}
              </span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
        {/* User Profile Section */}
        <div className="p-3 border-t border-gray-100">
          {isCollapsed ? (
            // Collapsed Profile - Just Avatar
            <div className="flex justify-center">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <MdPerson className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            // Expanded Profile
            <div className="space-y-3">
              \{/* Notifications */}
              <button className="w-full flex items-center justify-center px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <MdNotifications className="w-5 h-5 mr-2" />
                <span className="text-sm">Notifications</span>
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  3
                </span>
              </button>
              {/* Profile Dropdown */}
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
                      Staff Member
                    </p>
                    <p className="text-xs text-gray-500">Online</p>
                  </div>
                  <MdKeyboardArrowDown
                    className={`w-4 h-4 transition-transform ${
                      showProfileMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      View Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      Settings
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Toggle Button */}
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
