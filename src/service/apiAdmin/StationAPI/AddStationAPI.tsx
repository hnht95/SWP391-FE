import api from "../Utils";

export interface AddStationInput {
  name: string;
  code: string;
  address: string; // Address at root level
  lat: number;
  lng: number;
  note?: string;
  isActive: boolean;
}

export interface AddStationResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    code: string;
    location: {
      address: string;
      lat: number;
      lng: number;
    };
    note?: string;
    isActive: boolean;
  };
}

export const addStationAPI = {
  async create(data: AddStationInput): Promise<AddStationResponse> {
    const res = await api.post("/stations", data);
    return res.data;
  },
};

export default addStationAPI;
