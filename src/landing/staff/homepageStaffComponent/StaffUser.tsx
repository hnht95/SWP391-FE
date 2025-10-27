import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdPerson, MdAdd } from "react-icons/md";
import { getAllUsers } from "../../../service/apiUser/auth/API";
import {
  UserStatsCards,
  UserFilters,
  UserTable,
  UserDetailModal,
  CreateUserModal,
  calculateUserStats,
  type User,
  type RawApiUser,
} from "../userComponent";

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

  // Fetch users from API
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const data = await getAllUsers({ page, limit: pageSize });
        // Map BE fields to UI User type
        const mapped = (data.items || []).map((u: RawApiUser) => ({
          id: u._id,
          avatar:
            typeof u.avatarUrl === "object" && u.avatarUrl !== null
              ? u.avatarUrl.url
              : typeof u.avatarUrl === "string"
              ? u.avatarUrl
              : null,
          name: u.name,
          email: u.email,
          phone: u.phone,
          type: u.role || "regular",
          createdAt: u.createdAt || "",
          updatedAt: u.updatedAt || "",
          status: u.isActive ? "active" : "locked",
          gender: u.gender,
          station: u.station,
          kyc: u.kyc,
          defaultRefundWallet: u.defaultRefundWallet,
          cccd: u.cccd,
          rentalCount: u.rentalCount || 0,
          revenue: u.revenue || 0,
          feedback: u.feedback,
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

  // Calculate stats from users
  const stats = calculateUserStats(users);

  // Filter users based on search and status (client-side)
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

  // Open detail modal
  const openDetail = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  // Close detail modal
  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedUser(null);
  };

  // Open create user modal
  const openCreate = () => setIsCreateOpen(true);
  const closeCreate = () => setIsCreateOpen(false);

  // Handle create user success
  const handleCreateSuccess = (newUsers: User[], newTotal: number) => {
    setUsers(newUsers);
    setTotal(newTotal);
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
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <UserStatsCards stats={stats} />

      {/* User List Table */}
      <motion.div
        className="bg-white rounded-xl border border-gray-100 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="p-6 border-b border-gray-100 space-y-4">
          {/* Filters */}
          <UserFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />

          {/* User Table */}
          <UserTable
            users={filteredUsers}
            loading={loading}
            onViewDetail={openDetail}
          />

          {/* Pagination Controls */}
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
        {isDetailOpen && (
          <UserDetailModal
            user={selectedUser}
            isOpen={isDetailOpen}
            onClose={closeDetail}
          />
        )}
      </AnimatePresence>

      {/* Create User Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <CreateUserModal
            isOpen={isCreateOpen}
            onClose={closeCreate}
            onSuccess={handleCreateSuccess}
            currentPage={page}
            pageSize={pageSize}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffUser;
