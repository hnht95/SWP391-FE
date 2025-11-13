// pages/Admin/Stations/StationManagement.tsx
import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MdLocationOn, MdAdd, MdMap, MdViewList } from "react-icons/md";
import { PageTransition, FadeIn } from "../../component/animations";
import PageTitle from "../../component/PageTitle";
import StationTable from "./StationTable";
import StationFilters from "./StationFilters";
import MapView from "./MapView";
import AddStationModal from "./AddStationModal";
import EditStationModal from "./EditStationModal";
import MeasurementIndex from "./MeasurementIndex";
import SuccessModal from "../UserManagerComponent/SuccessModal";
import {
  deleteStation,
  getAllStations,
  type DeleteStationResponse,
  type Station,
} from "../../../../service/apiAdmin/apiStation/API";

interface StationFiltersState {
  search: string;
  status: "all" | "active" | "inactive";
  province?: string;
  page: number;
  limit: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

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
  const [transferToStationId, setTransferToStationId] = useState<string>("");
  const [deleteInlineError, setDeleteInlineError] = useState<string>("");

  const [filters, setFilters] = useState<StationFiltersState>({
    search: "",
    status: "all",
    province: undefined,
    page: 1,
    limit: 20,
  });

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Fetch
  const fetchStations = useCallback(
    async (useHardLoading: boolean = true) => {
      try {
        if (useHardLoading) setLoading(true);
        else setUiLoading(true);
        setError(null);

        const apiItems: Station[] = await getAllStations();

        const cleanedStations = apiItems.filter(
          (st) => st._id && st.name && st.name.trim().length > 0
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

        applyFilters(cleanedStations);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching stations:", err);
      } finally {
        if (useHardLoading) setLoading(false);
        else setUiLoading(false);
      }
    },
    [filters.page, filters.limit]
  );

  // Apply filters (đã thêm province)
  const applyFilters = useCallback(
    (stationsData: Station[]) => {
      let filtered = [...stationsData];

      // Search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(searchLower) ||
            s.code?.toLowerCase().includes(searchLower) ||
            s.location?.address?.toLowerCase().includes(searchLower)
        );
      }

      // Status
      if (filters.status !== "all") {
        filtered = filtered.filter((s) =>
          filters.status === "active" ? s.isActive : !s.isActive
        );
      }

      // ✅ Province filter (field province hoặc fallback từ address)
      if (filters.province && filters.province.trim().length > 0) {
        const selected = filters.province.trim().toLowerCase();

        filtered = filtered.filter((s) => {
          const fromField =
            typeof (s as any).province === "string" &&
            ((s as any).province as string).trim().toLowerCase() === selected;

          const address = s.location?.address || "";
          const tokens = address
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);
          const lastToken = (tokens[tokens.length - 1] || "").toLowerCase();

          const byAddress = lastToken === selected;

          return fromField || byAddress;
        });
      }

      // Pagination
      const start = (filters.page - 1) * filters.limit;
      const end = start + filters.limit;
      const paginatedFiltered = filtered.slice(start, end);

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

  useEffect(() => {
    fetchStations(true);
  }, [fetchStations]);

  useEffect(() => {
    if (stations.length > 0) {
      applyFilters(stations);
    }
  }, [
    filters.search,
    filters.status,
    filters.province,
    filters.page,
    filters.limit,
    stations,
    applyFilters,
  ]);

  const handleToggleMap = () => setIsMapVisible((v) => !v);

  const handleFiltersChange = (newFilters: StationFiltersState) => {
    if (
      newFilters.search !== filters.search ||
      newFilters.status !== filters.status ||
      newFilters.province !== filters.province
    ) {
      setFilters({ ...newFilters, page: 1 });
    } else {
      setFilters(newFilters);
    }
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
        stationPendingDelete._id,
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

  const totalStations = stations.length;
  const activeStations = stations.filter((s) => s.isActive).length;
  const inactiveStations = stations.filter((s) => !s.isActive).length;

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
                  className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <MdAdd className="w-5 h-5" />
                  <span>Add Station</span>
                </button>
              )}
            </div>
          </FadeIn>
        </div>

        {/* Measurement Index */}
        <AnimatePresence>
          {!isMapVisible && (
            <MeasurementIndex
              totalStations={totalStations}
              activeStations={activeStations}
              inactiveStations={inactiveStations}
            />
          )}
        </AnimatePresence>

        {/* Map */}
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

        {/* Table */}
        <AnimatePresence>
          {!isMapVisible && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.7 }}
            >
              <StationFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                totalResults={pagination.total}
              />

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

              {loading || uiLoading ? (
                <StationTable stations={[]} loading />
              ) : (
                <StationTable
                  stations={filteredStations}
                  onEdit={(s) => {
                    setShowSuccessModal(false);
                    setSelectedStation(s);
                    setIsEditModalOpen(true);
                  }}
                  onDelete={handleDelete}
                  loading={false}
                />
              )}

              {!loading && pagination.totalPages > 1 && (
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

        {/* Confirm Delete */}
        {confirmDeleteOpen &&
          createPortal(
            <AnimatePresence>
              <>
                <motion.div
                  className="fixed inset-0 bg-black/50 z-[9999]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setConfirmDeleteOpen(false)}
                />
                <div className="fixed inset-0 z[10000] flex items-center justify-center p-4 pointer-events-none">
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
                        Are you sure you want to delete station{" "}
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
                              .filter(
                                (s) => s._id !== stationPendingDelete?._id
                              )
                              .map((s) => (
                                <option key={s._id} value={s._id}>
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
