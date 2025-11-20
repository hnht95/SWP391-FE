import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatCurrency } from "../../../../service/apiAdmin/apiBooking/API";
import { rangeLabels, type BookingRangeKey } from "./types";

interface BookingChartData {
  label: string;
  count: number;
  amount: number;
  totalPaid: number;
}

interface BookingVolumeChartProps {
  selectedBookingRange: BookingRangeKey;
  selectedBookings: any[];
  bookingChartData: BookingChartData[];
  totalRangeRevenue: number;
  totalRangePaid: number;
  bookingRangeLoading: boolean;
  bookingRangeError: string | null;
}

const BookingVolumeChart: React.FC<BookingVolumeChartProps> = ({
  selectedBookingRange,
  selectedBookings,
  bookingChartData,
  totalRangeRevenue,
  totalRangePaid,
  bookingRangeLoading,
  bookingRangeError,
}) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-3 lg:p-4 shadow-sm h-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div>
          <h3 className="text-base lg:text-lg font-semibold text-gray-900">Booking Volume</h3>
          <p className="text-xs lg:text-sm text-gray-500">
            {rangeLabels[selectedBookingRange]} · {selectedBookings.length} booking
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 lg:gap-6">
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Total deposit
            </p>
            <p className="text-sm lg:text-base font-semibold text-gray-900">
              {formatCurrency(totalRangeRevenue, "VND")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Total paid
            </p>
            <p className="text-sm lg:text-base font-semibold text-gray-900">
              {formatCurrency(totalRangePaid, "VND")}
            </p>
          </div>
        </div>
      </div>
      <div className="h-72 lg:h-80 xl:h-96">
        {bookingChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={bookingChartData}
              margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <YAxis
                yAxisId="left"
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickFormatter={(value: number) =>
                  value >= 1000 ? `${Math.round(value / 1000)}k` : value.toString()
                }
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3", stroke: "#cbd5f5" }}
                formatter={(value: number, name: string) => {
                  if (name === "amount") {
                    return [formatCurrency(value, "VND"), "Deposit"];
                  }
                  if (name === "totalPaid") {
                    return [formatCurrency(value, "VND"), "Total Paid"];
                  }
                  return [value, "Bookings"];
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="count"
                stroke="#4c1d95"
                strokeWidth={2.2}
                dot={{ r: 4, strokeWidth: 1.5, stroke: "#4c1d95", fill: "#fff" }}
                activeDot={{ r: 5.5, stroke: "#4c1d95", fill: "#fff" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="amount"
                stroke="#16a34a"
                strokeWidth={2.2}
                dot={{ r: 4, strokeWidth: 1.5, stroke: "#16a34a", fill: "#fff" }}
                activeDot={{ r: 5.5, stroke: "#16a34a", fill: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
            No booking data available to display chart.
          </div>
        )}
      </div>
      {bookingRangeLoading && (
        <p className="mt-3 text-xs text-gray-400">
          Updating booking data...
        </p>
      )}
      {bookingRangeError && !bookingRangeLoading && (
        <p className="mt-3 text-sm text-red-500">{bookingRangeError}</p>
      )}
    </div>
  );
};

export default BookingVolumeChart;

