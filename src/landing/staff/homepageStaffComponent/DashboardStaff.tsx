import React, { useState } from "react";
import {
  MdDirectionsCar,
  MdAttachMoney,
  MdPersonAdd,
  MdAssignment,
  MdMoreVert,
  MdLocationOn,
  MdKeyboardArrowDown,
} from "react-icons/md";

const DashboardStaff = () => {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Staff Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back! Here's your performance overview
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="relative">
              <div
                role="button"
                onClick={() => setIsStationDropdownOpen(!isStationDropdownOpen)}
                className="flex items-center space-x-2 hover:text-gray-700 transition-colors bg-white rounded-lg px-3 py-2 border border-gray-200 hover:border-gray-300"
              >
                <MdLocationOn className="w-4 h-4" />
                <span>{selectedStation}</span>
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
        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-colors shadow-md">
          <div className="flex items-center  mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <MdDirectionsCar className="w-6 h-6 text-gray-700" />
            </div>
            <div className="ml-2">
              <h3 className="text-gray-600 text-sm ">Vehicle Bookings</h3>
              <p className="text-2xl font-bold text-gray-900">120</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-colors shadow-md">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <MdAttachMoney className="w-6 h-6 text-gray-700" />
            </div>
            <div className="ml-2">
              <h3 className="text-gray-600 text-sm ">Total Revenue</h3>
              <p className="text-2xl font-bold text-gray-900">$2,450</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-colors shadow-md">
          <div className="flex items-center  mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <MdPersonAdd className="w-6 h-6 text-gray-700" />
            </div>
            <div className="ml-2">
              <h3 className="text-gray-600 text-sm ">New Customers</h3>
              <p className="text-2xl font-bold text-gray-900">45</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-colors shadow-md">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <MdAssignment className="w-6 h-6 text-gray-700" />
            </div>
            <h3 className="text-gray-600 text-sm ml-2">Vehicle Status</h3>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-xs text-gray-600">Available</span>
              <span className="text-sm font-semibold text-gray-900">25</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-xs text-gray-600">Maintenance</span>
              <span className="text-sm font-semibold text-gray-900">8</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-xs text-gray-600">Rented</span>
              <span className="text-sm font-semibold text-gray-900">40</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 shadow-md bg-white rounded-xl border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Bookings
              </h3>
              <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <MdMoreVert className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {[
                {
                  id: "#BK001",
                  customer: "John Doe",
                  vehicle: "Toyota Camry",
                  date: "Dec 15, 2024",
                  status: "pending",
                  statusColor: "yellow",
                },
                {
                  id: "#BK002",
                  customer: "Jane Smith",
                  vehicle: "Honda Civic",
                  date: "Dec 14, 2024",
                  status: "active",
                  statusColor: "blue",
                },
                {
                  id: "#BK003",
                  customer: "Michael Brown",
                  vehicle: "BMW X5",
                  date: "Dec 13, 2024",
                  status: "completed",
                  statusColor: "green",
                },
                {
                  id: "#BK004",
                  customer: "Emily Davis",
                  vehicle: "Audi A4",
                  date: "Dec 12, 2024",
                  status: "cancelled",
                  statusColor: "red",
                },
              ].map((booking, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-medium text-sm">
                      {booking.customer
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{booking.id}</p>
                      <p className="text-sm text-gray-600">
                        {booking.customer}
                      </p>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {booking.vehicle}
                    </p>
                    <p className="text-xs text-gray-500">{booking.date}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.statusColor === "yellow"
                        ? "bg-yellow-100 text-yellow-700"
                        : booking.statusColor === "blue"
                        ? "bg-blue-100 text-blue-700"
                        : booking.statusColor === "green"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-gray-900 text-white rounded-lg py-3 px-4 font-medium hover:bg-gray-800 transition-colors">
                Create New Booking
              </button>
              <button className="w-full bg-gray-100 text-gray-700 rounded-lg py-3 px-4 font-medium hover:bg-gray-200 transition-colors">
                Vehicle Maintenance
              </button>
              <button className="w-full bg-gray-100 text-gray-700 rounded-lg py-3 px-4 font-medium hover:bg-gray-200 transition-colors">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStaff;
