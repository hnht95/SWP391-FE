// src/components/vehicle/Description.tsx
import React from "react";

interface DescriptionProps {
  description: string;
}

const Description: React.FC<DescriptionProps> = ({ description }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4">Description</h2>
      <p className="text-gray-700 leading-relaxed">{description}</p>
    </div>
  );
};

export default Description;
