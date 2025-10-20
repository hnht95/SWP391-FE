import React from 'react';
import { motion } from 'framer-motion';
import { MdLocationOn, MdEdit, MdDelete } from 'react-icons/md';
import type { Station } from './types';

interface StationTableProps {
  stations: Station[];
  onEdit?: (station: Station) => void;
  onDelete?: (station: Station) => void;
  loading?: boolean;
}

const StationTable: React.FC<StationTableProps> = ({
  stations,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const isValid = !isNaN(date.getTime());
    if (!isValid) return '-';
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <motion.div 
        className="bg-white rounded-lg shadow-sm border border-gray-200"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-center justify-center h-64 gap-5">
          <div className="relative">
            {/* Outer ring - slow rotation */}
            <motion.div 
              className="rounded-full h-16 w-16 border border-gray-200"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            {/* Middle ring - medium rotation */}
            <motion.div 
              className="absolute inset-0 rounded-full h-16 w-16 border-t border-blue-400"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            {/* Inner ring - fast rotation */}
            <motion.div 
              className="absolute inset-2 rounded-full h-12 w-12 border-t border-r border-blue-500"
              animate={{ rotate: -360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            {/* Center dot */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            </motion.div>
          </div>
          <motion.p 
            className="text-xs text-gray-400 font-light tracking-wider uppercase"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Loading stations
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (stations.length === 0) {
    return (
      <motion.div 
        className="bg-white rounded-lg shadow-sm border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex flex-col items-center justify-center h-64">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <MdLocationOn className="w-16 h-16 text-gray-300 mb-4" />
          </motion.div>
          <motion.p 
            className="text-gray-500 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            No stations found
          </motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Station Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Station Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Note
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created Date
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stations.map((station, index) => (
              <motion.tr
                key={station.id}
                className="hover:bg-gray-50 transition-colors"
                initial={{ 
                  opacity: 0, 
                  y: 10,
                  filter: "blur(3px)"
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  filter: "blur(0px)"
                }}
                transition={{ 
                  delay: index * 0.04,
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">
                    {station.code}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MdLocationOn className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {station.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs">
                    {station.location?.address || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-xs truncate">
                    {station.note || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {station.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(station.createdAt)}
                </td>
              <td className="px-6 py-4 whitespace-nowrap text-center relative">
                  <div className="flex items-center justify-center gap-2 pointer-events-auto relative z-10">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onEdit(station);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors relative z-10"
                        title="Edit"
                        aria-label="Edit station"
                      >
                        <MdEdit className="w-5 h-5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDelete(station);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors relative z-10"
                        title="Delete"
                        aria-label="Delete station"
                      >
                        <MdDelete className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StationTable;

