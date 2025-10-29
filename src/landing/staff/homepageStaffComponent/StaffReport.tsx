import { useState } from "react";
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
  MdSend,
  MdStar,
  MdStarBorder,
  MdNotifications,
  MdSupport,
  MdLocationOn,
  MdFilterList,
  MdViewModule,
  MdViewList,
} from "react-icons/md";

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
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<TicketType | "all">("all");
  const [newMessage, setNewMessage] = useState("");

  // New UI states for Station Requests layout
  const [selectedStation, setSelectedStation] = useState("downtown");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "approved" | "pending" | "rejected"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mock data with English content
  const tickets: Ticket[] = [
    {
      id: "TK001",
      title: "Vehicle breakdown on the road",
      description:
        "Vehicle shows low battery but displays 30%. Customer is stranded in District 1.",
      type: "vehicle_breakdown",
      status: "in_progress",
      priority: "urgent",
      customer: {
        id: "CUS001",
        name: "John Smith",
        phone: "+84901234567",
        email: "john.smith@email.com",
        company: "ABC Logistics",
      },
      vehicle: {
        id: "VH001",
        model: "VinFast VF e34",
        licensePlate: "51H-123.45",
      },
      assignedTo: {
        id: "ST001",
        name: "Mike Johnson",
        role: "Technical Support",
      },
      createdAt: "2024-12-24 14:30",
      updatedAt: "2024-12-24 15:15",
      slaDeadline: "2024-12-24 16:30",
      isOverdue: false,
      messages: [
        {
          id: "MSG001",
          sender: { id: "CUS001", name: "John Smith", type: "customer" },
          message:
            "My vehicle broke down on Le Loi Street, District 1. Battery shows 30% but won't start.",
          timestamp: "2024-12-24 14:30",
        },
        {
          id: "MSG002",
          sender: { id: "ST001", name: "Mike Johnson", type: "staff" },
          message:
            "Hello, we've received your request. Roadside assistance will arrive within 30 minutes.",
          timestamp: "2024-12-24 14:45",
        },
      ],
    },
    {
      id: "TK002",
      title: "Unable to unlock vehicle",
      description:
        "App cannot connect to the vehicle. Multiple attempts failed to unlock.",
      type: "unlock_issue",
      status: "new",
      priority: "high",
      customer: {
        id: "CUS002",
        name: "Sarah Wilson",
        phone: "+84912345678",
        email: "sarah.wilson@email.com",
      },
      vehicle: {
        id: "VH002",
        model: "Honda Lead",
        licensePlate: "59C-678.90",
      },
      createdAt: "2024-12-24 16:00",
      updatedAt: "2024-12-24 16:00",
      slaDeadline: "2024-12-24 16:30",
      isOverdue: true,
      messages: [],
    },
    {
      id: "TK003",
      title: "Contract refund request",
      description:
        "Company wants to cancel contract and refund remaining fees.",
      type: "payment_refund",
      status: "resolved",
      priority: "medium",
      customer: {
        id: "CUS003",
        name: "David Brown",
        phone: "+84923456789",
        email: "david.brown@email.com",
        company: "XYZ Transport",
      },
      createdAt: "2024-12-23 10:00",
      updatedAt: "2024-12-24 09:30",
      slaDeadline: "2024-12-24 10:00",
      isOverdue: false,
      messages: [],
      rating: 5,
      feedback: "Quick and professional service. Very satisfied!",
    },
  ];

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLabel = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
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
    const matchesType = filterType === "all" || ticket.type === filterType;

    return matchesSearch && matchesStatusCategory && matchesType;
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    // Add message logic here
    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
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

        {/* Station Selector */}
        <motion.div
          className="mb-4 bg-white rounded-lg shadow-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center gap-4">
            <MdLocationOn className="w-5 h-5 text-gray-400" />
            <label className="text-sm text-gray-600">Select Station:</label>
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="downtown">Downtown Station</option>
              <option value="suburb">Suburb Station</option>
              <option value="airport">Airport Station</option>
            </select>
            <span className="text-sm text-gray-500">
              Showing requests from{" "}
              {selectedStation === "downtown"
                ? "Downtown Station"
                : selectedStation === "suburb"
                ? "Suburb Station"
                : "Airport Station"}
            </span>
          </div>
        </motion.div>

        {/* Status Tabs */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
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
            const counts = {
              all: tickets.length,
              approved: tickets.filter((t) => toCategory(t) === "approved")
                .length,
              pending: tickets.filter((t) => toCategory(t) === "pending")
                .length,
              rejected: tickets.filter((t) => toCategory(t) === "rejected")
                .length,
            };
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

                {/* Search and Controls */}
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
                      <select
                        value={filterType}
                        onChange={(e) =>
                          setFilterType(e.target.value as TicketType | "all")
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Types</option>
                        {ticketTypes.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-2 text-sm">
                        <MdFilterList className="w-4 h-4" /> Filters
                      </button>
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
        </motion.div>

        {/* Requests Display */}
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

            if (items.length === 0) {
              return (
                <div className="text-center py-12 text-gray-600">
                  No requests found
                </div>
              );
            }

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
              // Simple table view fallback
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
                              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
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

            // Grid view
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((t, idx) => {
                  const cat = toCategory(t);
                  const typeMeta = ticketTypes.find((x) => x.value === t.type);
                  const typeLabel = typeMeta?.label || "Request";
                  return (
                    <motion.div
                      key={t.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.03 * idx }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Report ID
                          </p>
                          <h3 className="font-semibold text-gray-900">
                            RPT-{t.id}
                          </h3>
                        </div>
                        <StatusPill cat={cat} />
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
                            setIsTicketModalOpen(true);
                          }}
                          className="w-full py-2 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors font-medium"
                        >
                          View details
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })()}
        </motion.div>
      </motion.div>

      {/* Ticket Detail Modal */}
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
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Ticket #{selectedTicket.id}
                  </h2>
                  <p className="text-gray-600 mt-1">{selectedTicket.title}</p>
                </div>
                <button
                  onClick={() => setIsTicketModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Ticket Details */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Customer:</span>
                          <div className="font-medium">
                            {selectedTicket.customer.name}
                          </div>
                          <div className="text-gray-600">
                            {selectedTicket.customer.phone}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <div
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(
                              selectedTicket.status
                            )}`}
                          >
                            {getStatusLabel(selectedTicket.status)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Issue Type:</span>
                          <div className="font-medium">
                            {
                              ticketTypes.find(
                                (t) => t.value === selectedTicket.type
                              )?.label
                            }
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Priority:</span>
                          <div
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getPriorityColor(
                              selectedTicket.priority
                            )}`}
                          >
                            {getPriorityLabel(selectedTicket.priority)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        Detailed Description
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700">
                          {selectedTicket.description}
                        </p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        Messages
                      </h3>
                      <div className="space-y-4 max-h-64 overflow-y-auto">
                        {selectedTicket.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender.type === "staff"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender.type === "staff"
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <div className="text-sm font-medium mb-1">
                                {message.sender.name}
                              </div>
                              <div className="text-sm">{message.message}</div>
                              <div
                                className={`text-xs mt-1 ${
                                  message.sender.type === "staff"
                                    ? "text-blue-100"
                                    : "text-gray-500"
                                }`}
                              >
                                {message.timestamp}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Message Input */}
                      <div className="mt-4 flex items-center space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type message..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleSendMessage()
                          }
                        />
                        <button
                          onClick={handleSendMessage}
                          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <MdSend className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Actions */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        Actions
                      </h3>
                      <div className="space-y-2">
                        <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                          Update Status
                        </button>
                        <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Assign to Staff
                        </button>
                        <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                          Add Note
                        </button>
                      </div>
                    </div>

                    {/* Vehicle Info */}
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

                    {/* Timeline */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        Timeline
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="text-sm">
                            <div className="font-medium">Ticket created</div>
                            <div className="text-gray-500">
                              {selectedTicket.createdAt}
                            </div>
                          </div>
                        </div>
                        {selectedTicket.assignedTo && (
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <div className="text-sm">
                              <div className="font-medium">
                                Assigned to {selectedTicket.assignedTo.name}
                              </div>
                              <div className="text-gray-500">
                                {selectedTicket.updatedAt}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
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
