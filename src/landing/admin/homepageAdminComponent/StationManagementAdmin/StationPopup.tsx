import React from "react";
import type { Station } from "../../../../service/apiAdmin/apiStation/API";

interface StationPopupProps {
  station: Station;
}

const StationPopup: React.FC<StationPopupProps> = ({ station }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-w-[280px] max-w-[320px] font-sans">
      {/* Cover Image */}
      {station.imgStation?.url && (
        <div className="mb-4 -mx-3 -mt-3">
          <img
            src={station.imgStation.url}
            alt={station.name}
            className="w-full h-40 object-cover rounded-t-lg"
          />
        </div>
      )}

      {/* Header */}
      <h3 className="text-base font-bold text-gray-900 border-b-2 pb-2 mb-3 flex items-center gap-2">
        📍 {station.name}
      </h3>

      {/* Status */}
      <div
        className={`mb-3 p-3 rounded-lg ${
          station.isActive
            ? "bg-green-50 border-l-4 border-green-500"
            : "bg-red-50 border-l-4 border-red-500"
        }`}
      >
        <div className="flex items-center justify-between">
          <p
            className={`text-sm font-semibold ${
              station.isActive ? "text-green-800" : "text-red-800"
            }`}
          >
            {station.isActive ? "Active" : "Inactive"}
          </p>
          {station.code && (
            <span className="text-xs font-mono font-semibold text-gray-600 bg-white px-2 py-1 rounded">
              {station.code}
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-600 font-semibold mb-1">
            📍 Address
          </div>
          <div className="text-sm text-gray-900">
            {station.location?.address || "Not updated"}
          </div>
        </div>

        {station.note && (
          <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
            <div className="text-xs text-yellow-900 font-semibold mb-1">
              📝 Note
            </div>
            <div className="text-xs text-yellow-800">{station.note}</div>
          </div>
        )}

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-900 font-semibold mb-2">
            🌍 Coordinates
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-gray-600">Latitude</div>
              <div className="font-mono font-semibold text-blue-900">
                {station.location?.lat?.toFixed(6) || "0.000000"}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Longitude</div>
              <div className="font-mono font-semibold text-blue-900">
                {station.location?.lng?.toFixed(6) || "0.000000"}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-3 rounded-lg">
          <div className="text-xs text-gray-400 font-semibold mb-1">
            📅 Created
          </div>
          <div className="text-sm font-semibold text-white">
            {formatDate(station.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationPopup;
