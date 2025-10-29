// pages/PaymentPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  getPaymentStatus,
  type Booking,
} from "../../../../service/apiBooking/API";
import type { Vehicle } from "../../../../types/vehicle";

const PaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Get passed data from BookingPage
  const { booking, vehicle, calculatedTotals } = location.state as {
    booking: Booking;
    vehicle: Vehicle;
    calculatedTotals?: {
      dailyRate: number;
      duration: number;
      rentalCost: number;
      deposit: number;
      total: number;
    };
  };

  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>(
    booking?.deposit?.status || "pending"
  );
  const [polling, setPolling] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isExpired, setIsExpired] = useState(false);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Use passed calculations or fallback to booking data
  const calculateTotals = () => {
    if (calculatedTotals) {
      return calculatedTotals;
    }

    // Fallback calculation from booking
    const deposit = booking.deposit?.amount || 0;
    const total = booking.amountEstimated || 0;
    const rentalCost = total - deposit;

    return {
      dailyRate: booking.pricingSnapshot?.basePrice || 0,
      duration: booking.pricingSnapshot?.computedQty || 0,
      rentalCost,
      deposit,
      total,
    };
  };

  const totals = calculateTotals();

  // ✅ Generate QR Code
  useEffect(() => {
    if (booking?.qrCode) {
      QRCode.toDataURL(booking.qrCode, { width: 300 })
        .then((url) => {
          setQrCodeUrl(url);
        })
        .catch((err) => {
          console.error("QR Code generation error:", err);
        });
    }
  }, [booking?.qrCode]);

  // ✅ Countdown timer
  useEffect(() => {
    if (isExpired || paymentStatus === "captured") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          setPolling(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExpired, paymentStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // ✅ Poll payment status
  useEffect(() => {
    if (!bookingId || !polling || isExpired) return;

    const checkPayment = async () => {
      try {
        const response = await getPaymentStatus(bookingId);
        console.log("Payment status check:", response);

        const status =
          response.current?.depositStatus ||
          response.deposit?.status ||
          "pending";

        console.log("Extracted status:", status);
        setPaymentStatus(status);

        if (status === "captured" || status === "PAID") {
          console.log("✅ Payment successful!");
          setPolling(false);

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          setTimeout(() => {
            navigate(`/booking-success/${bookingId}`, {
              state: { booking, vehicle },
            });
          }, 2000);
        } else if (status === "failed" || status === "CANCELLED") {
          setPolling(false);
        }
      } catch (err) {
        console.error("Failed to check payment status:", err);
      }
    };

    checkPayment();
    pollingIntervalRef.current = setInterval(checkPayment, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [bookingId, polling, isExpired, navigate]);

  // ✅ Cleanup
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handlePaymentRedirect = () => {
    if (booking?.checkoutUrl) {
      window.open(booking.checkoutUrl, "_blank");
    }
  };

  const handleExpired = () => {
    navigate("/vehicles");
  };

  if (!booking || !bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Booking Not Found
          </h1>
          <button
            onClick={() => navigate("/vehicles")}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Payment
            </h1>
            <p className="text-gray-600">
              Booking ID: <span className="font-mono">{bookingId}</span>
            </p>
          </div>

          {/* Timer Warning */}
          {!isExpired && paymentStatus === "pending" && (
            <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaClock className="text-yellow-600 text-xl" />
                  <span className="text-sm text-yellow-800">
                    Time remaining to complete payment:
                  </span>
                </div>
                <span className="text-2xl font-bold text-yellow-600 font-mono">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          )}

          {/* Payment Status */}
          <div className="mb-8">
            {isExpired && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <FaExclamationTriangle className="text-red-600 text-2xl" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800">
                    Payment Expired
                  </h3>
                  <p className="text-sm text-red-700">
                    Your payment session has expired. Please create a new
                    booking.
                  </p>
                </div>
                <button
                  onClick={handleExpired}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
                >
                  Back to Vehicles
                </button>
              </div>
            )}

            {!isExpired && paymentStatus === "pending" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                <FaClock className="text-yellow-600 text-2xl" />
                <div>
                  <h3 className="font-semibold text-yellow-800">
                    Waiting for Payment
                  </h3>
                  <p className="text-sm text-yellow-700">
                    Please scan the QR code or click the button below to
                    complete payment
                  </p>
                </div>
              </div>
            )}

            {(paymentStatus === "captured" || paymentStatus === "PAID") && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <FaCheckCircle className="text-green-600 text-2xl" />
                <div>
                  <h3 className="font-semibold text-green-800">
                    Payment Successful!
                  </h3>
                  <p className="text-sm text-green-700">
                    Your booking has been confirmed. Redirecting...
                  </p>
                </div>
              </div>
            )}

            {(paymentStatus === "failed" || paymentStatus === "CANCELLED") && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <FaTimesCircle className="text-red-600 text-2xl" />
                <div>
                  <h3 className="font-semibold text-red-800">Payment Failed</h3>
                  <p className="text-sm text-red-700">
                    Please try again or contact support
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* QR Code */}
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Scan QR Code</h2>
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 inline-block">
                {qrCodeUrl && !isExpired ? (
                  <img
                    src={qrCodeUrl}
                    alt="Payment QR Code"
                    className="w-64 h-64"
                  />
                ) : isExpired ? (
                  <div className="w-64 h-64 flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500 text-center">QR Code Expired</p>
                  </div>
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500">Generating QR Code...</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Use your banking app to scan and pay
              </p>
            </div>

            {/* Booking Summary */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Vehicle</p>
                  <p className="font-semibold">
                    {vehicle.brand} {vehicle.model}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plate Number</p>
                  <p className="font-semibold">{vehicle.plateNumber}</p>
                </div>

                {/* ✅ Breakdown from BookingPage */}
                <div className="pt-3 border-t">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Daily Rate:</span>
                    <span className="font-medium">
                      {totals.dailyRate.toLocaleString()}đ
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {totals.duration} day(s)
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Rental Cost:</span>
                    <span className="font-medium">
                      {totals.rentalCost.toLocaleString()}đ
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-orange-600">
                      Deposit (1.5%):
                    </span>
                    <span className="font-medium text-orange-600">
                      {totals.deposit.toLocaleString()}đ
                    </span>
                  </div>
                </div>

                <hr className="my-3" />

                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {totals.total.toLocaleString()}đ
                  </span>
                </div>
              </div>

              {/* Payment Buttons */}
              {!isExpired && (
                <>
                  <button
                    onClick={handlePaymentRedirect}
                    disabled={paymentStatus === "captured"}
                    className={`w-full mt-6 py-3 rounded-lg font-medium transition-colors ${
                      paymentStatus === "captured"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    Pay via PayOS Website
                  </button>

                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full mt-3 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    View My Bookings
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
