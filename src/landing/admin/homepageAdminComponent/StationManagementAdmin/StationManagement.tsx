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
// import { deleteStation } from "./stationApi"; // Removed - using real API now
import type { Station, StationFilters as Filters, Pagination } from "./types";
import { stationManagementAPI } from "../../../../service/apiAdmin/StationManagementAPI";
import { deleteStationAPI } from "../../../../service/apiAdmin/DeleteStationAPI";
import SuccessModal from "../StaffManagementAdmin/SuccessModal";

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
  const [stationPendingDelete, setStationPendingDelete] = useState<Station | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { setSidebarCollapsed } = useSidebar();

  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'all',
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

      // Fetch real data from admin API (supports server-side pagination if available)
      const apiItems = await stationManagementAPI.list(filters.page, filters.limit);

      // Map API items to UI Station type
      const stationsData: Station[] = apiItems.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        location: s.location
          ? { address: s.location.address, latitude: s.location.lat, longitude: s.location.lng }
          : { address: "", latitude: 0, longitude: 0 },
        note: s.note ?? undefined,
        isActive: s.isActive,
        createdAt: s.createdAt || "",
        updatedAt: s.updatedAt,
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

      // Apply client-side filtering if needed
      applyFilters(stationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
      console.error("Error fetching stations:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Apply client-side filters
  const applyFilters = (stationsData: Station[]) => {
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
    if (filters.status !== 'all') {
      filtered = filtered.filter((s) =>
        filters.status === 'active' ? s.isActive : !s.isActive
      );
    }

    setFilteredStations(filtered);
  };

  // Load data on mount and when filters change
  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

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
    setFilters(newFilters);
  };

  const handleAddStation = () => {
    setIsAddModalOpen(true);
  };

  const handleStationCreated = () => {
    // Reload stations list
    fetchStations();
    // Show success modal
    setSuccessMessage("Station added successfully!");
    setShowSuccessModal(true);
  };

  const handleEdit = (station: Station) => {
    setSelectedStation(station);
    setIsEditModalOpen(true);
  };

  const handleStationUpdated = () => {
    // Reload stations list
    fetchStations();
    // Show success modal
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
      await deleteStationAPI.remove(stationPendingDelete.id);
      // Reload stations list
      fetchStations();
      // Show success modal
      setSuccessMessage("Station deleted successfully!");
      setShowSuccessModal(true);
    } catch (err) {
      // silent fail -> show error inline later if needed
      console.error(err);
    } finally {
      setConfirmDeleteOpen(false);
      setStationPendingDelete(null);
    }
  };

  // Calculate stats for MeasurementIndex
  const totalStations = pagination.total;
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
            subtitle={`Total of ${pagination.total} stations`}
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

        {/* Measurement Index Dashboard - Hidden when map is visible */}
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

        {/* Table View - Hidden when map is visible */}
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
                    Thử lại
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
              {!loading && filteredStations.length > 0 && pagination.totalPages! > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <span className="text-sm text-gray-600">
                    Trang {filters.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page >= pagination.totalPages!}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Station Modal */}
        <AddStationModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onCreated={handleStationCreated}
        />

        {/* Edit Station Modal */}
        <EditStationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={handleStationUpdated}
          station={selectedStation}
        />

        {/* Success Modal */}
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message={successMessage}
        />

        {/* Confirm Delete Modal (Portal to body so overlay covers whole screen) */}
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
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Station</h3>
                      <p className="text-sm text-gray-600 mb-5">
                        Are you sure you want to delete station {" "}
                        <span className="font-semibold">"{stationPendingDelete?.name}"</span>?
                      </p>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setConfirmDeleteOpen(false)}
                          className="px-4 py-2 border border-gray-200 text-gray-600 bg-white rounded-xl hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmDelete}
                          className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
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

