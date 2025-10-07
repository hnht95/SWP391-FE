// src/components/common/BrandCard.tsx (hoặc nơi bạn lưu trữ nó)
import React from "react";

interface Brand {
  name: string;
  image: string;
}

interface BrandCardProps {
  brand: Brand;
}

const BrandCard: React.FC<BrandCardProps> = ({ brand }) => {
  return (
    <div className="flex flex-col items-center justify-center p-2 mx-4 flex-shrink-0">
      <img
        src={brand.image}
        alt={brand.name}
        className="w-20 h-20 object-contain mb-1 filter grayscale hover:grayscale-0 transition-all duration-300" // Làm mờ logo và sáng lên khi hover
      />
    </div>
  );
};

export default BrandCard;
