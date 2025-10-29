import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createPopupContent } from "./StationPopup";
import type { Station } from "./types";

// Fix default marker icon issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapViewProps {
  stations: Station[];
}

const MapView: React.FC<MapViewProps> = ({ stations }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Tạo custom icon theo trạng thái
  const createCustomIcon = (station: Station) => {
    // Determine color based on status and vehicle availability
    let color = '#10b981'; // Default green (active)
    
    if (!station.isActive) {
      color = '#ef4444'; // Red (inactive)
    } else if (station.maintenanceCount && station.vehicleCount) {
      const maintenanceRatio = station.maintenanceCount / station.vehicleCount;
      if (maintenanceRatio > 0.5) {
        color = '#f59e0b'; // Yellow (high maintenance)
      }
    } else if (station.availableCount !== undefined && station.vehicleCount) {
      const availableRatio = station.availableCount / station.vehicleCount;
      if (availableRatio < 0.2) {
        color = '#ef4444'; // Red (low availability)
      }
    }

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
    if (!mapContainerRef.current || mapRef.current || stations.length === 0) return;

    // Calculate bounds from all station markers
    const bounds = L.latLngBounds(
      stations
        .filter((s) => s.location?.latitude && s.location?.longitude)
        .map((station) => [
          station.location!.latitude,
          station.location!.longitude,
        ])
    );

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [16.047079, 108.20623], // Center of Vietnam
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
    });

    // Fit map to bounds if we have stations
    if (stations.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    mapRef.current = map;

    // Add tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
      minZoom: 5,
    }).addTo(map);

    // Add markers for each station
    stations.forEach((station) => {
      if (!station.location?.latitude || !station.location?.longitude) return;

      const icon = createCustomIcon(station);

      const marker = L.marker(
        [station.location.latitude, station.location.longitude],
        { icon }
      ).addTo(map);

      // Create popup with station info
      const popupContent = createPopupContent(station);

      const popup = L.popup({
        maxWidth: 320,
        minWidth: 250,
        closeButton: true,
        autoClose: false,
        closeOnClick: false,
        offset: [0, -10],
      }).setContent(popupContent);

      marker.bindPopup(popup);

      // Click event to open popup
      marker.on("click", function () {
        this.openPopup();
      });

      // Hover events for better UX
      let closeTimeout: NodeJS.Timeout | null = null;

      marker.on("mouseover", function () {
        if (closeTimeout) {
          clearTimeout(closeTimeout);
          closeTimeout = null;
        }
        this.openPopup();
      });

      marker.on("mouseout", function () {
        // Don't auto-close on mouseout, let user close manually or click elsewhere
      });
    });

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [stations]);

  // Resize map when stations change
  useEffect(() => {
    if (mapRef.current) {
      const timer = setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [stations]);

  return (
    <div className="map-wrapper w-full ml-0 mr-0 -mx-8">
      {/* Map Header */}
      <div className="map-header mb-2 -mt-2 px-8 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              🗺️ Station Map
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Displaying location and status of {stations.length} stations
            </p>
          </div>
          
          {/* Legend */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Normal</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">High Maintenance</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Low Stock / Inactive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        id="station-map"
        className="map-container w-full h-[calc(100vh-180px)] relative z-0 rounded-lg"
        style={{ backgroundColor: "#f0f0f0" }}
      />
    </div>
  );
};

export default MapView;

