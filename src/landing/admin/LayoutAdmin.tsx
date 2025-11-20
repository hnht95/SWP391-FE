import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./component/Sidebar";

const LayoutAdmin: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={toggleSidebar} />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Content Area - Full height */}
        <div className="flex-1 px-8 py-6 bg-white overflow-hidden h-full overflow-y-auto">
          <Outlet />
        </div>
      </div>

      {/* Chatbot Component - Temporarily hidden */}
      {/* <ChatbotAnimated /> */}
    </div>
  );
};

export default LayoutAdmin;
