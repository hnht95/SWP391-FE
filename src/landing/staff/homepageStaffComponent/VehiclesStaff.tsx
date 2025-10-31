import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVehicles, useVehicleOperations } from "../../../hooks/useVehicles";
import { GrHostMaintenance } from "react-icons/gr";

import {
  MdDirectionsCar,
  MdBattery0Bar,
  MdBattery1Bar,
  MdBattery2Bar,
  MdBattery3Bar,
  MdBattery4Bar,
  MdBattery5Bar,
  MdBattery6Bar,
  MdBatteryFull,
  MdSearch,
  MdViewList,
  MdViewModule,
  MdClose,
  MdLocationOn,
  MdCalendarToday,
  MdAssignment,
  MdPriorityHigh,
} from "react-icons/md";
import CustomSelect from "../../../components/CustomSelect";
import type { ApiVehicle, Vehicle } from "../../../types/vehicle";
import { formatDate } from "../../../utils/dateUtils";

const VehiclesStaff = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [detailedVehicle, setDetailedVehicle] = useState<ApiVehicle | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Memoize initial params to prevent hook re-initialization
  const initialParams = useMemo(
    () => ({
      page: 1,
      limit: 10,
    }),
    []
  );

  // Use API hook to fetch vehicles
  const {
    vehicles: apiVehicles,
    loading,
    error,
    pagination,
    fetchVehicles,
  } = useVehicles(initialParams);

  // Hook for vehicle operations (get detail, update status, etc.)
  const { getVehicleDetail } = useVehicleOperations();

  const vehicles: Vehicle[] =
    apiVehicles?.map((vehicle: ApiVehicle) => ({
      id: vehicle.id,
      licensePlate: vehicle.licensePlate,
      vin: vehicle.vin,
      type: "standard" as const, // Default type since API doesn't categorize
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      status: vehicle.status,
      batteryLevel: vehicle.batteryLevel,
      batteryCapacity: vehicle.batteryCapacity,
      mileage: vehicle.mileage,
      pricePerDay: vehicle.pricePerDay,
      pricePerHour: vehicle.pricePerHour,
      lastMaintenance:
        vehicle.maintenanceHistory && vehicle.maintenanceHistory.length > 0
          ? vehicle.maintenanceHistory[
              vehicle.maintenanceHistory.length - 1
            ].reportedAt.split("T")[0]
          : new Date().toISOString().split("T")[0],
      rentalHistory: Math.floor(Math.random() * 100), // Mock data for now
      location: vehicle.station?.location?.address || "N/A",
      station: vehicle.station,
      owner: vehicle.owner,
      company: vehicle.company,
      valuation: vehicle.valuation,
      defaultPhotos: vehicle.defaultPhotos,
      ratingAvg: vehicle.ratingAvg,
      ratingCount: vehicle.ratingCount,
      tags: vehicle.tags || [],
      maintenanceHistory: vehicle.maintenanceHistory || [],
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
      image: vehicle.imageUrl,
      notes: `VIN: ${vehicle.vin} | Mileage: ${vehicle.mileage}km | Rating: ${vehicle.ratingAvg}/5`,
    })) || [];

  // Refetch when filters change - only when filters actually change
  React.useEffect(() => {
    const filterParams: {
      status?: "available" | "reserved" | "rented" | "maintenance";
      page?: number;
      limit?: number;
    } = {};

    if (selectedStatus !== "all") {
      filterParams.status = selectedStatus as
        | "available"
        | "reserved"
        | "rented"
        | "maintenance";
    }

    filterParams.page = currentPage;
    filterParams.limit = pageSize;

    fetchVehicles(filterParams);
  }, [selectedStatus, currentPage, pageSize, fetchVehicles]);

  const filteredVehicles = vehicles?.filter((vehicle) => {
    const matchesSearch =
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "all" || vehicle.type === selectedType;
    const matchesStatus =
      selectedStatus === "all" || vehicle.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getBatteryIcon = (level: number) => {
    if (level === 0) return <MdBattery0Bar className="w-5 h-5" />;
    if (level <= 15) return <MdBattery1Bar className="w-5 h-5" />;
    if (level <= 30) return <MdBattery2Bar className="w-5 h-5" />;
    if (level <= 45) return <MdBattery3Bar className="w-5 h-5" />;
    if (level <= 60) return <MdBattery4Bar className="w-5 h-5" />;
    if (level <= 75) return <MdBattery5Bar className="w-5 h-5" />;
    if (level <= 90) return <MdBattery6Bar className="w-5 h-5" />;
    return <MdBatteryFull className="w-5 h-5" />;
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "available":
        return {
          color: "bg-green-100 text-green-800",
          label: "Available",
          dotColor: "bg-green-500",
        };
      case "rented":
        return {
          color: "bg-gray-100 text-gray-800",
          label: "Rented",
          dotColor: "bg-gray-500",
        };
      case "maintenance":
        return {
          color: "bg-red-100 text-red-800",
          label: "Maintenance",
          dotColor: "bg-red-500",
        };
      case "reserved":
        return {
          color: "bg-blue-100 text-blue-800",
          label: "Reserved",
          dotColor: "bg-blue-500",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          label: "Unknown",
          dotColor: "bg-gray-500",
        };
    }
  };

  // Stats based on all vehicles data from API
  const stats = {
    total: pagination?.total || vehicles?.length || 0,
    available: vehicles?.filter((v) => v.status === "available")?.length || 0,
    active: vehicles?.filter((v) => v.status === "rented")?.length || 0,
    maintenance:
      vehicles?.filter((v) => v.status === "maintenance")?.length || 0,
  };

  const handleVehicleClick = async (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(true);
    setLoadingDetail(true);
    setDetailedVehicle(null);

    try {
      // Fetch detailed vehicle information
      const detailVehicle = await getVehicleDetail(vehicle.id);
      setDetailedVehicle(detailVehicle);
    } catch (error) {
      console.error("Error fetching vehicle detail:", error);
      // Keep the basic vehicle info if detail fetch fails
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedVehicle(null);
    setDetailedVehicle(null);
    setLoadingDetail(false);
  };

  // Show loading state
  if (loading && vehicles?.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
          <button
            onClick={() => {
              const filterParams: {
                status?: "available" | "reserved" | "rented" | "maintenance";
                page?: number;
                limit?: number;
              } = {};

              if (selectedStatus !== "all") {
                filterParams.status = selectedStatus as
                  | "available"
                  | "reserved"
                  | "rented"
                  | "maintenance";
              }

              filterParams.page = currentPage;
              filterParams.limit = 20;

              fetchVehicles(filterParams);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
              Vehicles Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your vehicles and their assignment status.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {[
          {
            title: "Total Vehicles",
            value: stats.total,
            icon: MdDirectionsCar,
            color: "blue",
            subtitle: "Total fleet size",
            bgColor: "bg-blue-100",
            iconColor: "text-blue-600",
          },
          {
            title: "Available",
            value: stats.available,
            icon: () => (
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            ),
            color: "green",
            subtitle: "Ready for rental",
            bgColor: "bg-green-100",
            iconColor: "text-green-600",
          },
          {
            title: "Active",
            value: stats.active,
            icon: () => (
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">⟳</span>
              </div>
            ),
            color: "orange",
            subtitle: "Currently rented",
            bgColor: "bg-orange-100",
            iconColor: "text-orange-600",
          },
          {
            title: "Maintenance",
            value: stats.maintenance,
            icon: GrHostMaintenance,
            color: "red",
            subtitle: "Under maintenance",
            bgColor: "bg-red-100",
            iconColor: "text-red-600",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{
              y: -5,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <motion.div
                className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {typeof stat.icon === "function" ? (
                  stat.icon()
                ) : (
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                )}
              </motion.div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-700">{stat.title}</h3>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs and Filters */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-white rounded-lg shadow-sm">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-4 border-b">
            {[
              { value: "all", label: "All", count: stats.total },
              {
                value: "available",
                label: "Available",
                count: stats.available,
              },
              {
                value: "reserved",
                label: "Booked",
                count:
                  vehicles?.filter((v) => v.status === "reserved")?.length || 0,
              },
              {
                value: "maintenance",
                label: "Maintenance",
                count: stats.maintenance,
              },
              {
                value: "rented",
                label: "Returning",
                count:
                  vehicles?.filter((v) => v.status === "rented")?.length || 0,
              },
            ].map((tab, idx) => (
              <motion.button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={`px-4 py-2 text-sm font-medium transition-all relative ${
                  selectedStatus === tab.value
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab.label} <span className="ml-1">{tab.count}</span>
                {selectedStatus === tab.value && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
                    layoutId="activeTab"
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Search and Filters Row */}
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Left side - Search and All vehicles label */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">
                  All vehicles {stats.total}
                </span>

                {/* Search */}
                <div className="relative flex-1 md:w-80">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search vehicle"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Right side - Filters and View Toggle */}
              <div className="flex items-center gap-3">
                {/* Vehicle Type Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Vehicle Type</span>
                  <CustomSelect
                    value={selectedType}
                    onChange={(val) => setSelectedType(String(val))}
                    options={[
                      { value: "all", label: "Any" },
                      { value: "scooter", label: "Scooter" },
                      { value: "sport", label: "Sport" },
                      { value: "standard", label: "Standard" },
                    ]}
                    className="w-32"
                  />
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <motion.button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${
                      viewMode === "grid"
                        ? "bg-white text-gray-900 shadow"
                        : "text-gray-500"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MdViewModule className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${
                      viewMode === "list"
                        ? "bg-white text-gray-900 shadow"
                        : "text-gray-500"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MdViewList className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Vehicle List */}
      <motion.div
        className="bg-white rounded-lg shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6">
          {viewMode === "grid" ? (
            /* Grid View */
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {filteredVehicles.map((vehicle, index) => {
                const statusInfo = getStatusInfo(vehicle.status);
                return (
                  <motion.div
                    key={vehicle.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleVehicleClick(vehicle)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                  >
                    {/* Vehicle Image */}
                    <div className="relative bg-gray-100 h-48">
                      {vehicle.image ? (
                        <img
                          src={vehicle.image}
                          alt={vehicle.model}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MdDirectionsCar className="w-20 h-20 text-gray-300" />
                        </div>
                      )}
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="p-4">
                      {/* Title */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">
                          {vehicle.brand} {vehicle.year}
                        </p>
                        <h3 className="font-semibold text-gray-900 text-base">
                          {vehicle.model}
                        </h3>
                      </div>

                      {/* Details Grid */}
                      <div className="space-y-2 text-xs text-gray-600 mb-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Order completed</span>
                          <span className="font-medium text-gray-900">
                            {vehicle.rentalHistory || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            Last check-in/out
                          </span>
                          <span className="font-medium text-gray-900 flex items-center">
                            <MdCalendarToday className="w-3 h-3 mr-1" />
                            {vehicle.lastMaintenance
                              ? new Date(
                                  vehicle.lastMaintenance
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            Max. load capacity
                          </span>
                          <span className="font-medium text-gray-900">
                            {vehicle.batteryCapacity || "N/A"} kWh
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Assigned driver</span>
                          <span className="font-medium text-gray-900">
                            {vehicle.station?.name?.split(" ")[0] || "---"}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVehicleClick(vehicle);
                        }}
                        className="w-full py-2 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        View details
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            /* List View */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Vehicle",
                      "Model",
                      "Status",
                      "Orders",
                      "Last Check",
                      "Capacity",
                      "Driver",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVehicles?.map((vehicle) => {
                    const statusInfo = getStatusInfo(vehicle.status);
                    return (
                      <motion.tr
                        key={vehicle.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleVehicleClick(vehicle)}
                        whileHover={{ x: 2 }}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                              {vehicle.image ? (
                                <img
                                  src={vehicle.image}
                                  alt={vehicle.model}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <MdDirectionsCar className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {vehicle.licensePlate}
                              </div>
                              <div className="text-xs text-gray-500">
                                {vehicle.brand}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {vehicle.model}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {vehicle.rentalHistory || 0}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {vehicle.lastMaintenance
                            ? new Date(
                                vehicle.lastMaintenance
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {vehicle.batteryCapacity} kWh
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                          {vehicle.station?.name?.split(" ")[0] || "---"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVehicleClick(vehicle);
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View details
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filteredVehicles?.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <MdDirectionsCar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No vehicles found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Vehicle Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedVehicle && (
          <motion.div
            className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4"
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
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Vehicle Details - {selectedVehicle.licensePlate}
                  </h2>
                  {loadingDetail && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  )}
                </div>
                <motion.button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MdClose className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Modal Content với motion */}
              <div className="p-6 space-y-6">
                {[
                  {
                    title: "Vehicle Information",
                    icon: MdDirectionsCar,
                    content: (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            License Plate
                          </label>
                          <p className="text-gray-900 font-semibold">
                            {selectedVehicle.licensePlate}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            VIN Number
                          </label>
                          <p className="text-gray-900 font-mono text-sm">
                            {selectedVehicle.vin}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Brand & Model
                          </label>
                          <p className="text-gray-900">
                            {selectedVehicle.brand} {selectedVehicle.model}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Year & Color
                          </label>
                          <p className="text-gray-900">
                            {selectedVehicle.year} - {selectedVehicle.color}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Owner Type
                          </label>
                          <p className="text-gray-900 capitalize">
                            {detailedVehicle?.owner || selectedVehicle.owner}
                            {(detailedVehicle?.company ||
                              selectedVehicle.company) &&
                              ` (${
                                detailedVehicle?.company ||
                                selectedVehicle.company
                              })`}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Status
                          </label>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              getStatusInfo(selectedVehicle.status).color
                            }`}
                          >
                            {getStatusInfo(selectedVehicle.status).label}
                          </span>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "Technical Specifications",
                    icon: GrHostMaintenance,
                    content: (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Battery Capacity
                          </label>
                          <p className="text-gray-900">
                            {selectedVehicle.batteryCapacity} kWh
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Current Battery Level
                          </label>
                          <div className="flex items-center space-x-2 mt-1">
                            {getBatteryIcon(selectedVehicle.batteryLevel)}
                            <span className="text-gray-900 font-semibold">
                              {selectedVehicle.batteryLevel}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Mileage
                          </label>
                          <p className="text-gray-900">
                            {selectedVehicle.mileage.toLocaleString()} km
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Station & Location
                          </label>
                          <div className="mt-1">
                            {loadingDetail ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-sm text-gray-500">
                                  Loading station details...
                                </span>
                              </div>
                            ) : (
                              <>
                                {/* Debug info */}
                                {console.log(
                                  "Modal render - detailedVehicle:",
                                  detailedVehicle
                                )}
                                {console.log(
                                  "Modal render - selectedVehicle.station:",
                                  selectedVehicle.station
                                )}

                                <p className="text-gray-900 font-semibold">
                                  {detailedVehicle?.station?.name ||
                                    selectedVehicle.station?.name ||
                                    "Unknown Station"}{" "}
                                  (
                                  {detailedVehicle?.station?.code ||
                                    selectedVehicle.station?.code ||
                                    "N/A"}
                                  )
                                </p>
                                <p className="text-gray-600 flex items-center text-sm">
                                  <MdLocationOn className="w-4 h-4 mr-1" />
                                  {detailedVehicle?.station?.location
                                    ?.address ||
                                    selectedVehicle.station?.location
                                      ?.address ||
                                    "N/A"}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "Pricing & Rating",
                    icon: MdAssignment,
                    content: (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Price per Day
                          </label>
                          <p className="text-gray-900 font-semibold">
                            {selectedVehicle.pricePerDay.toLocaleString()} VND
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Price per Hour
                          </label>
                          <p className="text-gray-900 font-semibold">
                            {selectedVehicle.pricePerHour.toLocaleString()} VND
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Rating Average
                          </label>
                          <p className="text-gray-900">
                            {selectedVehicle.ratingAvg}/5 ⭐ (
                            {selectedVehicle.ratingCount} reviews)
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Valuation
                          </label>
                          <p className="text-gray-900">
                            {detailedVehicle?.valuation?.valueVND ||
                            selectedVehicle.valuation?.valueVND
                              ? `${(detailedVehicle?.valuation?.valueVND ||
                                  selectedVehicle.valuation
                                    ?.valueVND)!.toLocaleString()} VND`
                              : "Not valued"}
                          </p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "Maintenance & History",
                    icon: MdCalendarToday,
                    content: (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Last Maintenance
                            </label>
                            <p className="text-gray-900">
                              {selectedVehicle.lastMaintenance}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Total Rentals
                            </label>
                            <p className="text-gray-900">
                              {selectedVehicle.rentalHistory} times
                            </p>
                          </div>
                        </div>
                        {(detailedVehicle?.maintenanceHistory ||
                          selectedVehicle.maintenanceHistory) &&
                          (detailedVehicle?.maintenanceHistory ||
                            selectedVehicle.maintenanceHistory)!.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-gray-600 mb-2 block">
                                Recent Maintenance History
                              </label>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {(detailedVehicle?.maintenanceHistory ||
                                  selectedVehicle.maintenanceHistory)!
                                  .slice(-3)
                                  .map((maintenance) => (
                                    <div
                                      key={maintenance._id}
                                      className="bg-white p-3 rounded border border-gray-200"
                                    >
                                      <p className="text-sm text-gray-700">
                                        {maintenance.description}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {formatDate(maintenance.reportedAt)}
                                      </p>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        {(detailedVehicle?.tags || selectedVehicle.tags)
                          .length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-600 mb-2 block">
                              Tags
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {(
                                detailedVehicle?.tags || selectedVehicle.tags
                              ).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  },
                ].map((section, index) => (
                  <motion.div
                    key={section.title}
                    className="bg-gray-50 rounded-lg p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <section.icon className="w-5 h-5 mr-2" />
                      {section.title}
                    </h3>
                    {section.content}
                  </motion.div>
                ))}

                {/* Vehicle Photos */}
                {(selectedVehicle.defaultPhotos.exterior.length > 0 ||
                  selectedVehicle.defaultPhotos.interior.length > 0) && (
                  <motion.div
                    className="bg-gray-50 rounded-lg p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      📷 Vehicle Photos
                    </h3>
                    <div className="space-y-4">
                      {selectedVehicle.defaultPhotos.exterior.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-600 mb-2">
                            Exterior Photos
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {selectedVehicle.defaultPhotos.exterior
                              .slice(0, 6)
                              .map((photoId, index) => (
                                <div
                                  key={photoId}
                                  className="aspect-video bg-gray-200 rounded border"
                                >
                                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                    Photo {index + 1}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                      {selectedVehicle.defaultPhotos.interior.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-600 mb-2">
                            Interior Photos
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {selectedVehicle.defaultPhotos.interior
                              .slice(0, 6)
                              .map((photoId, index) => (
                                <div
                                  key={photoId}
                                  className="aspect-video bg-gray-200 rounded border"
                                >
                                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                    Interior {index + 1}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {selectedVehicle.notes && (
                  <motion.div
                    className="bg-gray-50 rounded-lg p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Notes
                    </h3>
                    <p className="text-gray-700">{selectedVehicle.notes}</p>
                  </motion.div>
                )}

                <motion.div
                  className="bg-gray-50 rounded-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                ></motion.div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  {selectedVehicle.status === "available" && (
                    <motion.button
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MdAssignment className="w-4 h-4" />
                      <span>Assign to Customer</span>
                    </motion.button>
                  )}
                  <motion.button
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <GrHostMaintenance className="w-4 h-4" />
                    <span>Send to Maintenance</span>
                  </motion.button>
                  <motion.button
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MdPriorityHigh className="w-4 h-4" />
                    <span>Mark Priority</span>
                  </motion.button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
                <motion.button
                  onClick={handleCloseModal}
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

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <motion.div
          className="mt-8 bg-white rounded-xl border border-gray-100 p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Page Size Selector */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <CustomSelect
                value={pageSize}
                onChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
                options={[10, 20, 50, 100].map((s) => ({
                  value: s,
                  label: String(s),
                }))}
                className="min-w-[6rem]"
              />
              <span className="text-sm text-gray-500">
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, pagination.total)} of{" "}
                {pagination.total}
              </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-2">
              {/* First Page */}
              <motion.button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-500"
                }`}
                whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
              >
                «
              </motion.button>

              {/* Previous */}
              <motion.button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-500"
                }`}
                whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
              >
                Previous
              </motion.button>

              {/* Page Numbers */}
              <div className="hidden sm:flex items-center space-x-1">
                {[...Array(Math.min(5, pagination.totalPages))].map(
                  (_, idx) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (currentPage <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
                    }

                    return (
                      <motion.button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-500"
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  }
                )}
              </div>

              {/* Current Page Input (Mobile) */}
              <div className="sm:hidden flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max={pagination.totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = Math.max(
                      1,
                      Math.min(pagination.totalPages, Number(e.target.value))
                    );
                    if (!isNaN(page)) setCurrentPage(page);
                  }}
                  className="w-16 px-2 py-2 border-2 border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                />
                <span className="text-sm text-gray-600">
                  / {pagination.totalPages}
                </span>
              </div>

              {/* Next */}
              <motion.button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(pagination.totalPages, prev + 1)
                  )
                }
                disabled={currentPage === pagination.totalPages}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  currentPage === pagination.totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-500"
                }`}
                whileHover={{
                  scale: currentPage === pagination.totalPages ? 1 : 1.05,
                }}
                whileTap={{
                  scale: currentPage === pagination.totalPages ? 1 : 0.95,
                }}
              >
                Next
              </motion.button>

              {/* Last Page */}
              <motion.button
                onClick={() => setCurrentPage(pagination.totalPages)}
                disabled={currentPage === pagination.totalPages}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === pagination.totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-500"
                }`}
                whileHover={{
                  scale: currentPage === pagination.totalPages ? 1 : 1.05,
                }}
                whileTap={{
                  scale: currentPage === pagination.totalPages ? 1 : 0.95,
                }}
              >
                »
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VehiclesStaff;
