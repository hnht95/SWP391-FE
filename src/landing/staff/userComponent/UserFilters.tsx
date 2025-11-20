import React from "react";
import { MdSearch } from "react-icons/md";

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
      <h3 className="text-lg font-semibold text-gray-900">User List</h3>

      <div className="relative">
        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by name, email, phone number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-96 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

export default UserFilters;
