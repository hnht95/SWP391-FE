import { motion } from "framer-motion";
import { User, Mail, Phone, CreditCard, Calendar, MapPin } from "lucide-react";
// import { UserProfile } from "../../../service/apiUser/profile/API";

// ✅ Extended interface with API data
interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: "User" | "Staff" | "Admin";
  kycVerified: boolean;
  createdAt?: string;
  gender?: "male" | "female";
  address?: string;
}

interface ProfileTabProps {
  user: UserData;
}

const ProfileTab = ({ user }: ProfileTabProps) => {
  // ✅ Format date to Vietnamese locale
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch (error) {
      return "N/A";
    }
  };

  // ✅ Format gender
  const formatGender = (gender?: "male" | "female"): string => {
    if (!gender) return "Not specified";
    return gender === "male" ? "Nam" : "Nữ";
  };

  // ✅ Dynamic profile fields from API
  const profileFields = [
    {
      label: "Full Name",
      value: user.name,
      icon: <User className="w-5 h-5" />,
    },
    {
      label: "Email Address",
      value: user.email,
      icon: <Mail className="w-5 h-5" />,
    },
    {
      label: "Phone Number",
      value: user.phone,
      icon: <Phone className="w-5 h-5" />,
    },
    {
      label: "Gender",
      value: formatGender(user.gender),
      icon: <User className="w-5 h-5" />,
    },
    {
      label: "Address",
      value: user.address || "Not provided",
      icon: <MapPin className="w-5 h-5" />,
    },
  ];

  // ✅ Dynamic additional info from API
  const additionalInfo = [
    {
      label: "Member Since",
      value: formatDate(user.createdAt),
      color: "text-blue-300",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: "KYC Status",
      value: user.kycVerified ? "Verified ✓" : "Not Verified",
      color: user.kycVerified ? "text-green-300" : "text-orange-300",
      bgColor: user.kycVerified ? "bg-green-500/10" : "bg-orange-500/10",
      borderColor: user.kycVerified
        ? "border-green-500/20"
        : "border-orange-500/20",
    },
    {
      label: "Account Status",
      value: "Active",
      color: "text-purple-300",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center space-x-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-lg"
      >
        <div className="relative group">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-400 shadow-lg">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-10 h-10 text-black" />
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-xl font-bold text-black">{user.name}</h4>
          <p className="text-gray-600 text-sm">{user.email}</p>
          <div className="flex items-center mt-2 space-x-2">
            <span className="px-3 py-1 bg-black text-white text-xs font-medium rounded-full">
              {user.role}
            </span>
            {user.kycVerified && (
              <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center space-x-1">
                <span>✓</span>
                <span>Verified</span>
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Profile Fields */}
      <div className="space-y-4">
        {profileFields.map((field, index) => (
          <motion.div
            key={field.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -2 }}
            className="flex items-center space-x-4 p-6 bg-white rounded-2xl hover:bg-gray-50 transition-all duration-300 ease-in-out border border-gray-200 shadow-lg group cursor-pointer"
          >
            <div className="text-black group-hover:scale-110 transition-transform duration-300">
              {field.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium">{field.label}</p>
              <p className="text-black font-semibold mt-1 group-hover:text-gray-700 transition-colors duration-300">
                {field.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Info Section */}
      <div className="space-y-4">
        <h4 className="text-xl font-bold text-black">Account Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {additionalInfo.map((info, index) => (
            <motion.div
              key={info.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: (index + 5) * 0.1,
                duration: 0.4,
                ease: "easeOut",
              }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="p-6 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 ease-out cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-black" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    {info.label}
                  </p>
                  <p className="text-black font-bold text-lg mt-1">
                    {info.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4, ease: "easeOut" }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-4 bg-gray-50 text-black rounded-2xl font-medium hover:bg-gray-100 transition-all duration-300 ease-in-out border border-gray-300 shadow-lg"
        >
          Change Password
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ProfileTab;
