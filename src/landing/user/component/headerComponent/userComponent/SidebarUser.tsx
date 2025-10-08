import {
  MdChevronLeft,
  MdChevronRight,
  MdNotifications,
} from "react-icons/md";
import { ImProfile } from "react-icons/im";
import { FaCar } from "react-icons/fa";
import { BiSolidNotepad } from "react-icons/bi";
import { IoSettingsSharp } from "react-icons/io5";
import logoWeb from "../../../../../assets/loginImage/logoZami.png";

export interface SidebarUserProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    role: "User" | "Staff" | "Admin";
  };
  onSignOut?: () => void;
}

const SidebarUser = ({ 
  isCollapsed, 
  onToggleCollapse, 
  activeTab, 
  onTabChange,
  user,
  onSignOut 
}: SidebarUserProps) => {

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
    {
      id: "activity",
      label: "Activity",
      icon: <BiSolidNotepad className="w-5 h-5" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <IoSettingsSharp className="w-5 h-5" />,
    },
  ];

  const handleMenuClick = (item: (typeof menuItems)[0]) => {
    onTabChange(item.id);
  };

  const handleEditAvatar = () => {
    console.log("Edit avatar clicked");
  };

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
  };

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-50 ${
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
              <h2 className="text-lg font-bold text-gray-900">Zami Renter</h2>
              <p className="text-xs text-gray-500">Vehicle Rental</p>
            </div>
          )}
        </div>
      </div>

      {/* User Avatar Section - Only show when not collapsed */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shadow-md">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                    <span className="text-black text-lg font-bold">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={handleEditAvatar}
                className="absolute bottom-0 right-0 w-4 h-4 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors duration-300 ease-in-out flex items-center justify-center"
              >
                <svg
                  className="w-2 h-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {user.name}
              </h3>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-black text-white mt-1">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="mt-6 px-3 flex-1">
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

      {/* Quick Stats - Only show when not collapsed */}
      {!isCollapsed && (
        <div className="px-6 py-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">
            Quick Stats
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">Member Since</span>
              <span className="text-black text-xs font-medium">
                Jan 2024
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">Total Bookings</span>
              <span className="text-black text-xs font-medium">12</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
        <div className="p-3 border-t border-gray-100">
          {isCollapsed ? (
            <div className="flex justify-center">
              <button
                onClick={handleSignOut}
                className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                title="Sign Out"
              >
                <svg 
                  className="w-4 h-4 text-white" 
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
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <MdNotifications className="w-5 h-5 mr-2" />
                <span className="text-sm">Notifications</span>
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  3
                </span>
              </button>
              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                  <svg 
                    className="w-4 h-4 text-white" 
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
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-red-600">
                    Sign Out
                  </p>
                  <p className="text-xs text-gray-500">Exit your account</p>
                </div>
              </button>
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

export default SidebarUser;
