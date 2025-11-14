import { useState } from "react";
import staffAPI from "../../../service/apiStaff/API";
import type { BookingTransactionItem } from "../../../types/bookings";
import type { RefundSummaryData } from "./types";

export const useBookingWorkflow = (
  booking: BookingTransactionItem,
  onUpdate: () => void
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refundSummary, setRefundSummary] = useState<RefundSummaryData | null>(
    null
  );
  const [showRefundSummary, setShowRefundSummary] = useState(false);
  const [damageReportSubmitted, setDamageReportSubmitted] = useState(false);
  const [postRentalSubmitted, setPostRentalSubmitted] = useState(false);

  const handleError = (err: unknown, defaultMessage: string) => {
    setError(err instanceof Error ? err.message : defaultMessage);
  };

  const handleSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess(null);
      onUpdate();
    }, 2000);
  };

  const uploadContract = async (file: File) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await staffAPI.uploadContract(booking._id, file);
      handleSuccess(res.message || "Contract uploaded successfully");
    } catch (err: unknown) {
      handleError(err, "Contract upload failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteContract = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await staffAPI.deleteContract(booking._id);
      handleSuccess(res.message || "Contract removed successfully");
    } catch (err: unknown) {
      handleError(err, "Failed to remove contract");
    } finally {
      setLoading(false);
    }
  };

  const uploadPreRental = async (data: {
    batteryLevel: number;
    mileage: number;
    damagePhotos?: File[];
  }) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await staffAPI.uploadPreRentalCondition(booking._id, data);
      handleSuccess(
        res.message || "Pre-rental condition recorded successfully"
      );
    } catch (err: unknown) {
      handleError(err, "Failed to record pre-rental condition");
    } finally {
      setLoading(false);
    }
  };

  const startBooking = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await staffAPI.startBooking(booking._id);
      handleSuccess(res.message || "Booking start successful");
    } catch (err: unknown) {
      handleError(err, "Failed to start booking");
    } finally {
      setLoading(false);
    }
  };

  const markReturned = async (data: {
    batteryLevel: number;
    mileage: number;
    dashboardPhotos?: File[];
  }) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await staffAPI.markReturned(booking._id, data);
      setPostRentalSubmitted(true);
      handleSuccess(res.message || "Vehicle return recorded successfully");
    } catch (err: unknown) {
      handleError(err, "Failed to record vehicle return");
    } finally {
      setLoading(false);
    }
  };

  const getRefundSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await staffAPI.getRefundSummary(booking._id);
      setRefundSummary(res.data);
      setShowRefundSummary(true);
    } catch (err: unknown) {
      handleError(err, "Failed to fetch refund summary");
    } finally {
      setLoading(false);
    }
  };

  const refundDeposit = async (data: { proofImage?: File; notes?: string }) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await staffAPI.refundDeposit(booking._id, data);
      handleSuccess(res.message || "Refund processed successfully");
      setShowRefundSummary(false);
    } catch (err: unknown) {
      handleError(err, "Refund processing failed");
    } finally {
      setLoading(false);
    }
  };

  const payAdditional = async (data: { amount: number; proofImage: File }) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await staffAPI.payAdditional(booking._id, data);
      handleSuccess(res.message || "Additional payment processed successfully");
      setShowRefundSummary(false);
    } catch (err: unknown) {
      handleError(err, "Additional payment failed");
    } finally {
      setLoading(false);
    }
  };

  const damageReport = async (data: {
    description: string;
    estimatedCost?: number;
    photos?: File[];
  }) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await staffAPI.damageReport(booking._id, data);
      setSuccess(res.message || "Damage report submitted successfully");
      setDamageReportSubmitted(true);
      // Auto-fetch refund summary after damage report
      setTimeout(async () => {
        setSuccess(null);
        onUpdate();
        // Fetch refund summary to continue flow
        try {
          const summaryRes = await staffAPI.getRefundSummary(booking._id);
          setRefundSummary(summaryRes.data);
          setShowRefundSummary(true);
        } catch (err: unknown) {
          handleError(err, "Failed to fetch refund summary");
        }
      }, 1500);
    } catch (err: unknown) {
      handleError(err, "Damage report failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    refundSummary,
    showRefundSummary,
    damageReportSubmitted,
    postRentalSubmitted,
    setError,
    setSuccess,
    uploadContract,
    deleteContract,
    uploadPreRental,
    startBooking,
    markReturned,
    getRefundSummary,
    refundDeposit,
    payAdditional,
    damageReport,
  };
};
