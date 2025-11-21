import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MdCalendarToday, MdPeople, MdArrowForward, MdClose, MdBookOnline } from "react-icons/md";
import { getAllBookings, formatCurrency } from "../../../../service/apiAdmin/apiBooking/API";
import type { Booking, PaginatedBookingsResponse, BookingStatus } from "../../../../service/apiAdmin/apiBooking/API";

const Bookedmanagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalBookings, setModalBookings] = useState<Booking[]>([]);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [modalCurrentPage, setModalCurrentPage] = useState<number>(1);
  const [modalTotalPages, setModalTotalPages] = useState<number>(1);
  const [modalTotal, setModalTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedStatus, setSelectedStatus] = useState<"all" | BookingStatus>("all");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState<boolean>(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  const limit = 3;
  const modalLimit = 20;

  const getBookingTimestamp = useCallback((booking: Booking): number => {
    // Prioritize createdAt (when booking was created/booked) for newest bookings first
    const rawDate = booking.createdAt || booking.updatedAt || (booking as any)._dateSort || booking.startTime || booking.endTime;
    if (!rawDate) return 0;
    const time = new Date(rawDate).getTime();
    return Number.isNaN(time) ? 0 : time;
  }, []);

  const fetchBookings = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedBookingsResponse = await getAllBookings({
        page,
        limit,
      });
      // Sort bookings by createdAt (newest booking received first)
      const sortedBookings = (response.items || [])
        .map((booking) => ({
          booking,
          timestamp: getBookingTimestamp(booking),
        }))
        .sort((a, b) => b.timestamp - a.timestamp)
        .map((entry) => entry.booking);
      setBookings(sortedBookings);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(response.page || page);
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError(err?.message || "Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [limit, getBookingTimestamp]);

  const fetchModalBookings = useCallback(async (page: number) => {
    try {
      setModalLoading(true);
      const response: PaginatedBookingsResponse = await getAllBookings({
        page,
        limit: modalLimit,
        status: selectedStatus,
      });
      // Sort bookings by createdAt (newest booking received first)
      const sortedBookings = (response.items || [])
        .map((booking) => ({
          booking,
          timestamp: getBookingTimestamp(booking),
        }))
        .sort((a, b) => b.timestamp - a.timestamp)
        .map((entry) => entry.booking);
      setModalBookings(sortedBookings);
      setModalTotalPages(response.totalPages || 1);
      setModalTotal(response.total || 0);
      setModalCurrentPage(response.page || page);
    } catch (err: any) {
      console.error("Error fetching modal bookings:", err);
      setModalBookings([]);
    } finally {
      setModalLoading(false);
    }
  }, [modalLimit, getBookingTimestamp, selectedStatus]);

  useEffect(() => {
    fetchBookings(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    if (showModal) {
      setModalCurrentPage(1);
      fetchModalBookings(1);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = "unset";
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal, fetchModalBookings]);

  // Reset to page 1 when status changes
  useEffect(() => {
    if (showModal) {
      setModalCurrentPage(1);
      fetchModalBookings(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus]);

  useEffect(() => {
    if (showModal) {
      fetchModalBookings(modalCurrentPage);
    }
  }, [modalCurrentPage, showModal, fetchModalBookings]);

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateOnly = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDuration = (startTime: string, endTime: string): string => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""}${remainingHours > 0 ? ` ${remainingHours} hour${remainingHours > 1 ? "s" : ""}` : ""}`;
    }
    return `${diffHours} hour${diffHours > 1 ? "s" : ""}`;
  };

  const getVehicleName = (booking: Booking): string => {
    if (typeof booking.vehicle === "object" && booking.vehicle) {
      return `${booking.vehicle.brand} ${booking.vehicle.model}`;
    }
    return "No vehicle";
  };

  const getStationName = (booking: Booking): string => {
    if (typeof booking.station === "object" && booking.station) {
      return booking.station.name;
    }
    return "No station";
  };

  const getRenterName = (booking: Booking): string => {
    if (typeof booking.renter === "object" && booking.renter) {
      return booking.renter.name;
    }
    return "Unknown";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        statusButtonRef.current &&
        !statusDropdownRef.current.contains(event.target as Node) &&
        !statusButtonRef.current.contains(event.target as Node)
      ) {
        setIsStatusDropdownOpen(false);
      }
    };

    if (isStatusDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isStatusDropdownOpen]);

  const statusOptions: Array<{ value: "all" | BookingStatus; label: string }> = [
    { value: "all", label: "All" },
    { value: "reserved", label: "Reserved" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const getStatusLabel = (status: "all" | BookingStatus): string => {
    return statusOptions.find(opt => opt.value === status)?.label || "All";
  };

  return (
    <>
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className="text-sm lg:text-base font-semibold text-gray-900">All Bookings</h3>
        <button 
          onClick={() => setShowModal(true)}
          className="text-xs lg:text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1"
        >
          See All
          <MdArrowForward className="w-3 h-3 lg:w-4 lg:h-4" />
        </button>
      </div>

      {loading && bookings.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-gray-500">Loading data...</div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-red-500">{error}</div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-gray-500">No bookings found</div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto space-y-2 lg:space-y-2.5 pr-1 lg:pr-2 min-h-0">
            {bookings.map((booking) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg lg:rounded-xl border border-gray-200 p-2.5 lg:p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 lg:gap-2.5">
                  {/* Left Section */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-xs lg:text-sm mb-1.5 truncate">
                      {getVehicleName(booking)}
                    </h4>
                    <div className="flex flex-col gap-1 lg:gap-1.5 text-xs lg:text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MdCalendarToday className="w-3 h-3 lg:w-3.5 lg:h-3.5 flex-shrink-0" />
                        <span className="truncate text-xs">{formatDateOnly(booking.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MdPeople className="w-3 h-3 lg:w-3.5 lg:h-3.5 flex-shrink-0" />
                        <span className="truncate text-xs">{getRenterName(booking)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Section */}
                  <div className="flex-1 min-w-0 px-2 lg:px-2.5 border-l border-r border-gray-200">
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-left w-full">
                        <p className="font-bold text-gray-900 text-xs lg:text-sm">
                          {formatTime(booking.startTime)}
                        </p>
                        <p className="text-xs text-gray-600 truncate leading-tight">{getStationName(booking)}</p>
                      </div>
                      <div className="relative w-full flex items-center justify-center my-0.5">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <div className="px-1.5 lg:px-2 text-xs text-gray-500 bg-gray-50 whitespace-nowrap">
                          {calculateDuration(booking.startTime, booking.endTime)}
                        </div>
                        <div className="flex-1 h-px bg-gray-300"></div>
                      </div>
                      <div className="text-left w-full">
                        <p className="font-bold text-gray-900 text-xs lg:text-sm">
                          {formatTime(booking.endTime)}
                        </p>
                        <p className="text-xs text-gray-600 truncate leading-tight">{getStationName(booking)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex-shrink-0 text-right min-w-[70px] lg:min-w-[85px]">
                    <div className="mb-1.5 lg:mb-2">
                      <p className="text-xs text-gray-500 uppercase mb-0.5">Total Paid</p>
                      <p className="font-semibold text-gray-900 text-xs lg:text-sm leading-tight">
                        {formatCurrency(booking.amounts?.totalPaid || 0, "VND")}
                      </p>
                    </div>
                    <span
                      className={`inline-block px-1.5 lg:px-2 py-0.5 lg:py-1 rounded text-xs font-semibold ${
                        booking.status === "reserved"
                          ? "bg-blue-100 text-blue-700"
                          : booking.status === "active"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "completed"
                          ? "bg-purple-100 text-purple-700"
                          : booking.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {booking.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Widget Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage === 1) {
                    pageNum = i + 1;
                  } else if (currentPage === totalPages) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
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
                className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

    </div>
      {/* Modal for See All */}
      {createPortal(
        <AnimatePresence>
          {showModal && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/40 z-[9999]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={() => setShowModal(false)}
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
                    mass: 0.8
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] min-h-[600px] overflow-hidden flex flex-col pointer-events-auto"
                >
                {/* Modal Header - Dark Gradient */}
                <div className="sticky top-0 z-20 flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-black via-gray-900 to-gray-800/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/80">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-md">
                      <MdBookOnline className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">All Bookings</h2>
                      <p className="text-xs text-gray-200">View all booking list</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full p-1.5 transition-all duration-200 ease-in-out"
                  >
                    <MdClose className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-5 min-h-0 flex flex-col scroll-smooth">
                  {modalLoading && modalBookings.length === 0 ? (
                    <div className="flex items-center justify-center flex-1">
                      <div className="text-sm text-gray-500">Loading data...</div>
                    </div>
                  ) : modalBookings.length === 0 ? (
                    <div className="flex items-center justify-center flex-1">
                      <div className="text-sm text-gray-500">No bookings found</div>
                    </div>
                  ) : (
                    <div className="space-y-3 flex-1">
                      {modalBookings.map((booking, index) => (
                        <motion.div
                          key={booking._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.3,
                            delay: index * 0.03,
                            ease: "easeOut"
                          }}
                          className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start justify-between gap-4">
                            {/* Left Section */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 text-sm mb-2 truncate">
                                {getVehicleName(booking)}
                              </h4>
                              <div className="flex flex-col gap-1.5 text-xs text-gray-600">
                                <div className="flex items-center gap-1.5">
                                  <MdCalendarToday className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span className="truncate">{formatDateOnly(booking.startTime)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MdPeople className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span className="truncate">{getRenterName(booking)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Middle Section */}
                            <div className="flex-1 min-w-0 px-3 border-l border-r border-gray-200">
                              <div className="flex flex-col items-center gap-1">
                                <div className="text-left w-full">
                                  <p className="font-bold text-gray-900 text-xs">
                                    {formatTime(booking.startTime)}
                                  </p>
                                  <p className="text-xs text-gray-600 truncate leading-tight">{getStationName(booking)}</p>
                                </div>
                                <div className="relative w-full flex items-center justify-center my-0.5">
                                  <div className="flex-1 h-px bg-gray-300"></div>
                                  <div className="px-1.5 text-xs text-gray-500 bg-gray-50 whitespace-nowrap">
                                    {calculateDuration(booking.startTime, booking.endTime)}
                                  </div>
                                  <div className="flex-1 h-px bg-gray-300"></div>
                                </div>
                                <div className="text-left w-full">
                                  <p className="font-bold text-gray-900 text-xs">
                                    {formatTime(booking.endTime)}
                                  </p>
                                  <p className="text-xs text-gray-600 truncate leading-tight">{getStationName(booking)}</p>
                                </div>
                              </div>
                            </div>

                            {/* Right Section */}
                            <div className="flex-shrink-0 text-right min-w-[100px]">
                              <div className="mb-1.5">
                                <p className="text-xs text-gray-500 uppercase mb-0.5">Total Paid</p>
                                <p className="font-semibold text-gray-900 text-xs leading-tight">
                                  {formatCurrency(booking.amounts?.totalPaid || 0, "VND")}
                                </p>
                              </div>
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                                  booking.status === "reserved"
                                    ? "bg-blue-100 text-blue-700"
                                    : booking.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : booking.status === "completed"
                                    ? "bg-purple-100 text-purple-700"
                                    : booking.status === "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {booking.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modal Pagination */}
                <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="relative flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-600">Status:</span>
                      <div className="relative">
                        <button
                          ref={statusButtonRef}
                          type="button"
                          onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                          className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px] text-left flex items-center justify-between gap-2 transition-all duration-200"
                        >
                          <span>{getStatusLabel(selectedStatus)}</span>
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${isStatusDropdownOpen ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <AnimatePresence>
                          {isStatusDropdownOpen && (
                            <motion.div
                              ref={statusDropdownRef}
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="absolute bottom-full left-0 mb-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50 overflow-hidden"
                            >
                              {statusOptions.map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    setSelectedStatus(option.value);
                                    setIsStatusDropdownOpen(false);
                                  }}
                                  className={`w-full px-3 py-2 text-xs sm:text-sm text-left hover:bg-gray-50 transition-colors duration-150 ${
                                    selectedStatus === option.value
                                      ? "bg-blue-50 text-blue-700 font-medium"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                      Showing {(modalCurrentPage - 1) * modalLimit + 1}-{Math.min(modalCurrentPage * modalLimit, modalTotal)} of {modalTotal}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModalCurrentPage(1)}
                      disabled={modalCurrentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      First
                    </button>
                    <button
                      onClick={() => setModalCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={modalCurrentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Prev
                    </button>
                    <span className="text-xs sm:text-sm text-gray-600 px-2">
                      Page {modalCurrentPage} of {modalTotalPages}
                    </span>
                    <button
                      onClick={() => setModalCurrentPage((prev) => Math.min(modalTotalPages, prev + 1))}
                      disabled={modalCurrentPage === modalTotalPages}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setModalCurrentPage(modalTotalPages)}
                      disabled={modalCurrentPage === modalTotalPages}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Last
                    </button>
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

export default Bookedmanagement;

