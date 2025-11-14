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

import StaffReport from "../landing/staff/homepageStaffComponent/StaffReport";
import VehiclesStaff from "../landing/staff/homepageStaffComponent/VehiclesStaff";
import StaffUser from "../landing/staff/homepageStaffComponent/StaffUser";
import LayoutAdmin from "../landing/admin/LayoutAdmin";
import DashboardAdmin from "../landing/admin/homepageAdminComponent/DashboardAdmin";
import VehiclesManagement from "../landing/admin/homepageAdminComponent/VehicleManagementComponent";
// import StationManagementAdmin from "../landing/admin/homepageAdminComponent/StationManagementAdmin";
import ListUserManagement from "../landing/admin/homepageAdminComponent/UserManagerComponent/ListUserManagement";
import UserVerification from "../landing/admin/homepageAdminComponent/UserManagerComponent/UserVerification";
import TransactionHistory from "../landing/admin/homepageAdminComponent/BookingManagementComponent";
// import ReportsAndAI from "../landing/admin/homepageAdminComponent/ReportsAndAI";
import AboutUs from "../landing/user/component/subnavComponent/AboutUs";
import Vehicles from "../landing/user/component/subnavComponent/Vehicles";
import TermsOfService from "../landing/user/component/footerComponent/TermOfService";
import FAQ from "../landing/user/component/footerComponent/FAQ";
import PrivacyPolicy from "../landing/user/component/footerComponent/PrivacyPolicy";
import ContactUs from "../landing/user/component/subnavComponent/ContactUs";
import VehiclesDetail from "../landing/user/component/subnavComponent/vehiclesComponent/VehiclesDetail";

import { ProtectedRoute } from "../components/ProtectedRoute";
import BookingPage from "../landing/user/component/BookingPage";
import PaymentPage from "../landing/user/component/bookingComponent/PaymentPage";
import BookingSuccessPage from "../landing/user/component/bookingComponent/BookingSuccessPage";
import StationManagement from "../landing/admin/homepageAdminComponent/StationManagementAdmin/StationManagement";
import { StationDetailPage, StationsListPage } from "../landing/user/component";
import ManualRefunds from "../landing/staff/homepageStaffComponent/ManualRefunds";
import ExtendPaymentPage from "../landing/user/component/headerComponent/userComponent/userProfileComponent/userTabComponent/bookingComponent/ExtendPaymentPage";

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
        <Route path="/stations" element={<StationsListPage />} />
        <Route path="/stations/:id" element={<StationDetailPage />} />
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
        <Route path="/stations" element={<StationsListPage />} />
        <Route path="/stations/:id" element={<StationDetailPage />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/profile" element={<LayoutUserProfile />} />
        <Route path="/booking/:vehicleId" element={<BookingPage />} />
        <Route path="/payment/:bookingId" element={<PaymentPage />} />
        <Route
          path="/booking-success/:bookingId"
          element={<BookingSuccessPage />}
        />
        <Route
          path="/booking/:bookingId/extend-pay"
          element={<ExtendPaymentPage />}
        />
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
        <Route path="/staff/vehicles" element={<VehiclesStaff />} />
        <Route path="/staff/reports" element={<StaffReport />} />
        <Route path="/staff/manual-refunds" element={<ManualRefunds />} />
      </Route>

      {/* Admin routes - Protected with authentication */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]} redirectTo="/">
            <LayoutAdmin />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/admin/dashboard" element={<DashboardAdmin />} />
        <Route path="/admin/vehicles" element={<VehiclesManagement />} />
        <Route path="/admin/stations" element={<StationManagement />} />
        <Route path="/admin/users" element={<ListUserManagement />} />
        <Route
          path="/admin/users/verification"
          element={<UserVerification />}
        />
        <Route path="/admin/transactions" element={<TransactionHistory />} />
        {/* <Route path="/admin/reports" element={<ReportsAndAI />} /> */}
      </Route>
    </Routes>
  );
};

export default AllRouter;
