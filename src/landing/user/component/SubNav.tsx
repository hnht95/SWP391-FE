import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useRoleBasedNavigation } from "../../../hooks/useRoleBasedNavigation";

interface SubNavProps {
  isHeaderHovered?: boolean;
  isSearchOpen?: boolean;
}

const SubNav: React.FC<SubNavProps> = ({
  isHeaderHovered = false,
  isSearchOpen = false,
}) => {
  const lastScrollYRef = useRef(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isSelfHovered, setIsSelfHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const { getNavigationPaths } = useRoleBasedNavigation();
  const navigationPaths = getNavigationPaths();

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      // Light sensitivity: 5px threshold
      if (currentY < 50 || currentY < lastScrollYRef.current - 5) {
        setIsVisible(true);
      } else if (currentY > lastScrollYRef.current + 5) {
        setIsVisible(false);
      }

      lastScrollYRef.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hide entirely when search is open; otherwise show by scroll or hover
  const shouldShow =
    !isSearchOpen && (isVisible || isHeaderHovered || isSelfHovered);

  return (
    <>
      <div
        className={`w-full sticky top-[80px] md:top-[88px] z-40 bg-black/50 backdrop-blur-md transition-transform duration-700 ease-in-out will-change-transform select-none ${
          shouldShow ? "translate-y-0" : "-translate-y-full"
        }`}
        onMouseEnter={() => setIsSelfHovered(true)}
        onMouseLeave={() => {
          setIsSelfHovered(false);
          setHoveredItem(null);
        }}
      >
        <nav className="w-full px-4">
          <ul
            className="flex list-none items-center justify-center gap-6 md:gap-10 text-sm md:text-base text-white py-3 md:py-4"
            onMouseLeave={() => setHoveredItem(null)}
          >
            <li onMouseEnter={() => setHoveredItem(0)}>
              <Link
                className={`no-underline font-medium transition-all duration-300 cursor-pointer ${
                  hoveredItem !== null && hoveredItem !== 0
                    ? "text-white/50"
                    : "text-white"
                } ${
                  hoveredItem === 0
                    ? "brightness-200 drop-shadow-[0_0_12px_rgba(255,255,255,1)]"
                    : "hover:brightness-200 hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                }`}
                to={navigationPaths.home}
              >
                Home
              </Link>
            </li>
            {navigationPaths.vehicles && (
              <li onMouseEnter={() => setHoveredItem(1)}>
                <Link
                  className={`no-underline font-medium transition-all duration-300 cursor-pointer ${
                    hoveredItem !== null && hoveredItem !== 1
                      ? "text-white/50"
                      : "text-white"
                  } ${
                    hoveredItem === 1
                      ? "brightness-200 drop-shadow-[0_0_12px_rgba(255,255,255,1)]"
                      : "hover:brightness-200 hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                  }`}
                  to={navigationPaths.vehicles}
                >
                  Vehicles
                </Link>
              </li>
            )}
            {navigationPaths.aboutus && (
              <li onMouseEnter={() => setHoveredItem(2)}>
                <Link
                  className={`no-underline font-medium transition-all duration-300 cursor-pointer ${
                    hoveredItem !== null && hoveredItem !== 2
                      ? "text-white/50"
                      : "text-white"
                  } ${
                    hoveredItem === 2
                      ? "brightness-200 drop-shadow-[0_0_12px_rgba(255,255,255,1)]"
                      : "hover:brightness-200 hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                  }`}
                  to={navigationPaths.aboutus}
                >
                  About Us
                </Link>
              </li>
            )}
            {navigationPaths.contactus && (
              <li onMouseEnter={() => setHoveredItem(3)}>
                <Link
                  className={`no-underline font-medium transition-all duration-300 cursor-pointer ${
                    hoveredItem !== null && hoveredItem !== 3
                      ? "text-white/50"
                      : "text-white"
                  } ${
                    hoveredItem === 3
                      ? "brightness-200 drop-shadow-[0_0_12px_rgba(255,255,255,1)]"
                      : "hover:brightness-200 hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                  }`}
                  to={navigationPaths.contactus}
                >
                  Contact Us
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default SubNav;
