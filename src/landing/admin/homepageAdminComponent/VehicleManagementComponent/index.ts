/**
 * VehicleManagementComponent Module
 * Main barrel export for all vehicle management components
 */

// Main component
export { default as VehiclesManagement } from "./VehiclesManagement";
export { default } from "./VehiclesManagement";

// Modals
export { default as AddVehicleModal } from "./AddVehicleModal";
export { default as UpdateVehicleModal } from "./UpdateVehicleModal";
export { default as UploadCarPhotos } from "./UploadCarPhotos";

// Detail Components
export { default as VehicleDetailModal } from "./components/VehicleDetailModal";
export { default as TransferVehicleModal } from "./components/TransferVehicleModal";
export { default as ReportMaintenanceModal } from "./components/ReportMaintenanceModal";
export { default as RequestDeletionModal } from "./components/RequestDeletionModal";
export { default as RequestsTab } from "./components/RequestsTab/RequestsTab";
export { default as MaintenanceRequestRow } from "./components/RequestsTab/MaintenanceRequestRow";
export { default as DeletionRequestRow } from "./components/RequestsTab/DeletionRequestRow";

// API Services
export {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  transferVehicleStation,
  getAllTransferLogs,
  reportMaintenance,
  createDeletionRequest,
  getDeletionRequests,
  approveDeletionRequest,
  rejectDeletionRequest,
  getMaintenanceRequests,
  approveMaintenanceRequest,
  rejectMaintenanceRequest,
} from "../../../../service/apiAdmin/apiVehicles/API";

// Types
export type {
  Vehicle,
  TransferLog,
  CreateVehicleData,
  UpdateVehicleData,
  TransferStationData,
} from "../../../../service/apiAdmin/apiVehicles/API";

export type {
  Station,
  MaintenanceRequest,
  DeletionRequest,
  TransferVehicleRequest,
  ReportMaintenanceRequest,
  CreateDeletionRequest,
  StatusStyle,
} from "../../../../types/vehicle";


