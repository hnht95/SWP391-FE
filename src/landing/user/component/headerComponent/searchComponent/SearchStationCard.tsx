import React from "react";
import type { Station } from "../../../../../service/apiAdmin/apiStation/API";

interface SearchStationCardProps {
  station: Station;
  searchTerm: string;
  isSelected: boolean;
  index: number;
  onClick: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
}

const SearchStationCard: React.FC<SearchStationCardProps> = ({
  station,
  searchTerm,
  isSelected,
  onClick,
  onMouseEnter,
}) => {
  // Highlight matching text
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim() || !text) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span
          key={index}
          className="bg-blue-500/30 text-white font-semibold px-1 rounded"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl p-4 cursor-pointer transition-all duration-300 ease-out w-full transform hover:translate-y-[-2px] ${
        isSelected
          ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/25 border border-blue-300/60 shadow-lg shadow-blue-200/20"
          : "bg-black/40 hover:bg-black/50 border border-transparent hover:border-blue-400/40 hover:shadow-xl hover:shadow-blue-200/20"
      }`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/5 to-transparent opacity-50 transition-opacity duration-300 hover:opacity-70"></div>

      <div className="relative flex items-center space-x-4">
        {/* Station Icon */}
        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-600/20 to-cyan-600/20 flex items-center justify-center border border-blue-400/30">
          {station.imgStation?.url ? (
            <img
              src={station.imgStation.url}
              alt={station.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <svg
            className={`w-8 h-8 text-blue-400 ${
              station.imgStation?.url ? "hidden" : ""
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Station Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg truncate transition-all duration-300 group-hover:text-gray-100">
                {highlightText(station.name, searchTerm)}
              </h3>
              {station.code && (
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-400/30 flex-shrink-0">
                  {station.code}
                </span>
              )}
            </div>
            {station.isActive && (
              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full flex items-center gap-1 border border-green-400/30 flex-shrink-0 ml-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Active
              </span>
            )}
          </div>

          <div className="flex items-start space-x-2 text-sm text-gray-400">
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="line-clamp-2 flex-1">
              {highlightText(station.location.address, searchTerm)}
            </span>
          </div>

          {station.province && (
            <div className="mt-2">
              <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full border border-cyan-400/30">
                {station.province}
              </span>
            </div>
          )}
        </div>

        {/* Arrow indicator */}
        <div
          className={`flex-shrink-0 transition-all duration-300 ease-out group-hover:translate-x-1 ${
            isSelected ? "transform translate-x-2" : ""
          }`}
        >
          <svg
            className="w-5 h-5 text-blue-400 transition-colors duration-300 group-hover:text-blue-300"
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

export default SearchStationCard;
