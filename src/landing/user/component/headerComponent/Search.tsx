import React, { useState, useEffect } from 'react';

interface SearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  isOverlay?: boolean;
}

const Search: React.FC<SearchProps> = ({ 
  onSearch, 
  placeholder,
  className = "",
  isOverlay = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const defaultPlaceholder = "Tìm kiếm các mẫu xe điện, địa điểm, dịch vụ...";
  const typingText = placeholder || defaultPlaceholder;

  // Typing animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isTyping && currentIndex < typingText.length) {
        setDisplayText(typingText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      } else if (isTyping && currentIndex === typingText.length) {
        // Pause before erasing
        setTimeout(() => setIsTyping(false), 2000);
      } else if (!isTyping && currentIndex > 0) {
        setDisplayText(typingText.slice(0, currentIndex - 1));
        setCurrentIndex(currentIndex - 1);
      } else if (!isTyping && currentIndex === 0) {
        // Start typing again
        setIsTyping(true);
      }
    }, isTyping ? 100 : 50); // Faster erasing

    return () => clearTimeout(timer);
  }, [currentIndex, isTyping, typingText]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            className="w-full px-4 py-3 pl-12 pr-16 text-slate-800 font-bold bg-white border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md placeholder-slate-400"
            placeholder=""
          />
          
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <svg 
              className="w-5 h-5 text-black" 
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
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-slate-800 text-white text-sm font-bold rounded-full hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition-colors duration-200"
          >
            Tìm kiếm
          </button>
        </div>

        {/* Animated Placeholder */}
        {!searchQuery && (
          <div className="absolute left-12 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <span className="text-gray-400 text-sm">
              {displayText}
              <span className="animate-pulse">|</span>
            </span>
          </div>
        )}
      </form>

      {/* Search Suggestions Dropdown (Optional) */}
      {searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="p-3">
            <p className="text-sm text-gray-500 mb-2">Gợi ý tìm kiếm:</p>
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-slate-700 rounded transition-colors duration-200">
                🚗 {searchQuery} - Xe điện
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-slate-700 rounded transition-colors duration-200">
                🔧 {searchQuery} - địa điểm 
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-slate-700 rounded transition-colors duration-200">
                🛠️ {searchQuery} - dịch vụ
                
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Search;
