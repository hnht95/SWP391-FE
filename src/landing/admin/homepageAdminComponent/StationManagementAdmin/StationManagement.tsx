import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MdLocationOn, MdAdd, MdMap, MdViewList } from "react-icons/md";
import { PageTransition, FadeIn } from "../../component/animations";
import PageTitle from "../../component/PageTitle";
import { useSidebar } from "../../context/SidebarContext";
import StationTable from "./StationTable";
import StationFilters from "./StationFilters";
import MapView from "./MapView";
import AddStationModal from "./AddStationModal";
import EditStationModal from "./EditStationModal";
import MeasurementIndex from "./MeasurementIndex";
import type { Station, StationFilters as Filters, Pagination } from "./types";
import SuccessModal from "../StaffManagementAdmin/SuccessModal";
import {
  deleteStation,
  getAllStations,
  type DeleteStationResponse,
} from "../../../../service/apiAdmin/apiStation/API";
import type { Station as APIStation } from "../../../../service/apiAdmin/apiStation/API";

const StationManagement: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [uiLoading, setUiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [stationPendingDelete, setStationPendingDelete] =
    useState<Station | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { setSidebarCollapsed } = useSidebar();
  const [transferToStationId, setTransferToStationId] = useState<string>("");
  const [deleteInlineError, setDeleteInlineError] = useState<string>("");

  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "all",
    page: 1,
    limit: 20,
  });

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Fetch stations from API
  const fetchStations = useCallback(
    async (useHardLoading: boolean = true) => {
      try {
        if (useHardLoading) {
          setLoading(true);
        } else {
          setUiLoading(true);
        }
        setError(null);

        // ✅ Fetch all stations (API doesn't support pagination params)
        const apiItems: APIStation[] = await getAllStations();

        // ✅ Map API items to UI Station type
        const stationsData: Station[] = apiItems.map((s) => ({
          id: s._id, // ✅ Use _id from API
          name: s.name,
          code: s.code || "",
          location: s.location
            ? {
                address: s.location.address,
                latitude: s.location.lat,
                longitude: s.location.lng,
              }
            : { address: "", latitude: 0, longitude: 0 },
          note: s.note,
          isActive: s.isActive,
          createdAt: s.createdAt || "",
          updatedAt: s.updatedAt || "",
        }));

        // ✅ Loại bỏ bản ghi không hợp lệ (thiếu tên hoặc id)
        const cleanedStations = stationsData.filter(
          (st) => st.id && st.name && st.name.trim().length > 0
        );

        const total = cleanedStations.length;
        const totalPages = Math.ceil(total / filters.limit);

        setStations(cleanedStations);
        setPagination({
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages,
        });

        // Apply client-side filtering
        applyFilters(cleanedStations);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching stations:", err);
      } finally {
        if (useHardLoading) {
          setLoading(false);
        } else {
          setUiLoading(false);
        }
      }
    },
    [filters.page, filters.limit]
  ); // Only depend on pagination params

  // Apply client-side filters
  const applyFilters = useCallback(
    (stationsData: Station[]) => {
      let filtered = [...stationsData];

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(searchLower) ||
            s.code.toLowerCase().includes(searchLower) ||
            s.location?.address?.toLowerCase().includes(searchLower)
        );
      }

      // Status filter
      if (filters.status !== "all") {
        filtered = filtered.filter((s) =>
          filters.status === "active" ? s.isActive : !s.isActive
        );
      }

      // ✅ Apply pagination to filtered results
      const start = (filters.page - 1) * filters.limit;
      const end = start + filters.limit;
      const paginatedFiltered = filtered.slice(start, end);

      // ✅ Update pagination with filtered total
      const filteredTotal = filtered.length;
      const filteredTotalPages = Math.ceil(filteredTotal / filters.limit);

      setPagination({
        page: filters.page,
        limit: filters.limit,
        total: filteredTotal,
        totalPages: filteredTotalPages,
      });

      setFilteredStations(paginatedFiltered);
    },
    [filters]
  );

  // Load data on mount
  useEffect(() => {
    fetchStations(true);
  }, [fetchStations]);

  // Re-apply filters when filter criteria change
  useEffect(() => {
    if (stations.length > 0) {
      applyFilters(stations);
    }
  }, [
    filters.search,
    filters.status,
    filters.page,
    filters.limit,
    applyFilters,
  ]);

  // Auto control sidebar when map is visible
  useEffect(() => {
    if (isMapVisible) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  }, [isMapVisible, setSidebarCollapsed]);

  const handleToggleMap = () => {
    setIsMapVisible(!isMapVisible);
  };

  const handleFiltersChange = (newFilters: Filters) => {
    // Reset to page 1 when filters change (except pagination)
    if (
      newFilters.search !== filters.search ||
      newFilters.status !== filters.status
    ) {
      setFilters({ ...newFilters, page: 1 });
    } else {
      setFilters(newFilters);
    }
    // Hiển thị hiệu ứng loading ngắn khi đổi filter (Active/Inactive/All)
    setUiLoading(true);
    window.setTimeout(() => setUiLoading(false), 300);
  };

  const handleAddStation = () => {
    setShowSuccessModal(false);
    setIsAddModalOpen(true);
  };

  const handleStationCreated = () => {
    fetchStations(false);
    setSuccessMessage("Station added successfully!");
    setShowSuccessModal(true);
  };

  const handleEdit = (station: Station) => {
    setShowSuccessModal(false);
    setSelectedStation(station);
    setIsEditModalOpen(true);
  };

  const handleStationUpdated = () => {
    fetchStations(false);
    setSuccessMessage("Station updated successfully!");
    setShowSuccessModal(true);
  };

  const handleDelete = (station: Station) => {
    console.log("Delete click:", station);
    setShowSuccessModal(false);
    setStationPendingDelete(station);
    setTransferToStationId("");
    setDeleteInlineError("");
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!stationPendingDelete) return;
    try {
      const res: DeleteStationResponse = await deleteStation(
        stationPendingDelete.id,
        transferToStationId || undefined
      );
      await fetchStations(false);
      const movedCount = res?.movedVehiclesCount ?? 0;
      const nameInfo = stationPendingDelete.name
        ? `Station "${stationPendingDelete.name}" deleted successfully`
        : "Station deleted successfully";
      const moveInfo = movedCount > 0 ? ` • Moved vehicles: ${movedCount}` : "";
      setSuccessMessage(`${nameInfo}${moveInfo}`);
      setShowSuccessModal(true);
      setConfirmDeleteOpen(false);
      setStationPendingDelete(null);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete station";
      if (msg.toLowerCase().includes("transferstationid")) {
        setDeleteInlineError(
          "Station còn xe, hãy chọn trạm để chuyển trước khi xóa."
        );
      } else {
        setError(msg);
        setConfirmDeleteOpen(false);
        setStationPendingDelete(null);
      }
      console.error("Delete error:", err);
    }
  };

  // Calculate stats for MeasurementIndex (from all stations, not filtered)
  const totalStations = stations.length;
  const activeStations = stations.filter((s) => s.isActive).length;
  const inactiveStations = stations.filter((s) => !s.isActive).length;

  // Pagination controls
  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
    setUiLoading(true);
    window.setTimeout(() => setUiLoading(false), 300);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <PageTitle
            title="Station Management"
            subtitle={`Total of ${totalStations} stations`}
            icon={<MdLocationOn className="w-7 h-7 text-gray-700" />}
          />
          <FadeIn delay={0.3} duration={0.6}>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleToggleMap}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                {isMapVisible ? (
                  <>
                    <MdViewList className="w-5 h-5" />
                    <span>Show Table</span>
                  </>
                ) : (
                  <>
                    <MdMap className="w-5 h-5" />
                    <span>Show Map</span>
                  </>
                )}
              </button>
              {!isMapVisible && (
                <button
                  onClick={handleAddStation}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <MdAdd className="w-5 h-5" />
                  <span>Add Station</span>
                </button>
              )}
            </div>
          </FadeIn>
        </div>

        {/* Measurement Index Dashboard */}
        <AnimatePresence>
          {!isMapVisible && (
            <MeasurementIndex
              totalStations={totalStations}
              activeStations={activeStations}
              inactiveStations={inactiveStations}
            />
          )}
        </AnimatePresence>

        {/* Map View */}
        <AnimatePresence>
          {isMapVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <MapView stations={stations} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table View */}
        <AnimatePresence>
          {!isMapVisible && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.7 }}
            >
              {/* Filters */}
              <StationFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                totalResults={pagination.total}
              />

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 font-medium">{error}</p>
                  <button
                    onClick={() => fetchStations()}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Table */}
              {loading || uiLoading ? (
                <StationTable stations={[]} loading={true} />
              ) : (
                <StationTable
                  stations={filteredStations}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  loading={false}
                />
              )}

              {/* Pagination */}
              {!loading &&
                pagination.totalPages &&
                pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {filters.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page >= pagination.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        <AddStationModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onCreated={handleStationCreated}
        />

        <EditStationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={handleStationUpdated}
          station={selectedStation}
        />

        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message={successMessage}
        />

        {/* Confirm Delete Modal (portal + animation mượt như Edit) */}
        {confirmDeleteOpen &&
          createPortal(
            <AnimatePresence>
              <>
                <motion.div
                  className="fixed inset-0 bg-black/50 z-[99998]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setConfirmDeleteOpen(false)}
                />
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none">
                  <motion.div
                    className="pointer-events-auto bg-white rounded-2xl shadow-2xl w-full max-w-md"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", damping: 30, stiffness: 230 }}
                  >
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Delete Station
                      </h3>
                      <p className="text-sm text-gray-600 mb-5">
                        Are you sure you want to delete station {""}
                        <span className="font-semibold">
                          "{stationPendingDelete?.name}"
                        </span>
                        ? This action cannot be undone.
                      </p>
                      {deleteInlineError && (
                        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                          {deleteInlineError}
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                        {deleteInlineError && (
                          <select
                            value={transferToStationId}
                            onChange={(e) =>
                              setTransferToStationId(e.target.value)
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                          >
                            <option value="">
                              -- Select destination station --
                            </option>
                            {stations
                              .filter((s) => s.id !== stationPendingDelete?.id)
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} ({s.code})
                                </option>
                              ))}
                          </select>
                        )}
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteOpen(false)}
                          className="px-4 py-2 border border-gray-200 text-gray-600 bg-white rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={confirmDelete}
                          className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </>
            </AnimatePresence>,
            document.body
          )}
      </div>
    </PageTransition>
  );
};

export default StationManagement;
