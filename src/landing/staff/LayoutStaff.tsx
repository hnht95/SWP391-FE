import React, { useState } from "react";
import { motion } from "framer-motion";
import SidebarStaff from "./component/SidebarStaff";
import HomePageStaff from "./component/HomePageStaff";

const LayoutStaff = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Layout animation variants
  const layoutVariants = {
    expanded: {
      marginLeft: "16rem", // ml-64
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 40,
        mass: 0.8,
      },
    },
    collapsed: {
      marginLeft: "4rem", // ml-16
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 40,
        mass: 0.8,
      },
    },
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Animated Sidebar */}
      <motion.div
        initial={{ x: -280, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 35,
            duration: 0.6,
          },
        }}
      >
        <SidebarStaff
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </motion.div>

      {/* Main Content with smooth margin transition */}
      <motion.div
        className="flex-1 flex flex-col"
        variants={layoutVariants}
        animate={isSidebarCollapsed ? "collapsed" : "expanded"}
        style={{ marginLeft: 0 }} // Let motion handle the margin
      >
        <HomePageStaff />
      </motion.div>
    </div>
  );
};

export default LayoutStaff;
