import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MdFileDownload,
  MdLocationOn,
  MdSearch,
  MdFilterList,
  MdViewModule,
  MdViewList,
  MdPerson,
  MdDirectionsCar,
  MdCalendarToday,
  MdWarning,
  MdCheckCircle,
} from "react-icons/md";
import staffAPI from "../../../service/apiStaff/API";
import type {
  Contract,
  RawApiContract,
  ContractsListResponse,
} from "../../../types/contracts";
import { CreateContractModal, ContractDetailModal } from "../contractComponent";
import { formatDate } from "../../../utils/dateUtils";
import CustomSelect from "../../../components/CustomSelect";

const ContractStaff = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStation, setSelectedStation] = useState("downtown");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [loading, setLoading] = useState(false);

  // Fetch contracts from API
  const fetchContracts = async () => {
    try {
      setLoading(true);
      const params: { status?: string; company?: string } = {};
      if (selectedStatus !== "all") {
        params.status = selectedStatus;
      }
      const response = (await staffAPI.getContracts(params)) as
        | ContractsListResponse
        | unknown;
      const payload = response as unknown;
      const isObj = (v: unknown): v is Record<string, unknown> =>
        typeof v === "object" && v !== null;

      let list: RawApiContract[] = [];
      if (Array.isArray(payload)) {
        list = payload as RawApiContract[];
      } else if (isObj(payload)) {
        const dataVal = payload["data"] as unknown;
        const itemsVal = payload["items"] as unknown;
        if (Array.isArray(dataVal)) list = dataVal as RawApiContract[];
        else if (
          isObj(dataVal) &&
          Array.isArray((dataVal as Record<string, unknown>)["items"])
        ) {
          list = (dataVal as { items: RawApiContract[] }).items;
        } else if (Array.isArray(itemsVal)) list = itemsVal as RawApiContract[];
      }

      const mappedContracts: Contract[] = list.map((apiContract) => {
        // Handle company field - can be string or object
        const companyName =
          typeof apiContract.company === "string"
            ? apiContract.company
            : typeof apiContract.company === "object" &&
              apiContract.company !== null
            ? apiContract.company.name || ""
            : "";

        return {
          id: apiContract._id,
          companyName,
          companyContact: apiContract.contactPerson || "",
          email: apiContract.email || "",
          phone: apiContract.phone || "",
          signDate: apiContract.createdAt || "",
          startDate: apiContract.startDate || "",
          endDate: apiContract.endDate || "",
          status: apiContract.status || "active",
          vehicleCount: (apiContract.vehicles || []).length,
          monthlyFee: apiContract.monthlyFee || 0,
          totalValue: apiContract.monthlyFee || 0,
          vehicles: [],
          alerts: [],
        };
      });

      setContracts(mappedContracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch contracts on mount and when filters change
  useEffect(() => {
    fetchContracts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus]);

  // Count by status/issues
  const statusCounts = {
    all: contracts.length,
    noIssues: contracts.filter((c) => c.alerts.length === 0).length,
    vehicleDamage: contracts.filter((c) =>
      c.alerts.some((a) => a.message?.toLowerCase().includes("damage"))
    ).length,
    penalty: contracts.filter((c) =>
      c.alerts.some((a) => a.message?.toLowerCase().includes("penalty"))
    ).length,
  };

  // Filter contracts based on search and status
  const filteredContracts = contracts.filter((contract) => {
    if (!contract || typeof contract !== "object") return false;

    const companyName =
      typeof contract.companyName === "string" ? contract.companyName : "";
    const contractId = typeof contract.id === "string" ? contract.id : "";
    const companyContact =
      typeof contract.companyContact === "string"
        ? contract.companyContact
        : "";

    const matchesSearch =
      companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companyContact.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (selectedStatus === "noIssues") {
      matchesStatus = contract.alerts.length === 0;
    } else if (selectedStatus === "vehicleDamage") {
      matchesStatus = contract.alerts.some((a) =>
        a.message?.toLowerCase().includes("damage")
      );
    } else if (selectedStatus === "penalty") {
      matchesStatus = contract.alerts.some((a) =>
        a.message?.toLowerCase().includes("penalty")
      );
    }

    return matchesSearch && matchesStatus;
  });

  // Get status badge
  const getStatusBadge = (contract: Contract) => {
    if (contract.alerts.length === 0) {
      return {
        color: "bg-green-100 text-green-800",
        label: "No Issues",
        icon: MdCheckCircle,
      };
    }
    if (
      contract.alerts.some((a) => a.message?.toLowerCase().includes("damage"))
    ) {
      return {
        color: "bg-orange-100 text-orange-800",
        label: "Vehicle Damage",
        icon: MdWarning,
      };
    }
    if (
      contract.alerts.some((a) => a.message?.toLowerCase().includes("penalty"))
    ) {
      return {
        color: "bg-red-100 text-red-800",
        label: "Penalty Applied",
        icon: MdWarning,
      };
    }
    return {
      color: "bg-blue-100 text-blue-800",
      label: "Active",
      icon: MdCheckCircle,
    };
  };

  // Modal handlers
  const openDetail = (contract: Contract) => {
    setSelectedContract(contract);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedContract(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Customer Contracts
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage and track customer rental contracts and issues
            </p>
          </div>

          <motion.button
            onClick={() => {
              // TODO: Export functionality
              console.log("Export contracts");
            }}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MdFileDownload className="w-5 h-5" />
            <span>Export Contracts</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Station Selector */}
      <motion.div
        className="mb-6 bg-white rounded-lg shadow-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-4">
          <MdLocationOn className="w-5 h-5 text-gray-400" />
          <label className="text-sm text-gray-600">Select Station:</label>
          <CustomSelect
            value={selectedStation}
            onChange={(val) => setSelectedStation(String(val))}
            options={[
              { value: "downtown", label: "Downtown Station" },
              { value: "suburb", label: "Suburb Station" },
              { value: "airport", label: "Airport Station" },
            ]}
            className="w-48"
          />
          <span className="text-sm text-gray-500">
            Showing contracts from Downtown Station
          </span>
        </div>
      </motion.div>

      {/* Status Tabs */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex flex-wrap items-center gap-2 px-4 py-4 border-b">
            {[
              { value: "all", label: "All", count: statusCounts.all },
              {
                value: "noIssues",
                label: "No Issues",
                count: statusCounts.noIssues,
              },
              {
                value: "vehicleDamage",
                label: "Vehicle Damage",
                count: statusCounts.vehicleDamage,
              },
              {
                value: "penalty",
                label: "Penalty",
                count: statusCounts.penalty,
              },
            ].map((tab, idx) => (
              <motion.button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={`px-4 py-2 text-sm font-medium transition-all relative ${
                  selectedStatus === tab.value
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab.label} <span className="ml-1">{tab.count}</span>
                {selectedStatus === tab.value && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
                    layoutId="activeTab"
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Search and View Toggle */}
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1 md:w-80">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MdFilterList className="w-5 h-5" />
                  <span>Filters</span>
                </motion.button>

                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <motion.button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${
                      viewMode === "grid"
                        ? "bg-white text-gray-900 shadow"
                        : "text-gray-500"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MdViewModule className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${
                      viewMode === "list"
                        ? "bg-white text-gray-900 shadow"
                        : "text-gray-500"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MdViewList className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contracts Display */}
      <motion.div
        className="bg-white rounded-lg shadow-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading contracts...</p>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No contracts found</p>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContracts.map((contract, index) => {
              const statusBadge = getStatusBadge(contract);
              const StatusIcon = statusBadge.icon;

              return (
                <motion.div
                  key={contract.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white"
                  onClick={() => openDetail(contract)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  {/* Contract Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Contract ID</p>
                      <h3 className="font-semibold text-gray-900">
                        {contract.id?.substring(0, 12)}...
                      </h3>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-3">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <MdPerson className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-xs text-gray-500">Customer:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {contract.companyContact}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MdDirectionsCar className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-xs text-gray-500">Vehicle:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {contract.vehicleCount > 0
                          ? `${contract.vehicleCount} vehicle(s)`
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div>
                      <span className="text-gray-500">Start Date</span>
                      <div className="flex items-center mt-1">
                        <MdCalendarToday className="w-3 h-3 mr-1 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {formatDate(contract.startDate)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">End Date</span>
                      <div className="flex items-center mt-1">
                        <MdCalendarToday className="w-3 h-3 mr-1 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {formatDate(contract.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div>
                      <span className="text-gray-500">Total Amount</span>
                      <p className="font-semibold text-gray-900 mt-1">
                        ${contract.monthlyFee.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Penalty</span>
                      <p
                        className={`font-semibold mt-1 ${
                          contract.alerts.some((a) =>
                            a.message?.toLowerCase().includes("penalty")
                          )
                            ? "text-red-600"
                            : "text-gray-900"
                        }`}
                      >
                        {contract.alerts.some((a) =>
                          a.message?.toLowerCase().includes("penalty")
                        )
                          ? "$500"
                          : "$0"}
                      </p>
                    </div>
                  </div>

                  {/* Issue Details */}
                  {contract.alerts.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                      <div className="flex items-start">
                        <MdWarning className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="text-xs">
                          <p className="font-semibold text-red-800 mb-1">
                            Issue Details:
                          </p>
                          <p className="text-red-700">
                            {contract.alerts[0].message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Station */}
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <MdLocationOn className="w-3 h-3 mr-1" />
                    <span>Station: Downtown Station</span>
                  </div>

                  {/* View Details Button */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetail(contract);
                    }}
                    className="w-full py-2 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Details
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {[
                    "Contract ID",
                    "Customer",
                    "Vehicle",
                    "Duration",
                    "Amount",
                    "Status",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContracts.map((contract) => {
                  const statusBadge = getStatusBadge(contract);
                  const StatusIcon = statusBadge.icon;

                  return (
                    <tr
                      key={contract.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => openDetail(contract)}
                    >
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {contract.id?.substring(0, 12)}...
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {contract.companyContact}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {contract.vehicleCount} vehicle(s)
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {formatDate(contract.startDate)} -{" "}
                        {formatDate(contract.endDate)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        ${contract.monthlyFee.toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusBadge.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(contract);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <ContractDetailModal
        contract={selectedContract}
        isOpen={isDetailOpen}
        onClose={closeDetail}
      />

      <CreateContractModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        existingContracts={contracts}
      />
    </div>
  );
};

export default ContractStaff;
