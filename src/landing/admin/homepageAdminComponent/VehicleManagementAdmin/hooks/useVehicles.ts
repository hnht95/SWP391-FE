import { useState, useEffect } from "react";
import { getAllVehicles } from "../../../../../service/apiAdmin/apiVehicles/API";
import type { Vehicle } from "../../../../../service/apiAdmin/apiVehicles/API";

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    console.log("🔄 Fetching vehicles...");
    setIsLoading(true);
    setError(null);
    try {
            const data = await getAllVehicles();
            console.log("✅ Vehicles fetched successfully:", data);
            console.log("🏢 First vehicle station data:", data[0]?.stationData);
            setVehicles(data);
    } catch (err) {
      console.error("❌ Error fetching vehicles:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch vehicles");
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchVehicles();
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return {
    vehicles,
    isLoading,
    error,
    refetch,
  };
};
