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
  Battery,
} from "lucide-react";
import { createPortal } from "react-dom";
import ConfirmModal from "./ConfirmModal";
import type { Booking } from "../../../../../../../../service/apiBooking/API";
import bookingApi from "../../../../../../../../service/apiBooking/API";
import { getVehicleById } from "../../../../../../../../service/apiAdmin/apiVehicles/API";
import ContractModal from "./ContractModal";
import ExtendBookingModal from "./ExtendBookingModal";
import ExtendPaymentModal from "./ExtendPaymentModal";

type BookingDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
};

type VehicleDetails = {
  defaultPhotos?: {
    exterior?: Array<{ url: string }>;
    interior?: Array<{ url: string }>;
  };
  batteryCapacity?: number;
  mileage?: number;
  color?: string;
  year?: number;
};

// Kiểu dữ liệu cho modal thanh toán gia hạn
type ExtendPaymentData = {
  bookingId: string;
  status:
    | "reserved"
    | "active"
    | "returning"
    | "completed"
    | "cancelled"
    | "expired";
  endTime: string;
  feeEstimated: number;
  pricingSnapshot?: {
    baseMode?: "day+hour" | string;
    days?: number;
    hours?: number;
    unitPriceDay?: number;
    unitPriceHour?: number;
    baseUnit?: string;
    basePrice?: number;
  };
  payment?: {
    provider: string;
    type: "extension";
    orderCode: number;
    checkoutUrl: string;
    qrCode: string;
  };
};

