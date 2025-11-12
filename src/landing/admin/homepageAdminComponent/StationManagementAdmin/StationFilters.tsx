import React from "react";
import { MdSearch, MdFilterList, MdLocationCity } from "react-icons/md";
import { getProvinceNames } from "../../../../data/provinceData";

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
  // ✅ Get province list
  const provinceList = getProvinceNames();

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

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      province: e.target.value === "all" ? undefined : e.target.value,
      page: 1,
    });
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      limit: Number(e.target.value),
      page: 1,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* ✅ Single Row Layout - No Wrap */}
      <div className="flex items-center gap-6 overflow-x-auto">
        {/* Search - Flexible width */}
        <div className="flex-1 min-w-[280px] max-w-md">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by station name or code..."
              value={filters.search || ""}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Status Filters - Fixed width */}
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

        {/* Province Filter - Fixed width */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <MdLocationCity className="text-gray-500 w-5 h-5" />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Province:
            </span>
          </div>

          <select
            value={filters.province || "all"}
            onChange={handleProvinceChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-[180px]"
          >
            <option value="all">All Provinces</option>
            {provinceList.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>

        {/* Per Page - Fixed width */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <span className="text-sm text-gray-600 whitespace-nowrap">Show:</span>
          <select
            value={filters.limit}
            onChange={handleLimitChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[70px]"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="text-sm text-gray-600 whitespace-nowrap">
            / {totalResults}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StationFilters;
