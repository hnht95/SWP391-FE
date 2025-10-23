// Vehicle-related interfaces for the application

export interface Station {
  _id: string;
  name: string;
  code: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  isActive: boolean;
}

export interface MaintenanceRecord {
  description: string;
  reportedAt: string;
  staff: string;
  _id: string;
}

export interface VehicleValuation {
  valueVND: number;
  lastUpdatedAt?: string;
}

export interface VehiclePhotos {
  exterior: string[];
  interior: string[];
}

// Raw vehicle from backend API
export interface RawApiVehicle {
  _id: string;
  owner: string;
  company?: string | null;
  valuation?: {
    valueVND: number;
    lastUpdatedAt?: string;
  };
  plateNumber: string;
  vin: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  batteryCapacity: number;
  mileage: number;
  pricePerDay: number;
  pricePerHour: number;
  status: "available" | "rented" | "maintenance";
  station: {
    _id: string;
    name: string;
    code: string;
    location: {
      address: string;
      lat: number;
      lng: number;
    };
    isActive: boolean;
  };
  defaultPhotos: VehiclePhotos;
  ratingAvg: number;
  ratingCount: number;
  tags: string[];
  maintenanceHistory: Array<{
    description: string;
    reportedAt: string;
    staff: string;
    _id: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// API Vehicle interface (from useVehicles hook)
export interface ApiVehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  status: "available" | "reserved" | "rented" | "maintenance";
  station: Station;
  batteryLevel: number;
  batteryCapacity: number;
  year: number;
  licensePlate: string;
  vin: string;
  color: string;
  mileage: number;
  pricePerDay: number;
  pricePerHour: number;
  owner: string;
  company?: string | null;
  valuation?: VehicleValuation;
  defaultPhotos: VehiclePhotos;
  ratingAvg: number;
  ratingCount: number;
  tags: string[];
  maintenanceHistory: MaintenanceRecord[];
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

// UI Vehicle interface (for VehiclesStaff component)
export interface Vehicle {
  id: string;
  licensePlate: string;
  vin: string;
  type: "scooter" | "sport" | "standard";
  brand: string;
  model: string;
  year: number;
  color: string;
  status: "available" | "reserved" | "rented" | "maintenance";
  batteryLevel: number;
  batteryCapacity: number;
  mileage: number;
  pricePerDay: number;
  pricePerHour: number;
  lastMaintenance: string;
  rentalHistory: number;
  location: string;
  station?: Station;
  owner: string;
  company?: string | null;
  valuation?: VehicleValuation;
  defaultPhotos: VehiclePhotos;
  ratingAvg: number;
  ratingCount: number;
  tags: string[];
  maintenanceHistory?: MaintenanceRecord[];
  createdAt: string;
  updatedAt: string;
  image?: string;
  notes?: string;
}

// Status-related types
export type VehicleStatus = "available" | "reserved" | "rented" | "maintenance";
export type VehicleType = "scooter" | "sport" | "standard";

// Filter types
export interface VehicleFilters {
  searchTerm: string;
  selectedType: string;
  selectedStatus: string;
  selectedBattery: string;
}

// Status style configuration
export interface StatusStyle {
  color: string;
  label: string;
  dotColor: string;
}
