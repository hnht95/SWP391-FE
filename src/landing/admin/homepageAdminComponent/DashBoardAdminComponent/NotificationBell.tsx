import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdNotifications,
  MdBuild,
  MdVerifiedUser,
  MdClose,
  MdArrowForward,
} from "react-icons/md";
import type { Notification } from "./types";

interface NotificationBellProps {
  notifications: Notification[];
  readNotifications: Set<string>;
  unreadCount: number;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  notificationLoading: boolean;
  deleteNotification: (id: string, e: React.MouseEvent) => void;
  clearAllNotifications: () => void;
  handleNotificationClick: (notif: Notification) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  readNotifications,
  unreadCount,
  showNotifications,
  setShowNotifications,
  notificationLoading,
  deleteNotification,
  clearAllNotifications,
  handleNotificationClick,
}) => {
  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showNotifications && !target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications, setShowNotifications]);

  return (
    <div className="relative notification-container">
      <motion.button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2.5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow transition"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Bell ringing animation - reng reng effect */}
        <motion.div
          animate={
            unreadCount > 0
              ? {
                  rotate: [-15, 15, -15, 15, -10, 10, -10, 10, -5, 5, 0],
                }
              : {}
          }
          transition={
            unreadCount > 0
              ? {
                  duration: 0.6,
                  repeat: Infinity,
                  repeatDelay: 1.5,
                  ease: "easeInOut",
                }
              : {}
          }
          style={{ transformOrigin: "top center" }}
        >
          <MdNotifications className="w-5 h-5 text-black" />
        </motion.div>
        {unreadCount > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold z-10 shadow-lg"
            initial={{ scale: 0 }}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatDelay: 1.5,
              ease: "easeInOut",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </motion.button>
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 max-h-[600px] overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MdNotifications className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAllNotifications();
                      }}
                      className="text-xs text-gray-600 hover:text-gray-900 font-medium px-2 py-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <MdClose className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {notificationLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <MdNotifications className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notif, index) => {
                    const isRead = readNotifications.has(notif.id);
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative group ${
                          notif.priority === "high" && !isRead ? "bg-red-50/60" : ""
                        } ${isRead ? "opacity-75" : ""}`}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`p-2 rounded-lg flex-shrink-0 ${
                              notif.type === "maintenance"
                                ? "bg-orange-100 text-orange-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            {notif.type === "maintenance" ? (
                              <MdBuild className="w-5 h-5" />
                            ) : (
                              <MdVerifiedUser className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`font-semibold text-sm mb-1 ${
                                  isRead ? "text-gray-600" : "text-gray-900"
                                }`}>
                                  {notif.title}
                                </p>
                                <p className={`text-xs line-clamp-2 ${
                                  isRead ? "text-gray-500" : "text-gray-600"
                                }`}>
                                  {notif.message}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                {!isRead && (
                                  <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1" />
                                )}
                                <button
                                  onClick={(e) => deleteNotification(notif.id, e)}
                                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                                  title="Delete notification"
                                >
                                  <MdClose className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                              {notif.timestamp.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => {
                    const hasMaintenance = notifications.some((n) => n.type === "maintenance");
                    const hasKYC = notifications.some((n) => n.type === "kyc");
                    
                    if (hasMaintenance && hasKYC) {
                      window.location.href = "/admin/vehicles?tab=requests";
                    } else if (hasMaintenance) {
                      window.location.href = "/admin/vehicles?tab=requests";
                    } else if (hasKYC) {
                      window.location.href = "/admin/users/verification";
                    }
                    setShowNotifications(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  View All
                  <MdArrowForward className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;

