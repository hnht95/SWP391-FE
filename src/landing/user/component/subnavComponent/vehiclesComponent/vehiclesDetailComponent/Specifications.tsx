// src/components/vehicle/Specifications.tsx
import React from "react";
import {
  MdOutlineSpeed,
  MdOutlineDirectionsCar,
  MdOutlineLocalGasStation,
  MdOutlineEventSeat,
} from "react-icons/md";
import { FaCalendarAlt, FaCarSide, FaCogs } from "react-icons/fa";

interface SpecificationsProps {
  transmission: string;
  seats: number;
  fuelType: string;
  fuelConsumption: string;
  mileage: string;
  engine: string;
}

const Specifications: React.FC<SpecificationsProps> = ({
  transmission,
  seats,
  fuelType,
  fuelConsumption,
  mileage,
  engine,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4">Specifications</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="flex flex-col items-center p-2 border rounded-lg">
          <MdOutlineSpeed size={32} className="text-gray-600 mb-1" />
          <span className="text-sm font-semibold">Transmission</span>
          <span className="text-sm text-gray-500">{transmission}</span>
        </div>
        <div className="flex flex-col items-center p-2 border rounded-lg">
          <MdOutlineEventSeat size={32} className="text-gray-600 mb-1" />
          <span className="text-sm font-semibold">Seats</span>
          <span className="text-sm text-gray-500">{seats}</span>
        </div>
        <div className="flex flex-col items-center p-2 border rounded-lg">
          <MdOutlineLocalGasStation size={32} className="text-gray-600 mb-1" />
          <span className="text-sm font-semibold">Fuel Type</span>
          <span className="text-sm text-gray-500">{fuelType}</span>
        </div>

        <div className="flex flex-col items-center p-2 border rounded-lg">
          <FaCalendarAlt size={32} className="text-gray-600 mb-1" />
          <span className="text-sm font-semibold">Mileage</span>
          <span className="text-sm text-gray-500">{mileage}</span>
        </div>
      </div>
    </div>
  );
};

export default Specifications;
