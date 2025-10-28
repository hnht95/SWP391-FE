import { useState, useEffect } from "react";
import {
  getDeletionRequests,
  getMaintenanceRequests,
  getAllTransferLogs,
  approveDeletionRequest,
  rejectDeletionRequest,
  approveMaintenanceRequest,
  rejectMaintenanceRequest,
} from "../../../../../service/apiAdmin/apiVehicles/API";
import type {
  MaintenanceRequest,
  DeletionRequest,
  TransferLog,
} from "../../../../../types/vehicle";

export const useVehicleRequests = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  const [transferLogs, setTransferLogs] = useState<TransferLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [maintenance, deletion, transfers] = await Promise.all([
        getMaintenanceRequests(),
        getDeletionRequests(),
        getAllTransferLogs(),
      ]);
      
      setMaintenanceRequests(maintenance);
      setDeletionRequests(deletion);
      setTransferLogs(transfers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch requests");
    } finally {
      setIsLoading(false);
    }
  };

  const approveMaintenance = async (requestId: string) => {
    try {
      await approveMaintenanceRequest(requestId);
      await fetchAllRequests(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  const rejectMaintenance = async (requestId: string) => {
    try {
      await rejectMaintenanceRequest(requestId);
      await fetchAllRequests(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  const approveDeletion = async (requestId: string) => {
    try {
      await approveDeletionRequest(requestId);
      await fetchAllRequests(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  const rejectDeletion = async (requestId: string) => {
    try {
      await rejectDeletionRequest(requestId);
      await fetchAllRequests(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  const refetch = () => {
    fetchAllRequests();
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  return {
    maintenanceRequests,
    deletionRequests,
    transferLogs,
    isLoading,
    error,
    approveMaintenance,
    rejectMaintenance,
    approveDeletion,
    rejectDeletion,
    refetch,
  };
};
