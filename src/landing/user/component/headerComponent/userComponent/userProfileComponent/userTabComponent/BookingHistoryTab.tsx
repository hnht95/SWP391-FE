// pages/BookingHistoryTab.tsx
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Calendar,
  MapPin,
  CreditCard,
  Clock,
  Loader2,
  AlertCircle,
  ArrowRight,
  Filter,
  ChevronDown,
} from "lucide-react";
import { FaStar } from "react-icons/fa";
import BookingDetailModal from "./bookingComponent/BookingDetailModal";
import RatingModal from "./bookingComponent/RatingModal";
import ReportModal from "./bookingComponent/ReportModal";
import userBookingApi from "../../../../../../../service/apiUser/booking/API";
import type {
  Booking,
  BookingQueryParams,
  BookingStatus,
} from "../../../../../../../service/apiUser/booking/API";

// Status filter options
const STATUS_OPTIONS = [
  { value: "all", label: "All Bookings" },
  { value: "pending", label: "Pending Payment" },
  { value: "reserved", label: "Reserved" },
  { value: "active", label: "Active" },
  { value: "returning", label: "Returning" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "expired", label: "Expired" },
] as const;

type StatusFilter = (typeof STATUS_OPTIONS)[number]["value"];

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          border: "border-yellow-200",
          label: "Pending Payment",
        };
      case "reserved":
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
          border: "border-blue-200",
          label: "Reserved",
        };
      case "returning":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          border: "border-yellow-200",
          label: "Returning",
        };
      case "active":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          border: "border-green-200",
          label: "Active",
        };
      case "completed":
        return {
          bg: "bg-purple-100",
          text: "text-purple-700",
          border: "border-purple-200",
          label: "Completed",
        };
      case "cancelled":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          border: "border-red-200",
          label: "Cancelled",
        };
      case "expired":
        return {
          bg: "bg-orange-100",
          text: "text-orange-700",
          border: "border-orange-200",
          label: "Expired",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-700",
          border: "border-gray-200",
          label: status,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
};

// ✅ Helper to get vehicle image URL from booking
const getVehicleImageUrl = (booking: Booking): string | null => {
  if (!booking.vehicle || typeof booking.vehicle === "string") {
    return null;
  }

  // Try photos array first (flat array)
  if (booking.vehicle.photos && booking.vehicle.photos.length > 0) {
    return booking.vehicle.photos[0];
  }

  // Try defaultPhotos.exterior
  const firstPhoto = booking.vehicle.defaultPhotos?.exterior?.[0];
  if (!firstPhoto) return null;

  // Handle both string and object formats
  if (typeof firstPhoto === "string") {
    return firstPhoto;
  }

  if (typeof firstPhoto === "object" && "url" in firstPhoto) {
    return firstPhoto.url;
  }

  return null;
};

