import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  CreditCard,
  Clock,
  Car,
  AlertCircle,
} from "lucide-react";
import bookingApi, {
  type Booking,
  type BookingQueryParams,
} from "../../../../../../../service/apiBooking/API";
import BookingDetailModal from "./bookingComponent/BookingDetailModal";

const BookingHistoryTab = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // ✅ Modal state
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemsPerPage = 5;

  useEffect(() => {
    fetchBookings(1, true);
  }, [filterStatus]);

  const fetchBookings = async (page: number, reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const params: BookingQueryParams = {
        page,
        limit: itemsPerPage,
        ...(filterStatus !== "all" && { status: filterStatus as any }),
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const response = await bookingApi.getMyBookings(params);

      if (reset) {
        setBookings(response.items);
        setCurrentPage(1);
      } else {
        setBookings((prev) => [...prev, ...response.items]);
      }

      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError("Failed to load bookings");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchBookings(nextPage, false);
  };

  // ✅ Open modal handler
  const handleViewDetails = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsModalOpen(true);
  };

  // ✅ Close modal handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBookingId(null);
    // ✅ Refresh bookings after modal closes
    fetchBookings(1, true);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await bookingApi.cancelBooking(bookingId, "Cancelled by user");
      alert("Booking cancelled successfully");
      setCurrentPage(1);
      fetchBookings(1, true);
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert("Failed to cancel booking");
    }
  };

  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const calculateDuration = (startTime: string, endTime: string): string => {
    const days = bookingApi.calculateDuration(startTime, endTime);
    return `${days} ${days === 1 ? "day" : "days"}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchBookings(1, true)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Bookings Yet
          </h3>
          <p className="text-gray-600">
            Start your journey by booking a vehicle!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Filter Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Bookings</option>
              <option value="reserved">Reserved</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {bookings.length} bookings
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.4,
                  ease: "easeOut",
                  layout: { duration: 0.3 },
                }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:bg-gray-50 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl group cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-md flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <Car className="w-8 h-8 text-gray-600" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-black group-hover:text-gray-700 transition-colors duration-300">
                          {booking.vehicle.brand} {booking.vehicle.model}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {booking.vehicle.plateNumber} •{" "}
                          {booking._id.slice(-8)}
                        </p>
                      </div>

                      <div
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${bookingApi.getBookingStatusColor(
                          booking.status
                        )}`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            booking.status === "active"
                              ? "animate-pulse bg-green-500"
                              : booking.status === "reserved"
                              ? "bg-blue-500"
                              : booking.status === "completed"
                              ? "bg-purple-500"
                              : booking.status === "cancelled"
                              ? "bg-red-500"
                              : "bg-gray-500"
                          }`}
                        ></div>
                        <span className="capitalize">
                          {bookingApi.getBookingStatusLabel(booking.status)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Duration
                          </p>
                          <p className="text-sm font-bold text-black">
                            {calculateDuration(
                              booking.startTime,
                              booking.endTime
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Station
                          </p>
                          <p className="text-sm font-bold text-black truncate">
                            {booking.station.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Total Cost
                          </p>
                          <p className="text-sm font-bold text-black">
                            {bookingApi.formatCurrency(
                              booking.amounts.grandTotal
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Start Date
                          </p>
                          <p className="text-sm font-bold text-black">
                            {formatDate(booking.startTime)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-600">
                            Paid:{" "}
                            <span className="font-semibold text-black">
                              {bookingApi.formatCurrency(
                                booking.amounts.totalPaid
                              )}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {/* ✅ View Details Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(booking._id);
                            }}
                            className="px-3 py-1 bg-black text-white rounded-lg text-xs hover:bg-gray-800 transition-colors duration-300 font-medium"
                          >
                            View Details
                          </motion.button>

                          {booking.status === "reserved" && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelBooking(booking._id);
                              }}
                              className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100 transition-colors duration-300 font-medium"
                            >
                              Cancel
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Load More Button */}
        {currentPage < totalPages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="text-center pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-6 py-3 bg-gray-50 text-black rounded-2xl font-medium hover:bg-gray-100 transition-all duration-300 ease-in-out border border-gray-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? (
                <span className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </span>
              ) : (
                `Load More (${currentPage}/${totalPages})`
              )}
            </motion.button>
          </motion.div>
        )}

        {currentPage >= totalPages && bookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center pt-4 text-gray-500 text-sm"
          >
            You've reached the end of your bookings
          </motion.div>
        )}
      </div>

      {/* ✅ Modal */}
      {selectedBookingId && (
        <BookingDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          bookingId={selectedBookingId}
        />
      )}
    </>
  );
};

export default BookingHistoryTab;
