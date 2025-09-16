import React from "react";
import { Carousel } from "antd";
// import modelS from "../../../../assets/homepage/";
// import taycan from "../../../assets/homepage/carousel/taycan.png";
// import vf9 from "../../../assets/homepage/carousel/vf9.png";
// import vf3 from "../../../assets/homepage/carousel/vf3.png";
import taycanvideo from "../../../../assets/homepage/carousel/video/taycan.mp4";
import vf3video from "../../../../assets/homepage/carousel/video/vf3.mp4";
import vf9video from "../../../../assets/homepage/carousel/video/vf9.mp4";
import modelSvideo from "../../../../assets/homepage/carousel/video/modelS.mp4";
import { HiOutlineBolt } from "react-icons/hi2";
import { IoSpeedometerOutline } from "react-icons/io5";
import { TbManualGearbox } from "react-icons/tb";

const CarouselHome: React.FC = () => {
  const carData = [
    {
      id: 1,
      price: "$89,990",
      brand: "Tesla",
      model: "Model S",
      // image: modelS,
      video: modelSvideo,
      specs: [
        { icon: <HiOutlineBolt />, text: "Electric" },
        { icon: <IoSpeedometerOutline />, text: "200 mph" },
        { icon: <TbManualGearbox />, text: "Automatic" },
      ],
    },
    {
      id: 2,
      price: "$103,800",
      brand: "Porsche",
      model: "Taycan",
      // image: taycan,
      video: taycanvideo,
      specs: [
        { icon: <HiOutlineBolt />, text: "Electric" },
        { icon: <IoSpeedometerOutline />, text: "161 mph" },
        { icon: <TbManualGearbox />, text: "Automatic" },
      ],
    },
    {
      id: 3,
      price: "$45,000",
      brand: "VinFast",
      model: "VF 9",
      // image: vf9,
      video: vf9video,
      specs: [
        { icon: <HiOutlineBolt />, text: "Electric" },
        { icon: <IoSpeedometerOutline />, text: "124 mph" },
        { icon: <TbManualGearbox />, text: "Automatic" },
      ],
    },
    {
      id: 4,
      price: "$35,000",
      brand: "VinFast",
      model: "VF 3",
      // image: vf3,
      video: vf3video,
      specs: [
        { icon: <HiOutlineBolt />, text: "Electric" },
        { icon: <IoSpeedometerOutline />, text: "100 mph" },
        { icon: <TbManualGearbox />, text: "Automatic" },
      ],
    },
  ];

  return (
    <div className="relative">
      <Carousel
        autoplay
        autoplaySpeed={10000}
        arrows
        className="carousel-container"
      >
        {carData.map((car) => (
          <div key={car.id} className="relative">
            <div className="w-full h-[500px] relative">
              <video
                src={car.video}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Car Information Overlay */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-6">
                  <div className="max-w-2xl">
                    {/* Price */}
                    <div className="text-4xl font-bold text-white mb-2">
                      {car.price}
                    </div>

                    {/* Brand and Model */}
                    <div className="text-6xl font-bold text-white mb-8 leading-tight">
                      {car.brand}
                      <br />
                      {car.model}
                    </div>

                    {/* Specifications */}
                    <div className="flex gap-8 mb-8">
                      {car.specs.map((spec, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-white"
                        >
                          <span className="text-2xl">{spec.icon}</span>
                          <span className="text-lg font-medium">
                            {spec.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Learn More Button */}
                    <button className="bg-white text-black px-4 py-2 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-300 flex items-center gap-2">
                      Learn More
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default CarouselHome;
