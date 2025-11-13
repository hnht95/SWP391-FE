import { useState, useEffect, useCallback } from "react";
import {
  getAllStations,
  getActiveStations,
  type Station,
} from "../service/apiAdmin/apiStation/API";

interface GetStationsParams {
  page?: number;
  limit?: number;
  activeOnly?: boolean;
}

interface UseStationsReturn {
  stations: Station[];
  loading: boolean;
  error: string | null;
  fetchStations: (params?: GetStationsParams) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage stations data
 * @param initialParams - Initial parameters for fetching stations
 * @returns Stations data, loading state, error, and fetch functions
 */
export const useStations = (
  initialParams: GetStationsParams = {}
): UseStationsReturn => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentParams, setCurrentParams] =
    useState<GetStationsParams>(initialParams);

  const fetchStations = useCallback(async (params: GetStationsParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { page = 1, limit = 20, activeOnly = false } = params;

      let stationList: Station[];

      if (activeOnly) {
        stationList = await getActiveStations();
      } else {
        stationList = await getAllStations(page, limit);
      }

      if (!Array.isArray(stationList)) {
        throw new Error("Invalid response format");
      }

      setStations(stationList);
      setCurrentParams(params);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while fetching stations";
      setError(errorMessage);
      console.error("Error fetching stations:", err);
      setStations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchStations(currentParams);
  }, [fetchStations, currentParams]);

  useEffect(() => {
    fetchStations(initialParams);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    stations,
    loading,
    error,
    fetchStations,
    refetch,
  };
};
