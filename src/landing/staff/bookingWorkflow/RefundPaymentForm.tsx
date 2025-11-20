import { useState, useRef } from "react";
import type { RefundSummaryData } from "./types";

interface RefundPaymentFormProps {
  refundSummary: RefundSummaryData;
  onRefund: (data: { proofImage?: File; notes?: string }) => Promise<void>;
  onPayment: (data: { amount: number; proofImage: File }) => Promise<void>;
  loading: boolean;
}

export const RefundPaymentForm = ({
  refundSummary,
  onRefund,
  onPayment,
  loading,
}: RefundPaymentFormProps) => {
  const [refundProofImage, setRefundProofImage] = useState<File | null>(null);
  const [refundNotes, setRefundNotes] = useState("");
  const [paymentAmount, setPaymentAmount] = useState<number>(
    Math.abs(refundSummary.refundAmount)
  );
  const [paymentProofImage, setPaymentProofImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refundProofInputRef = useRef<HTMLInputElement>(null);
  const paymentProofInputRef = useRef<HTMLInputElement>(null);

  const handleRefund = async () => {
    setError(null);
    await onRefund({
      proofImage: refundProofImage || undefined,
      notes: refundNotes || undefined,
    });
    setRefundProofImage(null);
    setRefundNotes("");
  };

  const handlePayment = async () => {
    if (!paymentProofImage || !paymentAmount) {
      setError("Please enter amount and select proof image");
      return;
    }
    setError(null);
    await onPayment({
      amount: paymentAmount,
      proofImage: paymentProofImage,
    });
    setPaymentProofImage(null);
    setPaymentAmount(0);
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="font-semibold text-gray-900 mb-3">Refund Summary</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Deposit:</span>
          <span className="font-medium">
            {refundSummary.totalDeposit?.toLocaleString()} VND
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Late Fee:</span>
          <span className="font-medium text-red-600">
            -{refundSummary.lateFee?.toLocaleString()} VND
          </span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="font-semibold text-gray-900">Refund Amount:</span>
          <span
            className={`font-bold text-lg ${
              refundSummary.refundAmount >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {refundSummary.refundAmount?.toLocaleString()} VND
          </span>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      {refundSummary.refundAmount > 0 ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-green-700">→ Refund to customer</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund proof image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              ref={refundProofInputRef}
              onChange={(e) => setRefundProofImage(e.target.files?.[0] || null)}
              className="w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={refundNotes}
              onChange={(e) => setRefundNotes(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Notes..."
            />
          </div>
          <button
            onClick={handleRefund}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Processing refund..." : "Process refund"}
          </button>
        </div>
      ) : refundSummary.refundAmount < 0 ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-red-700">→ Customer needs to pay extra</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment amount (VND) *
            </label>
            <input
              type="number"
              min="0"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment proof image *
            </label>
            <input
              type="file"
              accept="image/*"
              ref={paymentProofInputRef}
              onChange={(e) =>
                setPaymentProofImage(e.target.files?.[0] || null)
              }
              className="w-full text-sm"
            />
          </div>
          <button
            onClick={handlePayment}
            disabled={loading || !paymentProofImage}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Processing payment..." : "Confirm payment"}
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-gray-700">
            → No refund or additional payment required
          </p>
          <button
            onClick={handleRefund}
            disabled={loading}
            className="w-full mt-3 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Completing..." : "Complete booking"}
          </button>
        </div>
      )}
    </div>
  );
};
