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
  getVehiclesPaginated,
  type Vehicle as APIVehicle,
  getPhotoUrls,
  getMaintenanceRequestsPaginated,
} from "../../../../service/apiAdmin/apiVehicles/API";
import {
  getDeletionRequestsPaginated,
  approveDeletionRequest,
  rejectDeletionRequest,
} from "../../../../service/apiAdmin/apiVehicles/API";
import {
  getAllStations,
  type Station,
} from "../../../../service/apiAdmin/apiStation/API";
import TransferVehicleModal from "./components/TransferVehicleModal";
import ReportMaintenanceModal from "./components/ReportMaintenanceModal";
import RequestDeletionModal from "./components/RequestDeletionModal";
import DeletionRequestDetailModal from "./components/RequestsTab/DeletionRequestDetailModal";
import MaintenanceRequestDetailModal from "./components/RequestsTab/MaintenanceRequestDetailModal";
import ConfirmDeleteVehicleModal from "./components/ConfirmDeleteVehicleModal";
import IosSuccessModal from "./components/IosSuccessModal";
import { deleteVehicle } from "../../../../service/apiAdmin/apiVehicles/API";

const VehiclesManagement: React.FC = () => {
  console.log("🚀 VehiclesManagement component rendering...");

  // State management
  const [activeTab, setActiveTab] = useState<"vehicles" | "requests">(
    "vehicles"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState<APIVehicle | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [isDeletionDetailOpen, setIsDeletionDetailOpen] = useState(false);
  const [selectedDeletionRequest, setSelectedDeletionRequest] = useState<
    any | null
  >(null);
  const [vehicleToUpdate, setVehicleToUpdate] = useState<APIVehicle | null>(
    null
  );
  const [vehicles, setVehicles] = useState<UIVehicle[]>([]);
  const [apiVehicles, setApiVehicles] = useState<APIVehicle[]>([]);
  const [allStations, setAllStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  console.log("🔍 Current searchLoading state:", searchLoading);
  const [error, setError] = useState<string | null>(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsLimit] = useState(20);
  const [requestsTotalPages, setRequestsTotalPages] = useState(1);
  // Vehicles pagination
  const [vehPage, setVehPage] = useState(1);
  const [vehLimit] = useState(20);
  const [vehTotal, setVehTotal] = useState(0);
  const [vehTotalPages, setVehTotalPages] = useState(1);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleteSuccessOpen, setIsDeleteSuccessOpen] = useState(false);

  // ✅ Get station name by ID
  const getStationName = (stationIdOrObject: any): string => {
    if (!(stationIdOrObject as any)) return "";
    if (typeof stationIdOrObject === "string") {
      const station = allStations.find((s) => s._id === stationIdOrObject);
      console.log(
        "Looking for station:",
        stationIdOrObject,
        "Found:",
        station?.name
      );
      return station?.name || stationIdOrObject; // Fallback to ID if station not found
    } else {
      return stationIdOrObject?.name || (stationIdOrObject as any)?._id || "";
    }
  };

  // ✅ Map API Vehicle to UI Vehicle
  const mapApiToUi = (v: APIVehicle): UIVehicle => {
    const stationData = typeof v.station === "object" ? v.station : null;
    return {
      id: (v as any).id || v._id || "",
      brand: v.brand,
      model: v.model,
      licensePlate: v.plateNumber,
      status: v.status as "available" | "rented" | "maintenance" | "reserved",
      location:
        stationData?.name ||
        getStationName(typeof v.station === "string" ? v.station : ""),
      dailyRate: v.pricePerDay,
      lastService: v.updatedAt || v.createdAt || "",
      batteryCapacity: v.batteryCapacity,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
      defaultPhotos: {
        exterior: getPhotoUrls((v.defaultPhotos?.exterior as any) || []),
        interior: getPhotoUrls((v.defaultPhotos?.interior as any) || []),
      },
    };
  };

  const fetchVehicles = async (page = vehPage) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both vehicles (paginated) and stations
      const [{ items, pagination }, stationsData] = await Promise.all([
        getVehiclesPaginated(page, vehLimit),
        getAllStations(),
      ]);

      setApiVehicles(items);
      setAllStations(stationsData);
      setVehicles(items.map(mapApiToUi));
      if (pagination) {
        setVehPage(pagination.page);
        setVehTotal(pagination.total);
        setVehTotalPages(pagination.totalPages);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load vehicles");
      console.error("Fetch vehicles error:", e);
    } finally {
      setLoading(false);
    }
  };

  const mapDeletionRequest = (item: any) => {
    const vehicleStation = item.vehicle?.station;
    const stationFromItem = item.station ?? vehicleStation;

    return {
      _id: item._id,
      vehicleId: item.vehicle?._id || item.vehicleId,
      vehicle: {
        _id: item.vehicle?._id || item.vehicleId,
        plateNumber: item.vehicle?.plateNumber || item.plateNumber || "",
        brand: item.vehicle?.brand || "",
        model: item.vehicle?.model || "",
        station: stationFromItem,
        status: item.vehicle?.status,
      },
      reason: item.reason || item.reportText || "",
      requestedBy:
        typeof item.requestedBy === "string"
          ? item.requestedBy
          : item.reportedBy?.name || item.reportedBy?.email || "",
      requestedAt:
        item.requestedAt || item.createdAt || new Date().toISOString(),
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  };

  const fetchDeletionRequestsData = async (page = requestsPage) => {
    setRequestsLoading(true);
    try {
      const { items, pagination } = await getDeletionRequestsPaginated(
        page,
        requestsLimit
      );
      setDeletionRequests((items || []).map(mapDeletionRequest));
      if (pagination) {
        setRequestsPage(pagination.page || 1);
        setRequestsTotalPages(pagination.totalPages || 1);
      }
    } catch (e) {
      console.error("Fetch deletion requests error:", e);
    } finally {
      setRequestsLoading(false);
    }
  };

  const mapMaintenanceRequest = (item: any) => {
    const stationFromItem = item.station ?? item.vehicle?.station;
    return {
      _id: item._id,
      vehicle: item.vehicle
        ? {
            _id: item.vehicle._id,
            plateNumber: item.vehicle.plateNumber,
            brand: item.vehicle.brand,
            model: item.vehicle.model,
            status: item.vehicle.status,
          }
        : null,
      description: item.description,
      urgency: item.urgency,
      evidencePhotos: item.evidencePhotos || [],
      status: item.status,
      station: stationFromItem,
      reportedBy: item.reportedBy,
      reportedAt: item.createdAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  };

  const fetchMaintenanceRequestsData = async (page = requestsPage) => {
    setRequestsLoading(true);
    try {
      const { items, pagination } = await getMaintenanceRequestsPaginated(page, requestsLimit);
      setMaintenanceRequests((items || []).map(mapMaintenanceRequest));
      if (pagination) {
        setRequestsPage(pagination.page || 1);
        setRequestsTotalPages(pagination.totalPages || 1);
      }
    } catch (e) {
      console.error("Fetch maintenance requests error:", e);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(1);
    fetchDeletionRequestsData();
    fetchMaintenanceRequestsData();
  }, []);

  const handleEdit = (vehicle: UIVehicle) => {
    // Show detail modal first
    const apiVehicle = apiVehicles.find(
      (v) => ((v as any).id || v._id) === (vehicle as any).id
    );
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

  const handleDeleteDirect = (vehicle: APIVehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(false);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = async (vehicleId: string) => {
    try {
      await deleteVehicle(vehicleId);
      setIsConfirmDeleteOpen(false);
      setSelectedVehicle(null);
      await fetchVehicles();
      setIsDeleteSuccessOpen(true);
    } catch (e) {
      console.error("Delete vehicle error:", e);
    }
  };

  const handleAddSubmit = async () => {
    try {
      // Wait a moment to ensure backend has fully processed the new vehicle
      // This ensures valuation and other fields are available when we fetch
      await new Promise(resolve => setTimeout(resolve, 1000));
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
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Vehicles
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchVehicles()}
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
                <span
                  className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
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
              page={vehPage}
              totalPages={vehTotalPages}
              total={vehTotal}
            />
          </FadeIn>

          <FadeIn delay={0.7} duration={0.7} direction="up">
            {loading || searchLoading ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">
                  {searchLoading
                    ? "Searching vehicles..."
                    : "Loading vehicles..."}
                </p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
                <p className="text-sm text-red-600 mb-2">{error}</p>
                <button
                  onClick={() => fetchVehicles()}
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
                  const apiVehicle = apiVehicles.find(
                    (v) => ((v as any).id || v._id) === (vehicle as any).id
                  );
                  if (apiVehicle) handleTransfer(apiVehicle);
                }}
                onMarkMaintenance={(vehicle) => {
                  const apiVehicle = apiVehicles.find(
                    (v) => ((v as any).id || v._id) === (vehicle as any).id
                  );
                  if (apiVehicle) handleReportMaintenance(apiVehicle);
                }}
                onRowClick={(vehicle) => {
                  const apiVehicle = apiVehicles.find(
                    (v) => ((v as any).id || v._id) === (vehicle as any).id
                  );
                  if (apiVehicle) {
                    setSelectedVehicle(apiVehicle);
                    setIsDetailModalOpen(true);
                  }
                }}
                page={vehPage}
                limit={vehLimit}
                total={vehTotal}
                totalPages={vehTotalPages}
                onPageChange={(p) => fetchVehicles(p)}
              />
            )}
          </FadeIn>
        </>
      ) : (
        <RequestsTab
          maintenanceRequests={[]}
          deletionRequests={deletionRequests as any}
          transferLogs={[]}
          isLoading={requestsLoading}
          pagination={{ page: requestsPage, totalPages: requestsTotalPages }}
          onPageChange={(p) => fetchDeletionRequestsData(p)}
          onApproveMaintenance={async (id) => {
            console.log("Approve maintenance:", id);
          }}
          onRejectMaintenance={async (id) => {
            console.log("Reject maintenance:", id);
          }}
          onApproveDeletion={async (id) => {
            try {
              await approveDeletionRequest(id);
              await fetchDeletionRequestsData();
            } catch (e) {
              console.error("Approve deletion error:", e);
            }
          }}
          onRejectDeletion={async (id) => {
            try {
              await rejectDeletionRequest(id);
              await fetchDeletionRequestsData();
            } catch (e) {
              console.error("Reject deletion error:", e);
            }
          }}
          onViewDeletionRequest={(req) => {
            setSelectedDeletionRequest(req);
            setIsDeletionDetailOpen(true);
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
        onDelete={handleDeleteDirect}
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

      <ConfirmDeleteVehicleModal
        vehicle={selectedVehicle}
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setSelectedVehicle(null);
        }}
        onConfirm={confirmDelete}
      />

      <IosSuccessModal
        isOpen={isDeleteSuccessOpen}
        title="Vehicle deleted successfully"
        onClose={() => setIsDeleteSuccessOpen(false)}
      />

      <DeletionRequestDetailModal
        request={selectedDeletionRequest}
        isOpen={isDeletionDetailOpen}
        onClose={() => {
          setIsDeletionDetailOpen(false);
          setSelectedDeletionRequest(null);
        }}
        getStationName={getStationName}
      />

      <MaintenanceRequestDetailModal
        request={maintenanceRequests}
        isOpen={isMaintenanceModalOpen}
        onClose={() => { setIsMaintenanceModalOpen(false); setSelectedVehicle(null); }}
        getStationName={getStationName}
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
