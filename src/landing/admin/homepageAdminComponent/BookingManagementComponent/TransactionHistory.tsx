import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import bookingApi, { formatCurrency } from "../../../../service/apiBooking/API";
import type { AdminTransactionsResponse, AdminTransactionStatus, AdminTransactionItem } from "../../../../service/apiBooking/API";
import PageTitle from "../../component/PageTitle";
import CustomSelect from "../../../../components/CustomSelect";
import DateTimeDropdown from "../../../../components/DateTimeDropdown";
import DetailUserTransactionModal from "./DetailUserTransactionModal";
import { MdSearch, MdFilterList, MdRefresh, MdAccessTime, MdPerson, MdDirectionsCar, MdLocationOn, MdPayment } from "react-icons/md";

type Filters = {
  provider?: string;
  status?: AdminTransactionStatus | "--";
  renterPhone?: string;
  plateNumber?: string;
  search?: string;
  from?: string; // ISO string
  to?: string; // ISO string
  dateField?: "createdAt" | "updatedAt";
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
  const [filters, setFilters] = useState<Filters>({ provider: "payos", dateField: "createdAt" });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminTransactionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<Filters>({ provider: "payos", dateField: "createdAt" });
  const [selectedTransaction, setSelectedTransaction] = useState<AdminTransactionItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const normalizePlate = (input?: string) => {
    if (!input) return undefined;
    return input
      .toString()
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "")
      .replace(/-/g, "");
  };

  const normalizePhone = (input?: string) => {
    if (!input) return undefined;
    const digits = input.toString().replace(/[^0-9]/g, "");
    if (!digits) return undefined;
    // Normalize Vietnamese phone number: +84 -> 0
    if (digits.startsWith("84") && digits.length >= 9) return "0" + digits.slice(2);
    if (digits.startsWith("0")) return digits;
    return digits;
  };

  const handleRowClick = (transaction: AdminTransactionItem) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTransaction(null);
  };

  const fetchData = async () => {
    setLoading(true);
    const MIN_LOADING_MS = 1200;
    const startAt = Date.now();
    setError(null);
    try {
      const cleaned = {
        ...applied,
        renterPhone: normalizePhone(filters.renterPhone),
        plateNumber: normalizePlate(filters.plateNumber),
      } as typeof filters;
      const res = await bookingApi.getAdminTransactions({ ...cleaned, page, limit });
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

  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    const nextApplied: Filters = {
      ...filters,
      renterPhone: normalizePhone(filters.renterPhone),
      plateNumber: normalizePlate(filters.plateNumber),
    };
    setApplied(nextApplied);
    setPage(1);
  };

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.total / data.limit));
  }, [data]);

  const filteredItems = useMemo(() => {
    const items = data?.items || [];
    const byStatus = (it: any) => {
      if (!applied.status || applied.status === "--") return true;
      return (it.deposit?.status || "none") === applied.status;
    };
    const byPhone = (it: any) => {
      if (!applied.renterPhone) return true;
      const phone = (it.renterInfo?.phone || "").replace(/[^0-9]/g, "");
      const target = (applied.renterPhone || "").replace(/[^0-9]/g, "");
      return phone.includes(target);
    };
    const byPlate = (it: any) => {
      if (!applied.plateNumber) return true;
      const plate = (it.vehicleInfo?.plateNumber || "").toUpperCase().replace(/\s+|-/g, "");
      const target = (applied.plateNumber || "").toUpperCase().replace(/\s+|-/g, "");
      return plate.includes(target);
    };
    const bySearch = (it: any) => {
      if (!applied.search) return true;
      const s = applied.search.toString().trim();
      const code = String(it.deposit?.payos?.orderCode || "");
      const linkId = String(it.deposit?.payos?.paymentLinkId || "");
      return code.includes(s) || linkId.includes(s);
    };
    return items.filter((it) => byStatus(it) && byPhone(it) && byPlate(it) && bySearch(it));
  }, [data, applied]);

  return (
    <div className="space-y-6">
      <PageTitle title="Transaction History" subtitle="Payment transactions management for administrators" />

      {/* Filters */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MdFilterList className="w-5 h-5 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="e.g., payos"
              value={filters.provider || ""}
              onChange={(e) => setFilters((f) => ({ ...f, provider: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Renter Phone</label>
            <input 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              placeholder="Renter phone number"
              value={filters.renterPhone || ""}
              onChange={(e) => setFilters((f) => ({ ...f, renterPhone: e.target.value }))} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number</label>
            <input 
              className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              placeholder="Vehicle plate number"
              value={filters.plateNumber || ""}
              onChange={(e) => setFilters((f) => ({ ...f, plateNumber: e.target.value }))} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <MdSearch className="w-4 h-4 mr-1" />
              Search
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Order code or payment link ID"
              value={filters.search || ""}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
          </div>
          <DateTimeDropdown
            label="From"
            value={filters.from}
            onChange={(v) => setFilters((f) => ({ ...f, from: v }))}
          />
          <DateTimeDropdown
            label="To"
            value={filters.to}
            onChange={(v) => setFilters((f) => ({ ...f, to: v }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Field</label>
            <CustomSelect
              value={filters.dateField || "createdAt"}
              onChange={(v) => setFilters((f) => ({ ...f, dateField: v as any }))}
              options={[
                { value: "createdAt", label: "Created At" },
                { value: "updatedAt", label: "Updated At" },
              ]}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button 
            type="submit" 
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors cursor-pointer"
          >
            <MdFilterList className="w-4 h-4" />
            Apply Filters
          </button>
          <button
            type="button"
            onClick={() => { 
              setFilters({ provider: "payos", dateField: "createdAt" }); 
              setApplied({ provider: "payos", dateField: "createdAt" }); 
              setPage(1); 
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <MdRefresh className="w-4 h-4" />
            Reset
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative">
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
                    <MdLocationOn className="w-4 h-4" />
                    Station
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
                  <td className="px-4 py-6 text-center text-sm text-red-600" colSpan={5}>{error}</td>
                </tr>
              )}
              {!loading && !error && filteredItems.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-8">
                      <MdSearch className="w-12 h-12 text-gray-300 mb-2" />
                      <p>No transactions found</p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && !error && filteredItems.map((it) => (
                <tr 
                  key={it._id} 
                  className="hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(it)}
                >
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MdAccessTime className="w-4 h-4 text-gray-400" />
                      <span>{new Date(it.createdAt).toLocaleString("en-US", { 
                        year: "numeric",
                        month: "short", 
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MdPerson className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-gray-900 font-medium">{it.renterInfo?.name || "N/A"}</div>
                        <div className="text-xs text-gray-500">{it.renterInfo?.email || ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {it.vehicleInfo ? (
                      <div className="flex items-center gap-2">
                        <MdDirectionsCar className="w-4 h-4 text-gray-400" />
                        <div>
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
                    {it.stationInfo ? (
                      <div className="flex items-center gap-2">
                        <MdLocationOn className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{it.stationInfo.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <MdLocationOn className="w-4 h-4 text-gray-300" />
                        <span className="text-gray-400">—</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MdPayment className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeColor(it.deposit?.status)}`}>
                          {statusLabel[it.deposit?.status || "none"]}
                        </div>
                        <div className="text-gray-900 mt-1 font-medium">
                          {formatCurrency(it.deposit?.amount || 0, it.deposit?.currency || "VND")}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
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
            <button
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              disabled={(data?.page || page) <= 1 || loading}
              onClick={() => setPage(1)}
            >
              First
            </button>
            <button
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              disabled={(data?.page || page) <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span className="px-4 text-sm text-gray-600">
              Page {data?.page || page} of {totalPages}
            </span>
            <button
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              disabled={(data?.page || page) >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
            <button
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              disabled={(data?.page || page) >= totalPages || loading}
              onClick={() => setPage(totalPages)}
            >
              Last
            </button>
          </div>

          {/* Right: Item count */}
          <div className="text-sm text-gray-600">
            Showing {((data?.page || page) - 1) * limit + 1}-{Math.min((data?.page || page) * limit, data?.total || 0)} of {data?.total || 0}
          </div>
        </div>
      </div>

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


