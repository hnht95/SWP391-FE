import React from "react";
import { SEARCH_UI } from "../../../../../constants/searchConstants";
import "../../../../../styles/searchAnimations.css";

interface SearchResultItemProps {
  text: string;
  searchTerm: string;
  isSelected: boolean;
  index: number;
  onClick: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  variant?: "car" | "suggestion" | "station";
}

/**
 * Individual search result item with hover effects and highlighting
 */
const SearchResultItem: React.FC<SearchResultItemProps> = ({
  text,
  searchTerm,
  isSelected,
  index,
  onClick,
  onMouseEnter,
  variant = "car",
}) => {
  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const lowerText = text.toLowerCase();
    const lowerSearchTerm = searchTerm.toLowerCase();
    const startIndex = lowerText.indexOf(lowerSearchTerm);

    if (startIndex === -1) return text;

    const before = text.substring(0, startIndex);
    const match = text.substring(startIndex, startIndex + searchTerm.length);
    const after = text.substring(startIndex + searchTerm.length);

    return (
      <>
        {before}
        <span className="text-white font-bold">{match}</span>
        {after}
      </>
    );
  };

  const getVariantClasses = () => {
    if (variant === "station") {
      return {
        base: isSelected
          ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/25 text-white shadow-lg shadow-blue-200/30 translate-x-2 scale-105 border border-blue-300/30"
          : "text-gray-300 hover:text-white hover:translate-x-1 hover:bg-blue-500/10",
        shine: "via-blue-100/45 via-cyan-200/65 via-blue-50/35",
        glow: "from-blue-50/10 to-cyan-100/10",
      };
    }

    if (variant === "suggestion") {
      return {
        base: isSelected
          ? "bg-gradient-to-r from-slate-100/20 to-slate-50/25 text-white shadow-lg shadow-cyan-200/30 translate-x-2 scale-105 border border-slate-200/20"
          : "text-gray-300 hover:text-white hover:translate-x-1",
        shine: "via-slate-100/45 via-white/65 via-cyan-50/35",
        glow: "from-slate-50/10 to-cyan-100/10",
      };
    }

    return {
      base: isSelected
        ? "bg-gradient-to-r from-slate-100/25 to-slate-50/30 text-white shadow-lg shadow-cyan-200/35 translate-x-2 scale-105 border border-slate-200/25"
        : "text-white hover:text-gray-200 hover:translate-x-1",
      shine: "via-slate-100/50 via-white/80 via-cyan-100/40",
      glow: "from-slate-50/12 to-cyan-100/12",
    };
  };

  const classes = getVariantClasses();

  return (
    <button
      key={`${index}-${isSelected}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`group block w-full text-left text-lg py-3 px-4 rounded-lg transition-all duration-300 ease-cinematic transform relative overflow-hidden ${classes.base}`}
      style={{
        animationDelay: `${index * SEARCH_UI.ANIMATION_DELAY_STEP}ms`,
        ...(isSelected && {
          animation:
            "selection-scale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        }),
      }}
    >
      {/* Cinematic metallic blade shine effect - Only animate when selected */}
      {isSelected && (
        <div
          className="absolute inset-0"
          style={{
            transform: "skewX(-80deg)",
            animation: "blade-shine 0.9s cubic-bezier(0.2,0.3,0.25,1) forwards",
          }}
        >
          {/* Platinum Katana Diamond Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/95 to-transparent blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-100/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/50 to-transparent"></div>
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50/80 to-transparent"
            style={{
              filter:
                "drop-shadow(0 0 16px rgba(200, 230, 255, 0.9)) drop-shadow(0 0 8px rgba(255, 255, 255, 1))",
            }}
          ></div>

          {/* Diamond Sparkle Points */}
          <div
            className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full"
            style={{
              animation: "diamond-sparkle 0.8s ease-in-out 0.2s infinite",
            }}
          ></div>
          <div
            className="absolute top-1/2 left-1/3 w-0.5 h-0.5 bg-cyan-100 rounded-full"
            style={{
              animation: "diamond-sparkle 0.6s ease-in-out 0.4s infinite",
            }}
          ></div>
          <div
            className="absolute top-3/4 left-1/2 w-1.5 h-1.5 bg-slate-100 rounded-full"
            style={{
              animation: "diamond-sparkle 1s ease-in-out 0.1s infinite",
            }}
          ></div>
          <div
            className="absolute top-1/3 right-1/4 w-0.5 h-0.5 bg-white rounded-full"
            style={{
              animation: "diamond-sparkle 0.7s ease-in-out 0.3s infinite",
            }}
          ></div>
        </div>
      )}

      {/* Cinematic glow effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${
          classes.glow
        } rounded-lg transition-all duration-400 ease-cinematic ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"
        }`}
        style={{
          ...(isSelected && {
            animation: "selection-glow 0.5s ease-cinematic forwards",
          }),
        }}
      ></div>

      {/* Content */}
      <span className="relative z-10 flex items-center">
        {variant === "station" && (
          <svg
            className="w-5 h-5 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {highlightMatch(text, searchTerm)}
      </span>
    </button>
  );
};

export default SearchResultItem;
