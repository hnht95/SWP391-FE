import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useDebounce from "../../../../hooks/useDebounce";
import SearchResultItem from "./searchComponent/SearchResultItem";
import SearchCarCard from "./searchComponent/SearchCarCard";
import SearchStationCard from "./searchComponent/SearchStationCard";
import {
  SEARCH_TIMING,
  SEARCH_TEXTS,
} from "../../../../constants/searchConstants";
import {
  getAllVehicles,
  type Vehicle,
} from "../../../../service/apiAdmin/apiVehicles/API";
import {
  searchStations,
  type Station,
} from "../../../../service/apiAdmin/apiStation/API";
import "../../../../styles/searchCardAnimations.css";
interface SearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  onSearchComplete?: () => void;
  isSearchOpen?: boolean;
}

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

const transformVehicleToSearchResult = (vehicle: Vehicle): SearchResult => {
  const image = vehicle.defaultPhotos?.exterior?.[0]
    ? typeof vehicle.defaultPhotos.exterior[0] === "string"
      ? vehicle.defaultPhotos.exterior[0]
      : vehicle.defaultPhotos.exterior[0].url
    : undefined;

  return {
    id: vehicle._id,
    name: `${vehicle.brand} ${vehicle.model}`,
    brand: vehicle.brand,
    model: vehicle.model,
    image,
    pricePerDay: vehicle.pricePerDay,
    status: vehicle.status,
    available: vehicle.status === "available",
  };
};

