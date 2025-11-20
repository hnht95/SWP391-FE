import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import bookingApi, { formatCurrency } from "../../../../service/apiAdmin/apiBooking/API";
import type { AdminTransactionsResponse, AdminTransactionStatus, AdminTransactionItem } from "../../../../service/apiAdmin/apiBooking/API";
import PageTitle from "../../component/PageTitle";
import CustomSelect from "../../../../components/CustomSelect";
import DateTimeDropdown from "../../../../components/DateTimeDropdown";
import DetailUserTransactionModal from "./DetailUserTransactionModal";
import { getVehicleById, getPhotoUrls } from "../../../../service/apiAdmin/apiVehicles/API";
import { MdSearch, MdFilterList, MdRefresh, MdAccessTime, MdPerson, MdDirectionsCar, MdPayment, MdPhone, MdCalendarToday, MdEvent } from "react-icons/md";

type Filters = {
  status?: AdminTransactionStatus | "--";
  renterPhone?: string;
  from?: string; // ISO string
  to?: string; // ISO string
};

const statusLabel: Record<string, string> = {
  none: "None",
  pending: "Pending",
  captured: "Captured",
  failed: "Failed",
  refunded: "Refunded",
};

const badgeColor = (s?: string) => {
  switch (s) {
    case "captured":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "failed":
      return "bg-red-100 text-red-700";
    case "refunded":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const TransactionHistory: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminTransactionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<Filters>({});
  const [selectedTransaction, setSelectedTransaction] = useState<AdminTransactionItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [vehicleImages, setVehicleImages] = useState<Record<string, string>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const normalizePhone = (input?: string) => {
    if (!input) return undefined;
    const digits = input.toString().replace(/[^0-9]/g, "");
    if (!digits) return undefined;
    // Normalize Vietnamese phone number: +84 -> 0
    if (digits.startsWith("84") && digits.length >= 9) return "0" + digits.slice(2);
    if (digits.startsWith("0")) return digits;
    return digits;
  };

  const handleRowClick = useCallback((transaction: AdminTransactionItem) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedTransaction(null);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const MIN_LOADING_MS = 1200;
    const startAt = Date.now();
    setError(null);
    try {
      // Prepare filters for API - only send non-empty values
      const apiParams: any = {
        page,
        limit,
      };

      // Add status filter only if it's not "--"
      if (applied.status && applied.status !== "--") {
        apiParams.status = applied.status;
      }

      // Don't send renterPhone to API - we'll filter client-side for exact match
      // if (applied.renterPhone) {
      //   apiParams.renterPhone = applied.renterPhone;
      // }

      // Add date filters if exists
      if (applied.from) {
        apiParams.from = applied.from;
      }
      if (applied.to) {
        apiParams.to = applied.to;
      }

      // Default dateField to createdAt if date filters are used
      if (applied.from || applied.to) {
        apiParams.dateField = "createdAt";
      }

      const res = await bookingApi.getAdminTransactions(apiParams);
      setData(res);
    } catch (e: any) {
      setError(e?.message || "Failed to load transactions");
    } finally {
      const elapsed = Date.now() - startAt;
      const wait = Math.max(0, MIN_LOADING_MS - elapsed);
      if (wait > 0) {
        await new Promise((r) => setTimeout(r, wait));
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, applied]);

  // Fetch vehicle images when data changes
  useEffect(() => {
    const fetchVehicleImages = async () => {
      if (!data?.items) return;
      
      const imagePromises = data.items
        .filter((item) => item.vehicle && item.vehicleInfo?._id && !vehicleImages[item.vehicleInfo._id])
        .map(async (item) => {
          try {
            const vehicle = await getVehicleById(item.vehicleInfo!._id);
            const exteriorPhotos = getPhotoUrls(vehicle.defaultPhotos?.exterior || []);
            return {
              vehicleId: item.vehicleInfo!._id,
              imageUrl: exteriorPhotos[0] || null,
            };
          } catch (error) {
            console.error(`Failed to fetch vehicle image for ${item.vehicleInfo?._id}:`, error);
            return {
              vehicleId: item.vehicleInfo!._id,
              imageUrl: null,
            };
          }
        });

      const results = await Promise.all(imagePromises);
      const newImages: Record<string, string> = {};
      results.forEach(({ vehicleId, imageUrl }) => {
        if (imageUrl) {
          newImages[vehicleId] = imageUrl;
        }
      });

      if (Object.keys(newImages).length > 0) {
        setVehicleImages((prev) => ({ ...prev, ...newImages }));
      }
    };

    fetchVehicleImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    const nextApplied: Filters = {
      ...filters,
      renterPhone: normalizePhone(filters.renterPhone),
    };
    setApplied(nextApplied);
    setPage(1);
  };

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.total / data.limit));
  }, [data]);

  // Filter items client-side for exact phone match
  const filteredItems = useMemo(() => {
    const items = data?.items || [];
    
    // If renterPhone filter is applied, do exact match filtering
    if (applied.renterPhone) {
      const normalizedFilter = normalizePhone(applied.renterPhone);
      if (!normalizedFilter) return items;
      
      return items.filter((it) => {
        const phone = normalizePhone(it.renterInfo?.phone);
        if (!phone) return false;
        // Exact match only - no partial matching
        return phone === normalizedFilter;
      });
    }
    
    return items;
  }, [data, applied.renterPhone]);

  return (
    <div className="space-y-6" style={{ scrollBehavior: 'smooth' }}>
      <PageTitle title="Transaction History" subtitle="Payment transactions management for administrators" />

      {/* Filters */}
      <motion.form 
        onSubmit={handleSubmit} 
        className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <MdFilterList className="w-4 h-4 text-black" />
              Status
            </label>
            <CustomSelect
              value={filters.status || "--"}
              onChange={(v) => setFilters((f) => ({ ...f, status: v as any }))}
              options={[
                { value: "--", label: "--" },
                { value: "none", label: "None" },
                { value: "pending", label: "Pending" },
                { value: "captured", label: "Captured" },
                { value: "failed", label: "Failed" },
                { value: "refunded", label: "Refunded" },
              ]}
              className="min-w-[12rem]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <MdPhone className="w-4 h-4 text-black" />
              Renter Phone
            </label>
            <input 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all duration-200" 
              placeholder="Renter phone number"
              value={filters.renterPhone || ""}
              onChange={(e) => setFilters((f) => ({ ...f, renterPhone: e.target.value }))} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <MdCalendarToday className="w-4 h-4 text-black" />
              From
            </label>
            <DateTimeDropdown
              label=""
              value={filters.from}
              onChange={(v) => setFilters((f) => ({ ...f, from: v }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <MdEvent className="w-4 h-4 text-black" />
              To
            </label>
            <DateTimeDropdown
              label=""
              value={filters.to}
              onChange={(v) => setFilters((f) => ({ ...f, to: v }))}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <motion.button 
            type="submit" 
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MdFilterList className="w-4 h-4" />
            Apply Filters
          </motion.button>
          <motion.button
            type="button"
            onClick={() => { 
              setFilters({}); 
              setApplied({}); 
              setPage(1); 
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MdRefresh className="w-4 h-4" />
            Reset
          </motion.button>
        </div>
      </motion.form>

      {/* Table */}
      <motion.div 
        className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Loading overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3 text-gray-900">
                <span className="inline-block w-5 h-5 rounded-full border-2 border-black/90 border-t-transparent animate-spin" />
                <span className="text-sm font-medium">Loading transactions...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                  <div className="flex items-center gap-2">
                    <MdAccessTime className="w-4 h-4" />
                    Created
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                  <div className="flex items-center gap-2">
                    <MdPerson className="w-4 h-4" />
                    Renter
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                  <div className="flex items-center gap-2">
                    <MdDirectionsCar className="w-4 h-4" />
                    Vehicle
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                  <div className="flex items-center gap-2">
                    <MdPayment className="w-4 h-4" />
                    Deposit
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {error && !loading && (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-red-600" colSpan={4}>{error}</td>
                </tr>
              )}
              {!loading && !error && filteredItems.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={4}>
                    <div className="flex flex-col items-center justify-center py-8">
                      <MdSearch className="w-12 h-12 text-gray-300 mb-2" />
                      <p>No transactions found</p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && !error && filteredItems.map((it, index) => (
                <motion.tr 
                  key={it._id} 
                  className="hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(it)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ 
                    duration: 0.2, 
                    delay: index * 0.02,
                    ease: "easeOut"
                  }}
                >
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MdAccessTime className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium">
                          {new Date(it.createdAt).toLocaleDateString("vi-VN", { 
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                          })}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(it.createdAt).toLocaleTimeString("vi-VN", { 
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MdPerson className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-col">
                        <div className="text-gray-900 font-medium">{it.renterInfo?.name || "N/A"}</div>
                        <div className="text-xs text-gray-500">{it.renterInfo?.email || ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {it.vehicleInfo ? (
                      <div className="flex items-center gap-2">
                        {vehicleImages[it.vehicleInfo._id] && !imageErrors[it.vehicleInfo._id] ? (
                          <motion.img
                            src={vehicleImages[it.vehicleInfo._id]}
                            alt={`${it.vehicleInfo.brand} ${it.vehicleInfo.model}`}
                            className="w-10 h-10 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            onError={() => {
                              setImageErrors((prev) => ({ ...prev, [it.vehicleInfo!._id]: true }));
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <MdDirectionsCar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="flex flex-col">
                          <div className="text-gray-900 font-medium">{it.vehicleInfo.brand} {it.vehicleInfo.model}</div>
                          <div className="text-xs text-gray-500">{it.vehicleInfo.plateNumber}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <MdDirectionsCar className="w-4 h-4 text-gray-300" />
                        <span className="text-gray-400">—</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MdPayment className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-col">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeColor(it.deposit?.status)}`}>
                          {statusLabel[it.deposit?.status || "none"]}
                        </div>
                        <div className="text-gray-900 font-medium mt-1">
                          {formatCurrency(it.deposit?.amount || 0, it.deposit?.currency || "VND")}
                        </div>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
          {/* Left: Rows per page */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows per page:</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              value={limit}
              onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}
            >
              {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* Center: Page navigation */}
          <div className="flex items-center gap-2">
            <motion.button
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              disabled={(data?.page || page) <= 1 || loading}
              onClick={() => setPage(1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              First
            </motion.button>
            <motion.button
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              disabled={(data?.page || page) <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Prev
            </motion.button>
            <span className="px-4 text-sm text-gray-600">
              Page {data?.page || page} of {totalPages}
            </span>
            <motion.button
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              disabled={(data?.page || page) >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next
            </motion.button>
            <motion.button
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              disabled={(data?.page || page) >= totalPages || loading}
              onClick={() => setPage(totalPages)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Last
            </motion.button>
          </div>

          {/* Right: Item count */}
          <div className="text-sm text-gray-600">
            Showing {((data?.page || page) - 1) * limit + 1}-{Math.min((data?.page || page) * limit, data?.total || 0)} of {data?.total || 0}
          </div>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <DetailUserTransactionModal
        transaction={selectedTransaction}
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default TransactionHistory;


