import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdDirectionsCar,
  MdPeople,
  MdLocationOn,
  MdTrendingUp,
  MdBatteryChargingFull,
  MdEvStation,
  MdSpeed,
  MdNotifications,
  MdWarning,
  MdCheckCircle,
  MdBuild,
  MdVerifiedUser,
  MdClose,
  MdArrowForward,
} from "react-icons/md";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PageTransition } from "../component/animations";
import PageTitle from "../component/PageTitle";
import type { Station as StationType } from "../../../service/apiAdmin/apiStation/API";
import { getAdminTransactions, formatCurrency } from "../../../service/apiBooking/API";
import type { AdminTransactionItem } from "../../../service/apiBooking/API";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// Import API functions
import { getAllVehicles, getMaintenanceRequestsPaginated } from "../../../service/apiAdmin/apiVehicles/API";
import { getAllStations } from "../../../service/apiAdmin/apiStation/API";
import { getAllUsers, getRenters } from "../../../service/apiAdmin/apiListUser/API";
import type { RawApiUser } from "../../../types/userTypes";

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
    <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
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
    </div>
  );
};

interface StationCardProps {
  station: StationType;
  totalVehicles: number;
  activeCount: number;
  maintenanceCount: number;
  pendingMaintenanceCount: number;
  pendingDeletionCount: number;
  isHighlighted?: boolean;
  onClick?: () => void;
}

