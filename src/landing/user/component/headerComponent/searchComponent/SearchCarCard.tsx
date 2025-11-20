import React from "react";

interface SearchResult {
  id: string;
  name: string;
  brand: string;
  model: string;
  image?: string;
  pricePerDay: number;
  status: string;
  available: boolean;
}

interface SearchCarCardProps {
  car: SearchResult;
  searchTerm: string;
  isSelected: boolean;
  index: number;
  onClick: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
}

const SearchCarCard: React.FC<SearchCarCardProps> = ({
  car,
  searchTerm,
  isSelected,
  onClick,
  onMouseEnter,
}) => {
  // Highlight matching text in car name
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span
          key={index}
          className="bg-white/20 text-white font-semibold px-1 rounded"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Get status badge
  const getStatusBadge = () => {
    const statusConfig: Record<
      string,
      { label: string; className: string; pulse?: boolean }
    > = {
      available: {
        label: "Available",
        className: "bg-green-500/20 text-green-300 border border-green-500/30",
        pulse: true,
      },
    };

    const config = statusConfig[car.status] || statusConfig.available;

    return (
      <span
        className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${config.className}`}
      >
        {config.pulse && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        )}
        {config.label}
      </span>
    );
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl p-4 cursor-pointer transition-all duration-300 ease-out w-full transform hover:translate-y-[-2px] ${
        isSelected
          ? "bg-gradient-to-r from-white/10 to-white/15 border border-white/60 shadow-lg shadow-white/20"
          : "bg-black/40 hover:bg-black/50 border border-transparent hover:border-white/40 hover:shadow-xl hover:shadow-white/20"
      }`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-50 transition-opacity duration-300 hover:opacity-70"></div>

      <div className="relative flex items-center space-x-4">
        {/* Car Image */}
        <div className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden bg-gray-800">
          {car.image ? (
            <img
              src={car.image}
              alt={car.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/cars/placeholder.png";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
              <svg
                className="w-8 h-8 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
            </div>
          )}
        </div>

        {/* Car Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg truncate transition-all duration-300 group-hover:text-gray-100">
                {highlightText(car.name, searchTerm)}
              </h3>
              {getStatusBadge()}
            </div>
            <span className="text-white font-bold text-lg transition-all duration-300 group-hover:text-gray-100 flex-shrink-0 ml-3">
              {car.pricePerDay.toLocaleString()}đ/day
            </span>
          </div>

          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              {car.brand}
            </span>
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              {car.model}
            </span>
          </div>
        </div>

        {/* Arrow indicator */}
        <div
          className={`flex-shrink-0 transition-all duration-300 ease-out group-hover:translate-x-1 ${
            isSelected ? "transform translate-x-2" : ""
          }`}
        >
          <svg
            className="w-5 h-5 text-gray-400 transition-colors duration-300 group-hover:text-gray-300"
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
        </div>
      </div>
    </div>
  );
};

export default SearchCarCard;
