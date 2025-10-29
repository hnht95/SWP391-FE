import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./component/Sidebar";
import ChatbotAnimated from "./component/ChatbotAnimated";
import { SidebarProvider, useSidebar } from "./context/SidebarContext";

const LayoutAdminContent: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar } = useSidebar();

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

const LayoutAdmin: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutAdminContent />
    </SidebarProvider>
  );
};

export default LayoutAdmin;
