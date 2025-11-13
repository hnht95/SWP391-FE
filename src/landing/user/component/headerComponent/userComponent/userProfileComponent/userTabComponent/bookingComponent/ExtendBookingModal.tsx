import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Clock } from "lucide-react";
import { useState } from "react";
import bookingApi from "../../../../../../../../service/apiBooking/API";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onExtended?: (info: { additionalCharge: number; newEndTime: string }) => void;
};

export default function ExtendBookingModal({
  isOpen,
  onClose,
  bookingId,
  onExtended,
}: Props) {
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const submit = async () => {
    if (days <= 0 && hours <= 0) {
      setError("Please enter additional hours or days");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await bookingApi.extendBooking(bookingId, {
        addDays: days > 0 ? days : undefined,
        addHours: hours > 0 ? hours : undefined,
      });
      onExtended?.({
        additionalCharge: res.additionalCharge,
        newEndTime: res.newEndTime,
      });
      onClose();
      setDays(0);
      setHours(0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to extend booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6"
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Extend Booking</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Additional Days
                </label>
                <input
                  type="number"
                  min={0}
                  value={Number.isFinite(days) ? days : 0}
                  onChange={(e) => setDays(Number(e.target.value) || 0)}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Additional Hours
                </label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={Number.isFinite(hours) ? hours : 0}
                  onChange={(e) => setHours(Number(e.target.value) || 0)}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="0"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Extending..." : "Confirm Extend"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
