// components/Stations/StationFilters.tsx
import React from "react";
import { MdSearch, MdFilterList, MdLocationCity } from "react-icons/md";
import { getProvinceNames } from "../../../../data/provinceData";
import DropdownSelect from "./DropdownSelect";

interface Filters {
  search: string;
  status: "all" | "active" | "inactive";
  province?: string;
  page: number;
  limit: number;
}

interface StationFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  totalResults: number;
}

const StationFilters: React.FC<StationFiltersProps> = ({
  filters,
  onFiltersChange,
  totalResults,
}) => {
  // ✅ Province list (chuẩn hoá để khớp so sánh)
  const provinceList = getProvinceNames().map((p) => p.trim());

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value,
      page: 1,
    });
  };

  const handleStatusChange = (status: "all" | "active" | "inactive") => {
    onFiltersChange({
      ...filters,
      status,
      page: 1,
    });
  };

  const handleProvinceChange = (value: string) => {
    onFiltersChange({
      ...filters,
      province: value === "all" ? undefined : value,
      page: 1,
    });
  };

  const handleLimitChange = (value: string) => {
    onFiltersChange({
      ...filters,
      limit: Number(value),
      page: 1,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-6 flex-wrap md:flex-nowrap">
        {/* Search */}
        <div className="flex-1 min-w-[280px] max-w-md">
          <div className="relative">
            <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by station name or code..."
              value={filters.search || ""}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/70 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <MdFilterList className="text-gray-500 w-5 h-5" />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Status:
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange("all")}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                filters.status === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusChange("active")}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                filters.status === "active"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => handleStatusChange("inactive")}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                filters.status === "inactive"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Province */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <MdLocationCity className="text-gray-500 w-5 h-5" />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Province:
            </span>
          </div>

          <DropdownSelect
            value={filters.province || "all"}
            onChange={handleProvinceChange}
            options={[
              { label: "All Provinces", value: "all" },
              ...provinceList.map((province) => ({
                label: province,
                value: province,
              })),
            ]}
            placeholder="Select province..."
            className="w-[200px]"
            leadingIcon={
              <MdLocationCity className="w-5 h-5 text-gray-400" />
            }
          />
        </div>

        {/* Per page */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <span className="text-sm text-gray-600 whitespace-nowrap mt-1 md:mt-0">
            Show
          </span>
          <DropdownSelect
            value={filters.limit.toString()}
            onChange={handleLimitChange}
            options={[10, 20, 50, 100].map((value) => ({
              label: value.toString(),
              value: value.toString(),
            }))}
            className="w-[90px]"
            compact
          />
          <span className="text-sm text-gray-600 whitespace-nowrap">
            / {totalResults}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StationFilters;
