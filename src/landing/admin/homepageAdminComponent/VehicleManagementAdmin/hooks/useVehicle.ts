import { useState, useEffect } from "react";
import { getVehicleById } from "../../../../../service/apiAdmin/apiVehicles/API";
import type { Vehicle } from "../../../../../service/apiAdmin/apiVehicles/API";

export const useVehicle = (id: string | null) => {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicle = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await getVehicleById(id);
      setVehicle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch vehicle");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  return {
    vehicle,
    isLoading,
    error,
    refetch: fetchVehicle,
  };
};
