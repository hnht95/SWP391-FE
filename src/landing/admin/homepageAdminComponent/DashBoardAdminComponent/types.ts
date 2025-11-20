export interface Notification {
  id: string;
  type: "maintenance" | "kyc";
  title: string;
  message: string;
  timestamp: Date;
  vehicleId?: string;
  userId?: string;
  priority: "high" | "medium" | "low";
  read?: boolean;
}

export type BookingRangeKey = "today" | "week" | "month" | "year";

export const rangeLabels: Record<BookingRangeKey, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  year: "This Year",
};

