import React, { useState } from 'react';

interface UserProps {
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
}

const User: React.FC<UserProps> = ({ 
  userName = "Người dùng", 
  userAvatar, 
  onLogout 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      {/* User Avatar Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt="User Avatar" 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            userName.charAt(0).toUpperCase()
          )}
        </div>
        
        {/* User Name */}
        <span className="text-gray-300 font-medium text-sm hidden sm:block">
          {userName}
        </span>
        
        {/* Dropdown Arrow */}
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-600 py-1 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-600">
            <p className="text-sm font-medium text-gray-100">{userName}</p>
            <p className="text-xs text-gray-400">Thành viên</p>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 transition-colors duration-200 flex items-center space-x-2"
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
            <span>Đăng xuất</span>
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
