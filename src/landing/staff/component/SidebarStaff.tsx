import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  const navigate = useNavigate();
  const location = useLocation();

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
      label: "Vehicle Handover",
      icon: <MdSwapHoriz className="w-5 h-5" />,
      path: "/staff/handover",
    },
    {
      id: "maintain",
      label: "Vehicle Maintenance",
      icon: <MdSettings className="w-5 h-5" />,
      path: "/staff/maintain",
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

  return (
    <motion.div
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm z-50`}
      animate={{
        width: isCollapsed ? 64 : 256,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 40,
        mass: 0.8,
      }}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <motion.div
            className="w-8 h-8 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={logoWeb}
              alt="Zami Logo"
              className="w-8 h-8 object-contain"
            />
          </motion.div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <h2 className="text-lg font-bold text-gray-900">Zami Staff</h2>
                <p className="text-xs text-gray-500">Vehicle Management</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="mt-6 px-3 flex-1">
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              role="button"
              className={`flex w-full items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                location.pathname === item.path
                  ? "bg-black text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
              onClick={() => handleMenuClick(item)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: index * 0.05,
                duration: 0.3,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.02,
                x: 4,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span
                className={`${isCollapsed ? "mx-auto" : "mr-3"}`}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                {item.icon}
              </motion.span>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    className="truncate"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
        <div className="p-3 border-t border-gray-100">
          {isCollapsed ? (
            <div className="flex justify-center">
              <motion.button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <MdPerson className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          ) : (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                className="w-full flex items-center justify-center px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MdNotifications className="w-5 h-5 mr-2" />
                <span className="text-sm">Notifications</span>
                <motion.span
                  className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  3
                </motion.span>
              </motion.button>

              <div className="relative">
                <motion.button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
                  <motion.div
                    animate={{ rotate: showProfileMenu ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MdKeyboardArrowDown className="w-4 h-4" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <motion.button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        View Profile
                      </motion.button>
                      <motion.button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        Settings
                      </motion.button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <motion.button
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        Sign Out
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-3 border-t border-gray-100">
          <motion.button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {isCollapsed ? (
                <MdChevronRight className="w-5 h-5" />
              ) : (
                <MdChevronLeft className="w-5 h-5" />
              )}
            </motion.div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  className="ml-2 text-sm"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SidebarStaff;
