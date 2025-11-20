import React from "react";
import { motion } from "framer-motion";

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  icon: React.ReactNode;
  color: string;
}

interface StatsCardsProps {
  stats: StatCard[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {stats.map((stat, index) => {
        const getIconBg = () => {
          if (stat.color.includes('blue')) return 'bg-blue-100';
          if (stat.color.includes('emerald')) return 'bg-green-100';
          return 'bg-purple-100';
        };
        
        const getIconColor = () => {
          if (stat.color.includes('blue')) return 'text-blue-600';
          if (stat.color.includes('emerald')) return 'text-green-600';
          return 'text-purple-600';
        };

        return (
          <motion.div
            key={index}
            className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${getIconBg()} rounded-lg flex items-center justify-center`}>
                <div className={getIconColor()}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-2">{stat.title}</h3>
            <div className="flex items-center space-x-2 text-xs">
              <span className={stat.changeType === "increase" ? "text-green-600" : "text-red-600"}>
                {stat.changeType === "increase" ? "↑" : "↓"} {stat.change}
              </span>
              <span className="text-gray-500">vs last month</span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default StatsCards;