const Search: React.FC<SearchProps> = ({
  onSearch,
  placeholder,
  className = "",
  onSearchComplete,
  isSearchOpen,
}) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [stationResults, setStationResults] = useState<Station[]>([]);

  const typingText = placeholder || SEARCH_TEXTS.DEFAULT_PLACEHOLDER;
  const debouncedSearchQuery = useDebounce(
    searchQuery,
    SEARCH_TIMING.DEBOUNCE_DELAY
  );

  // Fetch vehicles on mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoadingVehicles(true);
        const vehicles = await getAllVehicles();
        setAllVehicles(vehicles);
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, []);

  // Filter vehicles based on search query
  const vehicleResults = React.useMemo(() => {
    if (!debouncedSearchQuery.trim()) return [];

    const query = debouncedSearchQuery.toLowerCase();

    return allVehicles
      .filter((vehicle) => {
        const searchText =
          `${vehicle.brand} ${vehicle.model} ${vehicle.plateNumber}`.toLowerCase();
        return searchText.includes(query);
      })
      .map(transformVehicleToSearchResult)
      .slice(0, 10);
  }, [debouncedSearchQuery, allVehicles]);

  // ✅ Search for ACTIVE stations only if no vehicles found
  useEffect(() => {
    const searchStationsIfNoVehicles = async () => {
      if (debouncedSearchQuery.trim() && vehicleResults.length === 0) {
        try {
          const stations = await searchStations(debouncedSearchQuery);
          // Filter only active stations
          const activeStations = stations.filter(
            (station) => station.isActive === true
          );
          setStationResults(activeStations.slice(0, 5));
        } catch (error) {
          console.error("Failed to search stations:", error);
          setStationResults([]);
        }
      } else {
        setStationResults([]);
      }
    };

    searchStationsIfNoVehicles();
  }, [debouncedSearchQuery, vehicleResults.length]);

  // Total selectable items
  const hasResults = vehicleResults.length > 0 || stationResults.length > 0;
  const totalItems = hasResults
    ? vehicleResults.length + stationResults.length + 1
    : 0;

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      setIsSearching(true);

      setTimeout(() => {
        setIsSearching(false);
        setShowResults(true);
        inputRef.current?.focus();
      }, SEARCH_TIMING.SEARCH_DELAY);
    } else {
      setIsSearching(false);
      setShowResults(false);
      setSelectedIndex(-1);
      setStationResults([]);
    }
  }, [debouncedSearchQuery]);

  // Typing animation effect
  useEffect(() => {
    const timer = setTimeout(
      () => {
        if (isTyping && currentIndex < typingText.length) {
          setDisplayText(typingText.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        } else if (isTyping && currentIndex === typingText.length) {
          setTimeout(
            () => setIsTyping(false),
            SEARCH_TIMING.PAUSE_BEFORE_ERASE
          );
        } else if (!isTyping && currentIndex > 0) {
          setDisplayText(typingText.slice(0, currentIndex - 1));
          setCurrentIndex(currentIndex - 1);
        } else if (!isTyping && currentIndex === 0) {
          setIsTyping(true);
        }
      },
      isTyping ? SEARCH_TIMING.TYPING_SPEED : SEARCH_TIMING.ERASING_SPEED
    );

    return () => clearTimeout(timer);
  }, [currentIndex, isTyping, typingText]);

  // Auto focus when search overlay opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, SEARCH_TIMING.FOCUS_DELAY);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && totalItems > 0) {
      if (selectedIndex < vehicleResults.length) {
        // Selected a vehicle
        const selectedCar = vehicleResults[selectedIndex];
        setSearchQuery(selectedCar.name);
        navigate(`/vehicles?search=${encodeURIComponent(selectedCar.name)}`);
      } else if (
        selectedIndex <
        vehicleResults.length + stationResults.length
      ) {
        // ✅ Selected a station - redirect to /stations/:id
        const stationIndex = selectedIndex - vehicleResults.length;
        const selectedStation = stationResults[stationIndex];
        navigate(`/stations/${selectedStation._id}`);
      } else {
        // Selected fixed suggestion
        navigate(`/vehicles?search=${encodeURIComponent(searchQuery)}`);
      }
      setShowResults(false);
      setSelectedIndex(-1);
      setStationResults([]);
      onSearchComplete?.();
    } else if (searchQuery.trim()) {
      // No selection - check if we should redirect to station
      if (vehicleResults.length === 0 && stationResults.length > 0) {
        // ✅ Only active stations found - redirect to first station
        navigate(`/stations/${stationResults[0]._id}`);
      } else {
        // Search vehicles
        navigate(`/vehicles?search=${encodeURIComponent(searchQuery.trim())}`);
      }
      setShowResults(false);
      setSelectedIndex(-1);
      setStationResults([]);
      onSearchComplete?.();
    } else if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);
    if (!value.trim()) {
      setShowResults(false);
      setStationResults([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || totalItems === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => {
          const newIndex =
            prev === -1 ? 0 : prev < totalItems - 1 ? prev + 1 : 0;

          setTimeout(() => {
            const element = document.getElementById(
              `search-result-${newIndex}`
            );
            element?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "nearest",
            });
          }, 0);

          return newIndex;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev === -1) return -1;
          if (prev === 0) {
            inputRef.current?.focus();
            return -1;
          }
          const newIndex = prev - 1;

          setTimeout(() => {
            const element = document.getElementById(
              `search-result-${newIndex}`
            );
            element?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "nearest",
            });
          }, 0);

          return newIndex;
        });
        break;
      case "Escape":
        e.preventDefault();
        setShowResults(false);
        setSelectedIndex(-1);
        setStationResults([]);
        inputRef.current?.blur();
        break;
    }
  };

  const handleInputFocus = () => {
    if (searchQuery.trim() && hasResults) {
      setShowResults(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget?.closest(".search-results")) {
      return;
    }
    setTimeout(() => {
      setShowResults(false);
    }, SEARCH_TIMING.BLUR_DELAY);
  };

  const handleResultClick = (car: SearchResult) => {
    setSearchQuery(car.name);
    navigate(`/vehicles?search=${encodeURIComponent(car.name)}`);
    setShowResults(false);
    setSelectedIndex(-1);
    setStationResults([]);
    onSearchComplete?.();
  };

  // ✅ Updated to redirect to /stations/:id
  const handleStationClick = (station: Station) => {
    navigate(`/stations/${station._id}`);
    setShowResults(false);
    setSelectedIndex(-1);
    setStationResults([]);
    onSearchComplete?.();
  };

  const handleSuggestionClick = () => {
    navigate(`/vehicles?search=${encodeURIComponent(searchQuery)}`);
    setShowResults(false);
    setSelectedIndex(-1);
    setStationResults([]);
    onSearchComplete?.();
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <div
          className={`relative bg-transparent border-b-2 pb-2 cursor-text transition-all duration-200 ${
            selectedIndex === -1 && showResults && searchQuery
              ? "border-cyan-300 shadow-[0_2px_8px_rgba(165,243,252,0.3)]"
              : "border-white"
          }`}
          onClick={() => inputRef.current?.focus()}
        >
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-white mr-3 ml-2 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              className={`flex-1 bg-transparent text-white text-lg focus:outline-none placeholder-gray-400 ${
                searchQuery.length === 0 ? "caret-transparent" : "caret-white"
              }`}
              placeholder=""
              disabled={isLoadingVehicles}
            />

            <button
              type="submit"
              onClick={() => inputRef.current?.focus()}
              className="ml-4 px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoadingVehicles}
            >
              {isLoadingVehicles ? "Loading..." : SEARCH_TEXTS.SEARCH_BUTTON}
            </button>
          </div>
        </div>

        {searchQuery.length === 0 && (
          <div className="absolute left-10 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <span className="text-gray-400 text-lg">
              {displayText}
              <span className="inline-block w-0.5 h-5 bg-gray-400 ml-0.5 animate-pulse opacity-75"></span>
            </span>
          </div>
        )}
      </form>

      {showResults && searchQuery && (
        <div className="search-results absolute top-full left-0 right-0 mt-4 z-50 transform transition-all duration-300 ease-in-out animate-in slide-in-from-top-2">
          <div className="space-y-2">
            {isSearching ? (
              <div className="text-white text-lg py-2 transition-opacity duration-200">
                {SEARCH_TEXTS.SEARCHING}
              </div>
            ) : (
              <>
                {/* Vehicle Results */}
                {vehicleResults.length > 0 && (
                  <div className="relative">
                    <div
                      className="space-y-3 search-results-container max-h-[500px] overflow-y-auto overflow-x-hidden p-1 smooth-scroll"
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
                      }}
                      id="search-results-list"
                    >
                      {vehicleResults.map((car, index) => (
                        <div
                          key={car.id}
                          id={`search-result-${index}`}
                          className="search-card-enter-stagger"
                          style={{
                            animationDelay: `${Math.min(index, 15) * 80}ms`,
                          }}
                        >
                          <SearchCarCard
                            car={car}
                            searchTerm={debouncedSearchQuery}
                            isSelected={selectedIndex === index}
                            index={index}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleResultClick(car);
                            }}
                            onMouseEnter={() => setSelectedIndex(index)}
                          />
                        </div>
                      ))}
                    </div>

                    {vehicleResults.length > 5 && (
                      <>
                        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black/60 via-black/30 to-transparent pointer-events-none opacity-90 z-10"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none opacity-90 z-10"></div>
                      </>
                    )}
                  </div>
                )}

                {/* Station Results - Only Active Stations */}
                {stationResults.length > 0 && (
                  <>
                    {vehicleResults.length > 0 && (
                      <div className="border-t border-white/20 my-3"></div>
                    )}
                    <div className="text-gray-400 text-sm font-semibold mb-2 px-2 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Active Stations
                    </div>
                    <div className="space-y-3">
                      {stationResults.map((station, index) => {
                        const stationIndex = vehicleResults.length + index;
                        return (
                          <div
                            key={station._id}
                            id={`search-result-${stationIndex}`}
                            className="search-card-enter-stagger"
                            style={{
                              animationDelay: `${
                                Math.min(stationIndex, 15) * 80
                              }ms`,
                            }}
                          >
                            <SearchStationCard
                              station={station}
                              searchTerm={debouncedSearchQuery}
                              isSelected={selectedIndex === stationIndex}
                              index={stationIndex}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleStationClick(station);
                              }}
                              onMouseEnter={() =>
                                setSelectedIndex(stationIndex)
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* No Results */}
                {!hasResults && (
                  <div className="text-gray-400 text-lg py-4 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <svg
                        className="w-12 h-12 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.901-6.06 2.377C5.482 17.84 5.17 18.319 5.306 19H18.694c.136-.681-.176-1.16-.634-1.623C16.47 15.901 14.34 15 12 15z"
                        />
                      </svg>
                      <div>{SEARCH_TEXTS.NO_RESULTS}</div>
                    </div>
                  </div>
                )}

                {hasResults && (
                  <>
                    <div className="border-t border-white my-2 opacity-30"></div>
                    {[{ text: `${searchQuery} - view all` }].map(
                      (suggestion, index) => {
                        const suggestionIndex =
                          vehicleResults.length + stationResults.length + index;
                        return (
                          <div
                            key={suggestion.text}
                            id={`search-result-${suggestionIndex}`}
                          >
                            <SearchResultItem
                              text={suggestion.text}
                              searchTerm={debouncedSearchQuery}
                              isSelected={selectedIndex === suggestionIndex}
                              index={suggestionIndex}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSuggestionClick();
                              }}
                              onMouseEnter={() =>
                                setSelectedIndex(suggestionIndex)
                              }
                              variant="suggestion"
                            />
                          </div>
                        );
                      }
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
