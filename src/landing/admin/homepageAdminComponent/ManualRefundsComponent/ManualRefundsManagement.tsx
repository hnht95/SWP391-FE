import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdClose,
  MdPerson,
  MdCalendarToday,
  MdAttachFile,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdAutorenew,
  MdDone,
  MdInfo,
  MdAttachMoney,
  MdEdit,
  MdUpload,
} from "react-icons/md";
import ListManualRefunds from "./ListManualRefunds";
import {
  getManualRefundById,
  updateManualRefund,
  formatCurrency,
  getRefundStatusColor,
  getRefundStatusLabel,
} from "../../../../service/apiAdmin/apiManualRefunds/API";
import type {
  ManualRefund,
  ManualRefundStatus,
} from "../../../../service/apiAdmin/apiManualRefunds/API";

const ManualRefundsManagement: React.FC = () => {
  const [selectedRefund, setSelectedRefund] = useState<ManualRefund | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [status, setStatus] = useState<ManualRefundStatus>("pending");
  const [note, setNote] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      if (selectedRefund) {
        setStatus(selectedRefund.status);
        setNote(selectedRefund.note || "");
        setAttachments([]);
      }
    } else {
      document.body.style.overflow = "unset";
      setStatus("pending");
      setNote("");
      setAttachments([]);
      setError(null);
      setSuccessMessage(null);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen, selectedRefund]);

  const handleSelectRefund = async (refund: ManualRefund) => {
    // Show modal immediately with data from list
    setSelectedRefund(refund);
    setIsModalOpen(true);
    setError(null);
    setIsLoadingDetail(true);
    
    // Fetch detailed data in background
    try {
      const response = await getManualRefundById(refund._id);
      if (response.success && response.data) {
        setSelectedRefund(response.data);
      } else {
        setError("Failed to load refund details");
      }
    } catch (err: any) {
      console.error("Error loading refund details:", err);
      setError(err?.message || "Failed to load refund details");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRefund(null);
  };

  const handleUpdate = async () => {
    if (!selectedRefund) return;

    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await updateManualRefund(selectedRefund._id, {
        status,
        note: note.trim() || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      if (response.success) {
        setSuccessMessage("Manual refund updated successfully");
        setTimeout(() => {
          handleCloseModal();
          window.location.reload();
        }, 1500);
      } else {
        setError(response.message || "Cannot update refund");
      }
    } catch (err: any) {
      console.error("Error updating manual refund:", err);
      setError(err?.message || "An error occurred while updating the refund");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: ManualRefundStatus) => {
    switch (status) {
      case "pending":
        return <MdPending className="w-5 h-5" />;
      case "approved":
        return <MdCheckCircle className="w-5 h-5" />;
      case "rejected":
        return <MdCancel className="w-5 h-5" />;
      case "processing":
        return <MdAutorenew className="w-5 h-5" />;
      case "completed":
        return <MdDone className="w-5 h-5" />;
      case "cancelled":
        return <MdCancel className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  const getBookingId = (refund: ManualRefund): string => {
    return refund.booking?._id?.slice(-8) || "N/A";
  };

  const getStaffName = (refund: ManualRefund): string => {
    return refund.staff?.name || "N/A";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...filesArray]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="h-full">
        <ListManualRefunds onSelectRefund={handleSelectRefund} />
      </div>

      {/* Detail Modal */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && selectedRefund && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/50 z-[9999]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleCloseModal}
              />
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 20 }}
                  transition={{
                    type: "spring",
                    damping: 25,
                    stiffness: 300,
                    mass: 0.8,
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
                >
                  {/* Modal Header */}
                  <div className="sticky top-0 z-20 flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900/95">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-md">
                        <MdAttachMoney className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          Manual Refund Details
                        </h2>
                        <p className="text-sm text-gray-200">
                          ID: {selectedRefund._id.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full p-2 transition-all duration-200"
                    >
                      <MdClose className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="flex-1 overflow-y-auto p-6 min-h-0">
                    {/* Loading State */}
                    {isLoadingDetail && (
                      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 flex items-center gap-2">
                          <MdAutorenew className="w-4 h-4 animate-spin" />
                          Loading refund details...
                        </p>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="mb-6">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getRefundStatusColor(
                          selectedRefund.status
                        )}`}
                      >
                        {getStatusIcon(selectedRefund.status)}
                        {getRefundStatusLabel(selectedRefund.status)}
                      </span>
                    </div>

                    {/* Success/Error Messages */}
                    {successMessage && (
                      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">{successMessage}</p>
                      </div>
                    )}
                    {error && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    )}

                    <div className="space-y-6">
                      {/* Booking Information */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <MdCalendarToday className="w-5 h-5 text-blue-600" />
                          Booking Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Booking ID</p>
                            <p className="text-base font-medium text-gray-900">
                              {getBookingId(selectedRefund)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Booking Status</p>
                            <p className="text-base font-medium text-gray-900">
                              {selectedRefund.booking?.status || "N/A"}
                            </p>
                          </div>
                          {selectedRefund.booking?.amounts && (
                            <>
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Total Paid</p>
                                <p className="text-base font-medium text-gray-900">
                                  {formatCurrency(selectedRefund.booking.amounts.totalPaid || 0, "VND")}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Grand Total</p>
                                <p className="text-base font-medium text-gray-900">
                                  {formatCurrency(selectedRefund.booking.amounts.grandTotal || 0, "VND")}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Renter Information */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <MdPerson className="w-5 h-5 text-blue-600" />
                          Renter Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Name</p>
                            <p className="text-base font-medium text-gray-900">
                              {selectedRefund.renter?.name || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Email</p>
                            <p className="text-base font-medium text-gray-900">
                              {selectedRefund.renter?.email || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Phone</p>
                            <p className="text-base font-medium text-gray-900">
                              {selectedRefund.renter?.phone || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Refund Details */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <MdAttachMoney className="w-5 h-5 text-blue-600" />
                          Refund Details
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Refund Amount</p>
                            <p className="text-base font-semibold text-green-600">
                              {selectedRefund.amount ? formatCurrency(selectedRefund.amount, "VND") : "N/A"}
                            </p>
                          </div>
                          {selectedRefund.method && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Method</p>
                              <p className="text-base text-gray-700">
                                {selectedRefund.method}
                              </p>
                            </div>
                          )}
                          {selectedRefund.transferredAt && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Transferred At</p>
                              <p className="text-base text-gray-700">
                                {formatDate(selectedRefund.transferredAt)}
                              </p>
                            </div>
                          )}
                          {selectedRefund.reference && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Reference</p>
                              <p className="text-base text-gray-700">
                                {selectedRefund.reference}
                              </p>
                            </div>
                          )}
                          {selectedRefund.note && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Note</p>
                              <p className="text-base text-gray-700 whitespace-pre-wrap">
                                {selectedRefund.note}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Staff Information */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <MdInfo className="w-5 h-5 text-blue-600" />
                          Staff Information
                        </h3>
                        <div className="space-y-3">
                          {selectedRefund.staff && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Processed By</p>
                              <p className="text-base font-medium text-gray-900">
                                {getStaffName(selectedRefund)} ({selectedRefund.staff.email || "N/A"})
                              </p>
                            </div>
                          )}
                          {selectedRefund.beneficiary && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Beneficiary</p>
                              <p className="text-base font-medium text-gray-900">
                                {selectedRefund.beneficiary.accountName} - {selectedRefund.beneficiary.bankName} ({selectedRefund.beneficiary.accountNumber})
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Attachments */}
                      {selectedRefund.attachments && selectedRefund.attachments.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MdAttachFile className="w-5 h-5 text-blue-600" />
                            Attachments ({selectedRefund.attachments.length})
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {selectedRefund.attachments.map((attachmentUrl, index) => {
                              const isImage = attachmentUrl && (
                                attachmentUrl.endsWith('.jpg') ||
                                attachmentUrl.endsWith('.jpeg') ||
                                attachmentUrl.endsWith('.png') ||
                                attachmentUrl.endsWith('.gif') ||
                                attachmentUrl.endsWith('.webp')
                              );
                              
                              return (
                                <div
                                  key={index}
                                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
                                >
                                  {isImage ? (
                                    <img
                                      src={attachmentUrl}
                                      alt="Attachment"
                                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => window.open(attachmentUrl, "_blank")}
                                    />
                                  ) : (
                                    <a
                                      href={attachmentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-full h-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                                    >
                                      <MdAttachFile className="w-8 h-8 text-gray-600" />
                                    </a>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Update Form */}
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <MdEdit className="w-5 h-5 text-blue-600" />
                          Update Refund
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Status
                            </label>
                            <select
                              value={status}
                              onChange={(e) => setStatus(e.target.value as ManualRefundStatus)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              disabled={isProcessing}
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Note (optional)
                            </label>
                            <textarea
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              placeholder="Enter note..."
                              rows={3}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              disabled={isProcessing}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Additional Attachments (optional)
                            </label>
                            <div className="flex items-center gap-2">
                              <label className="flex-1 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                <MdUpload className="w-5 h-5 text-gray-600" />
                                <span className="text-sm text-gray-700">Choose Files</span>
                                <input
                                  type="file"
                                  multiple
                                  onChange={handleFileChange}
                                  className="hidden"
                                  disabled={isProcessing}
                                />
                              </label>
                            </div>
                            {attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {attachments.map((file, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between px-3 py-2 bg-white rounded border border-gray-200"
                                  >
                                    <span className="text-sm text-gray-700 truncate flex-1">
                                      {file.name}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeAttachment(index)}
                                      className="ml-2 text-red-600 hover:text-red-800"
                                      disabled={isProcessing}
                                    >
                                      <MdClose className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={handleUpdate}
                            disabled={isProcessing || status === selectedRefund.status && note === (selectedRefund.note || "") && attachments.length === 0}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                          >
                            <MdEdit className="w-5 h-5" />
                            {isProcessing ? "Processing..." : "Update Refund"}
                          </button>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 mb-1">Created At</p>
                            <p className="font-medium text-gray-900">
                              {formatDate(selectedRefund.createdAt)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Last Updated</p>
                            <p className="font-medium text-gray-900">
                              {formatDate(selectedRefund.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default ManualRefundsManagement;

