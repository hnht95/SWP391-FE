import React, { useState } from "react";
import { motion } from "framer-motion";
import { MdCheck, MdClose, MdDelete } from "react-icons/md";
import type { DeletionRequest } from "../../../../../../types/vehicle";

interface DeletionRequestRowProps {
  request: DeletionRequest;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
}

const DeletionRequestRow: React.FC<DeletionRequestRowProps> = ({
  request,
  onApprove,
  onReject,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const handleAction = async (actionType: "approve" | "reject") => {
    setIsLoading(true);
    setAction(actionType);
    
    try {
      if (actionType === "approve") {
        await onApprove();
      } else {
        await onReject();
      }
    } catch (error) {
      console.error(`Failed to ${actionType} deletion request:`, error);
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isActionDisabled = request.status !== "pending" || isLoading;

  return (
    <motion.tr
      className="hover:bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Vehicle */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <MdDelete className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {request.vehicle.brand} {request.vehicle.model}
            </div>
            <div className="text-sm text-gray-500">
              {request.vehicle.plateNumber}
            </div>
          </div>
        </div>
      </td>

      {/* Reason */}
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 max-w-xs truncate" title={request.reason}>
          {request.reason}
        </div>
      </td>

      {/* Requested By */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{request.requestedBy}</div>
      </td>

      {/* Date */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{formatDate(request.requestedAt)}</div>
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(request.status)}`}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: isActionDisabled ? 1 : 1.1 }}
            whileTap={{ scale: isActionDisabled ? 1 : 0.95 }}
            onClick={() => handleAction("approve")}
            disabled={isActionDisabled}
            className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              isActionDisabled
                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                : "text-green-700 bg-green-100 hover:bg-green-200"
            }`}
          >
            {isLoading && action === "approve" ? (
              <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <MdCheck className="w-3 h-3" />
            )}
            <span>Approve</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: isActionDisabled ? 1 : 1.1 }}
            whileTap={{ scale: isActionDisabled ? 1 : 0.95 }}
            onClick={() => handleAction("reject")}
            disabled={isActionDisabled}
            className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              isActionDisabled
                ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                : "text-red-700 bg-red-100 hover:bg-red-200"
            }`}
          >
            {isLoading && action === "reject" ? (
              <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <MdClose className="w-3 h-3" />
            )}
            <span>Reject</span>
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );
};

export default DeletionRequestRow;
