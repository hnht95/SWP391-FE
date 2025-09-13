import { useState, useEffect } from "react";
import greenCar from "../../assets/loginImage/greenCar.png";
import yellowCar from "../../assets/loginImage/VF-3_Summer-Yellow_With-Wheel-Co.png";
import redCar from "../../assets/loginImage/Red-Tesla-PNG-Images.png";
import grayCar from "../../assets/loginImage/vf8.png";
import blueCar from "../../assets/loginImage/vf9-vinfast-blue.png";

const cars = [
  { name: "Tesla Model S", color: "#7691D0", img: blueCar },
  { name: "Ford Mustang", color: "#E7C544", img: yellowCar },
  { name: "Chevrolet Camaro", color: "#44B861", img: greenCar },
  { name: "Dodge Charger", color: "#F25351", img: redCar },
  { name: "BMW M3", color: "#4F4F4F", img: grayCar },
];

const LoginPage = () => {
  const [carIndex, setCarIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Tự động chuyển xe sau 5s
  useEffect(() => {
    const timer = setTimeout(() => handleNextCar(), 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [carIndex]);

  const handleNextCar = () => {
    setAnimating(true);
    setTimeout(() => {
      setCarIndex((prev) => (prev + 1) % cars.length);
      setAnimating(false);
    }, 600);
  };

  const car = cars[carIndex];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Hai background trượt */}
      <div
        className={`absolute top-0 left-0 h-full w-2/3 transition-transform duration-500 z-0 ${
          animating ? "-translate-x-full" : "translate-x-0"
        }`}
        style={{ backgroundColor: car.color }}
      />
      <div
        className={`absolute top-0 right-0 h-full w-1/3 bg-white transition-transform duration-500 z-0 ${
          animating ? "translate-x-full" : "translate-x-0"
        }`}
      />
      {/* Nội dung */}
      <div className="relative z-10 flex min-h-screen">
        {/* Form bên trái */}
        <div className="w-2/3 flex">
          <div className="flex flex-col justify-center items-center w-full max-w-md bg-white rounded-xl shadow-lg m-8 p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              It's easy for you
              <br />
              to rent a car
            </h2>
            <form className="w-full space-y-4">{/* ...form fields... */}</form>
            <button
              className="mt-6 text-blue-600 underline"
              onClick={handleNextCar}
              type="button"
            >
              Đổi xe
            </button>
          </div>
        </div>
        {/* Ảnh xe bên phải, căn giữa màn hình */}
        <div className="w-1/3 flex items-center justify-center relative"></div>
        <img
          key={car.img}
          src={car.img}
          alt={car.name}
          className={`transition-all duration-500 max-w-[920px] h-[500px] object-contain absolute left-2/3 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none
              ${animating ? "opacity-0 scale-90" : "opacity-100 scale-100"}
            `}
          style={{ aspectRatio: "2/1" }}
        />
      </div>
    </div>
  );
};

export default LoginPage;
