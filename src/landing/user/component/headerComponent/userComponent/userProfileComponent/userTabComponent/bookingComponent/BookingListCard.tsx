// components/BookingListCard.tsx
import React from "react";

type Props = {
  thumbnail?: string;
  title: string;
  subTitle?: string;
  startTime?: string;
  endTime?: string;
  stationName?: string;
  priceDisplay?: string;
  statusBadge?: { text: string; color: string }; // e.g. { text: "Active", color: "bg-green-100 text-green-800" }
  rightExtra?: React.ReactNode;
  onClick?: () => void;
};

export default function BookingListCard({
  thumbnail,
  title,
  subTitle,
  startTime,
  endTime,
  stationName,
  priceDisplay,
  statusBadge,
  rightExtra,
  onClick,
}: Props) {
  const fmt = (iso?: string) =>
    iso
      ? new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }).format(new Date(iso))
      : "";

  return (
    <div
      className="rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-md transition cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="w-28 h-20 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </p>
              {subTitle ? (
                <p className="text-sm text-gray-600 truncate">{subTitle}</p>
              ) : null}
            </div>
            {statusBadge ? (
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}
              >
                {statusBadge.text}
              </span>
            ) : null}
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Start:</span>
              <span className="font-medium">{fmt(startTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">End:</span>
              <span className="font-medium">{fmt(endTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Station:</span>
              <span className="font-medium truncate">{stationName || "-"}</span>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="text-green-700 font-semibold">{priceDisplay}</div>
            {rightExtra}
          </div>
        </div>
      </div>
    </div>
  );
}
