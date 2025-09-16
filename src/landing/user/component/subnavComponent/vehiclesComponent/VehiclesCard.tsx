import React from "react";

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
}

interface CarCardProps {
  car: Car;
}

const VehiclesCard: React.FC<CarCardProps> = ({ car }) => {
  return (
    <div
      key={car.id}
      className="border rounded-2xl shadow-md p-4 bg-white hover:shadow-2xl transition-all duration-200"
    >
      <img
        src={car.image}
        alt={car.name}
        className="w-full h-40 object-contain mb-4"
      />
      <h3 className="text-lg font-semibold mb-2">{car.name}</h3>
      <p className="text-gray-600 mb-2">${car.price}/day</p>
      <div className="flex justify-between text-sm text-gray-500 mb-2">
        <span>{car.transmission}</span>
        <span>{car.seats} Seats</span>
        <span>{car.range}</span>
      </div>
      <button className="w-full bg-black text-white py-2 mt-2 rounded-lg hover:bg-gray-800 transition-all">
        Rent Now
      </button>
    </div>
  );
};

export default VehiclesCard;
