import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useDebounce from '../../../../hooks/useDebounce'
import { useSearchResults } from '../../../../hooks/useSearchResults'
import SearchResultItem from './searchComponent/SearchResultItem'
import { SEARCH_TIMING, SEARCH_UI, SEARCH_TEXTS } from '../../../../constants/searchConstants'


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

  const typingText = placeholder || SEARCH_TEXTS.DEFAULT_PLACEHOLDER
  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_TIMING.DEBOUNCE_DELAY)

  const searchResults = useSearchResults(debouncedSearchQuery)

  // Total selectable items: cars + fixed suggestions
  const totalItems = searchResults.length > 0 ? searchResults.length + SEARCH_UI.FIXED_SUGGESTIONS_COUNT : 0


  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      setIsSearching(true)
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
      onSearchComplete?.()
    } else if (searchQuery.trim()) {
      // User pressed Enter without selecting - search by current query only
      // This allows searching "Tesla" to show all Tesla cars instead of auto-selecting first result
      navigate(`/vehicles?search=${encodeURIComponent(searchQuery.trim())}`)
      setShowResults(false)
      setSelectedIndex(-1)
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
          if (prev === -1) {
            // From input field → go to first suggestion
            return 0
          } else if (prev < totalItems - 1) {
            // Navigate down in suggestions
            return prev + 1
          } else {
            // From last suggestion → wrap to first suggestion
            return 0
          }
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
            return prev - 1
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
    onSearchComplete?.()
  }

  const handleSuggestionClick = () => {
    // Navigate to vehicles list with current search query
    navigate(`/vehicles?search=${encodeURIComponent(searchQuery)}`)
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
              className="w-6 h-6 text-white mr-4"
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
              className="flex-1 bg-transparent text-white text-lg focus:outline-none placeholder-gray-400"
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
              <span className="animate-pulse">|</span>
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
                  searchResults.slice(0, SEARCH_UI.MAX_RESULTS).map((car, index) => (
                    <SearchResultItem
                      key={car.id}
                      text={car.name}
                      searchTerm={debouncedSearchQuery}
                      isSelected={selectedIndex === index}
                      index={index}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleResultClick(car)
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      variant="car"
                    />
                  ))
                ) : (
                  <div className="text-gray-400 text-lg py-2">
                    {SEARCH_TEXTS.NO_RESULTS}
                  </div>
                )}
                
                {/* Separator */}
                {searchResults.length > 0 && (
                  <div className="border-t border-white my-2 opacity-30"></div>
                )}
                
                {/* Fixed Suggestions */}
                {[
                  { text: `${searchQuery} - locations` },
                  { text: `${searchQuery} - services` }
                ].map((suggestion, index) => {
                  const suggestionIndex = searchResults.length + index
                  return (
                    <SearchResultItem
                      key={suggestion.text}
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
                  )
                })}
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Search;
