// pages/BookingSuccessPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getBookingById,
  getPaymentStatus,
  type Booking,
} from "../../../../service/apiBooking/API";
import {
  getVehicleById,
  type Vehicle,
} from "../../../../service/apiAdmin/apiVehicles/API";
import type { Station } from "../../../../service/apiAdmin/apiStation/API";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCar,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaArrowLeft,
  FaDownload,
  FaWhatsapp,
  FaEnvelope,
} from "react-icons/fa";

const BookingSuccessPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Calculate duration with days + hours (same as BookingPage)
  const calculateDurationDetails = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return { totalHours: 0, days: 0, hours: 0 };

    const start = new Date(startTime);
    const end = new Date(endTime);

    const diffMs = Math.abs(end.getTime() - start.getTime());
    const totalHours = diffMs / (1000 * 60 * 60);

    const days = Math.floor(totalHours / 24);
    const hours = Math.ceil(totalHours % 24);

    return { totalHours, days, hours };
  };

  // ✅ Calculate deposit: 1.5% of vehicle value
  const calculateDeposit = (vehicleValue?: number) => {
    if (!vehicleValue) return 0;
    return Math.round(vehicleValue * 0.015); // 1.5%
  };

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError("No booking ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const bookingData = await getBookingById(bookingId);
        console.log("📦 Booking data:", bookingData);
        setBooking(bookingData);

        try {
          const paymentData = await getPaymentStatus(bookingId);
          console.log("💳 Payment data:", paymentData);

          const status =
            paymentData.current?.depositStatus ||
            paymentData.deposit?.status ||
            bookingData.deposit?.status ||
            "pending";

          setPaymentStatus(status);
        } catch (paymentErr) {
          console.warn(
            "Payment status fetch failed, using booking deposit status"
          );
          setPaymentStatus(bookingData.deposit?.status || "pending");
        }

        if (bookingData.vehicle) {
          try {
            const vehicleId =
              typeof bookingData.vehicle === "string"
                ? bookingData.vehicle
                : bookingData.vehicle._id;

            const vehicleData = await getVehicleById(vehicleId);
            console.log("🚗 Vehicle data:", vehicleData);
            setVehicle(vehicleData);
          } catch (vehicleErr) {
            console.warn("Vehicle fetch failed:", vehicleErr);
            if (typeof bookingData.vehicle === "object") {
              setVehicle(bookingData.vehicle as any);
            }
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch booking details:", err);
        setError(err.message || "Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      captured: {
        icon: FaCheckCircle,
        text: "Payment Successful",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-800",
        iconColor: "text-green-600",
      },
      PAID: {
        icon: FaCheckCircle,
        text: "Payment Successful",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-800",
        iconColor: "text-green-600",
      },
      pending: {
        icon: FaClock,
        text: "Payment Pending",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        textColor: "text-yellow-800",
        iconColor: "text-yellow-600",
      },
      failed: {
        icon: FaTimesCircle,
        text: "Payment Failed",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-800",
        iconColor: "text-red-600",
      },
      CANCELLED: {
        icon: FaTimesCircle,
        text: "Payment Cancelled",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-800",
        iconColor: "text-red-600",
      },
    };

    return (
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">
            Loading booking details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <FaTimesCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              {error || "Booking Not Found"}
            </h2>
            <p className="text-red-500 mb-4">
              Unable to load booking information. Please try again.
            </p>
            <button
              onClick={() => navigate("/vehicles")}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Back to Vehicles
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(paymentStatus);
  const StatusIcon = statusBadge.icon;
  const isSuccess = paymentStatus === "captured" || paymentStatus === "PAID";

  const station =
    vehicle && typeof vehicle.station === "object"
      ? (vehicle.station as Station)
      : null;

  // ✅ Calculate values using SAME logic as BookingPage
  const durationDetails = calculateDurationDetails(
    booking.startTime,
    booking.endTime
  );

  // Get rates from vehicle
  const dailyRate = vehicle?.pricePerDay || 0;
  const hourlyRate = vehicle?.pricePerHour || 0;

  // Calculate rental cost: (days × dailyRate) + (hours × hourlyRate)
  const dayCost = durationDetails.days * dailyRate;
  const hourCost =
    durationDetails.hours > 0 ? durationDetails.hours * hourlyRate : 0;
  const rentalCost = dayCost + hourCost;

  // ✅ Calculate deposit: 1.5% of vehicle value
  const depositAmount = calculateDeposit(vehicle?.valuation?.valueVND);

  // Total = Rental Cost + Deposit
  const totalAmount = rentalCost + depositAmount;

  console.log("💰 Calculation breakdown:", {
    durationDetails,
    dailyRate,
    hourlyRate,
    dayCost,
    hourCost,
    rentalCost,
    vehicleValue: vehicle?.valuation?.valueVND,
    depositAmount,
    totalAmount,
  });

  return (
    <div className="min-h-screen bg-gray-50 py-30">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success/Failure Banner */}
        <div
          className={`${statusBadge.bgColor} border ${statusBadge.borderColor} rounded-lg p-6 mb-8`}
        >
          <div className="flex items-center justify-center gap-4">
            <StatusIcon className={`${statusBadge.iconColor} text-5xl`} />
            <div className="text-center">
              <h1
                className={`text-3xl font-bold ${statusBadge.textColor} mb-2`}
              >
                {statusBadge.text}
              </h1>
              <p className={`${statusBadge.textColor} text-lg`}>
                Booking ID:{" "}
                <span className="font-mono font-bold">{booking.bookingId}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">
            Booking Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Vehicle Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaCar className="text-blue-600" />
                Vehicle Information
              </h3>

              {vehicle ? (
                <div className="space-y-4">
                  <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                    {vehicle.defaultPhotos?.exterior?.[0]?.url ? (
                      <img
                        src={vehicle.defaultPhotos.exterior[0].url}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FaCar className="text-6xl" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-semibold text-gray-900">
                        {vehicle.brand} {vehicle.model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plate Number:</span>
                      <span className="font-semibold text-gray-900">
                        {vehicle.plateNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year:</span>
                      <span className="font-semibold text-gray-900">
                        {vehicle.year}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Color:</span>
                      <span className="font-semibold text-gray-900 capitalize">
                        {vehicle.color}
                      </span>
                    </div>

                    {station && (
                      <div className="pt-2 border-t">
                        <div className="flex items-start gap-2">
                          <FaMapMarkerAlt className="text-red-500 mt-1" />
                          <div>
                            <p className="text-xs text-gray-600 mb-1">
                              Pickup Location
                            </p>
                            <p className="font-semibold text-gray-900">
                              {station.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {station.location.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Loading vehicle information...</p>
              )}
            </div>

            {/* Right Column - Booking & Payment Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-green-600" />
                Rental Period
              </h3>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Pickup Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(booking.startTime)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Return Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(booking.endTime)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-600 mb-1">Duration</p>
                  <div className="font-bold text-blue-900">
                    {durationDetails.days > 0 && (
                      <div className="text-xl">
                        {durationDetails.days} Day
                        {durationDetails.days !== 1 ? "s" : ""}
                      </div>
                    )}
                    {durationDetails.hours > 0 && (
                      <div className="text-lg text-blue-700">
                        + {durationDetails.hours} Hour
                        {durationDetails.hours !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 border-t pt-4">
                <FaMoneyBillWave className="text-yellow-600" />
                Payment Summary
              </h3>

              <div className="space-y-3 text-sm">
                {/* Daily Rate */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Rate:</span>
                  <span className="font-medium">
                    {dailyRate.toLocaleString()}đ
                  </span>
                </div>

                {/* Hourly Rate */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Hourly Rate:</span>
                  <span className="font-medium">
                    {hourlyRate.toLocaleString()}đ
                  </span>
                </div>

                <hr className="border-gray-200" />

                {/* Days Calculation */}
                {durationDetails.days > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>
                      {durationDetails.days} day
                      {durationDetails.days !== 1 ? "s" : ""} ×{" "}
                      {dailyRate.toLocaleString()}đ
                    </span>
                    <span className="font-medium">
                      {dayCost.toLocaleString()}đ
                    </span>
                  </div>
                )}

                {/* Hours Calculation */}
                {durationDetails.hours > 0 && (
                  <div className="flex justify-between text-blue-700">
                    <span>
                      {durationDetails.hours} hour
                      {durationDetails.hours !== 1 ? "s" : ""} ×{" "}
                      {hourlyRate.toLocaleString()}đ
                    </span>
                    <span className="font-medium">
                      {hourCost.toLocaleString()}đ
                    </span>
                  </div>
                )}

                <hr className="border-gray-200" />

                {/* Rental Cost Subtotal */}
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">
                    Rental Cost:
                  </span>
                  <span className="font-semibold text-gray-900">
                    {rentalCost.toLocaleString()}đ
                  </span>
                </div>

                {/* Security Deposit 1.5% */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-blue-600">
                      Security Deposit (1.5%):
                    </span>
                  </div>
                  <span className="font-medium text-blue-600">
                    {depositAmount.toLocaleString()}đ
                  </span>
                </div>

                <hr className="border-gray-300 my-3" />

                {/* Total Amount */}
                <div className="flex justify-between items-center font-bold text-lg pt-2">
                  <span className="text-gray-900">Total Amount:</span>
                  <span className="text-green-600 text-2xl">
                    {totalAmount.toLocaleString()}đ
                  </span>
                </div>

                {/* Payment Status */}
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Status:</span>
                    <span
                      className={`font-semibold px-3 py-1 rounded-full text-sm ${
                        isSuccess
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {paymentStatus === "captured" || paymentStatus === "PAID"
                        ? "PAID"
                        : paymentStatus === "pending"
                        ? "PENDING"
                        : "FAILED"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Renter Info */}
          {booking.renter && typeof booking.renter === "object" && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Renter Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Full Name</p>
                  <p className="font-semibold text-gray-900">
                    {booking.renter.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Email</p>
                  <p className="font-semibold text-gray-900">
                    {booking.renter.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Phone Number</p>
                  <p className="font-semibold text-gray-900">
                    {booking.renter.phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/profile")}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaCar />
            My Bookings
          </button>

          <button
            onClick={() => window.print()}
            className="bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaDownload />
            Print Receipt
          </button>

          <button
            onClick={() => navigate("/vehicles")}
            className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <FaArrowLeft />
            Back to Vehicles
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
