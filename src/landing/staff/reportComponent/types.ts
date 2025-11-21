export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: "low" | "medium" | "high" | "urgent";
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
    company?: string;
  };
  vehicle?: {
    id: string;
    model: string;
    licensePlate: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  isOverdue: boolean;
  messages: TicketMessage[];
  rating?: number;
  feedback?: string;
}

export interface TicketMessage {
  id: string;
  sender: {
    id: string;
    name: string;
    type: "customer" | "staff";
  };
  message: string;
  timestamp: string;
  attachments?: string[];
}

export type TicketType =
  | "vehicle_breakdown"
  | "unlock_issue"
  | "traffic_violation"
  | "payment_refund"
  | "service_complaint"
  | "contract_support"
  | "other";

export type TicketStatus = "new" | "in_progress" | "resolved" | "closed";

export interface StationRequestItem {
  _id: string;
  status: string;
  reportText?: string;
  description?: string;
  reportedBy?:
    | string
    | {
        _id: string;
        role?: string;
        name?: string;
        email?: string;
      };
  vehicle?: {
    _id: string;
    brand?: string;
    model?: string;
    plateNumber: string;
    status?: string;
    station?: string | Record<string, unknown>;
  } | null;
  station?:
    | string
    | {
        _id: string;
        name: string;
        location: {
          address: string;
          lat: number;
          lng: number;
        };
      };
  evidencePhotos?: Array<{
    _id: string;
    url: string;
    type?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  urgency?: string;
  previousVehicleStatus?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}
