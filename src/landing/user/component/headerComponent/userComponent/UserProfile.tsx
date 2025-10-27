import { useState, useEffect, useRef } from "react";
import SidebarUser from "./SidebarUser";
import ProfileTab from "./userProfileComponent/userTabComponent/ProfileTab";
import SettingsTab from "./userProfileComponent/userTabComponent/SettingsTab";
import ActivityTab from "./userProfileComponent/userTabComponent/ActivityTab";
import BookingHistoryTab from "./userProfileComponent/userTabComponent/BookingHistoryTab";
import profileApi, {
  type UserProfile as UserProfileType,
} from "../../../../../service/apiUser/profile/API";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: "User" | "Staff" | "Admin";
  kycVerified: boolean; // ✅ Added KYC field
  createAt: string;
}

type TabType = "profile" | "booking" | "activity" | "settings";

const UserProfile = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Prevent double fetch in StrictMode
  const hasFetched = useRef(false);

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "booking", label: "Booking History" },
    { id: "activity", label: "Activity" },
    { id: "settings", label: "Settings" },
  ] as const;

  useEffect(() => {
    // ✅ Only fetch once
    if (hasFetched.current) return;
    hasFetched.current = true;

    const abortController = new AbortController();

    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await profileApi.getCurrentUser();

        if (response.success && response.data) {
          const userData = response.data;

          setUser({
            id: userData._id || userData.id || "",
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            avatar: userData.avatarUrl || userData.avatar,
            role: mapRoleToDisplay(userData.role),
            kycVerified: userData.kyc?.verified || false,
            // ✅ Add these new fields
            createdAt: userData.createdAt,
            gender: userData.gender,
            address: userData.address,
          });
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();

    // ✅ Cleanup function
    return () => {
      abortController.abort();
    };
  }, []);

  const mapRoleToDisplay = (
    apiRole: UserProfileType["role"]
  ): "User" | "Staff" | "Admin" => {
    const roleMap: Record<UserProfileType["role"], "User" | "Staff" | "Admin"> =
      {
        renter: "User",
        staff: "Staff",
        admin: "Admin",
      };
    return roleMap[apiRole];
  };

  const renderTabContent = () => {
    if (!user) return null;

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
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Failed to Load Profile
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "User data not available"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {tabs.find((tab) => tab.id === activeTab)?.label || "Profile"}
              </h1>
              <p className="text-gray-600 text-sm">
                {activeTab === "profile" &&
                  "Manage your personal information and preferences"}
                {activeTab === "booking" &&
                  "View your rental booking history and details"}
                {activeTab === "activity" &&
                  "Track your recent activities and updates"}
                {activeTab === "settings" &&
                  "Configure your account preferences and settings"}
              </p>
            </div>

            {activeTab === "profile" && (
              <button
                onClick={handleEditProfile}
                className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="p-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
