import { Routes, Route } from "react-router-dom";
import LayoutUser from "../landing/user/LayoutUser";
import LoginPage from "../auth/login/LoginPage";
import HomePage from "../landing/user/component/HomePage";
import SignUpPage from "../auth/signUp/SignUpPage";
import ForgotPasswordPage from "../auth/forgotPassword/ForgotPasswordPage";
import LayoutStaff from "../landing/staff/LayoutStaff";
import HomePageStaff from "../landing/staff/component/HomePageStaff";
import AboutUs from "../landing/user/component/subnavComponent/AboutUs";
import Vehicles from "../landing/user/component/subnavComponent/Vehicles";
import TermsOfService from "../landing/user/component/footerComponent/TermOfService";
import FAQ from "../landing/user/component/footerComponent/FAQ";
import PrivacyPolicy from "../landing/user/component/footerComponent/PrivacyPolicy";

const AllRouter = () => {
  return (
    <Routes>
      <Route element={<LayoutUser />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        {/* Thêm các route khác cần Header/Footer ở đây */}
      </Route>
      <Route element={<LayoutStaff />}>
        <Route path="/staff" element={<HomePageStaff />} />
        <Route path="/staff/dashboard" element={<HomePageStaff />} />

        {/* <Route path="/aboutUs" element={<AboutUs />} /> */}
        {/* Thêm các route khác cần Header/Footer ở đây */}
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    </Routes>
  );
};

export default AllRouter;
