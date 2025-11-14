import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MdDescription,
  MdCalendarToday,
  MdPerson,
  MdDirectionsCar,
  MdImage,
  MdCheckCircle,
  MdCancel,
  MdPending,
} from "react-icons/md";
import {
  getAllDamageReports,
  formatCurrency,
} from "../../../../service/apiBooking/API";
import type {
  DamageReport,
  DamageReportStatus,
  PaginatedDamageReportsResponse,
} from "../../../../service/apiBooking/API";

interface ListDamageReportsProps {
  onSelectReport: (report: DamageReport) => void;
}

const ListDamageReports: React.FC<ListDamageReportsProps> = ({
  onSelectReport,
}) => {
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<DamageReportStatus | "all">("all");
  const limit = 10;

  const fetchReports = useCallback(async (page: number, status?: DamageReportStatus) => {
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedDamageReportsResponse = await getAllDamageReports({
        page,
        limit,
        ...(status && status !== "all" ? { status } : {}),
      });
      
      if (response.success && response.data) {
        setReports(response.data.items || []);
        setTotalPages(response.data.totalPages || 1);
        setTotal(response.data.total || 0);
      } else {
        setReports([]);
        setTotalPages(1);
        setTotal(0);
      }
    } catch (err: any) {
      console.error("Error fetching damage reports:", err);
      setError(err?.message || "Failed to load damage reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchReports(currentPage, statusFilter !== "all" ? statusFilter : undefined);
  }, [currentPage, statusFilter, fetchReports]);

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
        return <MdPending className="w-4 h-4" />;
      case "charged":
        return <MdCheckCircle className="w-4 h-4" />;
      case "rejected":
        return <MdCancel className="w-4 h-4" />;
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

  const formatDateOnly = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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
    <div className="h-full flex flex-col min-h-0">
      {/* Header with Filter */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-sm lg:text-base font-semibold text-gray-900">
          Damage Reports List
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as DamageReportStatus | "all");
              setCurrentPage(1);
            }}
            className="text-xs lg:text-sm px-2 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="reported">Reported</option>
            <option value="charged">Charged</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading && reports.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-gray-500">Loading data...</div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-red-500">{error}</div>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-gray-500">No reports found</div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto space-y-2 lg:space-y-2.5 pr-1 lg:pr-2 min-h-0">
            {reports.map((report) => (
              <motion.div
                key={report._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onSelectReport(report)}
                className="bg-gray-50 rounded-lg lg:rounded-xl border border-gray-200 p-3 lg:p-4 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          report.status
                        )}`}
                      >
                        {getStatusIcon(report.status)}
                        {getStatusLabel(report.status)}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm lg:text-base mb-2">
                      {getVehicleName(report)}
                    </h4>
                    <div className="flex flex-col gap-1.5 text-xs lg:text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <MdDirectionsCar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">Plate: {getPlateNumber(report)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MdPerson className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">
                          Reported by: {report.reportedBy.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MdCalendarToday className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">
                          {formatDateOnly(report.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex-shrink-0 text-right min-w-[120px]">
                    {report.status === "reported" && report.adminAssessment?.chargeAmount ? (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 uppercase mb-0.5">
                          Proposed Fee
                        </p>
                        <p className="font-semibold text-gray-900 text-sm leading-tight">
                          {formatCurrency(report.adminAssessment.chargeAmount, "VND")}
                        </p>
                      </div>
                    ) : report.status === "charged" && report.adminAssessment?.chargeAmount ? (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 uppercase mb-0.5">
                          Charged Fee
                        </p>
                        <p className="font-semibold text-green-600 text-sm leading-tight">
                          {formatCurrency(report.adminAssessment.chargeAmount, "VND")}
                        </p>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
                      <MdImage className="w-3.5 h-3.5" />
                      <span>{report.photos.length} photo{report.photos.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                {report.description && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-start gap-1.5">
                      <MdDescription className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {report.description}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-3 lg:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-gray-200 pt-3 lg:pt-4 flex-shrink-0">
              <div className="text-xs text-gray-600 whitespace-nowrap">
                Showing {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, total)} of {total}
              </div>
              <div className="flex items-center gap-1.5 lg:gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg border border-gray-300 text-xs lg:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-0.5 lg:gap-1">
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage <= 2) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 1) {
                      pageNum = totalPages - 2 + i;
                    } else {
                      pageNum = currentPage - 1 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg text-xs lg:text-sm font-medium ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg border border-gray-300 text-xs lg:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListDamageReports;

