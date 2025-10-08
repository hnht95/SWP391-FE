import React from 'react';
import { motion } from 'framer-motion';
import { MdLocationOn } from 'react-icons/md';

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
  const activityPercentage = totalStations > 0 
    ? Math.round((activeStations / totalStations) * 100) 
    : 0;

  // Determine color based on percentage
  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return { bg: 'from-green-400 to-emerald-500', text: 'text-green-600', ring: 'ring-green-500/20' };
    if (percentage >= 60) return { bg: 'from-blue-400 to-cyan-500', text: 'text-blue-600', ring: 'ring-blue-500/20' };
    if (percentage >= 40) return { bg: 'from-yellow-400 to-orange-500', text: 'text-yellow-600', ring: 'ring-yellow-500/20' };
    return { bg: 'from-red-400 to-rose-500', text: 'text-red-600', ring: 'ring-red-500/20' };
  };

  const performanceColor = getPerformanceColor(activityPercentage);

  // Calculate stroke dash offset for circular progress
  const circumference = 2 * Math.PI * 58; // radius = 58
  const strokeDashoffset = circumference - (activityPercentage / 100) * circumference;

  const stats = [
    {
      label: 'Total Stations',
      value: totalStations,
      icon: '📍',
      color: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-700',
      iconBg: 'bg-blue-500',
    },
    {
      label: 'Active',
      value: activeStations,
      icon: '✓',
      color: 'from-green-50 to-green-100',
      textColor: 'text-green-700',
      iconBg: 'bg-green-500',
    },
    {
      label: 'Inactive',
      value: inactiveStations,
      icon: '✕',
      color: 'from-red-50 to-red-100',
      textColor: 'text-red-700',
      iconBg: 'bg-red-500',
    },
    {
      label: 'Activity Rate',
      value: `${activityPercentage}%`,
      icon: '📊',
      color: 'from-purple-50 to-purple-100',
      textColor: 'text-purple-700',
      iconBg: 'bg-purple-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
    >
      <div className="flex flex-col lg:flex-row items-center gap-5">
        {/* Circular Progress Gauge */}
        <div className="flex-shrink-0">
          <div className="relative w-36 h-36 rounded-full bg-gray-50 p-2">
              {/* Background circle */}
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                {/* Progress circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    {activityPercentage >= 80 ? (
                      <>
                        <stop offset="0%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#10b981" />
                      </>
                    ) : activityPercentage >= 60 ? (
                      <>
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </>
                    ) : activityPercentage >= 40 ? (
                      <>
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#f97316" />
                      </>
                    ) : (
                      <>
                        <stop offset="0%" stopColor="#f87171" />
                        <stop offset="100%" stopColor="#f43f5e" />
                      </>
                    )}
                  </linearGradient>
                </defs>
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center m-2">
                <div className={`text-3xl font-bold ${performanceColor.text}`}>
                  {activityPercentage}%
                </div>
                <div className="text-[11px] text-gray-500 font-medium mt-0.5">Activity Index</div>
                <div className="flex items-center gap-0.5 mt-1">
                  <MdLocationOn className={`w-3 h-3 ${performanceColor.text}`} />
                  <span className="text-[10px] text-gray-400">Live</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-2 gap-2.5">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className={`bg-gradient-to-br ${stat.color} rounded-lg p-2.5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-[11px] font-medium text-gray-600 mb-1">
                        {stat.label}
                      </p>
                      <p className={`text-xl font-bold ${stat.textColor}`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.iconBg} w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm shadow-sm`}>
                      {stat.icon}
                    </div>
                  </div>
                  
                  {/* Simple indicator bar */}
                  <motion.div
                    className={`absolute bottom-0 left-0 h-0.5 rounded-b-lg ${stat.iconBg}`}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Performance indicator */}
            <div className="mt-2.5 flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  activityPercentage >= 80 ? 'bg-green-500' : 
                  activityPercentage >= 60 ? 'bg-blue-500' : 
                  activityPercentage >= 40 ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`} />
                <span className="text-[11px] text-gray-600 font-medium">
                  {activityPercentage >= 80 ? 'Excellent Performance' : 
                   activityPercentage >= 60 ? 'Good Performance' : 
                   activityPercentage >= 40 ? 'Fair Performance' : 
                   'Needs Attention'}
                </span>
              </div>
              <span className="text-[11px] text-gray-400">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
  );
};

export default MeasurementIndex;

