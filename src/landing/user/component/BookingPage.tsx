// pages/BookingPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import {
  getVehicleById,
  type Vehicle,
} from "../../../service/apiAdmin/apiVehicles/API";
import type { Station } from "../../../service/apiAdmin/apiStation/API";
import { createBooking } from "../../../service/apiBooking/API";
import {
  FaArrowLeft,
  FaBatteryFull,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCarSide,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCreditCard,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { DateTimePicker } from "../../../components/DateTimePicker";

const BookingPage: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);

  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("10:00");

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) {
        setError("No vehicle ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await getVehicleById(vehicleId);
        console.log("Fetched vehicle for booking:", data);
        setVehicle(data);
      } catch (err: any) {
        console.error("Failed to fetch vehicle:", err);
        setError(err.message || "Failed to load vehicle details");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [vehicleId]);

  // ✅ NEW: Calculate duration with days + hours
  const calculateDurationDetails = () => {
    if (!pickupDate || !returnDate) {
      return { totalHours: 0, days: 0, hours: 0 };
    }

    const start = new Date(`${pickupDate}T${pickupTime}`);
    const end = new Date(`${returnDate}T${returnTime}`);

    // Calculate total hours difference
    const diffMs = Math.abs(end.getTime() - start.getTime());
    const totalHours = diffMs / (1000 * 60 * 60); // Convert ms to hours

    // Calculate full days and remaining hours
    const days = Math.floor(totalHours / 24);
    const hours = Math.ceil(totalHours % 24); // Round up remaining hours

    return { totalHours, days, hours };
  };

  // ✅ NEW: Calculate rental cost based on days + hours
  const calculateRentalCost = () => {
    if (!vehicle) return 0;

    const { days, hours } = calculateDurationDetails();

    // Calculate cost for full days
    const dayCost = days * vehicle.pricePerDay;

    // Calculate cost for remaining hours (if any)
    const hourCost = hours > 0 ? hours * vehicle.pricePerHour : 0;

    return dayCost + hourCost;
  };

  const calculateDeposit = () => {
    if (!vehicle?.valuation?.valueVND) return 0;
    return Math.round(vehicle.valuation.valueVND * 0.015);
  };

  const durationDetails = calculateDurationDetails();
  const depositAmount = calculateDeposit();
  const totalPrice = calculateRentalCost();
  const grandTotal = totalPrice + depositAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!pickupDate || !returnDate) {
      setFormError("Please select pickup and return dates");
      return;
    }

    const startDateTime = new Date(`${pickupDate}T${pickupTime}`);
    const endDateTime = new Date(`${returnDate}T${returnTime}`);

    if (endDateTime <= startDateTime) {
      setFormError("Return date/time must be after pickup date/time");
      return;
    }

    if (!vehicleId) {
      setFormError("Vehicle ID is missing");
      return;
    }

    try {
      setSubmitting(true);

      const response = await createBooking({
        vehicleId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        deposit: {
          provider: "payos",
        },
      });

      console.log("✅ Booking created successfully:", response);

      setBookingData(response);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("❌ Failed to create booking:", err);
      setFormError(
        err.message || "Failed to create booking. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceedToPayment = () => {
    console.log("🔄 Proceeding to payment with data:", bookingData);

    if (!bookingData) {
      console.error("❌ No booking data available");
      return;
    }

    const bookingIdToUse = bookingData._id;

    if (!bookingIdToUse) {
      console.error("❌ No booking ID found:", bookingData);
      return;
    }

    console.log("✅ Navigating to payment page:", bookingIdToUse);

    navigate(`/payment/${bookingIdToUse}`, {
      state: {
        booking: bookingData,
        vehicle: vehicle,
        calculatedTotals: {
          dailyRate: vehicle?.pricePerDay || 0,
          hourlyRate: vehicle?.pricePerHour || 0,
          durationDays: durationDetails.days,
          durationHours: durationDetails.hours,
          rentalCost: totalPrice,
          deposit: depositAmount,
          total: grandTotal,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading vehicle...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error || "Vehicle Not Found"}
          </h1>
          <button
            onClick={() => navigate("/vehicles")}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 inline-flex items-center gap-2"
          >
            <FaArrowLeft />
            Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  const station =
    typeof vehicle.station === "object" ? (vehicle.station as Station) : null;

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-black/80 via-black/50 to-black/10 text-white py-16">
          <div className="max-w-6xl mx-auto p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold mb-3">Complete Your Booking</h1>
              <p className="text-white/70 text-lg">
                Reserve your {vehicle.brand} {vehicle.model}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 -mt-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Vehicle Info - Takes 2 columns */}
                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    {/* Vehicle Image Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="relative h-80 rounded-2xl overflow-hidden shadow-lg"
                    >
                      {vehicle.defaultPhotos?.exterior?.[0] ? (
                        <img
                          src={
                            typeof vehicle.defaultPhotos.exterior[0] ===
                            "string"
                              ? vehicle.defaultPhotos.exterior[0]
                              : vehicle.defaultPhotos.exterior[0].url
                          }
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            <FaCarSide className="text-6xl mb-2 mx-auto" />
                            <p className="text-sm">No image available</p>
                          </div>
                        </div>
                      )}

                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                        <h3 className="font-bold text-xl text-gray-900">
                          {vehicle.brand} {vehicle.model}
                        </h3>
                        <p className="text-sm text-gray-600">{vehicle.year}</p>
                      </div>

                      {/* ✅ Updated Price Badge - Show both rates */}
                      <div className="absolute bottom-4 right-4 bg-black/90 backdrop-blur-sm rounded-xl px-5 py-3 shadow-lg">
                        <p className="text-xl font-bold text-white">
                          {vehicle.pricePerDay.toLocaleString()}đ/day
                        </p>
                        <p className="text-sm text-white/90">
                          {vehicle.pricePerHour.toLocaleString()}đ/hour
                        </p>
                      </div>
                    </motion.div>

                    {/* Quick Info Grid */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                    >
                      <div className="rounded-xl p-4 border border-slate-100 shadow">
                        <p className="text-xs text-blue-600 font-medium mb-1">
                          Plate Number
                        </p>
                        <p className="font-bold text-blue-900">
                          {vehicle.plateNumber}
                        </p>
                      </div>
                      <div className="rounded-xl p-4 border border-slate-100 shadow">
                        <p className="text-xs text-purple-600 font-medium mb-1">
                          Year
                        </p>
                        <p className="font-bold text-purple-900">
                          {vehicle.year}
                        </p>
                      </div>
                      <div className="rounded-xl p-4 border border-slate-100 shadow">
                        <div className="flex items-center gap-2">
                          <FaBatteryFull className="text-green-600" />
                          <div>
                            <p className="text-xs text-green-600 font-medium">
                              Battery
                            </p>
                            <p className="font-bold text-green-900">
                              {vehicle.batteryCapacity}%
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl p-4 border border-slate-100 shadow">
                        <p className="text-xs text-orange-600 font-medium mb-1">
                          Mileage
                        </p>
                        <p className="font-bold text-orange-900">
                          {vehicle.mileage.toLocaleString()} km
                        </p>
                      </div>
                    </motion.div>

                    {/* Location Card */}
                    {station && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="border border-slate-200 rounded-2xl p-6"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FaMapMarkerAlt className="text-white text-xl" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-1">
                              Pickup Location
                            </p>
                            <p className="font-bold text-lg mb-1">
                              {station.name}
                            </p>
                            <p className="text-sm">
                              {station.location.address}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Deposit Info */}
                    {vehicle.valuation?.valueVND && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="border border-slate-200 rounded-2xl p-6"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FaMoneyBillWave className="text-white text-xl" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-1">
                              Security Deposit
                            </p>
                            <p className="font-bold text-lg">
                              1.5% of vehicle value
                            </p>
                            <p className="text-sm mt-1">
                              Refundable upon return in original condition
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Booking Form */}
                <div className="lg:col-span-1">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="sticky top-24 space-y-6"
                  >
                    {/* User Info Card */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold">
                          {user?.name?.charAt(0).toUpperCase() || "G"}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">
                            Booking for
                          </p>
                          <p className="font-bold text-gray-900">
                            {user?.name || "Guest"}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {user?.email || "No email"}
                      </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                      {/* Pickup Date & Time */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Pickup Date & Time *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <DateTimePicker
                            type="date"
                            value={pickupDate}
                            onChange={(value) => {
                              setPickupDate(value);
                              setFormError("");
                            }}
                            label="Pickup Date"
                            minDate={new Date().toISOString().split("T")[0]}
                          />
                          <DateTimePicker
                            type="time"
                            value={pickupTime}
                            onChange={(value) => {
                              setPickupTime(value);
                              setFormError("");
                            }}
                            label="Pickup Time"
                          />
                        </div>
                      </div>

                      {/* Return Date & Time */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Return Date & Time *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <DateTimePicker
                            type="date"
                            value={returnDate}
                            onChange={(value) => {
                              setReturnDate(value);
                              setFormError("");
                            }}
                            label="Return Date"
                            minDate={
                              pickupDate ||
                              new Date().toISOString().split("T")[0]
                            }
                          />
                          <DateTimePicker
                            type="time"
                            value={returnTime}
                            onChange={(value) => {
                              setReturnTime(value);
                              setFormError("");
                            }}
                            label="Return Time"
                          />
                        </div>
                      </div>

                      {/* ✅ UPDATED Booking Summary */}
                      <div className="shadow border-slate-200 rounded-2xl p-6 text-black">
                        <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
                          <FaCreditCard className="text-black text-lg" />
                          Booking Summary
                        </h3>
                        <div className="space-y-3 text-sm">
                          {/* Daily Rate */}
                          <div className="flex justify-between items-center pb-3 border-b border-black/10">
                            <span className="text-black/70">Daily Rate</span>
                            <span className="font-semibold">
                              {vehicle.pricePerDay.toLocaleString()}đ
                            </span>
                          </div>

                          {/* Hourly Rate */}
                          <div className="flex justify-between items-center pb-3 border-b border-black/10">
                            <span className="text-black/70">Hourly Rate</span>
                            <span className="font-semibold">
                              {vehicle.pricePerHour.toLocaleString()}đ
                            </span>
                          </div>

                          {/* Duration Breakdown */}
                          <div className="flex justify-between items-center pb-3 border-b border-black/10">
                            <span className="text-black/70">Duration</span>
                            <div className="text-right">
                              {durationDetails.days > 0 && (
                                <div className="font-semibold">
                                  {durationDetails.days} day
                                  {durationDetails.days !== 1 ? "s" : ""}
                                </div>
                              )}
                              {durationDetails.hours > 0 && (
                                <div className="font-semibold text-blue-600">
                                  + {durationDetails.hours} hour
                                  {durationDetails.hours !== 1 ? "s" : ""}
                                </div>
                              )}
                              {durationDetails.days === 0 &&
                                durationDetails.hours === 0 && (
                                  <span className="font-semibold text-gray-400">
                                    Select dates
                                  </span>
                                )}
                            </div>
                          </div>

                          {/* Rental Cost Breakdown */}
                          <div className="flex justify-between items-center pb-3 border-b border-black/10">
                            <span className="text-black/70">Rental Cost</span>
                            <div className="text-right">
                              {durationDetails.days > 0 && (
                                <div className="text-xs text-gray-600">
                                  {durationDetails.days} ×{" "}
                                  {vehicle.pricePerDay.toLocaleString()}đ
                                </div>
                              )}
                              {durationDetails.hours > 0 && (
                                <div className="text-xs text-blue-600">
                                  + {durationDetails.hours} ×{" "}
                                  {vehicle.pricePerHour.toLocaleString()}đ
                                </div>
                              )}
                              <div className="font-semibold">
                                {totalPrice.toLocaleString()}đ
                              </div>
                            </div>
                          </div>

                          {/* Deposit */}
                          <div className="flex justify-between items-center pb-3 border-b border-black/10">
                            <span className="text-black/70">
                              Security Deposit (1.5%)
                            </span>
                            <span className="font-semibold">
                              {depositAmount.toLocaleString()}đ
                            </span>
                          </div>

                          {/* Total */}
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-lg font-bold">Total</span>
                            <span className="text-2xl font-bold text-green-400">
                              {grandTotal.toLocaleString()}đ
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Error Message */}
                      <AnimatePresence>
                        {formError && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3"
                          >
                            <FaExclamationTriangle className="text-red-600 text-lg mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-red-800 font-semibold">
                                {formError}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={vehicle.status !== "available" || submitting}
                        className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-300 ${
                          vehicle.status === "available" && !submitting
                            ? "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg transform hover:-translate-y-0.5"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {submitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            Processing...
                          </span>
                        ) : vehicle.status === "available" ? (
                          "Proceed to Payment →"
                        ) : (
                          "Vehicle Not Available"
                        )}
                      </button>
                    </form>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-20"></div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && bookingData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-9999 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="bg-white border-b border-slate-200 p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <FaCheckCircle className="w-10 h-10 text-emerald-600" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">
                  Booking Confirmed!
                </h2>
                <p className="text-gray-600">
                  Your reservation has been created successfully
                </p>
              </div>

              <div className="p-8">
                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">
                    Booking Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Booking ID</span>
                      <span className="font-mono font-semibold text-gray-900">
                        {bookingData._id.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Status</span>
                      <span className="capitalize font-semibold text-green-600">
                        {bookingData.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Vehicle</span>
                      <span className="font-semibold text-gray-900">
                        {vehicle?.brand} {vehicle?.model}
                      </span>
                    </div>
                    {/* ✅ Show duration breakdown in modal */}
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-semibold text-gray-900">
                        {durationDetails.days > 0 &&
                          `${durationDetails.days}d `}
                        {durationDetails.hours > 0 &&
                          `${durationDetails.hours}h`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-semibold">
                        Total Amount
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        {grandTotal.toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-6 text-center">
                  Complete the payment process to confirm your reservation
                </p>

                <button
                  onClick={handleProceedToPayment}
                  className="w-full bg-black text-white py-4 px-6 rounded-xl font-bold text-base hover:bg-gray-800 transition-all duration-300 shadow-lg"
                >
                  Proceed to Payment →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BookingPage;
