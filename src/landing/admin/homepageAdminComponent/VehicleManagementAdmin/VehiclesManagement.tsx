import React, { useEffect, useState } from "react";
import { MdAdd, MdDirectionsCar } from "react-icons/md";
import VehicleFilters from "../../component/vehicle/VehicleFilters";
import VehicleTable from "../../component/vehicle/VehicleTable";
import VehicleDetailModal from "../../component/vehicle/VehicleDetailModal";
import { AddVehicleModal, UpdateVehicleModal } from "./index";
import { type Vehicle as UIVehicle } from "../../component/vehicle/VehicleRow";
import { PageTransition, FadeIn } from "../../component/animations";
import PageTitle from "../../component/PageTitle";
import {
  getAllVehicles,
  type Vehicle as APIVehicle,
} from "../../../../service/apiAdmin/apiVehicles/API";
import { getAllStations, type Station } from "../../../../service/apiAdmin/apiStation/API";

const VehiclesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState<UIVehicle | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [vehicleToUpdate, setVehicleToUpdate] = useState<APIVehicle | null>(null);
  const [vehicles, setVehicles] = useState<UIVehicle[]>([]);
  const [apiVehicles, setApiVehicles] = useState<APIVehicle[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Get station name by ID
  const getStationName = (stationId: string): string => {
    console.log("Available stations:", stations.map(s => ({ id: s._id, name: s.name })));
    const station = stations.find(s => s._id === stationId);
    console.log("Looking for station:", stationId, "Found:", station?.name);
    return station?.name || stationId; // Fallback to ID if station not found
  };

  // ✅ Map API Vehicle to UI Vehicle
  const mapApiToUi = (v: APIVehicle): UIVehicle => ({
    id: v._id,
    brand: v.brand,
    model: v.model,
    licensePlate: v.plateNumber,
    status: v.status as "available" | "rented" | "maintenance" | "reserved",
    location: v.stationData?.name || getStationName(v.station), // Use station name
    dailyRate: v.pricePerDay,
    lastService: v.updatedAt || v.createdAt || "",
    batteryCapacity: v.batteryCapacity,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
    defaultPhotos: v.defaultPhotos, // Add photos mapping
  });

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch vehicles first
      console.log("Starting to fetch vehicles...");
      const vehiclesData = await getAllVehicles();
      setApiVehicles(vehiclesData);
      
      // Try to fetch stations separately
      console.log("Starting to fetch stations...");
      try {
        const stationsData = await getAllStations(1, 1000);
        console.log("Fetched stations:", stationsData);
        console.log("Stations count:", stationsData.length);
        console.log("Stations data type:", typeof stationsData);
        console.log("Is stations array?", Array.isArray(stationsData));
        setStations(stationsData);
      } catch (stationsError) {
        console.error("Failed to fetch stations:", stationsError);
        setStations([]); // Set empty array if stations fail
      }
      
      setVehicles(vehiclesData.map(mapApiToUi));
    } catch (e) {
      console.error("Fetch vehicles error:", e);
      console.error("Error details:", e);
      
      // Try to fetch vehicles only if stations fail
      try {
        console.log("Trying to fetch vehicles only...");
        const vehiclesData = await getAllVehicles();
        setApiVehicles(vehiclesData);
        setVehicles(vehiclesData.map(mapApiToUi));
        setError("Failed to load stations, showing vehicles only");
      } catch (vehiclesError) {
        console.error("Failed to fetch vehicles too:", vehiclesError);
        setError(e instanceof Error ? e.message : "Failed to load vehicles");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Re-map vehicles when stations change
  useEffect(() => {
    if (apiVehicles.length > 0 && stations.length > 0) {
      console.log("Re-mapping vehicles with stations:", stations.length);
      setVehicles(apiVehicles.map(mapApiToUi));
    }
  }, [stations, apiVehicles]);

  const handleEdit = (vehicle: UIVehicle) => {
    // Show detail modal first
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleEditFromDetail = (vehicle: UIVehicle) => {
    // Close detail modal and open update modal
    setIsModalOpen(false);
    setSelectedVehicle(null);
    
    // Find the full API vehicle data for editing
    const apiVehicle = apiVehicles.find(v => v._id === vehicle.id);
    if (apiVehicle) {
      setVehicleToUpdate(apiVehicle);
      setIsUpdateOpen(true);
    }
  };

  const handleDelete = (vehicleId: string) => {
    console.log("Delete vehicle:", vehicleId);
  };

  const handleTransfer = (vehicle: UIVehicle) => {
    console.log("Transfer vehicle:", vehicle.id);
  };

  const handleMarkMaintenance = (vehicle: UIVehicle) => {
    console.log("Mark maintenance:", vehicle.id);
  };

  const handleAddSubmit = async () => {
    try {
      console.log("Add vehicle success, refreshing data...");
      await fetchVehicles();
      setIsAddOpen(false);
    } catch (e) {
      console.error("Add vehicle error:", e);
    }
  };

  const handleUpdateSubmit = async () => {
    try {
      await fetchVehicles();
      setIsUpdateOpen(false);
      setVehicleToUpdate(null);
    } catch (e) {
      console.error("Update vehicle error:", e);
    }
  };

  // ✅ Filter vehicles based on search and status
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || vehicle.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageTitle
            title="Vehicle Management"
            subtitle={`Total of ${vehicles.length} vehicles in the system`}
            icon={<MdDirectionsCar className="w-7 h-7 text-gray-700" />}
          />
          <FadeIn delay={0.3} duration={0.6}>
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
              <MdAdd className="w-5 h-5" />
              <span>Add New Vehicle</span>
            </button>
          </FadeIn>
        </div>

        <FadeIn delay={0.5} duration={0.6} direction="up">
          <VehicleFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
        </FadeIn>

        <FadeIn delay={0.7} duration={0.7} direction="up">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Loading vehicles...</p>
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
              onTransfer={handleTransfer}
              onMarkMaintenance={handleMarkMaintenance}
            />
          )}
        </FadeIn>

        {/* Modals */}
        <VehicleDetailModal
          vehicle={selectedVehicle}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedVehicle(null);
          }}
          onEdit={handleEditFromDetail}
        />

        <AddVehicleModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSuccess={handleAddSubmit}
        />

        <UpdateVehicleModal
          isOpen={isUpdateOpen}
          onClose={() => {
            setIsUpdateOpen(false);
            setVehicleToUpdate(null);
          }}
          onUpdated={handleUpdateSubmit}
          vehicle={vehicleToUpdate}
        />
      </div>
    </PageTransition>
  );
};

export default VehiclesManagement;
