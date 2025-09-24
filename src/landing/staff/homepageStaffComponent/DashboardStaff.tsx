import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdDirectionsCar,
  MdAttachMoney,
  MdPersonAdd,
  MdLocationOn,
  MdKeyboardArrowDown,
  MdBusiness,
  MdWarning,
  MdCalendarToday,
  MdPhone,
  MdVisibility,
  MdEdit,
  MdBuild,
} from "react-icons/md";

const DashboardStaff = () => {
  const navigate = useNavigate();
  const [selectedStation, setSelectedStation] = useState(
    "Station A - District 1"
  );
  const [isStationDropdownOpen, setIsStationDropdownOpen] = useState(false);

  const stations = [
    "Station A - District 1",
    "Station B - District 3",
    "Station C - District 7",
    "Central Hub - Downtown",
    "Tan Son Nhat Branch",
    "Binh Thanh Station",
  ];

  const stats = {
    vehicles: {
      total: 73,
      available: 25,
      rented: 40,
      maintenance: 8,

      path: "/staff/vehicles",
    },
    revenue: {
      today: 2450000,
      thisMonth: 45600000,

      path: "/staff/handover",
    },
    customers: {
      new: 45,
      total: 1250,
      vip: 89,
      trend: "+8.1%",
      path: "/staff/users",
    },
    contracts: {
      active: 18,
      expiring: 3,
      total: 25,
      trend: "+2.4%",
      path: "/staff/contracts",
    },
  };

  const handleStatsCardClick = (path: string) => {
    navigate(path);
  };

  const recentActivities = [
    {
      id: "ACT001",
      type: "booking",
      title: "New Booking Created",
      description: "John Doe booked Toyota Camry",
      time: "2 minutes ago",
      status: "success",
      icon: MdDirectionsCar,
    },
    {
      id: "ACT002",
      type: "contract",
      title: "Contract Renewal",
      description: "ABC Transport renewed contract",
      time: "15 minutes ago",
      status: "info",
      icon: MdBusiness,
    },
    {
      id: "ACT003",
      type: "maintenance",
      title: "Maintenance Completed",
      description: "Honda Civic service finished",
      time: "1 hour ago",
      status: "success",
      icon: MdBuild,
    },
    {
      id: "ACT004",
      type: "alert",
      title: "Low Battery Alert",
      description: "VinFast Klara needs charging",
      time: "2 hours ago",
      status: "warning",
      icon: MdWarning,
    },
  ];

  const recentBookings = [
    {
      id: "#BK001",
      customer: "John Doe",
      phone: "0901234567",
      email: "john@email.com",
      vehicle: "Toyota Camry",
      licensePlate: "29A-12345",
      date: "Dec 15, 2024",
      time: "09:00 AM",
      status: "confirmed",
      statusColor: "green",
      amount: 450000,
    },
    {
      id: "#BK002",
      customer: "Jane Smith",
      phone: "0912345678",
      email: "jane@email.com",
      vehicle: "Honda Civic",
      licensePlate: "29B-67890",
      date: "Dec 15, 2024",
      time: "10:30 AM",
      status: "pending",
      statusColor: "yellow",
      amount: 380000,
    },
    {
      id: "#BK003",
      customer: "Michael Brown",
      phone: "0923456789",
      email: "michael@email.com",
      vehicle: "BMW X5",
      licensePlate: "29C-11111",
      date: "Dec 14, 2024",
      time: "02:00 PM",
      status: "active",
      statusColor: "blue",
      amount: 850000,
    },
    {
      id: "#BK004",
      customer: "Emily Davis",
      phone: "0934567890",
      email: "emily@email.com",
      vehicle: "Audi A4",
      licensePlate: "29D-22222",
      date: "Dec 14, 2024",
      time: "11:00 AM",
      status: "completed",
      statusColor: "green",
      amount: 520000,
    },
  ];
  const handleViewAllBookings = () => {
    navigate("/staff/handover");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Staff Dashboard
              </h1>
            </div>
            <p className="text-gray-600">
              Welcome back! Here's your performance overview
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <div
                role="button"
                onClick={() => setIsStationDropdownOpen(!isStationDropdownOpen)}
                className="flex items-center space-x-2 hover:text-gray-700 transition-colors bg-white rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-300 min-w-[200px]"
              >
                <MdLocationOn className="w-4 h-4" />
                <span className="flex-1 text-left">{selectedStation}</span>
                <MdKeyboardArrowDown
                  className={`w-4 h-4 transition-transform ${
                    isStationDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {isStationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="py-2">
                    {stations.map((station, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedStation(station);
                          setIsStationDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          selectedStation === station
                            ? "bg-gray-50 text-gray-900 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <MdLocationOn className="w-4 h-4" />
                          <span>{station}</span>
                          {selectedStation === station && (
                            <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          onClick={() => handleStatsCardClick(stats.vehicles.path)}
          className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <MdDirectionsCar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">
                {stats.vehicles.total}
              </span>
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-2 group-hover:text-gray-700 transition-colors">
            Total Vehicles
          </h3>
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-600">
              Available: {stats.vehicles.available}
            </span>
            <span className="text-blue-600">
              Rented: {stats.vehicles.rented}
            </span>
          </div>
        </div>

        <div
          onClick={() => handleStatsCardClick(stats.revenue.path)}
          className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <MdAttachMoney className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">
                {(stats.revenue.today / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-2 group-hover:text-gray-700 transition-colors">
            Today's Revenue
          </h3>
          <p className="text-xs text-gray-500">
            Monthly: {(stats.revenue.thisMonth / 1000000).toFixed(1)}M VND
          </p>
        </div>
        <div
          onClick={() => handleStatsCardClick(stats.customers.path)}
          className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <MdPersonAdd className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">
                {stats.customers.new}
              </span>
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-2 group-hover:text-gray-700 transition-colors">
            New Customers
          </h3>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Total: {stats.customers.total}
            </span>
            <span className="text-yellow-600">VIP: {stats.customers.vip}</span>
          </div>
        </div>

        <div
          onClick={() => handleStatsCardClick(stats.contracts.path)}
          className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <MdBusiness className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">
                {stats.contracts.active}
              </span>
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-2 group-hover:text-gray-700 transition-colors">
            Active Contracts
          </h3>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Total: {stats.contracts.total}
            </span>
            <span className="text-red-600">
              Expiring: {stats.contracts.expiring}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MdCalendarToday className="w-5 h-5 mr-2" />
                Recent Bookings
              </h3>
              <div
                role="button"
                onClick={handleViewAllBookings}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                View All
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.map((booking, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.date} • {booking.time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-medium text-xs mr-3">
                          {booking.customer
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.customer}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MdPhone className="w-3 h-3 mr-1" />
                            {booking.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.vehicle}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.licensePlate}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.amount.toLocaleString()} VND
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.statusColor === "yellow"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.statusColor === "blue"
                            ? "bg-blue-100 text-blue-800"
                            : booking.statusColor === "green"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button className="text-gray-600 hover:text-gray-900 transition-colors">
                          <MdVisibility className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 transition-colors">
                          <MdEdit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activities
            </h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.status === "success"
                        ? "bg-green-100"
                        : activity.status === "warning"
                        ? "bg-yellow-100"
                        : activity.status === "info"
                        ? "bg-blue-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <activity.icon
                      className={`w-4 h-4 ${
                        activity.status === "success"
                          ? "text-green-600"
                          : activity.status === "warning"
                          ? "text-yellow-600"
                          : activity.status === "info"
                          ? "text-blue-600"
                          : "text-gray-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              View All Activities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStaff;
