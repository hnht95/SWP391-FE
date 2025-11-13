import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, FileText, Loader2 } from "lucide-react";
import bookingApi from "../../../../../../../../service/apiBooking/API";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
};

export default function ContractModal({ isOpen, onClose, bookingId }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [url, setUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    const fetchContract = async () => {
      if (!isOpen || !bookingId) return;
      setLoading(true);
      setError("");
      try {
        const res = await bookingApi.getBookingContract(bookingId);
        const u = res?.contract?.url || "";
        if (mounted) setUrl(u);
      } catch (e: unknown) {
        if (mounted)
          setError(e instanceof Error ? e.message : "Failed to load contract");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchContract();
    return () => {
      mounted = false;
    };
  }, [isOpen, bookingId]);

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
            className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Booking Contract</h3>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              )}
              {!loading && error && (
                <p className="text-red-600 text-center py-6">{error}</p>
              )}
              {!loading && !error && !!url && (
                <div className="h-[70vh]">
                  {/* Hiển thị PDF trong iframe, fallback open in new tab */}
                  <iframe
                    title="Contract"
                    src={url}
                    className="w-full h-full rounded-lg border"
                  />
                  <div className="text-right mt-3">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Open in new tab
                    </a>
                  </div>
                </div>
              )}
              {!loading && !error && !url && (
                <p className="text-gray-600 text-center py-6">
                  Contract not found for this booking.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
