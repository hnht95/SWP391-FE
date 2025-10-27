import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import {
  getVehicleById,
  type Vehicle,
} from "../../../service/apiAdmin/apiVehicles/API";
import type { Station } from "../../../service/apiAdmin/apiStation/API";
import { createBooking } from "../../../service/apiBooking/API";
import { FaArrowLeft, FaBatteryFull, FaCheckCircle } from "react-icons/fa";

const BookingPage: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // ✅ Modal state
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

  const calculateDuration = () => {
    if (!pickupDate || !returnDate) return 0;
    const start = new Date(`${pickupDate}T${pickupTime}`);
    const end = new Date(`${returnDate}T${returnTime}`);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const duration = calculateDuration();
  const depositAmount = 500000;
  const totalPrice = vehicle ? duration * vehicle.pricePerDay : 0;
  const grandTotal = totalPrice + depositAmount;

  // ✅ Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pickupDate || !returnDate) {
      alert("Please select pickup and return dates");
      return;
    }

    const startDateTime = new Date(`${pickupDate}T${pickupTime}`);
    const endDateTime = new Date(`${returnDate}T${returnTime}`);

    if (endDateTime <= startDateTime) {
      alert("Return date/time must be after pickup date/time");
      return;
    }

    if (!vehicleId) {
      alert("Vehicle ID is missing");
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

      // ✅ Store booking data and show modal
      setBookingData(response);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("❌ Failed to create booking:", err);
      alert(err.message || "Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Navigate to payment page
  const handleProceedToPayment = () => {
    if (bookingData?.bookingId) {
      navigate(`/payment/${bookingData.bookingId}`, {
        state: {
          booking: bookingData,
          vehicle: vehicle,
        },
      });
    }
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
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* ... Rest of the form (same as before) ... */}

            <div className="border-b pb-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Book Your Vehicle
              </h1>
              <p className="text-gray-600 mt-2">
                Complete your booking for {vehicle.brand} {vehicle.model}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Vehicle Info - Same as before */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Vehicle Details</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    {vehicle.defaultPhotos?.exterior?.[0]?.url ? (
                      <img
                        src={vehicle.defaultPhotos.exterior[0].url}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <p className="text-4xl mb-2">🚗</p>
                        <p className="text-sm">No image available</p>
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-lg">
                    {vehicle.brand} {vehicle.model}
                  </h3>

                  {station && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium mb-1">
                        Pickup Location
                      </p>
                      <p className="text-blue-900 font-semibold">
                        📍 {station.name}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {station.location.address}
                      </p>
                    </div>
                  )}

                  <p className="text-2xl font-bold text-green-600 mt-4">
                    {vehicle.pricePerDay.toLocaleString()}đ
                    <span className="text-sm font-normal text-gray-600">
                      /day
                    </span>
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">
                        Plate Number:
                      </span>
                      <p className="font-semibold">{vehicle.plateNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Year:</span>
                      <p className="font-semibold">{vehicle.year}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Battery:
                      </span>
                      <p className="flex items-center gap-1 font-semibold">
                        <FaBatteryFull className="text-green-500" />
                        {vehicle.batteryCapacity}%
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Mileage:
                      </span>
                      <p className="font-semibold">
                        {vehicle.mileage.toLocaleString()} km
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Form - Same as before */}
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Booking Information
                </h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-blue-900 mb-2">
                    Booking for:
                  </h3>
                  <p className="text-blue-800 font-semibold">
                    {user?.name || "Guest"}
                  </p>
                  <p className="text-blue-700 text-sm">
                    {user?.email || "No email"}
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Date & Time *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                      <input
                        type="time"
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Return Date & Time *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        min={
                          pickupDate || new Date().toISOString().split("T")[0]
                        }
                        required
                      />
                      <input
                        type="time"
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold mb-3 text-gray-900">
                      Booking Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Daily Rate:</span>
                        <span className="font-medium">
                          {vehicle.pricePerDay.toLocaleString()}đ
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">
                          {duration || 0} day(s)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">
                          {totalPrice.toLocaleString()}đ
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-blue-600">
                        <span>Deposit (5%):</span>
                        <span className="font-medium">
                          {depositAmount.toLocaleString()}đ
                        </span>
                      </div>
                      <hr className="my-2 border-gray-300" />
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-green-600">
                          {grandTotal.toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      disabled={submitting}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <FaArrowLeft />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={vehicle.status !== "available" || submitting}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2 ${
                        vehicle.status === "available" && !submitting
                          ? "bg-black text-white hover:bg-gray-800"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Processing...
                        </>
                      ) : vehicle.status === "available" ? (
                        "Proceed to Payment"
                      ) : (
                        "Not Available"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Success Modal */}
      {showSuccessModal && bookingData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center">
              <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Booking Created Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your booking has been created. Please proceed to payment to
                confirm your reservation.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Booking Details:
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-600">Booking ID:</span>{" "}
                    <span className="font-mono">{bookingData.bookingId}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Status:</span>{" "}
                    <span className="capitalize">{bookingData.status}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Vehicle:</span>{" "}
                    {vehicle?.brand} {vehicle?.model}
                  </p>
                  <p>
                    <span className="text-gray-600">Total:</span>{" "}
                    {grandTotal.toLocaleString()}đ
                  </p>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingPage;
