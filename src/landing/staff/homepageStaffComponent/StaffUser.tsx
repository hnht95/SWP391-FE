import React, { useState } from "react";
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

interface User {
  id: string;
  avatar?: string;
  name: string;
  email: string;
  phone: string;
  type: "regular" | "vip";
  createdAt: string;
  status: "active" | "locked" | "verify";
  cccd?: string;
  rentalCount: number;
  revenue: number;
  feedback?: string;
}

const sampleUsers: User[] = [
  {
    id: "U001",
    name: "Nguyen Van A",
    email: "a.nguyen@email.com",
    phone: "0901234567",
    type: "regular",
    createdAt: "2024-09-01",
    status: "active",
    cccd: "012345678901",
    rentalCount: 12,
    revenue: 3500000,
    feedback: "Very satisfied with service.",
  },
  {
    id: "U002",
    name: "Tran Thi B",
    email: "b.tran@email.com",
    phone: "0912345678",
    type: "vip",
    createdAt: "2024-09-10",
    status: "active",
    cccd: "098765432109",
    rentalCount: 25,
    revenue: 9500000,
    feedback: "Quick support, good vehicles.",
  },
  {
    id: "U003",
    name: "Le Van C",
    email: "c.le@email.com",
    phone: "0923456789",
    type: "regular",
    createdAt: "2024-08-15",
    status: "locked",
    cccd: "123456789012",
    rentalCount: 5,
    revenue: 1200000,
    feedback: "Account locked due to overdue payment.",
  },
  {
    id: "U004",
    name: "Pham Thi D",
    email: "d.pham@email.com",
    phone: "0934567890",
    type: "vip",
    createdAt: "2024-10-05",
    status: "verify",
    cccd: "234567890123",
    rentalCount: 18,
    revenue: 6800000,
    feedback: "Excellent customer service.",
  },
  {
    id: "U005",
    name: "Hoang Van E",
    email: "e.hoang@email.com",
    phone: "0945678901",
    type: "regular",
    createdAt: "2024-11-20",
    status: "active",
    cccd: "345678901234",
    rentalCount: 3,
    revenue: 850000,
    feedback: "Good vehicle quality.",
  },
];

const StaffUser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Quick Stats
  const stats = {
    total: sampleUsers.length,
    vip: sampleUsers.filter((u) => u.type === "vip").length,
    active: sampleUsers.filter((u) => u.status === "active").length,
    locked: sampleUsers.filter((u) => u.status === "locked").length,
    newThisMonth: sampleUsers.filter((u) => u.createdAt.startsWith("2024-12"))
      .length,
  };

  // Filtered users
  const filteredUsers = sampleUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm);
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
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              User Management
            </h1>
            <p className="text-gray-600">
              Manage customer accounts and track user activities
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={openCreate}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2"
            >
              <MdAdd className="w-5 h-5" />
              <span>Create User</span>
            </button>
            <button className="bg-white border border-gray-300 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <MdDownload className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MdPerson className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.total}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-2">Total Users</h3>
          <p className="text-xs text-gray-500">All registered users</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <MdStar className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.vip}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-2">VIP Users</h3>
          <p className="text-xs text-gray-500">Premium customers</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MdCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.active}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-2">Active Users</h3>
          <p className="text-xs text-gray-500">Currently active</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <MdBlock className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.locked}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-2">Locked Users</h3>
          <p className="text-xs text-gray-500">Account restrictions</p>
        </div>
      </div>

      {/* User List Table */}
      <div className="bg-white rounded-xl border border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-100">
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
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <MdFilterList className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
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
            </div>
          )}
        </div>

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
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => openDetail(user)}
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
                        <div className="text-sm text-gray-500">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
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
                    {user.rentalCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetail(user);
                      }}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <MdVisibility className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <MdPerson className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {isDetailOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                User Details - {selectedUser.id}
              </h2>
              <button
                onClick={closeDetail}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-lg p-4">
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
              </div>

              {/* Account Status */}
              <div className="bg-gray-50 rounded-lg p-4">
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
              </div>

              {/* Rental Statistics */}
              <div className="bg-gray-50 rounded-lg p-4">
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
                      {selectedUser.revenue.toLocaleString()} VND
                    </p>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MdInfo className="w-5 h-5 mr-2" />
                  Feedback & Notes
                </h3>
                <p className="text-gray-700">
                  {selectedUser.feedback || "No feedback available."}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <MdLock className="w-4 h-4" />
                    <span>Reset Password</span>
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                    <MdBlock className="w-4 h-4" />
                    <span>
                      {selectedUser.status === "locked"
                        ? "Unlock Account"
                        : "Lock Account"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                onClick={closeDetail}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Form Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Create New User
              </h2>
              <button
                onClick={closeCreate}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CCCD/GPLX
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Type
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent">
                  <option value="regular">Regular</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeCreate}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffUser;
