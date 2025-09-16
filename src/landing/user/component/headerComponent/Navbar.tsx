import React, { useState } from "react";

interface NavbarProps {
  className?: string;
  onNavigate?: (path: string) => void;
}

interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ className = "", onNavigate }) => {
  const [activeItem, setActiveItem] = useState("Home");

  const navItems: NavItem[] = [
    {
      label: "Home",
      path: "/",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      label: "Car",
      path: "/CarCar",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      label: "About",
      path: "/about",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "Contact",
      path: "/contact",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  const handleNavClick = (item: NavItem) => {
    setActiveItem(item.label);
    if (onNavigate) {
      onNavigate(item.path);
    }
  };

  return (
    <nav className={`${className}`}>
      <div className="flex items-center space-x-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleNavClick(item)}
            className={`
              relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ease-in-out
              ${
                activeItem === item.label
                  ? "text-white bg-green-900/30"
                  : "text-white hover:text-white hover:bg-gray-800"
              }
              group
            `}
          >
            {/* Icon */}
            <span
              className={`
              transition-colors duration-300
              ${
                activeItem === item.label
                  ? "text-white"
                  : "text-white group-hover:text-white"
              }
            `}
            >
              {item.icon}
            </span>

            {/* Label */}
            <span className="hidden sm:block">{item.label}</span>

            {/* Active indicator */}
            {activeItem === item.label && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full"></div>
            )}

            {/* Hover effect */}
            <div className="absolute inset-0 rounded-lg bg-green-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          </button>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <div className="sm:hidden">
        <button className="p-2 rounded-lg text-white hover:text-white hover:bg-gray-800 transition-colors duration-300">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
