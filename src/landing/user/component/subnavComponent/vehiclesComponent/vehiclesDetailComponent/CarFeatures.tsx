// src/components/vehicle/CarFeatures.tsx
import React from "react";
import {
  FaBluetooth,
  FaUsb,
  FaCamera,
  FaKey,
  FaAirFreshener,
} from "react-icons/fa";
import { GiKeyring } from "react-icons/gi";
import { MdOutlineAirlineSeatReclineExtra } from "react-icons/md";
import { BsSnow } from "react-icons/bs";

const featuresData = [
  { name: "Bluetooth", icon: <FaBluetooth size={24} /> },
  { name: "USB port", icon: <FaUsb size={24} /> },
  { name: "Backup Camera", icon: <FaCamera size={24} /> },
  { name: "Keyless Entry", icon: <FaKey size={24} /> },
  { name: "Air Conditioning", icon: <BsSnow size={24} /> },
  { name: "Sunroof", icon: <GiKeyring size={24} /> },
  { name: "Extra Seats", icon: <MdOutlineAirlineSeatReclineExtra size={24} /> },
  { name: "Scented Air", icon: <FaAirFreshener size={24} /> },
];

const CarFeatures: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4">Car Features</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {featuresData.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-gray-600">{feature.icon}</span>
            <span className="text-gray-800">{feature.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarFeatures;
