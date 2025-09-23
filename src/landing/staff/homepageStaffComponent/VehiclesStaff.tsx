import React, { useState } from "react";
import {
  MdDirectionsCar,
  MdBattery0Bar,
  MdBattery1Bar,
  MdBattery2Bar,
  MdBattery3Bar,
  MdBattery4Bar,
  MdBattery5Bar,
  MdBattery6Bar,
  MdBatteryFull,
  MdSearch,
  MdFilterList,
  MdViewList,
  MdViewModule,
  MdClose,
  MdLocationOn,
  MdCalendarToday,
  MdBuild,
  MdAssignment,
  MdPriorityHigh,
  MdMore,
} from "react-icons/md";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
// } from "recharts";

interface Vehicle {
  id: string;
  licensePlate: string;
  type: "scooter" | "sport" | "standard";
  brand: string;
  model: string;
  status: "available" | "rented" | "maintenance" | "low_battery";
  batteryLevel: number;
  lastMaintenance: string;
  rentalHistory: number;
  location: string;
  image?: string;
  notes?: string;
}

const VehiclesStaff = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBattery, setSelectedBattery] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Sample vehicle data
  const vehicles: Vehicle[] = [
    {
      id: "VH001",
      licensePlate: "29A1-123.45",
      type: "scooter",
      brand: "VinFast",
      model: "Klara A2",
      status: "available",
      batteryLevel: 95,
      lastMaintenance: "2024-12-01",
      rentalHistory: 45,
      location: "Station A - District 1",
      notes: "Excellent condition",
    },
    {
      id: "VH002",
      licensePlate: "29B2-567.89",
      type: "sport",
      brand: "Yamaha",
      model: "NVX 155",
      status: "rented",
      batteryLevel: 78,
      lastMaintenance: "2024-11-28",
      rentalHistory: 67,
      location: "Customer Location",
      notes: "High performance model",
    },
    {
      id: "VH003",
      licensePlate: "29C3-901.23",
      type: "standard",
      brand: "Honda",
      model: "Air Blade 150",
      status: "maintenance",
      batteryLevel: 0,
      lastMaintenance: "2024-12-15",
      rentalHistory: 23,
      location: "Maintenance Center",
      notes: "Engine overhaul required",
    },
    {
      id: "VH004",
      licensePlate: "29D4-456.78",
      type: "scooter",
      brand: "VinFast",
      model: "Klara S",
      status: "low_battery",
      batteryLevel: 15,
      lastMaintenance: "2024-12-10",
      rentalHistory: 89,
      location: "Station B - District 3",
      notes: "Needs charging",
    },
    {
      id: "VH005",
      licensePlate: "29E5-789.01",
      type: "sport",
      brand: "Piaggio",
      model: "Liberty 150",
      status: "available",
      batteryLevel: 88,
      lastMaintenance: "2024-12-05",
      rentalHistory: 156,
      location: "Central Hub",
      notes: "Premium vehicle",
    },
    {
      id: "VH006",
      licensePlate: "29F6-234.56",
      type: "standard",
      brand: "SYM",
      model: "Attila 150",
      status: "rented",
      batteryLevel: 67,
      lastMaintenance: "2024-11-30",
      rentalHistory: 34,
      location: "Customer Location",
      notes: "Regular maintenance",
    },
  ];

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "all" || vehicle.type === selectedType;
    const matchesStatus =
      selectedStatus === "all" || vehicle.status === selectedStatus;

    let matchesBattery = true;
    if (selectedBattery !== "all") {
      if (selectedBattery === "high" && vehicle.batteryLevel < 70)
        matchesBattery = false;
      if (
        selectedBattery === "medium" &&
        (vehicle.batteryLevel < 30 || vehicle.batteryLevel >= 70)
      )
        matchesBattery = false;
      if (selectedBattery === "low" && vehicle.batteryLevel >= 30)
        matchesBattery = false;
    }

    return matchesSearch && matchesType && matchesStatus && matchesBattery;
  });

  const getBatteryIcon = (level: number) => {
    if (level === 0) return <MdBattery0Bar className="w-5 h-5" />;
    if (level <= 15) return <MdBattery1Bar className="w-5 h-5" />;
    if (level <= 30) return <MdBattery2Bar className="w-5 h-5" />;
    if (level <= 45) return <MdBattery3Bar className="w-5 h-5" />;
    if (level <= 60) return <MdBattery4Bar className="w-5 h-5" />;
    if (level <= 75) return <MdBattery5Bar className="w-5 h-5" />;
    if (level <= 90) return <MdBattery6Bar className="w-5 h-5" />;
    return <MdBatteryFull className="w-5 h-5" />;
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "available":
        return {
          color: "bg-green-100 text-green-800",
          label: "Available",
          dotColor: "bg-green-500",
        };
      case "rented":
        return {
          color: "bg-gray-100 text-gray-800",
          label: "Rented",
          dotColor: "bg-gray-500",
        };
      case "maintenance":
        return {
          color: "bg-red-100 text-red-800",
          label: "Maintenance",
          dotColor: "bg-red-500",
        };
      case "low_battery":
        return {
          color: "bg-yellow-100 text-yellow-800",
          label: "Low Battery",
          dotColor: "bg-yellow-500",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          label: "Unknown",
          dotColor: "bg-gray-500",
        };
    }
  };

  const stats = {
    total: vehicles.length,
    available: vehicles.filter((v) => v.status === "available").length,
    rented: vehicles.filter((v) => v.status === "rented").length,
    maintenance: vehicles.filter((v) => v.status === "maintenance").length,
    lowBattery: vehicles.filter((v) => v.status === "low_battery").length,
  };

  // const pieData = [
  //   { name: "Available", value: stats.available, color: "#10B981" },
  //   { name: "Rented", value: stats.rented, color: "#6B7280" },
  //   { name: "Maintenance", value: stats.maintenance, color: "#EF4444" },
  //   { name: "Low Battery", value: stats.lowBattery, color: "#F59E0B" },
  // ];

  // const barData = [
  //   {
  //     name: "Scooter",
  //     available: vehicles.filter(
  //       (v) => v.type === "scooter" && v.status === "available"
  //     ).length,
  //     total: vehicles.filter((v) => v.type === "scooter").length,
  //   },
  //   {
  //     name: "Sport",
  //     available: vehicles.filter(
  //       (v) => v.type === "sport" && v.status === "available"
  //     ).length,
  //     total: vehicles.filter((v) => v.type === "sport").length,
  //   },
  //   {
  //     name: "Standard",
  //     available: vehicles.filter(
  //       (v) => v.type === "standard" && v.status === "available"
  //     ).length,
  //     total: vehicles.filter((v) => v.type === "standard").length,
  //   },
  // ];

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vehicles Management
            </h1>
            <p className="text-gray-600">
              Monitor and manage vehicle fleet status
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() =>
                setViewMode(viewMode === "table" ? "grid" : "table")
              }
              className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              {viewMode === "table" ? (
                <MdViewModule className="w-5 h-5" />
              ) : (
                <MdViewList className="w-5 h-5" />
              )}
              <span>{viewMode === "table" ? "Grid View" : "Table View"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MdDirectionsCar className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.total}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-2">Total Vehicles</h3>
          <p className="text-xs text-gray-500">Fleet size</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.available}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-2">Available</h3>
          <p className="text-xs text-gray-500">Ready for rental</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.rented}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-2">Currently Rented</h3>
          <p className="text-xs text-gray-500">In use</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <MdBuild className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.maintenance + stats.lowBattery}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-2">Needs Attention</h3>
          <p className="text-xs text-gray-500">Maintenance + Low Battery</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Vehicle Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center mt-4 space-x-4">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div> */}

        {/* <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Availability by Type
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="available" fill="#10B981" name="Available" />
              <Bar dataKey="total" fill="#E5E7EB" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </div> */}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <h3 className="text-lg font-semibold text-gray-900">
              Vehicle List
            </h3>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              {/* Search */}
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by license plate, model, brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <MdFilterList className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="all">All Types</option>
                    <option value="scooter">Scooter</option>
                    <option value="sport">Sport</option>
                    <option value="standard">Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="low_battery">Low Battery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Battery Level
                  </label>
                  <select
                    value={selectedBattery}
                    onChange={(e) => setSelectedBattery(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="high">High (70%+)</option>
                    <option value="medium">Medium (30-70%)</option>
                    <option value="low">Low (&lt;30%)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          {viewMode === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Battery
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Maintenance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVehicles.map((vehicle) => {
                    const statusInfo = getStatusInfo(vehicle.status);
                    return (
                      <tr
                        key={vehicle.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleVehicleClick(vehicle)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                              <MdDirectionsCar className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {vehicle.licensePlate}
                              </div>
                              <div className="text-sm text-gray-500">
                                {vehicle.brand} {vehicle.model}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 capitalize">
                            {vehicle.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit ${statusInfo.color}`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${statusInfo.dotColor}`}
                            ></div>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getBatteryIcon(vehicle.batteryLevel)}
                            <span className="text-sm text-gray-900">
                              {vehicle.batteryLevel}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center">
                            <MdLocationOn className="w-4 h-4 text-gray-400 mr-1" />
                            {vehicle.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {vehicle.lastMaintenance}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVehicleClick(vehicle);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <MdMore className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVehicles.map((vehicle) => {
                const statusInfo = getStatusInfo(vehicle.status);
                return (
                  <div
                    key={vehicle.id}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                    onClick={() => handleVehicleClick(vehicle)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                        <MdDirectionsCar className="w-8 h-8 text-gray-600" />
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1">
                      {vehicle.licensePlate}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {vehicle.brand} {vehicle.model}
                    </p>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 capitalize">
                        {vehicle.type}
                      </span>
                      <div className="flex items-center space-x-1">
                        {getBatteryIcon(vehicle.batteryLevel)}
                        <span className="text-sm font-medium">
                          {vehicle.batteryLevel}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center text-xs text-gray-500">
                      <MdLocationOn className="w-3 h-3 mr-1" />
                      <span className="truncate">{vehicle.location}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredVehicles.length === 0 && (
            <div className="text-center py-12">
              <MdDirectionsCar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No vehicles found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Detail Modal */}
      {isDetailModalOpen && selectedVehicle && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Vehicle Details - {selectedVehicle.licensePlate}
              </h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MdDirectionsCar className="w-5 h-5 mr-2" />
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      License Plate
                    </label>
                    <p className="text-gray-900">
                      {selectedVehicle.licensePlate}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Brand & Model
                    </label>
                    <p className="text-gray-900">
                      {selectedVehicle.brand} {selectedVehicle.model}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Type
                    </label>
                    <p className="text-gray-900 capitalize">
                      {selectedVehicle.type}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Status
                    </label>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        getStatusInfo(selectedVehicle.status).color
                      }`}
                    >
                      {getStatusInfo(selectedVehicle.status).label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Current Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Battery Level
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getBatteryIcon(selectedVehicle.batteryLevel)}
                      <span className="text-gray-900 font-semibold">
                        {selectedVehicle.batteryLevel}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Location
                    </label>
                    <p className="text-gray-900 flex items-center mt-1">
                      <MdLocationOn className="w-4 h-4 mr-1" />
                      {selectedVehicle.location}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MdCalendarToday className="w-5 h-5 mr-2" />
                  Maintenance & History
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Last Maintenance
                    </label>
                    <p className="text-gray-900">
                      {selectedVehicle.lastMaintenance}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Total Rentals
                    </label>
                    <p className="text-gray-900">
                      {selectedVehicle.rentalHistory} times
                    </p>
                  </div>
                </div>
              </div>

              {selectedVehicle.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Notes
                  </h3>
                  <p className="text-gray-700">{selectedVehicle.notes}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  {selectedVehicle.status === "available" && (
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                      <MdAssignment className="w-4 h-4" />
                      <span>Assign to Customer</span>
                    </button>
                  )}
                  <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2">
                    <MdBuild className="w-4 h-4" />
                    <span>Send to Maintenance</span>
                  </button>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
                    <MdPriorityHigh className="w-4 h-4" />
                    <span>Mark Priority</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesStaff;
