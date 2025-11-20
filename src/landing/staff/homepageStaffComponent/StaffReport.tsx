import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { staffAPI } from "../../../service/apiStaff/API";
import type { StationRequestItem } from "../../../service/apiStaff/API";
import { useAuth } from "../../../hooks/useAuth";
import {
  ReportStatsCards,
  ReportFilters,
  ReportTable,
  ReportGrid,
  ReportDetailModal,
  type Ticket,
} from "../reportComponent";

const StaffReport = () => {
  const [activeSection, setActiveSection] = useState<
    "maintenance" | "deletion"
  >("maintenance");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "all" | "approved" | "pending" | "rejected" | "mine"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { user } = useAuth();
  const myUserId = user?._id;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [rawRequests, setRawRequests] = useState<StationRequestItem[]>([]);
  const [selectedRawRequest, setSelectedRawRequest] =
    useState<StationRequestItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    mine: 0,
  });

  const mapRequestToTicket = useCallback(
    (item: StationRequestItem): Ticket => {
      const map: Record<string, "new" | "in_progress" | "resolved" | "closed"> =
        {
          approved: "resolved",
          rejected: "closed",
          pending: "new",
        };
      const mappedStatus = map[item.status] || "in_progress";

      // Handle reportedBy which can be string or object
      const reportedBy =
        typeof item.reportedBy === "string"
          ? { _id: item.reportedBy, name: "Unknown", email: "" }
          : item.reportedBy;

      return {
        id: item._id,
        title:
          activeSection === "maintenance"
            ? "Maintenance Request"
            : "Deletion Request",
        description: item.reportText || "",
        type: activeSection === "maintenance" ? "vehicle_breakdown" : "other",
        status: mappedStatus,
        priority: "medium",
        customer: {
          id: reportedBy?._id || "",
          name: reportedBy?.name || "Unknown",
          phone: "",
          email: reportedBy?.email || "",
        },
        vehicle: item.vehicle
          ? {
              id: item.vehicle._id,
              model: `${item.vehicle.brand || ""} ${
                item.vehicle.model || ""
              }`.trim(),
              licensePlate: item.vehicle.plateNumber,
            }
          : undefined,
        assignedTo: undefined,
        createdAt: new Date(item.createdAt).toLocaleString("vi-VN"),
        updatedAt: new Date(item.updatedAt).toLocaleString("vi-VN"),
        slaDeadline: "",
        isOverdue: false,
        messages: [],
      };
    },
    [activeSection]
  );

  const fetchCounts = useCallback(async () => {
    try {
      const api =
        activeSection === "maintenance"
          ? staffAPI.getMaintenanceRequests
          : staffAPI.getDeletionRequests;

      const [allRes, approvedRes, pendingRes, rejectedRes] = await Promise.all([
        api({ page: 1, limit: 1 }),
        api({ status: "approved", page: 1, limit: 1 }),
        api({ status: "pending", page: 1, limit: 1 }),
        api({ status: "rejected", page: 1, limit: 1 }),
      ]);

      // Calculate mine count by fetching all and filtering
      let mineCount = 0;
      if (myUserId) {
        try {
          const allForMineRes = await api({ page: 1, limit: 9999 });
          const allItems = allForMineRes.items || [];
          mineCount = allItems.filter((item) => {
            const reportedById =
              typeof item.reportedBy === "string"
                ? item.reportedBy
                : item.reportedBy?._id;
            return reportedById === myUserId;
          }).length;
        } catch {
          // Silent fail for mine count
        }
      }

      setStatusCounts({
        all: allRes.pagination?.total || 0,
        approved: approvedRes.pagination?.total || 0,
        pending: pendingRes.pagination?.total || 0,
        rejected: rejectedRes.pagination?.total || 0,
        mine: mineCount,
      });
    } catch {
      // Silent fail for counts
    }
  }, [activeSection, myUserId]);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const api =
        activeSection === "maintenance"
          ? staffAPI.getMaintenanceRequests
          : staffAPI.getDeletionRequests;

      const res = await api({
        status:
          statusFilter === "all" || statusFilter === "mine"
            ? undefined
            : statusFilter,
        q: searchQuery || undefined,
        page,
        limit: statusFilter === "mine" ? 9999 : limit, // Get all for mine filter
        sort: "-createdAt",
      });
      const items = res.items || [];
      setRawRequests(items);
      const mapped: Ticket[] = items.map(mapRequestToTicket);
      setTickets(mapped);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [
    activeSection,
    statusFilter,
    searchQuery,
    page,
    limit,
    mapRequestToTicket,
  ]);

  useEffect(() => {
    fetchTickets();
    fetchCounts();
  }, [fetchTickets, fetchCounts]);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.vehicle?.model &&
        ticket.vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()));

    // If "mine" filter is active, filter by current user
    if (statusFilter === "mine") {
      const rawRequest = rawRequests.find((r) => r._id === ticket.id);
      const reportedById =
        typeof rawRequest?.reportedBy === "string"
          ? rawRequest.reportedBy
          : rawRequest?.reportedBy?._id;
      const isMine = reportedById === myUserId;
      return matchesSearch && isMine;
    }

    const toCategory = (t: Ticket): "approved" | "pending" | "rejected" =>
      t.status === "resolved"
        ? "approved"
        : t.status === "closed"
        ? "rejected"
        : "pending";

    const matchesStatusCategory =
      statusFilter === "all" || toCategory(ticket) === statusFilter;
    return matchesSearch && matchesStatusCategory;
  });

  const handleViewDetail = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    const found = rawRequests.find((r) => r._id === ticket.id);
    setSelectedRawRequest(found || null);
    setIsTicketModalOpen(true);
  };

  const handleActionComplete = () => {
    setIsTicketModalOpen(false);
    fetchTickets();
    fetchCounts();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Reports Management</h1>
        <p className="text-gray-600 mt-2">
          Manage maintenance and deletion requests
        </p>
      </motion.div>

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        {/* Section Tabs (Maintenance/Deletion) */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => {
                setActiveSection("maintenance");
                setStatusFilter("all");
                setSearchQuery("");
                setPage(1);
              }}
              className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
                activeSection === "maintenance"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Maintenance Requests
            </button>
            <button
              onClick={() => {
                setActiveSection("deletion");
                setStatusFilter("all");
                setSearchQuery("");
                setPage(1);
              }}
              className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
                activeSection === "deletion"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Deletion Requests
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <ReportStatsCards
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          statusCounts={statusCounts}
        />

        {/* Filters */}
        <ReportFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Content Area */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 font-semibold mb-2">Error</p>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-600 font-semibold mb-2">
                  No requests found
                </p>
                <p className="text-gray-500 text-sm">
                  Try adjusting your filters or search query
                </p>
              </div>
            </div>
          ) : viewMode === "list" ? (
            <ReportTable
              items={filteredTickets}
              rawRequests={rawRequests}
              onViewDetail={handleViewDetail}
              activeSection={activeSection}
            />
          ) : (
            <ReportGrid
              items={filteredTickets}
              rawRequests={rawRequests}
              onViewDetail={handleViewDetail}
              activeSection={activeSection}
            />
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && filteredTickets.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredTickets.length} of {statusCounts.all} requests
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                Page {page}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={filteredTickets.length < limit}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <ReportDetailModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        selectedTicket={selectedTicket}
        selectedRawRequest={selectedRawRequest}
        activeSection={activeSection}
        myUserId={myUserId}
        onActionComplete={handleActionComplete}
      />
    </div>
  );
};

export default StaffReport;
