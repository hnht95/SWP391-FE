import { useState, useEffect } from "react";
import Search from "./headerComponent/Search";
import logoWeb from "../../../assets/loginImage/logoZami.png";
import {
  HEADER_TIMING,
  HEADER_DIMENSIONS,
  HEADER_STYLES,
  TRANSITION_CLASSES,
} from "../../../constants/headerConstants";
import { SEARCH_TEXTS } from "../../../constants/searchConstants";
import { useAuth } from "../../../hooks/useAuth";
import User from "./headerComponent/User";

interface HeaderProps {
  onHoverChange?: (isHovered: boolean) => void;
  onSearchOpenChange?: (isOpen: boolean) => void;
}

export default function Header({
  onHoverChange,
  onSearchOpenChange,
}: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

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

  // When search opens, ensure subnav doesn't open via header hover
  useEffect(() => {
    if (isSearchOpen) {
      if (onHoverChange) {
        onHoverChange(false);
      }
      if (onSearchOpenChange) {
        onSearchOpenChange(true);
      }
    } else {
      if (onSearchOpenChange) {
        onSearchOpenChange(false);
      }
    }
  }, [isSearchOpen, onHoverChange, onSearchOpenChange]);

  // Helper functions for conditional classes
  const getHeaderClasses = () => {
    const baseClasses = `fixed top-0 left-0 w-full bg-black shadow-xl px-6 z-[100] ${TRANSITION_CLASSES.BASE} select-none`;
    const paddingClass = HEADER_DIMENSIONS.PADDING_LARGE;
    return `${baseClasses} ${paddingClass}`;
  };

  const getLogoClasses = () => {
    return `object-contain transition-all duration-${HEADER_TIMING.GENERAL_DURATION} ${HEADER_DIMENSIONS.LARGE_HEIGHT}`;
  };

  const getElementVisibilityClass = (isSearchOpen: boolean) => {
    if (!isSearchOpen) return TRANSITION_CLASSES.VISIBLE;
    return `${TRANSITION_CLASSES.HIDDEN_UP} ${TRANSITION_CLASSES.DISABLED}`;
  };

  const getSearchTriggerClasses = (isSearchOpen: boolean) => {
    return `flex items-center ${
      TRANSITION_CLASSES.BASE
    } ${getElementVisibilityClass(isSearchOpen)} pr-10 md:pr-12`;
  };

  const getCloseSearchClasses = (isSearchOpen: boolean) => {
    const visibilityClass = isSearchOpen
      ? TRANSITION_CLASSES.VISIBLE
      : `${TRANSITION_CLASSES.HIDDEN_UP} ${TRANSITION_CLASSES.DISABLED}`;
    return `${TRANSITION_CLASSES.BASE} ${visibilityClass}`;
  };

  const getHeaderSpaceClasses = () => {
    return `bg-transparent transition-all duration-${HEADER_TIMING.GENERAL_DURATION} ${HEADER_DIMENSIONS.HEADER_SPACE_LARGE}`;
  };

  const getSearchAreaClasses = (isSearchOpen: boolean) => {
    const visibilityClass = isSearchOpen
      ? "h-full opacity-100"
      : "h-0 opacity-0";
    return `bg-black/70 backdrop-blur-sm ${TRANSITION_CLASSES.BASE} ${visibilityClass}`;
  };

  const getSearchContentClasses = (isSearchOpen: boolean) => {
    const visibilityClass = isSearchOpen
      ? TRANSITION_CLASSES.VISIBLE
      : "opacity-0 transform -translate-y-4";
    return `px-4 pt-8 ${TRANSITION_CLASSES.BASE} delay-200 ${visibilityClass}`;
  };

  return (
    <>
      <header
        className={getHeaderClasses()}
        onMouseEnter={() => {
          if (!isSearchOpen) {
            if (onHoverChange) onHoverChange(true);
          }
        }}
        onMouseLeave={() => {
          if (onHoverChange) onHoverChange(false);
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
                className={getLogoClasses()}
                style={{ filter: HEADER_STYLES.LOGO_FILTER }}
              />
            </div>

            {/* Right: Search trigger stays, Login flush right */}
            <div className="flex-1 flex items-center justify-end relative">
              {/* Search trigger - keep position; reserve space for Login on the far right */}
              <div className={getSearchTriggerClasses(isSearchOpen)}>
                <button
                  onClick={() => {
                    setIsSearchOpen(true);
                    if (onHoverChange) onHoverChange(false);
                    if (onSearchOpenChange) onSearchOpenChange(true);
                  }}
                  className="group flex items-center gap-2 text-white transition duration-200 px-3 py-1 hover:brightness-200 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] cursor-pointer"
                >
                  <svg
                    className="w-6 h-5 text-white group-hover:brightness-150 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
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
                    className="text-[16px] font-medium group-hover:brightness-150 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
                    style={{ fontFamily: HEADER_STYLES.FONT_FAMILY }}
                  >
                    Search
                  </span>
                </button>
              </div>

              {/* Login/User - stick to the far right */}
              <div
                className={`absolute right-0 ${getSearchTriggerClasses(
                  isSearchOpen
                )}`}
              >
                <User
                  isLoggedIn={isAuthenticated}
                  userName={user?.name}
                  onLogout={logout}
                />
              </div>

              {/* Close Search with fly-down animation */}
              <div className={getCloseSearchClasses(isSearchOpen)}>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    if (onSearchOpenChange) onSearchOpenChange(false);
                  }}
                  className="text-white text-[14px] font-normal px-3 py-1.5 rounded cursor-pointer border border-transparent hover:border-white hover:bg-white/5 transition-all duration-300 ease-in-out"
                  style={{ fontFamily: HEADER_STYLES.FONT_FAMILY }}
                >
                  {SEARCH_TEXTS.CLOSE_SEARCH}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search overlay - expands from top to bottom */}
      <div
        className={`fixed top-0 left-0 w-full z-30 ${TRANSITION_CLASSES.BASE} ${
          isSearchOpen ? "h-screen" : "h-0"
        } overflow-hidden`}
      >
        {/* Header space - bigger to match header size */}
        <div className={getHeaderSpaceClasses()}></div>

        {/* Search area with expanding animation */}
        <div className={getSearchAreaClasses(isSearchOpen)}>
          <div className={getSearchContentClasses(isSearchOpen)}>
            {/* Search component */}
            <div className="max-w-4xl mx-auto">
              <Search
                className="w-full"
                placeholder="Tìm kiếm xe điện, địa điểm, dịch vụ..."
                onSearchComplete={() => setIsSearchOpen(false)}
                isSearchOpen={isSearchOpen}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
