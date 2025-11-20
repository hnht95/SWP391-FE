import React from "react";
import type { Ticket, StationRequestItem } from "./types";

interface ReportTableProps {
  items: Ticket[];
  rawRequests: StationRequestItem[];
  onViewDetail: (ticket: Ticket) => void;
  activeSection: "maintenance" | "deletion";
}

const ReportTable: React.FC<ReportTableProps> = ({
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
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Report ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Vehicle
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Requested By
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Request Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {items.map((ticket) => {
            const badge = getStatusBadge(ticket);
            const typeLabel =
              activeSection === "maintenance"
                ? "Maintenance Request"
                : "Deletion Request";
            const raw = rawRequests.find((r) => r._id === ticket.id);

            return (
              <tr
                key={ticket.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    RPT-{ticket.id.slice(-6).toUpperCase()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{typeLabel}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {ticket.vehicle
                      ? `${ticket.vehicle.model} - ${ticket.vehicle.licensePlate}`
                      : "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {ticket.customer.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {raw?.createdAt
                      ? new Date(raw.createdAt).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "Invalid Date"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onViewDetail(ticket)}
                    className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
                  >
                    View details
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
