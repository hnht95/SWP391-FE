import React, { useState } from "react";

// Dữ liệu xe hơi đã cung cấp
const carData = [
  {
    id: 1,
    name: "Tesla Model S",
    price: 85,
    transmission: "Auto",
    seats: 5,
    range: "396 mi",
    image: "/cars/tesla-model-s.png",
    location: "Tp.HCM",
    type: "EV",
  },
  {
    id: 2,
    name: "VinFast VF8",
    price: 70,
    transmission: "Auto",
    seats: 5,
    range: "292 mi",
    image: "/cars/vinfast-vf8.png",
    location: "Hà Nội",
    type: "EV",
  },
  {
    id: 3,
    name: "BMW iX",
    price: 95,
    transmission: "Auto",
    seats: 5,
    range: "324 mi",
    image: "/cars/bmw-ix.png",
    location: "Đà Nẵng",
    type: "EV",
  },
  {
    id: 4,
    name: "Hyundai Ioniq 5",
    price: 65,
    transmission: "Auto",
    seats: 5,
    range: "303 mi",
    image: "/cars/ioniq-5.png",
    location: "Phan Thiết",
    type: "EV",
  },
  {
    id: 5,
    name: "Tesla Model 3",
    price: 75,
    transmission: "Auto",
    seats: 5,
    range: "358 mi",
    image: "/cars/tesla-model-3.png",
    location: "Tp.HCM",
    type: "EV",
  },
  {
    id: 6,
    name: "VinFast VF9",
    price: 90,
    transmission: "Auto",
    seats: 7,
    range: "369 mi",
    image: "/cars/vinfast-vf9.png",
    location: "Hà Nội",
    type: "EV",
  },
  {
    id: 7,
    name: "Audi e-tron GT",
    price: 110,
    transmission: "Auto",
    seats: 5,
    range: "238 mi",
    image: "/cars/audi-e-tron-gt.png",
    location: "Đà Nẵng",
    type: "EV",
  },
  {
    id: 8,
    name: "Mercedes EQS",
    price: 120,
    transmission: "Auto",
    seats: 5,
    range: "350 mi",
    image: "/cars/mercedes-eqs.png",
    location: "Phan Thiết",
    type: "EV",
  },
  {
    id: 9,
    name: "Nissan Leaf",
    price: 50,
    transmission: "Auto",
    seats: 5,
    range: "226 mi",
    image: "/cars/nissan-leaf.png",
    location: "Tp.HCM",
    type: "EV",
  },
  {
    id: 10,
    name: "Kia EV6",
    price: 68,
    transmission: "Auto",
    seats: 5,
    range: "310 mi",
    image: "/cars/kia-ev6.png",
    location: "Hà Nội",
    type: "EV",
  },
  {
    id: 11,
    name: "Porsche Taycan",
    price: 150,
    transmission: "Auto",
    seats: 4,
    range: "246 mi",
    image: "/cars/porsche-taycan.png",
    location: "Đà Nẵng",
    type: "EV",
  },
  {
    id: 12,
    name: "BYD Atto 3",
    price: 55,
    transmission: "Auto",
    seats: 5,
    range: "260 mi",
    image: "/cars/byd-atto-3.png",
    location: "Phan Thiết",
    type: "EV",
  },
  {
    id: 13,
    name: "Tesla Model X",
    price: 130,
    transmission: "Auto",
    seats: 7,
    range: "348 mi",
    image: "/cars/tesla-model-x.png",
    location: "Tp.HCM",
    type: "EV",
  },
  {
    id: 14,
    name: "VinFast VF6",
    price: 60,
    transmission: "Auto",
    seats: 5,
    range: "248 mi",
    image: "/cars/vinfast-vf6.png",
    location: "Hà Nội",
    type: "EV",
  },
  {
    id: 15,
    name: "BMW i4",
    price: 88,
    transmission: "Auto",
    seats: 5,
    range: "301 mi",
    image: "/cars/bmw-i4.png",
    location: "Đà Nẵng",
    type: "EV",
  },
  {
    id: 16,
    name: "Hyundai Kona Electric",
    price: 62,
    transmission: "Auto",
    seats: 5,
    range: "258 mi",
    image: "/cars/hyundai-kona.png",
    location: "Phan Thiết",
    type: "EV",
  },
  {
    id: 17,
    name: "Tesla Cybertruck",
    price: 140,
    transmission: "Auto",
    seats: 6,
    range: "500 mi",
    image: "/cars/tesla-cybertruck.png",
    location: "Tp.HCM",
    type: "EV",
  },
  {
    id: 18,
    name: "Lucid Air",
    price: 125,
    transmission: "Auto",
    seats: 5,
    range: "516 mi",
    image: "/cars/lucid-air.png",
    location: "Hà Nội",
    type: "EV",
  },
  {
    id: 19,
    name: "Ford Mustang Mach-E",
    price: 80,
    transmission: "Auto",
    seats: 5,
    range: "312 mi",
    image: "/cars/ford-mach-e.png",
    location: "Đà Nẵng",
    type: "EV",
  },
  {
    id: 20,
    name: "Peugeot e-2008",
    price: 58,
    transmission: "Auto",
    seats: 5,
    range: "214 mi",
    image: "/cars/peugeot-e2008.png",
    location: "Phan Thiết",
    type: "EV",
  },
  {
    id: 21,
    name: "Volvo XC40 Recharge",
    price: 92,
    transmission: "Auto",
    seats: 5,
    range: "223 mi",
    image: "/cars/volvo-xc40.png",
    location: "Tp.HCM",
    type: "EV",
  },
  {
    id: 22,
    name: "Jaguar I-PACE",
    price: 97,
    transmission: "Auto",
    seats: 5,
    range: "234 mi",
    image: "/cars/jaguar-i-pace.png",
    location: "Hà Nội",
    type: "EV",
  },
  {
    id: 23,
    name: "Peugeot e-208",
    price: 33,
    transmission: "Auto",
    seats: 5,
    range: "217 mi",
    image: "/cars/peugeot-e208.png",
    location: "Tp.HCM",
    type: "EV",
  },
  {
    id: 24,
    name: "Renault Zoe",
    price: 31,
    transmission: "Auto",
    seats: 5,
    range: "245 mi",
    image: "/cars/renault-zoe.png",
    location: "Hà Nội",
    type: "EV",
  },
  {
    id: 25,
    name: "Subaru Solterra",
    price: 44,
    transmission: "Auto",
    seats: 5,
    range: "228 mi",
    image: "/cars/subaru-solterra.png",
    location: "Huế",
    type: "EV",
  },
  {
    id: 26,
    name: "Toyota bZ4X",
    price: 42,
    transmission: "Auto",
    seats: 5,
    range: "252 mi",
    image: "/cars/toyota-bz4x.png",
    location: "Hải Phòng",
    type: "EV",
  },
  {
    id: 27,
    name: "Fisker Ocean",
    price: 68,
    transmission: "Auto",
    seats: 5,
    range: "350 mi",
    image: "/cars/fisker-ocean.png",
    location: "Nha Trang",
    type: "EV",
  },
  {
    id: 28,
    name: "Lotus Eletre",
    price: 120,
    transmission: "Auto",
    seats: 5,
    range: "373 mi",
    image: "/cars/lotus-eletre.png",
    location: "Tp.HCM",
    type: "EV",
  },
  {
    id: 29,
    name: "Polestar 2",
    price: 55,
    transmission: "Auto",
    seats: 5,
    range: "270 mi",
    image: "/cars/polestar-2.png",
    location: "Đà Nẵng",
    type: "EV",
  },
  {
    id: 30,
    name: "Polestar 3",
    price: 85,
    transmission: "Auto",
    seats: 5,
    range: "379 mi",
    image: "/cars/polestar-3.png",
    location: "Đà Lạt",
    type: "EV",
  },
  {
    id: 31,
    name: "Genesis GV60",
    price: 68,
    transmission: "Auto",
    seats: 5,
    range: "248 mi",
    image: "/cars/genesis-gv60.png",
    location: "Hà Nội",
    type: "EV",
  },
  {
    id: 32,
    name: "Rolls-Royce Spectre",
    price: 400,
    transmission: "Auto",
    seats: 4,
    range: "320 mi",
    image: "/cars/rolls-royce-spectre.png",
    location: "Tp.HCM",
    type: "EV",
  },
];

