// pages/PaymentPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaQrcode,
  FaExternalLinkAlt,
  FaCarSide,
  FaMoneyBillWave,
  FaLightbulb,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPaymentStatus,
  type Booking,
} from "../../../../service/apiBooking/API";
import { getVehicleById } from "../../../../service/apiAdmin/apiVehicles/API";
import type { Vehicle } from "../../../../types/vehicle";

const PAYMENT_TIMEOUT_MINUTES = 15;
const PAYMENT_TIMEOUT_SECONDS = PAYMENT_TIMEOUT_MINUTES * 60;

interface PaymentTimer {
  bookingId: string;
  expiryTime: number;
}

const getPaymentTimerKey = (bookingId: string) => `payment_timer_${bookingId}`;

const savePaymentTimer = (bookingId: string, expiryTime: number) => {
  const timer: PaymentTimer = { bookingId, expiryTime };
  localStorage.setItem(getPaymentTimerKey(bookingId), JSON.stringify(timer));
};

const getPaymentTimer = (bookingId: string): PaymentTimer | null => {
  const saved = localStorage.getItem(getPaymentTimerKey(bookingId));
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
};

const clearPaymentTimer = (bookingId: string) => {
  localStorage.removeItem(getPaymentTimerKey(bookingId));
};

const calculateRemainingTime = (expiryTime: number): number => {
  const now = Date.now();
  const remaining = Math.floor((expiryTime - now) / 1000);
  return Math.max(0, remaining);
};

const PaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = location.state as {
    booking?: Booking;
    vehicle?: Vehicle;
    calculatedTotals?: {
      dailyRate: number;
      duration: number;
      rentalCost: number;
      deposit: number;
      total: number;
    };
  } | null;

  const [booking, setBooking] = useState<Booking | null>(
    locationState?.booking || null
  );
  const [vehicle, setVehicle] = useState<Vehicle | null>(
    locationState?.vehicle || null
  );
  const [calculatedTotals, setCalculatedTotals] = useState(
    locationState?.calculatedTotals || null
  );

  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");
  const [polling, setPolling] = useState(true);
  const [timeLeft, setTimeLeft] = useState(PAYMENT_TIMEOUT_SECONDS);
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState<string | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerInitializedRef = useRef(false);

  // Initialize or restore payment timer
  useEffect(() => {
    if (!bookingId || timerInitializedRef.current) return;

    const savedTimer = getPaymentTimer(bookingId);

    if (savedTimer) {
      const remaining = calculateRemainingTime(savedTimer.expiryTime);
      console.log(
        `⏰ Restored timer: ${Math.floor(remaining / 60)}:${remaining % 60}`
      );

      if (remaining <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
        setPolling(false);
        clearPaymentTimer(bookingId);
      } else {
        setTimeLeft(remaining);
      }
    } else {
      const expiryTime = Date.now() + PAYMENT_TIMEOUT_SECONDS * 1000;
      savePaymentTimer(bookingId, expiryTime);
      console.log(
        `⏰ Created timer: expires at ${new Date(
          expiryTime
        ).toLocaleTimeString()}`
      );
    }

    timerInitializedRef.current = true;
  }, [bookingId]);

  // Fetch booking data if not provided
  useEffect(() => {
    const fetchBookingData = async () => {
      if (!bookingId || booking) return;

      try {
        setLoading(true);
        setError(null);

        const bookingResponse = await getPaymentStatus(bookingId);

        if (!bookingResponse || !bookingResponse.current) {
          throw new Error("Invalid booking response");
        }

        const fetchedBooking = bookingResponse.current;
        setBooking(fetchedBooking);

        const status = fetchedBooking.deposit?.status || "pending";
        setPaymentStatus(status);

        if (status === "captured") {
          clearPaymentTimer(bookingId);
          setPolling(false);
        }

        if (fetchedBooking.vehicle) {
          const vehicleId =
            typeof fetchedBooking.vehicle === "string"
              ? fetchedBooking.vehicle
              : fetchedBooking.vehicle._id;

          const fetchedVehicle = await getVehicleById(vehicleId);
          setVehicle(fetchedVehicle);
        }
      } catch (err) {
        console.error("❌ Failed to fetch booking:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load booking data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingId, booking]);

  // ✅ FIXED: Calculate totals with correct fields
  const calculateTotals = () => {
    if (calculatedTotals) return calculatedTotals;

    if (!booking) {
      return {
        dailyRate: 0,
        duration: "0d",
        rentalCost: 0,
        deposit: 0,
        total: 0,
      };
    }

    // Get vehicle valuation for deposit calculation
    let vehicleValue = 0;
    if (typeof booking.vehicle === "object" && booking.vehicle !== null) {
      const vehicle = booking.vehicle as any;
      vehicleValue = vehicle.valuation?.valueVND || 0;
    }

    // Calculate deposit: 1.5% of vehicle value
    const deposit = Math.round(vehicleValue * 0.015);

    // Get rental cost from pricingSnapshot.basePrice
    const pricingSnapshot = booking.pricingSnapshot as any;
    const rentalCost =
      pricingSnapshot?.basePrice || booking.amounts?.rentalEstimated || 0;

    // Total = rental + deposit
    const total = rentalCost + deposit;

    // ✅ FIX: Duration - check both days and hours
    const days = pricingSnapshot?.days || 0;
    const hours = pricingSnapshot?.hours || 0;

    let durationText: string;
    if (days > 0 && hours > 0) {
      durationText = `${days}d ${hours}h`;
    } else if (days > 0) {
      durationText = `${days}d`;
    } else if (hours > 0) {
      durationText = `${hours}h`;
    } else {
      durationText = "0d";
    }

    // Daily rate
    const dailyRate = pricingSnapshot?.unitPriceDay || 0;

    console.log("💰 Payment breakdown:", {
      vehicleValue: vehicleValue.toLocaleString(),
      deposit: deposit.toLocaleString(),
      rentalCost: rentalCost.toLocaleString(),
      total: total.toLocaleString(),
      days,
      hours,
      durationText,
      dailyRate: dailyRate.toLocaleString(),
      pricingSnapshot, // ✅ Debug full object
    });

    return {
      dailyRate,
      duration: durationText,
      rentalCost,
      deposit,
      total,
    };
  };

  const totals = calculateTotals();

  // Generate QR Code
  useEffect(() => {
    const generateQR = async () => {
      if (!booking?.deposit?.payos?.qrCode) {
        console.warn("⚠️ No QR code in booking");
        return;
      }

      try {
        const qrData = booking.deposit.payos.qrCode;
        const url = await QRCode.toDataURL(qrData, {
          width: 300,
          margin: 2,
          color: { dark: "#000000", light: "#FFFFFF" },
        });
        setQrCodeUrl(url);
        console.log("✅ QR Code generated");
      } catch (err) {
        console.error("❌ QR generation error:", err);
      }
    };

    generateQR();
  }, [booking?.deposit?.payos?.qrCode]);

  // Countdown timer
  useEffect(() => {
    if (!bookingId || isExpired || paymentStatus === "captured") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const savedTimer = getPaymentTimer(bookingId);
        if (!savedTimer) return 0;

        const remaining = calculateRemainingTime(savedTimer.expiryTime);

        if (remaining <= 0) {
          setIsExpired(true);
          setPolling(false);
          clearPaymentTimer(bookingId);
          return 0;
        }

        return remaining;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [bookingId, isExpired, paymentStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Poll payment status
  useEffect(() => {
    if (!bookingId || !polling || isExpired) return;

    const checkPayment = async () => {
      try {
        const response = await getPaymentStatus(bookingId);
        const status =
          response.current?.deposit?.status ||
          response.deposit?.status ||
          "pending";

        setPaymentStatus(status);

        if (status === "captured") {
          setPolling(false);
          clearPaymentTimer(bookingId);

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }

          setTimeout(() => {
            navigate(`/booking-success/${bookingId}`, {
              state: { booking, vehicle },
            });
          }, 2000);
        } else if (status === "failed") {
          setPolling(false);
          clearPaymentTimer(bookingId);
        }
      } catch (err) {
        console.error("Failed to check payment:", err);
      }
    };

    checkPayment();
    pollingIntervalRef.current = setInterval(checkPayment, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [bookingId, polling, isExpired, navigate, booking, vehicle]);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handlePaymentRedirect = () => {
    if (booking?.deposit?.payos?.checkoutUrl) {
      window.open(booking.deposit.payos.checkoutUrl, "_blank");
    }
  };

  const handleExpired = () => {
    if (bookingId) clearPaymentTimer(bookingId);
    navigate("/vehicles");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-gray-900 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Payment...
          </h2>
        </motion.div>
      </div>
    );
  }

  if (error || !booking || !bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-red-600 text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "Booking Not Found"}
          </h1>
          <p className="text-gray-600 mb-6">
            {error ||
              "We couldn't find the booking or there was an error loading payment information"}
          </p>
          <button
            onClick={() => navigate("/vehicles")}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 inline-flex items-center gap-2 font-semibold"
          >
            <FaArrowLeft />
            Back to Vehicles
          </button>
        </motion.div>
      </div>
    );
  }

  const vehicleInfo =
    typeof booking.vehicle === "object" && booking.vehicle !== null
      ? {
          brand: (booking.vehicle as any).brand || "Unknown",
          model: (booking.vehicle as any).model || "Vehicle",
          licensePlate: (booking.vehicle as any).plateNumber || "N/A",
        }
      : vehicle || { brand: "Unknown", model: "Vehicle", licensePlate: "N/A" };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-black/80 via-black/50 to-black/10 text-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Complete Your Payment
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-6 relative z-0">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <AnimatePresence>
              {!isExpired && paymentStatus === "pending" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                        <FaClock className="text-white text-lg" />
                      </div>
                      <div>
                        <p className="font-semibold text-amber-900">
                          Payment Timer
                        </p>
                        <p className="text-xs text-amber-700">
                          Complete payment before time runs out
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-amber-600 font-mono">
                        {formatTime(timeLeft)}
                      </div>
                      <p className="text-xs text-amber-600">
                        minutes remaining
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {isExpired && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-2xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaExclamationTriangle className="text-white text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-red-900 text-lg mb-1">
                        Payment Session Expired
                      </h3>
                      <p className="text-sm text-red-700 mb-4">
                        Your payment session has timed out. Please create a new
                        booking.
                      </p>
                      <button
                        onClick={handleExpired}
                        className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 inline-flex items-center gap-2"
                      >
                        <FaArrowLeft />
                        Back to Vehicles
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {!isExpired && paymentStatus === "pending" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                      <FaClock className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 text-lg mb-1">
                        Awaiting Payment
                      </h3>
                      <p className="text-sm text-blue-700">
                        Scan the QR code with your banking app or use the
                        payment button below
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {paymentStatus === "captured" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheckCircle className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-green-900 text-lg mb-1">
                        Payment Successful!
                      </h3>
                      <p className="text-sm text-green-700">
                        Your booking has been confirmed. Redirecting...
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {paymentStatus === "failed" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-300 rounded-2xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaTimesCircle className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-red-900 text-lg mb-1">
                        Payment Failed
                      </h3>
                      <p className="text-sm text-red-700">
                        The payment could not be processed. Please try again.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                      <FaQrcode className="text-white text-lg" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Scan to Pay
                      </h2>
                      <p className="text-xs text-gray-600">
                        Use your banking app
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-center">
                      {qrCodeUrl && !isExpired ? (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <img
                            src={qrCodeUrl}
                            alt="Payment QR Code"
                            className="w-72 h-72 rounded-xl"
                          />
                        </motion.div>
                      ) : isExpired ? (
                        <div className="w-72 h-72 flex flex-col items-center justify-center bg-gray-100 rounded-xl">
                          <FaExclamationTriangle className="text-gray-400 text-4xl mb-3" />
                          <p className="text-gray-500 font-semibold">
                            QR Code Expired
                          </p>
                        </div>
                      ) : (
                        <div className="w-72 h-72 flex flex-col items-center justify-center bg-gray-100 rounded-xl">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-900 mb-3"></div>
                          <p className="text-gray-600 font-medium">
                            Generating QR Code...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-900 font-medium text-center flex items-center justify-center gap-2">
                      <FaLightbulb className="text-blue-600" />
                      Open your banking app and scan this code
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                        <FaCarSide className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Booking Summary
                        </h3>
                        <p className="text-xs text-gray-600">
                          Review your details
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Vehicle</span>
                        <span className="font-semibold text-gray-900">
                          {vehicleInfo.brand} {vehicleInfo.model}
                        </span>
                      </div>
                      {vehicleInfo.licensePlate &&
                        vehicleInfo.licensePlate !== "N/A" && (
                          <div className="flex items-center justify-between py-2 border-b border-gray-200">
                            <span className="text-sm text-gray-600">
                              License Plate
                            </span>
                            <span className="font-semibold text-gray-900 font-mono">
                              {vehicleInfo.licensePlate}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-6 text-black">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <FaMoneyBillWave className="text-black" />
                      Payment Breakdown
                    </h3>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center pb-3 border-b border-black/10">
                        <span className="text-black/70">Daily Rate</span>
                        <span className="font-semibold">
                          {totals.dailyRate.toLocaleString()}đ
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-black/10">
                        <span className="text-black/70">Duration</span>
                        <span className="font-semibold">{totals.duration}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-black/10">
                        <span className="text-black/70">Rental Cost</span>
                        <span className="font-semibold">
                          {totals.rentalCost.toLocaleString()}đ
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-black/10">
                        <span className="text-black/70">Deposit (1.5%)</span>
                        <span className="font-semibold">
                          {totals.deposit.toLocaleString()}đ
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-3">
                        <span className="text-lg font-bold">Total Amount</span>
                        <span className="text-3xl font-bold text-green-400">
                          {totals.total.toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  </div>

                  {!isExpired && (
                    <div className="space-y-3">
                      <button
                        onClick={handlePaymentRedirect}
                        disabled={paymentStatus === "captured"}
                        className={`w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                          paymentStatus === "captured"
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                        }`}
                      >
                        {paymentStatus === "captured" ? (
                          <>
                            <FaCheckCircle />
                            Payment Completed
                          </>
                        ) : (
                          <>
                            <FaExternalLinkAlt />
                            Pay via PayOS Website
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => navigate("/profile")}
                        className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                      >
                        View My Bookings
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default PaymentPage;
