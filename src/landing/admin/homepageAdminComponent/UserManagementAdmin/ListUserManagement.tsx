import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { MdPeople, MdSearch, MdEmail, MdPhone, MdVisibility, MdCheckCircle, MdCancel, MdAdd, MdWork } from "react-icons/md";
import { PageTransition, FadeIn } from "../../component/animations";
import PageTitle from "../../component/PageTitle";
import { getAllUsers, type UserListFilters, type UserStats as UserStatsType } from "../../../../service/apiAdmin/apiListUser/API";
import { getAllStaffs, createStaff, updateStaff, deleteStaff, type Staff as APIStaff } from "../../../../service/apiAdmin/StaffAPI/API";
import type { RawApiUser } from "../../../../types/userTypes";
import UserDetailModal from "./UserDetailModal";
import UpdateUserModal from "./UpdateUserModal";
import AddStaffModal from "./AddStaffModal";
import UpdateStaffModal from "./UpdateStaffModal";
import SuccessModal from "./SuccessModal";

// Combined interface for unified user/staff management
interface CombinedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "staff" | "renter" | "partner" | "manager" | "technician";
  status: "active" | "inactive";
  joinDate: string;
  type: "user" | "staff";
  station?: string;
  performanceScore?: number;
  // Additional fields for users
  gender?: string;
  defaultRefundWallet?: string;
  kyc?: any;
  avatarUrl?: any;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

const ListUserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all"); // all, user, staff
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [combinedUsers, setCombinedUsers] = useState<CombinedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStatsType | null>(null);
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<CombinedUser | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isUpdateStaffModalOpen, setIsUpdateStaffModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch users and staff
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: UserListFilters = {
        page,
        limit,
      };

      if (selectedRole !== "all") {
        filters.role = selectedRole as any;
      }

      if (selectedStatus !== "all") {
        filters.isActive = selectedStatus === "active";
      }

      // Fetch both users and staff
      const [usersResponse, staffsResponse] = await Promise.all([
        getAllUsers(filters),
        getAllStaffs()
      ]);

      // Convert users to CombinedUser format
      const users: CombinedUser[] = (usersResponse.items || []).map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role as any,
        status: user.isActive ? "active" : "inactive",
        joinDate: user.createdAt,
        type: "user" as const,
        gender: user.gender,
        defaultRefundWallet: user.defaultRefundWallet,
        kyc: user.kyc,
        avatarUrl: user.avatarUrl,
        _id: user._id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isActive: user.isActive,
        station: typeof user.station === 'object' ? user.station?.name : user.station
      }));

      // Convert staff to CombinedUser format
      const staffs: CombinedUser[] = (staffsResponse || []).map(staff => ({
        id: staff._id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role as any,
        status: staff.isActive ? "active" : "inactive",
        joinDate: staff.createdAt || new Date().toISOString(),
        type: "staff" as const,
        station: typeof staff.station === 'object' ? staff.station?.name : staff.station,
        performanceScore: 85, // Default score
        _id: staff._id,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
        isActive: staff.isActive,
        gender: staff.gender
      }));

      // Combine and filter by type
      let combined = [...users, ...staffs];
      
      if (selectedType !== "all") {
        combined = combined.filter(item => item.type === selectedType);
      }

      setCombinedUsers(combined);
      setTotal(combined.length);
      
      // Update stats based on actual data
      setStats({
        total: users.length,
        active: users.filter(u => u.isActive).length,
        byRole: {
          admin: users.filter(u => u.role === "admin").length,
          staff: staffs.length,
          renter: users.filter(u => u.role === "renter").length,
          partner: users.filter(u => u.role === "partner").length,
        }
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
      console.error("Fetch data error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, selectedRole, selectedStatus, selectedType]);

  // Filter combined users by search term
  const filteredUsers = useMemo(() => {
    return combinedUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm);
      return matchesSearch;
    });
  }, [combinedUsers, searchTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleViewDetails = (user: CombinedUser) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedUser(null);
  };

  const handleEdit = (user: CombinedUser) => {
    // Close detail modal and open appropriate edit modal
    setIsDetailModalOpen(false);
    setSelectedUser(user);
    
    if (user.type === "staff") {
      setIsUpdateStaffModalOpen(true);
    } else {
      setIsEditModalOpen(true);
    }
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setIsUpdateStaffModalOpen(false);
    setSelectedUser(null);
  };

  const handleEditSuccess = () => {
    fetchData();
    setIsEditModalOpen(false);
    setIsUpdateStaffModalOpen(false);
    setSelectedUser(null);
  };

  const handleAddStaffSuccess = () => {
    fetchData();
    setIsAddStaffModalOpen(false);
    setShowSuccessModal(true);
    setSuccessMessage("Staff added successfully!");
  };

  const handleUpdateStaffSuccess = () => {
    fetchData();
    setIsUpdateStaffModalOpen(false);
    setSelectedUser(null);
    setShowSuccessModal(true);
    setSuccessMessage("Staff updated successfully!");
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "staff":
        return "bg-blue-100 text-blue-800";
      case "manager":
        return "bg-purple-100 text-purple-800";
      case "technician":
        return "bg-orange-100 text-orange-800";
      case "renter":
        return "bg-green-100 text-green-800";
      case "partner":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "user":
        return "bg-blue-100 text-blue-800";
      case "staff":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statsData = [
    {
      label: "Total Users",
      value: stats?.total || 0,
      icon: <MdPeople className="w-6 h-6 text-purple-600" />,
      bg: "bg-purple-100",
    },
    {
      label: "Total Staff",
      value: stats?.byRole?.staff || 0,
      icon: <MdWork className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-100",
    },
  ];

  const headers = ["User", "Contact", "Role", "Type", "Status", "Join Date", "Actions"];

  const totalPages = Math.ceil(total / limit);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <PageTitle
            title="User Management"
            subtitle="Manage all users and staff including admins, staff, renters, and partners"
            icon={<MdPeople className="w-7 h-7 text-gray-700" />}
          />
          <div className="flex items-center space-x-3">
            <FadeIn delay={0.3}>
              <button 
                onClick={() => setIsAddStaffModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <MdAdd className="w-5 h-5" />
                <span>Add Staff</span>
              </button>
            </FadeIn>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {statsData.map((stat, index) => (
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
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value.toLocaleString()}
                  </p>
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
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-2 focus:border-black bg-white"
              >
                <option value="all">All Types</option>
                <option value="user">Users</option>
                <option value="staff">Staff</option>
              </select>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-2 focus:border-black bg-white"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="technician">Technician</option>
                <option value="renter">Renter</option>
                <option value="partner">Partner</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-2 focus:border-black bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </FadeIn>

        {/* Users Table */}
        <motion.div
          className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <MdCancel className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-slate-200">
                    <tr>
                      {headers.map((header, index) => (
                        <motion.th
                          key={header}
                          className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                            header === "Actions" ? "text-center" : "text-left"
                          }`}
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
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          className="hover:bg-gray-50 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.2 + index * 0.05 }}
                          whileHover={{ x: 5 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                {user.avatarUrl && typeof user.avatarUrl === 'object' && user.avatarUrl?.url ? (
                                  <img
                                    src={user.avatarUrl.url}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-purple-600 font-semibold">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {user.id.slice(-8)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center space-x-1">
                              <MdEmail className="w-4 h-4 text-gray-400" />
                              <span>{user.email}</span>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center space-x-1">
                              <MdPhone className="w-4 h-4 text-gray-400" />
                              <span>{user.phone}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                                user.role
                              )}`}
                            >
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(
                                user.type
                              )}`}
                            >
                              {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {user.status === "active" ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.joinDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button 
                              onClick={() => handleViewDetails(user)}
                              className="inline-flex items-center justify-center text-gray-900 hover:text-black transition-colors"
                            >
                              <MdVisibility className="w-5 h-5" />
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} users
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || loading}
                      className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || loading}
                      className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isDetailModalOpen && !isEditModalOpen && !isUpdateStaffModalOpen}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
      />

      <UpdateUserModal
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={handleCloseEdit}
        onSuccess={handleEditSuccess}
      />

      <AddStaffModal
        isOpen={isAddStaffModalOpen}
        onClose={() => setIsAddStaffModalOpen(false)}
        onSuccess={handleAddStaffSuccess}
      />

      <UpdateStaffModal
        isOpen={isUpdateStaffModalOpen}
        onClose={handleCloseEdit}
        staff={selectedUser}
        onSuccess={handleUpdateStaffSuccess}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />
    </PageTransition>
  );
};

export default ListUserManagement;