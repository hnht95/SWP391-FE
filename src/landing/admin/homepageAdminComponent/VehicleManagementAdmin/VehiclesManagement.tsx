import React, { useEffect, useState } from "react";
import { MdAdd, MdDirectionsCar } from "react-icons/md";
import VehicleFilters from "../../component/vehicle/VehicleFilters";
import VehicleTable from "../../component/vehicle/VehicleTable";
import VehicleDetailModal from "../../component/vehicle/VehicleDetailModal";
import { AddVehicleModal } from "./index";
import { type Vehicle } from "../../component/vehicle/VehicleRow";
import { PageTransition, FadeIn } from "../../component/animations";
import PageTitle from "../../component/PageTitle";
import adminVehiclesAPI, { type AdminVehicle, type CreateAdminVehicleInput } from "../../../../service/apiAdmin/API";

const VehiclesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapAdminToUi = (v: AdminVehicle): Vehicle => ({
    id: v.id,
    brand: v.brand,
    model: v.model,
    licensePlate: v.licensePlate,
    status: v.status,
    location: v.location,
    dailyRate: v.dailyRate,
    lastService: v.lastService,
  });

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminVehiclesAPI.list();
      const data = Array.isArray(res) ? res : (res.data ?? []);
      setVehicles(data.map(mapAdminToUi));
    } catch (e) {
      setError("Không tải được danh sách xe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = (vehicleId: string) => {
    console.log("Delete vehicle:", vehicleId);
  };

  const handleTransfer = (vehicle: Vehicle) => {
    console.log("Transfer vehicle:", vehicle.id);
  };

  const handleMarkMaintenance = (vehicle: Vehicle) => {
    console.log("Mark maintenance:", vehicle.id);
  };

  const handleAddSubmit = async (data: Omit<Vehicle, "id">) => {
    try {
      const payload: CreateAdminVehicleInput = {
        brand: data.brand,
        model: data.model,
        licensePlate: data.licensePlate,
        status: data.status,
        location: data.location,
        dailyRate: data.dailyRate,
        lastService: data.lastService,
      };
      await adminVehiclesAPI.create(payload);
      await fetchVehicles();
    } catch (e) {
      // silent error; optionally show a toast if available
    }
  };

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
            <button onClick={() => setIsAddOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:scale-105">
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
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-sm text-gray-600">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 text-sm text-red-600">{error}</div>
          ) : (
            <VehicleTable
              vehicles={vehicles}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTransfer={handleTransfer}
              onMarkMaintenance={handleMarkMaintenance}
            />
          )}
        </FadeIn>

        <VehicleDetailModal
          vehicle={selectedVehicle}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedVehicle(null);
          }}
        />

        <AddVehicleModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSubmit={handleAddSubmit}
        />
      </div>
    </PageTransition>
  );
};

export default VehiclesManagement;


