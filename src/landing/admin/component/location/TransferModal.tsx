import React, { useState } from "react";
import { MdClose, MdSwapHoriz, MdLocationOn, MdDirectionsCar } from "react-icons/md";
import { type Station } from "./StationCard";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: Station[];
  selectedStation?: Station;
}

interface TransferRequest {
  fromStationId: string;
  toStationId: string;
  vehicleCount: number;
  reason: string;
  priority: "low" | "medium" | "high";
}

const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  stations,
  selectedStation,
}) => {
  const [transferRequest, setTransferRequest] = useState<TransferRequest>({
    fromStationId: selectedStation?.id || "",
    toStationId: "",
    vehicleCount: 1,
    reason: "",
    priority: "medium",
  });

  if (!isOpen) return null;

  const fromStation = stations.find(s => s.id === transferRequest.fromStationId);
  const toStation = stations.find(s => s.id === transferRequest.toStationId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Implement transfer logic
    console.log("Transfer request:", transferRequest);
    
    // Close modal and reset form
    onClose();
    setTransferRequest({
      fromStationId: "",
      toStationId: "",
      vehicleCount: 1,
      reason: "",
      priority: "medium",
    });
  };

  const getPriorityBadge = (priority: TransferRequest["priority"]) => {
    const config = {
      low: { color: "bg-gray-100 text-gray-800", text: "Thấp" },
      medium: { color: "bg-yellow-100 text-yellow-800", text: "Trung bình" },
      high: { color: "bg-red-100 text-red-800", text: "Cao" },
    };
    return config[priority];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MdSwapHoriz className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Điều phối xe
              </h2>
              <p className="text-sm text-gray-500">
                Di chuyển xe giữa các điểm thuê
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MdClose className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From Station */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <MdLocationOn className="w-5 h-5 mr-2" />
                Từ điểm thuê
              </h3>
              
              <select
                value={transferRequest.fromStationId}
                onChange={(e) =>
                  setTransferRequest(prev => ({ ...prev, fromStationId: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn điểm thuê</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name} ({station.vehicleCount} xe)
                  </option>
                ))}
              </select>

              {fromStation && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{fromStation.name}</p>
                  <p className="text-xs text-gray-600">{fromStation.address}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-sm text-gray-500">
                      <MdDirectionsCar className="w-4 h-4 inline mr-1" />
                      {fromStation.vehicleCount} xe
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* To Station */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <MdLocationOn className="w-5 h-5 mr-2" />
                Đến điểm thuê
              </h3>
              
              <select
                value={transferRequest.toStationId}
                onChange={(e) =>
                  setTransferRequest(prev => ({ ...prev, toStationId: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn điểm thuê</option>
                {stations
                  .filter(s => s.id !== transferRequest.fromStationId)
                  .map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name} ({station.vehicleCount} xe)
                    </option>
                  ))}
              </select>

              {toStation && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{toStation.name}</p>
                  <p className="text-xs text-gray-600">{toStation.address}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-sm text-gray-500">
                      <MdDirectionsCar className="w-4 h-4 inline mr-1" />
                      {toStation.vehicleCount} xe
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transfer Details */}
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng xe
                </label>
                <input
                  type="number"
                  min="1"
                  max={fromStation?.vehicleCount || 1}
                  value={transferRequest.vehicleCount}
                  onChange={(e) =>
                    setTransferRequest(prev => ({ 
                      ...prev, 
                      vehicleCount: parseInt(e.target.value) || 1 
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mức độ ưu tiên
                </label>
                <select
                  value={transferRequest.priority}
                  onChange={(e) =>
                    setTransferRequest(prev => ({ 
                      ...prev, 
                      priority: e.target.value as TransferRequest["priority"]
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do điều phối
              </label>
              <textarea
                value={transferRequest.reason}
                onChange={(e) =>
                  setTransferRequest(prev => ({ ...prev, reason: e.target.value }))
                }
                placeholder="Mô tả lý do cần điều phối xe..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Preview */}
          {fromStation && toStation && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Xem trước yêu cầu
              </h4>
              <div className="text-sm text-gray-600">
                Di chuyển <strong>{transferRequest.vehicleCount} xe</strong> từ{" "}
                <strong>{fromStation.name}</strong> đến{" "}
                <strong>{toStation.name}</strong>
                {" "}với mức độ ưu tiên{" "}
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(transferRequest.priority).color}`}>
                  {getPriorityBadge(transferRequest.priority).text}
                </span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Tạo yêu cầu điều phối
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
