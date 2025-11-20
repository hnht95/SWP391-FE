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
import BookingDetailModal from "./bookingComponent/BookingDetailModal";
import userBookingApi from "../../../../../../../service/apiUser/booking/API";
import type {
  Booking,
  BookingQueryParams,
  BookingStatus,
} from "../../../../../../../service/apiUser/booking/API";
import { getVehicleById } from "../../../../../../../service/apiAdmin/apiVehicles/API";

// Global cache to avoid duplicate fetches
const vehicleImageCache = new Map<string, string | null>();

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

const BookingHistoryTab = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicleImages, setVehicleImages] = useState<
    Record<string, string | null>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true);

  // Pagination & Filter states
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [displayCount, setDisplayCount] = useState(8);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch vehicle thumbnail with caching
  const fetchVehicleThumbnail = useCallback(
    async (vehicleId: string): Promise<string | null> => {
      if (vehicleImageCache.has(vehicleId)) {
        return vehicleImageCache.get(vehicleId)!;
      }

      try {
        const vehicle = await getVehicleById(vehicleId);

        const firstPhoto = vehicle.defaultPhotos?.exterior?.[0];

        const imageUrl =
          typeof firstPhoto === "string"
            ? firstPhoto
            : firstPhoto &&
              typeof firstPhoto === "object" &&
              "url" in firstPhoto
            ? (firstPhoto.url as string)
            : null;

        vehicleImageCache.set(vehicleId, imageUrl);
        return imageUrl;
      } catch (err) {
        console.error(`Failed to fetch vehicle ${vehicleId}:`, err);
        vehicleImageCache.set(vehicleId, null);
        return null;
      }
    },
    []
  );

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const params: BookingQueryParams = {
          limit: 100,
          sortBy: "createdAt",
          sortOrder: "desc",
        };

        // ✅ Add status filter if not "all"
        if (statusFilter !== "all") {
          params.status = statusFilter as BookingStatus;
        }

        const response = await userBookingApi.getUserBookings(params);

        console.log("📦 Bookings response:", response);

        if (response.success && response.items) {
          response.items.forEach((booking, index) => {
            console.log(`Booking ${index}:`, {
              _id: booking._id,
              vehicle:
                typeof booking.vehicle === "string"
                  ? booking.vehicle
                  : booking.vehicle?._id,
              station:
                typeof booking.station === "string"
                  ? booking.station
                  : booking.station?._id,
              hasVehicle: !!booking.vehicle,
              hasStation: !!booking.station,
            });
          });

          setBookings(response.items);
          setTotalCount(response.items.length);

          // Fetch vehicle images in parallel
          setLoadingImages(true);

          const uniqueVehicleIds = [
            ...new Set(
              response.items
                .map((booking) => {
                  if (!booking.vehicle) {
                    console.warn("⚠️ Booking missing vehicle:", booking._id);
                    return null;
                  }
                  if (typeof booking.vehicle === "string") {
                    return booking.vehicle;
                  }
                  return booking.vehicle?._id;
                })
                .filter(Boolean)
            ),
          ] as string[];

          console.log("🚗 Unique vehicle IDs:", uniqueVehicleIds);

          if (uniqueVehicleIds.length > 0) {
            const imagePromises = uniqueVehicleIds.map(async (vehicleId) => {
              const imageUrl = await fetchVehicleThumbnail(vehicleId);
              return { vehicleId, imageUrl };
            });

            const results = await Promise.all(imagePromises);

            const imagesMap: Record<string, string | null> = {};
            results.forEach(({ vehicleId, imageUrl }) => {
              imagesMap[vehicleId] = imageUrl;
            });

            console.log("🖼️ Vehicle images map:", imagesMap);

            setVehicleImages(imagesMap);
          }

          setLoadingImages(false);
        } else {
          console.error("❌ Invalid response format:", response);
          setError("Invalid response format from server");
        }
      } catch (err) {
        console.error("❌ Failed to fetch bookings:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load booking history";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [fetchVehicleThumbnail, statusFilter]);

  // Reset display count when filter changes
  useEffect(() => {
    setDisplayCount(8);
  }, [statusFilter]);

  // Handle payment page navigation
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

  // Get current filter label
  const currentFilterLabel =
    STATUS_OPTIONS.find((opt) => opt.value === statusFilter)?.label ||
    "All Bookings";

  // Get bookings to display (limited by displayCount)
  const displayedBookings = bookings.slice(0, displayCount);
  const canLoadMore = displayCount < totalCount;

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
        {/* Filter Section - Dropdown */}
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

            {/* Dropdown */}
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

        {/* Loading state for images */}
        {loadingImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3"
          >
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <p className="text-sm text-blue-700">Loading vehicle images...</p>
          </motion.div>
        )}

        {/* Empty State */}
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
            if (!booking.vehicle) {
              console.warn("⚠️ Skipping booking without vehicle:", booking._id);
              return null;
            }

            const vehicleId =
              typeof booking.vehicle === "string"
                ? booking.vehicle
                : booking.vehicle?._id || "";

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

            const vehicleImage = vehicleImages[vehicleId];
            const imageLoading = loadingImages && !vehicleImage;
            const isPending = booking.status === "pending";

            return (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                onClick={() => handleViewDetails(booking._id)}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex gap-4">
                  {/* Vehicle Image */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                    {imageLoading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                      </div>
                    ) : vehicleImage ? (
                      <motion.img
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        src={vehicleImage}
                        alt={`${vehicleBrand} ${vehicleModel}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center">
                                <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                                </svg>
                              </div>
                            `;
                          }
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
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {vehicleBrand} {vehicleModel}
                        </h3>
                        <p className="text-sm text-gray-600">{vehiclePlate}</p>
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
                          {booking.amounts?.grandTotal?.toLocaleString() || "0"}
                          đ
                        </span>
                      </div>
                    </div>

                    {/* Payment Button for Pending */}
                    {isPending && (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => handleReturnToPayment(e, booking._id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Complete Payment</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Pending Payment Warning */}
                {isPending && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 pt-3 border-t border-yellow-200 bg-yellow-50 -mx-5 -mb-5 px-5 py-3 rounded-b-xl"
                  >
                    <div className="flex items-start gap-2 text-xs text-yellow-800">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>
                        <span className="font-semibold">Payment Required:</span>{" "}
                        This booking is waiting for payment completion. Click
                        the button above to proceed with payment.
                      </p>
                    </div>
                  </motion.div>
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLoadMore}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 shadow-lg transition-all"
            >
              <span>Show More Bookings</span>
              <ChevronDown className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {/* End message */}
        {!canLoadMore && bookings.length > 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            You've reached the end of your bookings
          </div>
        )}
      </div>

      {/* Detail Modal */}
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
    </>
  );
};

export default BookingHistoryTab;
