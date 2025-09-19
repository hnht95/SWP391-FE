import { useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarStaff from "./SidebarStaff";

const HomePageStaff = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  return (
    <div className="flex-1 px-8 py-3 overflow-auto">
      <SidebarStaff
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      <div className="flex-1 transition-all duration-300 ">
        <Outlet />
      </div>
    </div>
  );
};

export default HomePageStaff;
