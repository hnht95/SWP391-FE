import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdSearch,
  MdAdd,
  MdBusiness,
  MdDirectionsCar,
  MdWarning,
  MdClose,
  MdAssignment,
  MdPerson,
  MdStar,
  MdStarBorder,
  MdNotifications,
  MdSupport,
  MdViewModule,
  MdViewList,
} from "react-icons/md";
import { staffAPI } from "../../../service/apiStaff/API";
import type { StationRequestItem } from "../../../service/apiStaff/API";
import { useAuth } from "../../../hooks/useAuth";

interface Ticket {
  id: string;
  title: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: "low" | "medium" | "high" | "urgent";
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
    company?: string;
  };
  vehicle?: {
    id: string;
    model: string;
    licensePlate: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  isOverdue: boolean;
  messages: TicketMessage[];
  rating?: number;
  feedback?: string;
}

interface TicketMessage {
  id: string;
  sender: {
    id: string;
    name: string;
    type: "customer" | "staff";
  };
  message: string;
  timestamp: string;
  attachments?: string[];
}

type TicketType =
  | "vehicle_breakdown"
  | "unlock_issue"
  | "traffic_violation"
  | "payment_refund"
  | "service_complaint"
  | "contract_support"
  | "other";

type TicketStatus = "new" | "in_progress" | "resolved" | "closed";

