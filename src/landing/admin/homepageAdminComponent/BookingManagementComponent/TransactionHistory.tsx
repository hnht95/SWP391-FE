import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import bookingApi, { formatCurrency } from "../../../../service/apiBooking/API";
import type { AdminTransactionsResponse, AdminTransactionStatus } from "../../../../service/apiBooking/API";
import PageTitle from "../../component/PageTitle";
import CustomSelect from "../../../../components/CustomSelect";
import DateTimeDropdown from "../../../../components/DateTimeDropdown";

type Filters = {
  provider?: string;
  status?: AdminTransactionStatus | "--";
  companyId?: string;
  renterId?: string;
  vehicleId?: string;
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

  const fetchData = async () => {
    setLoading(true);
    const MIN_LOADING_MS = 1200;
    const startAt = Date.now();
    setError(null);
    try {
      const res = await bookingApi.getAdminTransactions({ ...filters, page, limit });
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
  }, [page, limit]);

  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.total / data.limit));
  }, [data]);

  return (
    <div className="space-y-6">
      <PageTitle title="Transaction History" subtitle="Danh sách payment transactions (admin)" />

      {/* Filters */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="payos"
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
                { value: "none", label: "none" },
                { value: "pending", label: "pending" },
                { value: "captured", label: "captured" },
                { value: "failed", label: "failed" },
                { value: "refunded", label: "refunded" },
              ]}
              className="min-w-[12rem]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company ID</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={filters.companyId || ""}
                   onChange={(e) => setFilters((f) => ({ ...f, companyId: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Renter ID</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={filters.renterId || ""}
                   onChange={(e) => setFilters((f) => ({ ...f, renterId: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle ID</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2" value={filters.vehicleId || ""}
                   onChange={(e) => setFilters((f) => ({ ...f, vehicleId: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="orderCode hoặc paymentLinkId"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Date field</label>
            <CustomSelect
              value={filters.dateField || "createdAt"}
              onChange={(v) => setFilters((f) => ({ ...f, dateField: v as any }))}
              options={[
                { value: "createdAt", label: "createdAt" },
                { value: "updatedAt", label: "updatedAt" },
              ]}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors">Apply</button>
          <button
            type="button"
            onClick={() => { setFilters({ provider: "payos", dateField: "createdAt" }); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >Reset</button>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Created</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Booking</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Renter</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Station</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Deposit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">PayOS</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {error && !loading && (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-red-600" colSpan={8}>{error}</td>
                </tr>
              )}
              {!loading && !error && data?.items?.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={8}>No data</td>
                </tr>
              )}
              {!loading && !error && data?.items?.map((it) => (
                <tr key={it._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(it.createdAt).toLocaleString("vi-VN")}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="text-gray-900 font-medium">{it.bookingId}</div>
                    <div className="text-xs text-gray-500">Status: {it.status}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="text-gray-900">{it.renterInfo?.name}</div>
                    <div className="text-xs text-gray-500">{it.renterInfo?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {it.vehicleInfo ? (
                      <div>
                        <div className="text-gray-900">{it.vehicleInfo.brand} {it.vehicleInfo.model}</div>
                        <div className="text-xs text-gray-500">{it.vehicleInfo.plateNumber}</div>
                      </div>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {it.stationInfo ? it.stationInfo.name : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeColor(it.deposit?.status)}`}>
                      {statusLabel[it.deposit?.status || "none"]}
                    </div>
                    <div className="text-gray-900 mt-1">{formatCurrency(it.deposit?.amount || 0, it.deposit?.currency || "VND")}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {it.deposit?.payos ? (
                      <div className="space-y-0.5 text-xs">
                        <div className="text-gray-700">Code: <span className="font-medium">{it.deposit.payos.orderCode}</span></div>
                        <div className="text-gray-500">LinkId: {it.deposit.payos.paymentLinkId}</div>
                      </div>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(it.amounts?.totalPaid || 0, "VND")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
          <div className="text-sm text-gray-600">Page {data?.page || page} / {totalPages}</div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 border rounded-lg disabled:opacity-50"
              disabled={(data?.page || page) <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >Prev</button>
            <button
              className="px-3 py-1.5 border rounded-lg disabled:opacity-50"
              disabled={(data?.page || page) >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >Next</button>
            <select
              className="ml-2 border rounded-lg px-2 py-1.5"
              value={limit}
              onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}
            >
              {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}/page</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;


