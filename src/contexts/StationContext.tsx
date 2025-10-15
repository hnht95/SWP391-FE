import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { getAllStations, type Station } from "../service/apiStation/API";

interface StationContextType {
  stations: Station[];
  loading: boolean;
  error: string;
  refetchStations: () => Promise<void>;
}

const StationContext = createContext<StationContextType | undefined>(undefined);

export const StationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchStations = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllStations();
      console.log("Context: Fetched stations:", data);

      // Filter valid stations
      const validStations = data.filter(
        (station) =>
          station.isActive && station.location && station.location.address
      );

      console.log("Context: Valid stations:", validStations);
      setStations(validStations);
    } catch (err: any) {
      console.error("Context: Failed to fetch stations:", err);
      setError(err.message || "Failed to load stations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const refetchStations = async () => {
    await fetchStations();
  };

  return (
    <StationContext.Provider
      value={{ stations, loading, error, refetchStations }}
    >
      {children}
    </StationContext.Provider>
  );
};

// ✅ Custom hook to use station context
export const useStations = (): StationContextType => {
  const context = useContext(StationContext);
  if (!context) {
    throw new Error("useStations must be used within StationProvider");
  }
  return context;
};
