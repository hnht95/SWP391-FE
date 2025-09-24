// src/components/vehicle/RentingOptions.tsx
import React, { useState } from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import InsuranceModal from "./InsuranceModal";

interface RentingOptionsProps {
  pricePerDay: number;
}

const RentingOptions: React.FC<RentingOptionsProps> = ({ pricePerDay }) => {
  const [pickupDate, setPickupDate] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);

  // Hardcoded prices for demonstration
  const pricing = {
    daily: pricePerDay,
    weekly: pricePerDay * 7,
    monthly: pricePerDay * 30,
    yearly: pricePerDay * 365,
  };

  const calculateTotalPrice = () => {
    if (!pickupDate || !dropoffDate) return 0;
    const oneDay = 24 * 60 * 60 * 1000;
    const pickup = new Date(pickupDate).getTime();
    const dropoff = new Date(dropoffDate).getTime();
    const diffDays = Math.round(Math.abs((dropoff - pickup) / oneDay));
    return diffDays * pricePerDay;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
      <h2 className="text-2xl font-bold mb-4">Renting Options</h2>

      {/* Price Display */}
      <div className="mb-6">
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600">Daily</span>
          <span className="font-bold">${pricing.daily}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600">Weekly</span>
          <span className="font-bold">${pricing.weekly}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600">Monthly</span>
          <span className="font-bold">${pricing.monthly}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Yearly</span>
          <span className="font-bold">${pricing.yearly}</span>
        </div>
      </div>

      {/* Date Pickers */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Pickup Date */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-1 flex items-center gap-2">
            <FaCalendarAlt /> Pickup Date
          </label>
          <input
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Drop-off Date */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-1 flex items-center gap-2">
            <FaCalendarAlt /> Drop-off Date
          </label>
          <input
            type="date"
            value={dropoffDate}
            onChange={(e) => setDropoffDate(e.target.value)}
            min={pickupDate}
            disabled={!pickupDate}
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Insurance Modal Trigger (Optional, can be placed here) */}
      <button
        onClick={() => setIsInsuranceModalOpen(true)}
        className="w-full text-blue-500 hover:underline mb-4 text-left"
      >
        View Insurance Details
      </button>

      {/* Total Price & Book Now */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-xl font-bold">Total:</span>
        <span className="text-xl font-bold">${calculateTotalPrice()}</span>
      </div>

      <button className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-all mt-4">
        Book Now
      </button>

      {/* Insurance Modal */}
      <InsuranceModal
        isOpen={isInsuranceModalOpen}
        onClose={() => setIsInsuranceModalOpen(false)}
      />
    </div>
  );
};

export default RentingOptions;
