import { Outlet } from "react-router-dom";

const HomePageStaff = () => {
  return (
    <div className="flex-1 px-8 py-3 overflow-hidden">
      <Outlet />
    </div>
  );
};

export default HomePageStaff;
