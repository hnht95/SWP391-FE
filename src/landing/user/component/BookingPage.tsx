import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { carData } from "../../../data/carData";

const BookingPage = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const vehicle = carData.find((car) => car.id === parseInt(vehicleId || ""));

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Vehicle Not Found
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="border-b pb-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Book Your Vehicle
            </h1>
            <p className="text-gray-600 mt-2">
              Complete your booking for {vehicle.name}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vehicle Info */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Vehicle Details</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="font-bold text-lg">{vehicle.name}</h3>
                <p className="text-gray-600">{vehicle.location}</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  ${vehicle.price}/day
                </p>

                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <span className="font-medium">Transmission:</span>
                    <p>{vehicle.transmission}</p>
                  </div>
                  <div>
                    <span className="font-medium">Seats:</span>
                    <p>{vehicle.seats} people</p>
                  </div>
                  <div>
                    <span className="font-medium">Range:</span>
                    <p>{vehicle.range}</p>
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>
                    <p>{vehicle.type}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Booking Information
              </h2>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">Booking for:</h3>
                <p className="text-blue-800">{user?.name}</p>
                <p className="text-blue-700 text-sm">{user?.email}</p>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Return Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Location
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select pickup location</option>
                    <option value={vehicle.location}>
                      {vehicle.location} (Default)
                    </option>
                    <option value="downtown">Downtown Office</option>
                    <option value="airport">Airport</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requirements (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any special requirements or notes..."
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Booking Summary</h3>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span>Daily Rate:</span>
                    <span>${vehicle.price}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span>Duration:</span>
                    <span>1 day(s)</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span>Insurance:</span>
                    <span>$15</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between items-center font-bold">
                    <span>Total:</span>
                    <span>${vehicle.price + 15}</span>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Booking submitted! (This is a demo)");
                      navigate("/");
                    }}
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
