import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import User from "./headerComponent/User";
import logoWeb from "../../../assets/loginImage/logoZami.png";

interface HeaderProps {
  onHoverChange?: (isHovered: boolean) => void;
  onSearchOpenChange?: (isOpen: boolean) => void;
}

export default function Header({
  onHoverChange,
  onSearchOpenChange,
}: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const placeholders = [
    "Search for cars...",
    "Search for locations...",
    "Search for services...",
    "Search for policies...",
    "Search for dealers...",
    "Search for parts...",
  ];

  // Typing animation for search placeholder - only when search is empty
  useEffect(() => {
    if (!isSearchOpen || searchValue.length > 0) return;

    const currentText = placeholders[currentPlaceholder];
    const timer = setTimeout(
      () => {
        if (isTyping && charIndex < currentText.length) {
          setDisplayText(currentText.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else if (isTyping && charIndex === currentText.length) {
          setTimeout(() => setIsTyping(false), 2000);
        } else if (!isTyping && charIndex > 0) {
          setDisplayText(currentText.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else if (!isTyping && charIndex === 0) {
          setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
          setIsTyping(true);
        }
      },
      isTyping ? 100 : 50
    );

    return () => clearTimeout(timer);
  }, [
    charIndex,
    isTyping,
    currentPlaceholder,
    isSearchOpen,
    searchValue,
    placeholders,
  ]);

  // Reset animation when search value changes
  useEffect(() => {
    if (searchValue.length === 0 && isSearchOpen) {
      setDisplayText("");
      setCharIndex(0);
      setIsTyping(true);
    }
  }, [searchValue, isSearchOpen]);

  // Prevent scrolling when search is open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSearchOpen]);

  // Focus search input when opening search overlay
  useEffect(() => {
    if (isSearchOpen) {
      // Allow DOM to paint before focusing
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [isSearchOpen]);

  // When search opens, ensure subnav doesn't open via header hover
  useEffect(() => {
    if (isSearchOpen) {
      onHoverChange && onHoverChange(false);
      onSearchOpenChange && onSearchOpenChange(true);
    } else {
      onSearchOpenChange && onSearchOpenChange(false);
    }
  }, [isSearchOpen, onHoverChange, onSearchOpenChange]);

  // Header is always visible (fixed)
  const shouldShowContent = true;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full bg-black shadow-xl px-6 z-50 transition-all duration-700 ease-in-out select-none ${
          shouldShowContent ? "py-3" : "py-2"
        }`}
        onMouseEnter={() => {
          if (!isSearchOpen) {
            onHoverChange && onHoverChange(true);
          }
        }}
        onMouseLeave={() => {
          onHoverChange && onHoverChange(false);
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center">
            {/* Left: Empty space for balance */}
            <div className="flex-1"></div>

            {/* Center: Logo ZaMi - Bigger size */}
            <div className="flex items-center justify-center">
              <img
                src={logoWeb}
                alt="ZaMi Logo"
                className={`object-contain transition-all duration-300 ${
                  shouldShowContent ? "h-14 md:h-16" : "h-10 md:h-12"
                }`}
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>

            {/* Right: Search trigger stays, Login flush right */}
            <div className="flex-1 flex items-center justify-end relative">
              {/* Search trigger - keep position; reserve space for Login on the far right */}
              <div
                className={`flex items-center transition-all duration-700 ease-in-out will-change-transform ${
                  shouldShowContent && !isSearchOpen
                    ? "opacity-100 transform translate-y-0"
                    : isSearchOpen
                    ? "opacity-0 transform -translate-y-8"
                    : "opacity-0 transform translate-y-4 pointer-events-none"
                } pr-10 md:pr-12`}
              >
                <button
                  onClick={() => {
                    setIsSearchOpen(true);
                    onHoverChange && onHoverChange(false);
                    onSearchOpenChange && onSearchOpenChange(true);
                  }}
                  className="group flex items-center gap-1 text-white transition duration-200 px-2 hover:brightness-200 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] cursor-pointer"
                >
                  <svg
                    className="w-4 h-4 text-white group-hover:brightness-150 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
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
                  <span
                    className="text-[12px] font-normal group-hover:brightness-150 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
                    style={{ fontFamily: '"MBCorpo Text", sans-serif' }}
                  >
                    Search
                  </span>
                </button>
              </div>

              {/* Login/User - stick to the far right */}
              <div
                className={`absolute right-0 transition-all duration-700 ease-in-out will-change-transform ${
                  shouldShowContent && !isSearchOpen
                    ? "opacity-100 transform translate-y-0"
                    : isSearchOpen
                    ? "opacity-0 transform -translate-y-8"
                    : "opacity-0 transform translate-y-4 pointer-events-none"
                }`}
              >
                <User />
              </div>

              {/* Close Search with fly-down animation */}
              <div
                className={`transition-all duration-700 ease-in-out will-change-transform ${
                  isSearchOpen
                    ? "opacity-100 transform translate-y-0"
                    : "opacity-0 transform -translate-y-8 pointer-events-none"
                }`}
              >
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchValue("");
                    onSearchOpenChange && onSearchOpenChange(false);
                  }}
                  className="text-white text-[12px] font-normal px-2 py-1 rounded hover:bg-white/10 transition-colors duration-200"
                  style={{ fontFamily: '"MBCorpo Text", sans-serif' }}
                >
                  Close Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search overlay - expands from top to bottom */}
      <div
        className={`fixed top-0 left-0 w-full z-30 transition-all duration-700 ease-in-out ${
          isSearchOpen ? "h-screen" : "h-0"
        } overflow-hidden`}
      >
        {/* Header space - bigger to match header size */}
        <div
          className={`bg-transparent transition-all duration-300 ${
            shouldShowContent ? "h-[60px] md:h-[64px]" : "h-[48px] md:h-[52px]"
          }`}
        ></div>

        {/* Search area with expanding animation */}
        <div
          className={`bg-black/50 backdrop-blur-sm transition-all duration-700 ease-in-out ${
            isSearchOpen ? "h-full opacity-100" : "h-0 opacity-0"
          }`}
        >
          <div
            className={`px-4 pt-8 transition-all duration-700 ease-in-out delay-200 ${
              isSearchOpen
                ? "opacity-100 transform translate-y-0"
                : "opacity-0 transform -translate-y-4"
            }`}
          >
            {/* Search box like the image */}
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="relative bg-transparent border-b-2 border-white pb-2">
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
                      type="text"
                      value={searchValue}
                      onChange={handleSearchChange}
                      ref={searchInputRef}
                      className="flex-1 bg-transparent text-white text-lg focus:outline-none placeholder-gray-400"
                      placeholder=""
                    />

                    {/* Search Button */}
                    <button className="ml-4 px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors duration-200">
                      Search
                    </button>
                  </div>

                  {/* Animated Placeholder - Only show when input is empty */}
                  {searchValue.length === 0 && (
                    <div className="absolute left-10 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <span className="text-gray-400 text-lg">
                        {displayText}
                        <span className="animate-pulse">|</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Search suggestions like Mercedes */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Vehicles</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>
                      <Link
                        to="/"
                        className="hover:text-white transition-colors"
                      >
                        New Cars
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/"
                        className="hover:text-white transition-colors"
                      >
                        Electric Cars
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/"
                        className="hover:text-white transition-colors"
                      >
                        Test Drive
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Services</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>
                      <Link
                        to="/"
                        className="hover:text-white transition-colors"
                      >
                        Maintenance
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/"
                        className="hover:text-white transition-colors"
                      >
                        Parts
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/"
                        className="hover:text-white transition-colors"
                      >
                        Support
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Company</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>
                      <Link
                        to="/about"
                        className="hover:text-white transition-colors"
                      >
                        About
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/contact"
                        className="hover:text-white transition-colors"
                      >
                        Contact
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/"
                        className="hover:text-white transition-colors"
                      >
                        Careers
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
