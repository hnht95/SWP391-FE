import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdDirectionsCar,
  MdAttachMoney,
  MdPersonAdd,
  MdLocationOn,
  MdKeyboardArrowDown,
  MdBusiness,
  MdWarning,
  MdCalendarToday,
  MdPhone,
  MdVisibility,
  MdEdit,
} from "react-icons/md";
import { GrHostMaintenance } from "react-icons/gr";

const DashboardStaff = () => {
  const navigate = useNavigate();
  const [selectedStation, setSelectedStation] = useState(
    "Station A - District 1"
  );
  const [isStationDropdownOpen, setIsStationDropdownOpen] = useState(false);

  const stations = [
    "Station A - District 1",
    "Station B - District 3",
    "Station C - District 7",
    "Central Hub - Downtown",
    "Tan Son Nhat Branch",
    "Binh Thanh Station",
  ];

  const stats = {
    vehicles: {
      total: 73,
      available: 25,
      rented: 40,
      maintenance: 8,

      path: "/staff/vehicles",
    },
    revenue: {
      today: 2450000,
      thisMonth: 45600000,

      path: "/staff/handover",
    },
    customers: {
      new: 45,
      total: 1250,
      vip: 89,
      trend: "+8.1%",
      path: "/staff/users",
    },
    contracts: {
      active: 18,
      expiring: 3,
      total: 25,
      trend: "+2.4%",
      path: "/staff/contracts",
    },
  };

  const handleStatsCardClick = (path: string) => {
    navigate(path);
  };

  const recentActivities = [
    {
      id: "ACT001",
      type: "booking",
      title: "New Booking Created",
      description: "John Doe booked Toyota Camry",
      time: "2 minutes ago",
      status: "success",
      icon: MdDirectionsCar,
    },
    {
      id: "ACT002",
      type: "contract",
      title: "Contract Renewal",
      description: "ABC Transport renewed contract",
      time: "15 minutes ago",
      status: "info",
      icon: MdBusiness,
    },
    {
      id: "ACT003",
      type: "maintenance",
      title: "Maintenance Completed",
      description: "Honda Civic service finished",
      time: "1 hour ago",
      status: "success",
      icon: GrHostMaintenance,
    },
    {
      id: "ACT004",
      type: "alert",
      title: "Low Battery Alert",
      description: "VinFast Klara needs charging",
      time: "2 hours ago",
      status: "warning",
      icon: MdWarning,
    },
  ];

  const recentBookings = [
    {
      id: "#BK001",
      customer: "John Doe",
      phone: "0901234567",
      email: "john@email.com",
      vehicle: "Toyota Camry",
      licensePlate: "29A-12345",
      date: "Dec 15, 2024",
      time: "09:00 AM",
      status: "confirmed",
      statusColor: "green",
      amount: 450000,
    },
    {
      id: "#BK002",
      customer: "Jane Smith",
      phone: "0912345678",
      email: "jane@email.com",
      vehicle: "Honda Civic",
      licensePlate: "29B-67890",
      date: "Dec 15, 2024",
      time: "10:30 AM",
      status: "pending",
      statusColor: "yellow",
      amount: 380000,
    },
    {
      id: "#BK003",
      customer: "Michael Brown",
      phone: "0923456789",
      email: "michael@email.com",
      vehicle: "BMW X5",
      licensePlate: "29C-11111",
      date: "Dec 14, 2024",
      time: "02:00 PM",
      status: "active",
      statusColor: "blue",
      amount: 850000,
    },
    {
      id: "#BK004",
      customer: "Emily Davis",
      phone: "0934567890",
      email: "emily@email.com",
      vehicle: "Audi A4",
      licensePlate: "29D-22222",
      date: "Dec 14, 2024",
      time: "11:00 AM",
      status: "completed",
      statusColor: "green",
      amount: 520000,
    },
  ];
  const handleViewAllBookings = () => {
    navigate("/staff/handover");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Staff Dashboard
              </h1>
            </div>
            <p className="text-gray-600">
              Welcome back! Here's your performance overview
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <motion.div
                role="button"
                onClick={() => setIsStationDropdownOpen(!isStationDropdownOpen)}
                className="flex items-center space-x-2 hover:text-gray-700 transition-colors bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-300 min-w-[260px]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MdLocationOn className="w-4 h-4" />
                <span className="flex-1 text-left">{selectedStation}</span>
                <motion.div
                  animate={{ rotate: isStationDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MdKeyboardArrowDown className="w-4 h-4" />
                </motion.div>
              </motion.div>

              <AnimatePresence>
                {isStationDropdownOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="py-2">
                      {stations.map((station, index) => (
                        <motion.button
                          key={index}
                          onClick={() => {
                            setSelectedStation(station);
                            setIsStationDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                            selectedStation === station
                              ? "bg-gray-50 text-gray-900 font-medium"
                              : "text-gray-700"
                          }`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: 5 }}
                        >
                          <div className="flex items-center space-x-2">
                            <MdLocationOn className="w-4 h-4" />
                            <span>{station}</span>
                            {selectedStation === station && (
                              <motion.div
                                className="w-2 h-2 bg-green-500 rounded-full ml-auto"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1 }}
                              />
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {[
          {
            title: "Total Vehicles",
            value: stats.vehicles.total,
            icon: MdDirectionsCar,
            color: "blue",
            path: stats.vehicles.path,
            details: [
              `Available: ${stats.vehicles.available}`,
              `Rented: ${stats.vehicles.rented}`,
            ],
          },
          {
            title: "Today's Revenue",
            value: `${(stats.revenue.today / 1000000).toFixed(1)}M`,
            icon: MdAttachMoney,
            color: "green",
            path: stats.revenue.path,
            details: [
              `Monthly: ${(stats.revenue.thisMonth / 1000000).toFixed(1)}M VND`,
            ],
          },
          {
            title: "New Customers",
            value: stats.customers.new,
            icon: MdPersonAdd,
            color: "purple",
            path: stats.customers.path,
            details: [
              `Total: ${stats.customers.total}`,
              `VIP: ${stats.customers.vip}`,
            ],
          },
          {
            title: "Active Contracts",
            value: stats.contracts.active,
            icon: MdBusiness,
            color: "orange",
            path: stats.contracts.path,
            details: [
              `Total: ${stats.contracts.total}`,
              `Expiring: ${stats.contracts.expiring}`,
            ],
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            onClick={() => handleStatsCardClick(stat.path)}
            className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-4">
              <motion.div
                className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center group-hover:bg-${stat.color}-200 transition-colors`}
                whileHover={{ rotate: 5 }}
              >
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </motion.div>
              <div className="text-right">
                <motion.span
                  className="text-2xl font-bold text-gray-900"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  {stat.value}
                </motion.span>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-2 group-hover:text-gray-700 transition-colors">
              {stat.title}
            </h3>
            <div className="flex items-center justify-between text-xs">
              {stat.details.map((detail, i) => (
                <span key={i} className={`text-${stat.color}-600`}>
                  {detail}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {/* Recent Bookings */}
        <motion.div
          className="lg:col-span-2 bg-white rounded-xl border border-gray-100"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <motion.h3
                className="text-lg font-semibold text-gray-900 flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <MdCalendarToday className="w-5 h-5 mr-2" />
                Recent Bookings
              </motion.h3>
              <motion.div
                role="button"
                onClick={handleViewAllBookings}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All
              </motion.div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Booking",
                    "Customer",
                    "Vehicle",
                    "Amount",
                    "Status",
                    "Actions",
                  ].map((header, index) => (
                    <motion.th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                    >
                      {header}
                    </motion.th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.map((booking, index) => (
                  <motion.tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.date} • {booking.time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <motion.div
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-medium text-xs mr-3"
                          whileHover={{ scale: 1.1 }}
                        >
                          {booking.customer
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </motion.div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.customer}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MdPhone className="w-3 h-3 mr-1" />
                            {booking.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.vehicle}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.licensePlate}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.amount.toLocaleString()} VND
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.statusColor === "yellow"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.statusColor === "blue"
                            ? "bg-blue-100 text-blue-800"
                            : booking.statusColor === "green"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1 + index * 0.1 }}
                      >
                        {booking.status}
                      </motion.span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <motion.button
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <MdVisibility className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <MdEdit className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <motion.h3
              className="text-lg font-semibold text-gray-900 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Recent Activities
            </motion.h3>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.status === "success"
                        ? "bg-green-100"
                        : activity.status === "warning"
                        ? "bg-yellow-100"
                        : activity.status === "info"
                        ? "bg-blue-100"
                        : "bg-gray-100"
                    }`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <activity.icon
                      className={`w-4 h-4 ${
                        activity.status === "success"
                          ? "text-green-600"
                          : activity.status === "warning"
                          ? "text-yellow-600"
                          : activity.status === "info"
                          ? "text-blue-600"
                          : "text-gray-600"
                      }`}
                    />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.button
              className="w-full mt-4 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View All Activities
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashboardStaff;
