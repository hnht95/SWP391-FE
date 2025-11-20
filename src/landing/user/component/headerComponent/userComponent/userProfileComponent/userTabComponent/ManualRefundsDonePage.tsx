// src/landing/user/component/headerComponent/userComponent/userProfileComponent/userTabComponent/bookingComponent/ManualRefundsDonePage.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Building2,
  Image as ImageIcon,
  FileText,
  X,
  Car,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import profileApi, {
  type ManualRefundItem,
  type Paginated,
} from "../../../../../../../service/apiUser/profile/API";
import userBookingApi, {
  type Booking,
} from "../../../../../../../service/apiUser/booking/API";

// ✅ Image Lightbox Component
interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

const ImageLightbox = ({
  images,
  initialIndex,
  onClose,
}: ImageLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Image counter */}
      <div className="absolute top-4 left-4 text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronRight className="w-12 h-12" />
          </button>
        </>
      )}

      {/* Image */}
      <motion.img
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        src={images[currentIndex]}
        alt={`Image ${currentIndex + 1}`}
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  );
};

const isImageUrl = (u: string): boolean => {
  const url = u.toLowerCase();
  return (
    url.endsWith(".jpg") ||
    url.endsWith(".jpeg") ||
    url.endsWith(".png") ||
    url.endsWith(".webp") ||
    url.endsWith(".gif") ||
    url.includes("/image/upload")
  );
};

const extractUrlFromAttachment = (raw: string): string => {
  const md = /\((https?:\/\/[^\s)]+)\)/.exec(raw);
  if (md?.[1]) return md[1];
  const plain = /(https?:\/\/[^\s)]+)$/.exec(raw);
  return md?.[1] || plain?.[1] || raw;
};

const formatMoney = (amount: number, currency = "VND"): string => {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
};

const formatDateTime = (iso?: string): string => {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
};

const formatDate = (iso?: string): string => {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
};

