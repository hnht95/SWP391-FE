import { useState } from "react";
import { motion } from "framer-motion";
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
  role: "User" | "Admin" | "Renter";
}

const mockUser: UserData = {
  id: "1",
  name: "MiCheo lỏ",
  email: "Bui@gmail.com",
  phone: "+84 123 456 789",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  role: "Renter",
};

type TabType = "profile" | "booking" | "activity" | "settings";

const UserProfile = () => {
  const [user] = useState<UserData>(mockUser);
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const tabs = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "booking", label: "Booking History", icon: "🚗" },
    { id: "activity", label: "Activity", icon: "📋" },
    { id: "settings", label: "Settings", icon: "⚙️" },
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

  const handleEditAvatar = () => {
    console.log("Edit avatar clicked");
  };

  const handleEditProfile = () => {
    console.log("Edit profile clicked");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-100"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(0,0,0,0.2),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_0%,transparent_30%,rgba(0,0,0,0.1)_70%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-black/30 backdrop-blur-sm rounded-lg text-white border border-white/10"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isSidebarOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </motion.button>
        </div>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
          />
        )}

        {/* Sidebar */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4, ease: "easeInOut" }}
          className={`w-80 bg-black/20 backdrop-blur-sm border-r border-white/10 fixed lg:relative h-full z-40 transform transition-transform duration-300 ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-6 space-y-6">
            {/* User Info in Sidebar */}
            <div className="text-center space-y-4">
              <div className="relative group mx-auto w-24 h-24">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 shadow-lg">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleEditAvatar}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-white text-black rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-300 ease-in-out flex items-center justify-center"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </motion.button>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <p className="text-gray-300 text-sm">{user.email}</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-black mt-2 border border-gray-200">
                  {user.role}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsSidebarOpen(false); // Close sidebar on mobile after selecting tab
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-300 ease-in-out ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-white rounded-full border border-gray-300"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>

            {/* Quick Stats */}
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Member Since</span>
                  <span className="text-white text-sm font-medium">
                    Jan 2024
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Total Bookings</span>
                  <span className="text-white text-sm font-medium">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Status</span>
                  <span className="text-white text-sm font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4, ease: "easeInOut" }}
          className="flex-1 overflow-hidden lg:ml-0"
        >
          {/* Header */}
          <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="lg:pl-0 pl-12">
                <h1 className="text-xl lg:text-2xl font-bold text-white mb-1">
                  {tabs.find((tab) => tab.id === activeTab)?.label || "Profile"}
                </h1>
                <p className="text-gray-300 text-xs lg:text-sm">
                  {activeTab === "profile" &&
                    "Manage your personal information"}
                  {activeTab === "booking" &&
                    "View your rental booking history"}
                  {activeTab === "activity" && "View your recent activities"}
                  {activeTab === "settings" &&
                    "Configure your account preferences"}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEditProfile}
                className="px-3 lg:px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors duration-300 ease-in-out text-sm lg:text-base border border-gray-200"
              >
                Edit Profile
              </motion.button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 lg:p-6 h-full overflow-y-auto">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 lg:p-6"
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UserProfile;
