// Booking-related shared interfaces
export interface BookingDepositPayOS {
  orderCode?: number;
  paymentLinkId?: string;
  checkoutUrl?: string;
  qrCode?: string;
  paidAt?: string;
  refund?: {
    ok: boolean;
    amount: number;
  };
}

export interface BookingDepositInfo {
  amount: number;
  currency: string;
  providerRef?: string | null;
  status: string; // none | pending | captured | refund_failed ...
  payos?: BookingDepositPayOS;
}

export interface BookingRenterInfo {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export interface BookingVehicleInfo {
  _id: string;
  plateNumber: string;
  brand: string;
  model: string;
}

export interface BookingStationInfo {
  _id: string;
  name: string;
}

export interface BookingTransactionItem {
  _id: string;
  renter: string;
  vehicle: string;
  station: string;
  company: string | null;
  status: string; // cancelled | expired | created | active ...
  deposit: BookingDepositInfo;
  amounts: { totalPaid: number };
  createdAt: string;
  updatedAt: string;
  bookingId: string;
  _dateSort: string;
  renterInfo: BookingRenterInfo;
  vehicleInfo: BookingVehicleInfo;
  stationInfo: BookingStationInfo;
  companyInfo: unknown | null;
}

export interface AdminBookingTransactionsResponse {
  page: number;
  limit: number;
  total: number;
  items: BookingTransactionItem[];
}

// Request to create a booking (minimal payload for PayOS deposit flow)
export interface CreateBookingRequest {
  vehicleId: string;
  startTime: string; // ISO
  endTime: string; // ISO
  deposit: { provider: "payos" };
}

export interface CreateBookingResponse {
  success: boolean;
  data: unknown;
}