export default function ManualRefundsDonePage() {
  const [data, setData] = useState<Paginated<ManualRefundItem> | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Booking details cache
  const [bookingDetails, setBookingDetails] = useState<Record<string, Booking>>(
    {}
  );
  const [loadingBookings, setLoadingBookings] = useState<Set<string>>(
    new Set()
  );

  // ✅ Lightbox state
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchRefunds = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await profileApi.getMyManualRefundsDone({ page, limit });
        if (mounted) setData(res);
      } catch (e: unknown) {
        if (mounted) {
          const errorMessage =
            e instanceof Error ? e.message : "Failed to load manual refunds";
          setError(errorMessage);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchRefunds();
    return () => {
      mounted = false;
    };
  }, [page, limit]);

  // ✅ Fetch booking details by bookingId
  const fetchBookingDetails = async (bookingId: string) => {
    if (bookingDetails[bookingId] || loadingBookings.has(bookingId)) return;

    setLoadingBookings((prev) => new Set(prev).add(bookingId));

    try {
      const booking = await userBookingApi.getBookingById(bookingId);
      setBookingDetails((prev) => ({ ...prev, [bookingId]: booking }));
    } catch (e: unknown) {
      console.error("Failed to fetch booking details:", e);
    } finally {
      setLoadingBookings((prev) => {
        const next = new Set(prev);
        next.delete(bookingId);
        return next;
      });
    }
  };

  // ✅ Load booking details for all refunds
  useEffect(() => {
    if (data?.items) {
      data.items.forEach((refund) => {
        fetchBookingDetails(refund.booking.bookingId);
      });
    }
  }, [data?.items]);

  // ✅ Get vehicle image from booking
  const getVehicleImage = (booking?: Booking): string | null => {
    if (!booking) return null;

    const vehicle = booking.vehicle;
    if (typeof vehicle === "string") return null;

    // Try normalized image first
    const normalizedImage = vehicle?.defaultPhotos?.exterior?.[0];
    if (normalizedImage) {
      if (typeof normalizedImage === "string") {
        return normalizedImage;
      }
      if (typeof normalizedImage === "object" && "url" in normalizedImage) {
        return normalizedImage.url || null;
      }
    }

    return null;
  };

  // ✅ Open lightbox
  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500">Loading manual refunds...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 font-medium mb-2">Failed to load refunds</p>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Manual Refunds</h3>
          </div>
          <p className="text-sm text-gray-600">
            Bank transfers processed by staff (Completed)
          </p>
          {items.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{items.length}</span> of{" "}
                <span className="font-semibold">{data?.total || 0}</span>{" "}
                refunds
              </p>
            </div>
          )}
        </motion.div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <CreditCard className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No manual refunds</p>
            <p className="text-sm text-gray-400 mt-2">
              Your completed refund history will appear here
            </p>
          </div>
        )}

        {/* Refunds List */}
        <div className="space-y-4">
          {items.map((refund, index) => {
            const booking = bookingDetails[refund.booking.bookingId];
            const vehicleImage = getVehicleImage(booking);

            const vehicle = booking?.vehicle;
            const vehicleBrand =
              typeof vehicle === "object" ? vehicle?.brand : "Unknown";
            const vehicleModel =
              typeof vehicle === "object" ? vehicle?.model : "Vehicle";
            const vehiclePlate =
              typeof vehicle === "object" ? vehicle?.plateNumber : "N/A";

            const station = booking?.station;
            const stationName =
              typeof station === "object" ? station?.name : "N/A";

            const images =
              refund.attachments
                ?.map((s) => extractUrlFromAttachment(String(s)))
                .filter(Boolean)
                .filter((u) => isImageUrl(u)) || [];

            return (
              <motion.div
                key={refund.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all"
              >
                {/* Vehicle & Booking Info */}
                {booking && (
                  <div className="flex gap-4 mb-4 pb-4 border-b border-gray-200">
                    {/* Vehicle Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {vehicleImage ? (
                        <img
                          src={vehicleImage}
                          alt={`${vehicleBrand} ${vehicleModel}`}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openLightbox([vehicleImage], 0)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Vehicle Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-base truncate">
                        {vehicleBrand} {vehicleModel}
                      </h4>
                      <p className="text-xs text-gray-600">{vehiclePlate}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(booking.startTime)} -{" "}
                          {formatDate(booking.endTime)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {stationName}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-200 h-fit">
                      {refund.status.toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Refund Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Amount */}
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <div className="flex items-center gap-2 text-green-700 mb-1">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-xs font-medium">Refund Amount</span>
                    </div>
                    <p className="text-lg font-bold text-green-700">
                      {formatMoney(refund.amount, refund.currency)}
                    </p>
                  </div>

                  {/* Transfer Date */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-700 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium">Transferred</span>
                    </div>
                    <p className="text-sm font-semibold text-blue-700">
                      {formatDateTime(refund.transferredAt)}
                    </p>
                  </div>

                  {/* Bank Info */}
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                    <div className="flex items-center gap-2 text-purple-700 mb-1">
                      <Building2 className="w-4 h-4" />
                      <span className="text-xs font-medium">Bank Account</span>
                    </div>
                    <p className="text-xs font-semibold text-purple-700 line-clamp-1">
                      {refund.beneficiary?.accountName || "-"}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      {refund.beneficiary?.bankName ||
                        refund.beneficiary?.bankCode ||
                        "-"}
                    </p>
                    <p className="text-xs text-purple-600">
                      {refund.beneficiary?.accountNumber || "-"}
                    </p>
                  </div>
                </div>

                {/* Attachments */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ImageIcon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Transfer Proof
                    </span>
                  </div>

                  {images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {images.map((url, idx) => (
                        <motion.div
                          key={`${refund.id}-img-${idx}`}
                          whileHover={{ scale: 1.05 }}
                          className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm cursor-pointer"
                          onClick={() => openLightbox(images, idx)}
                        >
                          <img
                            src={url}
                            alt={`Proof ${idx + 1}`}
                            className="w-full h-32 object-cover bg-gray-100"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                      <FileText className="w-4 h-4" />
                      No attachments
                    </div>
                  )}
                </div>

                {/* Staff Info */}
                {refund.staff?.name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-gray-600">
                          Processed by:{" "}
                          <span className="font-semibold text-gray-900">
                            {refund.staff.name}
                          </span>
                        </p>
                        {refund.note && (
                          <p className="text-gray-500 mt-1">
                            Note: {refund.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                page === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-900 text-white hover:bg-gray-800 shadow-md"
              }`}
            >
              Previous
            </motion.button>

            <span className="text-sm text-gray-600 font-medium">
              Page {page} of {data.totalPages}
            </span>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                page >= data.totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-900 text-white hover:bg-gray-800 shadow-md"
              }`}
            >
              Next
            </motion.button>
          </motion.div>
        )}

        {/* End message */}
        {items.length > 0 && (!data || data.totalPages <= 1) && (
          <div className="text-center py-8 text-gray-400 text-sm">
            You've reached the end
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {showLightbox && (
          <ImageLightbox
            images={lightboxImages}
            initialIndex={lightboxIndex}
            onClose={() => setShowLightbox(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
