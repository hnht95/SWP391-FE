// src/components/vehicle/VehicleHeader.tsx
import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

interface VehicleHeaderProps {
  name: string;
  station: string;
  location: string;
}

const VehicleHeader: React.FC<VehicleHeaderProps> = ({
  name,
  station,
  location,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-3xl font-bold mb-2">{name}</h1>
      <div className="flex items-center text-gray-600">
        <FaMapMarkerAlt className="text-gray-400 mr-2" />
        <span className="text-lg">
          {station} - {location}
        </span>
      </div>
    </div>
  );
};

export default VehicleHeader;
