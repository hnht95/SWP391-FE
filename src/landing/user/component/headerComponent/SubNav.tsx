import React, { useEffect, useRef, useState } from "react";

interface SubNavProps {
  isHeaderHovered?: boolean;
}

const SubNav: React.FC<SubNavProps> = ({ isHeaderHovered = false }) => {
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

  // Show subnav when visible from scroll or when header/subnav is hovered
  const shouldShow = isVisible || isHeaderHovered || isSelfHovered;

  return (
    <>
      <style>{`
        .subnav-reset {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          border-width: 0 !important;
          border-style: none !important;
          border-color: transparent !important;
          background-image: none !important;
        }
        .subnav-reset * {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          border-width: 0 !important;
          border-style: none !important;
          border-color: transparent !important;
        }
        .subnav-reset::before, .subnav-reset::after, .subnav-reset *::before, .subnav-reset *::after {
          content: none !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .subnav-reset ul {
          list-style: none !important;
        }
        .subnav-reset a {
          text-decoration: none !important;
        }
        .subnav-container {
          background: rgba(0, 0, 0, 0.3) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
        }
      `}</style>
      <div 
        className={`subnav-reset subnav-container w-full sticky top-0 z-20 transition-transform duration-300 ${shouldShow ? 'translate-y-0' : '-translate-y-full'}`}
        onMouseEnter={() => setIsSelfHovered(true)}
        onMouseLeave={() => setIsSelfHovered(false)}
        style={{ WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)' }}
      >
        <nav className="subnav-reset w-full px-4">
          <ul className="subnav-reset flex items-center justify-center gap-8 text-base text-white/90 py-6">
            <li className="subnav-reset">
              <a className="subnav-reset hover:text-white transition-colors duration-200 font-medium" href="/">Home</a>
            </li>
            <li className="subnav-reset">
              <a className="subnav-reset hover:text-white transition-colors duration-200 font-medium" href="/CarCar">Car</a>
            </li>
            <li className="subnav-reset">
              <a className="subnav-reset hover:text-white transition-colors duration-200 font-medium" href="/about">About</a>
            </li>
            <li className="subnav-reset">
              <a className="subnav-reset hover:text-white transition-colors duration-200 font-medium" href="/contact">Contact</a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default SubNav;