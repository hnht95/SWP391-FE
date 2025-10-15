import React, { useState } from "react";
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  const recentHandoversSample: Handover[] = [
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
  ];

  const [handovers, setHandovers] = useState<Handover[]>(recentHandoversSample);
  const [createForm, setCreateForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    vehicleId: "",
    vehicleName: "",
    color: "",
    pickupDate: "",
    returnDate: "",
    pickupLocation: "",
    returnLocation: "",
    preStatus: "",
    deposit: 0,
    pricePerDay: 0,
  });

  const openCreateModal = () => setIsCreateOpen(true);
  const closeCreateModal = () => setIsCreateOpen(false);

  // Sample vehicles list for selection (replace with API data when available)
  const sampleVehicles = [
    { id: "V001", name: "Toyota Camry - ABC123", pricePerDay: 90 },
    { id: "V002", name: "Honda Civic - XYZ789", pricePerDay: 80 },
    { id: "V003", name: "BMW X5 - BMW456", pricePerDay: 120 },
  ];

  const calculateTotal = (pickup: string, ret: string, pricePerDay: number) => {
    if (!pickup || !ret) return 0;
    const p = new Date(pickup);
    const r = new Date(ret);
    const diffMs = r.getTime() - p.getTime();
    const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    return days * pricePerDay;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `HO${Math.floor(1000 + Math.random() * 9000)}`;
    const total = calculateTotal(
      createForm.pickupDate,
      createForm.returnDate,
      createForm.pricePerDay
    );
    const newHandover: Handover = {
      id,
      customerName: createForm.customerName,
      vehicle: `${createForm.vehicleName} ${
        createForm.color ? `- ${createForm.color}` : ""
      }`,
      pickupDate: createForm.pickupDate.split("T")[0],
      returnDate: createForm.returnDate.split("T")[0],
      status: "complete",
      totalAmount: `$${total}`,
      customerPhone: createForm.customerPhone,
      customerEmail: createForm.customerEmail,
      pickupLocation: createForm.pickupLocation,
      returnLocation: createForm.returnLocation,
      notes: `Pre-status: ${createForm.preStatus} | Deposit: $${createForm.deposit}`,
    };
    setHandovers((s) => [newHandover, ...s]);
    setCreateForm({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      vehicleId: "",
      vehicleName: "",
      color: "",
      pickupDate: "",
      returnDate: "",
      pickupLocation: "",
      returnLocation: "",
      preStatus: "",
      deposit: 0,
      pricePerDay: 0,
    });
    closeCreateModal();
  };

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
            onClick={openCreateModal}
            className="bg-gray-900 cursor-pointer text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2"
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
              {handovers.map((handover, index) => (
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
                        {/* Create Handover Modal */}
                        <AnimatePresence>
                          {isCreateOpen && (
                            <motion.div
                              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <motion.div
                                className="bg-white rounded-xl max-w-3xl w-full p-6 overflow-y-auto"
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <h2 className="text-xl font-semibold">
                                    Create Vehicle Handover
                                  </h2>
                                  <button
                                    onClick={closeCreateModal}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    Close
                                  </button>
                                </div>

                                <form
                                  onSubmit={handleCreateSubmit}
                                  className="space-y-4"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">
                                        Select Vehicle
                                      </label>
                                      <select
                                        className="w-full mt-1 border rounded px-3 py-2"
                                        value={createForm.vehicleId}
                                        onChange={(e) => {
                                          const v = sampleVehicles.find(
                                            (s) => s.id === e.target.value
                                          );
                                          setCreateForm((s) => ({
                                            ...s,
                                            vehicleId: e.target.value,
                                            vehicleName: v?.name || "",
                                            pricePerDay: v?.pricePerDay || 0,
                                          }));
                                        }}
                                      >
                                        <option value="">
                                          -- Select vehicle --
                                        </option>
                                        {sampleVehicles.map((v) => (
                                          <option key={v.id} value={v.id}>
                                            {v.name} - ${v.pricePerDay}/day
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium text-gray-600">
                                        Color
                                      </label>
                                      <input
                                        className="w-full mt-1 border rounded px-3 py-2"
                                        value={createForm.color}
                                        onChange={(e) =>
                                          setCreateForm((s) => ({
                                            ...s,
                                            color: e.target.value,
                                          }))
                                        }
                                        placeholder="e.g. Red"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">
                                        Pickup Date & Time
                                      </label>
                                      <input
                                        type="datetime-local"
                                        className="w-full mt-1 border rounded px-3 py-2"
                                        value={createForm.pickupDate}
                                        onChange={(e) =>
                                          setCreateForm((s) => ({
                                            ...s,
                                            pickupDate: e.target.value,
                                          }))
                                        }
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">
                                        Return Date & Time
                                      </label>
                                      <input
                                        type="datetime-local"
                                        className="w-full mt-1 border rounded px-3 py-2"
                                        value={createForm.returnDate}
                                        onChange={(e) =>
                                          setCreateForm((s) => ({
                                            ...s,
                                            returnDate: e.target.value,
                                          }))
                                        }
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">
                                        Customer Name
                                      </label>
                                      <input
                                        className="w-full mt-1 border rounded px-3 py-2"
                                        value={createForm.customerName}
                                        onChange={(e) =>
                                          setCreateForm((s) => ({
                                            ...s,
                                            customerName: e.target.value,
                                          }))
                                        }
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">
                                        Customer Phone
                                      </label>
                                      <input
                                        className="w-full mt-1 border rounded px-3 py-2"
                                        value={createForm.customerPhone}
                                        onChange={(e) =>
                                          setCreateForm((s) => ({
                                            ...s,
                                            customerPhone: e.target.value,
                                          }))
                                        }
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium text-gray-600">
                                      Customer Email
                                    </label>
                                    <input
                                      className="w-full mt-1 border rounded px-3 py-2"
                                      value={createForm.customerEmail}
                                      onChange={(e) =>
                                        setCreateForm((s) => ({
                                          ...s,
                                          customerEmail: e.target.value,
                                        }))
                                      }
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">
                                        Deposit ($)
                                      </label>
                                      <input
                                        type="number"
                                        className="w-full mt-1 border rounded px-3 py-2"
                                        value={createForm.deposit}
                                        onChange={(e) =>
                                          setCreateForm((s) => ({
                                            ...s,
                                            deposit: Number(e.target.value),
                                          }))
                                        }
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">
                                        Pre-rental Status
                                      </label>
                                      <input
                                        className="w-full mt-1 border rounded px-3 py-2"
                                        value={createForm.preStatus}
                                        onChange={(e) =>
                                          setCreateForm((s) => ({
                                            ...s,
                                            preStatus: e.target.value,
                                          }))
                                        }
                                        placeholder="e.g. scratches, battery 80%"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">
                                        Price Per Day ($)
                                      </label>
                                      <input
                                        type="number"
                                        className="w-full mt-1 border rounded px-3 py-2"
                                        value={createForm.pricePerDay}
                                        onChange={(e) =>
                                          setCreateForm((s) => ({
                                            ...s,
                                            pricePerDay: Number(e.target.value),
                                          }))
                                        }
                                      />
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm text-gray-600">
                                        Total Estimated
                                      </p>
                                      <p className="text-xl font-bold">
                                        $
                                        {calculateTotal(
                                          createForm.pickupDate,
                                          createForm.returnDate,
                                          createForm.pricePerDay
                                        )}
                                      </p>
                                    </div>
                                    <div className="space-x-2">
                                      <button
                                        type="button"
                                        onClick={closeCreateModal}
                                        className="px-4 py-2 border rounded"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded"
                                      >
                                        Create
                                      </button>
                                    </div>
                                  </div>
                                </form>
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
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
