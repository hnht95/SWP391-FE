import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MdDescription,
  MdCalendarToday,
  MdPerson,
  MdDirectionsCar,
  MdAttachFile,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdAutorenew,
  MdDone,
} from "react-icons/md";
import {
  getAllManualRefunds,
  formatCurrency,
  getRefundStatusColor,
  getRefundStatusLabel,
} from "../../../../service/apiAdmin/apiManualRefunds/API";
import type {
  ManualRefund,
  ManualRefundStatus,
  PaginatedManualRefundsResponse,
} from "../../../../service/apiAdmin/apiManualRefunds/API";

interface ListManualRefundsProps {
  onSelectRefund: (refund: ManualRefund) => void;
}

const ListManualRefunds: React.FC<ListManualRefundsProps> = ({
  onSelectRefund,
}) => {
  const [allRefunds, setAllRefunds] = useState<ManualRefund[]>([]);
  const [filteredRefunds, setFilteredRefunds] = useState<ManualRefund[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const limit = 10;

  // Filters
  const [statusFilter, setStatusFilter] = useState<ManualRefundStatus | "all">("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("all");
  const [staffFilter, setStaffFilter] = useState<string>("all");
  const [renterFilter, setRenterFilter] = useState<string>("all");

  // Fetch all refunds
  const fetchAllRefunds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch with large limit to get all data
      const response: PaginatedManualRefundsResponse = await getAllManualRefunds({
        page: 1,
        limit: 1000, // Large limit to get all
      });
      
      if (response.success) {
        const items = response.items || response.data?.items || [];
        setAllRefunds(items);
      } else {
        setAllRefunds([]);
      }
    } catch (err: any) {
      console.error("Error fetching manual refunds:", err);
      setError(err?.message || "Failed to load manual refunds");
      setAllRefunds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllRefunds();
  }, [fetchAllRefunds]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, methodFilter, bookingStatusFilter, staffFilter, renterFilter]);

  // Filter refunds based on selected filters
  useEffect(() => {
    let filtered = [...allRefunds];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((refund) => {
        const refundStatus = refund.status?.toLowerCase();
        const filterStatus = statusFilter.toLowerCase();
        return refundStatus === filterStatus;
      });
    }

    // Method filter
    if (methodFilter !== "all") {
      filtered = filtered.filter((refund) => refund.method === methodFilter);
    }

    // Booking status filter
    if (bookingStatusFilter !== "all") {
      filtered = filtered.filter((refund) => {
        const bookingStatus = refund.booking?.status?.toLowerCase();
        const filterStatus = bookingStatusFilter.toLowerCase();
        return bookingStatus === filterStatus;
      });
    }

    // Staff filter
    if (staffFilter !== "all") {
      filtered = filtered.filter((refund) => refund.staff?._id === staffFilter);
    }

    // Renter filter
    if (renterFilter !== "all") {
      filtered = filtered.filter((refund) => refund.renter?._id === renterFilter);
    }

    // Update pagination
    const totalFiltered = filtered.length;
    const totalPagesFiltered = Math.ceil(totalFiltered / limit);
    setTotal(totalFiltered);
    setTotalPages(totalPagesFiltered);

    // Apply pagination
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    setFilteredRefunds(filtered.slice(startIndex, endIndex));
  }, [allRefunds, statusFilter, methodFilter, bookingStatusFilter, staffFilter, renterFilter, currentPage, limit]);

  // Get unique values for filters
  const uniqueMethods = Array.from(new Set(allRefunds.map((r) => r.method).filter(Boolean)));
  const uniqueBookingStatuses = Array.from(new Set(allRefunds.map((r) => r.booking?.status).filter(Boolean)));
  const uniqueStaffs = Array.from(
    new Map(allRefunds.map((r) => [r.staff?._id, r.staff])).values()
  ).filter(Boolean);
  const uniqueRenters = Array.from(
    new Map(allRefunds.map((r) => [r.renter?._id, r.renter])).values()
  ).filter(Boolean);

  const getStatusIcon = (status: ManualRefundStatus | string) => {
    switch (status) {
      case "pending":
        return <MdPending className="w-4 h-4" />;
      case "approved":
        return <MdCheckCircle className="w-4 h-4" />;
      case "rejected":
        return <MdCancel className="w-4 h-4" />;
      case "processing":
        return <MdAutorenew className="w-4 h-4" />;
      case "completed":
      case "done":
        return <MdDone className="w-4 h-4" />;
      case "cancelled":
        return <MdCancel className="w-4 h-4" />;
      default:
        return null;
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

  const getRenterName = (refund: ManualRefund): string => {
    return refund.renter?.name || "N/A";
  };

  const getStaffName = (refund: ManualRefund): string => {
    return refund.staff?.name || "N/A";
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header with Filters */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm lg:text-base font-semibold text-gray-900">
            Manual Refunds List ({total} items)
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ManualRefundStatus | "all");
            }}
            className="text-xs lg:text-sm px-2 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="text-xs lg:text-sm px-2 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Methods</option>
            {uniqueMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>

          {/* Booking Status Filter */}
          <select
            value={bookingStatusFilter}
            onChange={(e) => setBookingStatusFilter(e.target.value)}
            className="text-xs lg:text-sm px-2 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Booking Status</option>
            {uniqueBookingStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {/* Staff Filter */}
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="text-xs lg:text-sm px-2 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Staff</option>
            {uniqueStaffs.map((staff) => (
              <option key={staff._id} value={staff._id}>
                {staff.name}
              </option>
            ))}
          </select>

          {/* Renter Filter */}
          <select
            value={renterFilter}
            onChange={(e) => setRenterFilter(e.target.value)}
            className="text-xs lg:text-sm px-2 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Renters</option>
            {uniqueRenters.map((renter) => (
              <option key={renter._id} value={renter._id}>
                {renter.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && allRefunds.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-gray-500">Loading data...</div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-red-500">{error}</div>
        </div>
      ) : filteredRefunds.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-gray-500">No refunds found</div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto space-y-2 lg:space-y-2.5 pr-1 lg:pr-2 min-h-0">
            {filteredRefunds.map((refund) => (
              <motion.div
                key={refund._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onSelectRefund(refund)}
                className="bg-gray-50 rounded-lg lg:rounded-xl border border-gray-200 p-3 lg:p-4 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getRefundStatusColor(
                          refund.status
                        )}`}
                      >
                        {getStatusIcon(refund.status)}
                        {getRefundStatusLabel(refund.status)}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm lg:text-base mb-2">
                      Refund #{refund._id.slice(-8)}
                    </h4>
                    <div className="flex flex-col gap-1.5 text-xs lg:text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <MdPerson className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">
                          Renter: {getRenterName(refund)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MdPerson className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">
                          Staff: {getStaffName(refund)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MdCalendarToday className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">
                          {formatDateOnly(refund.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex-shrink-0 text-right min-w-[120px]">
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 uppercase mb-0.5">
                        Refund Amount
                      </p>
                      <p className="font-semibold text-gray-900 text-sm leading-tight">
                        {formatCurrency(refund.amount, "VND")}
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
                      <MdAttachFile className="w-3.5 h-3.5" />
                      <span>{(refund.attachments?.length || 0)} file{(refund.attachments?.length || 0) !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                {refund.note && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-start gap-1.5">
                      <MdDescription className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {refund.note}
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

export default ListManualRefunds;

