import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdEvStation, MdArrowForward } from "react-icons/md";
import StationCard from "./StationCard";
import type { Station as StationType } from "../../../../service/apiAdmin/apiStation/API";

interface StationSummary {
  station: StationType;
  totalVehicles: number;
  activeCount: number;
  maintenanceCount: number;
  pendingMaintenanceCount: number;
  pendingDeletionCount: number;
}

interface StationSectionProps {
  stationSummaries: StationSummary[];
  filteredStationSummaries: StationSummary[];
  highlightedStation: StationSummary | null;
  activeStationIndex: number;
  setActiveStationIndex: (index: number | ((prev: number) => number)) => void;
  stationFilter: "all" | "active" | "inactive";
  setStationFilter: (filter: "all" | "active" | "inactive") => void;
  totalStationsCount: number;
  activeStationsCount: number;
  inactiveStationsCount: number;
  onViewDetails: () => void;
}

const StationSection: React.FC<StationSectionProps> = ({
  filteredStationSummaries,
  highlightedStation,
  activeStationIndex,
  setActiveStationIndex,
  stationFilter,
  setStationFilter,
  totalStationsCount,
  activeStationsCount,
  inactiveStationsCount,
  onViewDetails,
}) => {
  return (
    <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MdEvStation className="w-5 h-5 text-blue-600" />
          Station
        </h3>
        <button
          onClick={onViewDetails}
          className="text-xs inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline"
        >
          View Details
          <MdArrowForward className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            key: "all" as const,
            label: "All",
            value: totalStationsCount,
            subLabel: `${activeStationsCount} active`,
            bg: "bg-indigo-50",
            text: "text-indigo-600",
          },
          {
            key: "active" as const,
            label: "Active",
            value: activeStationsCount,
            subLabel: `${Math.round(
              (activeStationsCount / Math.max(totalStationsCount, 1)) * 100
            )}%`,
            bg: "bg-emerald-50",
            text: "text-emerald-600",
          },
          {
            key: "inactive" as const,
            label: "Maintenance",
            value: inactiveStationsCount,
            subLabel: `${Math.round(
              (inactiveStationsCount / Math.max(totalStationsCount, 1)) * 100
            )}%`,
            bg: "bg-rose-50",
            text: "text-rose-600",
          },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setStationFilter(item.key)}
            className={`p-4 rounded-2xl border text-left transition ${
              stationFilter === item.key
                ? "border-blue-200 shadow-lg shadow-blue-100/50"
                : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
            } ${item.bg}`}
          >
            <p className={`text-xs font-semibold ${item.text}`}>{item.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
            <p className="text-xs text-gray-500 mt-2">{item.subLabel}</p>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
            <AnimatePresence mode="wait">
              {highlightedStation ? (
                <motion.div
                  key={highlightedStation.station._id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.35 }}
                  className="p-5"
                >
                  <StationCard
                    station={highlightedStation.station}
                    totalVehicles={highlightedStation.totalVehicles}
                    activeCount={highlightedStation.activeCount}
                    maintenanceCount={highlightedStation.maintenanceCount}
                    pendingMaintenanceCount={highlightedStation.pendingMaintenanceCount}
                    pendingDeletionCount={highlightedStation.pendingDeletionCount}
                    isHighlighted
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 text-center text-sm text-gray-500"
                >
                  No stations match the filter.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {filteredStationSummaries.length > 1 && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MdEvStation className="w-5 h-5 text-indigo-300" />
            </div>
          )}
        </div>
        {filteredStationSummaries.length > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setActiveStationIndex((prev) =>
                    prev === 0 ? filteredStationSummaries.length - 1 : prev - 1
                  )
                }
                className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveStationIndex((prev) => (prev + 1) % filteredStationSummaries.length)
                }
                className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
              >
                Next
              </button>
            </div>
            <div className="flex gap-1">
              {filteredStationSummaries.map((summary, index) => (
                <button
                  key={summary.station._id}
                  type="button"
                  onClick={() => setActiveStationIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === activeStationIndex
                      ? "w-6 bg-blue-500"
                      : "w-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StationSection;

