import { Outlet, useLocation } from "react-router-dom";
import Header from "./component/Header";
import Footer from "./component/Footer";

const LayoutUser = () => {
  // Removed unused local UI states now that SubNav is embedded inside Header
  const location = useLocation();
  const hideGlobalChrome = location.pathname.startsWith("/profile");
  return (
    <div className="bg-white min-h-screen">
      {!hideGlobalChrome && (
        <>
          <Header />
        </>
      )}
      <div className={hideGlobalChrome ? "pt-0" : ""}>
        <div className={hideGlobalChrome ? "" : ""}>
          <Outlet />
        </div>
      </div>

      {!hideGlobalChrome && <Footer />}
    </div>
  );
};

export default LayoutUser;
