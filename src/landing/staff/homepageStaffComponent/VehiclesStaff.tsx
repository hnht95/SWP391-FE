import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVehicles, useVehicleOperations } from "../../../hooks/useVehicles";

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
  MdFilterList,
  MdViewList,
  MdViewModule,
  MdClose,
  MdLocationOn,
  MdCalendarToday,
  MdBuild,
  MdAssignment,
  MdPriorityHigh,
  MdEdit,
  MdDelete,
} from "react-icons/md";
import type { ApiVehicle, Vehicle } from "../../../types/vehicle";

const VehiclesStaff = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBattery, setSelectedBattery] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [detailedVehicle, setDetailedVehicle] = useState<ApiVehicle | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Memoize initial params to prevent hook re-initialization
  const initialParams = useMemo(
    () => ({
      page: 1,
      limit: 20,
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
    filterParams.limit = 20;

    fetchVehicles(filterParams);
  }, [selectedStatus, currentPage, fetchVehicles]);

  const filteredVehicles = vehicles?.filter((vehicle) => {
    const matchesSearch =
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "all" || vehicle.type === selectedType;
    const matchesStatus =
      selectedStatus === "all" || vehicle.status === selectedStatus;

    let matchesBattery = true;
    if (selectedBattery !== "all") {
      if (selectedBattery === "high" && vehicle.batteryLevel < 70)
        matchesBattery = false;
      if (
        selectedBattery === "medium" &&
        (vehicle.batteryLevel < 30 || vehicle.batteryLevel >= 70)
      )
        matchesBattery = false;
      if (selectedBattery === "low" && vehicle.batteryLevel >= 30)
        matchesBattery = false;
    }

    return matchesSearch && matchesType && matchesStatus && matchesBattery;
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

  const stats = {
    total: pagination?.total || vehicles?.length || 0, // Use total from API pagination
    available: vehicles?.filter((v) => v.status === "available")?.length || 0,
    rented: vehicles?.filter((v) => v.status === "rented")?.length || 0,
    maintenance:
      vehicles?.filter((v) => v.status === "maintenance")?.length || 0,
    lowBattery:
      vehicles?.filter((v) => v.batteryLevel && v.batteryLevel < 30)?.length ||
      0, // Based on battery level instead of status
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
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <MdDirectionsCar className="w-8 h-8 mr-3 text-blue-600" />
              Vehicles Management
            </h1>
            <p className="text-gray-600">
              Monitor and manage vehicle fleet status
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() =>
                setViewMode(viewMode === "table" ? "grid" : "table")
              }
              className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {viewMode === "table" ? (
                <MdViewModule className="w-5 h-5" />
              ) : (
                <MdViewList className="w-5 h-5" />
              )}
              <span>{viewMode === "table" ? "Grid View" : "Table View"}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
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
            subtitle: "Fleet size",
          },
          {
            title: "Available",
            value: stats.available,
            icon: () => (
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            ),
            color: "green",
            subtitle: "Ready for rental",
          },
          {
            title: "Currently Rented",
            value: stats.rented,
            icon: () => (
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            ),
            color: "gray",
            subtitle: "In use",
          },
          {
            title: "Needs Attention",
            value: stats.maintenance + stats.lowBattery,
            icon: MdBuild,
            color: "red",
            subtitle: "Maintenance + Low Battery",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            className="bg-white rounded-xl p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{
              y: -5,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <motion.div
                className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}
                whileHover={{ rotate: 5 }}
              >
                {typeof stat.icon === "function"
                  ? stat.icon({})
                  : React.createElement(stat.icon, {
                      className: `w-6 h-6 text-${stat.color}-600`,
                    })}
              </motion.div>
              <motion.span
                className="text-2xl font-bold text-gray-900"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
              >
                {stat.value}
              </motion.span>
            </div>
            <h3 className="text-gray-600 text-sm mb-2">{stat.title}</h3>
            <p className="text-xs text-gray-500">{stat.subtitle}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Vehicle List */}
      <motion.div
        className="bg-white rounded-xl border border-gray-100 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <motion.h3
              className="text-lg font-semibold text-gray-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Vehicle List
            </motion.h3>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              {/* Search */}
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by license plate, model, brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

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

          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="mt-4 pt-4 border-t border-gray-100"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Vehicle Type",
                      value: selectedType,
                      onChange: setSelectedType,
                      options: [
                        { value: "all", label: "All Types" },
                        { value: "scooter", label: "Scooter" },
                        { value: "sport", label: "Sport" },
                        { value: "standard", label: "Standard" },
                      ],
                    },
                    {
                      label: "Status",
                      value: selectedStatus,
                      onChange: setSelectedStatus,
                      options: [
                        { value: "all", label: "All Status" },
                        { value: "available", label: "Available" },
                        { value: "rented", label: "Rented" },
                        { value: "maintenance", label: "Maintenance" },
                        { value: "reserved", label: "Reserved" },
                      ],
                    },
                    {
                      label: "Battery Level",
                      value: selectedBattery,
                      onChange: setSelectedBattery,
                      options: [
                        { value: "all", label: "All Levels" },
                        { value: "high", label: "High (70%+)" },
                        { value: "medium", label: "Medium (30-70%)" },
                        { value: "low", label: "Low (<30%)" },
                      ],
                    },
                  ].map((filter, index) => (
                    <motion.div
                      key={filter.label}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {filter.label}
                      </label>
                      <select
                        value={filter.value}
                        onChange={(e) => filter.onChange(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        {filter.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6">
          {viewMode === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Vehicle",
                      "Model & Year",
                      "Status",
                      "Battery",
                      "Pricing",
                      "Rating",
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
                  {filteredVehicles?.map((vehicle, index) => {
                    const statusInfo = getStatusInfo(vehicle.status);
                    return (
                      <motion.tr
                        key={vehicle.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleVehicleClick(vehicle)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        whileHover={{ x: 5 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <motion.div
                              className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3"
                              whileHover={{ scale: 1.1 }}
                            >
                              <MdDirectionsCar className="w-6 h-6 text-gray-600" />
                            </motion.div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {vehicle.licensePlate}
                              </div>
                              <div className="text-sm text-gray-500">
                                {vehicle.brand} {vehicle.model}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {vehicle.model}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vehicle.year} • {vehicle.color}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <motion.span
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit ${statusInfo.color}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1 + index * 0.05 }}
                          >
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${statusInfo.dotColor}`}
                            ></div>
                            {statusInfo.label}
                          </motion.span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getBatteryIcon(vehicle.batteryLevel)}
                            <span className="text-sm text-gray-900">
                              {vehicle.batteryLevel}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {vehicle.batteryCapacity} kWh
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="text-sm text-gray-900 font-semibold">
                            {vehicle.pricePerDay.toLocaleString()} VND/day
                          </div>
                          <div className="text-xs text-gray-500">
                            {vehicle.pricePerHour.toLocaleString()} VND/hr
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center">
                            <span className="text-yellow-500">⭐</span>
                            <span className="ml-1">{vehicle.ratingAvg}/5</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            ({vehicle.ratingCount} reviews)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle Edit action
                                console.log("Edit vehicle:", vehicle.id);
                              }}
                              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Edit Vehicle"
                            >
                              <MdEdit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle Delete action
                                console.log("Delete vehicle:", vehicle.id);
                              }}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Delete Vehicle"
                            >
                              <MdDelete className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {filteredVehicles.map((vehicle, index) => {
                const statusInfo = getStatusInfo(vehicle.status);
                return (
                  <motion.div
                    key={vehicle.id}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                    onClick={() => handleVehicleClick(vehicle)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <motion.div
                        className="w-12 h-12 bg-white rounded-lg flex items-center justify-center"
                        whileHover={{ rotate: 5 }}
                      >
                        <MdDirectionsCar className="w-8 h-8 text-gray-600" />
                      </motion.div>
                      <motion.span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1 + index * 0.05 }}
                      >
                        {statusInfo.label}
                      </motion.span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1">
                      {vehicle.licensePlate}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {vehicle.year} • {vehicle.color}
                    </p>

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500 text-sm">⭐</span>
                        <span className="text-xs text-gray-600">
                          {vehicle.ratingAvg}/5 ({vehicle.ratingCount})
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getBatteryIcon(vehicle.batteryLevel)}
                        <span className="text-sm font-medium">
                          {vehicle.batteryLevel}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-gray-500">
                        <MdLocationOn className="w-3 h-3 mr-1" />
                        <div className="truncate">
                          <div className="font-medium text-gray-700">
                            {vehicle.station?.name || "Unknown Station"}
                          </div>
                          <div className="text-xs">
                            {vehicle.station?.location?.address || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="font-semibold">
                          {vehicle.pricePerDay.toLocaleString()}
                        </span>{" "}
                        VND/day
                      </div>
                      {vehicle.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {vehicle.tags.slice(0, 2).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {vehicle.tags.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{vehicle.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {filteredVehicles?.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
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
                    icon: MdBuild,
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
                                        {new Date(
                                          maintenance.reportedAt
                                        ).toLocaleDateString("vi-VN")}
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
                    <MdBuild className="w-4 h-4" />
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
      {pagination && pagination.totalPages > 1 && (
        <motion.div
          className="mt-8 flex justify-center items-center space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Previous
          </button>

          <span className="text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(pagination.totalPages, prev + 1)
              )
            }
            disabled={currentPage === pagination.totalPages}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentPage === pagination.totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default VehiclesStaff;
