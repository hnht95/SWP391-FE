import React, { useState } from "react";
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
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vehicle Maintenance
            </h1>
            <p className="text-gray-600">
              Manage vehicle maintenance requests and track repair status
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2"
          >
            <MdAdd className="w-5 h-5" />
            <span>Submit Maintenance Request</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MdDirectionsCar className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.total}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-2">Total Requests</h3>
          <p className="text-xs text-gray-500">All maintenance requests</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <MdBuild className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.maintenance}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-2">Under Maintenance</h3>
          <p className="text-xs text-gray-500">Currently being repaired</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MdCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.completed}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-2">Completed</h3>
          <p className="text-xs text-gray-500">Maintenance completed</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Maintenance Records
            </h3>
            <div className="flex items-center space-x-2">
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeFilter === "all"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setActiveFilter("maintenance")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeFilter === "maintenance"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Under Maintenance ({stats.maintenance})
                </button>
                <button
                  onClick={() => setActiveFilter("completed")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeFilter === "completed"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Completed ({stats.completed})
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  License Plate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Images
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleRecordClick(record)}
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
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit ${
                        record.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
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
                    </span>
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRecordClick(record);
                      }}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <MdVisibility className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full h-[90%]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Submit Maintenance Request
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6 h-[calc(100%_-_76.8px)] overflow-y-auto"
            >
              <div>
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
              </div>

              <div>
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
              </div>

              {selectedBrand && (
                <div>
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
                </div>
              )}

              <div>
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
              </div>

              <div>
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
                  <label
                    htmlFor="image-upload"
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    Choose Images
                  </label>
                </div>

                {damageImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {damageImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Damage ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <MdDelete className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Maintenance Details - {selectedRecord.id}
              </h2>
              <button
                onClick={closeDetailModal}
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
                    <p className="text-gray-900">{selectedRecord.brand}</p>
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
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MdCalendarToday className="w-5 h-5 mr-2" />
                  Timeline
                </h3>
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
                      {selectedRecord.completedDate || "Not completed yet"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MdInfo className="w-5 h-5 mr-2" />
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedRecord.description}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MdImage className="w-5 h-5 mr-2" />
                  Damage Images ({selectedRecord.images})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: selectedRecord.images }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="bg-gray-200 rounded-lg h-24 flex items-center justify-center"
                      >
                        <MdImage className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-500 ml-2">
                          Image {index + 1}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                onClick={closeDetailModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              {selectedRecord.status === "pending" && (
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Mark as Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleMaintain;
