import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdNotifications,
  MdKeyboardArrowDown,
  MdWarning,
  MdDirectionsCar,
  MdAttachMoney,
} from "react-icons/md";
import type { Contract } from "../../../types/contracts";

interface NotificationDropdownProps {
  contracts: Contract[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  contracts,
  isOpen,
  onToggle,
  onClose,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Extract all alerts from contracts
  const allAlerts = contracts.flatMap((contract) =>
    contract.alerts.map((alert) => ({
      ...alert,
      contractId: contract.id,
      companyName: contract.companyName,
    }))
  );

  // Sort alerts by priority and date
  const sortedAlerts = allAlerts.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "contract_expiring":
        return <MdWarning className="w-4 h-4" />;
      case "vehicle_inspection":
        return <MdDirectionsCar className="w-4 h-4" />;
      case "payment_due":
        return <MdAttachMoney className="w-4 h-4" />;
      default:
        return <MdNotifications className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={onToggle}
        className="relative bg-white border border-gray-300 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <MdNotifications className="w-5 h-5" />
        <span>Notifications</span>
        {allAlerts.length > 0 && (
          <motion.span
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[1.5rem] h-6 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {allAlerts.length}
          </motion.span>
        )}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <MdKeyboardArrowDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h3>
                <motion.span
                  className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {allAlerts.length} alerts
                </motion.span>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {sortedAlerts.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {sortedAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${getPriorityColor(
                        alert.priority
                      )}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {alert.companyName}
                            </p>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                alert.priority === "high"
                                  ? "bg-red-100 text-red-800"
                                  : alert.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {alert.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">
                            {alert.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              Contract: {alert.contractId}
                            </p>
                            <p className="text-xs text-gray-500">
                              {alert.date}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <MdNotifications className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No notifications
                  </h3>
                  <p className="text-gray-500">All contracts are up to date</p>
                </div>
              )}
            </div>

            {sortedAlerts.length > 0 && (
              <div className="p-4 border-t border-gray-100">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View All Notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
