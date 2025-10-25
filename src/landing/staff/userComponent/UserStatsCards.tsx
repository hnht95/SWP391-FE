import React from "react";
import { motion } from "framer-motion";
import { MdPerson, MdStar, MdCheckCircle, MdBlock } from "react-icons/md";
import type { UserStats } from "../../../types/userTypes";

interface UserStatsCardsProps {
  stats: UserStats;
}

const UserStatsCards: React.FC<UserStatsCardsProps> = ({ stats }) => {
  const statCards = [
    {
      title: "Total Users",
      value: stats.total,
      subtitle: "All registered users",
      icon: MdPerson,
      color: "blue",
    },
    {
      title: "VIP Users",
      value: stats.vip,
      subtitle: "Premium customers",
      icon: MdStar,
      color: "yellow",
    },
    {
      title: "Active Users",
      value: stats.active,
      subtitle: "Currently active",
      icon: MdCheckCircle,
      color: "green",
    },
    {
      title: "Locked Users",
      value: stats.locked,
      subtitle: "Account restrictions",
      icon: MdBlock,
      color: "red",
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          className="bg-white rounded-xl p-6 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}
            >
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stat.value}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-2">{stat.title}</h3>
          <p className="text-xs text-gray-500">{stat.subtitle}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default UserStatsCards;
