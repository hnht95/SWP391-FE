import React, { useState, useEffect, useRef } from "react";
import { MdLocationOn, MdExpandMore, MdCheck } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import {
  getAllStations,
  type Station,
} from "../../../../service/apiAdmin/apiStation/API";

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
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Fetch stations from API
  const fetchStations = async () => {
    try {
      setLoading(true);
      setApiError(null);

      const response = await getAllStations();

      // ✅ Filter only active stations
      const activeStations = response.filter((station) => station.isActive);
      setStations(activeStations);
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

  // ✅ Use _id instead of id
  const selectedStation = stations.find((station) => station._id === value);
  const displayValue = selectedStation
    ? `${selectedStation.name}${
        selectedStation.code ? ` (${selectedStation.code})` : ""
      }`
    : "Select Station";

  const handleSelect = (stationId: string) => {
    onChange(stationId);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      // Refresh stations when opening dropdown
      if (!isOpen) {
        fetchStations();
      }
    }
  };

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!isOpen) return;
      const t = e.target as Node;
      if (listRef.current && triggerRef.current && !listRef.current.contains(t) && !triggerRef.current.contains(t)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full pl-10 pr-10 py-2 text-sm border ${
          error
            ? "border-red-300 bg-red-50/30"
            : "border-gray-200 bg-gray-50/50"
        } rounded-xl shadow-sm hover:shadow-md focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all duration-300 text-left ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
      >
        <MdLocationOn className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <span className={selectedStation ? "text-gray-800" : "text-gray-500"}>
          {loading ? "Loading stations..." : displayValue}
        </span>
        <MdExpandMore
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 6, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-auto"
          >
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
                No active stations available
              </div>
            ) : (
              stations.map((station) => (
                <button
                  key={station._id}
                  type="button"
                  onClick={() => handleSelect(station._id)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors ${
                    station._id === value
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-50 text-gray-800"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">
                      {station.name}
                    </div>
                    <div className="text-xs opacity-80 truncate">
                      {station.code && `${station.code} • `}
                      {station.location?.address || "No address"}
                    </div>
                  </div>
                  {station._id === value && (
                    <MdCheck className="w-4 h-4 flex-shrink-0 ml-2" />
                  )}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StationDropdown;
