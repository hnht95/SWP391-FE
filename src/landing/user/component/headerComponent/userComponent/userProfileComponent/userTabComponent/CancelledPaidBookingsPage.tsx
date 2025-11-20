// src/landing/user/component/headerComponent/userComponent/userProfileComponent/userTabComponent/bookingComponent/CancelledPaidBookingsPage.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  Car,
  Calendar,
  MapPin,
  CreditCard,
  Clock,
  XCircle,
  MessageSquare,
} from "lucide-react";
import profileApi, {
  type Paginated,
  type CancelledPaidItem,
} from "../../../../../../../service/apiUser/profile/API";

// ✅ Define proper types based on API response
interface VehicleInCancelled {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  pricePerDay: number;
  pricePerHour: number;
  status: string;
  image?: string; // Direct image URL
}

interface StationInCancelled {
  _id: string;
  name: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
}

interface DepositInCancelled {
  status: string;
  amount: number;
  currency: string;
  provider: string;
}

interface AmountsInCancelled {
  totalPaid: number;
  rentalEstimated: number;
  rentalActual: number;
}

interface ExtendedCancelledItem
  extends Omit<
    CancelledPaidItem,
    "vehicle" | "station" | "deposit" | "amounts"
  > {
  vehicle: VehicleInCancelled;
  station: StationInCancelled;
  deposit: DepositInCancelled;
  amounts: AmountsInCancelled;
  paid?: number;
  cancellationReason?: string;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatCurrency = (amount?: number): string => {
  if (typeof amount !== "number") return "0đ";
  return `${amount.toLocaleString()}đ`;
};

export default function CancelledPaidBookingsPage() {
  const [data, setData] = useState<Paginated<CancelledPaidItem> | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await profileApi.getMyCancelledPaidBookings({
          page,
          limit,
        });
        if (mounted) setData(res);
      } catch (e: unknown) {
        if (mounted) {
          const errorMessage =
            e instanceof Error
              ? e.message
              : "Failed to load cancelled paid bookings";
          setError(errorMessage);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page, limit]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500">Loading cancelled bookings...</p>
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

  const items = data?.items || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-2">
          <XCircle className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-gray-900">Cancelled Bookings</h3>
        </div>
        <p className="text-sm text-gray-600">
          Your cancelled bookings with completed payments/refunds
        </p>
        {items.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{items.length}</span> of{" "}
              <span className="font-semibold">{data?.total || 0}</span>{" "}
              cancelled bookings
            </p>
          </div>
        )}
      </motion.div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Car className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No cancelled bookings</p>
          <p className="text-sm text-gray-400 mt-2">
            Your cancelled booking history will appear here
          </p>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {items.map((booking, index) => {
          // ✅ Type cast to extended type
          const extendedBooking = booking as unknown as ExtendedCancelledItem;

          const vehicleImage = extendedBooking.vehicle?.image || null;
          const vehicleBrand = extendedBooking.vehicle?.brand || "Unknown";
          const vehicleModel = extendedBooking.vehicle?.model || "Vehicle";
          const vehiclePlate = extendedBooking.vehicle?.plateNumber || "N/A";
          const stationName = extendedBooking.station?.name || "N/A";
          const cancellationReason = extendedBooking.cancellationReason;

          return (
            <motion.div
              key={extendedBooking.bookingId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all"
            >
              <div className="flex gap-4">
                {/* Vehicle Image */}
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                  {vehicleImage ? (
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
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border bg-red-100 text-red-700 border-red-200">
                      Cancelled
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        Start: {formatDate(extendedBooking.startTime)}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{stationName}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        End: {formatDate(extendedBooking.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center font-semibold text-green-600">
                      <CreditCard className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {formatCurrency(
                          extendedBooking.amounts?.rentalEstimated
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Payment & Deposit Info */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {extendedBooking.deposit?.status && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                        Deposit: {extendedBooking.deposit.status}
                      </span>
                    )}
                    {extendedBooking.amounts?.totalPaid > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                        Paid:{" "}
                        {formatCurrency(extendedBooking.amounts.totalPaid)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Cancellation Info */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 pt-3 border-t border-red-200 bg-red-50 -mx-5 -mb-5 px-5 py-3 rounded-b-xl"
              >
                <div className="flex items-start gap-2 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="mb-1">
                      <span className="font-semibold">Booking Cancelled:</span>{" "}
                      This booking has been cancelled and the payment/refund has
                      been processed.
                    </p>
                    {cancellationReason && (
                      <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-red-200">
                        <MessageSquare className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700">
                          <span className="font-semibold">Reason:</span>{" "}
                          {cancellationReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 pt-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              page === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-gray-800 shadow-md"
            }`}
          >
            Previous
          </motion.button>

          <span className="text-sm text-gray-600 font-medium">
            Page {page} of {data.totalPages}
          </span>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              page >= data.totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-gray-800 shadow-md"
            }`}
          >
            Next
          </motion.button>
        </motion.div>
      )}

      {/* End message */}
      {items.length > 0 && (!data || data.totalPages <= 1) && (
        <div className="text-center py-8 text-gray-400 text-sm">
          You've reached the end
        </div>
      )}
    </div>
  );
}
