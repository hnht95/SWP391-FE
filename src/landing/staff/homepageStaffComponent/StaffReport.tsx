import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdSearch,
  MdAdd,
  MdMoreVert,
  MdBusiness,
  MdDirectionsCar,
  MdChat,
  MdWarning,
  MdSchedule,
  MdClose,
  MdAssignment,
  MdPerson,
  MdSend,
  MdStar,
  MdStarBorder,
  MdTrendingUp,
  MdAccessTime,
  MdNotifications,
  MdHelpOutline,
  MdBook,
  MdSupport,
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
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "tickets" | "chat" | "faq"
  >("dashboard");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");
  const [filterType, setFilterType] = useState<TicketType | "all">("all");
  const [newMessage, setNewMessage] = useState("");

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

  const stats = {
    total: tickets.length,
    new: tickets.filter((t) => t.status === "new").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    overdue: tickets.filter((t) => t.isOverdue).length,
    avgResponseTime: "25 minutes",
    satisfaction: 4.8,
  };

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
    const matchesStatus =
      filterStatus === "all" || ticket.status === filterStatus;
    const matchesType = filterType === "all" || ticket.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    // Add message logic here
    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <MdSupport className="w-8 h-8 mr-3 text-blue-600" />
              Customer Support
            </h1>
            <p className="text-gray-600 mt-1">
              Manage support requests and customer care
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MdAdd className="w-4 h-4" />
              <span>Create Ticket</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: "dashboard", label: "Dashboard", icon: MdTrendingUp },
              { id: "tickets", label: "Tickets", icon: MdAssignment },
              { id: "chat", label: "Live Chat", icon: MdChat },
              { id: "faq", label: "FAQ", icon: MdHelpOutline },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as "dashboard" | "tickets" | "chat" | "faq"
                  )
                }
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MdAssignment className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm">Total Tickets</h3>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <MdSchedule className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {stats.inProgress}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm">In Progress</h3>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <MdWarning className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {stats.overdue}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm">Overdue</h3>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MdStar className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {stats.satisfaction}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm">Avg Rating</h3>
            </div>
          </div>

          {/* Recent Tickets Overview */}
          <div className="bg-white rounded-xl border border-gray-100 mb-6">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Tickets
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Issue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      SLA
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tickets.slice(0, 5).map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setIsTicketModalOpen(true);
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ticket.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.customer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ticket.customer.company}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 truncate max-w-xs">
                          {ticket.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            ticket.status
                          )}`}
                        >
                          {getStatusLabel(ticket.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            ticket.priority
                          )}`}
                        >
                          {getPriorityLabel(ticket.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.isOverdue && (
                          <span className="text-red-600 font-medium">
                            Overdue
                          </span>
                        )}
                        {!ticket.isOverdue && (
                          <span className="text-green-600">On Time</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tickets Tab */}
      {activeTab === "tickets" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Filters */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="relative">
                  <MdSearch className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value as TicketStatus | "all")
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(e.target.value as TicketType | "all")
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  {ticketTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  setSelectedTicket(ticket);
                  setIsTicketModalOpen(true);
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg font-semibold text-gray-900">
                        #{ticket.id}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {getStatusLabel(ticket.status)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          ticket.priority
                        )}`}
                      >
                        {getPriorityLabel(ticket.priority)}
                      </span>
                      {ticket.isOverdue && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          Overdue
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {ticket.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {ticket.description}
                    </p>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <MdPerson className="w-4 h-4" />
                        <span>{ticket.customer.name}</span>
                        {ticket.customer.company && (
                          <span className="text-gray-400">
                            • {ticket.customer.company}
                          </span>
                        )}
                      </div>

                      {ticket.vehicle && (
                        <div className="flex items-center space-x-2">
                          <MdDirectionsCar className="w-4 h-4" />
                          <span>
                            {ticket.vehicle.model} -{" "}
                            {ticket.vehicle.licensePlate}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <MdAccessTime className="w-4 h-4" />
                        <span>{ticket.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MdMoreVert className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl border border-gray-100 h-96"
        >
          <div className="p-6 text-center">
            <MdChat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Live Chat
            </h3>
            <p className="text-gray-600">
              Live chat feature is under development
            </p>
          </div>
        </motion.div>
      )}

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl border border-gray-100 p-6"
        >
          <div className="text-center">
            <MdBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Knowledge Base
            </h3>
            <p className="text-gray-600">FAQ system is under development</p>
          </div>
        </motion.div>
      )}

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
