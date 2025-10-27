import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdAdd,
  MdDirectionsCar,
  MdAssignment,
  MdVisibility,
  MdClose,
  MdCalendarToday,
  MdPerson,
  MdLocationOn,
} from "react-icons/md";
import CustomSelect from "../../../components/CustomSelect";
import staffAPI from "../../../service/apiStaff/API";
import type {
  BookingTransactionItem,
  AdminBookingTransactionsResponse,
} from "../../../types/bookings";
import type { RawApiVehicle } from "../../../types/vehicle";
import { getAllStations, type Station } from "../../../service/apiAdmin/apiStation/API";

const VehicleHandover = () => {
  // List state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<BookingTransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detail modal
  const [selected, setSelected] = useState<BookingTransactionItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [vehiclesOptions, setVehiclesOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [stations, setStations] = useState<Station[]>([]);
  const stationOptions = useMemo(
    () => stations.map((s) => ({ value: s._id, label: s.name })),
    [stations]
  );
  const [createForm, setCreateForm] = useState({
    vehicle: "",
    pickupStation: "",
    dropoffStation: "",
    startDate: "",
    endDate: "",
    rentalType: "daily" as "daily" | "hourly",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  // success toast (optional): omitted in UI to keep screen clean

  const openCreateModal = () => setIsCreateOpen(true);
  const closeCreateModal = () => setIsCreateOpen(false);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Fetch list
  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res: AdminBookingTransactionsResponse =
          await staffAPI.getAdminBookingTransactions({ page, limit });
        if (!active) return;
        setItems(res.items || []);
        setTotal(res.total || 0);
      } catch (e: unknown) {
        if (!active) return;
        const msg = e instanceof Error ? e.message : "Failed to load bookings";
        setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, [page, limit]);

  // Prefetch vehicles + stations for create modal
  useEffect(() => {
    let active = true;
    const preload = async () => {
      try {
        const [vehiclesRes, stationsRes] = await Promise.all([
          staffAPI.getVehicles({ page: 1, limit: 100 }),
          getAllStations(),
        ]);
        if (!active) return;
        setVehiclesOptions(
          (vehiclesRes?.data || []).map((v: RawApiVehicle) => ({
            value: v._id,
            label: `${v.brand} ${v.model} - ${v.plateNumber}`,
          }))
        );
        setStations(stationsRes || []);
      } catch (err) {
        // Silently ignore preload failures; the create modal can still show inputs
        console.warn("Preload vehicles/stations failed", err);
      }
    };
    preload();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const byStatus = items.reduce((acc, it) => {
      acc[it.status] = (acc[it.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return {
      total,
      cancelled: byStatus["cancelled"] || 0,
      expired: byStatus["expired"] || 0,
      created: byStatus["created"] || 0,
    };
  }, [items, total]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    // no toast state
    try {
      await staffAPI.createBooking({
        vehicle: createForm.vehicle,
        pickupStation: createForm.pickupStation,
        dropoffStation: createForm.dropoffStation || createForm.pickupStation,
        startDate: new Date(createForm.startDate).toISOString(),
        endDate: new Date(createForm.endDate).toISOString(),
        rentalType: createForm.rentalType,
      });
      // Refresh list
      setPage(1);
      const res = await staffAPI.getAdminBookingTransactions({
        page: 1,
        limit,
      });
      setItems(res.items || []);
      setTotal(res.total || 0);
      // Reset form
      setCreateForm({
        vehicle: "",
        pickupStation: "",
        dropoffStation: "",
        startDate: "",
        endDate: "",
        rentalType: "daily",
      });
      // optional: show toast here
      closeCreateModal();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create booking";
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  const openDetail = (b: BookingTransactionItem) => {
    setSelected(b);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <MdDirectionsCar className="w-8 h-8 mr-3 text-blue-600" />
              Vehicle Handover
            </h1>
            <p className="text-gray-600">
              Manage vehicle handovers and track rental status
            </p>
          </div>
          <motion.button
            onClick={openCreateModal}
            className="bg-gray-900 cursor-pointer text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MdAdd className="w-5 h-5" />
            <span>Create Vehicle Handover</span>
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {[
          {
            title: "Total Bookings",
            value: stats.total,
            icon: MdAssignment,
            bg: "bg-blue-100",
            fg: "text-blue-600",
          },
          {
            title: "Cancelled",
            value: stats.cancelled,
            icon: MdAssignment,
            bg: "bg-red-100",
            fg: "text-red-600",
          },
          {
            title: "Expired",
            value: stats.expired,
            icon: MdDirectionsCar,
            bg: "bg-amber-100",
            fg: "text-amber-600",
          },
        ].map((s, i) => (
          <motion.div
            key={s.title}
            className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-12 h-12 ${s.bg} rounded-lg flex items-center justify-center`}
              >
                <s.icon className={`w-6 h-6 ${s.fg}`} />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {s.value}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm">{s.title}</h3>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Handovers Table */}
      <motion.div
        className="bg-white rounded-xl border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="p-6 border-b border-gray-100">
          <motion.h3
            className="text-lg font-semibold text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Booking Transactions
          </motion.h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Booking ID",
                  "Renter",
                  "Vehicle",
                  "Station",
                  "Status",
                  "Created",
                  "Action",
                ].map((header, index) => (
                  <motion.th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                  >
                    {header}
                  </motion.th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td className="px-6 py-6 text-sm text-gray-500" colSpan={7}>
                    Loading bookings...
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td className="px-6 py-6 text-sm text-gray-500" colSpan={7}>
                    No bookings found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((b, index) => (
                  <motion.tr
                    key={b._id}
                    className="hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openDetail(b)}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 underline"
                      >
                        {b.bookingId}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {b.renterInfo?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {b.vehicleInfo?.brand} {b.vehicleInfo?.model} -{" "}
                      {b.vehicleInfo?.plateNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {b.stationInfo?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          b.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : b.status === "expired"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(b.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openDetail(b)}
                        className="text-gray-600 hover:text-gray-900"
                        title="View details"
                      >
                        <MdVisibility className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            Showing {total === 0 ? 0 : (page - 1) * limit + 1}-
            {Math.min(page * limit, total)} of {total}
          </div>
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              Prev
            </button>
            <span className="text-sm text-gray-700">
              Page {page} / {totalPages}
            </span>
            <button
              className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
            >
              Next
            </button>
            <CustomSelect
              className="ml-2"
              value={limit}
              options={[
                { value: 5, label: "5 / page" },
                { value: 10, label: "10 / page" },
                { value: 20, label: "20 / page" },
                { value: 50, label: "50 / page" },
              ]}
              onChange={(v: string | number) => {
                setLimit(Number(v));
                setPage(1);
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Create Booking Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl max-w-3xl w-full p-6 overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Create Booking</h2>
                <button
                  onClick={closeCreateModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>
              {createError && (
                <div className="mb-3 px-3 py-2 rounded bg-red-50 text-red-700 text-sm">
                  {createError}
                </div>
              )}
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Vehicle
                    </label>
                    <CustomSelect
                      className="mt-1"
                      value={createForm.vehicle}
                      options={[
                        { value: "", label: "Select vehicle" },
                        ...vehiclesOptions,
                      ]}
                      onChange={(v: string | number) =>
                        setCreateForm((s) => ({ ...s, vehicle: String(v) }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Rental Type
                    </label>
                    <CustomSelect
                      className="mt-1"
                      value={createForm.rentalType}
                      options={[
                        { value: "daily", label: "Daily" },
                        { value: "hourly", label: "Hourly" },
                      ]}
                      onChange={(v: string | number) =>
                        setCreateForm((s) => ({
                          ...s,
                          rentalType: v as "daily" | "hourly",
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Pickup Station
                    </label>
                    <CustomSelect
                      className="mt-1"
                      value={createForm.pickupStation}
                      options={[
                        { value: "", label: "Select station" },
                        ...stationOptions,
                      ]}
                      onChange={(v: string | number) =>
                        setCreateForm((s) => ({
                          ...s,
                          pickupStation: String(v),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Dropoff Station
                    </label>
                    <CustomSelect
                      className="mt-1"
                      value={createForm.dropoffStation}
                      options={[
                        { value: "", label: "Same as pickup" },
                        ...stationOptions,
                      ]}
                      onChange={(v: string | number) =>
                        setCreateForm((s) => ({
                          ...s,
                          dropoffStation: String(v),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Start
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full mt-1 border-2 rounded-xl px-3 py-2"
                      value={createForm.startDate}
                      onChange={(e) =>
                        setCreateForm((s) => ({
                          ...s,
                          startDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      End
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full mt-1 border-2 rounded-xl px-3 py-2"
                      value={createForm.endDate}
                      onChange={(e) =>
                        setCreateForm((s) => ({
                          ...s,
                          endDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60"
                  >
                    {creating ? "Creating..." : "Create Booking"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selected && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white h-[90%] rounded-xl max-w-2xl w-full overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Booking Details - {selected.bookingId}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6 h-[calc(100%_-_100px)] overflow-y-auto">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MdPerson className="w-5 h-5 mr-2" />
                    Renter
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-900">
                    <p>
                      <span className="text-gray-600">Name: </span>
                      {selected.renterInfo?.name}
                    </p>
                    <p>
                      <span className="text-gray-600">Phone: </span>
                      {selected.renterInfo?.phone}
                    </p>
                    <p className="md:col-span-2">
                      <span className="text-gray-600">Email: </span>
                      {selected.renterInfo?.email}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MdDirectionsCar className="w-5 h-5 mr-2" />
                    Vehicle
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-900">
                    <p>
                      {selected.vehicleInfo?.brand}{" "}
                      {selected.vehicleInfo?.model} -{" "}
                      {selected.vehicleInfo?.plateNumber}
                    </p>
                    <p className="flex items-center">
                      <MdLocationOn className="w-4 h-4 mr-1" />
                      {selected.stationInfo?.name}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MdCalendarToday className="w-5 h-5 mr-2" />
                    Meta
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-900">
                    <p>
                      <span className="text-gray-600">Status: </span>
                      {selected.status}
                    </p>
                    <p>
                      <span className="text-gray-600">Created: </span>
                      {new Date(selected.createdAt).toLocaleString()}
                    </p>
                    <p className="md:col-span-2">
                      <span className="text-gray-600">Deposit: </span>
                      {selected.deposit?.amount?.toLocaleString()}{" "}
                      {selected.deposit?.currency}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehicleHandover;
