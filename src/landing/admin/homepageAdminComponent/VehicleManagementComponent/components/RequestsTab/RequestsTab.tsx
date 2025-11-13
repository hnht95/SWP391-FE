import React, { useState } from "react";
import { motion } from "framer-motion";
import { MdDeleteSweep } from "react-icons/md";
import { TbTransfer } from "react-icons/tb";
import { GrHostMaintenance } from "react-icons/gr";
import MaintenanceRequestRow from "./MaintenanceRequestRow";
import DeletionRequestRow from "./DeletionRequestRow";
import type { MaintenanceRequest, DeletionRequest } from "../../../../../../types/vehicle";

interface RequestsTabProps {
  maintenanceRequests: MaintenanceRequest[];
  deletionRequests: DeletionRequest[];
  transferLogs: any[];
  isLoading: boolean;
  onApproveMaintenance: (requestId: string) => Promise<void>;
  onRejectMaintenance: (requestId: string) => Promise<void>;
  onApproveDeletion: (requestId: string) => Promise<void>;
  onRejectDeletion: (requestId: string) => Promise<void>;
  onViewDeletionRequest?: (request: any) => void;
  onViewMaintenanceRequest?: (request: any) => void;
  pagination?: { page: number; totalPages: number };
  onPageChange?: (page: number) => void;
  getStationName?: (stationIdOrObject: any) => string;
}

const RequestsTab: React.FC<RequestsTabProps> = ({
  maintenanceRequests,
  deletionRequests,
  transferLogs,
  isLoading,
  onApproveMaintenance,
  onRejectMaintenance,
  onApproveDeletion,
  onRejectDeletion,
  onViewDeletionRequest,
  onViewMaintenanceRequest,
  pagination,
  onPageChange,
  getStationName,
}) => {
  const [activeTab, setActiveTab] = useState<"maintenance" | "deletion" | "transfers">("deletion");

  const tabs = [
    {
      id: "maintenance" as const,
      label: "Maintenance Requests",
      icon: GrHostMaintenance,
      count: maintenanceRequests.length,
      color: "orange",
    },
    {
      id: "deletion" as const,
      label: "Deletion Requests",
      icon: MdDeleteSweep,
      count: deletionRequests.length,
      color: "red",
    },
    {
      id: "transfers" as const,
      label: "Transfer History",
      icon: TbTransfer,
      count: transferLogs.length,
      color: "green",
    },
  ];

  const getTabColor = (color: string) => {
    switch (color) {
      case "orange":
        return {
          active: "bg-orange-100 text-orange-700 border-orange-200",
          inactive: "text-orange-600 hover:text-orange-700 hover:bg-orange-50",
        };
      case "red":
        return {
          active: "bg-red-100 text-red-700 border-red-200",
          inactive: "text-red-600 hover:text-red-700 hover:bg-red-50",
        };
      case "green":
        return {
          active: "bg-green-100 text-green-700 border-green-200",
          inactive: "text-green-600 hover:text-green-700 hover:bg-green-50",
        };
      default:
        return {
          active: "bg-gray-100 text-gray-700 border-gray-200",
          inactive: "text-gray-600 hover:text-gray-700 hover:bg-gray-50",
        };
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading requests...</span>
        </div>
      );
    }

    switch (activeTab) {
      case "maintenance":
        return (
          <div className="space-y-4">
            {maintenanceRequests.length === 0 ? (
              <div className="text-center py-12">
                <GrHostMaintenance className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No maintenance requests found</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vehicle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Station
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Urgency
                        </th>
                        
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reported By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
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
                      {maintenanceRequests.map((request) => (
                        <MaintenanceRequestRow
                          key={request._id}
                          request={request as any}
                          onApprove={() => onApproveMaintenance(request._id)}
                          onReject={() => onRejectMaintenance(request._id)}
                          getStationName={getStationName}
                          onView={(r) => onViewMaintenanceRequest?.(r)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* Pagination */}
            <div className="flex items-center justify-end py-3">
              {pagination && onPageChange && (
                <div className="flex items-center space-x-2">
                  <button
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-200 bg-white disabled:opacity-50"
                    disabled={pagination.page <= 1}
                    onClick={() => onPageChange?.(pagination!.page - 1)}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-200 bg-white disabled:opacity-50"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => onPageChange?.(pagination!.page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case "deletion":
        return (
          <div className="space-y-4">
            {deletionRequests.length === 0 ? (
              <div className="text-center py-12">
                <MdDeleteSweep className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No deletion requests found</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vehicle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Requested By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
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
                      {deletionRequests.map((request) => (
                        <DeletionRequestRow
                          key={request._id}
                          request={request}
                          onApprove={() => onApproveDeletion(request._id)}
                          onReject={() => onRejectDeletion(request._id)}
                          onView={(r) => onViewDeletionRequest?.(r)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      case "transfers":
        return (
          <div className="space-y-4">
            {transferLogs.length === 0 ? (
              <div className="text-center py-12">
                <TbTransfer className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No transfer logs found</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vehicle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          From Station
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          To Station
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transferred By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transferLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {log.vehicle.brand} {log.vehicle.model}
                              </div>
                              <div className="text-sm text-gray-500">
                                {log.vehicle.plateNumber}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.fromStation.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.toStation.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.transferredBy}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(log.transferDate).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              log.status === "completed" 
                                ? "bg-green-100 text-green-700" 
                                : log.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const colors = getTabColor(tab.color);
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? `border-current ${colors.active}`
                    : `border-transparent ${colors.inactive}`
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isActive 
                      ? "bg-white text-current" 
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
};

export default RequestsTab;
