import React, { useMemo, useState } from "react";
import {
  MdAttachMoney,
  MdReceiptLong,
  MdCalendarToday,
} from "react-icons/md";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";
import ListManualRefunds from "./ListManualRefunds";
import {
  formatCurrency,
  type ManualRefund,
} from "../../../../service/apiAdmin/apiManualRefunds/API";

type TimeRangeKey = "7d" | "30d" | "90d" | "all";

const TIME_RANGES: Array<{ label: string; value: TimeRangeKey; days?: number }> =
  [
    { label: "7D", value: "7d", days: 7 },
    { label: "30D", value: "30d", days: 30 },
    { label: "90D", value: "90d", days: 90 },
    { label: "All", value: "all" },
  ];

const STATUS_META: Record<
  string,
  { label: string; from: string; to: string; text: string }
> = {
  pending: {
    label: "Pending",
    from: "#fde68a",
    to: "#f59e0b",
    text: "text-amber-600",
  },
  approved: {
    label: "Approved",
    from: "#bbf7d0",
    to: "#10b981",
    text: "text-emerald-600",
  },
  processing: {
    label: "Processing",
    from: "#bfdbfe",
    to: "#2563eb",
    text: "text-blue-600",
  },
  completed: {
    label: "Completed",
    from: "#ddd6fe",
    to: "#7c3aed",
    text: "text-purple-600",
  },
  done: {
    label: "Done",
    from: "#ddd6fe",
    to: "#7c3aed",
    text: "text-purple-600",
  },
  cancelled: {
    label: "Cancelled",
    from: "#e5e7eb",
    to: "#6b7280",
    text: "text-gray-600",
  },
  rejected: {
    label: "Rejected",
    from: "#fecdd3",
    to: "#f43f5e",
    text: "text-rose-600",
  },
};

const ManualRefundsManagement: React.FC = () => {
  const [refunds, setRefunds] = useState<ManualRefund[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("30d");

  const filteredRefunds = useMemo(() => {
    if (timeRange === "all") return refunds;
    const range = TIME_RANGES.find((item) => item.value === timeRange);
    if (!range?.days) return refunds;
    const cutoff = Date.now() - range.days * 24 * 60 * 60 * 1000;
    return refunds.filter(
      (refund) => new Date(refund.createdAt).getTime() >= cutoff
    );
  }, [refunds, timeRange]);

  const summary = useMemo(() => {
    const totalAmount = filteredRefunds.reduce(
      (sum, refund) => sum + (refund.amount || 0),
      0
    );
    const totalRequests = filteredRefunds.length;

    const statusBreakdown = filteredRefunds.reduce<
      Record<string, { count: number; amount: number }>
    >((acc, refund) => {
      const statusKey = (refund.status || "unknown").toLowerCase();
      if (!acc[statusKey]) {
        acc[statusKey] = { count: 0, amount: 0 };
      }
      acc[statusKey].count += 1;
      acc[statusKey].amount += refund.amount || 0;
      return acc;
    }, {});

    return { totalAmount, totalRequests, statusBreakdown };
  }, [filteredRefunds]);

  const mostRecentAmount = filteredRefunds[0]?.amount || 0;

  const chartData = useMemo(() => {
    return Object.entries(summary.statusBreakdown).map(
      ([status, data]) => ({
        status:
          STATUS_META[status]?.label ||
          status.charAt(0).toUpperCase() + status.slice(1),
        count: data.count,
        amount: Number((data.amount / 1000).toFixed(2)), // convert to thousands
        rawAmount: data.amount,
      })
    );
  }, [summary.statusBreakdown]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MdCalendarToday className="h-4 w-4" />
          <span>Manual Refunds</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Refund Performance
        </h1>
        <p className="text-sm text-gray-500">
          Monitor manual refund amounts and request volume by time range.
        </p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
        {TIME_RANGES.map((range) => (
          <button
            key={range.value}
            onClick={() => setTimeRange(range.value)}
            className={`px-3 py-1.5 text-sm font-semibold rounded-xl transition-all ${
              timeRange === range.value
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-white via-gray-50/50 to-white p-6 lg:p-8 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50">
            <div className="rounded-xl bg-blue-600/10 p-3 text-blue-600">
              <MdAttachMoney className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total refund amount
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                {formatCurrency(summary.totalAmount, "VND")}
              </p>
              {mostRecentAmount > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Latest transaction: {formatCurrency(mostRecentAmount, "VND")}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
            <div className="rounded-xl bg-emerald-600/10 p-3 text-emerald-600">
              <MdReceiptLong className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total requests
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                {summary.totalRequests}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {Object.keys(summary.statusBreakdown).length} statuses
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white/80 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Status distribution
            </h3>
            <p className="text-xs text-gray-500">
              Amount bar displayed in thousands (VND)
            </p>
          </div>
          {chartData.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">
              No data for this range.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={12}>
                  <defs>
                    <linearGradient id="countGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#93C5FD" />
                      <stop offset="100%" stopColor="#2563EB" />
                    </linearGradient>
                    <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FDE68A" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="status"
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value}k`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="count"
                    name="Requests"
                    fill="url(#countGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={42}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="amount"
                    name="Amount (thousand VND)"
                    fill="url(#amountGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={42}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Manual refund list
        </h3>
        <ListManualRefunds onDataLoaded={setRefunds} />
      </div>
    </div>
  );
};

interface RefundStatusChartProps {
  total: number;
  totalAmount: number;
  breakdown: Record<string, { count: number; amount: number }>;
}

const RefundStatusChart: React.FC<RefundStatusChartProps> = ({
  total,
  totalAmount,
  breakdown,
}) => {
  const entries = Object.entries(breakdown).sort(
    (a, b) => b[1].amount - a[1].amount
  );

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">No data for this range.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map(([status, data]) => {
        const meta =
          STATUS_META[status] || {
            label: status,
            from: "#e5e7eb",
            to: "#9ca3af",
            text: "text-gray-600",
          };
        const countPercent = total ? (data.count / total) * 100 : 0;
        const amountPercent = totalAmount ? (data.amount / totalAmount) * 100 : 0;

        return (
          <div key={status} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${meta.from}, ${meta.to})`,
                  }}
                ></div>
                <span className={`text-sm font-semibold ${meta.text}`}>
                  {meta.label}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {data.count} requests
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(data.amount, "VND")}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">Requests:</span>
                <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(countPercent, 100)}%`,
                      background: `linear-gradient(90deg, ${meta.from}, ${meta.to})`,
                    }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-gray-700 w-12 text-right">
                  {countPercent.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">Amount:</span>
                <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(amountPercent, 100)}%`,
                      background: `linear-gradient(90deg, ${meta.from}, ${meta.to})`,
                      opacity: 0.85,
                    }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-gray-700 w-12 text-right">
                  {amountPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ChartTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload as {
    status: string;
    count: number;
    rawAmount: number;
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg text-sm space-y-1">
      <p className="font-semibold text-gray-900">{data.status}</p>
      <p className="text-gray-600">
        Requests: <span className="font-semibold">{data.count}</span>
      </p>
      <p className="text-gray-600">
        Amount:{" "}
        <span className="font-semibold">
          {formatCurrency(data.rawAmount || 0, "VND")}
        </span>
      </p>
    </div>
  );
};

export default ManualRefundsManagement;

