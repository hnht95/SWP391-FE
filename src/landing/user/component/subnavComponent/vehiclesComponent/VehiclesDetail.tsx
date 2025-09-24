import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { carData } from "../../../../../data/carData";
import ImageGallery from "./vehiclesDetailComponent/ImageGallery";
import Specifications from "./vehiclesDetailComponent/Specifications";
import Description from "./vehiclesDetailComponent/Description";
import CarFeatures from "./vehiclesDetailComponent/CarFeatures";
import RentalDocument from "./vehiclesDetailComponent/RentalDocument";
import RentalOptions from "./vehiclesDetailComponent/RentalOptions";

const VehiclesDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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

  const carImages = [
    car.image,
    "https://via.placeholder.com/1000x700/87CEEB/FFFFFF?text=Interior+View",
    "https://via.placeholder.com/1000x700/90EE90/000000?text=Rear+View",
    "https://via.placeholder.com/1000x700/F08080/FFFFFF?text=Dashboard",
  ];

  const similarCars = carData
    .filter((c) => c.id !== car.id && c.type === car.type)
    .slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Left Column: Image Gallery, Features, and Rental Documents */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <ImageGallery images={carImages} vehicleName={car.name} />
          <Description description={car.description} />
          <CarFeatures />

          <RentalDocument />
        </div>

        {/* Right Column: Vehicle Info, Specs, Description, and Renting Options */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-2">{car.name}</h1>

            <Specifications
              transmission={car.transmission}
              seats={car.seats}
              fuelType={car.type}
              fuelConsumption="7L/100km"
              mileage="50,000 km"
              engine="2.0L"
            />

            <div className="mt-6 space-y-4">
              <p className="text-2xl font-semibold text-green-600 mb-4">
                {car.price} $/day
              </p>
              <button className="w-full py-3 bg-black cursor-pointer text-white font-semibold rounded-lg hover:bg-grey-700 transition-colors">
                Rent Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiclesDetail;
