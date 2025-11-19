import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { MdDirectionsCar, MdWarning, MdCheckCircle, MdLocationOn, MdPeople } from "react-icons/md";
import { PageTransition } from "../../component/animations";
import PageTitle from "../../component/PageTitle";
import { getAdminTransactions } from "../../../../service/apiBooking/API";
import type { AdminTransactionItem } from "../../../../service/apiBooking/API";
import Bookedmanagement from "../BookingManagementComponent/Bookedmanagement";
import { getAllVehicles } from "../../../../service/apiAdmin/apiVehicles/API";
import { getAllStations } from "../../../../service/apiAdmin/apiStation/API";
import { getAllUsers } from "../../../../service/apiAdmin/apiListUser/API";
import type { Station as StationType } from "../../../../service/apiAdmin/apiStation/API";
import {
  NotificationBell,
  StatsCards,
  BookingVolumeChart,
  PaymentStatisticsChart,
  StationSection,
  StationModal,
  FleetBatteryMonitor,
  RecentActivity,
  useNotifications,
  type BookingRangeKey,
} from "./index";

const DashboardAdmin: React.FC = () => {
  // State for API data
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Notification hook
  const {
    notifications,
    readNotifications,
    unreadCount,
    showNotifications,
    setShowNotifications,
    notificationLoading,
    fetchNotifications,
    deleteNotification,
    clearAllNotifications,
    handleNotificationClick,
  } = useNotifications({ vehicles });

  // Station filter and modal states
  const [stationFilter, setStationFilter] = useState<"all" | "active" | "inactive">("all");
  const [activeStationIndex, setActiveStationIndex] = useState<number>(0);
  const [showStationModal, setShowStationModal] = useState<boolean>(false);

  // Booking range state (default to month)
  const [selectedBookingRange] = useState<BookingRangeKey>("month");
  const bookingsCacheRef = useRef<Partial<Record<BookingRangeKey, AdminTransactionItem[]>>>({});
  const [bookingsByRange, setBookingsByRange] = useState<Partial<Record<BookingRangeKey, AdminTransactionItem[]>>>({});
  const [bookingRangeLoading, setBookingRangeLoading] = useState<boolean>(false);
  const [bookingRangeError, setBookingRangeError] = useState<string | null>(null);
  
  // Payment statistics state
  const [paymentStats, setPaymentStats] = useState<{
    totalCaptured: number;
    totalCancelled: number;
    monthlyData: Array<{ month: string; captured: number; cancelled: number }>;
  }>({
    totalCaptured: 0,
    totalCancelled: 0,
    monthlyData: [],
  });
  const [paymentStatsLoading, setPaymentStatsLoading] = useState<boolean>(false);
  const [paymentStatsError, setPaymentStatsError] = useState<string | null>(null);

  // Get range dates helper
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
        const day = start.getDay();
        const diff = day === 0 ? 6 : day - 1;
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

  // Fetch payment statistics
  const fetchPaymentStatistics = useCallback(async () => {
    setPaymentStatsLoading(true);
    setPaymentStatsError(null);
    try {
      const now = new Date();
      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 5);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      let allTransactions: AdminTransactionItem[] = [];
      let page = 1;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const response = await getAdminTransactions({
          from: startDate.toISOString(),
          to: now.toISOString(),
          dateField: "createdAt",
          page,
          limit,
        });

        if (response.items && response.items.length > 0) {
          allTransactions = [...allTransactions, ...response.items];
          hasMore = response.items.length === limit && page * limit < (response.total || 0);
          page++;
        } else {
          hasMore = false;
        }
      }

      let totalCaptured = 0;
      let totalCancelled = 0;
      const monthlyMap = new Map<string, { captured: number; cancelled: number }>();

      allTransactions.forEach((transaction) => {
        const date = new Date(transaction.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { captured: 0, cancelled: 0 });
        }

        const monthData = monthlyMap.get(monthKey)!;
        const amount = transaction.deposit?.amount || 0;
        const depositStatus = transaction.deposit?.status;
        const bookingStatus = transaction.status;

        if (depositStatus === "captured") {
          totalCaptured += amount;
          monthData.captured += amount;
        }

        if (bookingStatus === "cancelled" || depositStatus === "refunded") {
          totalCancelled += amount;
          monthData.cancelled += amount;
        }
      });

      const monthlyData: Array<{ month: string; captured: number; cancelled: number }> = [];
      const startDateForLoop = new Date(now);
      startDateForLoop.setMonth(startDateForLoop.getMonth() - 5);
      startDateForLoop.setDate(1);
      startDateForLoop.setHours(0, 0, 0, 0);

      for (let i = 0; i < 6; i++) {
        const currentMonth = new Date(startDateForLoop);
        currentMonth.setMonth(startDateForLoop.getMonth() + i);
        const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
        const dataForMonth = monthlyMap.get(monthKey) || { captured: 0, cancelled: 0 };
        
        monthlyData.push({
          month: currentMonth.toLocaleDateString("vi-VN", { month: "short", year: "numeric" }),
          captured: dataForMonth.captured,
          cancelled: dataForMonth.cancelled,
        });
      }

      setPaymentStats({
        totalCaptured,
        totalCancelled,
        monthlyData,
      });
    } catch (err: any) {
      console.error("Error fetching payment statistics:", err);
      setPaymentStatsError(err?.message || "Failed to load payment statistics");
    } finally {
      setPaymentStatsLoading(false);
    }
  }, []);

  // Fetch bookings for range
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
        setBookingRangeError(err?.message || "Failed to load booking list");
      } finally {
        setBookingRangeLoading(false);
      }
    },
    [getRangeDates]
  );

  // Fetch bookings when range changes
  useEffect(() => {
    if (!bookingsCacheRef.current[selectedBookingRange]) {
      fetchBookingsForRange(selectedBookingRange);
    }
  }, [selectedBookingRange, fetchBookingsForRange]);

  // Memoized selected bookings
  const selectedBookings = useMemo(
    () => bookingsByRange[selectedBookingRange] || [],
    [bookingsByRange, selectedBookingRange]
  );

  // Generate chart data
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

  // Calculate totals
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

  // Fetch all data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [vehiclesData, stationsData, usersData] = await Promise.all([
          getAllVehicles(),
          getAllStations(),
          getAllUsers(),
        ]);

        setVehicles(vehiclesData);
        setStations(stationsData);
        setUsers(usersData.items);
      } catch (err: any) {
        if (err?.response?.status !== 401 && err?.message?.includes("401") === false) {
          console.error("❌ Error fetching dashboard data:", err);
          setError(err?.message || "Failed to load dashboard data");
        } else {
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch payment statistics on mount
  useEffect(() => {
    fetchPaymentStatistics();
  }, [fetchPaymentStatistics]);

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

  // Lock body scroll when station modal is open
  useEffect(() => {
    if (showStationModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showStationModal]);

  // Calculate statistics
  const totalVehicles = vehicles.length;
  const activeCustomers = users.filter(user => user.role === 'renter' || user.role === 'regular' || user.role === 'vip').length;
  const totalStations = stations.filter(s => s.isActive).length;

  // Calculate battery status for featured vehicles
  const featuredVehicles = vehicles
    .filter(v => v.batteryLevel !== undefined)
    .sort((a, b) => (b.batteryLevel || 0) - (a.batteryLevel || 0))
    .slice(0, 4)
    .map(v => ({
      vehicleModel: `${v.brand} ${v.model}`,
      batteryLevel: v.batteryLevel || 0,
      range: Math.round((v.batteryCapacity / 100) * (v.batteryLevel || 0) * 5),
      status: v.status,
      licensePlate: v.plateNumber,
    }));

  // Station summaries
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

  // Stats cards data
  const statsCardsData = [
    {
      title: "Total Vehicles",
      value: totalVehicles.toString(),
      change: "+12%",
      changeType: "increase" as const,
      icon: <MdDirectionsCar className="w-6 h-6" />,
      color: "blue",
    },
    {
      title: "Active Customers",
      value: activeCustomers.toString(),
      change: "+8%",
      changeType: "increase" as const,
      icon: <MdPeople className="w-6 h-6" />,
      color: "emerald",
    },
    {
      title: "Active Stations",
      value: totalStations.toString(),
      change: "+5%",
      changeType: "increase" as const,
      icon: <MdLocationOn className="w-6 h-6" />,
      color: "purple",
    },
  ];

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
          {/* Header */}
          <motion.div
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PageTitle
              title="Admin Dashboard"
              subtitle={`Managing ${totalVehicles} vehicles, ${activeCustomers} customers and ${totalStations} active stations`}
              icon={<MdDirectionsCar className="w-7 h-7 text-gray-700" />}
            />
            <div className="flex items-center gap-3">
              <NotificationBell
                notifications={notifications}
                readNotifications={readNotifications}
                unreadCount={unreadCount}
                showNotifications={showNotifications}
                setShowNotifications={setShowNotifications}
                notificationLoading={notificationLoading}
                deleteNotification={deleteNotification}
                clearAllNotifications={clearAllNotifications}
                handleNotificationClick={handleNotificationClick}
              />
            </div>
          </motion.div>

          {/* Stats Cards */}
          <StatsCards stats={statsCardsData} />

          {/* Overall Booking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4"
          >
            <h2 className="text-2xl font-bold text-gray-900">Overall Booking</h2>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <BookingVolumeChart
                  selectedBookingRange={selectedBookingRange}
                  selectedBookings={selectedBookings}
                  bookingChartData={bookingChartData}
                  totalRangeRevenue={totalRangeRevenue}
                  totalRangePaid={totalRangePaid}
                  bookingRangeLoading={bookingRangeLoading}
                  bookingRangeError={bookingRangeError}
                />
              </div>
              <div className="lg:col-span-1">
                <div className="rounded-2xl border border-gray-100 bg-white p-2.5 lg:p-3 shadow-sm h-full flex flex-col">
                  <Bookedmanagement />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Station and Payment Statistics */}
          <motion.div
            className="grid gap-6 xl:grid-cols-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StationSection
              stationSummaries={stationSummaries}
              filteredStationSummaries={filteredStationSummaries}
              highlightedStation={highlightedStation}
              activeStationIndex={activeStationIndex}
              setActiveStationIndex={setActiveStationIndex}
              stationFilter={stationFilter}
              setStationFilter={setStationFilter}
              totalStationsCount={totalStationsCount}
              activeStationsCount={activeStationsCount}
              inactiveStationsCount={inactiveStationsCount}
              onViewDetails={() => setShowStationModal(true)}
            />

            <PaymentStatisticsChart
              paymentStats={paymentStats}
              paymentStatsLoading={paymentStatsLoading}
              paymentStatsError={paymentStatsError}
            />
          </motion.div>

          {/* Fleet Battery Monitor and Recent Activity */}
          {featuredVehicles.length > 0 && (
            <motion.div
              className="grid gap-6 lg:grid-cols-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <FleetBatteryMonitor featuredVehicles={featuredVehicles} />
              <RecentActivity activities={recentActivities} />
            </motion.div>
          )}
        </div>
      </PageTransition>

      {/* Station Modal */}
      <StationModal
        showStationModal={showStationModal}
        setShowStationModal={setShowStationModal}
        stationSummaries={stationSummaries}
        activeStationsCount={activeStationsCount}
        inactiveStationsCount={inactiveStationsCount}
      />
    </div>
  );
};

export default DashboardAdmin;

