import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdUpload,
  MdAssignmentReturn,
  MdAttachMoney,
  MdWarning,
  MdInfo,
  MdClose,
} from "react-icons/md";
import type { BookingTransactionItem } from "../../../types/bookings";
import { useBookingWorkflow } from "./useBookingWorkflow";
import { getStepStatus } from "./utils";
import { WorkflowStep } from "./WorkflowStep";
import { ContractUploadForm } from "./ContractUploadForm";
import { PreRentalForm } from "./PreRentalForm";
import { PostRentalForm } from "./PostRentalForm";
import { DamageReportForm } from "./DamageReportForm";
import { RefundPaymentForm } from "./RefundPaymentForm";
import type { BookingStatus } from "./types";

interface BookingWorkflowProps {
  booking: BookingTransactionItem;
  onUpdate: () => void;
}

const BookingWorkflow = ({ booking, onUpdate }: BookingWorkflowProps) => {
  const {
    loading,
    error,
    success,
    refundSummary,
    showRefundSummary,
    damageReportSubmitted,
    postRentalSubmitted,
    uploadContract,
    deleteContract,
    uploadPreRental,
    startBooking,
    markReturned,
    getRefundSummary,
    refundDeposit,
    payAdditional,
    damageReport,
  } = useBookingWorkflow(booking, onUpdate);

  const currentStatus: BookingStatus =
    (booking.status as BookingStatus) || "pending";

  const steps = useMemo(
    () => [
      {
        number: 1,
        label: "Renter creates booking",
        status: "pending" as BookingStatus,
        description: "Customer creates booking in the system",
        icon: MdRadioButtonUnchecked,
      },
      {
        number: 2,
        label: "Renter pays deposit",
        status: "reserved" as BookingStatus,
        description: "Customer pays the deposit",
        icon: MdCheckCircle,
      },
      {
        number: 3,
        label: "Staff upload contract",
        status: "reserved" as BookingStatus,
        description: "Staff uploads signed contract",
        icon: MdUpload,
        action: currentStatus === "reserved" && !booking.contract,
        component: booking.contract ? (
          <div className="mt-4 bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-700">
                <MdCheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Contract successfully uploaded
                </span>
              </div>
              <button
                onClick={deleteContract}
                disabled={loading}
                className="p-1.5 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                title="Remove contract"
              >
                <MdClose className="w-5 h-5 text-gray-500 group-hover:text-red-600" />
              </button>
            </div>
            {booking.contract.url && (
              <a
                href={booking.contract.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline block"
              >
                View contract
              </a>
            )}
          </div>
        ) : (
          <ContractUploadForm onSubmit={uploadContract} loading={loading} />
        ),
      },
      {
        number: 4,
        label: "Staff record pre-rental",
        status: "reserved" as BookingStatus,
        description:
          "Staff records vehicle pre-rental condition (auto switches to active)",
        icon: MdInfo,
        action: currentStatus === "reserved" && !!booking.contract,
        component: (
          <PreRentalForm onSubmit={uploadPreRental} loading={loading} />
        ),
      },
      {
        number: 5,
        label: "Record vehicle return",
        status: "returning" as BookingStatus,
        description:
          "Record post-return condition (battery, mileage, damage photos)",
        icon: MdAssignmentReturn,
        action: currentStatus === "active" && !postRentalSubmitted,
        component: postRentalSubmitted ? (
          <div className="mt-4 bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-700">
              <MdCheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">
                Vehicle return recorded successfully
              </span>
            </div>
          </div>
        ) : (
          <PostRentalForm onSubmit={markReturned} loading={loading} />
        ),
      },
      {
        number: 6,
        label: "Staff damage report (optional)",
        status: "returning" as BookingStatus,
        description: "Staff reports damage if any",
        icon: MdWarning,
        action: currentStatus === "returning" && !damageReportSubmitted,
        component: damageReportSubmitted ? (
          <div className="mt-4 bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-700">
              <MdCheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">
                Damage report submitted successfully
              </span>
            </div>
          </div>
        ) : (
          <DamageReportForm onSubmit={damageReport} loading={loading} />
        ),
      },
      {
        number: 7,
        label: "Check refund/payment",
        status: "returning" as BookingStatus,
        description: "Check refundable or payable amount",
        icon: MdAttachMoney,
        action: currentStatus === "returning",
        component: (
          <div className="mt-4 space-y-4 bg-white border-2 border-purple-200 rounded-xl p-5">
            <div className="flex items-center gap-3 pb-3 border-b border-purple-100">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MdAttachMoney className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  Check Refund / Payment
                </h4>
                <p className="text-xs text-gray-500">
                  View refundable amount or additional charges
                </p>
              </div>
            </div>

            <button
              onClick={getRefundSummary}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <MdAttachMoney className="w-5 h-5" />
                  <span>Check refund summary</span>
                </>
              )}
            </button>

            {showRefundSummary && refundSummary && (
              <RefundPaymentForm
                refundSummary={refundSummary}
                onRefund={refundDeposit}
                onPayment={payAdditional}
                loading={loading}
              />
            )}
          </div>
        ),
      },
      {
        number: 8,
        label: "Completed",
        status: "completed" as BookingStatus,
        description: "Booking completed",
        icon: MdCheckCircle,
      },
    ],
    [
      currentStatus,
      booking.contract,
      loading,
      showRefundSummary,
      refundSummary,
      damageReportSubmitted,
      postRentalSubmitted,
      uploadContract,
      deleteContract,
      uploadPreRental,
      startBooking,
      markReturned,
      getRefundSummary,
      refundDeposit,
      payAdditional,
      damageReport,
    ]
  );

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Status Badge */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-semibold text-sm shadow-lg">
          <MdInfo className="w-5 h-5" />
          <span>Current status: {currentStatus.toUpperCase()}</span>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <WorkflowStep
            key={step.number}
            step={step}
            stepStatus={getStepStatus(currentStatus, step.number)}
            index={index}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>

      {/* Completed Status */}
      {currentStatus === "completed" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl text-center"
        >
          <MdCheckCircle className="w-16 h-16 text-green-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-green-900 mb-2">
            🎉 Booking completed!
          </h3>
          <p className="text-sm text-green-700">
            All steps have been completed successfully.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default BookingWorkflow;
