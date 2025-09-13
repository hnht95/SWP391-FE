import Navbar from "./headerComponent/Navbar";
import Search from "./headerComponent/Search";
import User from "./headerComponent/User";

export default function Header() {
  return (
    <header className="w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 shadow-xl p-4 relative overflow-hidden">
      {/* Premium light effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent"></div>
      <div className="absolute top-0 left-1/3 w-72 h-72 bg-emerald-400/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-blue-400/15 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-0 w-48 h-48 bg-purple-400/10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl ring-2 ring-emerald-300/30 relative overflow-hidden group">
            {/* Premium glowing effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute -inset-2 bg-emerald-400/40 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2L3 7v11h14V7l-7-5zM8 15V9h4v6H8z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-xl font-bold text-white relative">
            <span className="text-emerald-400 bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">Green</span> Word
            {/* Text glow effect */}
            <div className="absolute inset-0 text-emerald-400/30 blur-sm -z-10">Green Word</div>
          </div>
        </div>

        {/* Thanh menu */}
        <Navbar className="text-white" />

        {/* Ô tìm kiếm */}
        <Search className="flex-1 max-w-md mx-4" />

        {/* User info */}
        <User />
      </div>
      </div>
    </header>
  );
}
