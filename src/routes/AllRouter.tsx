import { Routes, Route } from "react-router-dom";
import LayoutUser from "../landing/user/LayoutUser";
import LoginPage from "../auth/login/LoginPage";
import HomePage from "../landing/user/component/HomePage";
import SignUpPage from "../auth/signUp/SignUpPage";
import ForgotPasswordPage from "../auth/forgotPassword/ForgotPasswordPage";
import LayoutStaff from "../landing/staff/LayoutStaff";
import HomePageStaff from "../landing/staff/component/HomePageStaff";
import AboutUs from "../landing/user/component/subnavComponent/AboutUs";
import ContactUs from "../landing/user/component/subnavComponent/ContactUs";
import UserProfile from "../landing/user/component/UserProfile";

import React, { useState } from "react";

const AllRouter = () => {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "handover" | "maintain" | "reports" | "vehicles"
  >("dashboard");

  return (
    <Routes>
      <Route element={<LayoutUser />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/vehicles" element={<AboutUs />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/profile" element={<UserProfile />} />
        {/* Thêm các route khác cần Header/Footer ở đây */}
      </Route>
      <Route element={<LayoutStaff />}>
        <Route
          path="/staff"
          element={
            <HomePageStaff activeTab={activeTab} setActiveTab={setActiveTab} />
          }
        />
        <Route
          path="/staff/dashboard"
          element={
            <HomePageStaff activeTab={activeTab} setActiveTab={setActiveTab} />
          }
        />

        {/* <Route path="/aboutUs" element={<AboutUs />} /> */}
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    </Routes>
  );
};

export default AllRouter;
