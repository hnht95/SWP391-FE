import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface UserProps {
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
  isLoggedIn?: boolean;
}

const User: React.FC<UserProps> = ({
  userName = "Guest User",
  userAvatar,
  onLogout,
  isLoggedIn = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setIsDropdownOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsDropdownOpen(false);
  };

  const handleLoginClick = () => {
    navigate("/login");
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      {/* User Avatar/Login Button */}
      <button
        onClick={
          isLoggedIn
            ? () => setIsDropdownOpen(!isDropdownOpen)
            : handleLoginClick
        }
        aria-expanded={isDropdownOpen}
        className="group flex items-center space-x-2 px-2 py-1 rounded-full transition duration-200 focus:outline-none hover:brightness-200 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] cursor-pointer"
      >
        <div className="w-7 h-7 flex items-center justify-center text-white overflow-hidden">
          {isLoggedIn && userAvatar ? (
            <img
              src={userAvatar}
              alt="User Avatar"
              className="w-full h-full rounded-full object-cover"
            />
          ) : isLoggedIn ? (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            </div>
          ) : (
            <svg
              className="w-5 h-5 text-white group-hover:brightness-150 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A4 4 0 019 16h6a4 4 0 013.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </div>
        {!isLoggedIn && (
          <>
            <span
              className="text-white font-normal text-[12px] hidden sm:block group-hover:brightness-150 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
              style={{ fontFamily: '"MBCorpo Text", sans-serif' }}
            >
              Login
            </span>
            <svg
              className={`w-4 h-4 text-white/80 group-hover:text-white group-hover:brightness-150 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] transform transition-transform duration-300 ${
                isDropdownOpen ? "rotate-180" : "rotate-0"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </>
        )}
        {isLoggedIn && (
          <svg
            className={`w-4 h-4 text-white/80 group-hover:text-white group-hover:brightness-150 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] transform transition-transform duration-300 ${
              isDropdownOpen ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>

      {/* Dropdown Menu with smooth transition */}
      {isLoggedIn && (
        <div
          className={`absolute right-0 mt-2 w-56 bg-white text-black rounded-lg shadow-xl border border-gray-200 py-2 z-50 transform origin-top-right transition-all duration-300 ease-out ${
            isDropdownOpen
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }`}
          role="menu"
          aria-hidden={!isDropdownOpen}
        >
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-gray-500">Member</p>
          </div>

          {/* Profile Button */}
          <button
            onClick={handleProfileClick}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
          >
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>View Profile</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
          >
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default User;
