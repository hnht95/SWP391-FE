// Booking-related shared interfaces
export interface BookingDepositPayOS {
  orderCode?: number;
  paymentLinkId?: string;
  checkoutUrl?: string;
  qrCode?: string;
  paidAt?: string;
  needsRefundReview?: boolean;
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
  needsRefundReview?: boolean;
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
  // When item represents a manual refund record, backend may provide its id
  manualRefundId?: string;
  // Optional times (if provided by backend)
  startTime?: string;
  endTime?: string;
  _dateSort: string;
  renterInfo: BookingRenterInfo;
  vehicleInfo: BookingVehicleInfo;
  stationInfo: BookingStationInfo;
  companyInfo: unknown | null;
  contract?: {
    _id: string;
    url: string;
    publicId?: string;
    type?: string;
  };
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

// Booking workflow response types
export interface BookingWorkflowData {
  bookingId: string;
  status: string;
  vehicle: {
    plateNumber: string;
    brand: string;
    model: string;
    id: string;
    isPartnerVehicle: boolean;
    pricePerDay?: number;
    pricePerHour?: number;
  };
  contract?: {
    _id: string;
    url: string;
    publicId?: string;
    type?: string;
    provider?: string;
  };
  preRentalCondition?: {
    batteryLevel: number;
    mileage: number;
    damagePhotos: Array<{
      _id: string;
      url: string;
      type?: string;
    }>;
    recordedAt: string;
    recordedBy?: {
      _id: string;
      name?: string;
      email?: string;
    };
  };
  postRentalCondition?: {
    batteryLevel: number;
    mileage: number;
    damagePhotos: Array<{
      _id: string;
      url: string;
      type?: string;
    }>;
    recordedAt: string;
    recordedBy?: string;
  };
  startTime: string;
  endTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  canStart?: boolean;
  nextStep?: string;
  message?: string;
  lateFee?: number;
  lateCalc?: {
    lateMinutes: number;
    baseLate: number;
    overlapFee: number;
    afterHoursFee: number;
    adminFee: number;
  };
  amounts?: {
    rentalEstimated?: number;
    overKmFee?: number;
    lateFee?: number;
    batteryFee?: number;
    damageCharge?: number;
    discounts?: number;
    subtotal?: number;
    tax?: number;
    grandTotal?: number;
    totalPaid?: number;
  };
  additionalPayment?: {
    image?: {
      _id: string;
      url: string;
      type?: string;
    };
    amount: number;
    paidAt: string;
  };
}

export interface BookingActionResponse {
  success: boolean;
  message: string;
  data: BookingWorkflowData;
}

export interface RefundSummaryData {
  refundAmount: number;
  totalDeposit: number;
  lateFee: number;
  damageReport?: {
    status: string;
    estimatedCost?: number;
  };
  needsPayment?: boolean;
  canProceed?: boolean;
}

export interface RefundSummaryResponse {
  success: boolean;
  data: RefundSummaryData;
}

// Damage report types (staff reporting vehicle damage)
export interface DamageReportUserInfo {
  _id: string;
  id?: string; // some APIs duplicate _id as id
  role?: string;
  name?: string;
  email?: string;
  phone?: string;
  station?: string;
  gender?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface DamageReportAdminAssessment {
  chargeAmount?: number; // final amount to charge renter
  notes?: string;
  assessedAt?: string;
}

export interface DamageReportData {
  _id: string;
  booking: string;
  vehicle: string;
  reportedBy: DamageReportUserInfo;
  description: string;
  photos: Array<{
    _id?: string;
    url?: string;
    publicId?: string;
    type?: string;
  }>;
  status: string; // reported | assessing | resolved | charged
  adminAssessment?: DamageReportAdminAssessment;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface DamageReportResponse {
  success: boolean;
  message: string;
  data: DamageReportData;
}
