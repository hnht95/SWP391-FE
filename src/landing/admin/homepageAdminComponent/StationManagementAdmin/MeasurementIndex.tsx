import React from "react";
import { motion } from "framer-motion";
import { MdLocationOn } from "react-icons/md";

interface MeasurementIndexProps {
  totalStations: number;
  activeStations: number;
  inactiveStations: number;
}

const MeasurementIndex: React.FC<MeasurementIndexProps> = ({
  totalStations,
  activeStations,
  inactiveStations,
}) => {
  // Calculate activity percentage
  const activityPercentage =
    totalStations > 0 ? Math.round((activeStations / totalStations) * 100) : 0;

  // Determine color based on percentage
  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return { text: "text-green-600", stroke: "#10b981" };
    if (percentage >= 60) return { text: "text-blue-600", stroke: "#3b82f6" };
    if (percentage >= 40) return { text: "text-yellow-600", stroke: "#f59e0b" };
    return { text: "text-red-600", stroke: "#ef4444" };
  };

  const performanceColor = getPerformanceColor(activityPercentage);

  // Calculate stroke dash offset for circular progress
  const circumference = 2 * Math.PI * 58;
  const strokeDashoffset =
    circumference - (activityPercentage / 100) * circumference;

  const stats = [
    {
      label: "Total Stations",
      value: totalStations,
      icon: "📍",
      color: "bg-blue-500",
    },
    {
      label: "Active",
      value: activeStations,
      icon: "✓",
      color: "bg-green-500",
    },
    {
      label: "Inactive",
      value: inactiveStations,
      icon: "✕",
      color: "bg-red-500",
    },
    {
      label: "Activity Rate",
      value: `${activityPercentage}%`,
      icon: "📊",
      color: "bg-purple-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Circular Progress */}
        <div className="flex-shrink-0">
          <div className="relative w-36 h-36">
            <svg className="transform -rotate-90 w-full h-full">
              <circle
                cx="72"
                cy="72"
                r="58"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="72"
                cy="72"
                r="58"
                stroke={performanceColor.stroke}
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-3xl font-bold ${performanceColor.text}`}>
                {activityPercentage}%
              </div>
              <div className="text-xs text-gray-500 font-medium mt-1">
                Activity
              </div>
              <div className="flex items-center gap-1 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activityPercentage >= 80
                      ? "bg-green-500"
                      : activityPercentage >= 60
                      ? "bg-blue-500"
                      : activityPercentage >= 40
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  } animate-pulse`}
                />
                <span className="text-xs text-gray-400">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 w-full">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm`}
                  >
                    {stat.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Performance indicator */}
          <div className="mt-4 flex items-center justify-between px-2 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <MdLocationOn
                className={`w-4 h-4 ${
                  activityPercentage >= 80
                    ? "text-green-600"
                    : activityPercentage >= 60
                    ? "text-blue-600"
                    : activityPercentage >= 40
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              />
              <span className="text-sm text-gray-700 font-medium">
                {activityPercentage >= 80
                  ? "Excellent Performance"
                  : activityPercentage >= 60
                  ? "Good Performance"
                  : activityPercentage >= 40
                  ? "Fair Performance"
                  : "Needs Attention"}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MeasurementIndex;
