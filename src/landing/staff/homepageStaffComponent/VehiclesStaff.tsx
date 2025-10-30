import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVehicles, useVehicleOperations } from "../../../hooks/useVehicles";
import {
  MdDirectionsCar,
  MdSearch,
  MdClose,
  MdLocationOn,
  MdCalendarToday,
  MdBuild,
  MdAssignment,
} from "react-icons/md";
import CustomSelect from "../../../components/CustomSelect";
import type { ApiVehicle, Vehicle } from "../../../types/vehicle";
import { formatDate } from "../../../utils/dateUtils";
import MaintenanceRequestModal from "../vehiclesComponent/MaintenanceRequestModal";
import DeletionRequestModal from "../vehiclesComponent/DeletionRequestModal";
import SuccessNotification from "../vehiclesComponent/SuccessNotification";

// Minimal Vehicle Image Carousel
const VehicleImageCarousel = ({
  vehicle,
  loading,
}: {
  vehicle: ApiVehicle | Vehicle;
  loading: boolean;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const allPhotos = [
    ...(vehicle?.defaultPhotos?.exterior || []),
    ...(vehicle?.defaultPhotos?.interior || []),
  ];
  const hasPhotos = allPhotos.length > 0;

  React.useEffect(() => {
    if (!hasPhotos) return;
    const id = setInterval(
      () => setCurrentImageIndex((i) => (i + 1) % allPhotos.length),
      3000
    );
    return () => clearInterval(id);
  }, [hasPhotos, allPhotos.length]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse h-6 w-6 rounded-full bg-gray-300" />
          </div>
        ) : hasPhotos ? (
          <img
            src={String(allPhotos[currentImageIndex])}
            alt="Vehicle"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <MdDirectionsCar className="w-20 h-20 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No photos available</p>
            </div>
          </div>
        )}
        {hasPhotos && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {currentImageIndex + 1}/{allPhotos.length}
          </div>
        )}
      </div>
      {hasPhotos && allPhotos.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {allPhotos.slice(0, 8).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`aspect-video rounded-lg overflow-hidden border-2 ${
                currentImageIndex === idx
                  ? "border-blue-500"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
                <span className="text-xs text-gray-500">{idx + 1}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const VehiclesStaff = () => {
  const [activeTab, setActiveTab] = useState<
    "all" | "available" | "booked" | "deleted" | "maintenance" | "returning"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [detailedVehicle, setDetailedVehicle] = useState<ApiVehicle | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
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

  const getPlateNumber = (detailedV: ApiVehicle | null, selectedV: Vehicle) => {
    if (detailedV && "plateNumber" in detailedV) {
      return (detailedV as ApiVehicle & { plateNumber: string }).plateNumber;
    }
    return selectedV.licensePlate;
  };

  const vehicles: Vehicle[] =
    apiVehicles?.map((vehicle: ApiVehicle) => {
      const normalizedStatus = (
        vehicle.status === "maintenance"
          ? "pending_maintenance"
          : vehicle.status
      ) as Vehicle["status"];

      return {
        id: vehicle.id,
        licensePlate: vehicle.licensePlate,
        vin: vehicle.vin,
        type: "standard" as const,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        status: normalizedStatus,
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
        rentalHistory: Math.floor(Math.random() * 100),
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
      };
    }) || [];

  // Fetch all vehicles only once on mount and when page/pageSize changes
  React.useEffect(() => {
    const filterParams: {
      page?: number;
      limit?: number;
    } = {};

    filterParams.page = currentPage;
    filterParams.limit = pageSize;

    // Fetch all vehicles without status filter - we'll filter on client side
    fetchVehicles(filterParams);
  }, [currentPage, pageSize, fetchVehicles]);

  // Reset to first page when search or tab changes (match VehicleHandover behavior)
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const filteredVehicles = vehicles?.filter((vehicle) => {
    const matchesSearch =
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter based on active tab
    let matchesStatus = true;
    if (activeTab === "available") {
      matchesStatus = vehicle.status === "available";
    } else if (activeTab === "booked") {
      matchesStatus = vehicle.status === "rented";
    } else if (activeTab === "maintenance") {
      matchesStatus = vehicle.status === "pending_maintenance";
    } else if (activeTab === "deleted") {
      matchesStatus = String(vehicle.status) === "pending_deletion";
    } else if (activeTab === "returning") {
      matchesStatus = vehicle.status === "rented";
    }

    return matchesSearch && matchesStatus;
  });

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
      case "pending_maintenance":
        return {
          color: "bg-orange-100 text-orange-800",
          label: "Maintenance",
          dotColor: "bg-orange-500",
        };
      case "pending_deletion":
        return {
          color: "bg-red-100 text-red-800",
          label: "Deleted",
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
    total: pagination?.total ?? vehicles?.length ?? 0,
    available: vehicles?.filter((v) => v.status === "available")?.length || 0,
    booked: vehicles?.filter((v) => v.status === "reserved")?.length || 0,
    maintenance:
      vehicles?.filter((v) => v.status === "pending_maintenance")?.length || 0,
    returning: vehicles?.filter((v) => v.status === "rented")?.length || 0,
    deleted:
      vehicles?.filter((v) => v.status === "pending_deletion")?.length || 0,
  };

  const handleVehicleClick = async (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(true);
    setLoadingDetail(true);
    setDetailedVehicle(null);

    try {
      const detailVehicle = await getVehicleDetail(vehicle.id);
      setDetailedVehicle(detailVehicle);
    } catch (error) {
      console.error("Error fetching vehicle detail:", error);
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
              const filterParams: { page?: number; limit?: number } = {};
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
                { id: "all", label: "All", count: stats.total },
                { id: "available", label: "Available", count: stats.available },
                { id: "booked", label: "Booked", count: stats.booked },
                {
                  id: "maintenance",
                  label: "Maintenance",
                  count: stats.maintenance,
                },
                { id: "deleted", label: "Deleted", count: stats.deleted },
                { id: "returning", label: "Returning", count: stats.returning },
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

      {/* Search and Filters Row */}
      <motion.div
        className="mb-6 bg-white rounded-lg shadow-sm p-4 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col  md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-80">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by license plate, brand, or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading vehicles...</p>
            </div>
          ) : filteredVehicles?.length === 0 ? (
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
          ) : (
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
          )}
        </div>
      </motion.div>

      {/* Vehicle Detail Modal - Redesigned */}
      <AnimatePresence>
        {isDetailModalOpen && selectedVehicle && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-l from-blue-50 to-white">
                <div className="flex items-center space-x-3">
                  <div className="p-2  rounded-lg">
                    <MdDirectionsCar className="w-6 h-6 " />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {detailedVehicle?.brand || selectedVehicle.brand}{" "}
                      {detailedVehicle?.model || selectedVehicle.model}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {getPlateNumber(detailedVehicle, selectedVehicle)} •{" "}
                      {detailedVehicle?.year || selectedVehicle.year}
                    </p>
                  </div>
                  {loadingDetail && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  )}
                </div>
                <motion.button
                  onClick={handleCloseModal}
                  className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MdClose className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(95vh-80px)] bg-gray-50">
                <div className=" p-6 overflow-y-auto">
                  <VehicleImageCarousel
                    vehicle={detailedVehicle || selectedVehicle}
                    loading={loadingDetail}
                  />
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                  {/* Basic Information Card */}
                  <motion.div
                    className=" rounded-xl p-5 shadow border border-slate-100 bg-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MdDirectionsCar className="w-5 h-5 mr-2 " />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          License Plate
                        </label>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {getPlateNumber(detailedVehicle, selectedVehicle)}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          VIN Number
                        </label>
                        <p className="text-sm font-mono text-gray-900 mt-1">
                          {detailedVehicle?.vin || selectedVehicle.vin}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Year
                        </label>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {detailedVehicle?.year || selectedVehicle.year}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Color
                        </label>
                        <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center">
                          <span
                            className={`w-4 h-4 rounded-full mr-2 border border-gray-300`}
                            style={{
                              backgroundColor: (
                                detailedVehicle?.color || selectedVehicle.color
                              ).toLowerCase(),
                            }}
                          ></span>
                          {detailedVehicle?.color || selectedVehicle.color}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Owner
                        </label>
                        <p className="text-sm font-semibold text-gray-900 mt-1 capitalize">
                          {detailedVehicle?.owner || selectedVehicle.owner}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Mileage
                        </label>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {(
                            detailedVehicle?.mileage || selectedVehicle.mileage
                          )?.toLocaleString()}{" "}
                          km
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Technical Specs Card */}
                  <motion.div
                    className=" rounded-xl p-5 shadow border border-slate-100 bg-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MdBuild className="w-5 h-5 mr-2 " />
                      Technical Specifications
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Battery Capacity
                        </label>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {detailedVehicle?.batteryCapacity ||
                            selectedVehicle.batteryCapacity}{" "}
                          kWh
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(
                            detailedVehicle?.tags ||
                            selectedVehicle.tags ||
                            []
                          ).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Station & Location Card */}
                  <motion.div
                    className=" rounded-xl p-5 shadow border border-slate-100 bg-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MdLocationOn className="w-5 h-5 mr-2 " />
                      Station & Location
                    </h3>
                    {loadingDetail ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        <span className="text-sm text-gray-500">
                          Loading station details...
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Station Name
                          </label>
                          <p className="text-sm font-bold text-gray-900 mt-1">
                            {detailedVehicle?.station?.name ||
                              selectedVehicle.station?.name ||
                              "Unknown Station"}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Address
                          </label>
                          <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                            {detailedVehicle?.station?.location?.address ||
                              selectedVehicle.station?.location?.address ||
                              "N/A"}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Pricing Card */}
                  <motion.div
                    className=" rounded-xl p-5 shadow border border-slate-100 bg-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MdAssignment className="w-5 h-5 mr-2 " />
                      Pricing & Valuation
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Price per Day
                        </label>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {(
                            detailedVehicle?.pricePerDay ||
                            selectedVehicle.pricePerDay
                          )?.toLocaleString()}{" "}
                          VND
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Price per Hour
                        </label>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {(
                            detailedVehicle?.pricePerHour ||
                            selectedVehicle.pricePerHour
                          )?.toLocaleString()}{" "}
                          VND
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Rating
                        </label>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {detailedVehicle?.ratingAvg ||
                            selectedVehicle.ratingAvg}
                          /5 ⭐ (
                          {detailedVehicle?.ratingCount ||
                            selectedVehicle.ratingCount}{" "}
                          reviews)
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Valuation
                        </label>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {detailedVehicle?.valuation?.valueVND ||
                          selectedVehicle.valuation?.valueVND
                            ? `${(detailedVehicle?.valuation?.valueVND ||
                                selectedVehicle.valuation
                                  ?.valueVND)!.toLocaleString()} VND`
                            : "Not valued"}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Maintenance History */}
                  {(
                    detailedVehicle?.maintenanceHistory ||
                    selectedVehicle.maintenanceHistory ||
                    []
                  ).length > 0 && (
                    <motion.div
                      className=" rounded-xl p-5 shadow border border-slate-100 bg-white"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <MdCalendarToday className="w-5 h-5 mr-2 " />
                        Recent Maintenance History
                      </h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(detailedVehicle?.maintenanceHistory ||
                          selectedVehicle.maintenanceHistory)!
                          .slice(-3)
                          .map((maintenance) => (
                            <div
                              key={maintenance._id}
                              className="bg-white p-3 rounded-lg border border-red-100"
                            >
                              <p className="text-sm text-gray-700 font-medium">
                                {maintenance.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(maintenance.reportedAt)}
                              </p>
                            </div>
                          ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <motion.div
                    className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border-2 border-dashed  border-gray-300 sticky bottom-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      Staff Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(() => {
                        // Determine if maintenance action should be disabled.
                        const isUnderMaintenance =
                          detailedVehicle?.status === "maintenance" ||
                          selectedVehicle?.status === "pending_maintenance";

                        return (
                          <motion.button
                            className={`px-4 py-3 rounded-lg font-semibold border text-orange-600 border-orange-200 bg-gradient-to-l from-white to-orange-100 shadow flex items-center justify-center space-x-2 ${
                              isUnderMaintenance
                                ? "opacity-50 cursor-not-allowed hover:shadow-none"
                                : "hover:shadow-lg"
                            }`}
                            whileHover={
                              isUnderMaintenance
                                ? undefined
                                : { scale: 1.02, y: -2 }
                            }
                            whileTap={
                              isUnderMaintenance ? undefined : { scale: 0.98 }
                            }
                            onClick={() => {
                              if (isUnderMaintenance) return;
                              setIsMaintenanceModalOpen(true);
                            }}
                            disabled={isUnderMaintenance}
                            aria-disabled={isUnderMaintenance}
                            title={
                              isUnderMaintenance
                                ? "Vehicle is under maintenance"
                                : "Send maintenance request"
                            }
                          >
                            <MdBuild className="w-5 h-5" />
                            <span>Send Maintenance Request</span>
                          </motion.button>
                        );
                      })()}

                      {(() => {
                        const isPendingDeletion =
                          selectedVehicle?.status === "pending_deletion";

                        return (
                          <motion.button
                            className={`px-4 py-3 rounded-lg font-semibold border text-rose-600 border-rose-200 bg-gradient-to-l from-white to-rose-100 shadow flex items-center justify-center space-x-2 ${
                              isPendingDeletion
                                ? "opacity-50 cursor-not-allowed hover:shadow-none"
                                : "hover:shadow-lg"
                            }`}
                            whileHover={
                              isPendingDeletion
                                ? undefined
                                : { scale: 1.02, y: -2 }
                            }
                            whileTap={
                              isPendingDeletion ? undefined : { scale: 0.98 }
                            }
                            onClick={() => {
                              if (isPendingDeletion) return;
                              setIsDeletionModalOpen(true);
                            }}
                            disabled={isPendingDeletion}
                            aria-disabled={isPendingDeletion}
                            title={
                              isPendingDeletion
                                ? "Vehicle already has a deletion request"
                                : "Send delete request"
                            }
                          >
                            <MdClose className="w-5 h-5" />
                            <span>Send Delete Request</span>
                          </motion.button>
                        );
                      })()}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {!loading && pagination && (pagination.total ?? 0) > 0 && (
        <div className="mt-6 flex items-center justify-between border-t pt-4 bg-white rounded-lg p-4">
          <div className="text-sm text-gray-600">
            Showing{" "}
            {pagination.total === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, pagination.total)} of{" "}
            {pagination.total}
          </div>
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              Prev
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} / {pagination.totalPages}
            </span>
            <button
              className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={currentPage >= pagination.totalPages}
            >
              Next
            </button>
            <CustomSelect
              className="ml-2"
              value={pageSize}
              options={[
                { value: 5, label: "5 / page" },
                { value: 10, label: "10 / page" },
                { value: 20, label: "20 / page" },
                { value: 50, label: "50 / page" },
              ]}
              onChange={(v: string | number) => {
                setPageSize(Number(v));
                setCurrentPage(1);
              }}
              menuPlacement="top"
            />
          </div>
        </div>
      )}

      {/* Maintenance Request Modal */}
      {selectedVehicle && (
        <MaintenanceRequestModal
          isOpen={isMaintenanceModalOpen}
          onClose={() => setIsMaintenanceModalOpen(false)}
          vehicleId={selectedVehicle.id}
          vehicleName={`${selectedVehicle.brand} ${selectedVehicle.model}`}
          licensePlate={getPlateNumber(detailedVehicle, selectedVehicle)}
          onSuccess={() => {
            setSuccessMessage("Maintenance request submitted successfully!");
            setShowSuccessNotification(true);
            // Refresh vehicle list
            fetchVehicles();
          }}
        />
      )}

      {/* Deletion Request Modal */}
      {selectedVehicle && (
        <DeletionRequestModal
          isOpen={isDeletionModalOpen}
          onClose={() => setIsDeletionModalOpen(false)}
          vehicleId={selectedVehicle.id}
          vehicleName={`${selectedVehicle.brand} ${selectedVehicle.model}`}
          licensePlate={getPlateNumber(detailedVehicle, selectedVehicle)}
          onSuccess={() => {
            setSuccessMessage("Deletion request submitted successfully!");
            setShowSuccessNotification(true);
            fetchVehicles();
          }}
        />
      )}

      {/* Success Notification */}
      <SuccessNotification
        isOpen={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        message={successMessage}
        autoCloseDuration={4000}
      />
    </div>
  );
};

export default VehiclesStaff;
