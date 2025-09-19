import React, { useState } from "react";
import SidebarStaff from "./component/SidebarStaff";
import HomePageStaff from "./component/HomePageStaff";

const LayoutStaff = () => {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "handover" | "maintain" | "reports"
  >("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarStaff
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <HomePageStaff activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default LayoutStaff;
