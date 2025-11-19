import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MdEvStation, MdClose, MdArrowForward } from "react-icons/md";

interface StationSummary {
  station: {
    _id: string;
    name: string;
    isActive: boolean;
    location?: {
      address?: string;
    };
  };
  totalVehicles: number;
  activeCount: number;
  maintenanceCount: number;
  pendingMaintenanceCount: number;
  pendingDeletionCount: number;
}

interface StationModalProps {
  showStationModal: boolean;
  setShowStationModal: (show: boolean) => void;
  stationSummaries: StationSummary[];
  activeStationsCount: number;
  inactiveStationsCount: number;
}

const StationModal: React.FC<StationModalProps> = ({
  showStationModal,
  setShowStationModal,
  stationSummaries,
  activeStationsCount,
  inactiveStationsCount,
}) => {
  return createPortal(
    <AnimatePresence>
      {showStationModal && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => setShowStationModal(false)}
          />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 300,
                mass: 0.8
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] min-h-[600px] overflow-hidden flex flex-col pointer-events-auto"
            >
              {/* Modal Header - Dark Gradient */}
              <div className="sticky top-0 z-20 flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-black via-gray-900 to-gray-800/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/80">
                <div className="flex items-center space-x-2.5">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-md">
                    <MdEvStation className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">All Stations</h2>
                    <p className="text-xs text-gray-200">View all stations list and detailed information</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStationModal(false)}
                  className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full p-1.5 transition-all duration-200 ease-in-out"
                >
                  <MdClose className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-5 min-h-0 flex flex-col scroll-smooth">
                {stationSummaries.length === 0 ? (
                  <div className="flex items-center justify-center flex-1">
                    <div className="text-sm text-gray-500">No station data found</div>
                  </div>
                ) : (
                  <div className="min-w-[780px]">
                    <div className="grid grid-cols-[2.2fr_repeat(5,1fr)] gap-4 px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 bg-gray-50 rounded-t-lg">
                      <span>Station</span>
                      <span className="text-right">Total Vehicles</span>
                      <span className="text-right">Active</span>
                      <span className="text-right">Maintenance</span>
                      <span className="text-right">Maint. Req</span>
                      <span className="text-right">Del. Req</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {stationSummaries.map((summary, index) => (
                        <motion.div
                          key={summary.station._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.3,
                            delay: index * 0.03,
                            ease: "easeOut"
                          }}
                          className="grid grid-cols-[2.2fr_repeat(5,1fr)] gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-all duration-200 text-sm"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-gray-900 truncate pr-6">
                                {summary.station.name}
                              </p>
                              <span
                                className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                  summary.station.isActive
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-rose-50 text-rose-600"
                                }`}
                              >
                                {summary.station.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 leading-tight line-clamp-1">
                              {summary.station.location?.address || "Not updated"}
                            </p>
                          </div>
                          <div className="text-right tabular-nums font-semibold text-gray-900">
                            {summary.totalVehicles}
                          </div>
                          <div className="text-right tabular-nums font-semibold text-emerald-600">
                            {summary.activeCount}
                          </div>
                          <div className="text-right tabular-nums font-semibold text-rose-500">
                            {summary.maintenanceCount}
                          </div>
                          <div className="text-right tabular-nums font-semibold text-blue-600">
                            {summary.pendingMaintenanceCount}
                          </div>
                          <div className="text-right tabular-nums font-semibold text-purple-600">
                            {summary.pendingDeletionCount}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 bg-gray-50">
                <div className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                  Total {stationSummaries.length} stations · {activeStationsCount} active · {inactiveStationsCount} inactive
                </div>
                <button
                  onClick={() => {
                    window.location.href = "/admin/stations";
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 ease-in-out"
                >
                  Manage Stations
                  <MdArrowForward className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default StationModal;

