import React from "react";
import { motion } from "framer-motion";
import { MdPerson, MdVisibility } from "react-icons/md";
import type { User } from "../../../types/userTypes";
import { formatDate } from "../../../utils/dateUtils";
import {
  getStatusBadge,
  getTypeBadge,
  getTypeText,
} from "../../../utils/userUtils";

interface UserTableProps {
  users: User[];
  loading: boolean;
  onViewDetail: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  onViewDetail,
}) => {
  const tableHeaders = [
    "User",
    "Contact",
    "Type",
    "Created At",
    "Status",
    "Rentals",
    "Action",
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {tableHeaders.map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-500">
                Loading users...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-12">
                <MdPerson className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No users found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </td>
            </tr>
          ) : (
            <>
              {users.map((user, index) => (
                <motion.tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onViewDetail(user)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: "#f9fafb" }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <MdPerson className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(
                        user.type
                      )}`}
                    >
                      {getTypeText(user.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {user.createdAt ? formatDate(user.createdAt) : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        user.status
                      )}`}
                    >
                      {user.status === "active" && "Active"}
                      {user.status === "locked" && "Locked"}
                      {user.status === "verify" && "Need Verify"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {user.rentalCount ?? "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail(user);
                      }}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <MdVisibility className="w-5 h-5" />
                    </motion.button>
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

export default UserTable;
