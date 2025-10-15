import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MdWork,
  MdAdd,
  MdSearch,
  MdEmail,
  MdPhone,
  MdStar,
} from "react-icons/md";
import { PageTransition, FadeIn } from "../../component/animations";
import PageTitle from "../../component/PageTitle";
import AddStaffModal from "./AddStaffModal";
import UpdateStaffModal from "./UpdateStaff";
import SuccessModal from "./SuccessModal";
import {
  getAllStaffs,
  type Staff as APIStaff,
} from "../../../../service/apiAdmin/StaffAPI/API";

// ✅ UI Staff interface
interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "manager" | "staff" | "technician" | "renter";
  station: string;
  performanceScore: number;
  status: "active" | "inactive";
  joinDate: string;
}

const StaffManagementAdmin: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.station.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || staff.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: Staff["role"]) => {
    const config = {
      manager: {
        color: "bg-blue-100 text-blue-700 border-2 border-blue-500",
        text: "Manager",
      },
      staff: { color: "bg-gray-200 text-gray-800", text: "Staff" },
      technician: { color: "bg-gray-600 text-white", text: "Technician" },
      renter: { color: "bg-green-100 text-green-700", text: "Renter" },
    };
    return config[role] || config.staff;
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    if (score >= 20) return "text-orange-600";
    return "text-red-600";
  };

  const getPerformanceBarColor = (score: number) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 50) return "bg-yellow-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-600";
  };

  const fetchStaffList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllStaffs();

      console.log("✅ Fetched raw data:", data);

      // ✅ Convert API response to UI format with station handling
      const convertedStaff: Staff[] = data.map((staff: APIStaff) => {
        // ✅ Handle station - can be string (ObjectId) or object (populated)
        let stationName = "Unknown Station";

        if (typeof staff.station === "string") {
          stationName = staff.station; // ObjectId as string
        } else if (staff.station && typeof staff.station === "object") {
          // Station is populated object
          stationName =
            (staff.station as any).name ||
            (staff.station as any)._id ||
            "Unknown Station";
        }

        return {
          id: staff._id,
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          role: staff.role as Staff["role"],
          station: stationName, // ✅ Always string now
          performanceScore: 85,
          status: (staff.isActive ? "active" : "inactive") as
            | "active"
            | "inactive",
          joinDate: staff.createdAt
            ? new Date(staff.createdAt).toLocaleDateString()
            : new Date().toLocaleDateString(),
        };
      });

      console.log("✅ Converted staff:", convertedStaff);

      setStaffList(convertedStaff);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch staff list"
      );
      console.error("❌ Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffList();
  }, []);

  const handleAddStaffSuccess = () => {
    fetchStaffList();
    setSuccessMessage("Staff added successfully!");
    setShowSuccessModal(true);
  };

  const handleViewDetails = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateStaffSuccess = () => {
    fetchStaffList();
    setSuccessMessage("Staff updated successfully!");
    setShowSuccessModal(true);
  };

  // ✅ Stats calculations
  const totalStaff = staffList.length;
  const activeStaff = staffList.filter(
    (staff) => staff.status === "active"
  ).length;
  const avgPerformance =
    staffList.length > 0
      ? Math.round(
          staffList.reduce((sum, staff) => sum + staff.performanceScore, 0) /
            staffList.length
        )
      : 0;
  const newThisMonth = staffList.filter((staff) => {
    const joinDate = new Date(staff.joinDate);
    const now = new Date();
    return (
      joinDate.getMonth() === now.getMonth() &&
      joinDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const stats = [
    {
      label: "Total Staff",
      value: totalStaff.toString(),
      icon: <MdWork className="w-6 h-6 text-blue-600" />,
      gradient: "from-blue-50 to-white",
      border: "border-l-4 border-blue-500",
    },
    {
      label: "Active Staff",
      value: activeStaff.toString(),
      icon: <MdWork className="w-6 h-6 text-green-600" />,
      gradient: "from-green-50 to-white",
      border: "border-l-4 border-green-500",
    },
    {
      label: "Avg Performance",
      value: `${avgPerformance}%`,
      icon: <MdStar className="w-6 h-6 text-purple-600" />,
      gradient: "from-purple-50 to-white",
      border: "border-l-4 border-purple-500",
    },
    {
      label: "New This Month",
      value: newThisMonth.toString(),
      icon: <MdAdd className="w-6 h-6 text-orange-600" />,
      gradient: "from-orange-50 to-white",
      border: "border-l-4 border-orange-500",
    },
  ];

  const headers = [
    "Staff",
    "Contact",
    "Role",
    "Work Location",
    "Performance",
    "Status",
    "Actions",
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <PageTitle
            title="Staff Management"
            subtitle="Manage staff information and work performance"
            icon={<MdWork className="w-7 h-7 text-gray-700" />}
          />
          <FadeIn delay={0.3}>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <MdAdd className="w-5 h-5" />
              <span>Add Staff</span>
            </button>
          </FadeIn>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className={`bg-gradient-to-br ${stat.gradient} rounded-lg shadow-sm hover:shadow-md border ${stat.border} p-5 transition-all duration-300`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -3, scale: 1.01, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <FadeIn delay={0.7}>
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-md border-2 border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 relative">
                <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, work location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-0 focus:border-blue-500 transition-all shadow-sm hover:shadow-md bg-white"
                />
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-5 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 bg-white font-medium transition-all shadow-sm hover:shadow-md min-w-[160px]"
              >
                <option value="all">All Roles</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
                <option value="technician">Technician</option>
                <option value="renter">Renter</option>
              </select>
            </div>
          </div>
        </FadeIn>

        {/* Staff Table */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-500">Loading staff list...</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-500 mb-4">{error}</div>
              <button
                onClick={fetchStaffList}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : staffList.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No staff members found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300">
                  <tr>
                    {headers.map((header, index) => (
                      <motion.th
                        key={header}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
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
                  {filteredStaff.map((staff, index) => {
                    const roleBadge = getRoleBadge(staff.role);
                    return (
                      <motion.tr
                        key={staff.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 border-b border-gray-100"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                        whileHover={{ x: 4, transition: { duration: 0.2 } }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-sm">
                                {staff.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {staff.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {staff.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center space-x-1">
                            <MdEmail className="w-4 h-4 text-gray-400" />
                            <span>{staff.email}</span>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-1">
                            <MdPhone className="w-4 h-4 text-gray-400" />
                            <span>{staff.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge.color}`}
                          >
                            {roleBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {staff.station}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
                              <motion.div
                                className={`h-2 rounded-full ${getPerformanceBarColor(
                                  staff.performanceScore
                                )}`}
                                initial={{ width: "0%" }}
                                animate={{
                                  width: `${staff.performanceScore}%`,
                                }}
                                transition={{
                                  delay: 1.4 + index * 0.1,
                                  duration: 0.8,
                                  ease: "easeOut",
                                }}
                              />
                            </div>
                            <motion.span
                              className={`text-sm font-semibold ${getPerformanceColor(
                                staff.performanceScore
                              )}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.6 + index * 0.1 }}
                            >
                              {staff.performanceScore}%
                            </motion.span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              staff.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {staff.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(staff)}
                            className="px-4 py-2 text-blue-600 hover:text-white hover:bg-blue-600 border-2 border-blue-600 rounded-lg font-semibold transition-all duration-200 hover:shadow-md"
                          >
                            View Details
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Modals */}
        <AddStaffModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddStaffSuccess}
        />

        {/* <UpdateStaffModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedStaff(null);
          }}
          staff={selectedStaff}
          onSuccess={handleUpdateStaffSuccess}
        /> */}

        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message={successMessage}
        />
      </div>
    </PageTransition>
  );
};

export default StaffManagementAdmin;
