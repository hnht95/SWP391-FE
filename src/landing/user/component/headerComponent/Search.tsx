import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useDebounce from '../../../../hooks/useDebounce'
import { useSearchResults } from '../../../../hooks/useSearchResults'
import SearchResultItem from './searchComponent/SearchResultItem'
import SearchCarCard from './searchComponent/SearchCarCard'
import UnavailableCarNotification from './searchComponent/UnavailableCarNotification'
import { SEARCH_TIMING, SEARCH_TEXTS } from '../../../../constants/searchConstants'
import { checkUnavailableCarSearch } from '../../../../utils/vehicleStatusUtils'
import { carData } from '../../../../data/carData'
import type { Car } from '../../../../types/car'
import '../../../../styles/searchCardAnimations.css'


interface SearchProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
  onSearchComplete?: () => void
  isSearchOpen?: boolean
}

const Search: React.FC<SearchProps> = ({ 
  onSearch, 
  placeholder,
  className = '',
  onSearchComplete,
  isSearchOpen
}) => {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [unavailableCarInfo, setUnavailableCarInfo] = useState<{
    car: any
    message: string
    brandSuggestions: any[]
  } | null>(null)

  const typingText = placeholder || SEARCH_TEXTS.DEFAULT_PLACEHOLDER
  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_TIMING.DEBOUNCE_DELAY)

  const searchResults = useSearchResults(debouncedSearchQuery)

  // Total selectable items: ALL cars + fixed suggestions (1 instead of 2) 
  const totalItems = searchResults.length > 0 ? searchResults.length + 1 : 0


  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      setIsSearching(true)
      
      // Check for unavailable car search
      const unavailableCheck = checkUnavailableCarSearch(debouncedSearchQuery, carData as Car[])
      setUnavailableCarInfo(unavailableCheck)
      
      // Don't auto-select first item - let user choose with hover/arrows
      setTimeout(() => {
        setIsSearching(false)
        setShowResults(true)
        // Auto focus when results show
        inputRef.current?.focus()
      }, SEARCH_TIMING.SEARCH_DELAY)
    } else {
      setIsSearching(false)
      setShowResults(false)
      setSelectedIndex(-1)
      setUnavailableCarInfo(null)
    }
  }, [debouncedSearchQuery])

  // Typing animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isTyping && currentIndex < typingText.length) {
        setDisplayText(typingText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      } else if (isTyping && currentIndex === typingText.length) {
        // Pause before erasing
        setTimeout(() => setIsTyping(false), SEARCH_TIMING.PAUSE_BEFORE_ERASE);
      } else if (!isTyping && currentIndex > 0) {
        setDisplayText(typingText.slice(0, currentIndex - 1));
        setCurrentIndex(currentIndex - 1);
      } else if (!isTyping && currentIndex === 0) {
        // Start typing again
        setIsTyping(true);
      }
    }, isTyping ? SEARCH_TIMING.TYPING_SPEED : SEARCH_TIMING.ERASING_SPEED);

    return () => clearTimeout(timer);
  }, [currentIndex, isTyping, typingText]);

  // Auto focus when search overlay opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, SEARCH_TIMING.FOCUS_DELAY) // Small delay to ensure overlay is fully rendered
      return () => clearTimeout(timer)
    }
  }, [isSearchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedIndex >= 0 && totalItems > 0) {
      // User explicitly selected an item (using hover or arrow keys)
      if (selectedIndex < searchResults.length) {
        // Selected a specific car result - search for exact car only
        const selectedCar = searchResults[selectedIndex]
        setSearchQuery(selectedCar.name) // Fill the search box with full car name
        
        // Search for exact car name only (no brand filter needed)
        navigate(`/vehicles?search=${encodeURIComponent(selectedCar.name)}`)
      } else {
        // Selected a fixed suggestion - search by current query
        navigate(`/vehicles?search=${encodeURIComponent(searchQuery)}`)
      }
      setShowResults(false)
      setSelectedIndex(-1)
      setUnavailableCarInfo(null)
      onSearchComplete?.()
    } else if (searchQuery.trim()) {
      // User pressed Enter without selecting - search by current query only
      // This allows searching "Tesla" to show all Tesla cars instead of auto-selecting first result
      navigate(`/vehicles?search=${encodeURIComponent(searchQuery.trim())}`)
      setShowResults(false)
      setSelectedIndex(-1)
      setUnavailableCarInfo(null)
      onSearchComplete?.()
    } else if (onSearch) {
      onSearch(searchQuery)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setSelectedIndex(-1) // Reset selection when typing
    if (!value.trim()) {
      setShowResults(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || totalItems === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => {
          let newIndex: number
          if (prev === -1) {
            // From input field → go to first suggestion
            newIndex = 0
          } else if (prev < totalItems - 1) {
            // Navigate down in suggestions
            newIndex = prev + 1
          } else {
            // From last suggestion → wrap to first suggestion
            newIndex = 0
          }
          
          // Scroll into view after state update
          setTimeout(() => {
            const element = document.getElementById(`search-result-${newIndex}`)
            if (element) {
              element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest',
                inline: 'nearest'
              })
            }
          }, 0)
          
          return newIndex
        })
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => {
          if (prev === -1) {
            // Already at input field → stay at input
            return -1
          } else if (prev === 0) {
            // From first suggestion → back to input field
            inputRef.current?.focus()
            return -1
          } else {
            // Navigate up in suggestions
            const newIndex = prev - 1
            
            // Scroll into view after state update
            setTimeout(() => {
              const element = document.getElementById(`search-result-${newIndex}`)
              if (element) {
                element.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'nearest',
                  inline: 'nearest'
                })
              }
            }, 0)
            
            return newIndex
          }
        })
        break
      case 'Escape':
        e.preventDefault()
        setShowResults(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleInputFocus = () => {
    if (searchQuery.trim() && searchResults.length > 0) {
      setShowResults(true)
    }
  }

  const handleInputBlur = (e: React.FocusEvent) => {
    // Don't close if focus is moving to a result button
    const relatedTarget = e.relatedTarget as HTMLElement
    if (relatedTarget && relatedTarget.closest('.search-results')) {
      return
    }
    setTimeout(() => {
      setShowResults(false)
    }, SEARCH_TIMING.BLUR_DELAY)
  }

  const handleResultClick = (car: any) => {
    // Fill search box with selected car name
    setSearchQuery(car.name)
    
    // Search for exact car name only (no brand filter needed) 
    navigate(`/vehicles?search=${encodeURIComponent(car.name)}`)
    
    setShowResults(false)
    setSelectedIndex(-1)
    setUnavailableCarInfo(null)
    onSearchComplete?.()
  }

  const handleSuggestionClick = () => {
    // Navigate to vehicles list with current search query
    navigate(`/vehicles?search=${encodeURIComponent(searchQuery)}`)
    setShowResults(false)
    setSelectedIndex(-1)
    setUnavailableCarInfo(null)
    onSearchComplete?.()
  }

  const handleUnavailableCarSuggestionClick = (car: any) => {
    // Fill search box with suggested car name and search
    setSearchQuery(car.name)
    setUnavailableCarInfo(null)
    
    // Navigate to specific car search
    navigate(`/vehicles?search=${encodeURIComponent(car.name)}`)
    setShowResults(false)
    setSelectedIndex(-1)
    onSearchComplete?.()
  }

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        {/* Search Input - Thiết kế gốc */}
        <div 
          className={`relative bg-transparent border-b-2 pb-2 cursor-text transition-all duration-200 ${
            selectedIndex === -1 && showResults && searchQuery 
              ? 'border-cyan-300 shadow-[0_2px_8px_rgba(165,243,252,0.3)]' 
              : 'border-white'
          }`}
          onClick={() => inputRef.current?.focus()}
        >
          <div className="flex items-center">
            {/* Search Icon - White color */}
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

            {/* Search Input */}
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              className={`flex-1 bg-transparent text-white text-lg focus:outline-none placeholder-gray-400 ${
                searchQuery.length === 0 ? 'caret-transparent' : 'caret-white'
              }`}
              placeholder=""
            />

            {/* Search Button */}
            <button
              type="submit"
              onClick={() => {
                // Auto focus input when click search button
                inputRef.current?.focus();
              }}
              className="ml-4 px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
            >
              {SEARCH_TEXTS.SEARCH_BUTTON}
            </button>
          </div>
        </div>

        {/* Animated Placeholder - Only show when input is empty */}
        {searchQuery.length === 0 && (
          <div className="absolute left-10 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <span className="text-gray-400 text-lg">
              {displayText}
              <span className="inline-block w-0.5 h-5 bg-gray-400 ml-0.5 animate-pulse opacity-75"></span>
            </span>
          </div>
        )}
      </form>

      {/* Search Suggestions - Thiết kế gốc với smooth animation */}
      {showResults && searchQuery && (
        <div className="search-results absolute top-full left-0 right-0 mt-4 z-50 transform transition-all duration-300 ease-in-out animate-in slide-in-from-top-2">
          <div className="space-y-2">
            {isSearching ? (
              <div className="text-white text-lg py-2 transition-opacity duration-200">
                {SEARCH_TEXTS.SEARCHING}
              </div>
            ) : (
              <>
                {/* Car Results */}
                {searchResults.length > 0 ? (
                  <div className="relative">
                    {/* Scrollable Container */}
                    <div 
                      className="space-y-3 search-results-container max-h-[500px] overflow-y-auto overflow-x-hidden p-1 smooth-scroll"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent'
                      }}
                      id="search-results-list"
                    >
                      {searchResults.map((car, index) => (
                        <div
                          key={car.id}
                          id={`search-result-${index}`}
                          className="search-card-enter-stagger"
                          style={{
                            animationDelay: `${Math.min(index, 15) * 80}ms`
                          }}
                        >
                          <SearchCarCard
                            car={car}
                            searchTerm={debouncedSearchQuery}
                            isSelected={selectedIndex === index}
                            index={index}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleResultClick(car)
                            }}
                            onMouseEnter={() => setSelectedIndex(index)}
                          />
                        </div>
                      ))}
                    </div>
                    
                    {/* Scroll Indicators - Show when there are many results */}
                    {searchResults.length > 5 && (
                      <>
                        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black/60 via-black/30 to-transparent pointer-events-none opacity-90 z-10"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none opacity-90 z-10"></div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-400 text-lg py-4 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.901-6.06 2.377C5.482 17.84 5.17 18.319 5.306 19H18.694c.136-.681-.176-1.16-.634-1.623C16.47 15.901 14.34 15 12 15z"/>
                      </svg>
                      <div>{SEARCH_TEXTS.NO_RESULTS}</div>
                    </div>
                  </div>
                )}
                
                {/* Separator */}
                {searchResults.length > 0 && (
                  <div className="border-t border-white my-2 opacity-30"></div>
                )}
                
                {/* Fixed Suggestions */}
                {[
                  { text: `${searchQuery} - stations` }
                ].map((suggestion, index) => {
                  const suggestionIndex = searchResults.length + index
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
                          e.preventDefault()
                          e.stopPropagation()
                          handleSuggestionClick()
                        }}
                        onMouseEnter={() => setSelectedIndex(suggestionIndex)}
                        variant="suggestion"
                      />
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>
      )}

      {/* Unavailable Car Notification */}
      {unavailableCarInfo && (
        <UnavailableCarNotification
          car={unavailableCarInfo.car}
          message={unavailableCarInfo.message}
          brandSuggestions={unavailableCarInfo.brandSuggestions}
          onSuggestionClick={handleUnavailableCarSuggestionClick}
        />
      )}

    </div>
  );
};

export default Search;