const BookingDetailModal = ({
  isOpen,
  onClose,
  bookingId,
}: BookingDetailModalProps) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Cancel
  const [showConfirmCancel, setShowConfirmCancel] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Return
  const [showConfirmReturn, setShowConfirmReturn] = useState<boolean>(false);

  // Child modals
  const [openContract, setOpenContract] = useState<boolean>(false);
  const [openExtend, setOpenExtend] = useState<boolean>(false);

  // Payment modal for extension
  const [openPay, setOpenPay] = useState<boolean>(false);
  const [extendData, setExtendData] = useState<ExtendPaymentData | null>(null);

  const canExtend = useMemo(
    () =>
      !!booking &&
      (booking.status === "active" || booking.status === "reserved"),
    [booking]
  );

  const fetchBookingDetails = useCallback(async () => {
    if (!isOpen || !bookingId) return;
    try {
      setIsLoading(true);
      setError("");
      const bookingData = await bookingApi.getBookingById(bookingId);
      setBooking(bookingData);

      const vehId =
        typeof bookingData.vehicle === "object"
          ? bookingData.vehicle._id
          : String(bookingData.vehicle);

      if (vehId) {
        try {
          const v = await getVehicleById(vehId);
          setVehicleDetails({
            defaultPhotos: v.defaultPhotos,
            batteryCapacity: v.batteryCapacity,
            mileage: v.mileage,
            color: v.color,
            year: v.year,
          });
        } catch {
          // ignore
        }
      }
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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        !showConfirmCancel &&
        !openContract &&
        !openExtend &&
        !showConfirmReturn
      ) {
        onClose();
      }
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [
    isOpen,
    showConfirmCancel,
    openContract,
    openExtend,
    showConfirmReturn,
    onClose,
  ]);

  const handleCancelBooking = async () => {
    if (!booking) return;
    try {
      setIsCancelling(true);
      await bookingApi.cancelBooking(booking._id, "Cancelled by user");
      setShowConfirmCancel(false);
      onClose();
    } catch {
      setShowConfirmCancel(false);
    } finally {
      setIsCancelling(false);
    }
  };

  // Nhận data từ ExtendBookingModal sau khi gọi API extend
  const handleExtendedCreated = (payload: {
    additionalCharge: number;
    newEndTime: string;
    // Cho phép truyền thêm raw để build modal thanh toán
    raw?: {
      bookingId?: string;
      orderCode?: number;
      checkoutUrl?: string;
      qrCode?: string;
      pricing?: {
        days?: number;
        hours?: number;
        unitPriceDay?: number;
        unitPriceHour?: number;
      };
    };
  }) => {
    const bid = payload.raw?.bookingId || bookingId;
    const ext: ExtendPaymentData = {
      bookingId: bid,
      status: booking?.status || "reserved",
      endTime: payload.newEndTime,
      feeEstimated: payload.additionalCharge,
      pricingSnapshot: {
        days: payload.raw?.pricing?.days,
        hours: payload.raw?.pricing?.hours,
        unitPriceDay: payload.raw?.pricing?.unitPriceDay,
        unitPriceHour: payload.raw?.pricing?.unitPriceHour,
      },
      payment: {
        provider: "payos",
        type: "extension",
        orderCode: payload.raw?.orderCode || 0,
        checkoutUrl: payload.raw?.checkoutUrl || "",
        qrCode: payload.raw?.qrCode || "",
      },
    };
    setExtendData(ext);
    setOpenPay(true);
  };

  const formatDate = (dateString: string): string =>
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));

  const vehicleImage = useMemo<string | null>(() => {
    const url = vehicleDetails?.defaultPhotos?.exterior?.[0]?.url;
    return url || null;
  }, [vehicleDetails]);

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
                      {booking
                        ? `${booking.vehicle.brand} ${booking.vehicle.model}`
                        : ""}
                    </motion.p>
                  </div>
                </div>

                {/* Only close on header */}
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

                {booking && !isLoading && !error && (
                  <div className="space-y-6">
                    {/* Hero */}
                    <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                      {vehicleImage ? (
                        <div className="relative h-64 w-full">
                          <img
                            src={vehicleImage}
                            alt={`${booking.vehicle.brand} ${booking.vehicle.model}`}
                            className="w-full h-full object-cover"
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
                        {vehicleDetails?.year ? (
                          <Info
                            label="Year"
                            value={String(vehicleDetails.year)}
                          />
                        ) : null}
                        {vehicleDetails?.color ? (
                          <Info label="Color" value={vehicleDetails.color} />
                        ) : null}
                        {typeof vehicleDetails?.batteryCapacity === "number" ? (
                          <Info
                            label="Battery"
                            value={`${vehicleDetails.batteryCapacity}%`}
                            icon={<Battery className="w-3 h-3 mr-1" />}
                          />
                        ) : null}
                        {typeof vehicleDetails?.mileage === "number" ? (
                          <Info
                            label="Mileage"
                            value={`${vehicleDetails.mileage.toLocaleString()} km`}
                          />
                        ) : null}
                      </div>
                    </div>

                    {/* Period */}
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
                        <Info
                          label="Duration"
                          value={`${bookingApi.calculateDuration(
                            booking.startTime,
                            booking.endTime
                          )} days`}
                          icon={<Clock className="w-3 h-3 mr-1" />}
                        />
                        <Info
                          label="Created At"
                          value={formatDate(booking.createdAt)}
                        />
                      </div>
                    </div>

                    {/* Station */}
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    View Contract
                  </button>
                )}

                {/* Extend */}
                {canExtend && (
                  <button
                    onClick={() => setOpenExtend(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Extend
                  </button>
                )}

                {/* Cancel Booking when reserved */}
                {booking?.status === "reserved" && (
                  <button
                    onClick={() => setShowConfirmCancel(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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

          <ExtendBookingModal
            isOpen={openExtend}
            onClose={() => setOpenExtend(false)}
            bookingId={bookingId}
            onExtended={(info) => {
              // info: { additionalCharge, newEndTime, ...optional raw}
              handleExtendedCreated({
                additionalCharge: info.additionalCharge,
                newEndTime: info.newEndTime,
                raw: info.raw,
              });
            }}
          />

          <ExtendPaymentModal
            isOpen={openPay}
            onClose={() => setOpenPay(false)}
            extendResult={extendData}
            onPaid={async () => {
              await fetchBookingDetails();
            }}
          />
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
