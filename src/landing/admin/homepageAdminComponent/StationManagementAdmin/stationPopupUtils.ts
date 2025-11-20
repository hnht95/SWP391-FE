import type { Station } from "../../../../service/apiAdmin/apiStation/API";

/**
 * Helper function to format date for popup display
 */
const formatDate = (dateString?: string): string => {
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

/**
 * Create popup content HTML string for Leaflet marker
 */
export const createPopupContent = (station: Station): string => {
  const statusColor = station.isActive ? "#10b981" : "#ef4444";
  const statusText = station.isActive ? "Active" : "Inactive";
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
          <div style="font-size: 10px; color: #6b7280; margin-bottom: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📍 Address</div>
          <div style="font-size: 13px; color: #111827; line-height: 1.5;">${
            station.location?.address || "Not updated"
          }</div>
        </div>

        ${
          station.note
            ? `<div style="padding: 10px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
                <div style="font-size: 10px; color: #92400e; margin-bottom: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📝 Note</div>
                <div style="font-size: 12px; color: #78350f; line-height: 1.5;">${station.note}</div>
              </div>`
            : ""
        }

        <div style="padding: 10px; background-color: #eff6ff; border-radius: 6px; border: 1px solid #bfdbfe;">
          <div style="font-size: 10px; color: #1e40af; margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">🌍 Coordinates</div>
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
          <div style="font-size: 10px; color: #9ca3af; margin-bottom: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📅 Created</div>
          <div style="font-size: 12px; font-weight: 600; color: white;">${formatDate(
            station.createdAt
          )}</div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Create tooltip content HTML string (shown on hover)
 */
export const createTooltipContent = (station: Station): string => {
  const statusColor = station.isActive ? "#10b981" : "#ef4444";
  const statusText = station.isActive ? "Active" : "Inactive";

  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px;">
      <div style="font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 6px;">
        📍 ${station.name}
      </div>
      <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">
        ${station.location?.address || "Not updated"}
      </div>
      <div style="display: inline-block; font-size: 11px; font-weight: 600; color: ${statusColor}; background: ${statusColor}20; padding: 2px 8px; border-radius: 4px;">
        ${statusText}
      </div>
      ${
        station.code
          ? `<div style="font-size: 10px; color: #9ca3af; margin-top: 4px;">Code: ${station.code}</div>`
          : ""
      }
    </div>
  `;
};
