import React, { useState } from "react";
import { MdAdd, MdDirectionsCar } from "react-icons/md";
import VehicleFilters from "../component/vehicle/VehicleFilters";
import VehicleTable from "../component/vehicle/VehicleTable";
import VehicleDetailModal from "../component/vehicle/VehicleDetailModal";
import { type Vehicle } from "../component/vehicle/VehicleRow";
import { PageTransition, FadeIn } from "../component/animations";
import PageTitle from "../component/PageTitle";

const VehicleManagementAdmin: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const vehicles: Vehicle[] = [
    {
      id: "1",
      brand: "VinFast",
      model: "VF9",
      licensePlate: "30A-12345",
      status: "available",
      location: "Quận 1, TP.HCM",
      dailyRate: 800000,
      lastService: "2024-09-15",
    },
    {
      id: "2",
      brand: "Tesla",
      model: "Model Y",
      licensePlate: "30B-67890",
      status: "rented",
      location: "Quận 7, TP.HCM",
      dailyRate: 1200000,
      lastService: "2024-09-10",
    },
    {
      id: "3",
      brand: "BMW",
      model: "X3",
      licensePlate: "30C-11111",
      status: "maintenance",
      location: "Garage - Quận 3",
      dailyRate: 900000,
      lastService: "2024-08-30",
    },
  ];

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = (vehicleId: string) => {
    // TODO: Implement delete logic
    console.log("Delete vehicle:", vehicleId);
  };

  const handleTransfer = (vehicle: Vehicle) => {
    // TODO: Implement transfer logic
    console.log("Transfer vehicle:", vehicle.id);
  };

  const handleMarkMaintenance = (vehicle: Vehicle) => {
    // TODO: Implement maintenance logic
    console.log("Mark maintenance:", vehicle.id);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header - Smooth animation */}
        <div className="flex items-center justify-between">
          <PageTitle
            title="Vehicle Management"
            subtitle={`Total of ${vehicles.length} vehicles in the system`}
            icon={<MdDirectionsCar className="w-7 h-7 text-gray-700" />}
          />
          <FadeIn delay={0.3} duration={0.6}>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:scale-105">
              <MdAdd className="w-5 h-5" />
              <span>Add New Vehicle</span>
            </button>
          </FadeIn>
        </div>

        {/* Filters - Fade in */}
        <FadeIn delay={0.5} duration={0.6} direction="up">
          <VehicleFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
        </FadeIn>

        {/* Vehicle Table - Slide in smooth */}
        <FadeIn delay={0.7} duration={0.7} direction="up">
          <VehicleTable
            vehicles={vehicles}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTransfer={handleTransfer}
            onMarkMaintenance={handleMarkMaintenance}
          />
        </FadeIn>

        {/* Vehicle Detail Modal */}
        <VehicleDetailModal
          vehicle={selectedVehicle}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedVehicle(null);
          }}
        />
      </div>
    </PageTransition>
  );
};

export default VehicleManagementAdmin;
