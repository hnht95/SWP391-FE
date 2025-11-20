import React from "react";
import { motion } from "framer-motion";
import { MdDirectionsCar, MdPerson } from "react-icons/md";
import type { StationRequestItem, Ticket } from "./types";

interface ReportGridProps {
  items: Ticket[];
  rawRequests: StationRequestItem[];
  onViewDetail: (ticket: Ticket) => void;
  activeSection: "maintenance" | "deletion";
}

const ReportGrid: React.FC<ReportGridProps> = ({
  items,
  rawRequests,
  onViewDetail,
  activeSection,
}) => {
  const getStatusBadge = (ticket: Ticket) => {
    const cat =
      ticket.status === "resolved"
        ? "approved"
        : ticket.status === "closed"
        ? "rejected"
        : "pending";

    const map = {
      approved: {
        color: "bg-green-100 text-green-800",
        label: "Approved",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Pending Review",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        label: "Rejected",
      },
    } as const;

    return map[cat];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.map((ticket, idx) => {
        const badge = getStatusBadge(ticket);
        const typeLabel =
          activeSection === "maintenance"
            ? "Maintenance Request"
            : "Deletion Request";
        const raw = rawRequests.find((r) => r._id === ticket.id);
        const previewUrl = raw?.evidencePhotos?.[0]?.url;

        return (
          <motion.div
            key={ticket.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.03 * idx }}
          >
            {/* Image Preview */}
            <div className="relative h-40 w-full bg-gray-100">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="evidence"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
                  <MdDirectionsCar className="w-12 h-12 text-gray-300" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}
                >
                  {badge.label}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Report ID</p>
                  <h3 className="font-semibold text-gray-900">
                    RPT-{ticket.id.slice(-6).toUpperCase()}
                  </h3>
                </div>
              </div>

              <div className="mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {typeLabel}
                </span>
              </div>

              {/* Vehicle Info */}
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MdDirectionsCar className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-xs text-gray-500 mr-1">Vehicle:</span>
                <span className="font-medium text-gray-900">
                  {ticket.vehicle ? ticket.vehicle.model : "N/A"}
                </span>
              </div>

              {/* Requester Info */}
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <MdPerson className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-xs text-gray-500 mr-1">
                  Requested by:
                </span>
                <span className="font-medium text-gray-900">
                  {ticket.customer.name}
                </span>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div>
                  <span className="text-gray-500">Request Date</span>
                  <div className="mt-1 px-2 py-1 border rounded bg-gray-50 text-gray-900 text-center">
                    {raw?.createdAt
                      ? new Date(raw.createdAt).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "Invalid Date"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Review Date</span>
                  <div className="mt-1 px-2 py-1 border rounded bg-gray-50 text-gray-900 text-center">
                    {raw?.updatedAt && raw.updatedAt !== raw.createdAt
                      ? new Date(raw.updatedAt).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "Invalid Date"}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-3">
                <span className="text-xs text-gray-500 block mb-1">Reason</span>
                <div className="px-3 py-2 border rounded bg-gray-50 text-sm text-gray-700 line-clamp-2">
                  {ticket.description || "No description"}
                </div>
              </div>

              {/* View Details Button */}
              <button
                onClick={() => onViewDetail(ticket)}
                className="w-full py-2 text-sm text-black border border-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                View details
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ReportGrid;
