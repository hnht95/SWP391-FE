/* eslint-disable react-hooks/exhaustive-deps */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, useCallback } from "react";
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
  Info as InfoIcon,
} from "lucide-react";
import { createPortal } from "react-dom";
import ConfirmModal from "./ConfirmModal";
import type {
  Booking,
  DepositStatus,
} from "../../../../../../../../service/apiUser/booking/API";
import bookingApi from "../../../../../../../../service/apiUser/booking/API";
import ContractModal from "./ContractModal";
// import ExtendBookingModal from "./ExtendBookingModal";

type BookingDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
};

// ✅ Helper function to get vehicle image URL from booking
const getVehicleImageUrl = (booking: Booking | null): string | null => {
  if (!booking?.vehicle || typeof booking.vehicle === "string") {
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

const BookingDetailModal = ({
  isOpen,
  onClose,
  bookingId,
}: BookingDetailModalProps) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [cancelError, setCancelError] = useState<string>("");

  // Cancel
  const [showConfirmCancel, setShowConfirmCancel] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Child modals
  const [openContract, setOpenContract] = useState<boolean>(false);
  // const [openExtend, setOpenExtend] = useState<boolean>(false);

  // // ✅ Check if booking can be extended
  // const canExtend = useMemo(
  //   () =>
  //     !!booking &&
  //     (booking.status === "active" || booking.status === "reserved"),
  //   [booking]
  // );

  // ✅ Check if booking can be cancelled (before start time)
  const canCancel = useMemo(() => {
    if (!booking || booking.status !== "reserved") return false;

    const now = new Date();
    const startTime = new Date(booking.startTime);

    return now < startTime;
  }, [booking]);

  // ✅ Calculate time until start
  const timeUntilStart = useMemo(() => {
    if (!booking) return null;

    const now = new Date();
    const startTime = new Date(booking.startTime);
    const diffMs = startTime.getTime() - now.getTime();

    if (diffMs < 0) return null;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? "s" : ""} until start`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m until start`;
    }

    return `${minutes} minute${minutes > 1 ? "s" : ""} until start`;
  }, [booking]);

  // ✅ Calculate duration with days + hours breakdown
  const bookingDuration = useMemo(() => {
    if (!booking) return { display: "N/A", days: 0, hours: 0 };

    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    const diffMs = end.getTime() - start.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);

    const days = Math.floor(totalHours / 24);
    const hours = Math.ceil(totalHours % 24);

    let display = "";
    if (days > 0) {
      display += `${days} day${days > 1 ? "s" : ""}`;
    }
    if (hours > 0) {
      display +=
        days > 0 ? ` ${hours}h` : `${hours} hour${hours > 1 ? "s" : ""}`;
    }
    if (days === 0 && hours === 0) {
      display = "Less than 1 hour";
    }

    return { display, days, hours };
  }, [booking]);

  // ✅ Get vehicle image URL directly from booking
  const vehicleImage = useMemo<string | null>(() => {
    return getVehicleImageUrl(booking);
  }, [booking]);

  const fetchBookingDetails = useCallback(async () => {
    if (!isOpen || !bookingId) return;
    try {
      setIsLoading(true);
      setError("");
      setCancelError("");
      const bookingData = await bookingApi.getBookingById(bookingId);
      setBooking(bookingData);
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Failed to load booking details"
      );
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, bookingId]);

  useEffect(() => {
    fetchBookingDetails();
  }, [fetchBookingDetails]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // useEffect(() => {
  //   const handleEsc = (e: KeyboardEvent) => {
  //     if (
  //       e.key === "Escape" &&
  //       !showConfirmCancel &&
  //       !openContract &&
  //       !openExtend
  //     ) {
  //       onClose();
  //     }
  //   };
  //   if (isOpen) window.addEventListener("keydown", handleEsc);
  //   return () => window.removeEventListener("keydown", handleEsc);
  // }, [isOpen, showConfirmCancel, openContract, openExtend, onClose]);

  const handleCancelBooking = async () => {
    if (!booking) return;

    if (!canCancel) {
      setCancelError("Cannot cancel booking after start time has passed");
      setShowConfirmCancel(false);
      return;
    }

    try {
      setIsCancelling(true);
      setCancelError("");
      await bookingApi.cancelBooking(booking._id, "Cancelled by user");
      setShowConfirmCancel(false);
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to cancel booking";
      setCancelError(errorMessage);
      setShowConfirmCancel(false);
    } finally {
      setIsCancelling(false);
    }
  };

  // const handleExtendedCreated = () => {
  //   // Extension will navigate to payment page, just close modal
  //   onClose();
  // };

  const formatDate = (dateString: string): string =>
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));

  const content = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 py-6 flex items-center justify-between flex-shrink-0">
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
                      {booking && typeof booking.vehicle === "object"
                        ? `${booking.vehicle.brand} ${booking.vehicle.model}`
                        : ""}
                    </motion.p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                {isLoading && (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                  </div>
                )}

                {!!error && !isLoading && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-red-600">{error}</p>
                  </div>
                )}

                {/* ✅ Cancel Error Alert */}
                {!!cancelError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-800 mb-1">
                        Cannot Cancel Booking
                      </p>
                      <p className="text-sm text-red-600">{cancelError}</p>
                    </div>
                  </motion.div>
                )}

                {booking && !isLoading && !error && (
                  <div className="space-y-6">
                    {/* ✅ Warning if can't cancel */}
                    {booking.status === "reserved" && !canCancel && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3"
                      >
                        <InfoIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-amber-800 mb-1">
                            Cancellation Not Available
                          </p>
                          <p className="text-sm text-amber-700">
                            This booking has already started and cannot be
                            cancelled.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* ✅ Time until start info */}
                    {booking.status === "reserved" && timeUntilStart && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3"
                      >
                        <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-blue-800 mb-1">
                            Booking Starts Soon
                          </p>
                          <p className="text-sm text-blue-700">
                            {timeUntilStart}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Hero */}
                    <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                      {vehicleImage && typeof booking.vehicle === "object" ? (
                        <div className="relative h-64 w-full">
                          <img
                            src={vehicleImage}
                            alt={`${booking.vehicle.brand} ${booking.vehicle.model}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.parentElement!.innerHTML = `
                                <div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                  <svg class="w-24 h-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                </div>
                              `;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          <div className="absolute top-4 right-4">
                            <div
                              className={`px-6 py-3 rounded-2xl text-base font-bold shadow-2xl backdrop-blur-sm ${bookingApi.getBookingStatusColor(
                                booking.status
                              )}`}
                            >
                              {bookingApi.getBookingStatusLabel(booking.status)}
                            </div>
                          </div>
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
                        <div className="relative h-64 w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Car className="w-24 h-24 text-gray-400" />
                          <div className="absolute top-4 right-4">
                            <div
                              className={`px-6 py-3 rounded-2xl text-base font-bold shadow-2xl ${bookingApi.getBookingStatusColor(
                                booking.status
                              )}`}
                            >
                              {bookingApi.getBookingStatusLabel(booking.status)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Vehicle info */}
                    {typeof booking.vehicle === "object" && (
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-2 mb-4">
                          <Car className="w-5 h-5 text-gray-700" />
                          <h3 className="text-lg font-bold text-gray-900">
                            Vehicle Information
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <Info
                            label="Price per Day"
                            value={bookingApi.formatCurrency(
                              booking.vehicle.pricePerDay
                            )}
                          />
                          <Info
                            label="Price per Hour"
                            value={bookingApi.formatCurrency(
                              booking.vehicle.pricePerHour
                            )}
                          />
                          {booking.vehicle.year && (
                            <Info
                              label="Year"
                              value={String(booking.vehicle.year)}
                            />
                          )}
                          {booking.vehicle.color && (
                            <Info label="Color" value={booking.vehicle.color} />
                          )}
                        </div>
                      </div>
                    )}

                    {/* ✅ Period with detailed duration */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-2 mb-4">
                        <Calendar className="w-5 h-5 text-gray-700" />
                        <h3 className="text-lg font-bold text-gray-900">
                          Rental Period
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Info
                          label="Start Time"
                          value={formatDate(booking.startTime)}
                        />
                        <Info
                          label="End Time"
                          value={formatDate(booking.endTime)}
                        />

                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 font-medium flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Duration
                          </p>

                          {(bookingDuration.days > 0 ||
                            bookingDuration.hours > 0) && (
                            <div className="text-base font-semibold text-gray-900 mt-1">
                              {bookingDuration.days > 0 &&
                                `${bookingDuration.days} day${
                                  bookingDuration.days > 1 ? "s" : ""
                                }`}
                              {bookingDuration.days > 0 &&
                                bookingDuration.hours > 0 &&
                                " + "}
                              {bookingDuration.hours > 0 &&
                                `${bookingDuration.hours} hour${
                                  bookingDuration.hours > 1 ? "s" : ""
                                }`}
                            </div>
                          )}
                        </div>
                        <Info
                          label="Created At"
                          value={formatDate(booking.createdAt)}
                        />
                      </div>
                    </div>

                    {/* Station */}
                    {typeof booking.station === "object" && (
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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
                      </div>
                    )}

                    {/* Payment */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-sm border border-green-100">
                      <div className="flex items-center space-x-2 mb-6">
                        <CreditCard className="w-5 h-5 text-green-700" />
                        <h3 className="text-lg font-bold text-green-900">
                          Payment Information
                        </h3>
                      </div>
                      <div className="space-y-4">
                        <Row
                          label="Deposit Amount"
                          value={bookingApi.formatCurrency(
                            booking.deposit.amount
                          )}
                        />
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-green-700">Deposit Status</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${bookingApi.getDepositStatusColor(
                              booking.deposit.status as DepositStatus
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
                    </div>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className="bg-white px-8 py-6 flex flex-wrap justify-end gap-3 border-t border-gray-200 flex-shrink-0">
                {/* View Contract */}
                {(booking?.status === "active" ||
                  booking?.status === "returning" ||
                  booking?.status === "completed") && (
                  <button
                    type="button"
                    onClick={() => setOpenContract(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Contract
                  </button>
                )}

                {/* Extend */}
                {/* {canExtend && (
                  <button
                    onClick={() => setOpenExtend(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Extend
                  </button>
                )} */}

                {/* ✅ Cancel Booking - Only when reserved AND before start time */}
                {canCancel && (
                  <button
                    onClick={() => setShowConfirmCancel(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Child modals */}
          <ContractModal
            isOpen={openContract}
            onClose={() => setOpenContract(false)}
            bookingId={bookingId}
          />
          {/* 
          <ExtendBookingModal
            isOpen={openExtend}
            onClose={() => setOpenExtend(false)}
            bookingId={bookingId}
            onExtended={handleExtendedCreated}
          /> */}
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {createPortal(
        content,
        document.getElementById("modal-root") || document.body
      )}

      {/* Confirm cancel */}
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

function Info({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 font-medium flex items-center">
        {icon}
        {label}
      </p>
      <p className="text-base font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-green-700">{label}</span>
      <span className="font-semibold text-green-900">{value}</span>
    </div>
  );
}
