import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  FileText,
  Loader2,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import bookingApi from "../../../../../../../../service/apiBooking/API";

type Props = { isOpen: boolean; onClose: () => void; bookingId: string };

type ContractPayload = {
  bookingId: string;
  status: string;
  vehicle?: { plateNumber?: string; brand?: string; model?: string };
  renter?: { name?: string; phone?: string };
  contract?: { url?: string; type?: string };
  startTime?: string;
  endTime?: string;
};

export default function ContractModal({ isOpen, onClose, bookingId }: Props) {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<ContractPayload | null>(null);
  const [error, setError] = useState("");
  const [scale, setScale] = useState(1);

  const url = payload?.contract?.url || "";
  const fileType = payload?.contract?.type || "image";

  const startFmt = useMemo(() => {
    if (!payload?.startTime) return "";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(payload.startTime));
  }, [payload?.startTime]);

  const endFmt = useMemo(() => {
    if (!payload?.endTime) return "";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(payload.endTime));
  }, [payload?.endTime]);

  useEffect(() => {
    let mounted = true;
    const fetchContract = async () => {
      if (!isOpen || !bookingId) return;
      setLoading(true);
      setError("");
      setPayload(null);
      try {
        const res = await bookingApi.getBookingContract(bookingId);
        const shaped = res as unknown as {
          success?: boolean;
          data?: {
            bookingId?: string;
            status?: string;
            vehicle?: { plateNumber?: string; brand?: string; model?: string };
            renter?: { name?: string; phone?: string };
            contract?: { url?: string; type?: string };
            startTime?: string;
            endTime?: string;
          };
        };
        if (shaped?.data && mounted) {
          setPayload({
            bookingId: shaped.data.bookingId || "",
            status: shaped.data.status || "",
            vehicle: shaped.data.vehicle,
            renter: shaped.data.renter,
            contract: shaped.data.contract,
            startTime: shaped.data.startTime,
            endTime: shaped.data.endTime,
          });
        } else if (mounted) {
          setError("Contract not found");
        }
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
      setScale(1);
    };
  }, [isOpen, bookingId]);

  const zoomIn = () =>
    setScale((s) => Math.min(2.5, Number((s + 0.25).toFixed(2))));
  const zoomOut = () =>
    setScale((s) => Math.max(0.5, Number((s - 0.25).toFixed(2))));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 py-6 flex items-center justify-between flex-shrink-0">
              <div className="relative flex items-center space-x-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                >
                  <FileText className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-bold text-white"
                  >
                    Booking Contract
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-gray-300"
                  >
                    {payload?.vehicle?.brand} {payload?.vehicle?.model}
                  </motion.p>
                </div>
              </div>

              <div className="flex gap-2">
                {!!url && (
                  <>
                    <button
                      type="button"
                      onClick={zoomOut}
                      className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                      aria-label="Zoom out"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={zoomIn}
                      className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                      aria-label="Zoom in"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        window.open(url, "_blank", "noopener,noreferrer")
                      }
                      className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                      aria-label="Open in new tab"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </>
                )}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                </div>
              )}

              {!!error && !loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {payload && !loading && !error && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InfoCard
                        label="Status"
                        value={payload.status}
                        capitalize
                      />
                      <InfoCard
                        label="Vehicle"
                        value={`${payload.vehicle?.brand || ""} ${
                          payload.vehicle?.model || ""
                        } - ${payload.vehicle?.plateNumber || ""}`}
                      />
                      <InfoCard
                        label="Renter"
                        value={payload.renter?.name || ""}
                      />
                      <InfoCard
                        label="Renter Phone"
                        value={payload.renter?.phone || ""}
                      />
                      <InfoCard label="Start Time" value={startFmt} />
                      <InfoCard label="End Time" value={endFmt} />
                    </div>
                  </div>

                  {url ? (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Contract Document
                      </h3>

                      {fileType === "image" ? (
                        <div className="w-full flex items-center justify-center">
                          <img
                            src={url}
                            alt="Contract"
                            style={{
                              transform: `scale(${scale})`,
                              transition: "transform 0.2s",
                            }}
                            className="max-w-full rounded-lg shadow-md"
                            onError={() =>
                              window.open(url, "_blank", "noopener,noreferrer")
                            }
                          />
                        </div>
                      ) : (
                        <div className="w-full flex flex-col items-center justify-center gap-3">
                          <p className="text-sm text-gray-600">
                            Preview not supported. Open in a new tab to view or
                            download.
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              window.open(url, "_blank", "noopener,noreferrer")
                            }
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Open Contract
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                      <p className="text-gray-600">
                        Contract document not available for this booking.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoCard({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p
        className={`text-base font-semibold text-gray-900 ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
