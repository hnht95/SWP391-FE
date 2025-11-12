import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { 
  MdClose, 
  MdPerson, 
  MdDirectionsCar, 
  MdLocationOn, 
  MdPayment,
  MdAccessTime,
  MdInfo,
  MdCheckCircle,
  MdCancel,
  MdSchedule,
  MdLink
} from "react-icons/md";
import type { AdminTransactionItem } from "../../../../service/apiBooking/API";
import { formatCurrency } from "../../../../service/apiBooking/API";

interface DetailUserTransactionModalProps {
  transaction: AdminTransactionItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const DetailUserTransactionModal: React.FC<DetailUserTransactionModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!transaction || !isOpen) return null;

  const formatDate = (iso?: string) => {
    if (!iso) return "N/A";
    return new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "captured":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "reserved":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MdPayment className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Transaction Details
                    </h2>
                    <p className="text-sm text-gray-500">
                      Booking ID: {transaction.bookingId}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MdClose className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <MdPayment className="w-4 h-4 mr-2 text-gray-500" />
                        Deposit Status
                      </span>
                    </div>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        transaction.deposit?.status || "none"
                      )}`}
                    >
                      {transaction.deposit?.status || "None"}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <MdInfo className="w-4 h-4 mr-2 text-gray-500" />
                        Booking Status
                      </span>
                    </div>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getBookingStatusColor(
                        transaction.status
                      )}`}
                    >
                      {transaction.status.charAt(0).toUpperCase() +
                        transaction.status.slice(1)}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <MdPayment className="w-4 h-4 mr-2 text-gray-500" />
                        Total Paid
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(
                        transaction.amounts?.totalPaid || 0,
                        transaction.deposit?.currency || "VND"
                      )}
                    </div>
                  </div>
                </div>

                {/* Renter Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MdPerson className="w-5 h-5 mr-2 text-gray-700" />
                    Renter Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Name</p>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.renterInfo?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.renterInfo?.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.renterInfo?.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                {transaction.vehicleInfo ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <MdDirectionsCar className="w-5 h-5 mr-2 text-gray-700" />
                      Vehicle Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Brand</p>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.vehicleInfo.brand}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Model</p>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.vehicleInfo.model}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Plate Number
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.vehicleInfo.plateNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <MdDirectionsCar className="w-5 h-5 mr-2 text-gray-700" />
                      Vehicle Information
                    </h3>
                    <p className="text-sm text-gray-500">No vehicle information available</p>
                  </div>
                )}

                {/* Station Information */}
                {transaction.stationInfo ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <MdLocationOn className="w-5 h-5 mr-2 text-gray-700" />
                      Station Information
                    </h3>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Station Name</p>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.stationInfo.name}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <MdLocationOn className="w-5 h-5 mr-2 text-gray-700" />
                      Station Information
                    </h3>
                    <p className="text-sm text-gray-500">No station information available</p>
                  </div>
                )}

                {/* Deposit Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MdPayment className="w-5 h-5 mr-2 text-gray-700" />
                    Deposit Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Amount</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(
                          transaction.deposit?.amount || 0,
                          transaction.deposit?.currency || "VND"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          transaction.deposit?.status || "none"
                        )}`}
                      >
                        {transaction.deposit?.status || "None"}
                      </div>
                    </div>
                    {transaction.deposit?.providerRef && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Provider Reference
                        </p>
                        <p className="text-sm font-medium text-gray-900 break-all">
                          {transaction.deposit.providerRef}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* PayOS Information */}
                {transaction.deposit?.payos && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <MdLink className="w-5 h-5 mr-2 text-gray-700" />
                      PayOS Payment Details
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Order Code</p>
                          <p className="text-sm font-medium text-gray-900">
                            {transaction.deposit.payos.orderCode}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Payment Link ID
                          </p>
                          <p className="text-sm font-medium text-gray-900 break-all">
                            {transaction.deposit.payos.paymentLinkId}
                          </p>
                        </div>
                      </div>
                      {transaction.deposit.payos.paidAt && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1 flex items-center">
                            <MdCheckCircle className="w-4 h-4 mr-1 text-green-500" />
                            Paid At
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(transaction.deposit.payos.paidAt)}
                          </p>
                        </div>
                      )}
                      {transaction.deposit.payos.checkoutUrl && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">
                            Checkout URL
                          </p>
                          <a
                            href={transaction.deposit.payos.checkoutUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 break-all underline"
                          >
                            {transaction.deposit.payos.checkoutUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MdAccessTime className="w-5 h-5 mr-2 text-gray-700" />
                    Timestamps
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center">
                        <MdSchedule className="w-4 h-4 mr-1 text-gray-400" />
                        Created At
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center">
                        <MdSchedule className="w-4 h-4 mr-1 text-gray-400" />
                        Updated At
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(transaction.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default DetailUserTransactionModal;

