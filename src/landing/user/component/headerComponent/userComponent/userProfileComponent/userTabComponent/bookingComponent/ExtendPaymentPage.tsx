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
  Copy,
  RefreshCw,
  ArrowLeft,
  Calendar,
  DollarSign,
} from "lucide-react";
import bookingApi from "../../../../../../../../service/apiUser/booking/API";

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
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<number | null>(null);

  const amountFmt = useMemo(() => fee.toLocaleString(), [fee]);

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

  // Generate QR Code
  useEffect(() => {
    if (!qrText) {
      setQrImg("");
      return;
    }
    QRCode.toDataURL(qrText, {
      errorCorrectionLevel: "M",
      margin: 2,
      scale: 8,
      width: 300,
    })
      .then(setQrImg)
      .catch(() => setQrImg(""));
  }, [qrText]);

  // Countdown timer
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

  // Check payment status
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

  // Poll payment status every 5 seconds
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

  // Redirect after payment success
  // useEffect(() => {
  //   if (!paid) return;
  //   const key = `extend_timer_${bookingId}`;
  //   localStorage.removeItem(key);
  //   const id = window.setTimeout(() => {
  //     navigate(`/booking-success/${bookingId}`, { replace: true });
  //   }, 2000);
  //   return () => window.clearTimeout(id);
  // }, [paid, bookingId, navigate]);

  const handleCopyQR = () => {
    navigator.clipboard
      .writeText(qrText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  // Error state - missing payment info
  if (!state?.payment?.checkoutUrl || !bookingId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-900 mb-2">
                  Missing Payment Session
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  Please go back and start the extension process again.
                </p>
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const expired = countdown <= 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Top Spacer */}
      <div className="h-5 bg-gray-50"></div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Extension Payment
              </h1>
              <p className="text-gray-600 mt-1">
                Complete your payment to extend the booking
              </p>
            </div>

            {!expired && !paid && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl px-5 py-3">
                <Clock className="w-5 h-5 text-amber-700" />
                <div>
                  <p className="text-xs text-amber-600 font-medium">
                    Time Remaining
                  </p>
                  <p className="text-2xl font-mono font-bold text-amber-900">
                    {formatTime(countdown)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Success */}
        {paid && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900">
                  Payment Successful!
                </h3>
                <p className="text-green-700">
                  Your booking has been extended. Redirecting...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Expired */}
        {expired && !paid && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-900 mb-2">
                  Payment Session Expired
                </h3>
                <p className="text-red-700 mb-4">
                  Your payment session has timed out. Please start the extension
                  process again.
                </p>
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Payment Content */}
        {!expired && !paid && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left - QR Code & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* QR Code Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">
                      Scan QR Code to Pay
                    </h2>
                    <p className="text-sm text-gray-600">
                      Use your banking app
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-4">
                  <div className="flex justify-center">
                    {qrImg ? (
                      <div className="relative">
                        <img
                          src={qrImg}
                          alt="PayOS QR"
                          className="w-64 h-64 object-contain rounded-lg bg-white shadow-md border-4 border-white"
                        />
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                          PayOS
                        </div>
                      </div>
                    ) : (
                      <div className="w-64 h-64 rounded-lg bg-gray-200 animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Checkout
                  </a>
                  <button
                    onClick={handleCopyQR}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? "Copied!" : "Copy QR"}
                  </button>
                </div>

                <button
                  onClick={() => checkPaid().catch(() => {})}
                  disabled={checking}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${checking ? "animate-spin" : ""}`}
                  />
                  {checking ? "Checking..." : "I Have Paid, Check Status"}
                </button>
              </div>

              {/* Important Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-lg">ℹ️</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-1">
                      Payment Instructions
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Open your banking app and scan the QR code</li>
                      <li>• Or click "Open Checkout" to pay via web browser</li>
                      <li>• Payment will be verified automatically</li>
                      <li>
                        • Don't close this page until payment is confirmed
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Summary */}
            <div className="space-y-6">
              {/* Extension Summary */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-gray-900">Extension Details</h3>
                </div>

                <div className="space-y-4">
                  {/* New End Time */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-xs text-purple-600 font-medium mb-1">
                      New End Time
                    </p>
                    <p className="font-bold text-purple-900">{endTimeFmt}</p>
                  </div>

                  {/* Duration Breakdown */}
                  <div className="space-y-2">
                    {days > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {days} day{days > 1 ? "s" : ""} ×{" "}
                          {unitDay.toLocaleString()}đ
                        </span>
                        <span className="font-semibold text-gray-900">
                          {(days * unitDay).toLocaleString()}đ
                        </span>
                      </div>
                    )}
                    {hours > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {hours} hour{hours > 1 ? "s" : ""} ×{" "}
                          {unitHour.toLocaleString()}đ
                        </span>
                        <span className="font-semibold text-gray-900">
                          {(hours * unitHour).toLocaleString()}đ
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t-2 border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-gray-900">
                          Total Amount
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-green-600">
                        {amountFmt}đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                  Order Information
                </h4>
                <div className="space-y-2 text-xs">
                  {state?.payment?.orderCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Code:</span>
                      <span className="font-mono font-semibold text-gray-900">
                        {state.payment.orderCode}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provider:</span>
                    <span className="font-semibold text-gray-900">PayOS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
