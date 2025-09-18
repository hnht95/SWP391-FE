import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { carData } from "../../../../../data/carData";

interface Car {
  id: number;
  name: string;
  price: number;
  transmission: string;
  seats: number;
  range: string;
  image: string;
  location: string;
  station?: string;
  type: string;
}

const VehiclesDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Lấy id từ URL
  const navigate = useNavigate();

  const car = carData.find((c) => c.id === parseInt(id || ""));

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <h1 className="text-2xl font-bold">Vehicle Not Found</h1>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col lg:flex-row items-center">
        {/* Car Image */}
        <div className="lg:w-1/2 w-full mb-6 lg:mb-0">
          <img
            src={car.image}
            alt={car.name}
            className="w-full h-auto object-contain rounded-xl"
          />
        </div>

        {/* Car Details */}
        <div className="lg:w-1/2 w-full lg:pl-12">
          <h1 className="text-4xl font-bold mb-2">{car.name}</h1>
          <p className="text-xl text-gray-700 mb-4">${car.price}/day</p>

          <div className="grid grid-cols-2 gap-4 text-gray-600 mb-6">
            <p>
              <strong>Transmission:</strong> {car.transmission}
            </p>
            <p>
              <strong>Seats:</strong> {car.seats}
            </p>
            <p>
              <strong>Range:</strong> {car.range}
            </p>
            <p>
              <strong>Location:</strong> {car.location}
            </p>
            {car.station && (
              <p>
                <strong>Station:</strong> {car.station}
              </p>
            )}
            <p>
              <strong>Type:</strong> {car.type}
            </p>
          </div>

          <p className="text-gray-500 mb-8">
            This {car.name} offers a smooth and powerful ride, perfect for both
            city commutes and long road trips. With its spacious interior and
            advanced features, you'll experience comfort and efficiency like
            never before.
          </p>

          <div className="flex space-x-4">
            <button className="flex-1 bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-all">
              Book Now
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-200 text-black font-bold py-3 rounded-lg hover:bg-gray-300 transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiclesDetail;
