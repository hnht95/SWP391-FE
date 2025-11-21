import { motion, AnimatePresence } from "framer-motion";
import { MdClose } from "react-icons/md";
import type { Ticket, StationRequestItem } from "./types";
import MaintenanceRequestActions from "./MaintenanceRequestActions";
import DeletionRequestActions from "./DeletionRequestActions";

interface ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTicket: Ticket | null;
  selectedRawRequest: StationRequestItem | null;
  activeSection: "maintenance" | "deletion";
  myUserId: string | undefined;
  onActionComplete: () => void;
}

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  isOpen,
  onClose,
  selectedTicket,
  selectedRawRequest,
  activeSection,
  myUserId,
  onActionComplete,
}) => {
  if (!isOpen || !selectedTicket) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "New";
      case "in_progress":
        return "In Progress";
      case "resolved":
        return "Approved";
      case "closed":
        return "Rejected";
      default:
        return status;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {activeSection === "maintenance"
                  ? "Maintenance Request"
                  : "Deletion Request"}{" "}
                Details
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Report ID: RPT-{selectedTicket.id.slice(-6).toUpperCase()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <MdClose className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Request Information */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Request Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-gray-600 block mb-1">
                        Requested By
                      </span>
                      <div className="font-semibold text-gray-900">
                        {selectedTicket.customer.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {selectedTicket.customer.email}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600 block mb-1">
                        Status
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          selectedTicket.status
                        )}`}
                      >
                        {getStatusLabel(selectedTicket.status)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600 block mb-1">
                        Request Date
                      </span>
                      <div className="font-medium text-gray-900">
                        {selectedRawRequest?.createdAt
                          ? new Date(
                              selectedRawRequest.createdAt
                            ).toLocaleDateString("vi-VN", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })
                          : "Invalid Date"}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600 block mb-1">
                        Review Date
                      </span>
                      <div className="font-medium text-gray-900">
                        {selectedRawRequest?.updatedAt &&
                        selectedRawRequest.updatedAt !==
                          selectedRawRequest.createdAt
                          ? new Date(
                              selectedRawRequest.updatedAt
                            ).toLocaleDateString("vi-VN", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })
                          : "Invalid Date"}
                      </div>
                    </div>
                    {activeSection === "maintenance" && (
                      <div>
                        <span className="text-xs text-gray-600 block mb-1">
                          Urgency
                        </span>
                        <div className="font-medium text-gray-900 capitalize">
                          {(selectedRawRequest &&
                            (
                              selectedRawRequest as unknown as {
                                urgency?: string;
                              }
                            ).urgency) ||
                            "medium"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Description
                  </h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedRawRequest?.description ||
                      selectedRawRequest?.reportText ||
                      selectedTicket.description ||
                      "No description provided"}
                  </div>
                </div>

                {/* Evidence Photos */}
                {selectedRawRequest?.evidencePhotos?.length ? (
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Evidence Photos
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedRawRequest.evidencePhotos.map((ph) => (
                        <img
                          key={ph._id}
                          src={ph.url}
                          alt="evidence"
                          className="w-full h-40 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Right Column - Vehicle & Actions */}
              <div className="space-y-6">
                {/* Vehicle Information */}
                {selectedTicket.vehicle && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Vehicle Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-xs text-gray-600 block mb-1">
                          Model
                        </span>
                        <div className="font-semibold text-gray-900">
                          {selectedTicket.vehicle.model}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600 block mb-1">
                          License Plate
                        </span>
                        <div className="font-semibold text-gray-900">
                          {selectedTicket.vehicle.licensePlate}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedRawRequest &&
                  myUserId &&
                  (typeof selectedRawRequest.reportedBy === "string"
                    ? selectedRawRequest.reportedBy === myUserId
                    : selectedRawRequest.reportedBy?._id === myUserId) &&
                  selectedRawRequest.status === "pending" && (
                    <div className="bg-white rounded-xl p-5 border-2 border-gray-300">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Actions
                      </h3>
                      {activeSection === "maintenance" ? (
                        <MaintenanceRequestActions
                          requestId={selectedRawRequest._id}
                          currentUrgency={
                            (selectedRawRequest &&
                              (
                                selectedRawRequest as unknown as {
                                  urgency?: string;
                                }
                              ).urgency) ||
                            "medium"
                          }
                          currentDesc={
                            selectedRawRequest.description ||
                            selectedRawRequest.reportText ||
                            ""
                          }
                          onDone={onActionComplete}
                        />
                      ) : (
                        <DeletionRequestActions
                          requestId={selectedRawRequest._id}
                          currentDesc={
                            selectedRawRequest.description ||
                            selectedRawRequest.reportText ||
                            ""
                          }
                          onDone={onActionComplete}
                        />
                      )}
                    </div>
                  )}

                {/* Timeline */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-black rounded-full mt-1.5 flex-shrink-0"></div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          Request created
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {selectedTicket.createdAt}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReportDetailModal;
