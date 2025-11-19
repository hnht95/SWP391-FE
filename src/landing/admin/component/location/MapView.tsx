import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Import marker icons
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface StationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  activeCars: number;
  maintenanceCars: number;
  totalCars: number;
}

const MapView: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Mock data - Các trạm trên toàn quốc
  const stations: StationData[] = [
    {
      id: "1",
      name: "Hà Nội",
      lat: 21.0285,
      lng: 105.8542,
      activeCars: 45,
      maintenanceCars: 5,
      totalCars: 50,
    },
    {
      id: "2",
      name: "TP. Hồ Chí Minh",
      lat: 10.8231,
      lng: 106.6297,
      activeCars: 25,
      maintenanceCars: 35,
      totalCars: 60,
    },
    {
      id: "3",
      name: "Đà Nẵng",
      lat: 16.0544,
      lng: 108.2022,
      activeCars: 28,
      maintenanceCars: 12,
      totalCars: 40,
    },
    {
      id: "4",
      name: "Hải Phòng",
      lat: 20.8449,
      lng: 106.6881,
      activeCars: 35,
      maintenanceCars: 5,
      totalCars: 40,
    },
    {
      id: "5",
      name: "Cần Thơ",
      lat: 10.0452,
      lng: 105.7469,
      activeCars: 22,
      maintenanceCars: 8,
      totalCars: 30,
    },
    {
      id: "6",
      name: "Huế",
      lat: 16.4637,
      lng: 107.5909,
      activeCars: 18,
      maintenanceCars: 7,
      totalCars: 25,
    },
    {
      id: "7",
      name: "Nha Trang",
      lat: 12.2388,
      lng: 109.1967,
      activeCars: 30,
      maintenanceCars: 5,
      totalCars: 35,
    },
    {
      id: "8",
      name: "Đà Lạt",
      lat: 11.9404,
      lng: 108.4583,
      activeCars: 20,
      maintenanceCars: 5,
      totalCars: 25,
    },
    {
      id: "9",
      name: "Cà Mau",
      lat: 9.1767,
      lng: 105.1524,
      activeCars: 8,
      maintenanceCars: 12,
      totalCars: 20,
    },
    {
      id: "10",
      name: "Vũng Tàu",
      lat: 10.3458,
      lng: 107.0843,
      activeCars: 25,
      maintenanceCars: 5,
      totalCars: 30,
    },
  ];

  // Tính toán trạng thái và màu marker
  const getStationStatus = (station: StationData) => {
    const maintenanceRatio = station.maintenanceCars / station.totalCars;
    const availableRatio = station.activeCars / station.totalCars;

    if (maintenanceRatio > 0.5) {
      return { color: "#f59e0b", status: "Bảo trì nhiều" }; // Vàng
    } else if (availableRatio < 0.2) {
      return { color: "#ef4444", status: "Thiếu xe nặng" }; // Đỏ
    } else {
      return { color: "#10b981", status: "Hoạt động bình thường" }; // Xanh lá
    }
  };

  // Tạo custom icon theo màu
  const createCustomIcon = (color: string) => {
    return L.divIcon({
      className: "custom-div-icon",
      html: `
        <div style="position: relative;">
          <div style="
            width: 32px;
            height: 32px;
            background-color: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: white;
            font-weight: bold;
          ">📍</div>
          <div style="
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid ${color};
          "></div>
        </div>
      `,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -40],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Khởi tạo map
    const map = L.map(mapContainerRef.current, {
      center: [16.047079, 108.20623], // Trung tâm Việt Nam
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
    });

    mapRef.current = map;

    // Thêm tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
      minZoom: 5,
    }).addTo(map);

    // Thêm markers cho từng station
    stations.forEach((station) => {
      const statusInfo = getStationStatus(station);
      const icon = createCustomIcon(statusInfo.color);

      const marker = L.marker([station.lat, station.lng], { icon }).addTo(map);

      // Tạo popup content
      const popupContent = `
        <div style="font-family: sans-serif; min-width: 200px;">
          <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: bold; color: #1f2937; border-bottom: 2px solid ${statusInfo.color}; padding-bottom: 8px;">
            ${station.name}
          </h3>
          <div style="margin: 8px 0; padding: 8px; background-color: ${statusInfo.color}20; border-left: 3px solid ${statusInfo.color}; border-radius: 4px;">
            <p style="margin: 0; font-size: 12px; font-weight: 600; color: ${statusInfo.color};">
              ${statusInfo.status}
            </p>
          </div>
          <div style="margin-top: 12px;">
            <div style="display: flex; justify-content: space-between; margin: 6px 0; padding: 6px; background-color: #f3f4f6; border-radius: 4px;">
              <span style="font-size: 13px; color: #6b7280;">Xe hoạt động:</span>
              <span style="font-size: 13px; font-weight: bold; color: #10b981;">${station.activeCars}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 6px 0; padding: 6px; background-color: #f3f4f6; border-radius: 4px;">
              <span style="font-size: 13px; color: #6b7280;">Xe bảo trì:</span>
              <span style="font-size: 13px; font-weight: bold; color: #f59e0b;">${station.maintenanceCars}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 6px 0; padding: 6px; background-color: #f3f4f6; border-radius: 4px;">
              <span style="font-size: 13px; color: #6b7280;">Xe khả dụng:</span>
              <span style="font-size: 13px; font-weight: bold; color: #3b82f6;">${
                station.activeCars - station.maintenanceCars
              }</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 10px 0 0 0; padding: 8px; background-color: #1f2937; border-radius: 4px;">
              <span style="font-size: 14px; color: white; font-weight: 600;">Tổng số xe:</span>
              <span style="font-size: 16px; font-weight: bold; color: white;">${station.totalCars}</span>
            </div>
          </div>
        </div>
      `;

      const popup = L.popup({
        maxWidth: 300,
        minWidth: 250,
        closeButton: false,
        autoClose: false,
        closeOnClick: false,
        autoPan: false, // Tắt tự động pan đến marker
        offset: [0, -10],
      }).setContent(popupContent);

      marker.bindPopup(popup);

      let closeTimeout: NodeJS.Timeout | null = null;

      // Hover event - Mở popup khi hover
      marker.on("mouseover", () => {
        if (closeTimeout) {
          clearTimeout(closeTimeout);
          closeTimeout = null;
        }
        marker.openPopup();
      });

      // Mouseout event - Đóng popup khi di chuột ra (với delay nhỏ)
      marker.on("mouseout", () => {
        closeTimeout = setTimeout(() => {
          marker.closePopup();
        }, 200); // Delay 200ms để user có thể di chuột vào popup nếu muốn
      });

      // Event khi popup mở - giữ popup mở khi hover vào popup content
      popup.on("add", function () {
        const popupElement = popup.getElement();
        if (popupElement) {
          popupElement.addEventListener("mouseenter", () => {
            if (closeTimeout) {
              clearTimeout(closeTimeout);
              closeTimeout = null;
            }
          });

          popupElement.addEventListener("mouseleave", () => {
            marker.closePopup();
          });
        }
      });
    });

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Resize map khi window resize
  useEffect(() => {
    if (mapRef.current) {
      const handleResize = () => {
        setTimeout(() => {
          mapRef.current?.invalidateSize();
        }, 100);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <div className="map-wrapper w-full ml-0 mr-0 -mx-8">
      {/* Map Header - Nhích lên gần map hơn */}
      <div className="map-header mb-2 -mt-2 px-8 py-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              🗺️ Bản đồ trạm toàn quốc
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Hiển thị vị trí và trạng thái các trạm trên toàn quốc Việt Nam
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Bình thường</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Bảo trì nhiều</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Thiếu xe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container - Toàn màn hình */}
      <div
        ref={mapContainerRef}
        id="map"
        className="map-container w-full h-[calc(100vh-180px)] relative z-0"
        style={{ backgroundColor: "#f0f0f0" }}
      />
    </div>
  );
};

export default MapView;
