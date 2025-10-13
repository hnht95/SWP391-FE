import { Routes, Route } from "react-router-dom";
import LayoutUser from "../landing/user/LayoutUser";
import LayoutUserProfile from "../landing/user/component/headerComponent/userComponent/LayoutUserProfile";
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
import VehiclesDetail from "../landing/user/component/subnavComponent/vehiclesComponent/VehiclesDetail";
import ContractStaff from "../landing/staff/homepageStaffComponent/ContractStaff";
import { ProtectedRoute } from "../components/ProtectedRoute";
import AdminDashboard from "../landing/admin/AdminDashboard";
import BookingPage from "../landing/user/component/BookingPage";

const AllRouter = () => {
  return (
    <Routes>
      {/* Auth routes - accessible by everyone */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route
        element={
          <ProtectedRoute allowedRoles={["guest"]}>
            <LayoutUser />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/:id" element={<VehiclesDetail />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/contactus" element={<ContactUs />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["renter"]}>
            <LayoutUser />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<HomePage />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/:id" element={<VehiclesDetail />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/profile" element={<LayoutUserProfile />} />
        <Route path="/booking/:vehicleId" element={<BookingPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <LayoutStaff />
          </ProtectedRoute>
        }
      >
        <Route path="/staff" element={<DashboardStaff />} />
        <Route path="/staff/dashboard" element={<DashboardStaff />} />
        <Route path="/staff/users" element={<StaffUser />} />
        <Route path="/staff/handover" element={<VehicleHandover />} />
        <Route path="/staff/maintain" element={<VehicleMaintain />} />
        <Route path="/staff/vehicles" element={<VehiclesStaff />} />
        <Route path="/staff/reports" element={<StaffReport />} />
        <Route path="/staff/contracts" element={<ContractStaff />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <></>
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
};

export default AllRouter;
