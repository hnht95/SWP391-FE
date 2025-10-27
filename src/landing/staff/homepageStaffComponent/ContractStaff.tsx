import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MdAdd } from "react-icons/md";
import staffAPI from "../../../service/apiStaff/API";
import type {
  Contract,
  RawApiContract,
  ContractsListResponse,
} from "../../../types/contracts";
import {
  ContractStatsCards,
  CreateContractModal,
  ContractDetailModal,
  ContractTable,
  ContractFilters,
  calculateContractStats,
} from "../contractComponent";

const ContractStaff = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
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

  // Calculate stats from contracts
  const stats = calculateContractStats(contracts);

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
    const matchesStatus =
      selectedStatus === "all" || contract.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Contract Management
              </h1>
              <p className="text-gray-600">
                Manage and monitor all company vehicle rental contracts
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <motion.button
                onClick={() => setIsCreateOpen(true)}
                className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MdAdd className="w-5 h-5" />
                <span>New Contract</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <ContractStatsCards stats={stats} />

        {/* Contract List */}
        <motion.div
          className="bg-white rounded-xl border border-gray-100 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <ContractFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />

          <ContractTable
            contracts={filteredContracts}
            loading={loading}
            onViewDetail={openDetail}
          />
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
    </div>
  );
};

export default ContractStaff;
