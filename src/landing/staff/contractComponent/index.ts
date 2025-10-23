/**
 * Contract Component Exports
 * Centralized export point for all contract-related components
 */

export { default as ContractStatsCards } from "./ContractStatsCards";
export { default as CreateContractModal } from "./CreateContractModal";
export { default as ContractDetailModal } from "./ContractDetailModal";
export { default as ContractTable } from "./ContractTable";
export { default as ContractFilters } from "./ContractFilters";
export { default as NotificationDropdown } from "./NotificationDropdown";

export {
  getStatusBadge,
  getStatusText,
  getPriorityColor,
  calculateContractStats,
  type ContractStats,
} from "./contractUtils";
