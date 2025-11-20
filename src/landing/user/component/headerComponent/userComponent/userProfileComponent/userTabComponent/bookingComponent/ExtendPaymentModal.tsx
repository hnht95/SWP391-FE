import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
  X,
  Clock,
  CreditCard,
  CheckCircle,
  Loader2,
  ExternalLink,
  Calendar,
  DollarSign,
} from "lucide-react";
import { createPortal } from "react-dom";
import bookingApi from "../../../../../../../../service/apiUser/booking/API";

type ExtendPaymentData = {
  bookingId: string;
  status:
    | "pending"
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

type Props = {
  isOpen: boolean;
  onClose: () => void;
  extendResult: ExtendPaymentData | null;
  onPaid?: () => void | Promise<void>;
};

export default function ExtendPaymentModal({
  isOpen,
  onClose,
  extendResult,
  onPaid,
}: Props) {
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "success" | "failed"
  >("pending");
  const [polling, setPolling] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

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

  // ✅ Handle close with proper confirmation
  const handleClose = useCallback(() => {
    if (paymentStatus !== "success" && polling) {
      const confirmClose = window.confirm(
        "Payment is still pending. Are you sure you want to close? You can check payment status in your bookings."
      );
      if (!confirmClose) return;
    }
    onClose();
    // Reset state after a delay to allow exit animation
    setTimeout(() => {
      setPaymentStatus("pending");
      setError("");
      setPolling(false);
    }, 300);
  }, [paymentStatus, polling, onClose]);

  // ✅ Poll payment status
  useEffect(() => {
    if (!isOpen || !extendResult?.bookingId) {
      setPolling(false);
      return;
    }

    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let isMounted = true;

    const checkPaymentStatus = async () => {
      if (!isMounted) return;

      try {
        setPolling(true);
        const booking = await bookingApi.getBookingById(extendResult.bookingId);

        if (!isMounted) return;

        // Check if payment is captured
        if (booking.deposit.status === "captured") {
          setPaymentStatus("success");
          setPolling(false);

          // Clear intervals
          if (intervalId) clearInterval(intervalId);
          if (timeoutId) clearTimeout(timeoutId);

          // Call onPaid callback after a short delay
          setTimeout(async () => {
            if (isMounted && onPaid) {
              try {
                await onPaid();
              } catch (err) {
                console.error("onPaid callback error:", err);
              }
            }
          }, 1500);
        }
      } catch (err: unknown) {
        console.error("Payment status check error:", err);
        if (isMounted) {
          // Continue polling even on error, but log it
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error";
          console.warn("Polling error:", errorMessage);
        }
      }
    };

    // Start polling immediately
    checkPaymentStatus();

    // Poll every 3 seconds
    intervalId = setInterval(() => {
      if (isMounted) {
        checkPaymentStatus();
      }
    }, 3000);

    // Stop polling after 10 minutes
    timeoutId = setTimeout(() => {
      if (isMounted) {
        if (intervalId) clearInterval(intervalId);
        setPolling(false);
        setError(
          "Payment verification timeout. Please check your booking status."
        );
      }
    }, 600000); // 10 minutes

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
      setPolling(false);
    };
  }, [isOpen, extendResult, onPaid]);

  // ✅ Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setPaymentStatus("pending");
        setError("");
        setPolling(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!extendResult) return null;

  const content = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 px-8 py-6 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Extension Payment
                  </h2>
                  <p className="text-sm text-purple-100">
                    Complete payment to extend your booking
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Body */}
            <div className="p-8">
              {paymentStatus === "success" ? (
                // ✅ Success State
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Payment Successful!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your booking has been extended successfully
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
                  >
                    Close
                  </button>
                </motion.div>
              ) : (
                // ✅ Pending Payment State
                <div className="space-y-6">
                  {/* Extension Summary */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-2 border-purple-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Extension Summary
                    </h3>

                    <div className="space-y-3 text-sm">
                      {/* New End Time */}
                      <div className="flex justify-between items-center pb-3 border-b border-purple-200">
                        <span className="text-purple-700 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          New End Time
                        </span>
                        <span className="font-semibold text-purple-900">
                          {formatDateTime(extendResult.endTime)}
                        </span>
                      </div>

                      {/* Duration Breakdown */}
                      {(extendResult.pricingSnapshot?.days ||
                        extendResult.pricingSnapshot?.hours) && (
                        <div className="flex justify-between items-center pb-3 border-b border-purple-200">
                          <span className="text-purple-700">
                            Additional Duration
                          </span>
                          <div className="text-right">
                            {extendResult.pricingSnapshot.days &&
                            extendResult.pricingSnapshot.days > 0 ? (
                              <div className="font-semibold text-purple-900">
                                {extendResult.pricingSnapshot.days} day
                                {extendResult.pricingSnapshot.days > 1
                                  ? "s"
                                  : ""}
                              </div>
                            ) : null}
                            {extendResult.pricingSnapshot.hours &&
                            extendResult.pricingSnapshot.hours > 0 ? (
                              <div className="font-semibold text-purple-700">
                                {extendResult.pricingSnapshot.days &&
                                extendResult.pricingSnapshot.days > 0
                                  ? "+ "
                                  : ""}
                                {extendResult.pricingSnapshot.hours} hour
                                {extendResult.pricingSnapshot.hours > 1
                                  ? "s"
                                  : ""}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      )}

                      {/* Cost Breakdown */}
                      {(extendResult.pricingSnapshot?.days ||
                        extendResult.pricingSnapshot?.hours) && (
                        <div className="space-y-2 pb-3 border-b border-purple-200">
                          {extendResult.pricingSnapshot?.days &&
                          extendResult.pricingSnapshot.days > 0 &&
                          extendResult.pricingSnapshot.unitPriceDay ? (
                            <div className="flex justify-between items-center text-xs text-purple-600">
                              <span>
                                {extendResult.pricingSnapshot.days} day(s) ×{" "}
                                {extendResult.pricingSnapshot.unitPriceDay.toLocaleString()}
                                đ
                              </span>
                              <span>
                                {(
                                  extendResult.pricingSnapshot.days *
                                  extendResult.pricingSnapshot.unitPriceDay
                                ).toLocaleString()}
                                đ
                              </span>
                            </div>
                          ) : null}
                          {extendResult.pricingSnapshot?.hours &&
                          extendResult.pricingSnapshot.hours > 0 &&
                          extendResult.pricingSnapshot.unitPriceHour ? (
                            <div className="flex justify-between items-center text-xs text-purple-600">
                              <span>
                                {extendResult.pricingSnapshot.hours} hour(s) ×{" "}
                                {extendResult.pricingSnapshot.unitPriceHour.toLocaleString()}
                                đ
                              </span>
                              <span>
                                {(
                                  extendResult.pricingSnapshot.hours *
                                  extendResult.pricingSnapshot.unitPriceHour
                                ).toLocaleString()}
                                đ
                              </span>
                            </div>
                          ) : null}
                        </div>
                      )}

                      {/* Total Amount */}
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-bold text-purple-900 flex items-center gap-2">
                          <DollarSign className="w-5 h-5" />
                          Total Amount
                        </span>
                        <span className="text-2xl font-bold text-purple-900">
                          {extendResult.feeEstimated.toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code & Payment Link */}
                  {extendResult.payment && (
                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                        Scan QR Code to Pay
                      </h3>

                      {/* QR Code */}
                      <div className="flex justify-center mb-6">
                        <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-gray-200">
                          <img
                            src={extendResult.payment.qrCode}
                            alt="Payment QR Code"
                            className="w-64 h-64 object-contain"
                          />
                        </div>
                      </div>

                      {/* Order Code */}
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <p className="text-sm text-gray-600 mb-1">Order Code</p>
                        <p className="text-xl font-mono font-bold text-gray-900">
                          {extendResult.payment.orderCode}
                        </p>
                      </div>

                      {/* Payment Link Button */}
                      <a
                        href={extendResult.payment.checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                      >
                        <ExternalLink className="w-5 h-5" />
                        Open Payment Page
                      </a>
                    </div>
                  )}

                  {/* Payment Status */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      {polling && (
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          {polling
                            ? "Waiting for payment confirmation..."
                            : "Payment pending"}
                        </p>
                        <p className="text-xs text-blue-700">
                          The page will update automatically once payment is
                          confirmed
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border-2 border-red-200 rounded-xl p-4"
                    >
                      <p className="text-sm text-red-800">{error}</p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(
    content,
    document.getElementById("modal-root") || document.body
  );
}
