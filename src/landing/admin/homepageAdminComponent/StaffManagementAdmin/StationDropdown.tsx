import React, { useState, useEffect } from "react";
import { MdLocationOn, MdExpandMore, MdCheck } from "react-icons/md";
import { stationManagementAPI } from "../../../../service/apiAdmin/StationManagementAPI";

interface Station {
  id: string;
  name: string;
  code: string;
  location: {
    address: string;
    lat?: number;
    lng?: number;
  };
  note?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StationDropdownProps {
  value: string;
  onChange: (stationId: string) => void;
  error?: string;
  disabled?: boolean;
}

const StationDropdown: React.FC<StationDropdownProps> = ({
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch stations from API
  const fetchStations = async () => {
    try {
      setLoading(true);
      setApiError(null);
      
      const response = await stationManagementAPI.list();
      setStations(response as Station[]);
    } catch (err) {
      console.error("Error fetching stations:", err);
      setApiError("Failed to load stations");
    } finally {
      setLoading(false);
    }
  };

  // Load stations on component mount
  useEffect(() => {
    fetchStations();
  }, []);

  // Get selected station name for display
  const selectedStation = stations.find(station => station.id === value);
  const displayValue = selectedStation ? `${selectedStation.name} (${selectedStation.code})` : "Select Station";

  const handleSelect = (stationId: string) => {
    onChange(stationId);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      // Refresh stations when opening dropdown to get latest data
      if (!isOpen) {
        fetchStations();
      }
    }
  };

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full pl-10 pr-10 py-2 text-sm border ${
          error ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-gray-50/50"
        } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-left ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
      >
        <MdLocationOn className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <span className={selectedStation ? "text-gray-800" : "text-gray-500"}>
          {loading ? "Loading stations..." : displayValue}
        </span>
        <MdExpandMore className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto"></div>
              <span className="text-xs ml-2">Loading stations...</span>
            </div>
          ) : apiError ? (
            <div className="p-3 text-center text-red-500 text-sm">
              {apiError}
              <button
                onClick={fetchStations}
                className="block mx-auto mt-2 text-blue-500 hover:text-blue-700 text-xs"
              >
                Retry
              </button>
            </div>
          ) : stations.length === 0 ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              No stations available
            </div>
          ) : (
            stations.map((station) => (
              <button
                key={station.id}
                type="button"
                onClick={() => handleSelect(station.id)}
                className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between ${
                  station.id === value ? "bg-blue-50" : ""
                }`}
              >
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {station.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {station.code} • {station.location.address}
                  </div>
                </div>
                {station.id === value && (
                  <MdCheck className="w-4 h-4 text-blue-500" />
                )}
              </button>
            ))
          )}
        </div>
      )}

      {/* Error Message */}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default StationDropdown;
