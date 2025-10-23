// Backend contract raw shape and list response
export interface CompanyInfo {
  id: string;
  name: string;
  status: string;
}

export interface RawApiContract {
  _id: string;
  company?: string | CompanyInfo;
  contactPerson?: string;
  email?: string;
  phone?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  status?: string;
  vehicles?: unknown[];
  monthlyFee?: number;
}

export interface ContractsListData {
  page: number;
  limit: number;
  total: number;
  count?: number;
  items: RawApiContract[];
}

export interface ContractsListResponse {
  success: boolean;
  data: ContractsListData;
}

// UI-facing contract models used across Staff pages
export interface ContractAlert {
  id: string;
  type: string;
  message: string;
  priority: "high" | "medium" | "low";
  date: string;
}

export interface ContractVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  status?: string | { id?: string; name?: string; status?: string };
  lastInspection?: string;
  nextInspection?: string;
}

export interface Contract {
  id: string;
  companyName: string;
  companyContact: string;
  email: string;
  phone: string;
  signDate: string;
  startDate: string;
  endDate: string;
  status: string;
  vehicleCount: number;
  monthlyFee: number;
  totalValue: number;
  vehicles: ContractVehicle[];
  alerts: ContractAlert[];
}

// Create Contract form models
export interface VehicleFormData {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  engineNumber: string;
  chassisNumber: string;
  registrationDocument?: File;
  inspectionDocument?: File;
  images: File[];
}

export interface ContractFormData {
  companyName: string;
  taxId: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  contractId: string;
  startDate: string;
  endDate: string;
  autoRenewal: boolean;
  monthlyFee: number;
  insurance: boolean;
  insuranceFee: number;
  additionalServices: string[];
  vehicles: VehicleFormData[];
  legalDocuments: File[];
  handoverDocument?: File;
  notes: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingContracts: Contract[];
}
