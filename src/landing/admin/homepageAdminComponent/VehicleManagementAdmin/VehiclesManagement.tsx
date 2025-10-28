import React, { useEffect, useState } from "react";
import { MdAdd, MdDirectionsCar } from "react-icons/md";
import VehicleFilters from "../../component/vehicle/VehicleFilters";
import VehicleTable from "../../component/vehicle/VehicleTable";
import { AddVehicleModal, UpdateVehicleModal } from "./index";
import RequestsTab from "./components/RequestsTab/RequestsTab";
import VehicleDetailModal from "./components/VehicleDetailModal";
import { type Vehicle as UIVehicle } from "../../component/vehicle/VehicleRow";
import { FadeIn } from "../../component/animations";
import PageTitle from "../../component/PageTitle";
import {
  getAllVehicles,
  type Vehicle as APIVehicle,
} from "../../../../service/apiAdmin/apiVehicles/API";
import { getAllStations, type Station } from "../../../../service/apiAdmin/apiStation/API";
import TransferVehicleModal from "./components/TransferVehicleModal";
import ReportMaintenanceModal from "./components/ReportMaintenanceModal";
import RequestDeletionModal from "./components/RequestDeletionModal";

const VehiclesManagement: React.FC = () => {
  console.log("🚀 VehiclesManagement component rendering...");
  
  // State management
  const [activeTab, setActiveTab] = useState<"vehicles" | "requests">("vehicles");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState<APIVehicle | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [vehicleToUpdate, setVehicleToUpdate] = useState<APIVehicle | null>(null);
  const [vehicles, setVehicles] = useState<UIVehicle[]>([]);
  const [apiVehicles, setApiVehicles] = useState<APIVehicle[]>([]);
  const [allStations, setAllStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  console.log("🔍 Current searchLoading state:", searchLoading);
  const [error, setError] = useState<string | null>(null);
  const [maintenanceRequests] = useState<any[]>([]);
  const [deletionRequests] = useState<any[]>([]);

  // ✅ Get station name by ID
  const getStationName = (stationIdOrObject: string | Station): string => {
    if (typeof stationIdOrObject === 'string') {
      const station = allStations.find(s => s._id === stationIdOrObject);
      console.log("Looking for station:", stationIdOrObject, "Found:", station?.name);
      return station?.name || stationIdOrObject; // Fallback to ID if station not found
    } else {
      return stationIdOrObject.name || stationIdOrObject._id;
    }
  };

  // ✅ Map API Vehicle to UI Vehicle
  const mapApiToUi = (v: APIVehicle): UIVehicle => {
    const stationData = typeof v.station === 'object' ? v.station : null;
    return {
      id: v.id || v._id || "",
      brand: v.brand,
      model: v.model,
      licensePlate: v.plateNumber,
      status: v.status as "available" | "rented" | "maintenance" | "reserved",
      location: stationData?.name || getStationName(typeof v.station === 'string' ? v.station : ""),
      dailyRate: v.pricePerDay,
      lastService: v.updatedAt || v.createdAt || "",
      batteryCapacity: v.batteryCapacity,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
      defaultPhotos: v.defaultPhotos, // Include photos
    };
  };

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both vehicles and stations
      const [vehiclesData, stationsData] = await Promise.all([
        getAllVehicles(),
        getAllStations()
      ]);
      
      setApiVehicles(vehiclesData);
      setAllStations(stationsData);
      setVehicles(vehiclesData.map(mapApiToUi));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load vehicles");
      console.error("Fetch vehicles error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleEdit = (vehicle: UIVehicle) => {
    // Show detail modal first
    const apiVehicle = apiVehicles.find(v => (v.id || v._id) === vehicle.id);
    if (apiVehicle) {
      setSelectedVehicle(apiVehicle);
      setIsDetailModalOpen(true);
    }
  };

  const handleEditFromDetail = (vehicle: APIVehicle) => {
    // Close detail modal and open update modal
    setIsDetailModalOpen(false);
    setSelectedVehicle(null);
    
    setVehicleToUpdate(vehicle);
    setIsUpdateModalOpen(true);
  };

  const handleDelete = (vehicleId: string) => {
    console.log("Delete vehicle:", vehicleId);
  };

  const handleTransfer = (vehicle: APIVehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(false); // Close detail modal first
    setIsTransferModalOpen(true);
  };

  const handleReportMaintenance = (vehicle: APIVehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(false); // Close detail modal first
    setIsMaintenanceModalOpen(true);
  };

  const handleRequestDeletion = (vehicle: APIVehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(false); // Close detail modal first
    setIsDeletionModalOpen(true);
  };

  const handleAddSubmit = async () => {
    try {
      await fetchVehicles();
      setIsAddModalOpen(false);
    } catch (e) {
      console.error("Add vehicle error:", e);
    }
  };

  const handleUpdateSuccess = async () => {
    try {
      await fetchVehicles();
      setIsUpdateModalOpen(false);
      setVehicleToUpdate(null);
    } catch (e) {
      console.error("Update vehicle error:", e);
    }
  };

  const handleModalSuccess = () => {
    fetchVehicles();
  };

  // ✅ Filter vehicles based on search and status with loading effect
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || vehicle.status === selectedStatus;

    const matchesStation = true; // TODO: Add station filter if needed

    return matchesSearch && matchesStatus && matchesStation;
  });

  // Handle search with loading effect (non-blocking)
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      setSearchLoading(true);
      console.log("🔍 Search loading started");
      // Simulate search delay - show loading in table
      setTimeout(() => {
        setSearchLoading(false);
        console.log("🔍 Search loading ended");
      }, 800); // Longer delay to see table loading
    } else {
      setSearchLoading(false);
    }
  };

  // Handle status change with loading effect (non-blocking)
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    if (value !== "all") {
      setSearchLoading(true);
      console.log("🔍 Filter loading started");
      // Simulate filter delay - show loading in table
      setTimeout(() => {
        setSearchLoading(false);
        console.log("🔍 Filter loading ended");
      }, 600); // Longer delay to see table loading
    } else {
      setSearchLoading(false);
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
            onClick={fetchVehicles}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Simple fallback for testing
  if (loading) {
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

        {activeTab === "vehicles" ? (
          <>
            <FadeIn delay={0.5} duration={0.6} direction="up">
              <VehicleFilters
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                selectedStatus={selectedStatus}
                onStatusChange={handleStatusChange}
                isLoading={searchLoading}
              />
            </FadeIn>

            <FadeIn delay={0.7} duration={0.7} direction="up">
              {loading || searchLoading ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">
                {searchLoading ? "Searching vehicles..." : "Loading vehicles..."}
              </p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
              <p className="text-sm text-red-600 mb-2">{error}</p>
              <button
                onClick={fetchVehicles}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
              <MdDirectionsCar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No vehicles found</p>
            </div>
          ) : (
            <VehicleTable
              vehicles={filteredVehicles}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTransfer={(vehicle) => {
                const apiVehicle = apiVehicles.find(v => (v.id || v._id) === vehicle.id);
                if (apiVehicle) handleTransfer(apiVehicle);
              }}
              onMarkMaintenance={(vehicle) => {
                const apiVehicle = apiVehicles.find(v => (v.id || v._id) === vehicle.id);
                if (apiVehicle) handleReportMaintenance(apiVehicle);
              }}
              onRowClick={(vehicle) => {
                const apiVehicle = apiVehicles.find(v => (v.id || v._id) === vehicle.id);
                if (apiVehicle) {
                  setSelectedVehicle(apiVehicle);
                  setIsDetailModalOpen(true);
                }
              }}
              />
            )}
            </FadeIn>
          </>
        ) : (
          <RequestsTab
            maintenanceRequests={[]}
            deletionRequests={[]}
            transferLogs={[]}
            isLoading={false}
            onApproveMaintenance={async (id) => {
              console.log("Approve maintenance:", id);
            }}
            onRejectMaintenance={async (id) => {
              console.log("Reject maintenance:", id);
            }}
            onApproveDeletion={async (id) => {
              console.log("Approve deletion:", id);
            }}
            onRejectDeletion={async (id) => {
              console.log("Reject deletion:", id);
            }}
          />
        )}

      {/* Modals */}
      <VehicleDetailModal
        vehicle={selectedVehicle}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedVehicle(null);
        }}
        onEdit={handleEditFromDetail}
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
        onSuccess={handleAddSubmit}
      />

      <UpdateVehicleModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setVehicleToUpdate(null);
        }}
        onUpdated={handleUpdateSuccess}
        vehicle={vehicleToUpdate}
        stations={allStations}
      />
    </div>
  );
};

export default VehiclesManagement;
