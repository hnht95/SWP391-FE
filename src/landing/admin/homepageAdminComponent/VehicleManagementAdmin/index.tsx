// Main Vehicle Management Component
export { default as VehiclesManagement } from "./VehiclesManagement";

// Components
export { default as VehicleTable } from "./components/VehicleTable";
export { default as VehicleRow } from "./components/VehicleRow";
export { default as VehicleDetailModal } from "./components/VehicleDetailModal";
export { default as TransferVehicleModal } from "./components/TransferVehicleModal";
export { default as ReportMaintenanceModal } from "./components/ReportMaintenanceModal";
export { default as RequestDeletionModal } from "./components/RequestDeletionModal";
export { default as RequestsTab } from "./components/RequestsTab/RequestsTab";
export { default as MaintenanceRequestRow } from "./components/RequestsTab/MaintenanceRequestRow";
export { default as DeletionRequestRow } from "./components/RequestsTab/DeletionRequestRow";

// Hooks
export { useVehicles } from "./hooks/useVehicles";
export { useVehicle } from "./hooks/useVehicle";
export { useVehicleRequests } from "./hooks/useVehicleRequests";

// Services - using existing API
export {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  transferVehicleStation,
  getAllTransferLogs,
  uploadVehiclePhotos,
  reportMaintenance,
  createDeletionRequest,
  getDeletionRequests,
  approveDeletionRequest,
  rejectDeletionRequest,
  getMaintenanceRequests,
  approveMaintenanceRequest,
  rejectMaintenanceRequest,
} from "../../../../service/apiAdmin/apiVehicles/API";

// Types - using existing types
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

// Import existing modals from the same directory
export { default as AddVehicleModal } from "./AddVehicleModal";
export { default as UpdateVehicleModal } from "./UpdateVehicleModal";
