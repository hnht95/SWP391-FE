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
    <div className="flex flex-col items-center justify-center p-4 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl cursor-pointer">
      <img
        src={brand.image}
        alt={brand.name}
        className="w-24 h-24 object-contain mb-2"
      />
      <span className="text-lg font-semibold text-gray-800">{brand.name}</span>
    </div>
  );
};

export default BrandCard;
