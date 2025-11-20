import React from "react";
import { motion } from "framer-motion";
import { MdClose } from "react-icons/md";

interface ActivityItem {
  type: "warning" | "success" | "info";
  icon: React.ReactNode;
  title: string;
  details: string;
  time: string;
  color: string;
  iconBg: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  if (activities.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <span className="text-xs text-gray-500">Real-time updates</span>
      </div>
      <div className="space-y-3">
        {activities.map((alert, index) => (
          <motion.div
            key={`${alert.title}-${index}`}
            className={`flex items-start gap-4 p-4 rounded-2xl border ${alert.color.replace("border-2", "border")} hover:shadow-sm transition`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
          >
            <div className={`p-2 rounded-xl ${alert.iconBg}`}>
              {alert.icon}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{alert.title}</p>
              <p className="text-sm text-gray-600 mt-1">{alert.details}</p>
              <p className="text-xs text-gray-400 mt-2">{alert.time}</p>
            </div>
            <button className="text-gray-300 hover:text-gray-500 transition-colors">
              <MdClose className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;

