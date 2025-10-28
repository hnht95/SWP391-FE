import { useState, useEffect, useRef } from "react";
import SidebarUser from "./SidebarUser";
import ProfileTab from "./userProfileComponent/userTabComponent/ProfileTab";
import BookingHistoryTab from "./userProfileComponent/userTabComponent/BookingHistoryTab";
import EditProfileModal from "./userProfileComponent/userTabComponent/profileComponent/EditProfileModal"; // ✅ Import modal
import profileApi, {
  type UserProfile as UserProfileType,
} from "../../../../../service/apiUser/profile/API";

type TabType = "profile" | "booking";

const UserProfile = () => {
  const [user, setUser] = useState<UserProfileType | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false); // ✅ Modal state

  const hasFetched = useRef(false);

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "booking", label: "Booking History" },
  ] as const;

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await profileApi.getCurrentUser();
      console.log("✅ User profile response:", response);

      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const abortController = new AbortController();
    fetchUserProfile();

    return () => {
      abortController.abort();
    };
  }, []);

  const handleRefresh = () => {
    fetchUserProfile();
  };

  const renderTabContent = () => {
    if (!user) return null;

    switch (activeTab) {
      case "profile":
        return <ProfileTab user={user} onRefresh={handleRefresh} />;
      case "booking":
        return <BookingHistoryTab />;
      default:
        return <ProfileTab user={user} onRefresh={handleRefresh} />;
    }
  };

  const handleEditProfile = () => {
    setShowEditModal(true); // ✅ Open modal
  };

  const handleEditSuccess = () => {
    fetchUserProfile(); // ✅ Refresh data after edit
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
            onClick={fetchUserProfile}
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

      {/* ✅ Edit Profile Modal */}
      {user && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={user}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default UserProfile;
