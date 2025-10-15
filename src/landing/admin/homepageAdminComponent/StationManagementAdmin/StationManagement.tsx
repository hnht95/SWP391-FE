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
} from "../../../../service/apiAdmin/apiStation/API";
import type { Station as APIStation } from "../../../../service/apiAdmin/apiStation/API";

const StationManagement: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
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
  const fetchStations = useCallback(async () => {
    try {
      setLoading(true);
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

      const total = stationsData.length;
      const totalPages = Math.ceil(total / filters.limit);

      setStations(stationsData);
      setPagination({
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
      });

      // Apply client-side filtering
      applyFilters(stationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching stations:", err);
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.limit]); // Only depend on pagination params

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
    fetchStations();
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
  };

  const handleAddStation = () => {
    setIsAddModalOpen(true);
  };

  const handleStationCreated = () => {
    fetchStations();
    setSuccessMessage("Station added successfully!");
    setShowSuccessModal(true);
  };

  const handleEdit = (station: Station) => {
    setSelectedStation(station);
    setIsEditModalOpen(true);
  };

  const handleStationUpdated = () => {
    fetchStations();
    setSuccessMessage("Station updated successfully!");
    setShowSuccessModal(true);
  };

  const handleDelete = (station: Station) => {
    setStationPendingDelete(station);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!stationPendingDelete) return;
    try {
      await deleteStation(stationPendingDelete.id);
      fetchStations();
      setSuccessMessage("Station deleted successfully!");
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete station");
      console.error("Delete error:", err);
    } finally {
      setConfirmDeleteOpen(false);
      setStationPendingDelete(null);
    }
  };

  // Calculate stats for MeasurementIndex (from all stations, not filtered)
  const totalStations = stations.length;
  const activeStations = stations.filter((s) => s.isActive).length;
  const inactiveStations = stations.filter((s) => !s.isActive).length;

  // Pagination controls
  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
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
              <StationTable
                stations={filteredStations}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
              />

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

        {/* Confirm Delete Modal */}
        <AnimatePresence>
          {confirmDeleteOpen &&
            createPortal(
              <>
                <motion.div
                  className="fixed inset-0 bg-black/40 z-[9998]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setConfirmDeleteOpen(false)}
                />
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
                  <motion.div
                    className="pointer-events-auto bg-white rounded-2xl shadow-2xl w-full max-w-md"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
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
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setConfirmDeleteOpen(false)}
                          className="px-4 py-2 border border-gray-200 text-gray-600 bg-white rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmDelete}
                          className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </>,
              document.body
            )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default StationManagement;
