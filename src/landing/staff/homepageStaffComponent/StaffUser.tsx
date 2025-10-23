import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdSearch,
  MdPerson,
  MdLock,
  MdCheckCircle,
  MdBlock,
  MdStar,
  MdClose,
  MdAdd,
  MdDownload,
  MdEmail,
  MdPhone,
  MdCalendarToday,
  MdInfo,
  MdFilterList,
  MdVisibility,
} from "react-icons/md";
import { getAllUsers } from "../../../service/apiUser/API";

interface User {
  id: string;
  avatar?: string | null;
  name: string;
  email: string;
  phone: string;
  type: "regular" | "vip" | "staff";
  createdAt: string;
  status: "active" | "locked" | "verify";
  cccd?: string;
  rentalCount?: number;
  revenue?: number;
  feedback?: string;
  gender?: string;
  station?: { _id: string; name: string };
}

const StaffUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        // Pass pagination params to API
        const data = await getAllUsers({ page, limit: pageSize });
        // Map BE fields to UI User type
        type ApiUser = {
          _id: string;
          avatarUrl?: string | null;
          name: string;
          email: string;
          phone: string;
          role?: "regular" | "vip" | "staff";
          createdAt?: string;
          isActive?: boolean;
          cccd?: string;
          rentalCount?: number;
          revenue?: number;
          feedback?: string;
          gender?: string;
          station?: { _id: string; name: string };
        };
        const mapped = (data.items || []).map((u: ApiUser) => ({
          id: u._id,
          avatar: u.avatarUrl,
          name: u.name,
          email: u.email,
          phone: u.phone,
          type: u.role || "regular",
          createdAt: u.createdAt ? u.createdAt.split("T")[0] : "",
          status: u.isActive ? "active" : "locked",
          cccd: u.cccd,
          rentalCount: u.rentalCount || 0,
          revenue: u.revenue || 0,
          feedback: u.feedback,
          gender: u.gender,
          station: u.station,
        }));
        setUsers(mapped);
        setTotal(data.total || 0);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
        setTotal(0);
      }
      setLoading(false);
    }
    fetchUsers();
  }, [page, pageSize]);

  // Quick Stats
  const stats = {
    total: users.length,
    vip: users.filter((u) => u.type === "vip").length,
    active: users.filter((u) => u.status === "active").length,
    locked: users.filter((u) => u.status === "locked").length,
    newThisMonth: users.filter(
      (u) => u.createdAt && u.createdAt.startsWith("2024-12")
    ).length,
  };

  // Filtered users (client-side for search/filter, but BE pagination)
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));
    const matchesStatus =
      selectedStatus === "all" || u.status === selectedStatus;
    const matchesType = selectedType === "all" || u.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Status badge color
  const getStatusBadge = (status: string) => {
    if (status === "active") return "bg-green-100 text-green-800";
    if (status === "locked") return "bg-red-100 text-red-800";
    if (status === "verify") return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  // Open detail
  const openDetail = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  // Close detail
  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedUser(null);
  };

  // Open create user form
  const openCreate = () => setIsCreateOpen(true);
  const closeCreate = () => setIsCreateOpen(false);

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <MdPerson className="w-8 h-8 mr-3 text-blue-600" />
              User Management
            </h1>
            <p className="text-gray-600">
              Manage customer accounts and track user activities
            </p>
          </div>
          <div className="flex space-x-3">
            <motion.button
              onClick={openCreate}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MdAdd className="w-5 h-5" />
              <span>Create User</span>
            </motion.button>
            <motion.button
              className="bg-white border border-gray-300 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MdDownload className="w-5 h-5" />
              <span>Export</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {[
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
        ].map((stat, index) => (
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

      {/* User List Table */}
      <motion.div
        className="bg-white rounded-xl border border-gray-100 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <h3 className="text-lg font-semibold text-gray-900">User List</h3>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              {/* Search */}
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              {/* Filter Button */}
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MdFilterList className="w-5 h-5" />
                <span>Filters</span>
              </motion.button>
            </div>
          </div>

          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="mt-4 pt-4 border-t border-gray-100"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="locked">Locked</option>
                      <option value="verify">Need Verify</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="all">All Types</option>
                      <option value="regular">Regular</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Table and Pagination */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rentals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => openDetail(user)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: "#f9fafb" }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <MdPerson className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.type === "vip"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.type === "vip" ? "VIP" : "Regular"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {user.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            user.status
                          )}`}
                        >
                          {user.status === "active" && "Active"}
                          {user.status === "locked" && "Locked"}
                          {user.status === "verify" && "Need Verify"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {user.rentalCount ?? "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(user);
                          }}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <MdVisibility className="w-5 h-5" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && !loading && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <MdPerson className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          )}

          {/* Pagination Controls - Redesigned */}
          <div className="flex items-center justify-between mt-4">
            {/* Rows per page */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <select
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            {/* Pagination navigation */}
            <div className="flex items-center space-x-2">
              <button
                className="px-2 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                &#171;
              </button>
              <button
                className="px-2 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">Page</span>
              <input
                type="number"
                min={1}
                max={Math.max(1, Math.ceil(total / pageSize))}
                value={page}
                onChange={(e) => {
                  let val = Number(e.target.value);
                  if (isNaN(val) || val < 1) val = 1;
                  if (val > Math.ceil(total / pageSize))
                    val = Math.ceil(total / pageSize);
                  setPage(val);
                }}
                className="w-12 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none"
                style={{ MozAppearance: "textfield" }}
              />
              <span className="text-sm text-gray-700">
                of {Math.max(1, Math.ceil(total / pageSize))}
              </span>
              <button
                className="px-2 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
                onClick={() =>
                  setPage((p) => Math.min(Math.ceil(total / pageSize), p + 1))
                }
                disabled={page >= Math.ceil(total / pageSize)}
              >
                Next
              </button>
              <button
                className="px-2 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
                onClick={() => setPage(Math.ceil(total / pageSize))}
                disabled={page >= Math.ceil(total / pageSize)}
              >
                &#187;
              </button>
            </div>
            {/* Range info */}
            <div className="text-sm text-gray-500">
              {total > 0 && (
                <span>
                  {Math.min((page - 1) * pageSize + 1, total)}-
                  {Math.min(page * pageSize, total)} of {total} users
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {isDetailOpen && selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  User Details - {selectedUser.id}
                </h2>
                <motion.button
                  onClick={closeDetail}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MdClose className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <motion.div
                  className="bg-gray-50 rounded-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MdPerson className="w-5 h-5 mr-2" />
                    Personal Information
                  </h3>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      {selectedUser.avatar ? (
                        <img
                          src={selectedUser.avatar}
                          alt={selectedUser.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <MdPerson className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {selectedUser.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedUser.type === "vip"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedUser.type === "vip"
                          ? "VIP Customer"
                          : "Regular Customer"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Email
                      </label>
                      <p className="text-gray-900 flex items-center">
                        <MdEmail className="w-4 h-4 mr-1" />
                        {selectedUser.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Phone
                      </label>
                      <p className="text-gray-900 flex items-center">
                        <MdPhone className="w-4 h-4 mr-1" />
                        {selectedUser.phone}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        CCCD
                      </label>
                      <p className="text-gray-900">{selectedUser.cccd}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Created At
                      </label>
                      <p className="text-gray-900 flex items-center">
                        <MdCalendarToday className="w-4 h-4 mr-1" />
                        {selectedUser.createdAt}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Account Status */}
                <motion.div
                  className="bg-gray-50 rounded-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Account Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Status
                      </label>
                      <span
                        className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          selectedUser.status
                        )}`}
                      >
                        {selectedUser.status === "active" && "Active"}
                        {selectedUser.status === "locked" && "Locked"}
                        {selectedUser.status === "verify" && "Need Verify"}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Account Type
                      </label>
                      <span
                        className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                          selectedUser.type === "vip"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedUser.type === "vip" ? "VIP" : "Regular"}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Rental Statistics */}
                <motion.div
                  className="bg-gray-50 rounded-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Rental Statistics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Total Rentals
                      </label>
                      <p className="text-gray-900 font-semibold text-lg">
                        {selectedUser.rentalCount}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Total Revenue
                      </label>
                      <p className="text-gray-900 font-semibold text-lg">
                        {selectedUser.revenue
                          ? selectedUser.revenue.toLocaleString() + " VND"
                          : "-"}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Feedback */}
                <motion.div
                  className="bg-gray-50 rounded-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MdInfo className="w-5 h-5 mr-2" />
                    Feedback & Notes
                  </h3>
                  <p className="text-gray-700">
                    {selectedUser.feedback || "No feedback available."}
                  </p>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  className="bg-gray-50 rounded-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <motion.button
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MdLock className="w-4 h-4" />
                      <span>Reset Password</span>
                    </motion.button>
                    <motion.button
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MdBlock className="w-4 h-4" />
                      <span>
                        {selectedUser.status === "locked"
                          ? "Unlock Account"
                          : "Lock Account"}
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
                <motion.button
                  onClick={closeDetail}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create User Form Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Create New User
                </h2>
                <motion.button
                  onClick={closeCreate}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MdClose className="w-6 h-6" />
                </motion.button>
              </div>
              <form className="p-6 space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CCCD/GPLX
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Type
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent">
                    <option value="regular">Regular</option>
                    <option value="vip">VIP</option>
                  </select>
                </motion.div>
                <div className="flex justify-end space-x-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={closeCreate}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Create Account
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffUser;
