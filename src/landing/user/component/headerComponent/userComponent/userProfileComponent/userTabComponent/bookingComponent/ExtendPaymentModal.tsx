import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  QrCode,
  CheckCircle2,
  ExternalLink,
  CreditCard,
} from "lucide-react";
import QRCode from "qrcode";
import bookingApi from "../../../../../../../../service/apiBooking/API";

type ExtendPaymentData = {
  bookingId: string;
  status:
    | "reserved"
    | "active"
    | "returning"
    | "completed"
    | "cancelled"
    | "expired";
  endTime: string;
  feeEstimated: number;
  pricingSnapshot?: {
    baseMode?: "day+hour" | string;
    days?: number;
    hours?: number;
    unitPriceDay?: number;
    unitPriceHour?: number;
    baseUnit?: string;
    basePrice?: number;
  };
  payment?: {
    provider: string;
    type: "extension";
    orderCode: number;
    checkoutUrl: string;
    qrCode: string;
  };
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  extendResult: ExtendPaymentData | null;
  onPaid?: () => void;
};

export default function ExtendPaymentModal({
  isOpen,
  onClose,
  extendResult,
  onPaid,
}: Props) {
  const [paid, setPaid] = useState(false);
  const [closingCountdown, setClosingCountdown] = useState(5);
  const [checking, setChecking] = useState(false);
  const [qrImg, setQrImg] = useState<string>("");

  const days = extendResult?.pricingSnapshot?.days ?? 0;
  const hours = extendResult?.pricingSnapshot?.hours ?? 0;
  const unitDay = extendResult?.pricingSnapshot?.unitPriceDay ?? 0;
  const unitHour = extendResult?.pricingSnapshot?.unitPriceHour ?? 0;
  const fee = extendResult?.feeEstimated ?? 0;
  const checkoutUrl = extendResult?.payment?.checkoutUrl || "";
  const orderCode = extendResult?.payment?.orderCode;
  const qrText = extendResult?.payment?.qrCode || "";

  const amountFmt = useMemo(() => bookingApi.formatCurrency(fee, "VND"), [fee]);

  const endTimeFmt = useMemo(() => {
    if (!extendResult?.endTime) return "";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(extendResult.endTime));
  }, [extendResult?.endTime]);

  const checkPaid = async () => {
    if (!extendResult?.bookingId) return;
    setChecking(true);
    try {
      const statusRes = await bookingApi.getPaymentStatus(
        extendResult.bookingId
      );
      const captured =
        statusRes.current?.deposit?.status === "captured" ||
        statusRes.deposit?.status === "captured";
      if (captured) setPaid(true);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (!paid || !isOpen) return;
    const id = setInterval(
      () => setClosingCountdown((c) => (c > 0 ? c - 1 : 0)),
      1000
    );
    if (closingCountdown === 0) {
      onPaid?.();
      onClose();
    }
    return () => clearInterval(id);
  }, [paid, isOpen, closingCountdown, onPaid, onClose]);

  // Generate QR image from payload
  useEffect(() => {
    let canceled = false;
    const gen = async () => {
      if (!qrText) {
        setQrImg("");
        return;
      }
      try {
        const dataUrl = await QRCode.toDataURL(qrText, {
          errorCorrectionLevel: "M",
          margin: 1,
          scale: 6,
          color: { dark: "#000000", light: "#ffffff" },
        });
        if (!canceled) setQrImg(dataUrl);
      } catch {
        if (!canceled) setQrImg("");
      }
    };
    if (isOpen) gen();
    return () => {
      canceled = true;
    };
  }, [qrText, isOpen]);

  // Auto-poll every 5s while unpaid
  useEffect(() => {
    if (!isOpen || paid) return;
    const id = setInterval(() => {
      checkPaid();
    }, 5000);
    return () => clearInterval(id);
  }, [isOpen, paid]);

  return (
    <AnimatePresence>
      {isOpen && extendResult && (
        <motion.div
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden pointer-events-auto"
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">Extension Payment</h3>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!paid ? (
              <div className="p-5 space-y-5">
                {/* Summary (Booking ID hidden) */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-green-800">New End Time</span>
                    <span className="font-semibold text-green-900">
                      {endTimeFmt}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-green-800">Days × Price</span>
                    <span className="font-semibold text-green-900">
                      {days} × {unitDay.toLocaleString()}đ
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-800">Hours × Price</span>
                    <span className="font-semibold text-green-900">
                      {hours} × {unitHour.toLocaleString()}đ
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3 border-t pt-3">
                    <span className="text-base font-bold text-green-900">
                      Amount to Pay
                    </span>
                    <span className="text-2xl font-bold text-green-700">
                      {amountFmt}
                    </span>
                  </div>
                  {orderCode ? (
                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-green-800">Order Code</span>
                      <span className="font-semibold text-green-900">
                        {orderCode}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* QR / Checkout */}
                <div className="bg-white border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <QrCode className="w-5 h-5 text-gray-700" />
                    <h4 className="font-semibold text-gray-900">
                      Pay via PayOS
                    </h4>
                  </div>

                  {qrImg ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={qrImg}
                        alt="PayOS QR"
                        className="w-48 h-48 object-contain rounded-lg border bg-white"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Scan to pay via PayOS
                      </p>
                    </div>
                  ) : (
                    <div className="h-12 rounded-lg bg-gray-100 animate-pulse" />
                  )}

                  <div className="flex gap-2 mt-3">
                    <a
                      href={checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Checkout
                    </a>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(qrText).catch(() => {})
                      }
                      className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                    >
                      Copy QR Payload
                    </button>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={checkPaid}
                      disabled={checking}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
                    >
                      {checking ? "Checking..." : "I Have Paid, Check Status"}
                    </button>
                    <p className="text-[11px] text-gray-500 mt-2">
                      Payment updates may take a few seconds to reflect.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-3" />
                <h4 className="text-xl font-bold text-gray-900">
                  Payment Successful
                </h4>
                <p className="text-gray-600 mt-1">
                  This window will close in {closingCountdown}s.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