const BookingHistoryTab = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Rating & Report Modal States
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedBookingForAction, setSelectedBookingForAction] =
    useState<Booking | null>(null);

  // Pagination & Filter states
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [displayCount, setDisplayCount] = useState(8);
  const [totalCount, setTotalCount] = useState(0);

  // ✅ Fetch bookings function (memoized with useCallback)
  const fetchBookings = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const params: BookingQueryParams = {
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (statusFilter !== "all") {
        params.status = statusFilter as BookingStatus;
      }

      const response = await userBookingApi.getUserBookings(params);

      if (response.success && response.items) {
        setBookings(response.items);
        setTotalCount(response.items.length);
      } else {
        setError("Invalid response format from server");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load booking history";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Fetch bookings on mount and when filter changes
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    setDisplayCount(8);
  }, [statusFilter]);

  const handleOpenRating = (e: React.MouseEvent, booking: Booking) => {
    e.stopPropagation();
    setSelectedBookingForAction(booking);
    setRatingModalOpen(true);
  };

  // const handleOpenReport = (e: React.MouseEvent, booking: Booking) => {
  //   e.stopPropagation();
  //   setSelectedBookingForAction(booking);
  //   setReportModalOpen(true);
  // };

  // ✅ Refetch bookings after successful action
  const handleActionSuccess = useCallback(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleReturnToPayment = (
    e: React.MouseEvent,
    bookingId: string
  ): void => {
    e.stopPropagation();
    navigate(`/payment/${bookingId}`);
  };

  const handleViewDetails = (bookingId: string): void => {
    setSelectedBookingId(bookingId);
    setIsModalOpen(true);
  };

  const handleLoadMore = (): void => {
    setDisplayCount((prev) => Math.min(prev + 8, totalCount));
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const currentFilterLabel =
    STATUS_OPTIONS.find((opt) => opt.value === statusFilter)?.label ||
    "All Bookings";

  const displayedBookings = bookings.slice(0, displayCount);
  const canLoadMore = displayCount < totalCount;

  const getVehicleName = (booking: Booking): string => {
    if (typeof booking.vehicle === "string") return "Unknown Vehicle";
    return `${booking.vehicle?.brand || "Unknown"} ${
      booking.vehicle?.model || "Vehicle"
    }`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500">Loading booking history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 font-medium mb-2">Failed to load bookings</p>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filter by Status</h3>
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent cursor-pointer transition-all"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {bookings.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold">
                  {Math.min(displayCount, totalCount)}
                </span>{" "}
                of <span className="font-semibold">{totalCount}</span> bookings
                {statusFilter !== "all" && (
                  <span className="text-gray-500">
                    {" "}
                    • Filter: {currentFilterLabel}
                  </span>
                )}
              </p>
            </div>
          )}
        </motion.div>

        {bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Car className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">
              {statusFilter === "all"
                ? "No bookings yet"
                : `No ${currentFilterLabel} bookings`}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {statusFilter === "all"
                ? "Your booking history will appear here"
                : "Try selecting a different filter"}
            </p>
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-4">
          {displayedBookings.map((booking, index) => {
            if (!booking.vehicle) return null;

            const vehicleBrand =
              typeof booking.vehicle === "string"
                ? "Unknown"
                : booking.vehicle?.brand || "Unknown";

            const vehicleModel =
              typeof booking.vehicle === "string"
                ? "Vehicle"
                : booking.vehicle?.model || "Vehicle";

            const vehiclePlate =
              typeof booking.vehicle === "string"
                ? "N/A"
                : booking.vehicle?.plateNumber || "N/A";

            const stationName = !booking.station
              ? "Station Not Available"
              : typeof booking.station === "string"
              ? "N/A"
              : booking.station?.name || "N/A";

            // Get vehicle image directly from booking
            const vehicleImage = getVehicleImageUrl(booking);

            // Status checks
            const isPending = booking.status === "pending";
            const isCompleted = booking.status === "completed";
            const hasRating = !!booking.rating;

            return (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Main Card - Clickable */}
                <div
                  onClick={() => handleViewDetails(booking._id)}
                  className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex gap-4">
                    {/* Vehicle Image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {vehicleImage ? (
                        <img
                          src={vehicleImage}
                          alt={`${vehicleBrand} ${vehicleModel}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement!.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center">
                                <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Booking Info */}
                    <div className="flex-1 min-w-0">
                      {/* Header with Status */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {vehicleBrand} {vehicleModel}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {vehiclePlate}
                          </p>
                        </div>

                        <StatusBadge status={booking.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">
                            Start: {formatDate(booking.startTime)}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{stationName}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">
                            End: {formatDate(booking.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center font-semibold text-green-600">
                          <CreditCard className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">
                            {booking.amounts?.grandTotal?.toLocaleString() ||
                              "0"}
                            đ
                          </span>
                        </div>
                      </div>

                      {/* Payment Button for Pending */}
                      {isPending && (
                        <button
                          onClick={(e) => handleReturnToPayment(e, booking._id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Complete Payment</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pending Warning */}
                  {isPending && (
                    <div className="mt-3 pt-3 border-t border-yellow-200 bg-yellow-50 -mx-5 -mb-5 px-5 py-3 rounded-b-xl">
                      <div className="flex items-start gap-2 text-xs text-yellow-800">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>
                          <span className="font-semibold">
                            Payment Required:
                          </span>{" "}
                          This booking is waiting for payment completion.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rating Section Below Card (Completed Only) */}
                {isCompleted && (
                  <>
                    {!hasRating && (
                      <div className="border-t border-gray-200 px-5 py-3 bg-gradient-to-r from-yellow-50 to-orange-50">
                        <button
                          onClick={(e) => handleOpenRating(e, booking)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                          <FaStar className="w-4 h-4" />
                          <span>Rate Your Experience</span>
                        </button>
                      </div>
                    )}

                    {hasRating && (
                      <div className="border-t border-gray-200 px-5 py-3 bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= (booking.rating?.score || 0)
                                      ? "text-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                              You rated this booking
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(
                              booking.rating?.submittedAt || ""
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {booking.rating?.comment && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            "{booking.rating.comment}"
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Load More Button */}
        {canLoadMore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center pt-4"
          >
            <button
              onClick={handleLoadMore}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 shadow-lg transition-all"
            >
              <span>Show More Bookings</span>
              <ChevronDown className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {!canLoadMore && bookings.length > 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            You've reached the end of your bookings
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedBookingId && (
        <BookingDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBookingId(null);
          }}
          bookingId={selectedBookingId}
        />
      )}

      {selectedBookingForAction && (
        <>
          <RatingModal
            isOpen={ratingModalOpen}
            onClose={() => {
              setRatingModalOpen(false);
              setSelectedBookingForAction(null);
            }}
            bookingId={selectedBookingForAction._id}
            vehicleName={getVehicleName(selectedBookingForAction)}
            onSuccess={handleActionSuccess}
          />

          <ReportModal
            isOpen={reportModalOpen}
            onClose={() => {
              setReportModalOpen(false);
              setSelectedBookingForAction(null);
            }}
            bookingId={selectedBookingForAction._id}
            vehicleName={getVehicleName(selectedBookingForAction)}
            onSuccess={handleActionSuccess}
          />
        </>
      )}
    </>
  );
};

export default BookingHistoryTab;