const StaffReport = () => {
  const [activeSection, setActiveSection] = useState<
    "maintenance" | "deletion"
  >("maintenance");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "all" | "approved" | "pending" | "rejected"
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
  });

  const mapRequestToTicket = useCallback(
    (item: StationRequestItem): Ticket => {
      const map: Record<string, TicketStatus> = {
        approved: "resolved",
        rejected: "closed",
        pending: "new",
      };
      const mappedStatus: TicketStatus = map[item.status] || "in_progress";
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
          id: item.reportedBy?._id || "",
          name: item.reportedBy?.name || "Unknown",
          phone: "",
          email: item.reportedBy?.email || "",
        },
        vehicle: item.vehicle
          ? {
              id: item.vehicle._id,
              model: `${item.vehicle.brand} ${item.vehicle.model}`.trim(),
              licensePlate: item.vehicle.plateNumber,
            }
          : undefined,
        assignedTo: undefined,
        createdAt: new Date(item.createdAt).toLocaleString(),
        updatedAt: new Date(item.updatedAt).toLocaleString(),
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
      setStatusCounts({
        all: allRes.pagination?.total || 0,
        approved: approvedRes.pagination?.total || 0,
        pending: pendingRes.pagination?.total || 0,
        rejected: rejectedRes.pagination?.total || 0,
      });
    } catch {
      // Silent fail for counts
    }
  }, [activeSection]);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const api =
        activeSection === "maintenance"
          ? staffAPI.getMaintenanceRequests
          : staffAPI.getDeletionRequests;
      const res = await api({
        status: statusFilter === "all" ? undefined : statusFilter,
        q: searchQuery || undefined,
        page,
        limit,
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

  const ticketTypes = [
    {
      value: "vehicle_breakdown",
      label: "Vehicle Breakdown",
      icon: MdDirectionsCar,
      color: "red",
    },
    {
      value: "unlock_issue",
      label: "Unlock/Lock Issue",
      icon: MdWarning,
      color: "orange",
    },
    {
      value: "traffic_violation",
      label: "Traffic Violation",
      icon: MdNotifications,
      color: "yellow",
    },
    {
      value: "payment_refund",
      label: "Payment & Refund",
      icon: MdAssignment,
      color: "green",
    },
    {
      value: "service_complaint",
      label: "Service Complaint",
      icon: MdSupport,
      color: "purple",
    },
    {
      value: "contract_support",
      label: "Contract Support",
      icon: MdBusiness,
      color: "blue",
    },
  ];

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: TicketStatus) => {
    switch (status) {
      case "new":
        return "New";
      case "in_progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      case "closed":
        return "Closed";
      default:
        return status;
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const toCategory = (t: Ticket): "approved" | "pending" | "rejected" =>
      t.status === "resolved"
        ? "approved"
        : t.status === "closed"
        ? "rejected"
        : "pending";
    const matchesStatusCategory =
      statusFilter === "all" || toCategory(ticket) === statusFilter;
    const matchesType = true;
    return matchesSearch && matchesStatusCategory && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Station Requests
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              View and manage vehicle deletion and maintenance requests from
              your station
            </p>
          </div>
          <motion.button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MdAdd className="w-4 h-4" />
            <span>New Request</span>
          </motion.button>
        </div>

        <motion.div
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
        >
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-4 px-4 py-3 border-b">
              {(
                [
                  { id: "maintenance", label: "Maintenance Requests" },
                  { id: "deletion", label: "Deletion Requests" },
                ] as Array<{ id: "maintenance" | "deletion"; label: string }>
              ).map((tab, idx) => (
                <motion.button
                  key={tab.id}
                  onClick={() => {
                    setActiveSection(tab.id);
                    setPage(1);
                  }}
                  className={`px-4 py-2 text-sm font-medium transition-all relative ${
                    activeSection === tab.id
                      ? "text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + idx * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {tab.label}
                  {activeSection === tab.id && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
                      layoutId="activeSectionTab"
                    />
                  )}
                </motion.button>
              ))}
            </div>
            {(() => {
              const counts = statusCounts;
              return (
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="flex flex-wrap items-center gap-2 px-4 py-4 border-b">
                    {(
                      [
                        { value: "all", label: "All", count: counts.all },
                        {
                          value: "approved",
                          label: "Approved",
                          count: counts.approved,
                        },
                        {
                          value: "pending",
                          label: "Pending",
                          count: counts.pending,
                        },
                        {
                          value: "rejected",
                          label: "Rejected",
                          count: counts.rejected,
                        },
                      ] as Array<{
                        value: "all" | "approved" | "pending" | "rejected";
                        label: string;
                        count: number;
                      }>
                    ).map((tab, idx) => (
                      <motion.button
                        key={tab.value}
                        onClick={() => setStatusFilter(tab.value)}
                        className={`px-4 py-2 text-sm font-medium transition-all relative ${
                          statusFilter === tab.value
                            ? "text-gray-900"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {tab.label} <span className="ml-1">{tab.count}</span>
                        {statusFilter === tab.value && (
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
                            layoutId="activeTab"
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>

                  <div className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1 md:w-80">
                          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search reports..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <motion.button
                          onClick={() => setViewMode("grid")}
                          className={`p-1.5 rounded ${
                            viewMode === "grid"
                              ? "bg-white text-gray-900 shadow"
                              : "text-gray-500"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <MdViewModule className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => setViewMode("list")}
                          className={`p-1.5 rounded ${
                            viewMode === "list"
                              ? "bg-white text-gray-900 shadow"
                              : "text-gray-500"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <MdViewList className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-sm p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {(() => {
            const toCategory = (
              t: Ticket
            ): "approved" | "pending" | "rejected" =>
              t.status === "resolved"
                ? "approved"
                : t.status === "closed"
                ? "rejected"
                : "pending";
            const items = filteredTickets.filter((t) =>
              statusFilter === "all" ? true : toCategory(t) === statusFilter
            );

            if (loading)
              return (
                <div className="text-center py-12 text-gray-600">
                  Loading requests...
                </div>
              );
            if (error)
              return (
                <div className="text-center py-12 text-red-600">{error}</div>
              );
            if (items.length === 0)
              return (
                <div className="text-center py-12 text-gray-600">
                  No requests found
                </div>
              );

            const StatusPill = ({
              cat,
            }: {
              cat: "approved" | "pending" | "rejected";
            }) => {
              const map = {
                approved: {
                  color: "bg-green-100 text-green-800",
                  label: "Approved",
                },
                pending: {
                  color: "bg-yellow-100 text-yellow-800",
                  label: "Pending Review",
                },
                rejected: {
                  color: "bg-red-100 text-red-800",
                  label: "Rejected",
                },
              } as const;
              return (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${map[cat].color}`}
                >
                  {map[cat].label}
                </span>
              );
            };

            if (viewMode === "list") {
              return (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        {[
                          "Report ID",
                          "Type",
                          "Vehicle",
                          "Requested By",
                          "Request Date",
                          "Review Date",
                          "Status",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {items.map((t) => {
                        const cat = toCategory(t);
                        const typeLabel =
                          ticketTypes.find((x) => x.value === t.type)?.label ||
                          "Request";
                        return (
                          <tr key={t.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              RPT-{t.id}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {typeLabel}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {t.vehicle
                                ? `${t.vehicle.model} - ${t.vehicle.licensePlate}`
                                : "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {t.customer.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {t.createdAt}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {t.updatedAt}
                            </td>
                            <td className="px-4 py-3">
                              <StatusPill cat={cat} />
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => {
                                  setSelectedTicket(t);
                                  const found = rawRequests.find(
                                    (r) => r._id === t.id
                                  );
                                  setSelectedRawRequest(found || null);
                                  setIsTicketModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                View details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((t, idx) => {
                  const cat = toCategory(t);
                  const typeLabel =
                    activeSection === "maintenance"
                      ? "Maintenance Request"
                      : "Deletion Request";
                  const raw = rawRequests.find((r) => r._id === t.id);
                  const previewUrl = raw?.evidencePhotos?.[0]?.url;
                  return (
                    <motion.div
                      key={t.id}
                      className="border border-gray-200 rounded-lg hover:shadow-lg transition-shadow bg-white overflow-hidden"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.03 * idx }}
                    >
                      <div className="relative h-40 w-full bg-gray-100">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="evidence"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
                            <MdDirectionsCar className="w-10 h-10 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <StatusPill cat={cat} />
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Report ID
                            </p>
                            <h3 className="font-semibold text-gray-900">
                              RPT-{t.id}
                            </h3>
                          </div>
                        </div>

                        <div className="mb-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {typeLabel}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div className="col-span-2 flex items-center text-gray-700">
                            <MdDirectionsCar className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-xs text-gray-500 mr-1">
                              Vehicle:
                            </span>
                            <span className="font-medium text-gray-900">
                              {t.vehicle ? `${t.vehicle.model}` : "N/A"}
                            </span>
                          </div>
                          <div className="col-span-2 flex items-center text-gray-700">
                            <MdPerson className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-xs text-gray-500 mr-1">
                              Requested by:
                            </span>
                            <span className="font-medium text-gray-900">
                              {t.customer.name}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">
                              Request Date
                            </span>
                            <div className="mt-1 px-3 py-2 border rounded bg-gray-50 text-gray-900 text-xs">
                              {t.createdAt}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">
                              Review Date
                            </span>
                            <div className="mt-1 px-3 py-2 border rounded bg-gray-50 text-gray-900 text-xs">
                              {t.updatedAt}
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <span className="text-xs text-gray-500 block mb-1">
                            Reason
                          </span>
                          <div className="px-3 py-2 border rounded bg-gray-50 text-sm text-gray-700 line-clamp-3">
                            {t.description}
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={() => {
                              setSelectedTicket(t);
                              const found = rawRequests.find(
                                (r) => r._id === t.id
                              );
                              setSelectedRawRequest(found || null);
                              setIsTicketModalOpen(true);
                            }}
                            className="w-full py-2 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors font-medium"
                          >
                            View details
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })()}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isTicketModalOpen && selectedTicket && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {activeSection === "maintenance"
                      ? "Maintenance Request"
                      : "Deletion Request"}{" "}
                    #{selectedTicket.id}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Submitted by {selectedTicket.customer.name}
                  </p>
                </div>
                <button
                  onClick={() => setIsTicketModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Request Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Requested By</span>
                          <div className="font-medium">
                            {selectedTicket.customer.name}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Status</span>
                          <div
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(
                              selectedTicket.status
                            )}`}
                          >
                            {getStatusLabel(selectedTicket.status)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Submitted At</span>
                          <div className="font-medium">
                            {selectedTicket.createdAt}
                          </div>
                        </div>
                        {activeSection === "maintenance" && (
                          <div>
                            <span className="text-gray-500">Urgency</span>
                            <div className="font-medium capitalize">
                              {(selectedRawRequest &&
                                (
                                  selectedRawRequest as unknown as {
                                    urgency?: string;
                                  }
                                ).urgency) ||
                                "medium"}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        Description
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                        {selectedRawRequest?.reportText ||
                          selectedTicket.description ||
                          "No description"}
                      </div>
                    </div>
                    {selectedRawRequest?.evidencePhotos?.length ? (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">
                          Evidence
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {selectedRawRequest.evidencePhotos!.map((ph) => (
                            <img
                              key={ph._id}
                              src={ph.url}
                              alt="evidence"
                              className="w-full h-40 object-cover rounded-lg border"
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-6">
                    {/* Actions for both Maintenance and Deletion requests */}
                    {selectedRawRequest &&
                      myUserId &&
                      selectedRawRequest.reportedBy?._id === myUserId &&
                      selectedRawRequest.status === "pending" && (
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3">
                            Actions
                          </h3>
                          {activeSection === "maintenance" ? (
                            <MaintenanceRequestActions
                              requestId={selectedRawRequest._id}
                              currentUrgency={
                                (selectedRawRequest &&
                                  (
                                    selectedRawRequest as unknown as {
                                      urgency?: string;
                                    }
                                  ).urgency) ||
                                "medium"
                              }
                              currentDesc={selectedRawRequest.reportText || ""}
                              onDone={() => {
                                setIsTicketModalOpen(false);
                                fetchTickets();
                                fetchCounts();
                              }}
                            />
                          ) : (
                            <DeletionRequestActions
                              requestId={selectedRawRequest._id}
                              currentDesc={selectedRawRequest.reportText || ""}
                              onDone={() => {
                                setIsTicketModalOpen(false);
                                fetchTickets();
                                fetchCounts();
                              }}
                            />
                          )}
                        </div>
                      )}

                    {selectedTicket.vehicle && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">
                          Vehicle Information
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div>
                            <span className="text-gray-500 text-sm">
                              Vehicle:
                            </span>
                            <div className="font-medium">
                              {selectedTicket.vehicle.model}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">
                              License Plate:
                            </span>
                            <div className="font-medium">
                              {selectedTicket.vehicle.licensePlate}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        Timeline
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="text-sm">
                            <div className="font-medium">Request created</div>
                            <div className="text-gray-500">
                              {selectedTicket.createdAt}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedTicket.rating && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">
                          Customer Rating
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <div key={star}>
                                {star <= selectedTicket.rating! ? (
                                  <MdStar className="w-4 h-4 text-yellow-400" />
                                ) : (
                                  <MdStarBorder className="w-4 h-4 text-gray-300" />
                                )}
                              </div>
                            ))}
                            <span className="text-sm text-gray-600 ml-2">
                              {selectedTicket.rating}/5
                            </span>
                          </div>
                          {selectedTicket.feedback && (
                            <p className="text-sm text-gray-700">
                              "{selectedTicket.feedback}"
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffReport;

const MaintenanceRequestActions = ({
  requestId,
  currentUrgency,
  currentDesc,
  onDone,
}: {
  requestId: string;
  currentUrgency: string;
  currentDesc: string;
  onDone: () => void;
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [desc, setDesc] = useState(currentDesc);
  const [urgency, setUrgency] = useState(currentUrgency || "medium");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      await staffAPI.updateMaintenanceRequest(requestId, {
        description: desc,
        urgency,
        evidencePhotos: files ? Array.from(files) : undefined,
      });
      setEditOpen(false);
      onDone();
    } catch (e) {
      alert(
        e instanceof Error ? e.message : "Failed to update maintenance request"
      );
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this maintenance request?")) return;
    try {
      setLoading(true);
      await staffAPI.deleteMaintenanceRequest(requestId);
      onDone();
    } catch (e) {
      alert(
        e instanceof Error ? e.message : "Failed to delete maintenance request"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!editOpen)
    return (
      <div className="space-y-2">
        <button
          onClick={() => setEditOpen(true)}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          disabled={loading}
        >
          Update Request
        </button>
        <button
          onClick={remove}
          className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
          disabled={loading}
        >
          Delete Request
        </button>
      </div>
    );

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm text-gray-600">Description</label>
        <textarea
          className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm text-gray-600">Urgency</label>
        <select
          className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div>
        <label className="text-sm text-gray-600">Evidence Photos</label>
        <input
          type="file"
          multiple
          accept="image/*"
          className="w-full mt-1"
          onChange={(e) => setFiles(e.target.files)}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={submit}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => setEditOpen(false)}
          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Actions component for Deletion requests
const DeletionRequestActions = ({
  requestId,
  currentDesc,
  onDone,
}: {
  requestId: string;
  currentDesc: string;
  onDone: () => void;
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [desc, setDesc] = useState(currentDesc);
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      await staffAPI.updateDeletionRequest(requestId, {
        description: desc,
        evidencePhotos: files ? Array.from(files) : undefined,
      });
      setEditOpen(false);
      onDone();
    } catch (e) {
      alert(
        e instanceof Error ? e.message : "Failed to update deletion request"
      );
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this deletion request?")) return;
    try {
      setLoading(true);
      await staffAPI.deleteDeletionRequest(requestId);
      onDone();
    } catch (e) {
      alert(
        e instanceof Error ? e.message : "Failed to delete deletion request"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!editOpen)
    return (
      <div className="space-y-2">
        <button
          onClick={() => setEditOpen(true)}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          disabled={loading}
        >
          Update Request
        </button>
        <button
          onClick={remove}
          className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
          disabled={loading}
        >
          Delete Request
        </button>
      </div>
    );

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm text-gray-600">Description</label>
        <textarea
          className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm text-gray-600">Evidence Photos</label>
        <input
          type="file"
          multiple
          accept="image/*"
          className="w-full mt-1"
          onChange={(e) => setFiles(e.target.files)}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={submit}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => setEditOpen(false)}
          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
