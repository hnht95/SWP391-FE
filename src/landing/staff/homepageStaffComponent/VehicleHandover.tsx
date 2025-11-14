import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdCalendarToday,
  MdDirectionsCar,
  MdPerson,
  MdClose,
  MdLocationOn,
  MdSearch,
  MdViewModule,
  MdViewList,
} from "react-icons/md";
import CustomSelect from "../../../components/CustomSelect";
import staffAPI from "../../../service/apiStaff/API";
import type {
  BookingTransactionItem,
  AdminBookingTransactionsResponse,
  CreateBookingResponse,
} from "../../../types/bookings";
import type { RawApiVehicle } from "../../../types/vehicle";
import { getAllStations } from "../../../service/apiAdmin/apiStation/API";
import { formatDateTime } from "../../../utils/dateUtils";
import useDebounce from "../../../hooks/useDebounce";
import BookingWorkflow from "../bookingWorkflow";

const VehicleHandover = () => {
  // List state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<BookingTransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  // Payment status filter - changed to match booking statuses
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Detail modal
  const [selected, setSelected] = useState<BookingTransactionItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [vehiclesOptions, setVehiclesOptions] = useState<
    { value: string; label: string }[]
  >([]);
  // Only need _id and name for select options; avoid cross-module Station type mismatch
  const [stations, setStations] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const stationOptions = useMemo(
    () => stations.map((s) => ({ value: s._id, label: s.name })),
    [stations]
  );
  const [createForm, setCreateForm] = useState({
    vehicle: "",
    pickupStation: "",
    dropoffStation: "",
    startDate: "",
    endDate: "",
    rentalType: "daily" as "daily" | "hourly",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  // success toast (optional): omitted in UI to keep screen clean

  const openCreateModal = () => setIsCreateOpen(true);
  const closeCreateModal = () => setIsCreateOpen(false);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Fetch list with filters
  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let res: AdminBookingTransactionsResponse;
        if (debouncedSearch) {
          res = await staffAPI.searchBookings({
            q: debouncedSearch,
            page,
            limit,
            sort: "-createdAt",
          });
        } else {
          const params = { page, limit };
          // Call specific endpoint based on status filter
          switch (statusFilter) {
            case "pending":
              res = await staffAPI.getPendingBookings(params);
              break;
            case "reserved":
              res = await staffAPI.getReservedBookings(params);
              break;
            case "active":
              res = await staffAPI.getActiveBookings(params);
              break;
            case "completed":
              res = await staffAPI.getCompletedBookings(params);
              break;
            case "cancelled":
              res = await staffAPI.getCancelledBookings(params);
              break;
            case "expired":
              res = await staffAPI.getExpiredBookings(params);
              break;
            default: // "all"
              res = await staffAPI.getAdminBookingTransactions({
                ...params,
                provider: "payos",
                sort: "-createdAt",
              });
              break;
          }
        }
        if (!active) return;
        setItems(res.items || []);
        setTotal(res.total || 0);
      } catch (e: unknown) {
        if (!active) return;
        const msg = e instanceof Error ? e.message : "Failed to load bookings";
        setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, [page, limit, debouncedSearch, statusFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  // Prefetch vehicles + stations for create modal
  useEffect(() => {
    let active = true;
    const preload = async () => {
      try {
        const [vehiclesRes, stationsRes] = await Promise.all([
          staffAPI.getVehicles({ page: 1, limit: 100 }),
          getAllStations(),
        ]);
        if (!active) return;
        setVehiclesOptions(
          (vehiclesRes?.items || []).map((v: RawApiVehicle) => ({
            value: v._id,
            label: `${v.brand} ${v.model} - ${v.plateNumber}`,
          }))
        );
        setStations(stationsRes || []);
      } catch (err) {
        // Silently ignore preload failures; the create modal can still show inputs
        console.warn("Preload vehicles/stations failed", err);
      }
    };
    preload();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    return {
      all: items.length,
      pending: items.filter((it) => it.status === "pending").length,
      reserved: items.filter((it) => it.status === "reserved").length,
      active: items.filter((it) => it.status === "active").length,
      completed: items.filter((it) => it.status === "completed").length,
      cancelled: items.filter((it) => it.status === "cancelled").length,
      expired: items.filter((it) => it.status === "expired").length,
    };
  }, [items]);

  // Try to find a PayOS checkout URL in any nested response shape
  const extractCheckoutUrl = (data: unknown): string | null => {
    if (!data || typeof data !== "object") return null;
    const stack: unknown[] = [data];
    while (stack.length) {
      const node: unknown = stack.pop();
      if (!node) continue;
      if (typeof node === "string") {
        if (/^https?:\/\//.test(node) && node.includes("pay")) return node;
        continue;
      }
      if (typeof node === "object") {
        const obj = node as Record<string, unknown>;
        for (const [k, v] of Object.entries(obj)) {
          if (k.toLowerCase() === "checkouturl" && typeof v === "string") {
            return v;
          }
          stack.push(v);
        }
      }
    }
    return null;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    // no toast state
    try {
      // Call new booking API payload shape (vehicleId, startTime, endTime, deposit)
      // Open a blank tab immediately to avoid popup blockers
      const preOpened = window.open("about:blank", "_blank");
      const createRes = await staffAPI.createBooking({
        vehicleId: createForm.vehicle,
        startTime: new Date(createForm.startDate).toISOString(),
        endTime: new Date(createForm.endDate).toISOString(),
        deposit: { provider: "payos" },
      });
      const checkoutUrl = extractCheckoutUrl(
        (createRes as CreateBookingResponse).data
      );
      if (checkoutUrl) {
        if (preOpened) preOpened.location.href = checkoutUrl;
        else window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      } else if (preOpened) {
        // No URL returned, close the pre-opened tab
        preOpened.close();
      }
      // Refresh list
      setPage(1);
      const res = await staffAPI.getAdminBookingTransactions({
        page: 1,
        limit,
      });
      setItems(res.items || []);
      setTotal(res.total || 0);
      // Reset form
      setCreateForm({
        vehicle: "",
        pickupStation: "",
        dropoffStation: "",
        startDate: "",
        endDate: "",
        rentalType: "daily",
      });
      // optional: show toast here
      closeCreateModal();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create booking";
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  const openDetail = (b: BookingTransactionItem) => {
    setSelected(b);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Booking Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage all vehicle bookings and reservations.
            </p>
          </div>
          <motion.button
            onClick={openCreateModal}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MdCalendarToday className="w-5 h-5" />
            <span>New Booking</span>
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Status Tabs */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { value: "all", label: "All", count: stats.all },
              { value: "pending", label: "Pending", count: stats.pending },
              { value: "reserved", label: "Reserved", count: stats.reserved },
              { value: "active", label: "Active", count: stats.active },
              {
                value: "completed",
                label: "Completed",
                count: stats.completed,
              },
              {
                value: "cancelled",
                label: "Cancelled",
                count: stats.cancelled,
              },
              { value: "expired", label: "Expired", count: stats.expired },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                  statusFilter === tab.value
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Search and Filters Row */}
      <motion.div
        className="mb-6 bg-white rounded-lg shadow-sm p-4 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-80">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search booking ID, customer, vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
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
      </motion.div>

      {/* Bookings Display */}
      <motion.div
        className="bg-white rounded-lg shadow-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <MdDirectionsCar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No bookings found</p>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((booking, index) => {
              // Get status badge info
              const getStatusBadge = () => {
                switch (booking.status) {
                  case "completed":
                    return {
                      color: "bg-green-100 text-green-800",
                      label: "Successful",
                    };
                  case "cancelled":
                    return {
                      color: "bg-red-100 text-red-800",
                      label: "Failed",
                    };
                  case "expired":
                    return {
                      color: "bg-yellow-100 text-yellow-800",
                      label: "Payment Expired",
                    };
                  case "pending":
                  case "confirmed":
                    return {
                      color: "bg-yellow-100 text-yellow-800",
                      label: "Pending Payment",
                    };
                  default:
                    return {
                      color: "bg-gray-100 text-gray-800",
                      label: booking.status,
                    };
                }
              };

              const statusBadge = getStatusBadge();

              const startDisplay = booking.startTime || booking.createdAt;
              const endDisplay = booking.endTime || booking.updatedAt;

              return (
                <motion.div
                  key={booking._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white"
                  onClick={() => openDetail(booking)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Booking ID</p>
                      <h3 className="font-semibold text-gray-900">
                        {booking.bookingId
                          ? booking.bookingId
                          : `BK-${booking._id.substring(0, 8).toUpperCase()}`}
                      </h3>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${statusBadge.color}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MdPerson className="w-4 h-4 mr-1 text-gray-400" />
                    <span className="text-xs text-gray-500">Customer:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {booking.renterInfo?.name || "N/A"}
                    </span>
                  </div>

                  {/* Vehicle */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MdDirectionsCar className="w-4 h-4 mr-1 text-gray-400" />
                    <span className="text-xs text-gray-500">Vehicle:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {booking.vehicleInfo?.brand} {booking.vehicleInfo?.model}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div>
                      <span className="text-gray-500">Start Date</span>
                      <div className="flex items-center mt-1">
                        <MdCalendarToday className="w-3 h-3 mr-1 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {new Date(startDisplay).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">End Date</span>
                      <div className="flex items-center mt-1">
                        <MdCalendarToday className="w-3 h-3 mr-1 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {new Date(endDisplay).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amount and Payment Method */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div>
                      <span className="text-gray-500">Total Amount</span>
                      <p className="font-semibold text-gray-900 mt-1">
                        {booking.amounts?.totalPaid?.toLocaleString() || "0"}{" "}
                        VND
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment Method</span>
                      <p className="font-medium text-gray-900 mt-1">
                        {booking.deposit?.payos
                          ? "PayOS"
                          : booking.deposit?.status === "captured"
                          ? "Credit Card"
                          : booking.deposit?.status === "pending"
                          ? "Pending"
                          : booking.status === "cancelled"
                          ? "Failed"
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetail(booking);
                    }}
                    className="w-full py-2 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View details
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {[
                    "Booking ID",
                    "Customer",
                    "Vehicle",
                    "Start Date",
                    "End Date",
                    "Amount",
                    "Status",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((booking) => {
                  const getStatusBadge = () => {
                    switch (booking.status) {
                      case "active":
                        return {
                          color: "bg-blue-100 text-blue-800",
                          label: "active",
                        };
                      case "completed":
                        return {
                          color: "bg-green-100 text-green-800",
                          label: "Successful",
                        };
                      case "cancelled":
                        return {
                          color: "bg-red-100 text-red-800",
                          label: "Failed",
                        };
                      case "expired":
                        return {
                          color: "bg-yellow-100 text-yellow-800",
                          label: "Payment Expired",
                        };
                      case "pending":
                      case "confirmed":
                        return {
                          color: "bg-yellow-100 text-yellow-800",
                          label: "Pending Payment",
                        };
                      default:
                        return {
                          color: "bg-gray-100 text-gray-800",
                          label: booking.status,
                        };
                    }
                  };

                  const statusBadge = getStatusBadge();

                  return (
                    <tr
                      key={booking._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => openDetail(booking)}
                    >
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {booking.bookingId
                          ? booking.bookingId
                          : `BK-${booking._id.substring(0, 8).toUpperCase()}`}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {booking.renterInfo?.name || "N/A"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {booking.vehicleInfo?.brand}{" "}
                        {booking.vehicleInfo?.model}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {new Date(
                          booking.startTime || booking.createdAt
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {new Date(
                          booking.endTime || booking.updatedAt
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {booking.amounts?.totalPaid?.toLocaleString() || "0"}{" "}
                        VND
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${statusBadge.color}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(booking);
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
        )}

        {/* Pagination */}
        {!loading && items.length > 0 && (
          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <div className="text-sm text-gray-600">
              Showing {total === 0 ? 0 : (page - 1) * limit + 1}-
              {Math.min(page * limit, total)} of {total}
            </div>
            <div className="flex items-center gap-3">
              <button
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </button>
              <span className="text-sm text-gray-700">
                Page {page} / {totalPages}
              </span>
              <button
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
              <CustomSelect
                className="ml-2"
                value={limit}
                options={[
                  { value: 5, label: "5 / page" },
                  { value: 10, label: "10 / page" },
                  { value: 20, label: "20 / page" },
                  { value: 50, label: "50 / page" },
                ]}
                onChange={(v: string | number) => {
                  setLimit(Number(v));
                  setPage(1);
                }}
                menuPlacement="top"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Create Booking Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create Booking
                </h2>
                <button
                  onClick={closeCreateModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                {createError && (
                  <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
                    {createError}
                  </div>
                )}
                <form onSubmit={handleCreateSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Vehicle & Rental
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vehicle
                        </label>
                        <CustomSelect
                          className="w-full"
                          value={createForm.vehicle}
                          options={[
                            { value: "", label: "Select vehicle" },
                            ...vehiclesOptions,
                          ]}
                          onChange={(v: string | number) =>
                            setCreateForm((s) => ({ ...s, vehicle: String(v) }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rental Type
                        </label>
                        <CustomSelect
                          className="w-full"
                          value={createForm.rentalType}
                          options={[
                            { value: "daily", label: "Daily" },
                            { value: "hourly", label: "Hourly" },
                          ]}
                          onChange={(v: string | number) =>
                            setCreateForm((s) => ({
                              ...s,
                              rentalType: v as "daily" | "hourly",
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-violet-500" />
                      Stations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pickup Station
                        </label>
                        <CustomSelect
                          className="w-full"
                          value={createForm.pickupStation}
                          options={[
                            { value: "", label: "Select station" },
                            ...stationOptions,
                          ]}
                          onChange={(v: string | number) =>
                            setCreateForm((s) => ({
                              ...s,
                              pickupStation: String(v),
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dropoff Station
                        </label>
                        <CustomSelect
                          className="w-full"
                          value={createForm.dropoffStation}
                          options={[
                            { value: "", label: "Same as pickup" },
                            ...stationOptions,
                          ]}
                          onChange={(v: string | number) =>
                            setCreateForm((s) => ({
                              ...s,
                              dropoffStation: String(v),
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Schedule
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start
                        </label>
                        <input
                          type="datetime-local"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={createForm.startDate}
                          required
                          onChange={(e) =>
                            setCreateForm((s) => ({
                              ...s,
                              startDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End
                        </label>
                        <input
                          type="datetime-local"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={createForm.endDate}
                          required
                          onChange={(e) =>
                            setCreateForm((s) => ({
                              ...s,
                              endDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <motion.button
                      type="button"
                      onClick={closeCreateModal}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={creating}
                      className={`px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                        creating
                          ? "bg-black text-white"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                      whileHover={{ scale: creating ? 1 : 1.02 }}
                      whileTap={{ scale: creating ? 1 : 0.98 }}
                    >
                      {creating ? "Creating..." : "Create Booking"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selected && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white h-[90%] rounded-xl max-w-[800px] w-full overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Booking Details
                  </h2>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        selected.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : selected.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : selected.status === "expired"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {selected.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDateTime(selected.createdAt)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Booking Workflow */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Booking Workflow
                  </h3>
                  <BookingWorkflow
                    booking={selected}
                    onUpdate={async () => {
                      // Refresh the specific booking data
                      try {
                        const res = await staffAPI.searchBookings({
                          q: selected._id,
                          page: 1,
                          limit: 1,
                        });
                        if (res.items && res.items.length > 0) {
                          const updatedBooking = res.items[0];
                          setSelected(updatedBooking);
                          // Update in the list as well
                          setItems((prev) =>
                            prev.map((item) =>
                              item._id === updatedBooking._id
                                ? updatedBooking
                                : item
                            )
                          );
                        }
                      } catch (err) {
                        console.error("Failed to refresh booking:", err);
                      }
                    }}
                  />
                </div>

                {/* Renter Info */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <MdPerson className="w-5 h-5 text-white" />
                    </div>
                    Renter Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-900">
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">
                        Name
                      </span>
                      <span className="font-medium">
                        {selected.renterInfo?.name || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">
                        Phone
                      </span>
                      <span className="font-medium">
                        {selected.renterInfo?.phone || "N/A"}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-sm text-gray-600 block mb-1">
                        Email
                      </span>
                      <span className="font-medium">
                        {selected.renterInfo?.email || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <MdDirectionsCar className="w-5 h-5 text-white" />
                    </div>
                    Vehicle Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-900">
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">
                        Vehicle
                      </span>
                      <span className="font-medium">
                        {selected.vehicleInfo?.brand}{" "}
                        {selected.vehicleInfo?.model}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">
                        Plate Number
                      </span>
                      <span className="font-medium">
                        {selected.vehicleInfo?.plateNumber || "N/A"}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-sm text-gray-600 flex items-center mb-1">
                        <MdLocationOn className="w-4 h-4 mr-1" />
                        Station
                      </span>
                      <span className="font-medium">
                        {selected.stationInfo?.name || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deposit & Payment Info */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                      <MdCalendarToday className="w-5 h-5 text-white" />
                    </div>
                    Payment & Deposit
                  </h3>
                  <div className="space-y-4">
                    {/* Deposit Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-900">
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">
                          Deposit Amount
                        </span>
                        <span className="font-medium text-lg">
                          {selected.deposit?.amount?.toLocaleString() || "0"}{" "}
                          {selected.deposit?.currency || "VND"}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">
                          Deposit Status
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            selected.deposit?.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : selected.deposit?.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {selected.deposit?.status || "N/A"}
                        </span>
                      </div>
                      {selected.deposit?.providerRef && (
                        <div className="md:col-span-2">
                          <span className="text-sm text-gray-600 block mb-1">
                            Provider Reference
                          </span>
                          <span className="font-medium font-mono text-sm">
                            {selected.deposit.providerRef}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* PayOS Info */}
                    {selected.deposit?.payos && (
                      <div className="mt-4 p-4 bg-white bg-opacity-60 rounded-lg border border-green-200">
                        <h4 className="font-medium text-gray-900 mb-3">
                          PayOS Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {selected.deposit.payos.orderCode && (
                            <div>
                              <span className="text-gray-600 block mb-1">
                                Order Code
                              </span>
                              <span className="font-mono text-gray-900">
                                {selected.deposit.payos.orderCode}
                              </span>
                            </div>
                          )}
                          {selected.deposit.payos.paymentLinkId && (
                            <div>
                              <span className="text-gray-600 block mb-1">
                                Payment Link ID
                              </span>
                              <span className="font-mono text-gray-900">
                                {selected.deposit.payos.paymentLinkId}
                              </span>
                            </div>
                          )}
                          {selected.deposit.payos.paidAt && (
                            <div>
                              <span className="text-gray-600 block mb-1">
                                Paid At
                              </span>
                              <span className="font-medium text-gray-900">
                                {formatDateTime(selected.deposit.payos.paidAt)}
                              </span>
                            </div>
                          )}
                          {selected.deposit.payos.checkoutUrl && (
                            <div className="md:col-span-2">
                              <span className="text-gray-600 block mb-1">
                                Checkout URL
                              </span>
                              <a
                                href={selected.deposit.payos.checkoutUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline break-all text-xs"
                              >
                                {selected.deposit.payos.checkoutUrl}
                              </a>
                            </div>
                          )}
                          {selected.deposit.payos.qrCode && (
                            <div className="md:col-span-2">
                              <span className="text-gray-600 block mb-1">
                                QR Code
                              </span>
                              <a
                                href={selected.deposit.payos.qrCode}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline break-all text-xs"
                              >
                                View QR Code
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Total Paid */}
                    {selected.amounts?.totalPaid !== undefined && (
                      <div className="mt-4 p-4 bg-white bg-opacity-60 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-medium">
                            Total Paid
                          </span>
                          <span className="text-2xl font-bold text-green-600">
                            {selected.amounts.totalPaid.toLocaleString()} VND
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="bg-gray-50 rounded-xl p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Timestamps
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-900">
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">
                        Created At
                      </span>
                      <span className="font-medium">
                        {formatDateTime(selected.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">
                        Last Updated
                      </span>
                      <span className="font-medium">
                        {formatDateTime(selected.updatedAt)}
                      </span>
                    </div>
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

export default VehicleHandover;
