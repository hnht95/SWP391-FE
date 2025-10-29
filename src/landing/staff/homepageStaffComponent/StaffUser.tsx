import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdPerson,
  MdAdd,
  MdLocationOn,
  MdFilterList,
  MdViewModule,
  MdViewList,
  MdCheckCircle,
  MdWarning,
  MdSearch,
  MdDirectionsCar,
  MdEmail,
  MdPhone,
  MdVerifiedUser,
} from "react-icons/md";
import staffAPI from "../../../service/apiStaff/API";
import useDebounce from "../../../hooks/useDebounce";
import {
  UserDetailModal,
  CreateUserModal,
  type User,
  type RawApiUser,
  type UserKyc,
} from "../userComponent";
import CustomSelect from "../../../components/CustomSelect";

const StaffUser = () => {
  // Helper to get KYC status from kyc object
  const getKycStatus = (
    kyc: UserKyc | null | undefined
  ): "pending" | "approved" | "rejected" | "none" => {
    if (!kyc || !kyc.idNumber) return "none";
    if (kyc.verified) return "approved";
    if (kyc.verifiedAt === null) return "pending";
    return "rejected";
  };

  // Active tab state
  const [activeTab, setActiveTab] = useState<"all-users" | "kyc-verification">(
    "all-users"
  );

  // UI state

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  // All Users tab states
  const [userStatusFilter, setUserStatusFilter] = useState<
    "all" | "active" | "pending" | "verified" | "rejected"
  >("all");

  // KYC Verification tab states
  const [kycStatusFilter, setKycStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Fetch users from API
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const data = await staffAPI.getRenters({
          page,
          limit: pageSize,
          search: debouncedSearch,
        });
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
  }, [page, pageSize, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Filter users based on active tab and status
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone &&
        user.phone.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === "all-users") {
      if (userStatusFilter === "all") return matchesSearch;
      if (userStatusFilter === "active")
        return matchesSearch && user.status === "active";
      if (userStatusFilter === "pending")
        return matchesSearch && user.status === "locked";
      if (userStatusFilter === "verified")
        return matchesSearch && getKycStatus(user.kyc) === "approved";
      if (userStatusFilter === "rejected")
        return matchesSearch && getKycStatus(user.kyc) === "rejected";
      return matchesSearch;
    } else {
      // KYC tab - only show users who have submitted KYC
      const kycStat = getKycStatus(user.kyc);
      if (kycStat === "none") return false;
      if (kycStatusFilter === "all") return matchesSearch;
      return matchesSearch && kycStat === kycStatusFilter;
    }
  });

  // Stats for All Users tab
  const userStats = {
    all: users.length,
    active: users.filter((u) => u.status === "active").length,
    pending: users.filter((u) => u.status === "locked").length,
    verified: users.filter((u) => getKycStatus(u.kyc) === "approved").length,
    rejected: users.filter((u) => getKycStatus(u.kyc) === "rejected").length,
  };

  // Stats for KYC tab
  const kycStats = {
    all: users.filter((u) => getKycStatus(u.kyc) !== "none").length,
    pending: users.filter((u) => getKycStatus(u.kyc) === "pending").length,
    approved: users.filter((u) => getKycStatus(u.kyc) === "approved").length,
    rejected: users.filter((u) => getKycStatus(u.kyc) === "rejected").length,
  };

  const openDetail = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedUser(null);
  };

  const openCreate = () => setIsCreateOpen(true);
  const closeCreate = () => setIsCreateOpen(false);

  const handleCreateSuccess = (newUsers: User[], newTotal: number) => {
    setUsers(newUsers);
    setTotal(newTotal);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return {
          color: "bg-green-100 text-green-800",
          label: "Active",
          icon: MdCheckCircle,
        };
      case "locked":
        return {
          color: "bg-red-100 text-red-800",
          label: "Locked",
          icon: MdWarning,
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          label: status,
          icon: MdPerson,
        };
    }
  };

  const getKycStatusBadge = (kycStat: string) => {
    switch (kycStat) {
      case "approved":
        return {
          color: "bg-green-100 text-green-800",
          label: "Approved",
          icon: MdCheckCircle,
        };
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800",
          label: "Pending Review",
          icon: MdWarning,
        };
      case "rejected":
        return {
          color: "bg-red-100 text-red-800",
          label: "Rejected",
          icon: MdWarning,
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          label: "Not Submitted",
          icon: MdPerson,
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              View and manage customer accounts and KYC verification requests
            </p>
          </div>
          <motion.button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MdAdd className="w-4 h-4" />
            <span>New User</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {(
              [
                { id: "all-users", label: "All Users", count: userStats.all },
                {
                  id: "kyc-verification",
                  label: "KYC Verification",
                  count: kycStats.all,
                },
              ] as Array<{ id: typeof activeTab; label: string; count: number }>
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                  activeTab === tab.id
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Content based on active tab */}
      <AnimatePresence mode="wait">
        {activeTab === "all-users" && (
          <motion.div
            key="all-users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Users Display */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  No users found
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredUsers.map((user, idx) => {
                    const statusBadge = getStatusBadge(user.status);
                    const StatusIcon = statusBadge.icon;
                    return (
                      <motion.div
                        key={user.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.03 * idx }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <MdPerson className="w-6 h-6 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {user.name}
                              </h3>
                              <p className="text-xs text-gray-500">
                                ID: {user.id.substring(0, 8)}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </span>
                        </div>

                        <div className="space-y-2 mb-3 text-sm">
                          <div className="flex items-center text-gray-700">
                            <MdEmail className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-xs text-gray-500 mr-1">
                              Email:
                            </span>
                            <span className="font-medium text-gray-900 truncate">
                              {user.email}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <MdPhone className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-xs text-gray-500 mr-1">
                              Phone:
                            </span>
                            <span className="font-medium text-gray-900">
                              {user.phone || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <MdDirectionsCar className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-xs text-gray-500 mr-1">
                              Rentals:
                            </span>
                            <span className="font-medium text-gray-900">
                              {user.rentalCount} trips
                            </span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <MdLocationOn className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-xs text-gray-500 mr-1">
                              Station:
                            </span>
                            <span className="font-medium text-gray-900">
                              {user.station?.name || "N/A"}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => openDetail(user)}
                          className="w-full py-2 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors font-medium"
                        >
                          View Details
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        {[
                          "User",
                          "Email",
                          "Phone",
                          "Status",
                          "Rentals",
                          "Station",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => {
                        const statusBadge = getStatusBadge(user.status);
                        const StatusIcon = statusBadge.icon;
                        return (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {user.avatar ? (
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <MdPerson className="w-4 h-4 text-gray-500" />
                                  </div>
                                )}
                                <span className="font-medium text-gray-900">
                                  {user.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {user.email}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {user.phone || "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusBadge.color}`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {statusBadge.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {user.rentalCount}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {user.station?.name || "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => openDetail(user)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "kyc-verification" && (
          <motion.div
            key="kyc-verification"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* KYC Display */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">Loading KYC submissions...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  No KYC submissions found
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredUsers.map((user, idx) => {
                    const kycStat = getKycStatus(user.kyc);
                    const kycBadge = getKycStatusBadge(kycStat);
                    const KycIcon = kycBadge.icon;
                    return (
                      <motion.div
                        key={user.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.03 * idx }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <MdPerson className="w-6 h-6 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {user.name}
                              </h3>
                              <p className="text-xs text-gray-500">
                                ID: {user.id.substring(0, 8)}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${kycBadge.color}`}
                          >
                            <KycIcon className="w-3 h-3" />
                            {kycBadge.label}
                          </span>
                        </div>

                        <div className="space-y-2 mb-3 text-sm">
                          <div className="flex items-center text-gray-700">
                            <MdEmail className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-xs text-gray-500 mr-1">
                              Email:
                            </span>
                            <span className="font-medium text-gray-900 truncate">
                              {user.email}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <MdVerifiedUser className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-xs text-gray-500 mr-1">
                              CCCD:
                            </span>
                            <span className="font-medium text-gray-900">
                              {user.cccd || "N/A"}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                            <div>
                              <span className="text-gray-500">Submission</span>
                              <div className="mt-1 px-2 py-1 border rounded bg-gray-50 text-gray-900">
                                {user.kyc?.idNumber
                                  ? user.createdAt
                                    ? new Date(
                                        user.createdAt
                                      ).toLocaleDateString()
                                    : "N/A"
                                  : "N/A"}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Verification
                              </span>
                              <div className="mt-1 px-2 py-1 border rounded bg-gray-50 text-gray-900">
                                {user.kyc?.verifiedAt
                                  ? new Date(
                                      user.kyc.verifiedAt
                                    ).toLocaleDateString()
                                  : "Pending"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {kycStat === "pending" && (
                          <div className="flex gap-2 mb-2">
                            <button className="flex-1 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition-colors font-medium">
                              Approve
                            </button>
                            <button className="flex-1 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition-colors font-medium">
                              Reject
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => openDetail(user)}
                          className="w-full py-2 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors font-medium"
                        >
                          View Documents
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        {[
                          "User",
                          "Email",
                          "CCCD",
                          "Status",
                          "Submitted",
                          "Verified",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => {
                        const kycStat = getKycStatus(user.kyc);
                        const kycBadge = getKycStatusBadge(kycStat);
                        const KycIcon = kycBadge.icon;
                        return (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {user.avatar ? (
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <MdPerson className="w-4 h-4 text-gray-500" />
                                  </div>
                                )}
                                <span className="font-medium text-gray-900">
                                  {user.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {user.email}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {user.cccd || "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${kycBadge.color}`}
                              >
                                <KycIcon className="w-3 h-3" />
                                {kycBadge.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {user.kyc?.idNumber
                                ? user.createdAt
                                  ? new Date(
                                      user.createdAt
                                    ).toLocaleDateString()
                                  : "N/A"
                                : "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {user.kyc?.verifiedAt
                                ? new Date(
                                    user.kyc.verifiedAt
                                  ).toLocaleDateString()
                                : "Pending"}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => openDetail(user)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                View Documents
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {!loading && filteredUsers.length > 0 && (
        <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <CustomSelect
                value={pageSize}
                options={[
                  { value: 10, label: "10" },
                  { value: 20, label: "20" },
                  { value: 50, label: "50" },
                ]}
                onChange={(v: string | number) => {
                  setPageSize(Number(v));
                  setPage(1);
                }}
                className="w-20"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                First
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Prev
              </button>
              <span className="text-sm text-gray-700">
                Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(Math.ceil(total / pageSize), p + 1))
                }
                disabled={page >= Math.ceil(total / pageSize)}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
              <button
                onClick={() => setPage(Math.ceil(total / pageSize))}
                disabled={page >= Math.ceil(total / pageSize)}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Last
              </button>
            </div>

            <div className="text-sm text-gray-500">
              Showing {Math.min((page - 1) * pageSize + 1, total)}-
              {Math.min(page * pageSize, total)} of {total}
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      <AnimatePresence>
        {isDetailOpen && selectedUser && (
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
