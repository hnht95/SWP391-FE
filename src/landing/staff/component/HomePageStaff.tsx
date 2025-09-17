import React from "react";
import DashboardStaff from "../homepageStaffComponent/DashboardStaff";
import VehicleHandover from "../homepageStaffComponent/VehicleHandover";
import VehicleMaintain from "../homepageStaffComponent/VehicleMaintain";
import StaffReport from "../homepageStaffComponent/StaffReport";
import VehiclesStaff from "../homepageStaffComponent/VehiclesStaff";

export interface HomePageStaffProps {
  activeTab: "dashboard" | "handover" | "maintain" | "reports" | "vehicles";
  setActiveTab: React.Dispatch<
    React.SetStateAction<
      "dashboard" | "handover" | "maintain" | "reports" | "vehicles"
    >
  >;
}

const HomePageStaff = (props: HomePageStaffProps) => {
  return (
    <main className="flex-1 px-8 py-3 overflow-auto">
      {/* Tab Content */}
      <div>
        {props.activeTab === "dashboard" && <DashboardStaff />}
        {props.activeTab === "handover" && <VehicleHandover />}
        {props.activeTab === "maintain" && <VehicleMaintain />}
        {props.activeTab === "reports" && <StaffReport />}
        {props.activeTab === "vehicles" && <VehiclesStaff />}
      </div>
    </main>
  );
};

export default HomePageStaff;
