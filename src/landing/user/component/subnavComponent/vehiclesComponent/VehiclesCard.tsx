import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GiGearStick, GiCarSeat } from "react-icons/gi";
import { RiGasStationFill } from "react-icons/ri";

interface Car {
  id: number;
  name: string;
  price: number;
  transmission: string;
  seats: number;
  range: string;
  image: string;
  location: string;
  type: string;
  station?: string;
}

interface CarCardProps {
  car: Car;
}

const VehiclesCard: React.FC<CarCardProps> = ({ car }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false); // State to track hover

  const handleImageClick = () => {
    navigate(`/vehicles/${car.id}`);
  };

  const handleRentNowClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents the card's onClick from firing
    console.log("Rent Now clicked for car ID:", car.id);
  };

  return (
    <div
      key={car.id}
      className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)} // Set state on hover
      onMouseLeave={() => setIsHovered(false)} // Reset state on mouse leave
    >
      <div className="bg-gray-50">
        <div className="  left-4 z-10 pl-3 pt-3">
          <h3 className="text-xl font-bold text-gray-800">{car.name}</h3>
          <p className="text-sm font-bold text-gray-900">
            {car.station} ({car.location})
          </p>
        </div>
        <div
          onClick={handleImageClick}
          className="relative w-full h-50 flex items-center justify-center p-2  overflow-hidden cursor-pointer"
        >
          <img
            src={car.image}
            alt={car.name}
            className="max-h-full max-w-full object-contain transition-transform duration-300 transform scale-100 hover:scale-105"
          />
        </div>
        {/* Đã thay đổi các lớp CSS tại đây */}
        <div className=" left-4 z-10 pl-3 pb-3">
          <span className="text-xl font-bold">${car.price}</span>
          <span className="text-sm font-normal text-gray-500">/day</span>
        </div>
      </div>
      {/* Car Image (Clickable for details) */}

      {/* Conditional Rendering based on hover state */}
      {/* {!isHovered ? ( */}

      <div className="p-4 flex flex-col items-center justify-center text-gray-600 text-sm">
        <div className="grid grid-cols-3 gap-2 w-full">
          <div className="flex flex-col items-center">
            <GiGearStick className="text-xl text-gray-500 mb-1" />
            <span>{car.transmission}</span>
          </div>
          <div className="flex flex-col items-center">
            <GiCarSeat className="text-xl text-gray-500 mb-1" />
            <span>{car.seats} Seats</span>
          </div>
          <div className="flex flex-col items-center">
            <RiGasStationFill className="text-xl text-gray-500 mb-1" />
            <span>{car.range}</span>
          </div>
        </div>
      </div>
      {/* ) : ( */}
      <div className="p-2 flex items-center justify-center">
        <button
          onClick={handleRentNowClick}
          className="w-full py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-700 transition-all"
        >
          Rent Now
        </button>
      </div>
      {/* )} */}
    </div>
  );
};

export default VehiclesCard;
