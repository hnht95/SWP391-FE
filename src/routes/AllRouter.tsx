import { Routes, Route } from "react-router-dom";
import LayoutUser from "../landing/user/LayoutUser";
import LoginPage from "../auth/login/LoginPage";
import HomePage from "../landing/user/component/HomePage";
import SignUpPage from "../auth/signUp/SignUpPage";
import ForgotPasswordPage from "../auth/forgotPassword/ForgotPasswordPage";
import LayoutStaff from "../landing/staff/LayoutStaff";
import DashboardStaff from "../landing/staff/homepageStaffComponent/DashboardStaff";
import VehicleHandover from "../landing/staff/homepageStaffComponent/VehicleHandover";
import VehicleMaintain from "../landing/staff/homepageStaffComponent/VehicleMaintain";
import StaffReport from "../landing/staff/homepageStaffComponent/StaffReport";
import VehiclesStaff from "../landing/staff/homepageStaffComponent/VehiclesStaff";
import StaffUser from "../landing/staff/homepageStaffComponent/StaffUser";
import AboutUs from "../landing/user/component/subnavComponent/AboutUs";
import Vehicles from "../landing/user/component/subnavComponent/Vehicles";
import TermsOfService from "../landing/user/component/footerComponent/TermOfService";
import FAQ from "../landing/user/component/footerComponent/FAQ";
import PrivacyPolicy from "../landing/user/component/footerComponent/PrivacyPolicy";
import ContactUs from "../landing/user/component/subnavComponent/ContactUs";
import UserProfile from "../landing/user/component/headerComponent/userComponent/UserProfile";
import VehiclesDetail from "../landing/user/component/subnavComponent/vehiclesComponent/VehiclesDetail";

const AllRouter = () => {
  return (
    <Routes>
      <Route element={<LayoutUser />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/:id" element={<VehiclesDetail />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/profile" element={<UserProfile />} />
      </Route>

      <Route element={<LayoutStaff />}>
        <Route path="/staff" element={<DashboardStaff />} />
        <Route path="/staff/dashboard" element={<DashboardStaff />} />
        <Route path="/staff/users" element={<StaffUser />} />
        <Route path="/staff/handover" element={<VehicleHandover />} />
        <Route path="/staff/maintain" element={<VehicleMaintain />} />
        <Route path="/staff/vehicles" element={<VehiclesStaff />} />
        <Route path="/staff/reports" element={<StaffReport />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    </Routes>
  );
};

export default AllRouter;
