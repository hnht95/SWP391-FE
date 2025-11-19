import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatCurrency } from "../../../../service/apiBooking/API";
import { VscGraph } from "react-icons/vsc";

interface PaymentStatisticsChartProps {
  paymentStats: {
    totalCaptured: number;
    totalCancelled: number;
    monthlyData: Array<{ month: string; captured: number; cancelled: number }>;
  };
  paymentStatsLoading: boolean;
  paymentStatsError: string | null;
}

const PaymentStatisticsChart: React.FC<PaymentStatisticsChartProps> = ({
  paymentStats,
  paymentStatsLoading,
  paymentStatsError,
}) => {
  return (
    <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <VscGraph className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">analytical graph</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600">Captured</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600">Cancelled</span>
          </div>
        </div>
      </div>

      {paymentStatsError && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {paymentStatsError}
        </div>
      )}

      <div className="mt-6 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Total Captured</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(paymentStats.totalCaptured, "VND")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Total Cancelled</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(paymentStats.totalCancelled, "VND")}
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {paymentStatsLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-sm text-gray-500">Loading data...</div>
            </div>
          ) : paymentStats.monthlyData.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
              No payment data available to display chart.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={paymentStats.monthlyData}
                margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickFormatter={(value: number) => {
                    if (value >= 1000000) {
                      return `${(value / 1000000).toFixed(1)}M`;
                    }
                    if (value >= 1000) {
                      return `${(value / 1000).toFixed(0)}K`;
                    }
                    return value.toString();
                  }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                  formatter={(value: number, name: string) => {
                    if (name === "captured" || name === "Captured") {
                      return [formatCurrency(value, "VND"), "Captured"];
                    }
                    if (name === "cancelled" || name === "Cancelled") {
                      return [formatCurrency(value, "VND"), "Cancelled"];
                    }
                    return [formatCurrency(value, "VND"), name];
                  }}
                />
                <Bar
                  dataKey="captured"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Captured"
                  minPointSize={2}
                />
                <Bar
                  dataKey="cancelled"
                  fill="#eab308"
                  radius={[4, 4, 0, 0]}
                  name="Cancelled"
                  minPointSize={2}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatisticsChart;

