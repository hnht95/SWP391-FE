import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Clock, Calendar, AlertCircle, Plus } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [fetchingBooking, setFetchingBooking] = useState<boolean>(false);

  const [newEndDate, setNewEndDate] = useState<string>("");
  const [newEndTime, setNewEndTime] = useState<string>("10:00");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Fetch booking details when modal opens
  useEffect(() => {
    if (isOpen && bookingId) {
      const fetchBooking = async () => {
        try {
          setFetchingBooking(true);
          setError("");
          const data = await bookingApi.getBookingById(bookingId);
          setBooking(data);

          if (data.endTime) {
            const currentEnd = new Date(data.endTime);
            if (!isNaN(currentEnd.getTime())) {
              setNewEndDate(currentEnd.toISOString().split("T")[0]);
              const timeString = currentEnd.toTimeString().slice(0, 5);
              setNewEndTime(timeString || "10:00");
            } else {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setNewEndDate(tomorrow.toISOString().split("T")[0]);
              setNewEndTime("10:00");
            }
          } else {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setNewEndDate(tomorrow.toISOString().split("T")[0]);
            setNewEndTime("10:00");
          }
        } catch (e: unknown) {
          setError(
            e instanceof Error ? e.message : "Failed to load booking details"
          );
        } finally {
          setFetchingBooking(false);
        }
      };
      fetchBooking();
    } else if (!isOpen) {
      setBooking(null);
      setNewEndDate("");
      setNewEndTime("10:00");
      setError("");
    }
  }, [isOpen, bookingId]);

  // Calculate extension details
  const extensionDetails = useMemo(() => {
    if (!booking || !newEndDate || !newEndTime) {
      return {
        isValid: false,
        addDays: 0,
        addHours: 0,
        estimatedCost: 0,
        newEndDateTime: "",
      };
    }

    try {
      const currentEnd = new Date(booking.endTime);
      const proposedEnd = new Date(`${newEndDate}T${newEndTime}`);

      if (isNaN(currentEnd.getTime()) || isNaN(proposedEnd.getTime())) {
        return {
          isValid: false,
          addDays: 0,
          addHours: 0,
          estimatedCost: 0,
          newEndDateTime: "",
          error: "Invalid date format",
        };
      }

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

      const diffMs = proposedEnd.getTime() - currentEnd.getTime();
      const totalHours = diffMs / (1000 * 60 * 60);
      const addDays = Math.floor(totalHours / 24);
      const addHours = Math.ceil(totalHours % 24);

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
    } catch (e) {
      return {
        isValid: false,
        addDays: 0,
        addHours: 0,
        estimatedCost: 0,
        newEndDateTime: "",
        error: "Invalid date calculation",
      };
      throw e;
    }
  }, [booking, newEndDate, newEndTime]);

  // Format date display
  const formatDateTime = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (e) {
      return "Invalid Date";
      throw e;
    }
  };

  // Submit extension
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

      console.log("✅ Extension response:", res);

      // Call onExtended callback if provided
      if (onExtended) {
        onExtended({
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
      }

      // Close modal
      onClose();

      // Navigate to extension payment page with state
      navigate(`/booking/${bookingId}/extend-pay`, {
        state: {
          bookingId: res.booking?._id || bookingId,
          endTime: res.newEndTime,
          feeEstimated: res.additionalCharge,
          pricingSnapshot: {
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
          payment: {
            orderCode: res.payment?.orderCode,
            checkoutUrl: res.payment?.checkoutUrl,
            qrCode: res.payment?.qrCode,
            provider: res.payment?.provider || "payos",
            type: "extension" as const,
          },
        },
      });
    } catch (e: unknown) {
      console.error("❌ Extension error:", e);
      setError(e instanceof Error ? e.message : "Failed to extend booking");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Extend Booking</h3>
                <p className="text-purple-100 text-sm">
                  Add more time to your rental period
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            {fetchingBooking ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                <p className="text-gray-600">Loading booking details...</p>
              </div>
            ) : booking ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Current Details */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Current Rental Period
                      </h4>
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Start Time
                            </p>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <p className="font-medium text-gray-900 text-sm">
                                {formatDateTime(booking.startTime)}
                              </p>
                            </div>
                          </div>
                          <div className="border-t border-gray-200 pt-3">
                            <p className="text-xs text-gray-500 mb-1">
                              Current End Time
                            </p>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-purple-500" />
                              <p className="font-semibold text-gray-900">
                                {formatDateTime(booking.endTime)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {typeof booking.vehicle === "object" && (
                      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-900 mb-3">
                          Vehicle Rates
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700">Daily Rate:</span>
                            <span className="font-bold text-blue-900">
                              {booking.vehicle.pricePerDay.toLocaleString()}đ
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700">Hourly Rate:</span>
                            <span className="font-bold text-blue-900">
                              {booking.vehicle.pricePerHour.toLocaleString()}đ
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Extension Details */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        New End Date & Time *
                      </h4>
                      <div className="space-y-3">
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

                    {extensionDetails.isValid && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-5"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-base font-bold text-purple-900">
                            Extension Summary
                          </h4>
                          <Plus className="w-5 h-5 text-purple-600" />
                        </div>

                        <div className="space-y-3">
                          <div className="bg-white/50 rounded-lg p-3">
                            <p className="text-xs text-purple-600 mb-2">
                              Additional Duration
                            </p>
                            <div className="flex items-center gap-3">
                              {extensionDetails.addDays > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-2xl font-bold text-purple-900">
                                    {extensionDetails.addDays}
                                  </span>
                                  <span className="text-sm text-purple-600">
                                    day
                                    {extensionDetails.addDays > 1 ? "s" : ""}
                                  </span>
                                </div>
                              )}
                              {extensionDetails.addDays > 0 &&
                                extensionDetails.addHours > 0 && (
                                  <span className="text-purple-400">+</span>
                                )}
                              {extensionDetails.addHours > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-2xl font-bold text-purple-700">
                                    {extensionDetails.addHours}
                                  </span>
                                  <span className="text-sm text-purple-600">
                                    hour
                                    {extensionDetails.addHours > 1 ? "s" : ""}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2 pt-3 border-t border-purple-200">
                            {extensionDetails.addDays > 0 && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-purple-700">
                                  {extensionDetails.addDays} day(s) ×{" "}
                                  {typeof booking.vehicle === "object" &&
                                    booking.vehicle.pricePerDay.toLocaleString()}
                                  đ
                                </span>
                                <span className="font-semibold text-purple-900">
                                  {(
                                    extensionDetails.addDays *
                                    (typeof booking.vehicle === "object"
                                      ? booking.vehicle.pricePerDay
                                      : 0)
                                  ).toLocaleString()}
                                  đ
                                </span>
                              </div>
                            )}
                            {extensionDetails.addHours > 0 && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-purple-700">
                                  {extensionDetails.addHours} hour(s) ×{" "}
                                  {typeof booking.vehicle === "object" &&
                                    booking.vehicle.pricePerHour.toLocaleString()}
                                  đ
                                </span>
                                <span className="font-semibold text-purple-900">
                                  {(
                                    extensionDetails.addHours *
                                    (typeof booking.vehicle === "object"
                                      ? booking.vehicle.pricePerHour
                                      : 0)
                                  ).toLocaleString()}
                                  đ
                                </span>
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-3 border-t border-purple-300">
                              <span className="font-bold text-purple-900">
                                Total Cost
                              </span>
                              <span className="text-2xl font-bold text-purple-900">
                                {extensionDetails.estimatedCost.toLocaleString()}
                                đ
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-semibold">
                  Failed to load booking details
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex gap-4">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={loading || !extensionDetails.isValid || fetchingBooking}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Redirecting to payment...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Pay</span>
                  {extensionDetails.isValid && (
                    <span className="bg-white/20 px-2 py-1 rounded text-sm">
                      {extensionDetails.estimatedCost.toLocaleString()}đ
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
