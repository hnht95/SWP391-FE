import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdSearch,
  MdAttachMoney,
  MdPerson,
  MdClose,
  MdCheckCircle,
  MdReceipt,
  MdEdit,
  MdInfo,
  MdAttachFile,
} from "react-icons/md";
import staffAPI, { type RefundDetail } from "../../../service/apiStaff/API";
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
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [refundDetail, setRefundDetail] = useState<RefundDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [refundForm, setRefundForm] = useState<{
    bookingId: string;
    amount: number | "";
    reason: string;
    attachments: File[];
    reference: string;
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    autoFilled: boolean;
  }>({
    bookingId: "",
    amount: "",
    reason: "",
    attachments: [],
    reference: "",
    bankCode: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    autoFilled: false,
  });
  // Removed updateForm & update functionality in redesigned view

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
    return items.filter((it) => {
      const renter = typeof it.renter === "object" ? it.renter : it.renterInfo;
      const bookingId = it.bookingId || it._id;
      return (
        bookingId?.toLowerCase().includes(term) ||
        renter?.name?.toLowerCase().includes(term) ||
        renter?.email?.toLowerCase().includes(term)
      );
    });
  }, [items, searchTerm]);

  const getRenterInfo = (item: BookingTransactionItem) => {
    return typeof item.renter === "object" ? item.renter : item.renterInfo;
  };

  const getVehicleInfo = (item: BookingTransactionItem) => {
    return typeof item.vehicle === "object" ? item.vehicle : item.vehicleInfo;
  };

  // Station info not needed in new detail design

  const openRefundModal = (item: BookingTransactionItem) => {
    setSelectedItem(item);
    const refundableAmount =
      item.refundableRemaining ?? item.deposit?.amount ?? 0;
    setRefundForm({
      bookingId: item.bookingId || item._id, // Use bookingId from BE response
      amount: refundableAmount,
      reason: "",
      attachments: [],
      reference: "",
      bankCode: "",
      bankName: "",
      accountNumber: "",
      accountName: "",
      autoFilled: false,
    });
    setShowRefundModal(true);
    // Try auto fetch beneficiary/payment method details
    void (async () => {
      try {
        const res = await staffAPI.getManualRefundBeneficiary(
          item.bookingId || item._id
        );
        if (res?.beneficiary) {
          setRefundForm((f) => ({
            ...f,
            bankCode: res.beneficiary?.bankCode || f.bankCode,
            bankName: res.beneficiary?.bankName || f.bankName,
            accountNumber: res.beneficiary?.accountNumber || f.accountNumber,
            accountName: res.beneficiary?.accountName || f.accountName,
            reference: res.reference || f.reference,
            autoFilled: true,
          }));
        }
      } catch {
        // silent; leave manual entry
      }
    })();
  };

  const openDetailModal = (item: BookingTransactionItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
    if (activeTab === "processed") {
      const refundId = item.manualRefundId || item._id;
      if (!refundId) return;
      setDetailLoading(true);
      setRefundDetail(null);
      void (async () => {
        try {
          const data = await staffAPI.getManualRefundDetail(refundId);
          setRefundDetail(data);
        } catch (e) {
          console.warn("Failed to fetch refund detail", e);
        } finally {
          setDetailLoading(false);
        }
      })();
    }
  };

  const handleRefund = async () => {
    if (!refundForm.bookingId || refundForm.amount === "") return;
    // Basic validation for beneficiary fields (require manual entry if not auto-filled)
    if (
      !refundForm.autoFilled &&
      (!refundForm.bankCode ||
        !refundForm.bankName ||
        !refundForm.accountNumber ||
        !refundForm.accountName)
    ) {
      alert("Please fill all beneficiary bank fields or wait for auto-fill.");
      return;
    }
    try {
      setProcessing(true);
      await staffAPI.createManualRefund({
        bookingId: refundForm.bookingId,
        amount: Number(refundForm.amount),
        reason: refundForm.reason,
        reference: refundForm.reference || refundForm.reason,
        beneficiary: {
          bankCode: refundForm.bankCode,
          bankName: refundForm.bankName,
          accountNumber: refundForm.accountNumber,
          accountName: refundForm.accountName,
        },
        attachments: refundForm.attachments,
      });
      setShowRefundModal(false);
      setRefundForm({
        bookingId: "",
        amount: "",
        reason: "",
        attachments: [],
        reference: "",
        bankCode: "",
        bankName: "",
        accountNumber: "",
        accountName: "",
        autoFilled: false,
      });
      setSelectedItem(null);
      await fetchData(false);
      if (activeTab !== "processed") setActiveTab("processed");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to create manual refund"
      );
    } finally {
      setProcessing(false);
    }
  };

  // Update handler removed with redesign

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
              Review candidates and process manual refunds
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content Card */}
      <motion.div
        className="bg-white rounded-lg shadow-sm border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`${
                activeTab === "candidates"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-semibold transition-colors`}
              onClick={() => onChangeTab("candidates")}
            >
              Candidates ({total})
            </button>
            <button
              className={`${
                activeTab === "processed"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap border-b-2 px-1 py-4 text-sm font-semibold transition-colors`}
              onClick={() => onChangeTab("processed")}
            >
              Processed
            </button>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by booking ID, renter name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(parseInt(e.target.value, 10));
                  setPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                {pageSizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200 flex items-start">
            <MdClose className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Renter
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                      <span className="ml-3 text-gray-600">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-12 text-center text-sm text-gray-500"
                    colSpan={7}
                  >
                    <div className="flex flex-col items-center">
                      <MdAttachMoney className="w-12 h-12 text-gray-300 mb-2" />
                      <span>
                        {searchTerm
                          ? "No matching results"
                          : "No bookings found"}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((it, idx) => {
                  const renter = getRenterInfo(it);

                  const bookingId = it.bookingId || it._id;
                  const refundable = it.amount || 0;
                  const method = it.deposit?.payos ? "PayOS" : "Direct";
                  const statusBadge =
                    it.status === "cancelled"
                      ? "cancelled"
                      : it.deposit?.status || it.status;
                  return (
                    <motion.tr
                      key={it._id}
                      className="hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {bookingId.slice(-6).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {renter?.name || "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {renter?.email || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">
                          {refundable.toLocaleString()} đ
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            statusBadge === "captured"
                              ? "bg-green-100 text-green-800"
                              : statusBadge === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : statusBadge === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {statusBadge}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {method}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(it.updatedAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {activeTab === "candidates" ? (
                            <button
                              onClick={() => openRefundModal(it)}
                              disabled={refundable <= 0}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <MdAttachMoney className="w-4 h-4 mr-1" />
                              Refund
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => openDetailModal(it)}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <MdInfo className="w-4 h-4 mr-1" />
                                Details
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {filteredItems.length} of {total} result
            {total === 1 ? "" : "s"}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                page <= 1 || loading
                  ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
                  : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
              }`}
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm font-medium text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                page >= totalPages || loading
                  ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
                  : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>

      {/* Refund Modal */}
      <AnimatePresence>
        {showRefundModal && selectedItem && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRefundModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                    <MdAttachMoney className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Process Manual Refund
                    </h2>
                    <p className="text-xs text-gray-500">
                      Booking: {selectedItem.bookingId}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Booking Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-5 border border-blue-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                    <MdReceipt className="w-4 h-4 mr-2 text-blue-600" />
                    Booking Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Renter</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {getRenterInfo(selectedItem)?.name || "-"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getRenterInfo(selectedItem)?.email || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Vehicle</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {getVehicleInfo(selectedItem)?.plateNumber || "-"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getVehicleInfo(selectedItem)?.brand}{" "}
                        {getVehicleInfo(selectedItem)?.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        Original Deposit
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {(selectedItem.deposit?.amount || 0).toLocaleString()} đ
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        Refundable Amount
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        {(
                          selectedItem.refundableRemaining ??
                          selectedItem.deposit?.amount ??
                          0
                        ).toLocaleString()}{" "}
                        đ
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        Payment Method
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedItem.deposit?.payos
                          ? "PayOS"
                          : "Direct Deposit"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        Booking Status
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          selectedItem.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : selectedItem.deposit?.status === "captured"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedItem.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Refund Form */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                    <MdEdit className="w-4 h-4 mr-2" />
                    Refund Details
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Refund Amount <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={refundForm.amount}
                          onChange={(e) =>
                            setRefundForm((f) => ({
                              ...f,
                              amount:
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                            }))
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="Enter amount"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                          đ
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Booking ID
                      </label>
                      <input
                        type="text"
                        value={refundForm.bookingId}
                        disabled
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600"
                      />
                    </div>
                  </div>

                  {/* Beneficiary Bank Details */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-xs font-semibold text-gray-800 mb-3 flex items-center">
                      Beneficiary Bank Details
                      {refundForm.autoFilled && (
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                          Auto-Filled
                        </span>
                      )}
                      {!refundForm.autoFilled && (
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                          Manual Entry Required
                        </span>
                      )}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Bank Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={refundForm.bankCode}
                          onChange={(e) =>
                            setRefundForm((f) => ({
                              ...f,
                              bankCode: e.target.value.toUpperCase(),
                            }))
                          }
                          disabled={refundForm.autoFilled}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
                          placeholder="e.g. VCB"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Bank Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={refundForm.bankName}
                          onChange={(e) =>
                            setRefundForm((f) => ({
                              ...f,
                              bankName: e.target.value,
                            }))
                          }
                          disabled={refundForm.autoFilled}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
                          placeholder="e.g. Vietcombank"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Account Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={refundForm.accountNumber}
                          onChange={(e) =>
                            setRefundForm((f) => ({
                              ...f,
                              accountNumber: e.target.value,
                            }))
                          }
                          disabled={refundForm.autoFilled}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
                          placeholder="Account number"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Account Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={refundForm.accountName}
                          onChange={(e) =>
                            setRefundForm((f) => ({
                              ...f,
                              accountName: e.target.value.toUpperCase(),
                            }))
                          }
                          disabled={refundForm.autoFilled}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
                          placeholder="FULL NAME"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Reference / Transfer Note
                        </label>
                        <input
                          type="text"
                          value={refundForm.reference}
                          onChange={(e) =>
                            setRefundForm((f) => ({
                              ...f,
                              reference: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-black"
                          placeholder="Refund deposit technical..."
                        />
                      </div>
                      {refundForm.autoFilled && (
                        <div className="col-span-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setRefundForm((f) => ({
                                ...f,
                                autoFilled: false,
                              }))
                            }
                            className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                          >
                            Edit Beneficiary Fields
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Reason / Notes
                    </label>
                    <textarea
                      value={refundForm.reason}
                      onChange={(e) =>
                        setRefundForm((f) => ({ ...f, reason: e.target.value }))
                      }
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                      placeholder="Explain the reason for this manual refund..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      <MdAttachFile className="inline w-4 h-4 mr-1" />
                      Attachments (max 5 files)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setRefundForm((f) => ({
                            ...f,
                            attachments: files.slice(0, 5),
                          }));
                        }}
                        className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                      />
                      {refundForm.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {refundForm.attachments.map((file, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 bg-gray-100 text-xs rounded-lg"
                            >
                              {file.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRefund}
                  disabled={
                    processing ||
                    !refundForm.bookingId ||
                    refundForm.amount === ""
                  }
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <MdCheckCircle className="w-4 h-4 mr-2" />
                      Process Refund
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail/Update Modal */}
      <AnimatePresence>
        {showDetailModal && selectedItem && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <MdInfo className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Refund Details & Update
                    </h2>
                    <p className="text-xs text-gray-500">
                      Booking: {selectedItem.bookingId}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {activeTab === "processed" ? (
                  detailLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mb-4" />
                      <p className="text-sm text-gray-600">
                        Loading refund detail...
                      </p>
                    </div>
                  ) : refundDetail ? (
                    <div className="space-y-6">
                      {/* Status & Amount */}
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="text-3xl font-bold text-gray-900">
                          {(refundDetail.amount || 0).toLocaleString()} đ
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                            refundDetail.status === "done"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {refundDetail.status}
                        </span>
                        {refundDetail.method && (
                          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700">
                            {refundDetail.method}
                          </span>
                        )}
                        {refundDetail.reference && (
                          <span className="text-xs text-gray-500 truncate max-w-xs">
                            {refundDetail.reference}
                          </span>
                        )}
                      </div>

                      {/* Booking & Payment */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
                          <h3 className="text-xs font-semibold mb-3 flex items-center">
                            <MdReceipt className="w-4 h-4 mr-1 text-blue-600" />
                            Booking
                          </h3>
                          <p className="text-xs text-gray-600">Booking ID</p>
                          <p className="font-mono text-sm font-semibold text-gray-900 mb-2">
                            {refundDetail.booking?._id || "-"}
                          </p>
                          <p className="text-xs text-gray-600">Status</p>
                          <p className="text-sm font-medium text-gray-900 mb-2">
                            {refundDetail.booking?.status || "-"}
                          </p>
                          <p className="text-xs text-gray-600">Deposit</p>
                          <p className="text-sm font-bold text-gray-900">
                            {(
                              refundDetail.booking?.deposit?.amount || 0
                            ).toLocaleString()}{" "}
                            đ
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
                          <h3 className="text-xs font-semibold mb-3 flex items-center">
                            <MdPerson className="w-4 h-4 mr-1 text-purple-600" />
                            Renter
                          </h3>
                          <p className="text-sm font-semibold text-gray-900">
                            {refundDetail.renter?.name || "-"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {refundDetail.renter?.email || "-"}
                          </p>
                          <p className="text-xs text-gray-600 mt-2">Phone</p>
                          <p className="text-sm font-medium text-gray-900">
                            {refundDetail.renter?.phone || "-"}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                          <h3 className="text-xs font-semibold mb-3 flex items-center">
                            <MdAttachMoney className="w-4 h-4 mr-1 text-green-600" />
                            Beneficiary
                          </h3>
                          <p className="text-xs text-gray-600">Bank</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {refundDetail.beneficiary?.bankName || "-"} (
                            {refundDetail.beneficiary?.bankCode || "---"})
                          </p>
                          <p className="text-xs text-gray-600 mt-2">Account</p>
                          <p className="text-sm font-medium text-gray-900 break-all">
                            {refundDetail.beneficiary?.accountNumber || "-"}
                          </p>
                          <p className="text-xs text-gray-600 mt-2">
                            Account Name
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {refundDetail.beneficiary?.accountName || "-"}
                          </p>
                        </div>
                      </div>

                      {/* Amounts Breakdown */}
                      {refundDetail.booking?.amounts && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">
                            Amounts Breakdown
                          </h3>
                          <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {Object.entries(refundDetail.booking.amounts)
                              .filter((entry) => {
                                const v = entry[1];
                                return typeof v === "number" && v > 0;
                              })
                              .map(([amountKey, val]) => (
                                <div
                                  key={amountKey}
                                  className="text-center bg-white/60 rounded-lg p-2"
                                >
                                  <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">
                                    {amountKey}
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {Number(val).toLocaleString()} đ
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Attachments */}
                      {refundDetail.attachments &&
                        refundDetail.attachments.length > 0 && (
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                              <MdAttachFile className="w-4 h-4 mr-1" />
                              Attachments ({refundDetail.attachments.length})
                            </h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                              {refundDetail.attachments.map((url, i) => (
                                <button
                                  key={i}
                                  onClick={() => window.open(url, "_blank")}
                                  className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm"
                                >
                                  <img
                                    src={url}
                                    alt={`attachment-${i}`}
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors"></div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Staff & Timeline */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="text-xs font-semibold text-gray-700 mb-2">
                            Staff
                          </h4>
                          <p className="text-sm font-semibold text-gray-900">
                            {refundDetail.staff?.name || "-"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {refundDetail.staff?.email || "-"}
                          </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="text-xs font-semibold text-gray-700 mb-2">
                            Transferred At
                          </h4>
                          <p className="text-sm font-medium text-gray-900">
                            {refundDetail.transferredAt
                              ? new Date(
                                  refundDetail.transferredAt
                                ).toLocaleString("vi-VN")
                              : "-"}
                          </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="text-xs font-semibold text-gray-700 mb-2">
                            Created / Updated
                          </h4>
                          <p className="text-xs text-gray-600">
                            Created:{" "}
                            {refundDetail.createdAt
                              ? new Date(refundDetail.createdAt).toLocaleString(
                                  "vi-VN"
                                )
                              : "-"}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Updated:{" "}
                            {refundDetail.updatedAt
                              ? new Date(refundDetail.updatedAt).toLocaleString(
                                  "vi-VN"
                                )
                              : "-"}
                          </p>
                        </div>
                      </div>

                      {/* Note */}
                      {refundDetail.note && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="text-xs font-semibold text-gray-700 mb-2">
                            Note
                          </h4>
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">
                            {refundDetail.note}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-sm text-gray-500 py-12">
                      No refund detail found.
                    </div>
                  )
                ) : (
                  <div className="text-sm text-gray-600">
                    Select a processed refund to view detailed information.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManualRefunds;
