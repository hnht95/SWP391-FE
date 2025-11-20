import React from "react";

interface ReportStatsCardsProps {
  statusFilter: "all" | "approved" | "pending" | "rejected" | "mine";
  setStatusFilter: (
    filter: "all" | "approved" | "pending" | "rejected" | "mine"
  ) => void;
  statusCounts: {
    all: number;
    approved: number;
    pending: number;
    rejected: number;
    mine: number;
  };
}

const ReportStatsCards: React.FC<ReportStatsCardsProps> = ({
  statusFilter,
  setStatusFilter,
  statusCounts,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-gray-200">
      {(
        [
          { value: "all", label: "All", count: statusCounts.all },
          {
            value: "approved",
            label: "Approved",
            count: statusCounts.approved,
          },
          {
            value: "pending",
            label: "Pending",
            count: statusCounts.pending,
          },
          {
            value: "rejected",
            label: "Rejected",
            count: statusCounts.rejected,
          },
          {
            value: "mine",
            label: "My Requests",
            count: statusCounts.mine,
          },
        ] as Array<{
          value: "all" | "approved" | "pending" | "rejected" | "mine";
          label: string;
          count: number;
        }>
      ).map((tab) => (
        <button
          key={tab.value}
          onClick={() => setStatusFilter(tab.value)}
          className={`${
            statusFilter === tab.value
              ? "border-black text-black"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-semibold transition-colors relative`}
        >
          <span>{tab.label}</span>
          <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ReportStatsCards;
