import React, { useState } from "react";
import { motion } from "framer-motion";
import { MdPeople, MdSearch, MdEmail, MdPhone, MdHistory } from "react-icons/md";
import { PageTransition, FadeIn } from "../component/animations";
import PageTitle from "../component/PageTitle";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalRentals: number;
  totalSpent: number;
  status: "active" | "inactive";
  joinDate: string;
}

const CustomerManagementAdmin: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Mock data
  const customers: Customer[] = [
    {
      id: "CUS001",
      name: "David Williams",
      email: "davidw@email.com",
      phone: "0901234567",
      totalRentals: 15,
      totalSpent: 45000000,
      status: "active",
      joinDate: "15/01/2024",
    },
    {
      id: "CUS002",
      name: "Emily Davis",
      email: "emilyd@email.com",
      phone: "0912345678",
      totalRentals: 8,
      totalSpent: 28000000,
      status: "active",
      joinDate: "20/02/2024",
    },
    {
      id: "CUS003",
      name: "James Wilson",
      email: "jamesw@email.com",
      phone: "0923456789",
      totalRentals: 3,
      totalSpent: 9000000,
      status: "inactive",
      joinDate: "10/03/2024",
    },
  ];

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    const matchesStatus =
      selectedStatus === "all" || customer.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const stats = [
    { label: "Total Customers", value: "8,549", icon: <MdPeople className="w-6 h-6 text-purple-600" />, bg: "bg-purple-100" },
    { label: "Active Customers", value: "6,234", icon: <MdPeople className="w-6 h-6 text-green-600" />, bg: "bg-green-100" },
    { label: "New This Month", value: "342", icon: <MdPeople className="w-6 h-6 text-blue-600" />, bg: "bg-blue-100" },
    { label: "Avg Revenue/Customer", value: "$2.8K", icon: <MdHistory className="w-6 h-6 text-orange-600" />, bg: "bg-orange-100" },
  ];

  const headers = ["Customer", "Contact", "Total Rentals", "Total Spent", "Status", "Join Date", "Actions"];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <PageTitle
            title="Customer Management"
            subtitle="Manage customer information and vehicle rental history"
            icon={<MdPeople className="w-7 h-7 text-gray-700" />}
          />
          <FadeIn delay={0.3}>
            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 hover:shadow-lg hover:scale-105">
              <MdEmail className="w-5 h-5" />
              <span>Send Notification</span>
            </button>
          </FadeIn>
        </div>

        {/* Stats Cards - Timing giống Staff */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <FadeIn delay={0.7}>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-2 focus:border-black bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </FadeIn>

        {/* Customer Table */}
        <motion.div
          className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-slate-200">
                <tr>
                  {headers.map((header, index) => (
                    <motion.th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.05 }}
                    >
                      {header}
                    </motion.th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
                    className="hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">
                          {customer.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center space-x-1">
                      <MdEmail className="w-4 h-4 text-gray-400" />
                      <span>{customer.email}</span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-1">
                      <MdPhone className="w-4 h-4 text-gray-400" />
                      <span>{customer.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {customer.totalRentals} times
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(customer.totalSpent)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        customer.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {customer.status === "active"
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.joinDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-purple-600 hover:text-purple-900">
                        View Details
                      </button>
                    </td>
                  </motion.tr>
                ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    );
  };

  export default CustomerManagementAdmin;
