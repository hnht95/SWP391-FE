import React from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  maxStars = 5,
  size = "md",
  showValue = false,
  reviewCount,
}) => {
  const fullStars = Math.floor(rating);
  const emptyStars = maxStars - fullStars;

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {/* Full stars - Yellow */}
        {[...Array(fullStars)].map((_, i) => (
          <FaStar
            key={`full-${i}`}
            className={`text-yellow-400 ${sizeClasses[size]}`}
          />
        ))}

        {/* Empty stars - Gray */}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar
            key={`empty-${i}`}
            className={`text-gray-300 ${sizeClasses[size]}`}
          />
        ))}
      </div>

      {showValue && (
        <span className="font-semibold text-gray-700">{rating.toFixed(1)}</span>
      )}

      {reviewCount !== undefined && (
        <span className="text-sm text-gray-500">
          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  );
};

export default StarRating;
