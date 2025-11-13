import React, { useEffect, useRef, useState } from "react";
import { MdSearch, MdFilterList } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";

interface VehicleFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  isLoading?: boolean;
  page?: number;
  totalPages?: number;
  total?: number;
}

const VehicleFilters: React.FC<VehicleFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  isLoading = false,
  page = 1,
  totalPages = 1,
  total,
}) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      if (listRef.current && triggerRef.current && !listRef.current.contains(t) && !triggerRef.current.contains(t)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by license plate, brand..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="px-4 py-2 pr-10 border border-gray-300 rounded-xl bg-white text-gray-700 hover:border-blue-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/15 transition-all"
            >
              {selectedStatus === 'all'
                ? 'All Status'
                : selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${open ? 'rotate-180' : ''}`}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m6 8 4 4 4-4" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.ul
                  ref={listRef}
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 6, height: 'auto' }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="absolute z-20 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
                >
                  {['all','available','reserved','rented','maintenance','pending_deletion','pending_maintenance'].map((st) => (
                    <li
                      key={st}
                      onClick={() => { onStatusChange(st); setOpen(false); }}
                      className={`px-4 py-2 cursor-pointer select-none transition-colors ${selectedStatus === st ? 'bg-blue-600 text-white' : 'hover:bg-gray-50 text-gray-800'}`}
                    >
                      {st === 'all' ? 'All Status' : st.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
          <div className="px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg border border-gray-200">
            Page <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages}</span>
            {typeof total === 'number' && (
              <> • Total <span className="font-medium">{total}</span></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleFilters;
