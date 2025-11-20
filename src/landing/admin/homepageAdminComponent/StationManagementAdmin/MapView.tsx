import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MdLocationCity, MdMyLocation } from "react-icons/md";
import { createPopupContent } from "./stationPopupUtils";
import {
  getProvinceCoordinate,
  getProvinceNames,
} from "../../../../data/provinceData";
// import { getProvinceCoordinate } from "./provinceCoordinates";
import type { Station } from "../../../../service/apiAdmin/apiStation/API";

// Fix default marker icon issue with Vite
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // ✅ Province filter state
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const provinceList = getProvinceNames();

  // Tạo custom icon theo trạng thái
  const createCustomIcon = (station: Station): L.DivIcon => {
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

  // ✅ Filter stations by province
  const filteredStations =
    selectedProvince === "all"
      ? stations
      : stations.filter((s) => s.province === selectedProvince);

  // ✅ Handle province change
  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);

    if (province !== "all" && mapRef.current) {
      const coordinate = getProvinceCoordinate(province);
      if (coordinate) {
        // Zoom to province
        mapRef.current.setView(
          [coordinate.lat, coordinate.lng],
          coordinate.zoom,
          {
            animate: true,
            duration: 1,
          }
        );
      }
    }
  };

  // ✅ Reset to show all stations
  const handleResetView = () => {
    setSelectedProvince("all");

    if (mapRef.current && stations.length > 0) {
      const validStations = stations.filter(
        (s) =>
          s.location &&
          typeof s.location.lat === "number" &&
          typeof s.location.lng === "number" &&
          !isNaN(s.location.lat) &&
          !isNaN(s.location.lng)
      );

      if (validStations.length > 1) {
        const bounds = L.latLngBounds(
          validStations.map(
            (s) => [s.location.lat, s.location.lng] as L.LatLngTuple
          )
        );
        mapRef.current.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15,
          animate: true,
        });
      } else if (validStations.length === 1) {
        mapRef.current.setView(
          [validStations[0].location.lat, validStations[0].location.lng],
          13,
          { animate: true }
        );
      }
    }
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

    console.log(
      "🗺️ Initializing map with",
      filteredStations.length,
      "stations"
    );

    // ✅ Filter valid stations
    const validStations = filteredStations.filter(
      (s) =>
        s.location &&
        typeof s.location.lat === "number" &&
        typeof s.location.lng === "number" &&
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

    // ✅ Default center
    let center: L.LatLngExpression = [16.047079, 108.20623];
    let zoom = 6;

    // ✅ Set center based on province or stations
    if (selectedProvince !== "all") {
      const coordinate = getProvinceCoordinate(selectedProvince);
      if (coordinate) {
        center = [coordinate.lat, coordinate.lng];
        zoom = coordinate.zoom;
      }
    } else if (validStations.length === 1) {
      center = [validStations[0].location.lat, validStations[0].location.lng];
      zoom = 13;
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

    // ✅ Fit bounds after map is ready (only if showing all)
    if (selectedProvince === "all" && validStations.length > 1) {
      const bounds = L.latLngBounds(
        validStations.map(
          (s) => [s.location.lat, s.location.lng] as L.LatLngTuple
        )
      );

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

      marker.on("click", function (this: L.Marker) {
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
  }, [filteredStations, selectedProvince]);

  // ✅ Resize map when data changes
  useEffect(() => {
    if (mapRef.current) {
      const timer = setTimeout(() => {
        mapRef.current?.invalidateSize();
        console.log("📐 Map resized");
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [filteredStations]);

  return (
    <div className="map-wrapper w-full ml-0 mr-0 -mx-8">
      {/* Map Header with Province Filter */}
      <div className="map-header mb-2 -mt-2 px-8 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">🗺️ Station Map</h2>
            <p className="text-sm text-gray-600 mt-1">
              Displaying {filteredStations.length} of {stations.length} stations
              {selectedProvince !== "all" && ` in ${selectedProvince}`}
            </p>
          </div>

          {/* Province Filter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <MdLocationCity className="text-gray-500 w-5 h-5" />
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Filter by Province:
              </span>
            </div>

            <select
              value={selectedProvince}
              onChange={(e) => handleProvinceChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
            >
              <option value="all">All Provinces ({stations.length})</option>
              {provinceList.map((province) => {
                const count = stations.filter(
                  (s) => s.province === province
                ).length;
                return (
                  <option key={province} value={province}>
                    {province} ({count})
                  </option>
                );
              })}
            </select>

            {/* Reset Button */}
            {selectedProvince !== "all" && (
              <button
                onClick={handleResetView}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                <MdMyLocation className="w-4 h-4" />
                Reset View
              </button>
            )}
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
