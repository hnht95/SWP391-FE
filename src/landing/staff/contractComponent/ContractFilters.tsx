import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdSearch, MdFilterList } from "react-icons/md";

interface ContractFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

const ContractFilters: React.FC<ContractFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  showFilters,
  onToggleFilters,
}) => {
  return (
    <div className="p-6 border-b border-gray-100">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <h3 className="text-lg font-semibold text-gray-900">Contract List</h3>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>

          <motion.button
            onClick={onToggleFilters}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MdFilterList className="w-5 h-5" />
            <span>Filters</span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="mt-4 pt-4 border-t border-gray-100"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContractFilters;
