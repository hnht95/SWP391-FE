import React, { useState } from "react";
import SidebarStaff from "./component/SidebarStaff";
import HomePageStaff from "./component/HomePageStaff";

const LayoutStaff = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarStaff
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <HomePageStaff />
      </div>
    </div>
  );
};

export default LayoutStaff;
