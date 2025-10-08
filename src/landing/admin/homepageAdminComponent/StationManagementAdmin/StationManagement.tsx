import React, { useState, useEffect, useCallback } from "react";
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
import { getStations, deleteStation } from "./stationApi";
import type { Station, StationFilters as Filters, Pagination } from "./types";

const StationManagement: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
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

      const response = await getStations(filters.page, filters.limit, {
        search: filters.search,
        status: filters.status,
      });

      // Handle both response formats
      const stationsData = response.data?.items || [];
      const total = response.data?.total || stationsData.length;
      const totalPages = response.data?.totalPages || Math.ceil(total / filters.limit);

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
  };

  const handleEdit = (station: Station) => {
    setSelectedStation(station);
    setIsEditModalOpen(true);
  };

  const handleStationUpdated = () => {
    // Reload stations list
    fetchStations();
  };

  const handleDelete = async (station: Station) => {
    if (!window.confirm(`Are you sure you want to delete station "${station.name}"?`)) {
      return;
    }

    try {
      await deleteStation(station.id);
      // Reload stations list
      fetchStations();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete station");
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
            title="Quản lý trạm"
            subtitle={`Tổng cộng ${pagination.total} trạm`}
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
                    <span>Hiển thị bảng</span>
                  </>
                ) : (
                  <>
                    <MdMap className="w-5 h-5" />
                    <span>Hiển thị bản đồ</span>
                  </>
                )}
              </button>
              {!isMapVisible && (
                <button
                  onClick={handleAddStation}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <MdAdd className="w-5 h-5" />
                  <span>Thêm trạm</span>
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
      </div>
    </PageTransition>
  );
};

export default StationManagement;

