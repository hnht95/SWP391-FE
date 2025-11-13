// src/landing/user/component/headerComponent/userComponent/userProfileComponent/userTabComponent/bookingComponent/CancelledPaidBookingsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import profileApi, {
  type Paginated,
  type CancelledPaidItem,
} from "../../../../../../../service/apiUser/profile/API";
import {
  FaCarSide,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaRegImage,
  FaExclamationTriangle,
} from "react-icons/fa";

// Nếu cần parse chuỗi Markdown/URL ở UI (trong trường hợp API chưa normalize)
const extractUrl = (raw?: string | null): string | undefined => {
  if (!raw) return undefined;
  const s = String(raw);
  const md = /\((https?:\/\/[^\s)]+)\)/.exec(s);
  if (md?.[1]) return md[1];
  const plain = /(https?:\/\/[^\s)]+)$/.exec(s);
  return md?.[1] || plain?.[1] || (s.startsWith("http") ? s : undefined);
};

const fmtDate = (iso?: string) =>
  iso
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(iso))
    : "-";

const money = (v?: number, c = "VND") => {
  const n = typeof v === "number" ? v : 0;
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: c,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n.toLocaleString()} ${c}`;
  }
};

export default function CancelledPaidBookingsPage() {
  const [data, setData] = useState<Paginated<CancelledPaidItem> | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await profileApi.getMyCancelledPaidBookings({
          page,
          limit,
        });
        if (mounted) setData(res);
      } catch (e: any) {
        if (mounted)
          setErr(e?.message || "Failed to load cancelled paid bookings");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page, limit]);

  const header = useMemo(
    () => (
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Booking History</h1>
        <p className="text-sm text-gray-600">
          Your cancelled bookings with completed payments/refunds
        </p>
      </div>
    ),
    []
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        {header}
        <div className="py-16 text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        {header}
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <FaExclamationTriangle className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-sm text-red-700">{err}</p>
          </div>
        </div>
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <div className="max-w-5xl mx-auto p-6">
      {header}

      {items.length === 0 ? (
        <div className="py-16 text-center text-gray-500">No data</div>
      ) : (
        <div className="space-y-4">
          {items.map((b) => {
            // Fallback thumbnail logic: ưu tiên URL ảnh normalize từ API, nếu thiếu thì lấy defaultPhotos.exterior[0]
            const exterior = (b as any)?.vehicle?.defaultPhotos?.exterior;
            const normalizedImage = (b as any)?.vehicle?.image as
              | string
              | undefined;
            const thumb: string | undefined =
              normalizedImage && normalizedImage.startsWith("http")
                ? normalizedImage
                : Array.isArray(exterior) && exterior.length > 0
                ? typeof exterior[0] === "string"
                  ? exterior[0]
                  : exterior[0]?.url
                : extractUrl((b as any)?.vehicle?.image); // cuối cùng thử parse Markdown nếu có

            const title = `${b.vehicle.brand} ${b.vehicle.model}`;
            const plate = b.vehicle.plateNumber;
            const station = b.station?.name || "-";
            const priceDisplay =
              typeof b.amounts?.rentalEstimated === "number"
                ? money(b.amounts.rentalEstimated, "VND")
                : "";

            return (
              <div
                key={b.bookingId}
                className="rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-28 h-20 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                          const sib = e.currentTarget
                            .nextElementSibling as HTMLElement | null;
                          if (sib) sib.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full hidden items-center justify-center text-gray-500 ${
                        thumb ? "" : "flex"
                      }`}
                    >
                      <FaRegImage className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-lg font-semibold text-gray-900 truncate flex items-center gap-2">
                          <FaCarSide className="text-gray-700" />
                          {title}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {plate}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        Cancelled
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-500" />
                        <span className="text-gray-500">Start:</span>
                        <span className="font-medium">
                          {fmtDate(b.startTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-500" />
                        <span className="text-gray-500">End:</span>
                        <span className="font-medium">
                          {fmtDate(b.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-gray-500" />
                        <span className="text-gray-500">Station:</span>
                        <span className="font-medium truncate">{station}</span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-green-700 font-semibold inline-flex items-center gap-2">
                        <FaMoneyBillWave />
                        {priceDisplay}
                      </div>
                      {b.deposit?.status ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Deposit {b.deposit.status}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} / {data.totalPages}
          </span>
          <button
            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= (data?.totalPages || 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