// Mảng các địa điểm và đường dẫn hình ảnh tương ứng
const locations = [
  { name: "Tp.HCM", image: "/images/ho-chi-minh-city.jpg" },
  { name: "Hà Nội", image: "/images/hanoi.jpg" },
  { name: "Đà Nẵng", image: "/images/da-nang.jpg" },
  { name: "Phan Thiết", image: "/images/phan-thiet.jpg" },
  { name: "Nha Trang", image: "/images/nha-trang.jpg" },
  { name: "Vũng Tàu", image: "/images/nha-trang.jpg" },
];

export default function CarCatalogue() {
  const [selectedLocation, setSelectedLocation] = useState("Tp.HCM");

  const filteredCars = carData.filter(
    (car) => car.location === selectedLocation && car.type === "EV"
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Electric Car Catalogue ⚡</h2>
      <p className="text-gray-500 mb-6">
        Explore electric cars available in different locations!
      </p>
      {/* Location Selector với hình ảnh */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6 sm:mx-0 sm:px-0">
        {locations.map((loc) => (
          <div
            key={loc.name}
            onClick={() => setSelectedLocation(loc.name)}
            className={`
              flex-shrink-0 w-60 h-60 rounded-xl overflow-hidden cursor-pointer relative shadow-lg
              transition-all duration-300 transform hover:scale-105
              ${
                selectedLocation === loc.name
                  ? "ring-4 ring-blue-600 ring-offset-2"
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
      ---
      {/* Car Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        {filteredCars.length > 0 ? (
          filteredCars.map((car) => (
            <div
              key={car.id}
              className="border rounded-2xl shadow-md p-4 bg-white hover:shadow-xl transition-all duration-200"
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
          ))
        ) : (
          <p className="text-gray-500 col-span-full">
            No electric cars available in this location.
          </p>
        )}
      </div>
    </div>
  );
}
