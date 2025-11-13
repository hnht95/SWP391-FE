import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdClose,
  MdPerson,
  MdDirectionsCar,
  MdCalendarToday,
  MdDescription,
  MdImage,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdWarning,
  MdInfo,
  MdAttachMoney,
} from "react-icons/md";
import ListDamageReports from "./ListDamageReports";
import {
  approveDamageReport,
  rejectDamageReport,
  formatCurrency,
} from "../../../../service/apiBooking/API";
import type {
  DamageReport,
  DamageReportStatus,
} from "../../../../service/apiBooking/API";

const DamageReportsManagement: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [chargeAmount, setChargeAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      if (selectedReport) {
        setChargeAmount(
          selectedReport.adminAssessment?.chargeAmount?.toString() || ""
        );
        setNote(selectedReport.adminAssessment?.note || "");
      }
    } else {
      document.body.style.overflow = "unset";
      setChargeAmount("");
      setNote("");
      setError(null);
      setSuccessMessage(null);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen, selectedReport]);

  const handleSelectReport = (report: DamageReport) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  const handleApprove = async () => {
    if (!selectedReport) return;

    const amount = parseFloat(chargeAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await approveDamageReport(selectedReport._id, {
        chargeAmount: amount,
        note: note.trim() || undefined,
      });

      if (response.success) {
        setSuccessMessage("Damage report approved successfully");
        setTimeout(() => {
          handleCloseModal();
          // Refresh the list by triggering a re-render
          window.location.reload();
        }, 1500);
      } else {
        setError(response.message || "Cannot approve report");
      }
    } catch (err: any) {
      console.error("Error approving damage report:", err);
      setError(err?.message || "An error occurred while approving the report");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReport) return;

    if (!window.confirm("Are you sure you want to reject this report? (Free)")) {
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await rejectDamageReport(selectedReport._id);

      if (response.success) {
        setSuccessMessage("Damage report rejected successfully");
        setTimeout(() => {
          handleCloseModal();
          // Refresh the list by triggering a re-render
          window.location.reload();
        }, 1500);
      } else {
        setError(response.message || "Cannot reject report");
      }
    } catch (err: any) {
      console.error("Error rejecting damage report:", err);
      setError(err?.message || "An error occurred while rejecting the report");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: DamageReportStatus): string => {
    switch (status) {
      case "reported":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "charged":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: DamageReportStatus) => {
    switch (status) {
      case "reported":
        return <MdPending className="w-5 h-5" />;
      case "charged":
        return <MdCheckCircle className="w-5 h-5" />;
      case "rejected":
        return <MdCancel className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: DamageReportStatus): string => {
    switch (status) {
      case "reported":
        return "Reported";
      case "charged":
        return "Charged";
      case "rejected":
        return "Rejected";
      default:
        return status;
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

  const formatDateOnly = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getVehicleName = (report: DamageReport): string => {
    if (report.vehicle) {
      return `${report.vehicle.brand} ${report.vehicle.model}`;
    }
    return "No vehicle information";
  };

  const getPlateNumber = (report: DamageReport): string => {
    if (report.vehicle) {
      return report.vehicle.plateNumber;
    }
    return "N/A";
  };

  return (
    <>
      <div className="h-full">
        <ListDamageReports onSelectReport={handleSelectReport} />
      </div>

      {/* Detail Modal */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && selectedReport && (
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
                        <MdWarning className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          Damage Report Details
                        </h2>
                        <p className="text-sm text-gray-200">
                          ID: {selectedReport._id.slice(-8)}
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
                    {/* Status Badge */}
                    <div className="mb-6">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                          selectedReport.status
                        )}`}
                      >
                        {getStatusIcon(selectedReport.status)}
                        {getStatusLabel(selectedReport.status)}
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
                      {/* Vehicle Information */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <MdDirectionsCar className="w-5 h-5 text-blue-600" />
                          Vehicle Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Vehicle</p>
                            <p className="text-base font-medium text-gray-900">
                              {getVehicleName(selectedReport)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Plate Number</p>
                            <p className="text-base font-medium text-gray-900">
                              {getPlateNumber(selectedReport)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Booking Information */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <MdCalendarToday className="w-5 h-5 text-blue-600" />
                          Booking Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Start Time</p>
                            <p className="text-base font-medium text-gray-900">
                              {formatDate(selectedReport.booking.startTime)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">End Time</p>
                            <p className="text-base font-medium text-gray-900">
                              {formatDate(selectedReport.booking.endTime)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Booking Status</p>
                            <p className="text-base font-medium text-gray-900">
                              {selectedReport.booking.status}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Reporter Information */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <MdPerson className="w-5 h-5 text-blue-600" />
                          Reporter Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Name</p>
                            <p className="text-base font-medium text-gray-900">
                              {selectedReport.reportedBy.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Email</p>
                            <p className="text-base font-medium text-gray-900">
                              {selectedReport.reportedBy.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <MdDescription className="w-5 h-5 text-blue-600" />
                          Damage Description
                        </h3>
                        <p className="text-base text-gray-700 whitespace-pre-wrap">
                          {selectedReport.description || "No description"}
                        </p>
                      </div>

                      {/* Photos */}
                      {selectedReport.photos.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MdImage className="w-5 h-5 text-blue-600" />
                            Photos ({selectedReport.photos.length})
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {selectedReport.photos.map((photo) => (
                              <div
                                key={photo._id}
                                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
                              >
                                <img
                                  src={photo.url}
                                  alt="Damage photo"
                                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(photo.url, "_blank")}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Admin Assessment (if exists) */}
                      {selectedReport.adminAssessment && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MdInfo className="w-5 h-5 text-blue-600" />
                            Admin Assessment
                          </h3>
                          <div className="space-y-3">
                            {selectedReport.adminAssessment.admin && (
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Processed by Admin</p>
                                <p className="text-base font-medium text-gray-900">
                                  {selectedReport.adminAssessment.admin.name} (
                                  {selectedReport.adminAssessment.admin.email})
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Amount</p>
                              <p className="text-base font-semibold text-green-600">
                                {formatCurrency(
                                  selectedReport.adminAssessment.chargeAmount,
                                  "VND"
                                )}
                              </p>
                            </div>
                            {selectedReport.adminAssessment.decisionAt && (
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Decision Time</p>
                                <p className="text-base font-medium text-gray-900">
                                  {formatDate(selectedReport.adminAssessment.decisionAt)}
                                </p>
                              </div>
                            )}
                            {selectedReport.adminAssessment.note && (
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Note</p>
                                <p className="text-base text-gray-700">
                                  {selectedReport.adminAssessment.note}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Form (only for reported status) */}
                      {selectedReport.status === "reported" && (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MdAttachMoney className="w-5 h-5 text-blue-600" />
                            Process Report
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount to Charge (VND)
                              </label>
                              <input
                                type="number"
                                value={chargeAmount}
                                onChange={(e) => setChargeAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={isProcessing}
                              />
                              {selectedReport.adminAssessment?.chargeAmount && (
                                <p className="mt-1 text-xs text-gray-500">
                                  Suggested:{" "}
                                  {formatCurrency(
                                    selectedReport.adminAssessment.chargeAmount,
                                    "VND"
                                  )}
                                </p>
                              )}
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
                            <div className="flex gap-3">
                              <button
                                onClick={handleApprove}
                                disabled={isProcessing || !chargeAmount}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                              >
                                <MdCheckCircle className="w-5 h-5" />
                                {isProcessing ? "Processing..." : "Approve and Charge"}
                              </button>
                              <button
                                onClick={handleReject}
                                disabled={isProcessing}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                              >
                                <MdCancel className="w-5 h-5" />
                                {isProcessing ? "Processing..." : "Reject (Free)"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 mb-1">Created At</p>
                            <p className="font-medium text-gray-900">
                              {formatDate(selectedReport.createdAt)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Last Updated</p>
                            <p className="font-medium text-gray-900">
                              {formatDate(selectedReport.updatedAt)}
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

export default DamageReportsManagement;

