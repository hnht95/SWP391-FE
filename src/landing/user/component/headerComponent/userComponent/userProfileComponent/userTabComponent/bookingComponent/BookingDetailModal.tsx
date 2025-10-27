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
} from "lucide-react";
import { createPortal } from "react-dom";
// import bookingApi, { Booking } from '../../../service/apiBooking/API';
import ConfirmModal from "./ConfirmModal"; // ✅ Import confirmation modal
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

  // ✅ Confirmation modal state
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

  // ✅ Handle cancel booking with confirmation
  const handleCancelBooking = async () => {
    try {
      setIsCancelling(true);
      await bookingApi.cancelBooking(booking!._id, "Cancelled by user");
      setShowConfirmCancel(false);
      onClose();
      // Show success message (you can use toast notification here)
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      setShowConfirmCancel(false);
      // Show error message
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* ✅ Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            {/* ✅ Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* ✅ Header */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <Car className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">
                    Booking Details
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* ✅ Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoading && (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                  </div>
                )}

                {error && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-red-600">{error}</p>
                  </div>
                )}

                {booking && !isLoading && !error && (
                  <div className="space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Booking ID</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {booking._id}
                        </p>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-full text-sm font-medium ${bookingApi.getBookingStatusColor(
                          booking.status
                        )}`}
                      >
                        {bookingApi.getBookingStatusLabel(booking.status)}
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Car className="w-5 h-5 mr-2" />
                        Vehicle Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Brand & Model</p>
                          <p className="text-base font-semibold text-gray-900">
                            {booking.vehicle.brand} {booking.vehicle.model}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Plate Number</p>
                          <p className="text-base font-semibold text-gray-900">
                            {booking.vehicle.plateNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Price per Day</p>
                          <p className="text-base font-semibold text-gray-900">
                            {bookingApi.formatCurrency(
                              booking.vehicle.pricePerDay
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Price per Hour
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {bookingApi.formatCurrency(
                              booking.vehicle.pricePerHour
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Rental Period */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Rental Period
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Start Time</p>
                          <p className="text-base font-semibold text-gray-900">
                            {formatDate(booking.startTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">End Time</p>
                          <p className="text-base font-semibold text-gray-900">
                            {formatDate(booking.endTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="text-base font-semibold text-gray-900">
                            {bookingApi.calculateDuration(
                              booking.startTime,
                              booking.endTime
                            )}{" "}
                            days
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Created At</p>
                          <p className="text-base font-semibold text-gray-900">
                            {formatDate(booking.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Station Info */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        Pickup Station
                      </h3>
                      <div>
                        <p className="text-base font-semibold text-gray-900 mb-2">
                          {booking.station.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.station.location.address}
                        </p>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Payment Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            Estimated Rental
                          </span>
                          <span className="font-semibold text-gray-900">
                            {bookingApi.formatCurrency(
                              booking.amounts.rentalEstimated || 0
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Deposit Amount</span>
                          <span className="font-semibold text-gray-900">
                            {bookingApi.formatCurrency(booking.deposit.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Deposit Status</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${bookingApi.getDepositStatusColor(
                              booking.deposit.status
                            )}`}
                          >
                            {booking.deposit.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="border-t border-gray-300 pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">
                              Grand Total
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                              {bookingApi.formatCurrency(
                                booking.amounts.grandTotal
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-green-600">Total Paid</span>
                            <span className="text-green-600 font-semibold">
                              {bookingApi.formatCurrency(
                                booking.amounts.totalPaid
                              )}
                            </span>
                          </div>
                        </div>

                        {booking.deposit.payos &&
                          booking.deposit.payos.paidAt && (
                            <div className="mt-4 pt-4 border-t border-gray-300">
                              <p className="text-sm font-semibold text-gray-700 mb-2">
                                PayOS Details
                              </p>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500">
                                    Order Code:
                                  </span>
                                  <p className="font-medium text-gray-900">
                                    {booking.deposit.payos.orderCode}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Paid At:
                                  </span>
                                  <p className="font-medium text-gray-900">
                                    {formatDate(booking.deposit.payos.paidAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ✅ Footer - Fixed at bottom */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                {booking && booking.status === "reserved" && (
                  <button
                    onClick={() => setShowConfirmCancel(true)}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
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

      {/* ✅ Confirmation Modal */}
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
