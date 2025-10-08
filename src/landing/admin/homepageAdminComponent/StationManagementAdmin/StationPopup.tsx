import type { Station } from './types';

interface StationPopupProps {
  station: Station;
}

export const createPopupContent = (station: Station): string => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColor = station.isActive ? '#10b981' : '#ef4444';
  const statusText = station.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động';

  // Vehicle counts (mock if not available)
  const availableCount = station.availableCount || 0;
  const maintenanceCount = station.maintenanceCount || 0;
  const totalCount = station.vehicleCount || availableCount + maintenanceCount;

  return `
    <div style="font-family: sans-serif; min-width: 250px; max-width: 300px;">
      <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: bold; color: #1f2937; border-bottom: 2px solid ${statusColor}; padding-bottom: 8px;">
        ${station.name}
      </h3>
      
      <div style="margin: 8px 0; padding: 8px; background-color: ${statusColor}20; border-left: 3px solid ${statusColor}; border-radius: 4px;">
        <p style="margin: 0; font-size: 12px; font-weight: 600; color: ${statusColor};">
          ${statusText}
        </p>
      </div>
      
      <div style="margin-top: 12px;">
        <div style="margin: 8px 0; padding: 8px; background-color: #f3f4f6; border-radius: 4px;">
          <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">MÃ TRẠM</div>
          <div style="font-size: 13px; font-weight: bold; color: #1f2937; font-family: monospace;">${station.code}</div>
        </div>
        
        <div style="margin: 8px 0; padding: 8px; background-color: #f3f4f6; border-radius: 4px;">
          <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">ĐỊA CHỈ</div>
          <div style="font-size: 12px; color: #1f2937; line-height: 1.4;">${station.location?.address || 'Chưa cập nhật'}</div>
        </div>
        
        ${
          station.note
            ? `
          <div style="margin: 8px 0; padding: 8px; background-color: #fef3c7; border-radius: 4px; border-left: 3px solid #f59e0b;">
            <div style="font-size: 11px; color: #92400e; margin-bottom: 4px;">GHI CHÚ</div>
            <div style="font-size: 12px; color: #78350f; line-height: 1.4;">${station.note}</div>
          </div>
        `
            : ''
        }
        
        ${
          totalCount > 0
            ? `
          <div style="margin: 8px 0; padding: 8px; background-color: #e0f2fe; border-radius: 4px;">
            <div style="font-size: 11px; color: #075985; margin-bottom: 8px; font-weight: 600;">SỐ XE</div>
            <div style="display: flex; justify-content: space-between; margin: 4px 0;">
              <span style="font-size: 12px; color: #0c4a6e;">Khả dụng:</span>
              <span style="font-size: 12px; font-weight: bold; color: #10b981;">${availableCount}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 4px 0;">
              <span style="font-size: 12px; color: #0c4a6e;">Bảo trì:</span>
              <span style="font-size: 12px; font-weight: bold; color: #f59e0b;">${maintenanceCount}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 4px 0; padding-top: 4px; border-top: 1px solid #bae6fd;">
              <span style="font-size: 12px; color: #0c4a6e; font-weight: 600;">Tổng:</span>
              <span style="font-size: 13px; font-weight: bold; color: #0369a1;">${totalCount}</span>
            </div>
          </div>
        `
            : ''
        }
        
        <div style="margin: 8px 0; padding: 8px; background-color: #e0e7ff; border-radius: 4px;">
          <div style="font-size: 11px; color: #3730a3; margin-bottom: 4px;">VỊ TRÍ</div>
          <div style="font-size: 11px; color: #4338ca; font-family: monospace;">
            ${station.location?.latitude.toFixed(6) || 0}, ${station.location?.longitude.toFixed(6) || 0}
          </div>
        </div>
        
        <div style="margin: 10px 0 0 0; padding: 8px; background-color: #1f2937; border-radius: 4px;">
          <div style="font-size: 11px; color: #9ca3af; margin-bottom: 4px;">NGÀY TẠO</div>
          <div style="font-size: 12px; font-weight: 600; color: white;">${formatDate(station.createdAt)}</div>
        </div>
      </div>
    </div>
  `;
};

// React component version (for reference, not used in Leaflet)
const StationPopup: React.FC<StationPopupProps> = ({ station }) => {
  return (
    <div className="min-w-[250px] max-w-[300px] font-sans">
      <h3 className="text-base font-bold text-gray-900 border-b-2 pb-2 mb-3">
        {station.name}
      </h3>
      
      <div className={`mb-3 p-2 rounded ${station.isActive ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
        <p className={`text-xs font-semibold ${station.isActive ? 'text-green-800' : 'text-red-800'}`}>
          {station.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </p>
      </div>

      <div className="space-y-2">
        <div className="bg-gray-100 p-2 rounded">
          <div className="text-xs text-gray-600">MÃ TRẠM</div>
          <div className="text-sm font-bold font-mono">{station.code}</div>
        </div>

        <div className="bg-gray-100 p-2 rounded">
          <div className="text-xs text-gray-600">ĐỊA CHỈ</div>
          <div className="text-xs">{station.location?.address || 'Chưa cập nhật'}</div>
        </div>

        {station.note && (
          <div className="bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
            <div className="text-xs text-yellow-900">GHI CHÚ</div>
            <div className="text-xs text-yellow-800">{station.note}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StationPopup;

