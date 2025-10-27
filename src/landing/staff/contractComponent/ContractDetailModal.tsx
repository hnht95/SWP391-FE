import React from "react";
import { MdClose, MdEdit, MdExtension, MdFileDownload } from "react-icons/md";
import type { Contract } from "../../../types/contracts";
import { getStatusBadge, getStatusText } from "./contractUtils";

interface ContractDetailModalProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
}

const ContractDetailModal: React.FC<ContractDetailModalProps> = ({
  contract,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !contract) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Contract Details - {contract.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Company Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Company Name
                </label>
                <p className="text-gray-900">{contract.companyName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Contact Person
                </label>
                <p className="text-gray-900">{contract.companyContact}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Email
                </label>
                <p className="text-gray-900">{contract.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Phone
                </label>
                <p className="text-gray-900">{contract.phone}</p>
              </div>
            </div>
          </div>

          {/* Contract Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Contract Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Start Date
                </label>
                <p className="text-gray-900">{contract.startDate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  End Date
                </label>
                <p className="text-gray-900">{contract.endDate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Status
                </label>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                    contract.status
                  )}`}
                >
                  {getStatusText(contract.status)}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Vehicle Count
                </label>
                <p className="text-gray-900">{contract.vehicleCount}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Monthly Fee
                </label>
                <p className="text-gray-900">
                  {contract.monthlyFee.toLocaleString()} VND
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Total Value
                </label>
                <p className="text-gray-900">
                  {contract.totalValue.toLocaleString()} VND
                </p>
              </div>
            </div>
          </div>

          {/* Vehicles List */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Vehicle List
            </h3>
            {contract.vehicles.length > 0 ? (
              <div className="space-y-3">
                {contract.vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="bg-white rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">
                        {vehicle.brand} {vehicle.model} ({vehicle.year})
                      </div>
                      <div className="text-sm text-gray-500">
                        License: {vehicle.licensePlate}
                      </div>
                    </div>
                    <div className="text-right">
                      {(() => {
                        const statusText =
                          typeof vehicle.status === "string"
                            ? vehicle.status
                            : typeof vehicle.status === "object" &&
                              vehicle.status !== null
                            ? vehicle.status.name ||
                              vehicle.status.status ||
                              "unknown"
                            : "unknown";

                        return (
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              statusText === "available"
                                ? "bg-green-100 text-green-800"
                                : statusText === "rented"
                                ? "bg-blue-100 text-blue-800"
                                : statusText === "maintenance"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {statusText}
                          </span>
                        );
                      })()}
                      <div className="text-xs text-gray-500 mt-1">
                        Next inspection: {vehicle.nextInspection || "N/A"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No vehicles listed</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <MdExtension className="w-4 h-4" />
                <span>Extend Contract</span>
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                <MdEdit className="w-4 h-4" />
                <span>Update Status</span>
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
                <MdFileDownload className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractDetailModal;
