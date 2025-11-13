// pages/ManualRefundsDonePage.tsx
import React, { useEffect, useMemo, useState } from "react";
import type {
  ManualRefundItem,
  Paginated,
} from "../../../../../../../service/apiUser/profile/API";
import profileApi from "../../../../../../../service/apiUser/profile/API";
// import profileApi, { ManualRefundItem, Paginated } from "../../../../service/apiUser/profile/API";

export default function ManualRefundsDonePage() {
  const [data, setData] = useState<Paginated<ManualRefundItem> | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await profileApi.getMyManualRefundsDone({ page, limit });
        if (mounted) setData(res);
      } catch (e: any) {
        if (mounted) setErr(e?.message || "Failed to load manual refunds");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [page, limit]);

  const header = useMemo(
    () => (
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manual Refunds</h1>
        <p className="text-sm text-gray-600">
          Transfers processed by staff (Done)
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
      ) : !data || data.items.length === 0 ? (
        <div className="py-16 text-center text-gray-500">No refunds</div>
      ) : (
        <div className="space-y-4">
          {data.items.map((r) => {
            return (
              <div
                key={r.id}
                className="rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Booking</p>
                    <p className="font-semibold text-gray-900">
                      {r.booking.bookingId} • {r.booking.status.toUpperCase()}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    {r.status.toUpperCase()}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex justify-between md:block">
                    <span className="text-gray-500">Amount</span>
                    <div className="font-semibold text-green-700">
                      {r.amount.toLocaleString()} {r.currency}
                    </div>
                  </div>
                  <div className="flex justify-between md:block">
                    <span className="text-gray-500">Transferred At</span>
                    <div className="font-semibold">
                      {new Intl.DateTimeFormat("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(r.transferredAt))}
                    </div>
                  </div>
                  <div className="flex justify-between md:block">
                    <span className="text-gray-500">Beneficiary</span>
                    <div className="font-semibold">
                      {r.beneficiary?.accountName || "-"} •{" "}
                      {r.beneficiary?.bankName ||
                        r.beneficiary?.bankCode ||
                        "-"}{" "}
                      • {r.beneficiary?.accountNumber || "-"}
                    </div>
                  </div>
                </div>

                {r.attachments && r.attachments.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 mb-1">Attachments</p>
                    <div className="flex flex-wrap gap-2">
                      {r.attachments.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-50"
                        >
                          Attachment {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}

                {r.staff?.name ? (
                  <div className="mt-3 text-sm text-gray-600">
                    Staff:{" "}
                    <span className="font-medium text-gray-900">
                      {r.staff.name}
                    </span>
                    {r.note ? (
                      <span className="ml-2">• Note: {r.note}</span>
                    ) : null}
                  </div>
                ) : null}
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
            disabled={page >= data.totalPages}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
