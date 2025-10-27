import { useState, useEffect, useCallback } from "react";
import { staffAPI } from "../service/apiStaff/API";
import type { RawApiVehicle } from "../types/vehicle";
import type { ApiVehicle } from "../types/vehicle";

interface VehiclesResponse {
  vehicles: ApiVehicle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface GetVehiclesParams {
  station?: string;
  status?: "available" | "reserved" | "rented" | "maintenance";
  brand?: string;
  page?: number;
  limit?: number;
}

interface UseVehiclesReturn {
  vehicles: ApiVehicle[];
  pagination: VehiclesResponse["pagination"] | null;
  loading: boolean;
  error: string | null;
  fetchVehicles: (params?: GetVehiclesParams) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useVehicles = (
  initialParams: GetVehiclesParams = {}
): UseVehiclesReturn => {
  const [vehicles, setVehicles] = useState<ApiVehicle[]>([]);
  const [pagination, setPagination] = useState<
    VehiclesResponse["pagination"] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentParams, setCurrentParams] =
    useState<GetVehiclesParams>(initialParams);

  const fetchVehicles = useCallback(async (params: GetVehiclesParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await staffAPI.getVehicles(params);

      // Defensive: get vehicles array from response.items
      const vehicleList = Array.isArray(response.items) ? response.items : [];

      if (!Array.isArray(vehicleList)) {
        setVehicles([]);
        setPagination(response.pagination || null);
        setCurrentParams(params);
        throw new Error("API response does not contain items array");
      }

      const mappedVehicles: ApiVehicle[] = vehicleList.map(
        (apiVehicle: RawApiVehicle) => ({
          id: apiVehicle._id,
          name: `${apiVehicle.brand} ${apiVehicle.model}`,
          brand: apiVehicle.brand,
          model: apiVehicle.model,
          status: apiVehicle.status,
          station: apiVehicle.station,
          batteryLevel: apiVehicle.batteryCapacity,
          batteryCapacity: apiVehicle.batteryCapacity,
          year: apiVehicle.year,
          licensePlate: apiVehicle.plateNumber,
          vin: apiVehicle.vin,
          color: apiVehicle.color,
          mileage: apiVehicle.mileage,
          pricePerDay: apiVehicle.pricePerDay,
          pricePerHour: apiVehicle.pricePerHour,
          owner: apiVehicle.owner,
          company: apiVehicle.company,
          valuation: apiVehicle.valuation,
          defaultPhotos: apiVehicle.defaultPhotos,
          ratingAvg: apiVehicle.ratingAvg,
          ratingCount: apiVehicle.ratingCount,
          tags: apiVehicle.tags,
          maintenanceHistory: apiVehicle.maintenanceHistory,
          createdAt: apiVehicle.createdAt,
          updatedAt: apiVehicle.updatedAt,
          imageUrl: apiVehicle.defaultPhotos?.exterior?.[0] || undefined,
        })
      );

      setVehicles(mappedVehicles);
      setPagination(response.pagination || null);
      setCurrentParams(params);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while fetching vehicles";
      setError(errorMessage);
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchVehicles(currentParams);
  }, [fetchVehicles, currentParams]);

  useEffect(() => {
    fetchVehicles(initialParams);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    vehicles,
    pagination,
    loading,
    error,
    fetchVehicles,
    refetch,
  };
};

// Hook for individual vehicle operations
export const useVehicleOperations = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateVehicleStatus = useCallback(
    async (id: string, status: ApiVehicle["status"]) => {
      setLoading(true);
      setError(null);

      try {
        // Map local status to API status (API doesn't support "reserved")
        const apiStatus = status === "reserved" ? "available" : status;
        const updatedVehicle = await staffAPI.updateVehicleStatus(
          id,
          apiStatus as "available" | "rented" | "maintenance"
        );
        return updatedVehicle;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An error occurred while updating vehicle status";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateVehicleMaintenance = useCallback(
    async (
      id: string,
      maintenanceData: {
        status: "maintenance" | "available";
        maintenanceNotes?: string;
        estimatedCompletionDate?: string;
      }
    ) => {
      setLoading(true);
      setError(null);

      try {
        const updatedVehicle = await staffAPI.updateVehicleMaintenance(
          id,
          maintenanceData
        );
        return updatedVehicle;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An error occurred while updating vehicle maintenance";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getVehicleDetail = useCallback(
    async (id: string): Promise<ApiVehicle> => {
      setLoading(true);
      setError(null);

      try {
        const rawVehicle = await staffAPI.getVehicleById(id);

        // Map raw API response to ApiVehicle interface
        const detailVehicle: ApiVehicle = {
          id: rawVehicle._id,
          name: `${rawVehicle.brand} ${rawVehicle.model}`,
          brand: rawVehicle.brand,
          model: rawVehicle.model,
          status: rawVehicle.status,
          station: rawVehicle.station,
          batteryLevel: rawVehicle.batteryCapacity,
          batteryCapacity: rawVehicle.batteryCapacity,
          year: rawVehicle.year,
          licensePlate: rawVehicle.plateNumber,
          vin: rawVehicle.vin,
          color: rawVehicle.color,
          mileage: rawVehicle.mileage,
          pricePerDay: rawVehicle.pricePerDay,
          pricePerHour: rawVehicle.pricePerHour,
          owner: rawVehicle.owner,
          company: rawVehicle.company,
          valuation: rawVehicle.valuation,
          defaultPhotos: rawVehicle.defaultPhotos,
          ratingAvg: rawVehicle.ratingAvg,
          ratingCount: rawVehicle.ratingCount,
          tags: rawVehicle.tags,
          maintenanceHistory: rawVehicle.maintenanceHistory,
          createdAt: rawVehicle.createdAt,
          updatedAt: rawVehicle.updatedAt,
          imageUrl: rawVehicle.defaultPhotos.exterior[0] || undefined,
        };

        return detailVehicle;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An error occurred while fetching vehicle detail";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    updateVehicleStatus,
    updateVehicleMaintenance,
    getVehicleDetail,
  };
};
