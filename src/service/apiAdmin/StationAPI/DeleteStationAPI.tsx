import api from "../Utils";

export interface DeleteStationResponse {
  success: boolean;
  deletedStationId: string;
  movedVehiclesCount: number;
}

export interface DeleteStationMessage {
  message: string;
}

export const deleteStationAPI = {
  async remove(stationId: string): Promise<DeleteStationResponse | DeleteStationMessage> {
    const res = await api.delete(`/stations/${stationId}`);
    return res.data as DeleteStationResponse | DeleteStationMessage;
  },
};

export default deleteStationAPI;
