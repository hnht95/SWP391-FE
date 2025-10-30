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
  MdPriorityHigh,
} from "react-icons/md";
import CustomSelect from "../../../components/CustomSelect";
import type { ApiVehicle, Vehicle } from "../../../types/vehicle";
import { formatDate } from "../../../utils/dateUtils";
import MaintenanceRequestModal from "../vehiclesComponent/MaintenanceRequestModal";
import SuccessNotification from "../vehiclesComponent/SuccessNotification";

// Vehicle Image Carousel Component
const VehicleImageCarousel = ({
  vehicle,
  loading,
}: {
  vehicle: ApiVehicle | Vehicle;
  loading: boolean;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Combine all photos
  const allPhotos = [
    ...(vehicle.defaultPhotos?.exterior || []),
    ...(vehicle.defaultPhotos?.interior || []),
  ];

  const hasPhotos = allPhotos.length > 0;

  React.useEffect(() => {
    if (!hasPhotos) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allPhotos.length);
    }, 3000); // Auto-slide every 3 seconds

    return () => clearInterval(interval);
  }, [allPhotos.length, hasPhotos]);

  const goToPrevious = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + allPhotos.length) % allPhotos.length
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allPhotos.length);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative aspect-video bg-gray-200 rounded-xl overflow-hidden shadow-lg">
        {hasPhotos ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                {/* Replace with actual image when available */}
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <div className="text-center">
                    <MdDirectionsCar className="w-24 h-24 text-blue-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">
                      Photo {currentImageIndex + 1}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {allPhotos.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
                >
                  ‹
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
                >
                  ›
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {allPhotos.length}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <MdDirectionsCar className="w-32 h-32 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No photos available</p>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {hasPhotos && allPhotos.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {allPhotos.slice(0, 8).map((_photo, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                currentImageIndex === index
                  ? "border-blue-500 shadow-md"
                  : "border-transparent hover:border-gray-300"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
                <span className="text-xs text-gray-500">{index + 1}</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Vehicle Quick Info */}
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              vehicle.status === "available"
                ? "bg-green-100 text-green-800"
                : vehicle.status === "reserved"
                ? "bg-blue-100 text-blue-800"
                : vehicle.status === "maintenance"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {vehicle.status === "available"
              ? "Available"
              : vehicle.status === "reserved"
              ? "Reserved"
              : vehicle.status === "maintenance"
              ? "Maintenance"
              : vehicle.status === "rented"
              ? "Rented"
              : vehicle.status}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Battery Level</span>
          <div className="flex items-center space-x-2">
            {vehicle.batteryLevel !== undefined && (
              <>
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      vehicle.batteryLevel > 60
                        ? "bg-green-500"
                        : vehicle.batteryLevel > 30
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${vehicle.batteryLevel}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {vehicle.batteryLevel}%
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const VehiclesStaff = () => {
  const [activeTab, setActiveTab] = useState<
    "all" | "available" | "booked" | "maintenance" | "returning"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [detailedVehicle, setDetailedVehicle] = useState<ApiVehicle | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
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

  const filteredVehicles = vehicles?.filter((vehicle) => {
    const matchesSearch =
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "all" || vehicle.type === selectedType;

    // Filter based on active tab
    let matchesStatus = true;
    if (activeTab === "available") {
      matchesStatus = vehicle.status === "available";
    } else if (activeTab === "booked") {
      matchesStatus = vehicle.status === "reserved";
    } else if (activeTab === "maintenance") {
      matchesStatus = vehicle.status === "maintenance";
    } else if (activeTab === "returning") {
      matchesStatus = vehicle.status === "rented";
    }

    return matchesSearch && matchesType && matchesStatus;
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
    booked: vehicles?.filter((v) => v.status === "reserved")?.length || 0,
    maintenance:
      vehicles?.filter((v) => v.status === "maintenance")?.length || 0,
    returning: vehicles?.filter((v) => v.status === "rented")?.length || 0,
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
                page?: number;
                limit?: number;
              } = {};

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
                {
                  id: "available",
                  label: "Available",
                  count: stats.available,
                },
                {
                  id: "booked",
                  label: "Booked",
                  count: stats.booked,
                },
                {
                  id: "maintenance",
                  label: "Maintenance",
                  count: stats.maintenance,
                },
                {
                  id: "returning",
                  label: "Returning",
                  count: stats.returning,
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

      {/* Search and Filters Row */}
      <motion.div
        className="mb-6 bg-white rounded-lg shadow-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left side - Search */}
          <div className="flex items-center gap-3">
            {/* Search */}
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

          {/* Right side - Vehicle Type Filter */}
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
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MdDirectionsCar className="w-6 h-6 text-blue-600" />
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
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MdClose className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Modal Content - 2 Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(95vh-80px)]">
                {/* Left Column - Image Carousel */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-y-auto">
                  <VehicleImageCarousel
                    vehicle={detailedVehicle || selectedVehicle}
                    loading={loadingDetail}
                  />
                </div>

                {/* Right Column - Vehicle Information */}
                <div className="p-6 overflow-y-auto space-y-4">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                        (detailedVehicle?.status || selectedVehicle.status) ===
                        "available"
                          ? "bg-green-100 text-green-800"
                          : (detailedVehicle?.status ||
                              selectedVehicle.status) === "reserved"
                          ? "bg-blue-100 text-blue-800"
                          : (detailedVehicle?.status ||
                              selectedVehicle.status) === "maintenance"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {(detailedVehicle?.status || selectedVehicle.status) ===
                      "available"
                        ? "✓ Available"
                        : (detailedVehicle?.status ||
                            selectedVehicle.status) === "reserved"
                        ? "📅 Reserved"
                        : (detailedVehicle?.status ||
                            selectedVehicle.status) === "maintenance"
                        ? "🔧 In Maintenance"
                        : (detailedVehicle?.status ||
                            selectedVehicle.status) === "rented"
                        ? "🚗 Rented"
                        : detailedVehicle?.status || selectedVehicle.status}
                    </span>
                  </div>

                  {/* Basic Information Card */}
                  <motion.div
                    className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MdDirectionsCar className="w-5 h-5 mr-2 text-blue-600" />
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
                    className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-5 border border-purple-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MdBuild className="w-5 h-5 mr-2 text-purple-600" />
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
                    className="bg-gradient-to-br from-green-50 to-white rounded-xl p-5 border border-green-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MdLocationOn className="w-5 h-5 mr-2 text-green-600" />
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
                            Station Code
                          </label>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {detailedVehicle?.station?.code ||
                              selectedVehicle.station?.code ||
                              "N/A"}
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
                    className="bg-gradient-to-br from-yellow-50 to-white rounded-xl p-5 border border-yellow-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MdAssignment className="w-5 h-5 mr-2 text-yellow-600" />
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
                      className="bg-gradient-to-br from-red-50 to-white rounded-xl p-5 border border-red-100"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <MdCalendarToday className="w-5 h-5 mr-2 text-red-600" />
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
                    className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border-2 border-dashed border-gray-300 sticky bottom-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MdPriorityHigh className="w-5 h-5 mr-2 text-gray-600" />
                      Staff Actions
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <motion.button
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setIsMaintenanceModalOpen(true);
                        }}
                      >
                        <MdBuild className="w-5 h-5" />
                        <span>Send Maintenance Request</span>
                      </motion.button>

                      <motion.button
                        className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to send a delete request for this vehicle?"
                            )
                          ) {
                            alert(
                              "Delete request sent for " +
                                getPlateNumber(detailedVehicle, selectedVehicle)
                            );
                          }
                        }}
                      >
                        <MdClose className="w-5 h-5" />
                        <span>Send Delete Request</span>
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
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
