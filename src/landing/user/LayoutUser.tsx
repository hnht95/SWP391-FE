import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./component/Header";
import Footer from "./component/Footer";

const LayoutUser = () => {
  return (
    <div>
      <Header />

      {/* Route con sẽ được render ở đây */}
      <Outlet />

      <Footer />
    </div>
  );
};

export default LayoutUser;
