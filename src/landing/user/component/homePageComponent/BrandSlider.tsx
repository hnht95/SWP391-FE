// src/components/homepage/BrandsSlider/BrandsSlider.tsx
import React, { useEffect, useRef } from "react";
import { brandData } from "../../../../data/brandData";
import BrandCard from "./BrandCard";

// Tăng gấp đôi mảng dữ liệu để tạo hiệu ứng trượt vô tận
const brands = [...brandData, ...brandData];

const BrandsSlider: React.FC = () => {
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let animationFrameId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // Điều chỉnh tốc độ trượt

    const animateScroll = () => {
      scrollPosition += scrollSpeed;
      if (scrollPosition >= slider.scrollWidth / 2) {
        scrollPosition = 0;
      }
      slider.scrollLeft = scrollPosition;
      animationFrameId = requestAnimationFrame(animateScroll);
    };

    animationFrameId = requestAnimationFrame(animateScroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="w-full text-black overflow-hidden py-16">
      <div className="relative z-10 container mx-auto text-center">
        <h2 className="text-4xl font-extrabold mb-4 text-black flex items-center justify-center">
          Rent by Brands{" "}
        </h2>
        <p className="text-lg text-gray-500 mb-12">
          Here's a list of some of the most popular cars globally
        </p>
      </div>

      <div className="w-full bg-black/80 bg-opacity-40 p-4">
        <div
          ref={sliderRef}
          className="flex overflow-hidden py-4 justify-center"
          style={{ scrollBehavior: "auto" }}
        >
          {brands.map((brandItem, index) => (
            <BrandCard key={index} brand={brandItem} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandsSlider;
