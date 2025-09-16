import React, { useState } from 'react';

interface UserProps {
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
  isLoggedIn?: boolean;
}

const User: React.FC<UserProps> = ({ 
  userName = "Login", 
  userAvatar, 
  onLogout,
  isLoggedIn = false
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
      {/* User Avatar/Login Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="group flex items-center space-x-2 px-2 py-1 rounded-full transition duration-200 focus:outline-none hover:brightness-200 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
      >
        <div className="w-7 h-7 flex items-center justify-center text-white overflow-hidden">
          {isLoggedIn && userAvatar ? (
            <img src={userAvatar} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <svg className="w-5 h-5 text-white group-hover:brightness-150 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A4 4 0 019 16h6a4 4 0 013.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </div>
        {!isLoggedIn && (
          <>
            <span className="text-white font-normal text-[12px] hidden sm:block group-hover:brightness-150 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]" style={{ fontFamily: '"MBCorpo Text", sans-serif' }}>Login</span>
            <svg className="w-4 h-4 text-white/80 group-hover:text-white group-hover:brightness-150 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-600 py-1 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-slate-600">
            <p className="text-sm font-medium text-white">{userName}</p>
            <p className="text-xs text-slate-300">Thành viên</p>
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
