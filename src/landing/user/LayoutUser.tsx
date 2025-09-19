import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./component/Header";
import SubNav from "./component/SubNav";
import Footer from "./component/Footer";

const LayoutUser = () => {
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  return (
    <div className="bg-white min-h-screen">
      <Header
        onHoverChange={setIsHeaderHovered}
        onSearchOpenChange={setIsSearchOpen}
      />
      <SubNav
        isHeaderHovered={isHeaderHovered && !isSearchOpen}
        isSearchOpen={isSearchOpen}
      />

      {/* Offset only header height; let SubNav overlay carousel */}
      <div className="pt-[80px] md:pt-[45px]">
        {/* Route con sẽ được render ở đây */}
        <Outlet />
      </div>

      <Footer />
    </div>
  );
};

export default LayoutUser;
