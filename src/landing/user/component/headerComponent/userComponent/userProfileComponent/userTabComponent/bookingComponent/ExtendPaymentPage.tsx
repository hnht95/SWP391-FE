// src/pages/ExtendPaymentPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import QRCode from "qrcode";

import {
  ExternalLink,
  CheckCircle2,
  QrCode,
  AlertCircle,
  Clock,
} from "lucide-react";
import bookingApi from "../../../../../../../../service/apiBooking/API";

type LocationState = {
  bookingId?: string;
  endTime?: string;
  feeEstimated?: number;
  pricingSnapshot?: {
    days?: number;
    hours?: number;
    unitPriceDay?: number;
    unitPriceHour?: number;
  };
  payment?: {
    orderCode?: number;
    checkoutUrl?: string;
    qrCode?: string;
    provider?: string;
    type?: "extension";
  };
} | null;

const PAYMENT_TIMEOUT_MINUTES = 15;
const PAYMENT_TIMEOUT_SECONDS = PAYMENT_TIMEOUT_MINUTES * 60;

export default function ExtendPaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState };

  const fee = state?.feeEstimated ?? 0;
  const days = state?.pricingSnapshot?.days ?? 0;
  const hours = state?.pricingSnapshot?.hours ?? 0;
  const unitDay = state?.pricingSnapshot?.unitPriceDay ?? 0;
  const unitHour = state?.pricingSnapshot?.unitPriceHour ?? 0;
  const checkoutUrl = state?.payment?.checkoutUrl || "";
  const qrText = state?.payment?.qrCode || "";

  const [qrImg, setQrImg] = useState("");
  const [paid, setPaid] = useState(false);
  const [checking, setChecking] = useState(false);
  const [countdown, setCountdown] = useState(PAYMENT_TIMEOUT_SECONDS);
  const pollRef = useRef<number | null>(null);

  const amountFmt = useMemo(() => bookingApi.formatCurrency(fee, "VND"), [fee]);
  const endTimeFmt = useMemo(() => {
    if (!state?.endTime) return "";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(state.endTime));
  }, [state?.endTime]);

  // QR từ payload
  useEffect(() => {
    if (!qrText) {
      setQrImg("");
      return;
    }
    QRCode.toDataURL(qrText, { errorCorrectionLevel: "M", margin: 1, scale: 6 })
      .then(setQrImg)
      .catch(() => setQrImg(""));
  }, [qrText]);

  // Đếm ngược 15 phút
  useEffect(() => {
    const key = `extend_timer_${bookingId}`;
    const saved = localStorage.getItem(key);
    if (!saved) {
      const exp = Date.now() + PAYMENT_TIMEOUT_SECONDS * 1000;
      localStorage.setItem(key, String(exp));
      setCountdown(PAYMENT_TIMEOUT_SECONDS);
    } else {
      const exp = Number(saved);
      const left = Math.max(0, Math.floor((exp - Date.now()) / 1000));
      setCountdown(left);
    }
    const t = window.setInterval(() => {
      const exp = Number(localStorage.getItem(key));
      if (!exp) return;
      const left = Math.max(0, Math.floor((exp - Date.now()) / 1000));
      setCountdown(left);
      if (left <= 0) {
        localStorage.removeItem(key);
        window.clearInterval(t);
      }
    }, 1000);
    return () => window.clearInterval(t);
  }, [bookingId]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  // Poll trạng thái thanh toán 5s/lần
  const checkPaid = async () => {
    if (!bookingId) return;
    setChecking(true);
    try {
      const res = await bookingApi.getPaymentStatus(bookingId);
      const captured =
        res.current?.deposit?.status === "captured" ||
        res.deposit?.status === "captured";
      if (captured) setPaid(true);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (!bookingId || paid || countdown <= 0) return;
    checkPaid().catch(() => {});
    pollRef.current = window.setInterval(() => {
      checkPaid().catch(() => {});
    }, 5000) as unknown as number;
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [bookingId, paid, countdown]);

  // Redirect sau khi thanh toán
  useEffect(() => {
    if (!paid) return;
    const key = `extend_timer_${bookingId}`;
    localStorage.removeItem(key);
    const id = window.setTimeout(() => {
      navigate(`/bookings/${bookingId}`, { replace: true });
    }, 2000);
    return () => window.clearTimeout(id);
  }, [paid, bookingId, navigate]);

  if (!state?.payment?.checkoutUrl || !bookingId) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-semibold text-red-900">
              Missing payment session
            </p>
            <p className="text-sm text-red-700">
              Please go back and start the extension again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const expired = countdown <= 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Extension Payment</h1>
        {!expired && !paid && (
          <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-semibold">
              {formatTime(countdown)}
            </span>
          </div>
        )}
      </div>

      {!expired && !paid && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-5">
            <div className="flex items-center gap-2 mb-3">
              <QrCode className="w-5 h-5 text-gray-700" />
              <h2 className="font-semibold">Pay via PayOS</h2>
            </div>
            {qrImg ? (
              <div className="flex flex-col items-center">
                <img
                  src={qrImg}
                  alt="PayOS QR"
                  className="w-56 h-56 object-contain rounded-lg border bg-white"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Scan to pay via your banking app
                </p>
              </div>
            ) : (
              <div className="h-56 rounded-lg bg-gray-100 animate-pulse" />
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
            <button
              onClick={() => checkPaid().catch(() => {})}
              disabled={checking}
              className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
            >
              {checking ? "Checking..." : "I Have Paid, Check Status"}
            </button>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>New End Time</span>
                <span className="font-semibold">{endTimeFmt}</span>
              </div>
              <div className="flex justify-between">
                <span>Days × Price</span>
                <span className="font-semibold">
                  {days} × {unitDay.toLocaleString()}đ
                </span>
              </div>
              <div className="flex justify-between">
                <span>Hours × Price</span>
                <span className="font-semibold">
                  {hours} × {unitHour.toLocaleString()}đ
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">Amount to Pay</span>
                <span className="text-xl font-bold text-green-700">
                  {amountFmt}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {expired && !paid && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-semibold text-red-900">
              Payment session expired
            </p>
            <p className="text-sm text-red-700">
              Please start the extension again.
            </p>
          </div>
        </div>
      )}

      {paid && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <p className="font-semibold text-green-900">
            Payment successful. Redirecting…
          </p>
        </div>
      )}
    </div>
  );
}
