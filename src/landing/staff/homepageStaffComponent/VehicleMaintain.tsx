import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdAdd,
  MdClose,
  MdBuild,
  MdDirectionsCar,
  MdCheckCircle,
  MdPending,
  MdCloudUpload,
  MdDelete,
  MdVisibility,
  MdImage,
  MdCalendarToday,
  MdInfo,
} from "react-icons/md";

interface MaintenanceRecord {
  id: string;
  vehicleName: string;
  licensePlate: string;
  brand: string;
  status: "pending" | "complete";
  submittedDate: string;
  completedDate: string | null;
  description: string;
  images: number;
}

const VehicleMaintain = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<MaintenanceRecord | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [damageImages, setDamageImages] = useState<File[]>([]);
  const [description, setDescription] = useState("");

  const vehicleBrands = [
    "Toyota",
    "Honda",
    "BMW",
    "Audi",
    "Mercedes",
    "Hyundai",
    "Kia",
    "Nissan",
    "Mazda",
    "Volkswagen",
  ];
  const availableVehicles: Record<string, string[]> = {
    Toyota: ["Camry - ABC123", "Corolla - DEF456", "RAV4 - GHI789"],
    Honda: ["Civic - JKL012", "Accord - MNO345", "CR-V - PQR678"],
    BMW: ["X5 - STU901", "3 Series - VWX234", "5 Series - YZA567"],
    Audi: ["A4 - BCD890", "Q7 - EFG123", "A6 - HIJ456"],
    Mercedes: ["C-Class - KLM789", "E-Class - NOP012", "GLC - QRS345"],
  };

  // Sample maintenance data
  const maintenanceRecords: MaintenanceRecord[] = [
    {
      id: "MT001",
      vehicleName: "Toyota Camry",
      licensePlate: "ABC123",
      brand: "Toyota",
      status: "pending",
      submittedDate: "2024-12-15",
      completedDate: null,
      description:
        "Engine oil leak detected during routine inspection. Oil is leaking from the valve cover gasket and needs immediate replacement. Additionally, brake pads are worn down to 2mm thickness and require replacement for safety. Customer reported strange noises when braking.",
      images: 3,
    },
    {
      id: "MT002",
      vehicleName: "Honda Civic",
      licensePlate: "JKL012",
      brand: "Honda",
      status: "complete",
      submittedDate: "2024-12-10",
      completedDate: "2024-12-14",
      description:
        "Completed regular 15,000km maintenance service including oil change, filter replacement, and tire rotation. All systems checked and functioning properly. Vehicle is ready for rental service.",
      images: 2,
    },
    {
      id: "MT003",
      vehicleName: "BMW X5",
      licensePlate: "STU901",
      brand: "BMW",
      status: "pending",
      submittedDate: "2024-12-12",
      completedDate: null,
      description:
        "Air conditioning system not cooling properly. Refrigerant levels are low and there may be a leak in the system. Compressor functionality needs to be tested. Customer complaints about poor cooling performance.",
      images: 4,
    },
    {
      id: "MT004",
      vehicleName: "Audi A4",
      licensePlate: "BCD890",
      brand: "Audi",
      status: "complete",
      submittedDate: "2024-12-08",
      completedDate: "2024-12-13",
      description:
        "Transmission service completed successfully. All transmission fluid replaced, filter changed, and system flushed. Transmission now operates smoothly across all gears. Quality control tests passed.",
      images: 1,
    },
  ];

  const filteredRecords = maintenanceRecords.filter((record) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "maintenance") return record.status === "pending";
    if (activeFilter === "completed") return record.status === "complete";
    return true;
  });

  const handleRecordClick = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setDamageImages([...damageImages, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setDamageImages(damageImages.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      brand: selectedBrand,
      vehicle: selectedVehicle,
      vehicleName,
      description,
      images: damageImages,
    });
    setSelectedBrand("");
    setSelectedVehicle("");
    setVehicleName("");
    setDescription("");
    setDamageImages([]);
    setIsModalOpen(false);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedRecord(null);
  };

  // Get stats
  const stats = {
    total: maintenanceRecords.length,
    maintenance: maintenanceRecords.filter((r) => r.status === "pending")
      .length,
    completed: maintenanceRecords.filter((r) => r.status === "complete").length,
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
              <MdBuild className="w-8 h-8 mr-3 text-yellow-600" />
              Vehicle Maintenance
            </h1>
            <p className="text-gray-600">
              Manage vehicle maintenance requests and track repair status
            </p>
          </div>
          <motion.button
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MdAdd className="w-5 h-5" />
            <span>Submit Maintenance Request</span>
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
            title: "Total Requests",
            value: stats.total,
            icon: MdDirectionsCar,
            color: "blue",
            subtitle: "All maintenance requests",
          },
          {
            title: "Under Maintenance",
            value: stats.maintenance,
            icon: MdBuild,
            color: "yellow",
            subtitle: "Currently being repaired",
          },
          {
            title: "Completed",
            value: stats.completed,
            icon: MdCheckCircle,
            color: "green",
            subtitle: "Maintenance completed",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            className="bg-white rounded-xl p-6 border border-gray-100"
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
            <p className="text-xs text-gray-500">{stat.subtitle}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Maintenance Records Table */}
      <motion.div
        className="bg-white rounded-xl border border-gray-100 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <motion.h3
              className="text-lg font-semibold text-gray-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Maintenance Records
            </motion.h3>
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex rounded-lg bg-gray-100 p-1">
                {[
                  { key: "all", label: `All (${stats.total})` },
                  {
                    key: "maintenance",
                    label: `Under Maintenance (${stats.maintenance})`,
                  },
                  { key: "completed", label: `Completed (${stats.completed})` },
                ].map((filter, index) => (
                  <motion.button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeFilter === filter.key
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                  >
                    {filter.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Request ID",
                  "Vehicle Name",
                  "License Plate",
                  "Status",
                  "Submitted Date",
                  "Completed Date",
                  "Images",
                  "Action",
                ].map((header, index) => (
                  <motion.th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + index * 0.05 }}
                  >
                    {header}
                  </motion.th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record, index) => (
                <motion.tr
                  key={record.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleRecordClick(record)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {record.vehicleName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {record.licensePlate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <motion.span
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit ${
                        record.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.4 + index * 0.1 }}
                    >
                      {record.status === "pending" ? (
                        <>
                          <MdPending className="w-3 h-3 mr-1" />
                          Pending
                        </>
                      ) : (
                        <>
                          <MdCheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </>
                      )}
                    </motion.span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {record.submittedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {record.completedDate || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {record.images} images
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRecordClick(record);
                      }}
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

      {/* Submit Maintenance Request Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl max-w-2xl w-full h-[90%]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Submit Maintenance Request
                </h2>
                <motion.button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MdClose className="w-6 h-6" />
                </motion.button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-6 h-[calc(100%_-_76.8px)] overflow-y-auto"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Brand *
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value);
                      setSelectedVehicle("");
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select vehicle brand</option>
                    {vehicleBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Name *
                  </label>
                  <input
                    type="text"
                    value={vehicleName}
                    onChange={(e) => setVehicleName(e.target.value)}
                    placeholder="Enter vehicle name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </motion.div>

                <AnimatePresence>
                  {selectedBrand && (
                    <motion.div
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: "auto" }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Vehicle *
                      </label>
                      <select
                        value={selectedVehicle}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select specific vehicle</option>
                        {availableVehicles[selectedBrand]?.map((vehicle) => (
                          <option key={vehicle} value={vehicle}>
                            {vehicle}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Damage Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the damage or maintenance needed..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Damage Images
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <MdCloudUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload images of vehicle damage
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <motion.label
                      htmlFor="image-upload"
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors inline-block"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Choose Images
                    </motion.label>
                  </div>

                  <AnimatePresence>
                    {damageImages.length > 0 && (
                      <motion.div
                        className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {damageImages.map((image, index) => (
                          <motion.div
                            key={index}
                            className="relative"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Damage ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <motion.button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <MdDelete className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                  <motion.button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Submit Request
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedRecord && (
          <motion.div
            className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Maintenance Details - {selectedRecord.id}
                </h2>
                <motion.button
                  onClick={closeDetailModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MdClose className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {[
                  {
                    title: "Vehicle Information",
                    icon: MdDirectionsCar,
                    content: (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Vehicle Name
                          </label>
                          <p className="text-gray-900">
                            {selectedRecord.vehicleName}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            License Plate
                          </label>
                          <p className="text-gray-900">
                            {selectedRecord.licensePlate}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Brand
                          </label>
                          <p className="text-gray-900">
                            {selectedRecord.brand}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Status
                          </label>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit ${
                              selectedRecord.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {selectedRecord.status === "pending" ? (
                              <>
                                <MdPending className="w-3 h-3 mr-1" />
                                Pending
                              </>
                            ) : (
                              <>
                                <MdCheckCircle className="w-3 h-3 mr-1" />
                                Complete
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "Timeline",
                    icon: MdCalendarToday,
                    content: (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Submitted Date
                          </label>
                          <p className="text-gray-900">
                            {selectedRecord.submittedDate}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Completed Date
                          </label>
                          <p className="text-gray-900">
                            {selectedRecord.completedDate ||
                              "Not completed yet"}
                          </p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "Description",
                    icon: MdInfo,
                    content: (
                      <p className="text-gray-700 leading-relaxed">
                        {selectedRecord.description}
                      </p>
                    ),
                  },
                  {
                    title: `Damage Images (${selectedRecord.images})`,
                    icon: MdImage,
                    content: (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Array.from({ length: selectedRecord.images }).map(
                          (_, index) => (
                            <motion.div
                              key={index}
                              className="bg-gray-200 rounded-lg h-24 flex items-center justify-center"
                              whileHover={{ scale: 1.05 }}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <MdImage className="w-8 h-8 text-gray-400" />
                              <span className="text-xs text-gray-500 ml-2">
                                Image {index + 1}
                              </span>
                            </motion.div>
                          )
                        )}
                      </div>
                    ),
                  },
                ].map((section, index) => (
                  <motion.div
                    key={section.title}
                    className="bg-gray-50 rounded-lg p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <section.icon className="w-5 h-5 mr-2" />
                      {section.title}
                    </h3>
                    {section.content}
                  </motion.div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
                <motion.button
                  onClick={closeDetailModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
                {selectedRecord.status === "pending" && (
                  <motion.button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Mark as Complete
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehicleMaintain;
