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
  MdAdd,
  MdDirectionsCar,
} from "react-icons/md";
import ListManualRefunds from "./ListManualRefunds";
import ListRefundCandidates from "./ListRefundCandidates";
import {
  getManualRefundById,
  updateManualRefund,
  createManualRefund,
  formatCurrency,
  getRefundStatusColor,
  getRefundStatusLabel,
} from "../../../../service/apiAdmin/apiManualRefunds/API";
import type {
  ManualRefund,
  ManualRefundStatus,
  ManualRefundCandidate,
} from "../../../../service/apiAdmin/apiManualRefunds/API";

const ManualRefundsManagement: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<"candidates" | "requests">("candidates");

  // Refund modal state
  const [selectedRefund, setSelectedRefund] = useState<ManualRefund | null>(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState<boolean>(false);
  const [isProcessingRefund, setIsProcessingRefund] = useState<boolean>(false);
  const [refundStatus, setRefundStatus] = useState<ManualRefundStatus>("pending");
  const [refundNote, setRefundNote] = useState<string>("");
  const [refundAttachments, setRefundAttachments] = useState<File[]>([]);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [refundSuccessMessage, setRefundSuccessMessage] = useState<string | null>(null);
  const [isLoadingRefundDetail, setIsLoadingRefundDetail] = useState<boolean>(false);

  // Candidate modal state
  const [selectedCandidate, setSelectedCandidate] = useState<ManualRefundCandidate | null>(null);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState<boolean>(false);
  const [isProcessingCandidate, setIsProcessingCandidate] = useState<boolean>(false);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState<string>("");
  const [candidateNote, setCandidateNote] = useState<string>("");
  const [candidateError, setCandidateError] = useState<string | null>(null);
  const [candidateSuccessMessage, setCandidateSuccessMessage] = useState<string | null>(null);

  // Reset refund modal state
  useEffect(() => {
    if (isRefundModalOpen) {
      document.body.style.overflow = "hidden";
      if (selectedRefund) {
        setRefundStatus(selectedRefund.status);
        setRefundNote(selectedRefund.note || "");
        setRefundAttachments([]);
      }
    } else {
      document.body.style.overflow = "unset";
      setRefundStatus("pending");
      setRefundNote("");
      setRefundAttachments([]);
      setRefundError(null);
      setRefundSuccessMessage(null);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isRefundModalOpen, selectedRefund]);

  // Reset candidate modal state
  useEffect(() => {
    if (isCandidateModalOpen) {
      document.body.style.overflow = "hidden";
      if (selectedCandidate) {
        setRefundAmount(selectedCandidate.refundableRemaining || 0);
        setRefundReason("");
        setCandidateNote("");
      }
    } else {
      document.body.style.overflow = "unset";
      setRefundAmount(0);
      setRefundReason("");
      setCandidateNote("");
      setCandidateError(null);
      setCandidateSuccessMessage(null);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCandidateModalOpen, selectedCandidate]);

  // Handle refund selection
  const handleSelectRefund = async (refund: ManualRefund) => {
    setSelectedRefund(refund);
    setIsRefundModalOpen(true);
    setRefundError(null);
    setIsLoadingRefundDetail(true);
    
    try {
      const response = await getManualRefundById(refund._id);
      if (response.success && response.data) {
        setSelectedRefund(response.data);
      } else {
        setRefundError("Failed to load refund details");
      }
    } catch (err: any) {
      console.error("Error loading refund details:", err);
      setRefundError(err?.message || "Failed to load refund details");
    } finally {
      setIsLoadingRefundDetail(false);
    }
  };

  // Handle candidate selection
  const handleSelectCandidate = (candidate: ManualRefundCandidate) => {
    setSelectedCandidate(candidate);
    setIsCandidateModalOpen(true);
    setRefundAmount(candidate.refundableRemaining || 0);
  };

  // Close refund modal
  const handleCloseRefundModal = () => {
    setIsRefundModalOpen(false);
    setSelectedRefund(null);
  };

  // Close candidate modal
  const handleCloseCandidateModal = () => {
    setIsCandidateModalOpen(false);
    setSelectedCandidate(null);
  };

  // Update refund
  const handleUpdateRefund = async () => {
    if (!selectedRefund) return;

    setIsProcessingRefund(true);
    setRefundError(null);
    setRefundSuccessMessage(null);

    try {
      const response = await updateManualRefund(selectedRefund._id, {
        status: refundStatus,
        note: refundNote.trim() || undefined,
        attachments: refundAttachments.length > 0 ? refundAttachments : undefined,
      });

      if (response.success) {
        setRefundSuccessMessage("Manual refund updated successfully");
        setTimeout(() => {
          handleCloseRefundModal();
          window.location.reload();
        }, 1500);
      } else {
        setRefundError(response.message || "Cannot update refund");
      }
    } catch (err: any) {
      console.error("Error updating manual refund:", err);
      setRefundError(err?.message || "An error occurred while updating the refund");
    } finally {
      setIsProcessingRefund(false);
    }
  };

  // Create refund from candidate
  const handleCreateRefund = async () => {
    if (!selectedCandidate) return;

    if (!refundReason.trim()) {
      setCandidateError("Reason is required");
      return;
    }

    if (refundAmount <= 0) {
      setCandidateError("Refund amount must be greater than 0");
      return;
    }

    setIsProcessingCandidate(true);
    setCandidateError(null);
    setCandidateSuccessMessage(null);

    try {
      const response = await createManualRefund({
        bookingId: selectedCandidate._id,
        amount: refundAmount,
        reason: refundReason.trim(),
        note: candidateNote.trim() || undefined,
      });

      if (response.success) {
        setCandidateSuccessMessage("Manual refund created successfully");
        setTimeout(() => {
          handleCloseCandidateModal();
          window.location.reload();
        }, 1500);
      } else {
        setCandidateError(response.message || "Cannot create refund");
      }
    } catch (err: any) {
      console.error("Error creating manual refund:", err);
      setCandidateError(err?.message || "An error occurred while creating the refund");
    } finally {
      setIsProcessingCandidate(false);
    }
  };

  const getStatusIcon = (status: ManualRefundStatus | string) => {
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
      case "done":
        return <MdDone className="w-5 h-5" />;
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

  const handleRefundFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setRefundAttachments((prev) => [...prev, ...filesArray]);
    }
  };

  const removeRefundAttachment = (index: number) => {
    setRefundAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const getVehicleInfo = (candidate: ManualRefundCandidate): string => {
    if (!candidate.vehicle) return "N/A";
    if (typeof candidate.vehicle === "string") return candidate.vehicle;
    const vehicle = candidate.vehicle;
    return `${vehicle.brand || ""} ${vehicle.model || ""} ${vehicle.plateNumber || ""}`.trim() || "N/A";
  };

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Tabs */}
        <div className="flex-shrink-0 mb-4 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("candidates")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "candidates"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Danh sách ứng viên
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "requests"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Yêu cầu refund
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0">
          {activeTab === "candidates" ? (
            <ListRefundCandidates onSelectCandidate={handleSelectCandidate} />
          ) : (
            <ListManualRefunds onSelectRefund={handleSelectRefund} />
          )}
        </div>
      </div>

      {/* Candidate Detail Modal (Create Refund) */}
      {createPortal(
        <AnimatePresence>
          {isCandidateModalOpen && selectedCandidate && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/50 z-[9999]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleCloseCandidateModal}
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
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center shadow-md">
                        <MdAdd className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          Create Manual Refund
                        </h2>
                        <p className="text-sm text-gray-200">
                          Booking ID: {selectedCandidate._id.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseCandidateModal}
                      className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full p-2 transition-all duration-200"
                    >
                      <MdClose className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="flex-1 overflow-y-auto p-6 min-h-0">
                    {/* Success/Error Messages */}
                    {candidateSuccessMessage && (
                      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">{candidateSuccessMessage}</p>
                      </div>
                    )}
                    {candidateError && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{candidateError}</p>
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
                              {selectedCandidate._id.slice(-8)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Status</p>
                            <p className="text-base font-medium text-gray-900">
                              {selectedCandidate.status || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Start Time</p>
                            <p className="text-base font-medium text-gray-900">
                              {formatDate(selectedCandidate.startTime)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">End Time</p>
                            <p className="text-base font-medium text-gray-900">
                              {formatDate(selectedCandidate.endTime)}
                            </p>
                          </div>
                          {selectedCandidate.amounts && (
                            <>
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Total Paid</p>
                                <p className="text-base font-medium text-gray-900">
                                  {formatCurrency(selectedCandidate.amounts.totalPaid || selectedCandidate.paid || 0, "VND")}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Refundable Amount</p>
                                <p className="text-base font-semibold text-green-600">
                                  {formatCurrency(selectedCandidate.refundableRemaining || 0, "VND")}
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
                              {selectedCandidate.renter?.name || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Email</p>
                            <p className="text-base font-medium text-gray-900">
                              {selectedCandidate.renter?.email || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Phone</p>
                            <p className="text-base font-medium text-gray-900">
                              {selectedCandidate.renter?.phone || "N/A"}
                            </p>
                          </div>
                          {selectedCandidate.renter?.bankInfo && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Bank Account</p>
                              <p className="text-base font-medium text-gray-900">
                                {selectedCandidate.renter.bankInfo.accountName || "N/A"} - {selectedCandidate.renter.bankInfo.bankName || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {selectedCandidate.renter.bankInfo.accountNumber || ""}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Vehicle Information */}
                      {selectedCandidate.vehicle && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MdDirectionsCar className="w-5 h-5 text-blue-600" />
                            Vehicle Information
                          </h3>
                          <div>
                            <p className="text-base font-medium text-gray-900">
                              {getVehicleInfo(selectedCandidate)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Create Refund Form */}
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <MdAdd className="w-5 h-5 text-blue-600" />
                          Create Refund Request
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Refund Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={refundAmount}
                              onChange={(e) => setRefundAmount(Number(e.target.value))}
                              min="0"
                              max={selectedCandidate.refundableRemaining || 0}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              disabled={isProcessingCandidate}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Maximum: {formatCurrency(selectedCandidate.refundableRemaining || 0, "VND")}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={refundReason}
                              onChange={(e) => setRefundReason(e.target.value)}
                              placeholder="Enter refund reason..."
                              rows={3}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              disabled={isProcessingCandidate}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Note (optional)
                            </label>
                            <textarea
                              value={candidateNote}
                              onChange={(e) => setCandidateNote(e.target.value)}
                              placeholder="Enter additional notes..."
                              rows={2}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              disabled={isProcessingCandidate}
                            />
                          </div>
                          <button
                            onClick={handleCreateRefund}
                            disabled={isProcessingCandidate || !refundReason.trim() || refundAmount <= 0}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                          >
                            <MdAdd className="w-5 h-5" />
                            {isProcessingCandidate ? "Creating..." : "Create Refund"}
                          </button>
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

      {/* Refund Detail Modal (Update Refund) */}
      {createPortal(
        <AnimatePresence>
          {isRefundModalOpen && selectedRefund && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/50 z-[9999]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleCloseRefundModal}
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
                      onClick={handleCloseRefundModal}
                      className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full p-2 transition-all duration-200"
                    >
                      <MdClose className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="flex-1 overflow-y-auto p-6 min-h-0">
                    {/* Loading State */}
                    {isLoadingRefundDetail && (
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
                    {refundSuccessMessage && (
                      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">{refundSuccessMessage}</p>
                      </div>
                    )}
                    {refundError && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{refundError}</p>
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
                              value={refundStatus}
                              onChange={(e) => setRefundStatus(e.target.value as ManualRefundStatus)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              disabled={isProcessingRefund}
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="done">Done</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Note (optional)
                            </label>
                            <textarea
                              value={refundNote}
                              onChange={(e) => setRefundNote(e.target.value)}
                              placeholder="Enter note..."
                              rows={3}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              disabled={isProcessingRefund}
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
                                  onChange={handleRefundFileChange}
                                  className="hidden"
                                  disabled={isProcessingRefund}
                                />
                              </label>
                            </div>
                            {refundAttachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {refundAttachments.map((file, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between px-3 py-2 bg-white rounded border border-gray-200"
                                  >
                                    <span className="text-sm text-gray-700 truncate flex-1">
                                      {file.name}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeRefundAttachment(index)}
                                      className="ml-2 text-red-600 hover:text-red-800"
                                      disabled={isProcessingRefund}
                                    >
                                      <MdClose className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={handleUpdateRefund}
                            disabled={isProcessingRefund || (refundStatus === selectedRefund.status && refundNote === (selectedRefund.note || "") && refundAttachments.length === 0)}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                          >
                            <MdEdit className="w-5 h-5" />
                            {isProcessingRefund ? "Processing..." : "Update Refund"}
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
