import React, { useState } from "react";
import { MdMap, MdLocationOn, MdZoomIn, MdZoomOut, MdMyLocation } from "react-icons/md";
import { type Station } from "./StationCard";

interface StationMapProps {
  stations: Station[];
  onStationClick?: (station: Station) => void;
}

const StationMap: React.FC<StationMapProps> = ({ stations, onStationClick }) => {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [zoomLevel, setZoomLevel] = useState(12);

  const handleStationClick = (station: Station) => {
    setSelectedStation(station);
    onStationClick?.(station);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 1, 8));
  };

  // Mock map positions for demonstration
  const stationPositions = stations.map((station, index) => ({
    ...station,
    x: 20 + (index % 3) * 30,
    y: 20 + Math.floor(index / 3) * 25,
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Map Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MdMap className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Bản đồ điểm thuê</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Zoom: {zoomLevel}</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-gray-200 rounded"
                title="Thu nhỏ"
              >
                <MdZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-gray-200 rounded"
                title="Phóng to"
              >
                <MdZoomIn className="w-4 h-4" />
              </button>
              <button
                className="p-1 hover:bg-gray-200 rounded"
                title="Vị trí của tôi"
              >
                <MdMyLocation className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Content */}
      <div className="relative bg-gray-100 h-96">
        {/* Mock map background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
          <div className="absolute inset-0 opacity-20">
            {/* Grid pattern to simulate map */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute border-gray-300"
                style={{
                  left: `${i * 5}%`,
                  top: 0,
                  width: '1px',
                  height: '100%',
                  borderLeft: '1px solid currentColor',
                }}
              />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute border-gray-300"
                style={{
                  top: `${i * 8.33}%`,
                  left: 0,
                  height: '1px',
                  width: '100%',
                  borderTop: '1px solid currentColor',
                }}
              />
            ))}
          </div>
        </div>

        {/* Station markers */}
        {stationPositions.map((station) => (
          <div
            key={station.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
              left: `${station.x}%`,
              top: `${station.y}%`,
            }}
            onClick={() => handleStationClick(station)}
          >
            <div
              className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                station.status === 'active'
                  ? 'bg-green-500'
                  : station.status === 'maintenance'
                  ? 'bg-yellow-500'
                  : 'bg-gray-500'
              } ${
                selectedStation?.id === station.id ? 'ring-4 ring-blue-300' : ''
              }`}
            >
              <MdLocationOn className="w-4 h-4 text-white" />
            </div>
            
            {/* Station info popup */}
            {selectedStation?.id === station.id && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-lg border p-3 min-w-[200px] z-10">
                <div className="text-sm font-medium text-gray-900">
                  {station.name}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {station.address}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {station.vehicleCount} xe có sẵn
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
              </div>
            )}
          </div>
        ))}

        {/* Map legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3">
          <div className="text-sm font-medium text-gray-900 mb-2">Trạng thái</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Hoạt động</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Bảo trì</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Không hoạt động</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationMap;
