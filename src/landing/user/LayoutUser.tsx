import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./component/Header";
import SubNav from "./component/headerComponent/SubNav";
import Footer from "./component/Footer";

const LayoutUser = () => {
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  return (
    <div>
      <Header onHoverChange={setIsHeaderHovered} />
      <SubNav isHeaderHovered={isHeaderHovered} />

      {/* Route con sẽ được render ở đây */}
      <Outlet />

      <Footer />
    </div>
  );
};

export default LayoutUser;
