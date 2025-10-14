import api from "../Utils";

// Admin Vehicles API
export interface AdminVehicle {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
  status: "available" | "rented" | "maintenance";
  location: string;
  dailyRate: number;
  lastService: string; // ISO date
}

export interface CreateAdminVehicleInput {
  brand: string;
  model: string;
  licensePlate: string;
  status?: "available" | "rented" | "maintenance";
  location?: string;
  dailyRate?: number;
  lastService?: string; // ISO date
}

export const adminVehiclesAPI = {
  async list(query?: Record<string, string | number | boolean>) {
    const qs = query
      ? `?${new URLSearchParams(Object.entries(query).map(([k, v]) => [k, String(v)])).toString()}`
      : "";
    const res = await api.get(`/admin/vehicles${qs}`);
    return res.data as { data?: AdminVehicle[] } | AdminVehicle[];
  },

  async create(payload: CreateAdminVehicleInput) {
    const res = await api.post(`/admin/vehicles`, payload);
    return res.data as { data?: AdminVehicle } | AdminVehicle;
  },

  async update(id: string, payload: Partial<CreateAdminVehicleInput>) {
    const res = await api.patch(`/admin/vehicles/${id}`, payload);
    return res.data as { data?: AdminVehicle } | AdminVehicle;
  },

  async remove(id: string) {
    const res = await api.delete(`/admin/vehicles/${id}`);
    return res.data as { success?: boolean } | undefined;
  },

  async transfer(id: string, stationId: string) {
    const res = await api.post(`/admin/vehicles/${id}/transfer`, { stationId });
    return res.data;
  },

  async setMaintenance(
    id: string,
    data: { status: "maintenance" | "available"; maintenanceNotes?: string; estimatedCompletionDate?: string }
  ) {
    const res = await api.post(`/admin/vehicles/${id}/maintenance`, data);
    return res.data as { data?: AdminVehicle } | AdminVehicle;
  },
};

export default adminVehiclesAPI;
