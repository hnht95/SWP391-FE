import { Routes, Route } from "react-router-dom";
import LayoutUser from "../landing/user/LayoutUser";
import LoginPage from "../auth/login/LoginPage";
import HomePage from "../landing/user/component/HomePage";
import SignUpPage from "../auth/signUp/SignUpPage";

const AllRouter = () => {
  return (
    <Routes>
      <Route element={<LayoutUser />}>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/aboutUs" element={<AboutUs />} /> */}
        {/* Thêm các route khác cần Header/Footer ở đây */}
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
    </Routes>
  );
};

export default AllRouter;
