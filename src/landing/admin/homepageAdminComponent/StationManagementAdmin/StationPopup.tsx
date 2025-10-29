import type { Station } from "../../../../service/apiAdmin/apiStation/API";

interface StationPopupProps {
  station: Station;
}

export const createPopupContent = (station: Station): string => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusColor = station.isActive ? "#10b981" : "#ef4444";
  const statusText = station.isActive ? "Active" : "Inactive";

  // ✅ Get image URL from imgStation
  const imageUrl = station.imgStation?.url || "";

  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 280px; max-width: 320px;">
      ${
        imageUrl
          ? `<div style="margin: -12px -12px 12px -12px;">
              <img 
                src="${imageUrl}" 
                alt="${station.name}"
                style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px 8px 0 0;"
                onerror="this.parentElement.style.display='none'"
              />
            </div>`
          : ""
      }
      
      <h3 style="margin: 0 0 12px 0; font-size: 17px; font-weight: 700; color: #111827; border-bottom: 2px solid ${statusColor}; padding-bottom: 8px; display: flex; align-items: center; gap: 8px;">
        📍 ${station.name}
      </h3>

      <div style="margin: 10px 0; padding: 10px; background-color: ${statusColor}15; border-left: 4px solid ${statusColor}; border-radius: 6px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 13px; font-weight: 600; color: ${statusColor};">
            ${statusText}
          </span>
          ${
            station.code
              ? `<span style="font-size: 12px; font-weight: 600; color: #6b7280; font-family: 'Courier New', monospace; background: white; padding: 3px 8px; border-radius: 4px;">
                  ${station.code}
                </span>`
              : ""
          }
        </div>
      </div>

      <div style="margin-top: 14px; display: flex; flex-direction: column; gap: 10px;">
        <div style="padding: 10px; background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
          <div style="font-size: 10px; color: #6b7280; margin-bottom: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📍 Địa chỉ</div>
          <div style="font-size: 13px; color: #111827; line-height: 1.5;">${
            station.location?.address || "Chưa cập nhật"
          }</div>
        </div>

        ${
          station.note
            ? `<div style="padding: 10px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
                <div style="font-size: 10px; color: #92400e; margin-bottom: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📝 Ghi chú</div>
                <div style="font-size: 12px; color: #78350f; line-height: 1.5;">${station.note}</div>
              </div>`
            : ""
        }

        <div style="padding: 10px; background-color: #eff6ff; border-radius: 6px; border: 1px solid #bfdbfe;">
          <div style="font-size: 10px; color: #1e40af; margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">🌍 Tọa độ</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <div style="font-size: 10px; color: #6b7280; margin-bottom: 2px;">Latitude</div>
              <div style="font-size: 12px; color: #1e40af; font-family: 'Courier New', monospace; font-weight: 600;">
                ${station.location?.lat?.toFixed(6) || "0.000000"}
              </div>
            </div>
            <div>
              <div style="font-size: 10px; color: #6b7280; margin-bottom: 2px;">Longitude</div>
              <div style="font-size: 12px; color: #1e40af; font-family: 'Courier New', monospace; font-weight: 600;">
                ${station.location?.lng?.toFixed(6) || "0.000000"}
              </div>
            </div>
          </div>
        </div>

        <div style="padding: 10px; background-color: #1f2937; border-radius: 6px;">
          <div style="font-size: 10px; color: #9ca3af; margin-bottom: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📅 Ngày tạo</div>
          <div style="font-size: 12px; font-weight: 600; color: white;">${formatDate(
            station.createdAt
          )}</div>
        </div>
      </div>
    </div>
  `;
};

// React component version (for reference, not used in Leaflet)
const StationPopup: React.FC<StationPopupProps> = ({ station }) => {
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
            📍 Địa chỉ
          </div>
          <div className="text-sm text-gray-900">
            {station.location?.address || "Chưa cập nhật"}
          </div>
        </div>

        {station.note && (
          <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
            <div className="text-xs text-yellow-900 font-semibold mb-1">
              📝 Ghi chú
            </div>
            <div className="text-xs text-yellow-800">{station.note}</div>
          </div>
        )}

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-900 font-semibold mb-2">
            🌍 Tọa độ
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
            📅 Ngày tạo
          </div>
          <div className="text-sm font-semibold text-white">
            {new Date(station.createdAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationPopup;
