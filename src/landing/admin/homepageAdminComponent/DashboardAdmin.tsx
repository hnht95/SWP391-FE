import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MdDirectionsCar,
  MdPeople,
  MdLocationOn,
  MdTrendingUp,
  MdAccountCircle,
  MdBatteryChargingFull,
  MdEvStation,
  MdSpeed,
  MdNotifications,
  MdWarning,
  MdCheckCircle,
} from "react-icons/md";
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "../component/animations";
import PageTitle from "../component/PageTitle";

// Import API functions
import { getAllVehicles  } from "../../../service/apiAdmin/apiVehicles/API";
import { getAllStations  } from "../../../service/apiAdmin/apiStation/API";
import { getAllUsers } from "../../../service/apiAdmin/apiListUser/API";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  color,
  gradient,
}) => {
  return (
    <motion.div 
      className={`relative overflow-hidden rounded-2xl shadow-lg border border-gray-200 p-6 ${gradient} hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-gray-300 bg-white`}
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2 tracking-wide uppercase">
            {title}
          </p>
          <motion.p 
            className="text-3xl font-bold text-gray-900 mb-3 tracking-tight"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          >
            {value}
          </motion.p>
          <div className="flex items-center space-x-2">
            <motion.span
              className={`text-sm font-semibold px-3 py-1 rounded-full ${
                changeType === "increase" 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-red-100 text-red-700"
              }`}
              whileHover={{ scale: 1.1 }}
            >
              {changeType === "increase" ? "↑" : "↓"} {change}
            </motion.span>
            <span className="text-xs text-gray-500">vs last month</span>
          </div>
        </div>
        <motion.div
          className={`p-4 rounded-2xl ${color} shadow-lg`}
          whileHover={{ rotate: 360, scale: 1.2 }}
          transition={{ duration: 0.6 }}
        >
          {icon}
        </motion.div>
      </div>

      <motion.div 
        className={`absolute bottom-0 left-0 right-0 h-1 ${color.replace('bg-gradient-to-br', 'bg-gradient-to-r')}`}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.6 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

interface BatteryStatusProps {
  vehicleModel: string;
  batteryLevel: number;
  range: number;
  status: "available" | "reserved" | "rented" | "maintenance" | "pending_deletion" | "pending_maintenance";
  licensePlate: string;
}

const BatteryStatus: React.FC<BatteryStatusProps> = ({
  vehicleModel,
  batteryLevel,
  range,
  status,
  licensePlate,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "available": return "text-emerald-700 bg-emerald-100 border-emerald-200";
      case "reserved": return "text-blue-700 bg-blue-100 border-blue-200";
      case "rented": return "text-blue-700 bg-blue-100 border-blue-200";
      case "maintenance": 
      case "pending_maintenance": return "text-red-700 bg-red-100 border-red-200";
      case "pending_deletion": return "text-orange-700 bg-orange-100 border-orange-200";
      default: return "text-gray-700 bg-gray-100 border-gray-200";
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case "available": return "AVAILABLE";
      case "reserved": return "RESERVED";
      case "rented": return "RENTED";
      case "maintenance": return "MAINTENANCE";
      case "pending_maintenance": return "PENDING MAINT.";
      case "pending_deletion": return "PENDING DEL.";
      default: return (status as string).toUpperCase();
    }
  };

  const getBatteryColor = () => {
    if (batteryLevel > 70) return "from-emerald-500 to-green-500";
    if (batteryLevel > 30) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  return (
    <motion.div 
      className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl"
      whileHover={{ scale: 1.03, y: -5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-gray-900 font-semibold text-lg">{vehicleModel}</h3>
          <p className="text-gray-600 text-sm">{licensePlate}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${getStatusColor()}`}>
          {getStatusDisplay()}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">Battery Level</span>
          <span className="text-gray-900 font-bold text-xl">{batteryLevel}%</span>
        </div>
        
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getBatteryColor()} rounded-full shadow-md`}
            initial={{ width: 0 }}
            animate={{ width: `${batteryLevel}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div 
              className="absolute inset-0 bg-white/30"
              animate={{ x: ["0%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-gray-600">
            <MdSpeed className="w-4 h-4" />
            <span className="text-sm font-medium">{range} km range</span>
          </div>
          <MdBatteryChargingFull className="w-5 h-5 text-emerald-600" />
        </div>
      </div>
    </motion.div>
  );
};

interface StationCardProps {
  station: any;
  vehicleCount: number;
}

const StationCard: React.FC<StationCardProps> = ({ station, vehicleCount }) => {
  // Mock capacity data - in real scenario, you'd calculate this from actual vehicle data
  const totalCapacity = 15;
  const available = Math.max(0, totalCapacity - vehicleCount);
  
  return (
    <motion.div
      className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300"
      whileHover={{ scale: 1.05, y: -5 }}
    >
      <h3 className="text-gray-900 font-bold text-lg mb-4">{station.name}</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2 font-medium">
            <span className="text-gray-600">Vehicles</span>
            <span className="text-gray-900 font-bold">{vehicleCount}/{totalCapacity}</span>
          </div>
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${(vehicleCount / totalCapacity) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t-2 border-gray-200">
          <div className="text-sm">
            <p className="text-gray-600 font-medium">Location</p>
            <p className="text-gray-900 font-semibold text-xs truncate max-w-[120px]">
              {station.location.address}
            </p>
          </div>
          <div className="text-sm text-right">
            <p className="text-gray-600 font-medium">Status</p>
            <p className={`font-bold ${station.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
              {station.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DashboardAdmin: React.FC = () => {
  // State for API data
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("📊 Fetching dashboard data...");

        // Fetch all data in parallel
        const [vehiclesData, stationsData, usersData] = await Promise.all([
          getAllVehicles(),
          getAllStations(),
          getAllUsers(),
        ]);

        console.log("✅ Vehicles fetched:", vehiclesData.length);
        console.log("✅ Stations fetched:", stationsData.length);
        console.log("✅ Users fetched:", usersData.items.length);

        setVehicles(vehiclesData);
        setStations(stationsData);
        setUsers(usersData.items);
      } catch (err: any) {
        console.error("❌ Error fetching dashboard data:", err);
        setError(err?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate statistics
  const totalVehicles = vehicles.length;
  const activeCustomers = users.filter(user => user.role === 'user' || user.role === 'customer').length;
  const totalStations = stations.filter(s => s.isActive).length;

  // Calculate battery status for featured vehicles (top 4 by battery level)
  const featuredVehicles = vehicles
    .filter(v => v.batteryLevel !== undefined)
    .sort((a, b) => (b.batteryLevel || 0) - (a.batteryLevel || 0))
    .slice(0, 4)
    .map(v => ({
      vehicleModel: `${v.brand} ${v.model}`,
      batteryLevel: v.batteryLevel || 0,
      range: Math.round((v.batteryCapacity / 100) * (v.batteryLevel || 0) * 5), // Estimate range
      status: v.status,
      licensePlate: v.plateNumber,
    }));

  // Calculate vehicles per station (top 3)
  const stationVehicleCounts = stations.map(station => {
    const count = vehicles.filter(v => {
      if (typeof v.station === 'string') {
        return v.station === station._id;
      } else if (v.station && typeof v.station === 'object') {
        return v.station._id === station._id;
      }
      return false;
    }).length;
    
    return {
      station,
      count,
    };
  }).sort((a, b) => b.count - a.count).slice(0, 3);

  // Mock change percentages (in real app, calculate from historical data)
  const stats = [
    {
      title: "Total Vehicles",
      value: totalVehicles.toString(),
      change: "+12%",
      changeType: "increase" as const,
      icon: <MdDirectionsCar className="w-8 h-8 text-white" />,
      color: "bg-gradient-to-br from-blue-600 to-blue-500",
      gradient: "",
    },
    {
      title: "Active Customers",
      value: activeCustomers.toString(),
      change: "+8%",
      changeType: "increase" as const,
      icon: <MdPeople className="w-8 h-8 text-white" />,
      color: "bg-gradient-to-br from-emerald-600 to-emerald-500",
      gradient: "",
    },
    {
      title: "Stations",
      value: totalStations.toString(),
      change: "+2",
      changeType: "increase" as const,
      icon: <MdEvStation className="w-8 h-8 text-white" />,
      color: "bg-gradient-to-br from-purple-600 to-purple-500",
      gradient: "",
    },
  ];

  // Generate activity logs from real data
  const recentActivities = [
    ...vehicles
      .filter(v => v.batteryLevel !== undefined && v.batteryLevel < 20)
      .slice(0, 1)
      .map(v => ({
        type: "warning" as const,
        icon: <MdWarning className="w-5 h-5" />,
        title: "Low Battery Alert",
        details: `${v.brand} ${v.model} (${v.plateNumber}) - ${v.batteryLevel}% battery remaining`,
        time: "Recently",
        color: "border-yellow-300 bg-yellow-50",
        iconBg: "bg-yellow-200 text-yellow-700",
      })),
    ...vehicles
      .filter(v => v.status === "available" && (v.batteryLevel || 0) > 80)
      .slice(0, 1)
      .map(v => ({
        type: "success" as const,
        icon: <MdCheckCircle className="w-5 h-5" />,
        title: "Vehicle Ready",
        details: `${v.brand} ${v.model} - Available for rental`,
        time: "Recently",
        color: "border-emerald-300 bg-emerald-50",
        iconBg: "bg-emerald-200 text-emerald-700",
      })),
    ...stations
      .filter(s => s.isActive)
      .slice(0, 1)
      .map(s => ({
        type: "info" as const,
        icon: <MdLocationOn className="w-5 h-5" />,
        title: "Station Active",
        details: `${s.name} - ${vehicles.filter(v => typeof v.station === 'string' ? v.station === s._id : v.station?._id === s._id).length} vehicles assigned`,
        time: "Recently",
        color: "border-blue-300 bg-blue-50",
        iconBg: "bg-blue-200 text-blue-700",
      })),
    ...users
      .filter(u => u.role === 'user' || u.role === 'customer')
      .slice(0, 1)
      .map(u => ({
        type: "info" as const,
        icon: <MdPeople className="w-5 h-5" />,
        title: "Customer Account",
        details: `${u.fullName || u.username} - ${u.email}`,
        time: "Recently",
        color: "border-purple-300 bg-purple-50",
        iconBg: "bg-purple-200 text-purple-700",
      })),
  ].slice(0, 4);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600 font-semibold">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border-2 border-red-200">
          <MdWarning className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)]" />
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl" />

      <PageTransition>
        <div className="relative space-y-8 px-6 py-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                EV Fleet Command Center
              </motion.h1>
              <motion.p 
                className="text-gray-600 text-sm font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Real-time monitoring • Updated {new Date().toLocaleString("en-US", { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </motion.p>
            </div>
            
            <FadeIn delay={0.4} duration={0.6}>
              <div className="flex items-center space-x-4">
                <motion.button 
                  className="relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <MdTrendingUp className="w-5 h-5" />
                    <span>Export Analytics</span>
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>

                <motion.div 
                  className="relative p-3 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-gray-300 hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MdNotifications className="w-6 h-6 text-gray-700" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-lg">
                    {recentActivities.length}
                  </span>
                </motion.div>
              </div>
            </FadeIn>
          </div>

          {/* Stats Grid */}
          <StaggerContainer staggerDelay={0.1} initialDelay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <StaggerItem key={index}>
                  <StatCard {...stat} />
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>

          {/* Fleet Battery Status */}
          {featuredVehicles.length > 0 && (
            <FadeIn delay={0.6} duration={0.7} direction="up">
              <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                      <MdBatteryChargingFull className="w-7 h-7 text-emerald-600" />
                      <span>Live Fleet Battery Monitor</span>
                    </h2>
                    <p className="text-gray-600 text-sm mt-1 font-medium">Real-time vehicle health & availability</p>
                  </div>
                  <motion.div 
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-100 border-2 border-emerald-300 rounded-full"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
                    <span className="text-emerald-700 text-sm font-bold">Live</span>
                  </motion.div>
                </div>

                <StaggerContainer staggerDelay={0.15} initialDelay={0}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {featuredVehicles.map((vehicle, index) => (
                      <StaggerItem key={index}>
                        <BatteryStatus {...vehicle} />
                      </StaggerItem>
                    ))}
                  </div>
                </StaggerContainer>
              </div>
            </FadeIn>
          )}

          {/* Stations Network Status */}
          {stationVehicleCounts.length > 0 && (
            <FadeIn delay={0.8} duration={0.7} direction="up">
              <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                    <MdEvStation className="w-7 h-7 text-purple-600" />
                    <span>Station Network Status</span>
                  </h2>
                  <div className="flex items-center space-x-4 text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm" />
                      <span className="text-gray-700">Active: {stations.filter(s => s.isActive).length}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm" />
                      <span className="text-gray-700">Inactive: {stations.filter(s => !s.isActive).length}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stationVehicleCounts.map((item, index) => (
                    <StationCard key={index} station={item.station} vehicleCount={item.count} />
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Quick Actions */}
          <FadeIn delay={1.0} duration={0.7} direction="up">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              
              <StaggerContainer staggerDelay={0.12} initialDelay={0}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    {
                      icon: <MdDirectionsCar className="w-7 h-7" />,
                      title: "Add New Vehicle",
                      desc: "Register EV to fleet",
                      gradient: "from-blue-600 to-cyan-600",
                      hoverGradient: "hover:from-blue-500 hover:to-cyan-500",
                    },
                    {
                      icon: <MdAccountCircle className="w-7 h-7" />,
                      title: "Manage Staff",
                      desc: "Team & permissions",
                      gradient: "from-emerald-600 to-green-600",
                      hoverGradient: "hover:from-emerald-500 hover:to-green-500",
                    },
                  ].map((action, index) => (
                    <StaggerItem key={index}>
                      <motion.button 
                        className={`relative flex items-center space-x-4 p-6 bg-gradient-to-br ${action.gradient} ${action.hoverGradient} rounded-xl transition-all duration-300 w-full text-left group overflow-hidden shadow-lg hover:shadow-2xl`}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="relative z-10 p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                          {action.icon}
                        </div>
                        <div className="relative z-10 flex-1">
                          <p className="font-bold text-white text-lg">{action.title}</p>
                          <p className="text-sm text-white/90">{action.desc}</p>
                        </div>
                        
                        <motion.div 
                          className="absolute inset-0 bg-white"
                          initial={{ x: "-100%", opacity: 0 }}
                          whileHover={{ x: 0, opacity: 0.1 }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.button>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            </div>
          </FadeIn>

          {/* System Alerts */}
          {recentActivities.length > 0 && (
            <FadeIn delay={1.2} duration={0.7} direction="up">
              <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                  <MdNotifications className="w-7 h-7 text-yellow-600" />
                  <span>System Alerts & Activity</span>
                </h2>

                <StaggerContainer staggerDelay={0.1} initialDelay={0}>
                  <div className="space-y-3">
                    {recentActivities.map((alert, index) => (
                      <StaggerItem key={index}>
                        <motion.div 
                          className={`flex items-start space-x-4 p-5 rounded-xl border-2 ${alert.color} hover:shadow-lg transition-all duration-300`}
                          whileHover={{ x: 5, scale: 1.02 }}
                        >
                          <div className={`p-2 rounded-lg ${alert.iconBg} flex-shrink-0`}>
                            {alert.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 mb-1">{alert.title}</p>
                            <p className="text-sm text-gray-700 mb-2">{alert.details}</p>
                            <p className="text-xs text-gray-500 font-medium">{alert.time}</p>
                          </div>
                          <motion.button
                            className="text-gray-400 hover:text-gray-700 transition-colors font-bold text-xl"
                            whileHover={{ scale: 1.3, rotate: 90 }}
                            whileTap={{ scale: 0.8 }}
                          >
                            ×
                          </motion.button>
                        </motion.div>
                      </StaggerItem>
                    ))}
                  </div>
                </StaggerContainer>
              </div>
            </FadeIn>
          )}
        </div>
      </PageTransition>
    </div>
  );
};

export default DashboardAdmin;
