import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MdAdd, MdDirectionsCar, MdSearch } from "react-icons/md";
import { useVehicles } from "./hooks/useVehicles";
import { useVehicleRequests } from "./hooks/useVehicleRequests";
import { getAllStations, type Station } from "../../../../service/apiAdmin/apiStation/API";
import type { Vehicle } from "../../../../service/apiAdmin/apiVehicles/API";
import { getStationId, getStationName as getStationNameHelper } from "../../../../service/apiAdmin/apiVehicles/API";
import PageTitle from "../../component/PageTitle";
import VehicleTable from "./components/VehicleTable";
import VehicleDetailModal from "./components/VehicleDetailModal";
import TransferVehicleModal from "./components/TransferVehicleModal";
import ReportMaintenanceModal from "./components/ReportMaintenanceModal";
import RequestDeletionModal from "./components/RequestDeletionModal";
import RequestsTab from "./components/RequestsTab/RequestsTab";
import { AddVehicleModal, UpdateVehicleModal } from "./index";

const VehiclesManagement: React.FC = () => {
  console.log("🚀 VehiclesManagement component rendering...");
  
  // State management
  const [activeTab, setActiveTab] = useState<"vehicles" | "requests">("vehicles");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStation, setSelectedStation] = useState("all");
  const [allStations, setAllStations] = useState<Station[]>([]);
  
  // Loading states for different filters
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [isStationLoading, setIsStationLoading] = useState(false);
  
  // Modal states
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [vehicleToUpdate, setVehicleToUpdate] = useState<Vehicle | null>(null);
  
  // Data hooks
  const { vehicles, isLoading, error, refetch } = useVehicles();
  
  console.log("📊 Data state:", { vehicles: vehicles.length, isLoading, error });

  // Fetch stations
  useEffect(() => {
    const fetchStations = async () => {
      console.log("🏢 Fetching stations...");
      try {
        const stationsData = await getAllStations(1, 1000);
        console.log("✅ Stations fetched:", stationsData);
        setAllStations(stationsData);
      } catch (err) {
        console.error("❌ Error fetching stations:", err);
      }
    };

    fetchStations();
  }, []);

  // Helper function to get station name by ID
  const getStationName = (stationIdOrObject: string) => {
    // If stationIdOrObject is already an object with a _id property, it's a station object
    // Otherwise, it's a station ID string
    const stationId = typeof stationIdOrObject === 'string' ? stationIdOrObject : stationIdOrObject._id || stationIdOrObject;
    const station = allStations.find(s => s._id === stationId);
    return station?.name || "Unknown";
  };
  const {
    maintenanceRequests,
    deletionRequests,
    transferLogs,
    isLoading: requestsLoading,
    approveMaintenance,
    rejectMaintenance,
    approveDeletion,
    rejectDeletion,
    refetch: refetchRequests,
  } = useVehicleRequests();


  // Filter vehicles based on search and filters
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || vehicle.status === selectedStatus;


    const matchesStation =
      selectedStation === "all" || 
      getStationId(vehicle.station) === selectedStation ||
      (vehicle.stationData && vehicle.stationData._id === selectedStation);

    return matchesSearch && matchesStatus && matchesStation;
  });

  // Event handlers
  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(true);
  };

  // Filter handlers with loading states
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setIsSearchLoading(true);
    setTimeout(() => setIsSearchLoading(false), 300);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setIsStatusLoading(true);
    setTimeout(() => setIsStatusLoading(false), 300);
  };

  const handleStationChange = (value: string) => {
    setSelectedStation(value);
    setIsStationLoading(true);
    setTimeout(() => setIsStationLoading(false), 300);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setVehicleToUpdate(vehicle);
    setIsUpdateModalOpen(true);
  };

  const handleTransfer = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsTransferModalOpen(true);
  };

  const handleReportMaintenance = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsMaintenanceModalOpen(true);
  };

  const handleRequestDeletion = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeletionModalOpen(true);
  };

  const handleModalSuccess = () => {
    refetch();
    refetchRequests();
  };

  const handleAddSuccess = async () => {
    await refetch();
    setIsAddModalOpen(false);
  };

  const handleUpdateSuccess = async () => {
    await refetch();
    setIsUpdateModalOpen(false);
    setVehicleToUpdate(null);
  };

  const handleRequestAction = async (action: () => Promise<void>) => {
    try {
      await action();
      // Show success toast here if needed
    } catch (error) {
      // Show error toast here if needed
      console.error("Request action failed:", error);
    }
  };

  const tabs = [
    {
      id: "vehicles" as const,
      label: "All Vehicles",
      count: vehicles.length,
    },
    {
      id: "requests" as const,
      label: "Requests",
      count: maintenanceRequests.length + deletionRequests.length,
    },
  ];

  // Add error boundary
  if (error) {
    console.error("❌ VehiclesManagement error:", error);
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Vehicles</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Simple fallback for testing
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageTitle
          title="Vehicle Management"
          subtitle={`Total of ${vehicles.length} vehicles in the system`}
          icon={<MdDirectionsCar className="w-7 h-7 text-gray-700" />}
        />
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-all duration-300 hover:shadow-lg"
        >
          <MdAdd className="w-5 h-5" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "vehicles" ? (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by license plate, brand..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                {/* Station Filter */}
                <div className="relative">
                  <select
                    value={selectedStation}
                    onChange={(e) => handleStationChange(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Stations</option>
                    {allStations.map((station) => (
                      <option key={station._id} value={station._id}>
                        {station.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Vehicle Table */}
            {isLoading ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Loading vehicles...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
                <p className="text-sm text-red-600 mb-2">{error}</p>
                <button
                  onClick={refetch}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : isSearchLoading || isStatusLoading || isStationLoading ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">
                  {isSearchLoading && "Loading vehicles..."}
                  {isStatusLoading && "Loading status..."}
                  {isStationLoading && "Loading station..."}
                </p>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
                <MdDirectionsCar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No vehicles found</p>
              </div>
            ) : (
              <VehicleTable
                vehicles={filteredVehicles}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onTransfer={handleTransfer}
                onReportMaintenance={handleReportMaintenance}
                onRequestDeletion={handleRequestDeletion}
                getStationName={getStationName}
              />
            )}
          </div>
        ) : (
          <RequestsTab
            maintenanceRequests={maintenanceRequests}
            deletionRequests={deletionRequests}
            transferLogs={transferLogs}
            isLoading={requestsLoading}
            onApproveMaintenance={(id) => handleRequestAction(() => approveMaintenance(id))}
            onRejectMaintenance={(id) => handleRequestAction(() => rejectMaintenance(id))}
            onApproveDeletion={(id) => handleRequestAction(() => approveDeletion(id))}
            onRejectDeletion={(id) => handleRequestAction(() => rejectDeletion(id))}
          />
        )}
      </motion.div>

      {/* Modals */}
      <VehicleDetailModal
        vehicle={selectedVehicle}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedVehicle(null);
        }}
        onEdit={handleEdit}
        onTransfer={handleTransfer}
        onReportMaintenance={handleReportMaintenance}
        onRequestDeletion={handleRequestDeletion}
        getStationName={getStationName}
      />

      <TransferVehicleModal
        vehicle={selectedVehicle}
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setSelectedVehicle(null);
        }}
        onSuccess={handleModalSuccess}
        stations={allStations as any}
      />

      <ReportMaintenanceModal
        vehicle={selectedVehicle}
        isOpen={isMaintenanceModalOpen}
        onClose={() => {
          setIsMaintenanceModalOpen(false);
          setSelectedVehicle(null);
        }}
        onSuccess={handleModalSuccess}
      />

      <RequestDeletionModal
        vehicle={selectedVehicle}
        isOpen={isDeletionModalOpen}
        onClose={() => {
          setIsDeletionModalOpen(false);
          setSelectedVehicle(null);
        }}
        onSuccess={handleModalSuccess}
      />

      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      <UpdateVehicleModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setVehicleToUpdate(null);
        }}
        onUpdated={handleUpdateSuccess}
        vehicle={vehicleToUpdate}
      />
    </div>
  );
};

export default VehiclesManagement;