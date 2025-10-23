import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./component/Header";
import SubNav from "./component/SubNav";
import Footer from "./component/Footer";

const LayoutUser = () => {
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  // Hide global header/subnav/footer for the profile route so the profile layout
  // can be full-height and centered without the global chrome.
  const hideGlobalChrome = location.pathname.startsWith("/profile");
  return (
    <div className="bg-white min-h-screen">
      {!hideGlobalChrome && (
        <>
          <Header
            onHoverChange={setIsHeaderHovered}
            onSearchOpenChange={setIsSearchOpen}
          />
          <SubNav
            isHeaderHovered={isHeaderHovered && !isSearchOpen}
            isSearchOpen={isSearchOpen}
          />
        </>
      )}

      {/* If we hide the global chrome (header/footer), remove top padding and center content */}
      <div className={hideGlobalChrome ? "pt-0" : "pt-[80px] md:pt-[45px]"}>
        <div className={hideGlobalChrome ? "" : ""}>
          {/* Route children will be rendered here */}
          <Outlet />
        </div>
      </div>

      {!hideGlobalChrome && <Footer />}
    </div>
  );
};

export default LayoutUser;
