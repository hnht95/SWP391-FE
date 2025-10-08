import React from 'react';
import { MdSearch, MdFilterList } from 'react-icons/md';
import type { StationFilters as Filters } from './types';

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
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value,
      page: 1, // Reset to first page on search
    });
  };

  const handleStatusChange = (status: 'all' | 'active' | 'inactive') => {
    onFiltersChange({
      ...filters,
      status,
      page: 1, // Reset to first page on filter
    });
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      limit: Number(e.target.value),
      page: 1, // Reset to first page on limit change
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by station name or code..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MdFilterList className="text-gray-500 w-5 h-5" />
            <span className="text-sm font-medium text-gray-700">Status:</span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filters.status === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusChange('active')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filters.status === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => handleStatusChange('inactive')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filters.status === 'inactive'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show:</span>
          <select
            value={filters.limit}
            onChange={handleLimitChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="text-sm text-gray-600">/ {totalResults}</span>
        </div>
      </div>
    </div>
  );
};

export default StationFilters;

