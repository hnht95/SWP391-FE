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
      className="min-h-screen bg-gray-50"
    >
      <div className="relative z-10 flex min-h-screen">
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-gray-100 rounded-lg text-black border border-gray-300"
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

        {/* Fixed Sidebar - Không scroll */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4, ease: "easeInOut" }}
          className={`w-80 bg-white border-r border-gray-200 fixed lg:sticky lg:top-0 h-screen z-40 transform transition-transform duration-300 ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          } flex flex-col overflow-hidden`}
          onWheel={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          style={{ 
            overscrollBehavior: 'contain',
            touchAction: 'none'
          }}
        >
          {/* User Info - Fixed tại đầu sidebar */}
          <div className="p-6 text-center space-y-4 flex-shrink-0 border-b border-gray-200">
            <div className="relative group mx-auto w-24 h-24">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 shadow-lg">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                    <span className="text-black text-2xl font-bold">
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
                className="absolute bottom-0 right-0 w-7 h-7 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors duration-300 ease-in-out flex items-center justify-center"
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
              <h2 className="text-xl font-bold text-black">{user.name}</h2>
              <p className="text-gray-600 text-sm">{user.email}</p>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black text-white mt-2 border border-gray-800">
                {user.role}
              </span>
            </div>
          </div>

          {/* Fixed Content Area - Không scroll */}
          <div className="flex-1 p-6 space-y-6 overflow-hidden"
               onWheel={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
               }}>
            {/* Navigation Tabs */}
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-300 ease-in-out ${
                    activeTab === tab.id
                      ? "bg-black text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-200 hover:text-black"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-white rounded-full"
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
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Member Since</span>
                  <span className="text-black text-sm font-medium">
                    Jan 2024
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Total Bookings</span>
                  <span className="text-black text-sm font-medium">12</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content - Có thể scroll */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4, ease: "easeInOut" }}
          className="flex-1 lg:ml-0 flex flex-col h-screen"
        >
          {/* Header - Fixed */}
          <div className="bg-gray-50 p-4 lg:p-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="lg:pl-0 pl-12">
                <motion.div
                  key={`title-${activeTab}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <h1 className="text-xl lg:text-2xl font-bold text-black mb-1">
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
                  <p className="text-gray-600 text-xs lg:text-sm">
                    {activeTab === "profile" &&
                      "Manage your personal information"}
                    {activeTab === "booking" &&
                      "View your rental booking history"}
                    {activeTab === "activity" && "View your recent activities"}
                    {activeTab === "settings" &&
                      "Configure your account preferences"}
                  </p>
                </motion.div>
              </div>

              {activeTab === 'profile' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEditProfile}
                  className="px-3 lg:px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-300 ease-in-out text-sm lg:text-base border border-black"
                >
                  Edit Profile
                </motion.button>
              )}
            </div>
          </div>

          {/* Content Area - Chỉ nội dung tab scroll */}
          <div className="flex-1 overflow-hidden">
            <div 
              className="h-full p-2 lg:p-4 overflow-y-auto" 
              onWheel={(e) => {
                const target = e.currentTarget;
                const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 1;
                const atTop = target.scrollTop <= 1;
                
                // Nếu scroll xuống và đã ở cuối, cho phép scroll tiếp
                if (e.deltaY > 0 && atBottom) {
                  // Không preventDefault, để scroll event bubble up
                  return;
                }
                // Nếu scroll lên và đã ở đầu, cho phép scroll tiếp
                if (e.deltaY < 0 && atTop) {
                  return;
                }
                // Ngược lại, ngăn scroll bubble up
                e.stopPropagation();
              }}
              style={{ 
                overscrollBehavior: 'none'
              }}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="bg-gray-50 rounded-xl p-3 lg:p-4"
              >
                {renderTabContent()}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UserProfile;
