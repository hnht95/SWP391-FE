import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Clock, Calendar, AlertCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import bookingApi from "../../../../../../../../service/apiUser/booking/API";
import type { Booking } from "../../../../../../../../service/apiUser/booking/API";
import { DateTimePicker } from "../../../../../../../../components/DateTimePicker";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onExtended?: (info: {
    additionalCharge: number;
    newEndTime: string;
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
  }) => void;
};

export default function ExtendBookingModal({
  isOpen,
  onClose,
  bookingId,
  onExtended,
}: Props) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [fetchingBooking, setFetchingBooking] = useState<boolean>(false);

  const [newEndDate, setNewEndDate] = useState<string>("");
  const [newEndTime, setNewEndTime] = useState<string>("10:00");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // ✅ Fetch booking details when modal opens
  useEffect(() => {
    if (isOpen && bookingId) {
      const fetchBooking = async () => {
        try {
          setFetchingBooking(true);
          setError("");
          const data = await bookingApi.getBookingById(bookingId);
          setBooking(data);

          // Set default new end date to current end date
          const currentEnd = new Date(data.endTime);
          setNewEndDate(currentEnd.toISOString().split("T")[0]);
          setNewEndTime(currentEnd.toTimeString().slice(0, 5) || "10:00");
        } catch (e: unknown) {
          setError(
            e instanceof Error ? e.message : "Failed to load booking details"
          );
        } finally {
          setFetchingBooking(false);
        }
      };
      fetchBooking();
    }
  }, [isOpen, bookingId]);

  // ✅ Calculate extension details
  const extensionDetails = useMemo(() => {
    if (!booking || !newEndDate) {
      return {
        isValid: false,
        addDays: 0,
        addHours: 0,
        estimatedCost: 0,
        newEndDateTime: "",
      };
    }

    const currentEnd = new Date(booking.endTime);
    const proposedEnd = new Date(`${newEndDate}T${newEndTime}`);

    // Check if new end is after current end
    if (proposedEnd <= currentEnd) {
      return {
        isValid: false,
        addDays: 0,
        addHours: 0,
        estimatedCost: 0,
        newEndDateTime: "",
        error: "New end time must be after current end time",
      };
    }

    // Calculate difference
    const diffMs = proposedEnd.getTime() - currentEnd.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);
    const addDays = Math.floor(totalHours / 24);
    const addHours = Math.ceil(totalHours % 24);

    // Calculate estimated cost
    let estimatedCost = 0;
    if (typeof booking.vehicle === "object") {
      const dayCost = addDays * booking.vehicle.pricePerDay;
      const hourCost =
        addHours > 0 ? addHours * booking.vehicle.pricePerHour : 0;
      estimatedCost = dayCost + hourCost;
    }

    return {
      isValid: true,
      addDays,
      addHours,
      estimatedCost,
      newEndDateTime: proposedEnd.toISOString(),
      totalHours: Math.ceil(totalHours),
    };
  }, [booking, newEndDate, newEndTime]);

  // ✅ Format date display
  const formatDateTime = (dateString: string): string => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const submit = async () => {
    if (!extensionDetails.isValid) {
      setError(extensionDetails.error || "Invalid extension date");
      return;
    }

    if (extensionDetails.addDays <= 0 && extensionDetails.addHours <= 0) {
      setError("Please select a date after the current end time");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await bookingApi.extendBooking(bookingId, {
        addDays:
          extensionDetails.addDays > 0 ? extensionDetails.addDays : undefined,
        addHours:
          extensionDetails.addHours > 0 ? extensionDetails.addHours : undefined,
      });

      onExtended?.({
        additionalCharge: res.additionalCharge,
        newEndTime: res.newEndTime,
        raw: {
          bookingId: res.booking?._id,
          orderCode: res.payment?.orderCode,
          checkoutUrl: res.payment?.checkoutUrl,
          qrCode: res.payment?.qrCode,
          pricing: {
            days: extensionDetails.addDays,
            hours: extensionDetails.addHours,
            unitPriceDay:
              typeof booking?.vehicle === "object"
                ? booking.vehicle.pricePerDay
                : undefined,
            unitPriceHour:
              typeof booking?.vehicle === "object"
                ? booking.vehicle.pricePerHour
                : undefined,
          },
        },
      });

      onClose();
      // Reset state
      setNewEndDate("");
      setNewEndTime("10:00");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to extend booking");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setNewEndDate("");
    setNewEndTime("10:00");
    setError("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <div className="flex items-center gap-2 text-white">
                <Clock className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Extend Booking</h3>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {fetchingBooking ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
              ) : booking ? (
                <div className="space-y-5">
                  {/* Current End Time Display */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">
                      Current End Time
                    </p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="font-semibold text-gray-900">
                        {formatDateTime(booking.endTime)}
                      </p>
                    </div>
                  </div>

                  {/* New End Date & Time Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      New End Date & Time *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <DateTimePicker
                        type="date"
                        value={newEndDate}
                        onChange={(value) => {
                          setNewEndDate(value);
                          setError("");
                        }}
                        label="End Date"
                        minDate={
                          booking.endTime
                            ? new Date(booking.endTime)
                                .toISOString()
                                .split("T")[0]
                            : new Date().toISOString().split("T")[0]
                        }
                      />
                      <DateTimePicker
                        type="time"
                        value={newEndTime}
                        onChange={(value) => {
                          setNewEndTime(value);
                          setError("");
                        }}
                        label="End Time"
                      />
                    </div>
                  </div>

                  {/* Extension Summary */}
                  {extensionDetails.isValid && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4"
                    >
                      <h4 className="text-sm font-semibold text-purple-900 mb-3">
                        Extension Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        {/* Duration Breakdown */}
                        <div className="flex justify-between items-center">
                          <span className="text-purple-700">
                            Additional Duration
                          </span>
                          <div className="text-right">
                            {extensionDetails.addDays > 0 && (
                              <div className="font-semibold text-purple-900">
                                {extensionDetails.addDays} day
                                {extensionDetails.addDays > 1 ? "s" : ""}
                              </div>
                            )}
                            {extensionDetails.addHours > 0 && (
                              <div className="font-semibold text-purple-700">
                                + {extensionDetails.addHours} hour
                                {extensionDetails.addHours > 1 ? "s" : ""}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="border-t border-purple-200 pt-2">
                          {extensionDetails.addDays > 0 && (
                            <div className="flex justify-between items-center text-xs text-purple-600 mb-1">
                              <span>
                                {extensionDetails.addDays} day(s) ×{" "}
                                {typeof booking.vehicle === "object" &&
                                  booking.vehicle.pricePerDay.toLocaleString()}
                                đ
                              </span>
                            </div>
                          )}
                          {extensionDetails.addHours > 0 && (
                            <div className="flex justify-between items-center text-xs text-purple-600 mb-2">
                              <span>
                                {extensionDetails.addHours} hour(s) ×{" "}
                                {typeof booking.vehicle === "object" &&
                                  booking.vehicle.pricePerHour.toLocaleString()}
                                đ
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t border-purple-200">
                            <span className="font-semibold text-purple-900">
                              Estimated Cost
                            </span>
                            <span className="text-lg font-bold text-purple-900">
                              {extensionDetails.estimatedCost.toLocaleString()}đ
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{error}</p>
                    </motion.div>
                  )}

                  {/* Info Note */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      <strong>Note:</strong> You will be redirected to payment
                      after confirming the extension.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-red-600">
                  Failed to load booking details
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={
                  loading || !extensionDetails.isValid || fetchingBooking
                }
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extending...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Extension</span>
                    <span className="text-sm">
                      ({extensionDetails.estimatedCost.toLocaleString()}đ)
                    </span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
