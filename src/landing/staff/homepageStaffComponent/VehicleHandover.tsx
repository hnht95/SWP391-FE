import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdAdd,
  MdDirectionsCar,
  MdBuild,
  MdAssignment,
  MdVisibility,
  MdClose,
  MdCalendarToday,
  MdPerson,
  MdLocationOn,
  MdPhone,
  MdEmail,
} from "react-icons/md";

const VehicleHandover = () => {
  const [selectedHandover, setSelectedHandover] = useState<Handover | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const vehicleStats = {
    available: 25,
    maintenance: 8,
    rented: 40,
  };

  interface Handover {
    id: string;
    customerName: string;
    vehicle: string;
    pickupDate: string;
    returnDate: string;
    status: "complete" | "cancel";
    totalAmount: string;
    customerPhone: string;
    customerEmail: string;
    pickupLocation: string;
    returnLocation: string;
    notes: string;
  }

  const recentHandovers: Handover[] = [
    {
      id: "HO001",
      customerName: "John Doe",
      vehicle: "Toyota Camry - ABC123",
      pickupDate: "2024-12-15",
      returnDate: "2024-12-20",
      status: "complete",
      totalAmount: "$450",
      customerPhone: "+1 234 567 8900",
      customerEmail: "john.doe@email.com",
      pickupLocation: "Station A - District 1",
      returnLocation: "Station A - District 1",
      notes: "Vehicle in excellent condition",
    },
    {
      id: "HO002",
      customerName: "Jane Smith",
      vehicle: "Honda Civic - XYZ789",
      pickupDate: "2024-12-14",
      returnDate: "2024-12-19",
      status: "complete",
      totalAmount: "$380",
      customerPhone: "+1 234 567 8901",
      customerEmail: "jane.smith@email.com",
      pickupLocation: "Station B - District 3",
      returnLocation: "Station B - District 3",
      notes: "Minor scratch on left door",
    },
    {
      id: "HO003",
      customerName: "Michael Brown",
      vehicle: "BMW X5 - BMW456",
      pickupDate: "2024-12-13",
      returnDate: "2024-12-18",
      status: "cancel",
      totalAmount: "$0",
      customerPhone: "+1 234 567 8902",
      customerEmail: "michael.brown@email.com",
      pickupLocation: "Central Hub - Downtown",
      returnLocation: "Central Hub - Downtown",
      notes: "Customer cancelled due to emergency",
    },
    {
      id: "HO004",
      customerName: "Emily Davis",
      vehicle: "Audi A4 - AUD789",
      pickupDate: "2024-12-12",
      returnDate: "2024-12-17",
      status: "complete",
      totalAmount: "$520",
      customerPhone: "+1 234 567 8903",
      customerEmail: "emily.davis@email.com",
      pickupLocation: "Tan Son Nhat Branch",
      returnLocation: "Tan Son Nhat Branch",
      notes: "Perfect condition return",
    },
  ];

  const handleHandoverClick = (handover: Handover) => {
    setSelectedHandover(handover);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedHandover(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <MdDirectionsCar className="w-8 h-8 mr-3 text-blue-600" />
              Vehicle Handover
            </h1>
            <p className="text-gray-600">
              Manage vehicle handovers and track rental status
            </p>
          </div>
          <motion.button
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MdAdd className="w-5 h-5" />
            <span>Create Vehicle Handover</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {[
          {
            title: "Available Vehicles",
            value: vehicleStats.available,
            icon: MdDirectionsCar,
            color: "green",
            subtitle: "Ready for rental",
            progress: 75,
          },
          {
            title: "Under Maintenance",
            value: vehicleStats.maintenance,
            icon: MdBuild,
            color: "yellow",
            subtitle: "Maintenance in progress",
            progress: 25,
          },
          {
            title: "Currently Rented",
            value: vehicleStats.rented,
            icon: MdAssignment,
            color: "blue",
            subtitle: "On rental",
            progress: 80,
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{
              y: -5,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <motion.div
                className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}
                whileHover={{ rotate: 5 }}
              >
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </motion.div>
              <motion.span
                className="text-2xl font-bold text-gray-900"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
              >
                {stat.value}
              </motion.span>
            </div>
            <h3 className="text-gray-600 text-sm mb-2">{stat.title}</h3>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <motion.div
                className={`bg-${stat.color}-500 h-2 rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${stat.progress}%` }}
                transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
              />
            </div>
            <p className="text-xs text-gray-500">{stat.subtitle}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Handovers Table */}
      <motion.div
        className="bg-white rounded-xl border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="p-6 border-b border-gray-100">
          <motion.h3
            className="text-lg font-semibold text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Recent Handovers
          </motion.h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Handover ID",
                  "Customer Name",
                  "Vehicle",
                  "Pickup Date",
                  "Return Date",
                  "Status",
                  "Action",
                ].map((header, index) => (
                  <motion.th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                  >
                    {header}
                  </motion.th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentHandovers.map((handover, index) => (
                <motion.tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <motion.button
                      onClick={() => handleHandoverClick(handover)}
                      className="text-sm font-medium text-gray-900 hover:text-gray-700 underline"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {handover.id}
                    </motion.button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {handover.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {handover.vehicle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {handover.pickupDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {handover.returnDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <motion.span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        handover.status === "complete"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1 + index * 0.1 }}
                    >
                      {handover.status === "complete"
                        ? "Completed"
                        : "Cancelled"}
                    </motion.span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <motion.button
                      onClick={() => handleHandoverClick(handover)}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <MdVisibility className="w-5 h-5" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && selectedHandover && (
          <motion.div
            className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white h-[90%] rounded-xl max-w-2xl w-full overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              {/* Modal content remains the same but wrapped in motion.div for sections */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Handover Details - {selectedHandover.id}
                </h2>
                <motion.button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MdClose className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="p-6 space-y-6 h-[calc(100%_-_165.6px)] overflow-y-auto">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MdPerson className="w-5 h-5 mr-2" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Name
                      </label>
                      <p className="text-gray-900">
                        {selectedHandover.customerName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Phone
                      </label>
                      <p className="text-gray-900 flex items-center">
                        <MdPhone className="w-4 h-4 mr-1" />
                        {selectedHandover.customerPhone}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Email
                      </label>
                      <p className="text-gray-900 flex items-center">
                        <MdEmail className="w-4 h-4 mr-1" />
                        {selectedHandover.customerEmail}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MdDirectionsCar className="w-5 h-5 mr-2" />
                    Vehicle Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Vehicle
                      </label>
                      <p className="text-gray-900">
                        {selectedHandover.vehicle}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Total Amount
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {selectedHandover.totalAmount}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MdCalendarToday className="w-5 h-5 mr-2" />
                    Rental Period
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Pickup Date
                      </label>
                      <p className="text-gray-900">
                        {selectedHandover.pickupDate}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Return Date
                      </label>
                      <p className="text-gray-900">
                        {selectedHandover.returnDate}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Pickup Location
                      </label>
                      <p className="text-gray-900 flex items-center">
                        <MdLocationOn className="w-4 h-4 mr-1" />
                        {selectedHandover.pickupLocation}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Return Location
                      </label>
                      <p className="text-gray-900 flex items-center">
                        <MdLocationOn className="w-4 h-4 mr-1" />
                        {selectedHandover.returnLocation}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Status & Notes
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Status
                      </label>
                      <div className="mt-1">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            selectedHandover.status === "complete"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {selectedHandover.status === "complete"
                            ? "Completed"
                            : "Cancelled"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Notes
                      </label>
                      <p className="text-gray-900 mt-1">
                        {selectedHandover.notes}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehicleHandover;
