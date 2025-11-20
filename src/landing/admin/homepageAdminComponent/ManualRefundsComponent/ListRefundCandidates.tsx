import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MdPerson,
  MdCalendarToday,
  MdDirectionsCar,
  MdCancel,
} from "react-icons/md";
import {
  getRefundCandidates,
  formatCurrency,
} from "../../../../service/apiAdmin/apiManualRefunds/API";
import type {
  ManualRefundCandidate,
  PaginatedCandidatesResponse,
} from "../../../../service/apiAdmin/apiManualRefunds/API";

interface ListRefundCandidatesProps {
  onSelectCandidate: (candidate: ManualRefundCandidate) => void;
}

const ListRefundCandidates: React.FC<ListRefundCandidatesProps> = ({
  onSelectCandidate,
}) => {
  const [candidates, setCandidates] = useState<ManualRefundCandidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<ManualRefundCandidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const limit = 10;

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [renterFilter, setRenterFilter] = useState<string>("all");

  // Fetch all candidates
  const fetchAllCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch with large limit to get all data
      const response: PaginatedCandidatesResponse = await getRefundCandidates({
        page: 1,
        limit: 1000, // Large limit to get all
      });
      
      if (response.success) {
        const items = response.items || response.data?.items || [];
        setCandidates(items);
      } else {
        setCandidates([]);
      }
    } catch (err: any) {
      console.error("Error fetching refund candidates:", err);
      setError(err?.message || "Failed to load refund candidates");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllCandidates();
  }, [fetchAllCandidates]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, renterFilter]);

  // Filter candidates based on selected filters
  useEffect(() => {
    let filtered = [...candidates];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((candidate) => {
        const candidateStatus = candidate.status?.toLowerCase();
        const filterStatus = statusFilter.toLowerCase();
        return candidateStatus === filterStatus;
      });
    }

    // Renter filter
    if (renterFilter !== "all") {
      filtered = filtered.filter((candidate) => candidate.renter?._id === renterFilter);
    }

    // Update pagination
    const totalFiltered = filtered.length;
    const totalPagesFiltered = Math.ceil(totalFiltered / limit);
    setTotal(totalFiltered);
    setTotalPages(totalPagesFiltered);

    // Apply pagination
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    setFilteredCandidates(filtered.slice(startIndex, endIndex));
  }, [candidates, statusFilter, renterFilter, currentPage, limit]);

  // Get unique values for filters
  const uniqueStatuses = Array.from(new Set(candidates.map((c) => c.status).filter(Boolean)));
  const uniqueRenters = Array.from(
    new Map(candidates.map((c) => [c.renter?._id, c.renter])).values()
  ).filter(Boolean);

  const formatDateOnly = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRenterName = (candidate: ManualRefundCandidate): string => {
    return candidate.renter?.name || "N/A";
  };

  const getVehicleInfo = (candidate: ManualRefundCandidate): string => {
    if (!candidate.vehicle) return "N/A";
    if (typeof candidate.vehicle === "string") return candidate.vehicle;
    const vehicle = candidate.vehicle;
    return `${vehicle.brand || ""} ${vehicle.model || ""} ${vehicle.plateNumber || ""}`.trim() || "N/A";
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header with Filters */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm lg:text-base font-semibold text-gray-900">
            Refund Candidates List ({total} items)
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs lg:text-sm px-2 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
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

      {loading && candidates.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-gray-500">Loading data...</div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-red-500">{error}</div>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-gray-500">No candidates found</div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto space-y-2 lg:space-y-2.5 pr-1 lg:pr-2 min-h-0">
            {filteredCandidates.map((candidate) => (
              <motion.div
                key={candidate._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onSelectCandidate(candidate)}
                className="bg-gray-50 rounded-lg lg:rounded-xl border border-gray-200 p-3 lg:p-4 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-800 border-gray-200">
                        <MdCancel className="w-4 h-4" />
                        {candidate.status || "N/A"}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm lg:text-base mb-2">
                      Booking #{candidate._id.slice(-8)}
                    </h4>
                    <div className="flex flex-col gap-1.5 text-xs lg:text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <MdPerson className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">
                          Renter: {getRenterName(candidate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MdDirectionsCar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">
                          Vehicle: {getVehicleInfo(candidate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MdCalendarToday className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">
                          {formatDateOnly(candidate.startTime)} - {formatDateOnly(candidate.endTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex-shrink-0 text-right min-w-[120px]">
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 uppercase mb-0.5">
                        Refundable Amount
                      </p>
                      <p className="font-semibold text-gray-900 text-sm leading-tight">
                        {formatCurrency(candidate.refundableRemaining || 0, "VND")}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      Paid: {formatCurrency(candidate.amounts?.totalPaid || candidate.paid || 0, "VND")}
                    </div>
                  </div>
                </div>
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

export default ListRefundCandidates;

