import Navbar from "./headerComponent/Navbar";
import Search from "./headerComponent/Search";
import User from "./headerComponent/User";

export default function Header() {
  return (
    <header className="w-full bg-gradient-to-r from-green-900 via-green-800 to-gray-900 shadow-lg p-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              {/* Tree trunk */}
              <path d="M12 16v6" stroke="currentColor" strokeWidth="2" fill="none"/>
              {/* Tree leaves - main canopy */}
              <path d="M12 2c-3 0-6 2-6 5s3 5 6 5 6-2 6-5-3-5-6-5z" fill="currentColor"/>
              {/* Tree leaves - smaller canopy */}
              <path d="M12 4c-2 0-4 1.5-4 3.5s2 3.5 4 3.5 4-1.5 4-3.5-2-3.5-4-3.5z" fill="currentColor"/>
              {/* Tree leaves - top */}
              <path d="M12 1c-1.5 0-3 1-3 2.5s1.5 2.5 3 2.5 3-1 3-2.5-1.5-2.5-3-2.5z" fill="currentColor"/>
            </svg>
          </div>
          <div className="text-xl font-bold text-white">
            <span className="text-green-400">Green</span> Word
          </div>
        </div>

        {/* Thanh menu */}
        <Navbar className="text-white" />

        {/* Ô tìm kiếm */}
        <Search className="flex-1 max-w-md mx-4" />

        {/* User info */}
        <User />
      </div>
    </header>
  );
}
