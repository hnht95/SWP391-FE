import React, { useState } from "react";
import { GoArrowUpRight } from "react-icons/go";
import VehiclesCard from "../subnavComponent/vehiclesComponent/VehiclesCard";
import BrandCard from "./BrandCard";
import { brandData } from "../../../../data/brandData";
import { carData } from "../../../../data/carData";
import hcm from "../../../../assets/homepage/carCatalogue/hcm.png";
import hanoi from "../../../../assets/homepage/carCatalogue/hanoi.png";
import vungtau from "../../../../assets/homepage/carCatalogue/vungtau.png";
import nhatrang from "../../../../assets/homepage/carCatalogue/nhatrang.png";
import phanthiet from "../../../../assets/homepage/carCatalogue/phanthiet.png";
import danang from "../../../../assets/homepage/carCatalogue/danang.png";

// Mảng các địa điểm và đường dẫn hình ảnh tương ứng
const locations = [
  { name: "Tp.HCM", image: hcm },
  { name: "Hà Nội", image: hanoi },
  { name: "Đà Nẵng", image: danang },
  { name: "Phan Thiết", image: phanthiet },
  { name: "Nha Trang", image: nhatrang },
  { name: "Vũng Tàu", image: vungtau },
];

export default function CarCatalogue() {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showAllBrands, setShowAllBrands] = useState(false);
  const displayedBrands = showAllBrands ? brandData : brandData.slice(0, 6);

  // Xóa filter để hiển thị tất cả xe
  // const filteredCars = carData.filter(
  //   (car) => car.location === selectedLocation && car.type === "EV"
  // );

  return (
    <div className="p-6">
      {/* Location Section */}
      <h2 className="text-2xl font-bold mb-4">Renting Station Location</h2>
      <p className="text-gray-500 mb-6">
        Explore station available in different locations!
      </p>

      <div className="flex gap-4 overflow-x-auto border-radius pb-4 -mx-6 px-6 sm:mx-0 sm:px-0">
        {locations.map((loc) => (
          <div
            key={loc.name}
            onClick={() => setSelectedLocation(loc.name)}
            className={`
        flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-8px)] md:w-60 h-48 rounded-xl overflow-hidden cursor-pointer relative shadow-lg
        transition-all duration-300 transform hover:scale-105
        ${
          selectedLocation === loc.name
            ? "ring-4 ring-gray-600 ring-offset-2"
            : ""
        }
      `}
          >
            <img
              src={loc.image}
              alt={loc.name}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
              <span className="text-white text-lg font-bold">{loc.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Brands Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Explore our premium brands!</h2>
          <button
            onClick={() => setShowAllBrands(!showAllBrands)}
            className="flex items-center text-black-600 hover:text-black-800 font-semibold transition-colors duration-200 cursor-pointer"
          >
            {showAllBrands ? "Show Less" : "Show All Brands"}
            <GoArrowUpRight
              className={`ml-1 transition-transform duration-300 ${
                showAllBrands ? "rotate-90" : ""
              }`}
            />
          </button>
        </div>

        <div
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mt-6
          transition-all duration-500 ease-in-out overflow-hidden
          ${showAllBrands ? "max-h-[1100px]" : "max-h-[250px]"}`}
        >
          {displayedBrands.map((brand) => (
            <BrandCard key={brand.name} brand={brand} />
          ))}
        </div>
      </div>
    </div>
  );
}
