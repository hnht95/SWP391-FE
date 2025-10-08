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
import ContractStaff from "../landing/staff/homepageStaffComponent/ContractStaff";
import { ProtectedRoute } from "../components/ProtectedRoute";
import AdminDashboard from "../landing/admin/AdminDashboard";
import BookingPage from "../landing/user/component/BookingPage";

const AllRouter = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Public routes - accessible by guests and logged-in users */}
      <Route element={<LayoutUser />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/:id" element={<VehiclesDetail />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/contactus" element={<ContactUs />} />
      </Route>

      {/* Protected User routes - only for logged-in renters */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["renter"]}>
            <LayoutUser />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserProfile />} />
      </Route>

      {/* Booking routes - protected for renters only */}
      <Route
        path="/booking/:vehicleId"
        element={
          <ProtectedRoute allowedRoles={["renter"]}>
            <BookingPage />
          </ProtectedRoute>
        }
      />

      {/* Staff routes */}
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

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Add more admin routes later
      <Route element={
        <ProtectedRoute allowedRoles={['admin']}>
          <LayoutAdmin />
        </ProtectedRoute>
      }>
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route> */}
    </Routes>
  );
};

export default AllRouter;
