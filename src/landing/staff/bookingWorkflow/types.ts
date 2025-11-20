// Booking workflow types
export type BookingStatus =
  | "pending"
  | "reserved"
  | "active"
  | "returning"
  | "completed"
  | "cancelled";

export type StepStatus = "completed" | "current" | "upcoming";

export interface WorkflowStep {
  number: number;
  label: string;
  status: BookingStatus;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: boolean;
  component?: React.ReactNode;
}

export interface RefundSummaryData {
  refundAmount: number;
  totalDeposit: number;
  lateFee: number;
}
