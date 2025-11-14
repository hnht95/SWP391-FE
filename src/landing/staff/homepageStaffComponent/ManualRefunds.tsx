import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdRefresh,
  MdSearch,
  MdFilterList,
  MdAttachMoney,
  MdPerson,
  MdCalendarToday,
  MdClose,
  MdCheckCircle,
} from "react-icons/md";
import staffAPI from "../../../service/apiStaff/API";
import type {
  AdminBookingTransactionsResponse,
  BookingTransactionItem,
} from "../../../types/bookings";

type TabKey = "candidates" | "processed";

const pageSizes = [10, 20, 50];

const ManualRefunds = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("candidates");
  const [items, setItems] = useState<BookingTransactionItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] =
    useState<BookingTransactionItem | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [createForm, setCreateForm] = useState<{
    booking: string;
    amount: number | "";
    reason: string;
    attachments: File[];
  }>({ booking: "", amount: "", reason: "", attachments: [] });
  const [updateForm, setUpdateForm] = useState<{
    id: string;
    status: string;
    note: string;
    addFiles: File[];
  }>({ id: "", status: "pending", note: "", addFiles: [] });

  const totalPages = useMemo(() => {
    if (!limit) return 1;
    return Math.max(1, Math.ceil(total / limit));
  }, [total, limit]);

  const fetchData = async (showLoadingState = true) => {
    if (showLoadingState) setLoading(true);
    setError(null);
    try {
      let res: AdminBookingTransactionsResponse;
      if (activeTab === "candidates") {
        res = await staffAPI.getManualRefundCandidates({
          page,
          limit,
          sort: "-updatedAt",
        });
      } else {
        res = await staffAPI.getManualRefunds({
          page,
          limit,
          sort: "-updatedAt",
        });
      }
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch manual refunds";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page, limit]);

  const onChangeTab = (key: TabKey) => {
    setActiveTab(key);
    setPage(1);
    setSearchTerm("");
  };

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(
      (it) =>
        it.bookingId?.toLowerCase().includes(term) ||
        it.renterInfo?.name?.toLowerCase().includes(term) ||
        it.renterInfo?.email?.toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      totalAmount: items.reduce(
        (sum, it) => sum + (it.deposit?.amount || 0),
        0
      ),
      avgAmount: items.length
        ? items.reduce((sum, it) => sum + (it.deposit?.amount || 0), 0) /
          items.length
        : 0,
    };
  }, [items]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manual Refunds</h1>
            <p className="text-sm text-gray-500 mt-1">
              Review candidates and track processed refunds
            </p>
          </div>
          <motion.div className="flex items-center gap-3">
            <motion.button
              onClick={() => {
                setShowCreate(true);
                if (selectedItem) {
                  setCreateForm((f) => ({
                    booking: selectedItem.bookingId,
                    amount: selectedItem.deposit?.amount || "",
                    reason: f.reason,
                    attachments: [],
                  }));
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:opacity-90 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-sm font-medium">New Request</span>
            </motion.button>

            <motion.button
              onClick={() => fetchData(false)}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              <MdRefresh
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
              <span className="text-sm font-medium">Refresh</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MdFilterList className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalAmount.toLocaleString()} đ
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MdAttachMoney className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Math.round(stats.avgAmount).toLocaleString()} đ
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MdCheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Card */}
      <motion.div
        className="bg-white rounded-lg shadow-sm border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-6">
            <button
              className={`${
                activeTab === "candidates"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors`}
              onClick={() => onChangeTab("candidates")}
            >
              Candidates
            </button>
            <button
              className={`${
                activeTab === "processed"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors`}
              onClick={() => onChangeTab("processed")}
            >
              Processed
            </button>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by booking ID, renter name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Info Bar */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <div className="text-sm text-gray-600">
            {loading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Loading...
              </span>
            ) : (
              <span>
                Showing {filteredItems.length} of {total} item
                {total === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Rows:</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(1);
              }}
              className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pageSizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Renter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {!loading && filteredItems.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-8 text-center text-sm text-gray-500"
                    colSpan={6}
                  >
                    {searchTerm ? "No matching results" : "No data"}
                  </td>
                </tr>
              )}
              {filteredItems.map((it, idx) => {
                const renter = it.renterInfo?.name || "-";
                const amount = it.deposit?.amount ?? 0;
                const method = it.deposit?.payos ? "PayOS" : "Direct";
                return (
                  <motion.tr
                    key={it._id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedItem(it)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {it.bookingId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {renter}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {amount.toLocaleString()} đ
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                        {it.deposit?.status || it.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {method}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(it.updatedAt).toLocaleString("vi-VN")}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              page <= 1 || loading
                ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            Previous
          </button>
          <div className="text-sm text-gray-600 font-medium">
            Page {page} of {totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              page >= totalPages || loading
                ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            Next
          </button>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <h2 className="text-xl font-bold text-gray-900">
                  Refund Details
                </h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Booking Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                    Booking Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Booking ID</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedItem.bookingId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                        {selectedItem.deposit?.status || selectedItem.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Renter Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center">
                    <MdPerson className="w-4 h-4 mr-2" />
                    Renter Information
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Name</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedItem.renterInfo?.name || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedItem.renterInfo?.email || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Phone</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedItem.renterInfo?.phone || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deposit Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center">
                    <MdAttachMoney className="w-4 h-4 mr-2" />
                    Deposit Information
                  </h3>
                  <div className="bg-green-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Amount</span>
                      <span className="text-lg font-bold text-green-600">
                        {(selectedItem.deposit?.amount || 0).toLocaleString()} đ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Payment Method
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedItem.deposit?.payos
                          ? "PayOS"
                          : "Direct Deposit"}
                      </span>
                    </div>
                    {selectedItem.deposit?.payos?.orderCode && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Order Code
                        </span>
                        <span className="text-sm font-mono text-gray-900">
                          {selectedItem.deposit.payos.orderCode}
                        </span>
                      </div>
                    )}
                    {selectedItem.deposit?.providerRef && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Provider Ref
                        </span>
                        <span className="text-sm font-mono text-gray-900">
                          {selectedItem.deposit.providerRef}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center">
                    <MdCalendarToday className="w-4 h-4 mr-2" />
                    Timestamps
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created At</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(selectedItem.createdAt).toLocaleString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Last Updated
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(selectedItem.updatedAt).toLocaleString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Update Request (Processed only) */}
                {activeTab === "processed" && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                      Update Request
                    </h3>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Status
                          </label>
                          <select
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={updateForm.status}
                            onChange={(e) =>
                              setUpdateForm((f) => ({
                                ...f,
                                status: e.target.value,
                              }))
                            }
                          >
                            <option value="pending">pending</option>
                            <option value="approved">approved</option>
                            <option value="rejected">rejected</option>
                            <option value="processing">processing</option>
                            <option value="completed">completed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Request ID
                          </label>
                          <input
                            type="text"
                            className="w-full border rounded px-3 py-2 text-sm"
                            placeholder="manual refund id"
                            value={
                              updateForm.id || selectedItem.manualRefundId || ""
                            }
                            onChange={(e) =>
                              setUpdateForm((f) => ({
                                ...f,
                                id: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Note
                        </label>
                        <textarea
                          className="w-full border rounded px-3 py-2 text-sm"
                          rows={3}
                          value={updateForm.note}
                          onChange={(e) =>
                            setUpdateForm((f) => ({
                              ...f,
                              note: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Add files (max 5)
                        </label>
                        <input
                          type="file"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setUpdateForm((f) => ({
                              ...f,
                              addFiles: files.slice(0, 5),
                            }));
                          }}
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          disabled={
                            updating ||
                            (!updateForm.id && !selectedItem.manualRefundId)
                          }
                          onClick={async () => {
                            try {
                              setUpdating(true);
                              const id =
                                updateForm.id ||
                                selectedItem.manualRefundId ||
                                "";
                              await staffAPI.updateManualRefund(id, {
                                status: updateForm.status,
                                note: updateForm.note,
                                addFiles: updateForm.addFiles,
                              });
                              await fetchData(false);
                              setSelectedItem(null);
                            } catch (err) {
                              alert(
                                err instanceof Error
                                  ? err.message
                                  : "Failed to update manual refund"
                              );
                            } finally {
                              setUpdating(false);
                            }
                          }}
                          className="px-4 py-2 rounded-lg bg-black text-white text-sm disabled:opacity-50"
                        >
                          {updating ? "Updating..." : "Update"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              className="bg-white rounded-xl max-w-lg w-full shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold">New Manual Refund</h2>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <MdClose className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Booking ID
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={createForm.booking}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, booking: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={createForm.amount}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          amount:
                            e.target.value === "" ? "" : Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Reason
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={createForm.reason}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, reason: e.target.value }))
                      }
                      placeholder="Refund reason"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Attachments (max 5)
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setCreateForm((f) => ({
                        ...f,
                        attachments: files.slice(0, 5),
                      }));
                    }}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg border text-sm"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-black text-white text-sm disabled:opacity-50"
                  disabled={
                    creating || !createForm.booking || createForm.amount === ""
                  }
                  onClick={async () => {
                    try {
                      setCreating(true);
                      await staffAPI.createManualRefund({
                        booking: createForm.booking,
                        amount: Number(createForm.amount),
                        reason: createForm.reason,
                        attachments: createForm.attachments,
                      });
                      setShowCreate(false);
                      if (activeTab !== "processed") setActiveTab("processed");
                      await fetchData(false);
                      setCreateForm({
                        booking: "",
                        amount: "",
                        reason: "",
                        attachments: [],
                      });
                    } catch (err) {
                      alert(
                        err instanceof Error
                          ? err.message
                          : "Failed to create manual refund"
                      );
                    } finally {
                      setCreating(false);
                    }
                  }}
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManualRefunds;
