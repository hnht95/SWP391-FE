import api from "../Utils";

export interface UpdateStationInput {
  name: string;
  code: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  note?: string;
  isActive: boolean;
}

export interface UpdateStationResponse {
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

export const updateStationAPI = {
  async update(stationId: string, data: UpdateStationInput): Promise<UpdateStationResponse> {
    const res = await api.put(`/stations/${stationId}`, data);
    return res.data;
  },
};

export default updateStationAPI;
