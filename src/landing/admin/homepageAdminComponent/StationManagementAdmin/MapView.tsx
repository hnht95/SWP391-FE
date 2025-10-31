import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createPopupContent } from "./StationPopup";
import type { Station } from "../../../../service/apiAdmin/apiStation/API";

// Fix default marker icon issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapViewProps {
  stations: Station[];
}

const MapView: React.FC<MapViewProps> = ({ stations }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Tạo custom icon theo trạng thái
  const createCustomIcon = (station: Station) => {
    let color = "#10b981"; // Default green (active)

    if (!station.isActive) {
      color = "#ef4444"; // Red (inactive)
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

  // ✅ Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // ✅ Cleanup existing map first
    if (mapRef.current) {
      console.log("🗑️ Cleaning up existing map");
      mapRef.current.remove();
      mapRef.current = null;
      markersRef.current = [];
    }

    console.log("🗺️ Initializing map with", stations.length, "stations");

    // ✅ Filter valid stations (có coordinates hợp lệ)
    const validStations = stations.filter(
      (s) =>
        s.location?.lat &&
        s.location?.lng &&
        !isNaN(s.location.lat) &&
        !isNaN(s.location.lng) &&
        s.location.lat >= -90 &&
        s.location.lat <= 90 &&
        s.location.lng >= -180 &&
        s.location.lng <= 180
    );

    console.log("✅ Valid stations:", validStations.length);

    if (validStations.length === 0) {
      console.warn("⚠️ No valid stations with coordinates");
      return;
    }

    // ✅ Default center (Vietnam)
    let center: [number, number] = [16.047079, 108.20623];
    let zoom = 6;

    // ✅ Calculate bounds if we have stations
    if (validStations.length > 0) {
      const coordinates = validStations.map(
        (s) => [s.location.lat, s.location.lng] as [number, number]
      );

      // Use first station as center if only one
      if (coordinates.length === 1) {
        center = coordinates[0];
        zoom = 13;
      }
    }

    // ✅ Initialize map
    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
      maxZoom: 18,
      minZoom: 5,
    });

    mapRef.current = map;

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
      minZoom: 5,
    }).addTo(map);

    // ✅ Fit bounds after map is ready
    if (validStations.length > 1) {
      const bounds = L.latLngBounds(
        validStations.map((s) => [s.location.lat, s.location.lng])
      );

      // Wait for map to be fully initialized
      setTimeout(() => {
        if (mapRef.current) {
          try {
            mapRef.current.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 15,
            });
          } catch (err) {
            console.error("Error fitting bounds:", err);
          }
        }
      }, 100);
    }

    // ✅ Add markers
    validStations.forEach((station) => {
      const icon = createCustomIcon(station);

      const marker = L.marker([station.location.lat, station.location.lng], {
        icon,
      }).addTo(map);

      // Create popup
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

      marker.on("click", function () {
        this.openPopup();
      });

      marker.on("mouseover", function () {
        this.openPopup();
      });

      markersRef.current.push(marker);
    });

    console.log(
      "✅ Map initialized with",
      markersRef.current.length,
      "markers"
    );

    // ✅ Cleanup function
    return () => {
      console.log("🧹 Cleaning up map on unmount");
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
    };
  }, [stations]);

  // ✅ Resize map when data/layout may change
  useEffect(() => {
    if (mapRef.current) {
      const timer = setTimeout(() => {
        mapRef.current?.invalidateSize();
        console.log("📐 Map resized");
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [stations]);

  return (
    <div className="map-wrapper w-full ml-0 mr-0 -mx-8">
      {/* Map Header */}
      <div className="map-header mb-2 -mt-2 px-8 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">🗺️ Station Map</h2>
            <p className="text-sm text-gray-600 mt-1">
              Displaying location and status of {stations.length} stations
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Active</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Inactive</span>
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
