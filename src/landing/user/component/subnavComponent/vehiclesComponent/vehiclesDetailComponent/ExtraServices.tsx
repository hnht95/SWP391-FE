// src/components/vehicle/ExtraServices.tsx
import React from "react";
import { FaWifi, FaRoad, FaCouch, FaTools, FaGasPump } from "react-icons/fa";
import { AiFillCar } from "react-icons/ai";
import { GiGps } from "react-icons/gi";

const extraServicesData = [
  { name: "GPS Navigation", icon: <GiGps size={24} /> },
  { name: "Wi-fi Hotspot", icon: <FaWifi size={24} /> },
  { name: "Child Safety Seats", icon: <FaCouch size={24} /> },
  { name: "Fuel Options", icon: <FaGasPump size={24} /> },
  { name: "Roadside Assistance", icon: <FaRoad size={24} /> },
  { name: "Satellite Radio", icon: <AiFillCar size={24} /> },
  { name: "Additional Accessories", icon: <FaTools size={24} /> },
  { name: "Express Check-in/out", icon: <AiFillCar size={24} /> },
];

const ExtraServices: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4">Extra Services</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {extraServicesData.map((service, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-gray-600">{service.icon}</span>
            <span className="text-gray-800">{service.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtraServices;
