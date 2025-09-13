import React from "react";
import { Carousel } from "antd";
import modelS from "../../../assets/carouselHomePage/modelS.png";
import taycan from "../../../assets/carouselHomePage/taycan.png";
import vf9 from "../../../assets/carouselHomePage/vf9.png";
import vf3 from "../../../assets/carouselHomePage/vf3.png";

const CarouselHome: React.FC = () => {
  const carData = [
    {
      id: 1,
      price: "$89,990",
      brand: "Tesla",
      model: "Model S",
      image: modelS,
      specs: [
        { icon: "", text: "Electric" },
        { icon: "", text: "200 mph" },
        { icon: "", text: "Automatic" },
      ],
    },
    {
      id: 2,
      price: "$103,800",
      brand: "Porsche",
      model: "Taycan",
      image: taycan,
      specs: [
        { icon: "", text: "Electric" },
        { icon: "", text: "161 mph" },
        { icon: "", text: "Automatic" },
      ],
    },
    {
      id: 3,
      price: "$45,000",
      brand: "VinFast",
      model: "VF 9",
      image: vf9,
      specs: [
        { icon: "", text: "Electric" },
        { icon: "", text: "124 mph" },
        { icon: "", text: "Automatic" },
      ],
    },
    {
      id: 4,
      price: "$35,000",
      brand: "VinFast",
      model: "VF 3",
      image: vf3,
      specs: [
        { icon: "", text: "Electric" },
        { icon: "", text: "100 mph" },
        { icon: "", text: "Automatic" },
      ],
    },
  ];

  return (
    <div className="relative">
      <Carousel
        autoplay={{ dotDuration: true }}
        autoplaySpeed={5000}
        arrows={true}
        className="carousel-container"
      >
        {carData.map((car) => (
          <div key={car.id} className="relative">
            <div className="w-full  h-[500px] relative">
              <img
                src={car.image}
                alt={`${car.brand} ${car.model}`}
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
                    <button className="bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-300 flex items-center gap-2">
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

      {/* Custom CSS for carousel arrows */}
      <style>{`
        .carousel-container .ant-carousel .slick-prev,
        .carousel-container .ant-carousel .slick-next {
          z-index: 10;
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .carousel-container .ant-carousel .slick-prev {
          left: 30px;
        }
        
        .carousel-container .ant-carousel .slick-next {
          right: 30px;
        }
        
        .carousel-container .ant-carousel .slick-prev:hover,
        .carousel-container .ant-carousel .slick-next:hover {
          background: white;
          color: #000;
        }
        
        .carousel-container .ant-carousel .slick-dots {
          bottom: 30px;
        }
        
        .carousel-container .ant-carousel .slick-dots li button {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          width: 12px;
          height: 12px;
        }
        
        .carousel-container .ant-carousel .slick-dots li.slick-active button {
          background: white;
        }
      `}</style>
    </div>
  );
};

export default CarouselHome;
