import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

interface SubNavProps {
  isHeaderHovered?: boolean;
  isSearchOpen?: boolean;
}

const SubNav: React.FC<SubNavProps> = ({ isHeaderHovered = false, isSearchOpen = false }) => {
  const lastScrollYRef = useRef(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isSelfHovered, setIsSelfHovered] = useState(false);

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
  const shouldShow = !isSearchOpen && (isVisible || isHeaderHovered || isSelfHovered);

  return (
    <>
      <div
        className={`w-full sticky top-[80px] md:top-[88px] z-40 bg-black/50 backdrop-blur-md transition-transform duration-700 ease-in-out will-change-transform ${shouldShow ? 'translate-y-0' : '-translate-y-full'}`}
        onMouseEnter={() => setIsSelfHovered(true)}
        onMouseLeave={() => setIsSelfHovered(false)}
      >
        <nav className="w-full px-4">
          <ul className="flex list-none items-center justify-center gap-6 md:gap-10 text-sm md:text-base text-white py-3 md:py-4">
            <li>
              <Link className="no-underline text-white hover:text-white transition-colors duration-200 font-medium" to="/">Home</Link>
            </li>
            <li>
              <Link className="no-underline text-white hover:text-white transition-colors duration-200 font-medium" to="/CarCar">Car</Link>
            </li>
            <li>
              <Link className="no-underline text-white hover:text-white transition-colors duration-200 font-medium" to="/about">About</Link>
            </li>
            <li>
              <Link className="no-underline text-white hover:text-white transition-colors duration-200 font-medium" to="/contact">Contact</Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default SubNav;