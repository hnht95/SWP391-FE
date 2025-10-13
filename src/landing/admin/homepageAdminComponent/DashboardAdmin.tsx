import React from "react";
import { motion } from "framer-motion";
import {
  MdDirectionsCar,
  MdPeople,
  MdLocationOn,
  MdTrendingUp,
  MdAccountCircle,
  MdAttachMoney,
} from "react-icons/md";
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "../component/animations";
import PageTitle from "../component/PageTitle";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  color,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          <div className="flex items-center">
            <span
              className={`text-sm font-medium ${
                changeType === "increase" ? "text-green-600" : "text-red-600"
              }`}
            >
              {change}
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
          </div>
        </div>
        <div
          className={`p-3 rounded-full ${color} transition-transform duration-300 hover:scale-110`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const DashboardAdmin: React.FC = () => {
  const stats = [
    {
      title: "Total Vehicles",
      value: "1,284",
      change: "+12%",
      changeType: "increase" as const,
      icon: <MdDirectionsCar className="w-6 h-6 text-white" />,
      color: "bg-blue-500",
    },
    {
      title: "Active Customers",
      value: "8,549",
      change: "+8%",
      changeType: "increase" as const,
      icon: <MdPeople className="w-6 h-6 text-white" />,
      color: "bg-green-500",
    },
    {
      title: "Rental Stations",
      value: "42",
      change: "+2",
      changeType: "increase" as const,
      icon: <MdLocationOn className="w-6 h-6 text-white" />,
      color: "bg-purple-500",
    },
    {
      title: "Monthly Revenue",
      value: "$2.4M",
      change: "+15%",
      changeType: "increase" as const,
      icon: <MdAttachMoney className="w-6 h-6 text-white" />,
      color: "bg-yellow-500",
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Page Title - In đậm với animation smooth */}
        <div className="flex items-center justify-between">
          <PageTitle 
            title="System Overview"
            subtitle={`Updated at ${new Date().toLocaleString("en-US")}`}
          />
          <FadeIn delay={0.3} duration={0.6}>
          <button className="px-4 py-2 bg-black text-white border border-white rounded-lg hover:bg-gray-900 hover:border-gray-300 transition-all duration-300  hover:shadow-lg hover:scale-105">
             Export Report
            </button>
          </FadeIn>
        </div>

        {/* Stats Grid - Fade in mượt mà */}
        <StaggerContainer staggerDelay={0.15} initialDelay={0.4}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StaggerItem key={index}>
                <StatCard {...stat} />
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        {/* Quick Actions - Fade in mượt */}
        <FadeIn delay={1.0} duration={0.7} direction="up">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <StaggerContainer staggerDelay={0.12} initialDelay={0}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    icon: <MdDirectionsCar className="w-6 h-6 text-blue-600" />,
                    title: "Add New Vehicle",
                    desc: "Register vehicle to system",
                    color: "blue",
                  },
                  {
                    icon: <MdAccountCircle className="w-6 h-6 text-green-600" />,
                    title: "Manage Staff",
                    desc: "Add/edit staff information",
                    color: "green",
                  },
                  {
                    icon: <MdTrendingUp className="w-6 h-6 text-purple-600" />,
                    title: "View AI Reports",
                    desc: "Smart analytics",
                    color: "purple",
                  },
                ].map((action, index) => (
                  <StaggerItem key={index}>
                    <button className={`flex items-center space-x-3 p-4 bg-${action.color}-50 rounded-lg hover:bg-${action.color}-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 w-full`}>
                      {action.icon}
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{action.title}</p>
                        <p className="text-sm text-gray-600">{action.desc}</p>
                      </div>
                    </button>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          </div>
        </FadeIn>

        {/* Recent Activity - Slide từ trái như Staff */}
        <FadeIn delay={1.3} duration={0.7} direction="up">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <StaggerContainer staggerDelay={0.1} initialDelay={0.15}>
              <div className="space-y-1">
                {[
                  {
                    action: "New Vehicle Registration",
                    details: "VinFast VF9 - License Plate: 30A-12345",
                    time: "5 minutes ago",
                    type: "vehicle",
                  },
                  {
                    action: "New Customer",
                    details: "John Smith - ID: CU001234",
                    time: "15 minutes ago",
                    type: "customer",
                  },
                  {
                    action: "Station Update",
                    details: "Added new station at District 7, HCM City",
                    time: "30 minutes ago",
                    type: "location",
                  },
                  {
                    action: "Report Generated",
                    details: "Monthly Revenue Report - Sep 2024",
                    time: "1 hour ago",
                    type: "report",
                  },
                ].map((activity, index) => (
                  <StaggerItem key={index} direction="left">
                    <motion.div 
                      className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 -mx-6 px-6 rounded transition-all duration-200 hover:shadow-sm"
                      whileHover={{ x: 5 }}
                    >
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.details}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </motion.div>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
};

export default DashboardAdmin;
