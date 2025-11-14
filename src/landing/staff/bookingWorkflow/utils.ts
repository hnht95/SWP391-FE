import type { BookingStatus, StepStatus } from "./types";

// Get status for each workflow step
export const getStepStatus = (
  currentStatus: BookingStatus,
  stepNumber: number
): StepStatus => {
  const statusOrder: Record<BookingStatus, number> = {
    pending: 1,
    reserved: 3,
    active: 5,
    returning: 6,
    completed: 9,
    cancelled: 0,
  };

  const currentStep = statusOrder[currentStatus];

  if (currentStep >= stepNumber) return "completed";
  if (currentStep === stepNumber - 1) return "current";
  return "upcoming";
};
