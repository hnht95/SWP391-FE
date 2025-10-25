import React from "react";
import { motion } from "framer-motion";
import {
  MdBusiness,
  MdDirectionsCar,
  MdEdit,
  MdVisibility,
  MdWarning,
} from "react-icons/md";
import type { Contract } from "../../../types/contracts";
import { getStatusBadge, getStatusText } from "../../../utils/contractUtils";
import { formatDate } from "../../../utils/dateUtils";

interface ContractTableProps {
  contracts: Contract[];
  loading: boolean;
  onViewDetail: (contract: Contract) => void;
}

const ContractTable: React.FC<ContractTableProps> = ({
  contracts,
  loading,
  onViewDetail,
}) => {
  const tableHeaders = [
    "Company",
    "Duration",
    "Vehicles",
    "Monthly Fee",
    "Status",
    "Actions",
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {tableHeaders.map((header, index) => (
              <motion.th
                key={header}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
              >
                {header}
              </motion.th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                  <p className="text-gray-600">Loading contracts...</p>
                </div>
              </td>
            </tr>
          ) : contracts.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center">
                <MdBusiness className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No contracts found</p>
              </td>
            </tr>
          ) : (
            <>
              {contracts.map((contract, index) => (
                <motion.tr
                  key={contract.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onViewDetail(contract)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {contract.companyName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contract.companyContact}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(contract.startDate)}
                    </div>
                    <div className="text-sm text-gray-500">
                      to {formatDate(contract.endDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MdDirectionsCar className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        {contract.vehicleCount}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(contract.monthlyFee / 1000000).toFixed(0)}M VND
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        contract.status
                      )}`}
                    >
                      {getStatusText(contract.status)}
                    </span>
                    {contract.alerts.length > 0 && (
                      <MdWarning className="w-4 h-4 text-yellow-500 ml-2 inline" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetail(contract);
                        }}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                        title="View Details"
                      >
                        <MdVisibility className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Handle edit action
                        }}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                        title="Edit Contract"
                      >
                        <MdEdit className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ContractTable;