const StationCard: React.FC<StationCardProps> = ({
  station,
  totalVehicles,
  activeCount,
  maintenanceCount,
  pendingMaintenanceCount,
  pendingDeletionCount,
  isHighlighted = false,
  onClick,
}) => {
  const activeRatio =
    totalVehicles > 0 ? Math.min((activeCount / totalVehicles) * 100, 100) : 0;
  const maintenanceTotal = maintenanceCount + pendingMaintenanceCount;
  const maintenanceRatio =
    totalVehicles > 0 ? Math.min((maintenanceTotal / totalVehicles) * 100, 100) : 0;
  const requestsTotal = pendingMaintenanceCount + pendingDeletionCount;
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl p-5 border transition-all ${
        isHighlighted
          ? "border-blue-200 shadow-lg shadow-blue-100/60"
          : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
      }`}
    >
      <h3 className="text-gray-900 font-semibold text-lg mb-3">{station.name}</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-medium text-gray-500">Vehicles</span>
          <span className="text-2xl font-bold text-gray-900">{totalVehicles}</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Active</span>
            <span className="font-semibold text-emerald-600">{activeCount}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${activeRatio}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Maintenance</span>
            <span className="font-semibold text-rose-500">{maintenanceTotal}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-rose-400 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${maintenanceRatio}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Location</p>
            <p className="text-gray-900 font-semibold text-sm truncate">
              {station.location?.address || "Chưa cập nhật"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium uppercase">Status</p>
            <p
              className={`text-sm font-bold ${
                station.isActive ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {station.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-[11px] font-semibold text-blue-600">
            YC bảo trì: {pendingMaintenanceCount}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-50 text-[11px] font-semibold text-purple-600">
            YC xóa: {pendingDeletionCount}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">
            Tổng yêu cầu: {requestsTotal}
          </span>
        </div>
      </div>
    </button>
  );
};

const MiniStationMap: React.FC<{ stations: StationType[] }> = ({ stations }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [16.047079, 108.20623],
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      minZoom: 4,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    // invalidate size after render
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!markersLayerRef.current) {
      markersLayerRef.current = L.layerGroup().addTo(map);
    } else {
      markersLayerRef.current.clearLayers();
    }

    const validStations = (stations || []).filter(
      (station) =>
        station?.location &&
        typeof station.location.lat === "number" &&
        typeof station.location.lng === "number" &&
        !Number.isNaN(station.location.lat) &&
        !Number.isNaN(station.location.lng)
    );

    if (validStations.length === 0) {
      map.setView([16.047079, 108.20623], 5);
      return;
    }

    validStations.forEach((station) => {
      const marker = L.circleMarker([station.location.lat, station.location.lng], {
        radius: 8,
        weight: 2,
        color: station.isActive ? "#22c55e" : "#ef4444",
        fillColor: station.isActive ? "#4ade80" : "#fb7185",
        fillOpacity: 0.85,
      });

      const popupHtml = `
        <div style="font-family: 'Inter', sans-serif; min-width: 160px;">
          <p style="margin:0;font-weight:600;color:#111827;">${station.name}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">${station.location.address || "No address"}</p>
          <p style="margin:6px 0 0;font-size:12px;">
            <span style="display:inline-flex;align-items:center;gap:4px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:9999px;background:${
                station.isActive ? "#22c55e" : "#ef4444"
              };"></span>
              ${station.isActive ? "Active" : "Inactive"}
            </span>
          </p>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: false });
      marker.addTo(markersLayerRef.current!);
    });

    if (validStations.length === 1) {
      map.setView(
        [validStations[0].location.lat, validStations[0].location.lng],
        13,
        { animate: true }
      );
    } else {
      const bounds = L.latLngBounds(
        validStations.map((station) => [
          station.location.lat,
          station.location.lng,
        ]) as L.LatLngTuple[]
      );
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 13 });
    }
  }, [stations]);

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[260px] w-full"
      style={{ backgroundColor: "#eef2ff" }}
    />
  );
};

// Notification types
interface Notification {
  id: string;
  type: "maintenance" | "kyc";
  title: string;
  message: string;
  timestamp: Date;
  vehicleId?: string;
  userId?: string;
  priority: "high" | "medium" | "low";
}

type BookingRangeKey = "today" | "week" | "month" | "year";

type BookingSummaryState = Record<
  BookingRangeKey,
  {
    count: number;
  }
>;

const rangeLabels: Record<BookingRangeKey, string> = {
  today: "Hôm nay",
  week: "Tuần này",
  month: "Tháng này",
  year: "Năm nay",
};

const DashboardAdmin: React.FC = () => {
  // State for API data
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Notification states
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [notificationLoading, setNotificationLoading] = useState<boolean>(false);
  const [stationFilter, setStationFilter] = useState<"all" | "active" | "inactive">("all");
  const [activeStationIndex, setActiveStationIndex] = useState<number>(0);
  const [showStationModal, setShowStationModal] = useState<boolean>(false);
  const [bookingSummary, setBookingSummary] = useState<BookingSummaryState>({
    today: { count: 0 },
    week: { count: 0 },
    month: { count: 0 },
    year: { count: 0 },
  });
  const [bookingSummaryLoading, setBookingSummaryLoading] = useState<boolean>(true);
  const [bookingSummaryError, setBookingSummaryError] = useState<string | null>(null);
  const [selectedBookingRange, setSelectedBookingRange] = useState<BookingRangeKey>("today");
  const bookingsCacheRef = useRef<Partial<Record<BookingRangeKey, AdminTransactionItem[]>>>({});
  const [bookingsByRange, setBookingsByRange] = useState<Partial<Record<BookingRangeKey, AdminTransactionItem[]>>>({});
  const [bookingRangeLoading, setBookingRangeLoading] = useState<boolean>(false);
  const [bookingRangeError, setBookingRangeError] = useState<string | null>(null);

  const getRangeDates = useCallback((range: BookingRangeKey) => {
    const now = new Date();
    const end = now.toISOString();
    const start = new Date(now);

    switch (range) {
      case "today": {
        start.setHours(0, 0, 0, 0);
        break;
      }
      case "week": {
        start.setHours(0, 0, 0, 0);
        const day = start.getDay(); // 0 Sunday
        const diff = day === 0 ? 6 : day - 1; // Start from Monday
        start.setDate(start.getDate() - diff);
        break;
      }
      case "month": {
        start.setHours(0, 0, 0, 0);
        start.setDate(1);
        break;
      }
      case "year": {
        start.setHours(0, 0, 0, 0);
        start.setMonth(0, 1);
        break;
      }
      default:
        break;
    }

    return { from: start.toISOString(), to: end };
  }, []);

  const fetchBookingSummary = useCallback(async () => {
    setBookingSummaryLoading(true);
    setBookingSummaryError(null);
    try {
      const ranges: BookingRangeKey[] = ["today", "week", "month", "year"];
      const results = await Promise.all(
        ranges.map(async (range) => {
          const { from, to } = getRangeDates(range);
          const response = await getAdminTransactions({
            from,
            to,
            dateField: "createdAt",
            page: 1,
            limit: 1,
          });
          const count = response?.total ?? response?.items?.length ?? 0;
          return [range, { count }] as const;
        })
      );

      const summary = results.reduce((acc, [range, value]) => {
        acc[range] = value;
        return acc;
      }, {} as BookingSummaryState);

      setBookingSummary(summary);
    } catch (err: any) {
      setBookingSummaryError(err?.message || "Không thể tải tổng quan booking");
    } finally {
      setBookingSummaryLoading(false);
    }
  }, [getRangeDates]);

  const fetchBookingsForRange = useCallback(
    async (range: BookingRangeKey) => {
      setBookingRangeLoading(true);
      setBookingRangeError(null);

      try {
        const { from, to } = getRangeDates(range);
        const response = await getAdminTransactions({
          from,
          to,
          dateField: "createdAt",
          page: 1,
          limit: 50,
        });
        const items = response?.items || [];
        bookingsCacheRef.current = {
          ...bookingsCacheRef.current,
          [range]: items,
        };
        setBookingsByRange({ ...bookingsCacheRef.current });
      } catch (err: any) {
        setBookingRangeError(err?.message || "Không thể tải danh sách booking");
      } finally {
        setBookingRangeLoading(false);
      }
    },
    [getRangeDates]
  );

  useEffect(() => {
    fetchBookingSummary();
  }, [fetchBookingSummary]);

  useEffect(() => {
    if (!bookingsCacheRef.current[selectedBookingRange]) {
      fetchBookingsForRange(selectedBookingRange);
    }
  }, [selectedBookingRange, fetchBookingsForRange]);

  const selectedBookings = useMemo(
    () => bookingsByRange[selectedBookingRange] || [],
    [bookingsByRange, selectedBookingRange]
  );

  const bookingChartData = useMemo(() => {
    const createBuckets = () => {
      const buckets: { label: string; start: Date; end: Date }[] = [];
      const { from, to } = getRangeDates(selectedBookingRange);
      const startDate = new Date(from);
      const endDate = new Date(to);

      if (selectedBookingRange === "today") {
        for (let hour = 0; hour < 24; hour += 1) {
          const bucketStart = new Date(startDate);
          bucketStart.setHours(hour, 0, 0, 0);
          const bucketEnd = new Date(bucketStart);
          bucketEnd.setHours(hour + 1, 0, 0, 0);
          buckets.push({
            label: `${hour.toString().padStart(2, "0")}:00`,
            start: bucketStart,
            end: bucketEnd,
          });
        }
      } else if (selectedBookingRange === "week") {
        const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        for (let i = 0; i < 7; i += 1) {
          const bucketStart = new Date(startDate);
          bucketStart.setDate(startDate.getDate() + i);
          const bucketEnd = new Date(bucketStart);
          bucketEnd.setDate(bucketStart.getDate() + 1);
          buckets.push({
            label: dayLabels[i],
            start: bucketStart,
            end: bucketEnd,
          });
        }
      } else if (selectedBookingRange === "month") {
        const monthStart = new Date(startDate);
        const monthEnd = new Date(endDate);
        let cursor = new Date(monthStart);
        while (cursor <= monthEnd) {
          const bucketStart = new Date(cursor);
          const bucketEnd = new Date(bucketStart);
          bucketEnd.setDate(bucketStart.getDate() + 1);
          buckets.push({
            label: `${bucketStart.getDate()}`,
            start: bucketStart,
            end: bucketEnd,
          });
          cursor = bucketEnd;
        }
      } else if (selectedBookingRange === "year") {
        const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (let month = 0; month < 12; month += 1) {
          const bucketStart = new Date(startDate.getFullYear(), month, 1);
          const bucketEnd = new Date(startDate.getFullYear(), month + 1, 1);
          buckets.push({
            label: monthLabels[month],
            start: bucketStart,
            end: bucketEnd,
          });
        }
      }

      return buckets;
    };

    const buckets = createBuckets().map((bucket) => ({
      ...bucket,
      count: 0,
      amount: 0,
      totalPaid: 0,
    }));

    if (buckets.length === 0) return [];

    selectedBookings.forEach((booking) => {
      const created = new Date(booking.createdAt);
      const bucket = buckets.find(
        (b) => created >= b.start && created < b.end
      );
      if (bucket) {
        bucket.count += 1;
        bucket.amount += booking.deposit?.amount || 0;
        bucket.totalPaid += booking.amounts?.totalPaid || 0;
      }
    });

    return buckets.map((bucket) => ({
      label: bucket.label,
      count: bucket.count,
      amount: Number(bucket.amount.toFixed(2)),
      totalPaid: Number(bucket.totalPaid.toFixed(2)),
    }));
  }, [selectedBookings, selectedBookingRange, getRangeDates]);

  const totalRangeRevenue = useMemo(
    () =>
      selectedBookings.reduce(
        (total, booking) => total + (booking.deposit?.amount || 0),
        0
      ),
    [selectedBookings]
  );

  const totalRangePaid = useMemo(
    () =>
      selectedBookings.reduce(
        (total, booking) => total + (booking.amounts?.totalPaid || 0),
        0
      ),
    [selectedBookings]
  );

  // Helper function to check if user needs KYC verification
  const hasAllKycFields = (user: RawApiUser): boolean => {
    const kyc = user.kyc || ({} as any);
    const required = [
      kyc.idNumber,
      kyc.idFrontImage,
      kyc.idBackImage,
      kyc.licenseFrontImage,
      kyc.licenseBackImage,
    ];
    return required.every((v) => v !== undefined && v !== null && String(v).trim() !== "");
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setNotificationLoading(true);
      const newNotifications: Notification[] = [];

      // Fetch maintenance requests
      try {
        const maintenanceData = await getMaintenanceRequestsPaginated(1, 50);
        const pendingMaintenance = maintenanceData.items.filter(
          (req: any) => req.status === "pending" || req.status === "pending_maintenance"
        );

        pendingMaintenance.forEach((req: any) => {
          const vehicle = vehicles.find((v) => v._id === req.vehicleId || v._id === req.vehicle?._id);
          newNotifications.push({
            id: `maintenance-${req._id}`,
            type: "maintenance",
            title: "Maintenance Request",
            message: vehicle
              ? `${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber}) needs maintenance`
              : `Vehicle maintenance request #${req._id.slice(-6)}`,
            timestamp: new Date(req.createdAt || Date.now()),
            vehicleId: req.vehicleId || req.vehicle?._id,
            priority: "high",
          });
        });
      } catch (err) {
        console.error("Error fetching maintenance requests:", err);
      }

      // Fetch users needing KYC verification
      try {
        const rentersData = await getRenters({ page: 1, limit: 100 });
        const kycPendingUsers = (rentersData.items || []).filter(
          (user: RawApiUser) =>
            user.role === "renter" &&
            !user.kyc?.verified &&
            hasAllKycFields(user)
        );

        kycPendingUsers.forEach((user: RawApiUser) => {
          newNotifications.push({
            id: `kyc-${user._id}`,
            type: "kyc",
            title: "KYC Verification Required",
            message: `${user.name || user.email} submitted KYC documents for review`,
            timestamp: new Date(user.createdAt || Date.now()),
            userId: user._id,
            priority: "medium",
          });
        });
      } catch (err) {
        console.error("Error fetching KYC users:", err);
      }

      // Sort by priority and timestamp
      newNotifications.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.timestamp.getTime() - a.timestamp.getTime();
      });

      setNotifications(newNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setNotificationLoading(false);
    }
  }, [vehicles]);

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

  // Fetch notifications when vehicles are loaded
  useEffect(() => {
    if (vehicles.length > 0) {
      fetchNotifications();
    }
  }, [vehicles.length, fetchNotifications]);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (vehicles.length > 0) {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [vehicles.length, fetchNotifications]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showNotifications && !target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications]);

  // Calculate statistics
  const totalVehicles = vehicles.length;
  const activeCustomers = users.filter(user => user.role === 'renter' || user.role === 'regular' || user.role === 'vip').length;
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

  const stationSummaries = useMemo(() => {
    const activeStatuses = new Set(["available", "reserved", "rented"]);

    return stations.map((station: StationType) => {
      const stationVehicles = vehicles.filter((v) => {
        if (typeof v.station === "string") {
          return v.station === station._id;
        }
        if (v.station && typeof v.station === "object") {
          return v.station._id === station._id;
        }
        return false;
      });

      const activeCount = stationVehicles.filter((v) => activeStatuses.has(v.status)).length;
      const maintenanceCount = stationVehicles.filter((v) => v.status === "maintenance").length;
      const pendingMaintenanceCount = stationVehicles.filter(
        (v) => v.status === "pending_maintenance"
      ).length;
      const pendingDeletionCount = stationVehicles.filter(
        (v) => v.status === "pending_deletion"
      ).length;

      return {
        station,
        totalVehicles: stationVehicles.length,
        activeCount,
        maintenanceCount,
        pendingMaintenanceCount,
        pendingDeletionCount,
      };
    });
  }, [stations, vehicles]);

  const filteredStationSummaries = useMemo(() => {
    return stationSummaries
      .filter((summary) => {
        if (stationFilter === "all") return true;
        if (stationFilter === "active") return summary.station.isActive;
        return !summary.station.isActive;
      })
      .sort((a, b) => b.totalVehicles - a.totalVehicles);
  }, [stationSummaries, stationFilter]);

  useEffect(() => {
    setActiveStationIndex(0);
  }, [stationFilter, filteredStationSummaries.length]);

  useEffect(() => {
    if (filteredStationSummaries.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setActiveStationIndex((prev) => (prev + 1) % filteredStationSummaries.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [filteredStationSummaries]);

  const highlightedStation = filteredStationSummaries[activeStationIndex] || null;

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
      .filter(u => u.role === 'renter' || u.role === 'regular' || u.role === 'vip')
      .slice(0, 1)
      .map(u => ({
        type: "info" as const,
        icon: <MdPeople className="w-5 h-5" />,
        title: "Customer Account",
        details: `${u.name || u.email} - ${u.email}`,
        time: "Recently",
        color: "border-purple-300 bg-purple-50",
        iconBg: "bg-purple-200 text-purple-700",
      })),
  ].slice(0, 4);

  const totalStationsCount = stations.length;
  const activeStationsCount = stations.filter((s) => s.isActive).length;
  const inactiveStationsCount = totalStationsCount - activeStationsCount;

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
    <div className="min-h-screen bg-white p-6">
      <PageTransition>
        <div className="space-y-6">
          <motion.div
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PageTitle
              title="Admin Dashboard"
              subtitle={`Quản lý ${totalVehicles} xe, ${activeCustomers} khách hàng và ${totalStations} trạm đang hoạt động`}
              icon={<MdDirectionsCar className="w-7 h-7 text-gray-700" />}
            />
            <div className="flex items-center gap-3">
              <motion.button
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow transition-shadow text-sm font-medium text-gray-700"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MdTrendingUp className="w-5 h-5 text-blue-600" />
                Xuất báo cáo
              </motion.button>
              <div className="relative notification-container">
                <motion.button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MdNotifications className="w-5 h-5 text-gray-700" />
                  {notifications.length > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      {notifications.length > 99 ? "99+" : notifications.length}
                    </motion.span>
                  )}
                </motion.button>
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 max-h-[600px] overflow-hidden flex flex-col"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MdNotifications className="w-5 h-5 text-gray-700" />
                            <h3 className="font-semibold text-gray-900">Thông báo</h3>
                            {notifications.length > 0 && (
                              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                                {notifications.length}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <MdClose className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      <div className="overflow-y-auto flex-1">
                        {notificationLoading ? (
                          <div className="p-8 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <MdNotifications className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Chưa có thông báo mới</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {notifications.map((notif, index) => (
                              <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                                  notif.priority === "high" ? "bg-red-50/60" : ""
                                }`}
                                onClick={() => {
                                  if (notif.type === "maintenance") {
                                    window.location.href = "/admin/vehicles?tab=requests";
                                  } else if (notif.type === "kyc") {
                                    window.location.href = "/admin/users/verification";
                                  }
                                  setShowNotifications(false);
                                }}
                              >
                                <div className="flex items-start space-x-3">
                                  <div
                                    className={`p-2 rounded-lg flex-shrink-0 ${
                                      notif.type === "maintenance"
                                        ? "bg-orange-100 text-orange-600"
                                        : "bg-blue-100 text-blue-600"
                                    }`}
                                  >
                                    {notif.type === "maintenance" ? (
                                      <MdBuild className="w-5 h-5" />
                                    ) : (
                                      <MdVerifiedUser className="w-5 h-5" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <p className="font-semibold text-gray-900 text-sm mb-1">
                                          {notif.title}
                                        </p>
                                        <p className="text-xs text-gray-600 line-clamp-2">
                                          {notif.message}
                                        </p>
                                      </div>
                                      {notif.priority === "high" && (
                                        <span className="ml-2 w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1" />
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                      {notif.timestamp.toLocaleTimeString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                          <button
                            onClick={() => {
                              if (notifications.some((n) => n.type === "maintenance")) {
                                window.location.href = "/admin/vehicles?tab=requests";
                              } else {
                                window.location.href = "/admin/users/verification";
                              }
                              setShowNotifications(false);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                          >
                            Xem tất cả
                            <MdArrowForward className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Overall Booking</h2>
                <p className="text-sm text-gray-500">
                  Theo dõi số lượng booking mới theo từng giai đoạn và trạng thái xử lý.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {(["today", "week", "month", "year"] as BookingRangeKey[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedBookingRange(range)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                      selectedBookingRange === range
                        ? "bg-blue-600 text-white shadow shadow-blue-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {rangeLabels[range]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {(["today", "week", "month", "year"] as BookingRangeKey[]).map((range) => (
                <div
                  key={range}
                  className={`rounded-2xl border ${
                    selectedBookingRange === range
                      ? "border-blue-200 bg-blue-50/60"
                      : "border-gray-100 bg-gray-50"
                  } p-4 shadow-sm`}
                >
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    {rangeLabels[range]}
                  </p>
                  {bookingSummaryLoading ? (
                    <div className="mt-3 h-8 rounded-lg bg-gray-200 animate-pulse" />
                  ) : (
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {bookingSummary[range]?.count ?? 0}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Booking mới</p>
                </div>
              ))}
            </div>

            {bookingSummaryError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {bookingSummaryError}
              </div>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm h-full">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Booking Volume</h3>
                      <p className="text-sm text-gray-500">
                        {rangeLabels[selectedBookingRange]} · {selectedBookings.length} booking
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Total deposit
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {formatCurrency(totalRangeRevenue, "VND")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Total paid
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {formatCurrency(totalRangePaid, "VND")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="h-80">
                    {bookingChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={bookingChartData}
                          margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12, fill: "#6b7280" }}
                          />
                          <YAxis
                            yAxisId="left"
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12, fill: "#6b7280" }}
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12, fill: "#6b7280" }}
                            tickFormatter={(value: number) =>
                              value >= 1000 ? `${Math.round(value / 1000)}k` : value.toString()
                            }
                          />
                          <Tooltip
                            cursor={{ strokeDasharray: "3 3", stroke: "#cbd5f5" }}
                            formatter={(value: number, name: string) => {
                              if (name === "amount") {
                                return [formatCurrency(value, "VND"), "Deposit"];
                              }
                              if (name === "totalPaid") {
                                return [formatCurrency(value, "VND"), "Total Paid"];
                              }
                              return [value, "Bookings"];
                            }}
                          />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="count"
                            stroke="#4c1d95"
                            strokeWidth={2.2}
                            dot={{ r: 4, strokeWidth: 1.5, stroke: "#4c1d95", fill: "#fff" }}
                            activeDot={{ r: 5.5, stroke: "#4c1d95", fill: "#fff" }}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="amount"
                            stroke="#16a34a"
                            strokeWidth={2.2}
                            dot={{ r: 4, strokeWidth: 1.5, stroke: "#16a34a", fill: "#fff" }}
                            activeDot={{ r: 5.5, stroke: "#16a34a", fill: "#fff" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
                        Chưa có dữ liệu booking để hiển thị biểu đồ.
                      </div>
                    )}
                  </div>
                  {bookingRangeLoading && (
                    <p className="mt-3 text-xs text-gray-400">
                      Đang cập nhật dữ liệu booking...
                    </p>
                  )}
                  {bookingRangeError && !bookingRangeLoading && (
                    <p className="mt-3 text-sm text-red-500">{bookingRangeError}</p>
                  )}
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm h-full flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Bản đồ trạm</h3>
                      <p className="text-sm text-gray-500">
                        {activeStationsCount} / {totalStationsCount} trạm đang hoạt động
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                      Tổng {totalStationsCount}
                    </span>
                  </div>
                  <div className="mt-4 flex-1 rounded-2xl border border-gray-100 overflow-hidden">
                    {stations.length === 0 ? (
                      <div className="flex h-full items-center justify-center bg-gray-50 text-sm text-gray-500">
                        Chưa có dữ liệu trạm
                      </div>
                    ) : (
                      <MiniStationMap stations={stations} />
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-gray-100 bg-emerald-50/70 px-3 py-2">
                      <p className="text-xs font-semibold uppercase text-emerald-600">Active</p>
                      <p className="text-lg font-bold text-gray-900">{activeStationsCount}</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-rose-50/70 px-3 py-2">
                      <p className="text-xs font-semibold uppercase text-rose-600">Inactive</p>
                      <p className="text-lg font-bold text-gray-900">{inactiveStationsCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="grid gap-6 xl:grid-cols-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MdEvStation className="w-5 h-5 text-blue-600" />
                  Station
                </h3>
                <button
                  onClick={() => setShowStationModal(true)}
                  className="text-xs inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline"
                >
                  Xem chi tiết
                  <MdArrowForward className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    key: "all" as const,
                    label: "Tất cả",
                    value: totalStationsCount,
                    subLabel: `${activeStationsCount} hoạt động`,
                    bg: "bg-indigo-50",
                    text: "text-indigo-600",
                  },
                  {
                    key: "active" as const,
                    label: "Đang hoạt động",
                    value: activeStationsCount,
                    subLabel: `${Math.round(
                      (activeStationsCount / Math.max(totalStationsCount, 1)) * 100
                    )}%`,
                    bg: "bg-emerald-50",
                    text: "text-emerald-600",
                  },
                  {
                    key: "inactive" as const,
                    label: "Bảo trì",
                    value: inactiveStationsCount,
                    subLabel: "Cần kiểm tra",
                    bg: "bg-rose-50",
                    text: "text-rose-600",
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setStationFilter(item.key)}
                    className={`p-4 rounded-2xl border text-left transition ${
                      stationFilter === item.key
                        ? "border-blue-200 shadow-lg shadow-blue-100/50"
                        : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                    } ${item.bg}`}
                  >
                    <p className={`text-xs font-semibold ${item.text}`}>{item.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
                    <p className="text-xs text-gray-500 mt-2">{item.subLabel}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <div className="relative">
                  <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
                    <AnimatePresence mode="wait">
                      {highlightedStation ? (
                        <motion.div
                          key={highlightedStation.station._id}
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -30 }}
                          transition={{ duration: 0.35 }}
                          className="p-5"
                        >
                          <StationCard
                            station={highlightedStation.station}
                            totalVehicles={highlightedStation.totalVehicles}
                            activeCount={highlightedStation.activeCount}
                            maintenanceCount={highlightedStation.maintenanceCount}
                            pendingMaintenanceCount={highlightedStation.pendingMaintenanceCount}
                            pendingDeletionCount={highlightedStation.pendingDeletionCount}
                            isHighlighted
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-6 text-center text-sm text-gray-500"
                        >
                          Không có trạm phù hợp với bộ lọc.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {filteredStationSummaries.length > 1 && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MdEvStation className="w-5 h-5 text-indigo-300" />
                    </div>
                  )}
                </div>
                {filteredStationSummaries.length > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveStationIndex((prev) =>
                            prev === 0 ? filteredStationSummaries.length - 1 : prev - 1
                          )
                        }
                        className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                      >
                        Trước
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveStationIndex((prev) => (prev + 1) % filteredStationSummaries.length)
                        }
                        className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                      >
                        Tiếp
                      </button>
                    </div>
                    <div className="flex gap-1">
                      {filteredStationSummaries.map((summary, index) => (
                        <button
                          key={summary.station._id}
                          type="button"
                          onClick={() => setActiveStationIndex(index)}
                          className={`h-2.5 rounded-full transition-all ${
                            index === activeStationIndex
                              ? "w-6 bg-blue-500"
                              : "w-2 bg-gray-300 hover:bg-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="xl:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tình trạng đội xe</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Sẵn sàng</span>
                  <span className="text-sm font-semibold text-emerald-600">
                    {vehicles.filter((v) => v.status === "available").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Đang sử dụng</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {vehicles.filter((v) => v.status === "rented" || v.status === "reserved").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Bảo trì</span>
                  <span className="text-sm font-semibold text-rose-600">
                    {vehicles.filter((v) => v.status === "maintenance" || v.status === "pending_maintenance").length}
                  </span>
                </div>
                <div className="pt-4 mt-4 border-t border-dashed border-gray-200">
                  <BatteryStatus
                    vehicleModel={featuredVehicles[0]?.vehicleModel || "Đang cập nhật"}
                    batteryLevel={featuredVehicles[0]?.batteryLevel ?? 0}
                    range={featuredVehicles[0]?.range ?? 0}
                    status={featuredVehicles[0]?.status || "available"}
                    licensePlate={featuredVehicles[0]?.licensePlate || "--"}
                  />
                </div>
              </div>
            </div>
            <div className="xl:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch điều phối</h3>
              <div className="space-y-4">
                {["Sáng", "Chiều", "Tối"].map((shift, index) => (
                  <div key={shift} className="p-4 rounded-2xl border border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">{shift}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-white border border-gray-200">
                        {String(10 + index * 5)} kWh
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Xe ưu tiên: {featuredVehicles[index]?.vehicleModel || "—"}</p>
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full text-sm font-semibold text-blue-600 hover:underline">
                + Thêm lịch mới
              </button>
            </div>
          </motion.div>

            {featuredVehicles.length > 0 && (
              <motion.div
                className="grid gap-6 lg:grid-cols-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Theo dõi pin đội xe</h3>
                    <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-600 rounded-full font-semibold">
                      Live
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {featuredVehicles.map((vehicle, index) => (
                      <motion.div
                        key={`${vehicle.licensePlate}-${index}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <BatteryStatus {...vehicle} />
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
                    <span className="text-xs text-gray-500">Cập nhật theo thời gian thực</span>
                  </div>
                  <div className="space-y-3">
                    {recentActivities.map((alert, index) => (
                      <motion.div
                        key={`${alert.title}-${index}`}
                        className={`flex items-start gap-4 p-4 rounded-2xl border ${alert.color.replace("border-2", "border")} hover:shadow-sm transition`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                      >
                        <div className={`p-2 rounded-xl ${alert.iconBg}`}>
                          {alert.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{alert.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{alert.details}</p>
                          <p className="text-xs text-gray-400 mt-2">{alert.time}</p>
                        </div>
                        <button className="text-gray-300 hover:text-gray-500 transition-colors">
                          <MdClose className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
        </div>
      </PageTransition>
      <AnimatePresence>
        {showStationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Danh sách trạm</h3>
                  <p className="text-sm text-gray-500">
                    Theo dõi tổng số xe, trạng thái hoạt động và yêu cầu bảo trì tại mỗi trạm.
                  </p>
                </div>
                <button
                  onClick={() => setShowStationModal(false)}
                  className="p-2 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition"
                >
                  <MdClose className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto">
                <div className="min-w-[780px]">
                  <div className="grid grid-cols-[2.2fr_repeat(5,1fr)] gap-4 px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                    <span>Trạm</span>
                    <span className="text-right">Tổng xe</span>
                    <span className="text-right">Đang hoạt động</span>
                    <span className="text-right">Bảo trì</span>
                    <span className="text-right">YC bảo trì</span>
                    <span className="text-right">YC xóa</span>
                  </div>
                  {stationSummaries.length === 0 ? (
                    <div className="px-6 py-12 text-center text-sm text-gray-500">
                      Không tìm thấy dữ liệu trạm.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {stationSummaries.map((summary) => (
                        <div
                          key={summary.station._id}
                          className="grid grid-cols-[2.2fr_repeat(5,1fr)] gap-4 px-6 py-4 items-center hover:bg-gray-50 transition text-sm"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-gray-900 truncate pr-6">
                                {summary.station.name}
                              </p>
                              <span
                                className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                  summary.station.isActive
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-rose-50 text-rose-600"
                                }`}
                              >
                                {summary.station.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 leading-tight line-clamp-1">
                              {summary.station.location?.address || "Chưa cập nhật"}
                            </p>
                          </div>
                          <div className="text-right tabular-nums font-semibold text-gray-900">
                            {summary.totalVehicles}
                          </div>
                          <div className="text-right tabular-nums font-semibold text-emerald-600">
                            {summary.activeCount}
                          </div>
                          <div className="text-right tabular-nums font-semibold text-rose-500">
                            {summary.maintenanceCount}
                          </div>
                          <div className="text-right tabular-nums font-semibold text-blue-600">
                            {summary.pendingMaintenanceCount}
                          </div>
                          <div className="text-right tabular-nums font-semibold text-purple-600">
                            {summary.pendingDeletionCount}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Tổng cộng {stationSummaries.length} trạm · {activeStationsCount} đang hoạt động · {inactiveStationsCount} bảo trì
                </div>
                <button
                  onClick={() => {
                    window.location.href = "/admin/stations";
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
                >
                  Quản lý trạm
                  <MdArrowForward className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardAdmin;
