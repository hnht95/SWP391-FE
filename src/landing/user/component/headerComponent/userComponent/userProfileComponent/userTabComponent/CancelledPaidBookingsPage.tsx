// pages/CancelledPaidBookingsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import profileApi, {
  type CancelledPaidItem,
  type Paginated,
} from "../../../../../../../service/apiUser/profile/API";
import BookingListCard from "./bookingComponent/BookingListCard";
// import BookingListCard from "../../../components/BookingListCard";

export default function CancelledPaidBookingsPage() {
  const [data, setData] = useState<Paginated<CancelledPaidItem> | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    const run = async () => {
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
    };
    run();
    return () => {
      mounted = false;
    };
  }, [page, limit]);

  const items = data?.items || [];

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

  return (
    <div className="max-w-5xl mx-auto p-6">
      {header}

      {loading ? (
        <div className="py-16 text-center text-gray-500">Loading...</div>
      ) : err ? (
        <div className="py-16 text-center text-red-600">{err}</div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-gray-500">No data</div>
      ) : (
        <div className="space-y-4">
          {items.map((b) => {
            const title = `${b.vehicle.brand} ${b.vehicle.model}`;
            const sub = b.vehicle.plateNumber;
            const priceDisplay =
              typeof b.amounts?.rentalEstimated === "number"
                ? `${(b.amounts.rentalEstimated || 0).toLocaleString()}đ`
                : undefined;

            // lấy thumbnail đầu nếu có
            const ext = b.vehicle.defaultPhotos?.exterior as any[];
            const thumb =
              Array.isArray(ext) && ext.length > 0
                ? typeof ext[0] === "string"
                  ? ext[0]
                  : ext[0]?.url
                : undefined;

            return (
              <BookingListCard
                key={b.bookingId}
                thumbnail={thumb}
                title={title}
                subTitle={sub}
                startTime={b.startTime}
                endTime={b.endTime}
                stationName={b.station?.name}
                priceDisplay={priceDisplay}
                statusBadge={{
                  text: "Cancelled",
                  color: "bg-red-100 text-red-800",
                }}
                rightExtra={
                  b.deposit?.status ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                      Deposit {b.deposit.status}
                    </span>
                  ) : null
                }
              />
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
            disabled={page >= data.totalPages}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
