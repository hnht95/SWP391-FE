import React from "react";
import { useNavigate } from "react-router-dom";
import { MdLogout, MdPerson } from "react-icons/md";
import { useAuth } from "../../../hooks/useAuth";

interface HeaderAdminProps {
  title?: string;
  subtitle?: string;
}

const HeaderAdmin: React.FC<HeaderAdminProps> = ({ 
  title = "Admin Dashboard", 
  subtitle 
}) => {
  const navigate = useNavigate();
  const { logout, showGlobalLoading, hideGlobalLoading } = useAuth();

  const handleLogout = async () => {
    showGlobalLoading();
    try {
      await logout();
      navigate("/");
    } finally {
      // Small delay to let the spinner be visible briefly
      setTimeout(() => hideGlobalLoading(), 350);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            {title}
          </h1>
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
            <span>•</span>
            <span>
              {subtitle || new Date().toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Admin Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
              <MdPerson className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Quản trị viên</p>
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200"
          >
            <MdLogout className="w-4 h-4" />
            <span className="hidden md:inline text-sm font-medium">
              Đăng xuất
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;
