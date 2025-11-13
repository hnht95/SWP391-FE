// src/landing/user/component/headerComponent/userComponent/userProfileComponent/userTabComponent/bookingComponent/ManualRefundsDonePage.tsx
import React, { useEffect, useMemo, useState } from "react";
import profileApi, {
  type ManualRefundItem,
  type Paginated,
} from "../../../../../../../service/apiUser/profile/API";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaRegImage,
  FaClock,
  FaMoneyBillWave,
  FaUniversity,
} from "react-icons/fa";

const isImageUrl = (u: string): boolean => {
  const url = u.toLowerCase();
  return (
    url.endsWith(".jpg") ||
    url.endsWith(".jpeg") ||
    url.endsWith(".png") ||
    url.endsWith(".webp") ||
    url.endsWith(".gif") ||
    url.includes("/image/upload")
  );
};

const extractUrlFromAttachment = (raw: string): string => {
  // Hỗ trợ chuỗi Markdown: [text](url)
  const md = /\((https?:\/\/[^\s)]+)\)/.exec(raw);
  if (md?.[1]) return md[1];
  const plain = /(https?:\/\/[^\s)]+)$/.exec(raw);
  return md?.[1] || plain?.[1] || raw;
};

const fmtMoney = (amount: number, currency = "VND") => {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
};

const fmtDateTime = (iso?: string) => {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
};

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
        <div className="py-16 text-center text-gray-500">No refunds</div>
      ) : (
        <div className="space-y-5">
          {items.map((r) => {
            const imgs =
              r.attachments
                ?.map((s) => extractUrlFromAttachment(String(s)))
                .filter(Boolean)
                .filter((u) => isImageUrl(u)) || [];

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
                  <div className="space-y-1">
                    <span className="block text-gray-500 flex items-center gap-2">
                      <FaMoneyBillWave className="text-green-700" />
                      Amount
                    </span>
                    <div className="font-semibold text-green-700">
                      {fmtMoney(r.amount, r.currency)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-gray-500 flex items-center gap-2">
                      <FaClock className="text-gray-700" />
                      Transferred At
                    </span>
                    <div className="font-semibold">
                      {fmtDateTime(r.transferredAt)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-gray-500 flex items-center gap-2">
                      <FaUniversity className="text-gray-700" />
                      Beneficiary
                    </span>
                    <div className="font-semibold">
                      {r.beneficiary?.accountName || "-"} •{" "}
                      {r.beneficiary?.bankName ||
                        r.beneficiary?.bankCode ||
                        "-"}{" "}
                      • {r.beneficiary?.accountNumber || "-"}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Attachments</p>
                  {imgs.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {imgs.map((u, idx) => (
                        <div
                          key={`${r.id}-img-${idx}`}
                          className="relative group rounded-xl overflow-hidden border"
                        >
                          <img
                            src={u}
                            alt={`Attachment ${idx + 1}`}
                            className="w-full h-40 object-cover bg-gray-100"
                            onError={(e) => {
                              (
                                e.currentTarget as HTMLImageElement
                              ).style.display = "none";
                              const sib = e.currentTarget
                                .nextElementSibling as HTMLElement | null;
                              if (sib) sib.style.display = "flex";
                            }}
                          />
                          <div className="hidden absolute inset-0 items-center justify-center bg-gray-100 text-gray-500">
                            <FaRegImage className="w-5 h-5 mr-1" />
                            <span className="text-xs">
                              Preview not available
                            </span>
                          </div>
                          <a
                            href={u}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-medium shadow hover:bg-white"
                          >
                            Open
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FaRegImage className="w-4 h-4" />
                      No image attachments
                    </div>
                  )}
                </div>

                {r.staff?.name ? (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                    <FaCheckCircle className="w-4 h-4 text-green-600" />
                    Staff:{" "}
                    <span className="font-medium text-gray-900 ml-1">
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
