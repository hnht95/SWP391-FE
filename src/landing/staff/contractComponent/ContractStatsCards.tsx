import React from "react";
import { motion } from "framer-motion";
import {
  MdBusiness,
  MdCheckCircle,
  MdWarning,
  MdAttachMoney,
} from "react-icons/md";

interface ContractStatsCardsProps {
  stats: {
    total: number;
    active: number;
    expiring: number;
    expired: number;
    totalVehicles: number;
    monthlyRevenue: number;
  };
}

const ContractStatsCards: React.FC<ContractStatsCardsProps> = ({ stats }) => {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {[
        {
          title: "Total Contracts",
          value: stats.total,
          icon: MdBusiness,
          color: "blue",
          subtitle: "All business contracts",
        },
        {
          title: "Active Contracts",
          value: stats.active,
          icon: MdCheckCircle,
          color: "green",
          subtitle: "Currently active",
        },
        {
          title: "Expiring Soon",
          value: stats.expiring,
          icon: MdWarning,
          color: "yellow",
          subtitle: "Need renewal",
        },
        {
          title: "Monthly Revenue",
          value: `${(stats.monthlyRevenue / 1000000).toFixed(0)}M`,
          icon: MdAttachMoney,
          color: "purple",
          subtitle: "VND from active contracts",
        },
      ].map((stat, index) => (
        <motion.div
          key={stat.title}
          className="bg-white rounded-xl p-6 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          whileHover={{
            y: -5,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <motion.div
              className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}
              whileHover={{ rotate: 5 }}
            >
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </motion.div>
            <motion.span
              className="text-2xl font-bold text-gray-900"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
            >
              {stat.value}
            </motion.span>
          </div>
          <h3 className="text-gray-600 text-sm mb-2">{stat.title}</h3>
          <p className="text-xs text-gray-500">{stat.subtitle}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ContractStatsCards;
