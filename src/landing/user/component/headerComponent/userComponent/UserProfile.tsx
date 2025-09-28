import { useState } from "react";
import { motion } from "framer-motion";
import SidebarUser from "./SidebarUser";
import ProfileTab from "./userProfileComponent/userTabComponent/ProfileTab";
import SettingsTab from "./userProfileComponent/userTabComponent/SettingsTab";
import ActivityTab from "./userProfileComponent/userTabComponent/ActivityTab";
import BookingHistoryTab from "./userProfileComponent/userTabComponent/BookingHistoryTab";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: "User" | "Staff" | "Admin";
}

const mockUser: UserData = {
  id: "1",
  name: "MiCheo lỏ",
  email: "Bui@gmail.com",
  phone: "+84 123 456 789",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  role: "User",
};

type TabType = "profile" | "booking" | "activity" | "settings";

const UserProfile = () => {
  const [user] = useState<UserData>(mockUser);
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "booking", label: "Booking History" },
    { id: "activity", label: "Activity" },
    { id: "settings", label: "Settings" },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab user={user} />;
      case "booking":
        return <BookingHistoryTab />;
      case "activity":
        return <ActivityTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <ProfileTab user={user} />;
    }
  };

  const handleEditProfile = () => {
    console.log("Edit profile clicked");
  };

  const handleSignOut = () => {
    console.log("Sign out clicked");
    // Add sign out logic here
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarUser
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
        user={user}
        onSignOut={handleSignOut}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <motion.div
                key={`title-${activeTab}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {tabs.find((tab) => tab.id === activeTab)?.label || "Profile"}
                </h1>
              </motion.div>
              <motion.div
                key={`description-${activeTab}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <p className="text-gray-600 text-sm">
                  {activeTab === "profile" &&
                    "Manage your personal information and preferences"}
                  {activeTab === "booking" &&
                    "View your rental booking history and details"}
                  {activeTab === "activity" && "Track your recent activities and updates"}
                  {activeTab === "settings" &&
                    "Configure your account preferences and settings"}
                </p>
              </motion.div>
            </div>

            {activeTab === 'profile' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEditProfile}
                className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
              >
                Edit Profile
              </motion.button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-screen overflow-auto bg-gray-50">
          <div className="p-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
