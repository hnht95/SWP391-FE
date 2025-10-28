import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  X,
  Car,
  Calendar,
  MapPin,
  CreditCard,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { createPortal } from "react-dom";
import ConfirmModal from "./ConfirmModal";
import type { Booking } from "../../../../../../../../service/apiBooking/API";
import bookingApi from "../../../../../../../../service/apiBooking/API";

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
}

const BookingDetailModal = ({
  isOpen,
  onClose,
  bookingId,
}: BookingDetailModalProps) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchBookingDetails();
    }
  }, [isOpen, bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bookingApi.getBookingById(bookingId);
      setBooking(data);
    } catch (err) {
      console.error("Failed to fetch booking details:", err);
      setError("Failed to load booking details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showConfirmCancel) onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, showConfirmCancel, onClose]);

  const handleCancelBooking = async () => {
    try {
      setIsCancelling(true);
      await bookingApi.cancelBooking(booking!._id, "Cancelled by user");
      setShowConfirmCancel(false);
      onClose();
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      setShowConfirmCancel(false);
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  // ✅ Get vehicle image
  const getVehicleImage = (): string | null => {
    if (
      booking &&
      typeof booking.vehicle === "object" &&
      booking.vehicle.defaultPhotos
    ) {
      const exteriorPhotos = booking.vehicle.defaultPhotos.exterior;
      if (exteriorPhotos && exteriorPhotos.length > 0) {
        return exteriorPhotos[0].url;
      }
    }
    return null;
  };

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          >
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 py-6 flex items-center justify-between flex-shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative flex items-center space-x-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                  >
                    <Car className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-2xl font-bold text-white"
                    >
                      Booking Details
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-sm text-gray-300"
                    >
                      {booking &&
                        `${booking.vehicle.brand} ${booking.vehicle.model}`}
                    </motion.p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="relative w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center py-20"
                  >
                    <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20"
                  >
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-red-600">{error}</p>
                  </motion.div>
                )}

                {booking && !isLoading && !error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                  >
                    {/* ✅ Vehicle Image + Status Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
                    >
                      {/* Vehicle Image */}
                      {getVehicleImage() ? (
                        <div className="relative h-64 w-full">
                          <img
                            src={getVehicleImage()!}
                            alt={`${booking.vehicle.brand} ${booking.vehicle.model}`}
                            className="w-full h-full object-cover"
                          />
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                          {/* ✅ Status Badge - Larger and positioned on image */}
                          <div className="absolute top-4 right-4">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.4, type: "spring" }}
                              className={`px-6 py-3 rounded-2xl text-base font-bold shadow-2xl backdrop-blur-sm ${bookingApi.getBookingStatusColor(
                                booking.status
                              )}`}
                            >
                              {bookingApi.getBookingStatusLabel(booking.status)}
                            </motion.div>
                          </div>

                          {/* Vehicle info overlay */}
                          <div className="absolute bottom-4 left-4 text-white">
                            <h3 className="text-2xl font-bold">
                              {booking.vehicle.brand} {booking.vehicle.model}
                            </h3>
                            <p className="text-sm text-gray-200">
                              {booking.vehicle.plateNumber}
                            </p>
                          </div>
                        </div>
                      ) : (
                        // Fallback if no image
                        <div className="relative h-64 w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Car className="w-24 h-24 text-gray-400" />
                          <div className="absolute top-4 right-4">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.4, type: "spring" }}
                              className={`px-6 py-3 rounded-2xl text-base font-bold shadow-2xl ${bookingApi.getBookingStatusColor(
                                booking.status
                              )}`}
                            >
                              {bookingApi.getBookingStatusLabel(booking.status)}
                            </motion.div>
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {/* Vehicle Info */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                      <div className="flex items-center space-x-2 mb-4">
                        <Car className="w-5 h-5 text-gray-700" />
                        <h3 className="text-lg font-bold text-gray-900">
                          Vehicle Information
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 font-medium">
                            Price per Day
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {bookingApi.formatCurrency(
                              booking.vehicle.pricePerDay
                            )}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 font-medium">
                            Price per Hour
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {bookingApi.formatCurrency(
                              booking.vehicle.pricePerHour
                            )}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Rental Period */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                      <div className="flex items-center space-x-2 mb-4">
                        <Calendar className="w-5 h-5 text-gray-700" />
                        <h3 className="text-lg font-bold text-gray-900">
                          Rental Period
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 font-medium">
                            Start Time
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {formatDate(booking.startTime)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 font-medium">
                            End Time
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {formatDate(booking.endTime)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 font-medium flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Duration
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {bookingApi.calculateDuration(
                              booking.startTime,
                              booking.endTime
                            )}{" "}
                            days
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 font-medium">
                            Created At
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {formatDate(booking.createdAt)}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Station Info */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                      <div className="flex items-center space-x-2 mb-4">
                        <MapPin className="w-5 h-5 text-gray-700" />
                        <h3 className="text-lg font-bold text-gray-900">
                          Pickup Station
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <p className="text-base font-semibold text-gray-900">
                          {booking.station.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.station.location.address}
                        </p>
                      </div>
                    </motion.div>

                    {/* ✅ Payment Info - Green theme */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-sm border border-green-100"
                    >
                      <div className="flex items-center space-x-2 mb-6">
                        <CreditCard className="w-5 h-5 text-green-700" />
                        <h3 className="text-lg font-bold text-green-900">
                          Payment Information
                        </h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-green-700">
                            Estimated Rental
                          </span>
                          <span className="font-semibold text-green-900">
                            {bookingApi.formatCurrency(
                              booking.amounts.rentalEstimated || 0
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-green-700">Deposit Amount</span>
                          <span className="font-semibold text-green-900">
                            {bookingApi.formatCurrency(booking.deposit.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-green-700">Deposit Status</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${bookingApi.getDepositStatusColor(
                              booking.deposit.status
                            )}`}
                          >
                            {booking.deposit.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="border-t border-green-200 pt-4 mt-4">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-lg font-bold text-green-900">
                              Grand Total
                            </span>
                            <span className="text-2xl font-bold text-green-900">
                              {bookingApi.formatCurrency(
                                booking.amounts.grandTotal
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center bg-green-500 px-4 py-3 rounded-xl">
                            <span className="text-white flex items-center font-medium">
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Total Paid
                            </span>
                            <span className="text-white font-bold text-lg">
                              {bookingApi.formatCurrency(
                                booking.amounts.totalPaid
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white px-8 py-6 flex justify-end space-x-3 border-t border-gray-200 flex-shrink-0"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </motion.button>
                {booking && booking.status === "reserved" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowConfirmCancel(true)}
                    className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                  >
                    Cancel Booking
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {createPortal(
        modalContent,
        document.getElementById("modal-root") || document.body
      )}

      <ConfirmModal
        isOpen={showConfirmCancel}
        onClose={() => setShowConfirmCancel(false)}
        onConfirm={handleCancelBooking}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
        isLoading={isCancelling}
      />
    </>
  );
};

export default BookingDetailModal;
