import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MdAdd,
  MdSearch,
  MdFilterList,
  MdWarning,
  MdCheckCircle,
  MdVisibility,
  MdEdit,
  MdDownload,
  MdNotifications,
  MdBusiness,
  MdDirectionsCar,
  MdAttachMoney,
  MdClose,
  MdFileDownload,
  MdExtension,
  MdKeyboardArrowDown,
  MdUploadFile,
  MdDelete,
  MdCalendarToday,
  MdFilePresent,
  MdSave,
  MdPreview,
} from "react-icons/md";

interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  engineNumber: string;
  chassisNumber: string;
  registrationDocument?: File;
  inspectionDocument?: File;
  images: File[];
}

// Alert type for contract alerts
interface ContractAlert {
  id: string;
  type: string;
  message: string;
  priority: "high" | "medium" | "low";
  date: string;
}

// Vehicle type for contracts (may include status, inspection dates)
interface ContractVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  status?: string;
  lastInspection?: string;
  nextInspection?: string;
}

// Main Contract type
interface Contract {
  id: string;
  companyName: string;
  companyContact: string;
  email: string;
  phone: string;
  signDate: string;
  startDate: string;
  endDate: string;
  status: string;
  vehicleCount: number;
  monthlyFee: number;
  totalValue: number;
  vehicles: ContractVehicle[];
  alerts: ContractAlert[];
}

interface ContractFormData {
  companyName: string;
  taxId: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  contractId: string;
  startDate: string;
  endDate: string;
  autoRenewal: boolean;
  monthlyFee: number;
  insurance: boolean;
  insuranceFee: number;
  additionalServices: string[];
  vehicles: Vehicle[];
  legalDocuments: File[];
  handoverDocument?: File;
  notes: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingContracts: Contract[];
}

const sampleContracts: Contract[] = [
  {
    id: "CT001",
    companyName: "ABC Transport Co.",
    companyContact: "Nguyen Van A",
    email: "contact@abctransport.com",
    phone: "0901234567",
    signDate: "2024-01-15",
    startDate: "2024-02-01",
    endDate: "2025-01-31",
    status: "active",
    vehicleCount: 15,
    monthlyFee: 25000000,
    totalValue: 300000000,
    vehicles: [
      {
        id: "V001",
        brand: "Toyota",
        model: "Camry",
        year: 2023,
        licensePlate: "29A-12345",
        status: "rented",
        lastInspection: "2024-10-15",
        nextInspection: "2025-04-15",
      },
    ],
    alerts: [],
  },
  {
    id: "CT002",
    companyName: "XYZ Logistics",
    companyContact: "Tran Thi B",
    email: "admin@xyzlogistics.com",
    phone: "0912345678",
    signDate: "2024-06-10",
    startDate: "2024-07-01",
    endDate: "2024-12-31",
    status: "expiring",
    vehicleCount: 8,
    monthlyFee: 15000000,
    totalValue: 90000000,
    vehicles: [],
    alerts: [
      {
        id: "A001",
        type: "contract_expiring",
        message: "Contract expires in 15 days",
        priority: "high",
        date: "2024-12-15",
      },
    ],
  },
  {
    id: "CT003",
    companyName: "DEF Corp",
    companyContact: "Le Van C",
    email: "info@defcorp.com",
    phone: "0923456789",
    signDate: "2023-12-01",
    startDate: "2024-01-01",
    endDate: "2024-11-30",
    status: "expired",
    vehicleCount: 5,
    monthlyFee: 10000000,
    totalValue: 110000000,
    vehicles: [],
    alerts: [
      {
        id: "A002",
        type: "payment_due",
        message: "Payment overdue by 5 days",
        priority: "high",
        date: "2024-12-01",
      },
    ],
  },
  // Thêm contract có nhiều alerts để test
  {
    id: "CT004",
    companyName: "GHI Services",
    companyContact: "Pham Van D",
    email: "contact@ghiservices.com",
    phone: "0934567890",
    signDate: "2024-08-01",
    startDate: "2024-08-15",
    endDate: "2025-01-15",
    status: "active",
    vehicleCount: 12,
    monthlyFee: 20000000,
    totalValue: 200000000,
    vehicles: [],
    alerts: [
      {
        id: "A003",
        type: "vehicle_inspection",
        message: "3 vehicles need inspection this week",
        priority: "medium",
        date: "2024-12-20",
      },
      {
        id: "A004",
        type: "contract_expiring",
        message: "Contract expires in 25 days",
        priority: "medium",
        date: "2024-12-21",
      },
    ],
  },
];

const CreateContractModal: React.FC<CreateContractModalProps> = ({
  isOpen,
  onClose,
  existingContracts,
}) => {
  // localStorage key for draft data
  const DRAFT_KEY = "contract_draft";

  // Initial form data with localStorage check
  const getInitialFormData = (): ContractFormData => {
    if (typeof window !== "undefined") {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          // Validate that the parsed data has the required structure
          if (
            parsed &&
            typeof parsed === "object" &&
            parsed.companyName !== undefined
          ) {
            return {
              ...parsed,
              // Ensure arrays exist
              vehicles: parsed.vehicles || [],
              legalDocuments: [], // Files can't be restored from localStorage
              additionalServices: parsed.additionalServices || [],
              handoverDocument: undefined, // Files can't be restored
            };
          }
        } catch (error) {
          console.error("Error parsing saved draft:", error);
          localStorage.removeItem(DRAFT_KEY);
        }
      }
    }

    return {
      companyName: "",
      taxId: "",
      address: "",
      contactPerson: "",
      phone: "",
      email: "",
      contractId: "",
      startDate: "",
      endDate: "",
      autoRenewal: false,
      monthlyFee: 0,
      insurance: false,
      insuranceFee: 0,
      additionalServices: [],
      vehicles: [],
      legalDocuments: [],
      notes: "",
    };
  };

  const [formData, setFormData] =
    useState<ContractFormData>(getInitialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showPreview, setShowPreview] = useState(false);
  const [hasDraftData, setHasDraftData] = useState(false);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);

  // Save to localStorage whenever formData changes
  const saveToLocalStorage = useCallback(
    (data: ContractFormData) => {
      try {
        // Only save meaningful data (not empty form)
        const hasContent =
          data.companyName.trim() ||
          data.taxId.trim() ||
          data.contactPerson.trim() ||
          data.vehicles.length > 0 ||
          data.monthlyFee > 0;

        if (hasContent) {
          // Create a serializable version (exclude File objects)
          const serializableData = {
            ...data,
            legalDocuments: [], // Files can't be serialized
            handoverDocument: undefined,
            vehicles: data.vehicles.map((vehicle) => ({
              ...vehicle,
              registrationDocument: undefined,
              inspectionDocument: undefined,
              images: [],
            })),
          };

          localStorage.setItem(DRAFT_KEY, JSON.stringify(serializableData));
          console.log("Draft saved to localStorage");
        }
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    },
    [DRAFT_KEY]
  );

  // Clear localStorage draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setHasDraftData(false);
      console.log("Draft cleared from localStorage");
    } catch (error) {
      console.error("Error clearing draft:", error);
    }
  }, [DRAFT_KEY]);

  // Check for existing draft on modal open
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (
            parsed &&
            (parsed.companyName || parsed.taxId || parsed.vehicles?.length > 0)
          ) {
            setHasDraftData(true);
            setShowDraftPrompt(true);
          }
        } catch (error) {
          console.error("Error checking draft:", error);
        }
      }
    }
  }, [isOpen, DRAFT_KEY]);

  // Auto-save formData changes with debounce
  useEffect(() => {
    if (isOpen) {
      const hasContent =
        formData.companyName.trim() ||
        formData.taxId.trim() ||
        formData.contactPerson.trim() ||
        formData.vehicles.length > 0 ||
        formData.monthlyFee > 0;

      if (hasContent) {
        const timeoutId = setTimeout(() => {
          saveToLocalStorage(formData);
          setHasDraftData(true);
        }, 1000); // Debounce for 1 second

        return () => clearTimeout(timeoutId);
      }
    }
  }, [formData, isOpen, saveToLocalStorage]);

  // Handle draft restoration
  const handleRestoreDraft = () => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed);
        setShowDraftPrompt(false);
        setHasDraftData(true);
      } catch (error) {
        console.error("Error restoring draft:", error);
        clearDraft();
      }
    }
  };

  // Handle discard draft
  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftPrompt(false);
    setFormData(getInitialFormData());
  };

  // Generate Contract ID
  const generateContractId = useCallback(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const contractId = `CT${year}${month}${day}${random}`;

    setFormData((prev) => ({ ...prev, contractId }));
  }, []);

  // Initialize contract ID on mount
  React.useEffect(() => {
    if (isOpen && !formData.contractId) {
      generateContractId();
    }
  }, [isOpen, formData.contractId, generateContractId]);

  // Enhanced form data setter with localStorage save
  const updateFormData = useCallback(
    (updater: (prev: ContractFormData) => ContractFormData) => {
      setFormData(updater);
    },
    []
  );

  // Validate current step only
  const validateCurrentStep = () => {
    const newErrors: ValidationErrors = {};

    switch (currentStep) {
      case 1: // Company Information
        if (!formData.companyName.trim())
          newErrors.companyName = "Company name is required";
        if (!formData.taxId.trim()) newErrors.taxId = "Tax ID is required";
        if (!formData.contactPerson.trim())
          newErrors.contactPerson = "Contact person is required";
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        break;

      case 2: // Contract Details
        if (!formData.startDate) newErrors.startDate = "Start date is required";
        if (!formData.endDate) newErrors.endDate = "End date is required";

        // Date validation
        if (formData.startDate && formData.endDate) {
          if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            newErrors.endDate = "End date must be after start date";
          }
        }
        break;

      case 3: // Vehicles
        if (formData.vehicles.length === 0)
          newErrors.vehicles = "At least one vehicle is required";

        // Vehicle validation
        formData.vehicles.forEach((vehicle, index) => {
          if (!vehicle.licensePlate.trim())
            newErrors[`vehicle_${index}_licensePlate`] =
              "License plate is required";
          if (!vehicle.brand.trim())
            newErrors[`vehicle_${index}_brand`] = "Brand is required";
          if (!vehicle.model.trim())
            newErrors[`vehicle_${index}_model`] = "Model is required";
        });
        break;

      case 4: // Documents & Review - No required validation for this step
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate form data
  const validateForm = () => {
    const newErrors: ValidationErrors = {};
    const newWarnings: string[] = [];

    // Required fields validation - ALL STEPS
    if (!formData.companyName.trim())
      newErrors.companyName = "Company name is required";
    if (!formData.taxId.trim()) newErrors.taxId = "Tax ID is required";
    if (!formData.contactPerson.trim())
      newErrors.contactPerson = "Contact person is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (formData.vehicles.length === 0)
      newErrors.vehicles = "At least one vehicle is required";

    // Date validation
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    // Vehicle validation
    formData.vehicles.forEach((vehicle, index) => {
      if (!vehicle.licensePlate.trim()) {
        newErrors[`vehicle_${index}_licensePlate`] =
          "License plate is required";
      }
      if (!vehicle.brand.trim()) {
        newErrors[`vehicle_${index}_brand`] = "Brand is required";
      }
      if (!vehicle.model.trim()) {
        newErrors[`vehicle_${index}_model`] = "Model is required";
      }
    });

    // Check for duplicate vehicles
    const existingVehicles = existingContracts.flatMap((c) =>
      c.vehicles.map((v) => v.licensePlate)
    );

    formData.vehicles.forEach((vehicle) => {
      if (existingVehicles.includes(vehicle.licensePlate)) {
        newWarnings.push(
          `Vehicle ${vehicle.licensePlate} is already in another contract`
        );
      }
    });

    // Check for overlapping contracts
    const overlapping = existingContracts.find(
      (contract) =>
        contract.companyName === formData.companyName &&
        ((new Date(formData.startDate) >= new Date(contract.startDate) &&
          new Date(formData.startDate) <= new Date(contract.endDate)) ||
          (new Date(formData.endDate) >= new Date(contract.startDate) &&
            new Date(formData.endDate) <= new Date(contract.endDate)))
    );

    if (overlapping) {
      newWarnings.push(
        `Contract period overlaps with existing contract ${overlapping.id}`
      );
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate total fee
  const calculateTotalFee = () => {
    let total = formData.monthlyFee;
    if (formData.insurance) {
      total += formData.insuranceFee;
    }
    return total;
  };

  // Add vehicle
  const addVehicle = () => {
    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      licensePlate: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      engineNumber: "",
      chassisNumber: "",
      images: [],
    };
    setFormData((prev) => ({
      ...prev,
      vehicles: [...prev.vehicles, newVehicle],
    }));
  };

  // Remove vehicle
  const removeVehicle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((v) => v.id !== id),
    }));
  };

  // Update vehicle
  const updateVehicle = (
    id: string,
    field: keyof Vehicle,
    value: string | number | File | File[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      ),
    }));
  };

  // Handle file upload
  const handleFileUpload = (
    vehicleId: string | null,
    field: string,
    files: FileList | null
  ) => {
    if (!files) return;

    if (vehicleId) {
      // Vehicle specific files
      if (field === "images") {
        updateVehicle(vehicleId, field as keyof Vehicle, Array.from(files));
      } else {
        const file = files[0];
        updateVehicle(vehicleId, field as keyof Vehicle, file);
      }
    } else {
      // Contract level files
      if (field === "legalDocuments") {
        setFormData((prev) => ({
          ...prev,
          legalDocuments: [...prev.legalDocuments, ...Array.from(files)],
        }));
      } else if (field === "handoverDocument") {
        setFormData((prev) => ({
          ...prev,
          handoverDocument: files[0],
        }));
      }
    }
  };

  // Handle form submission with draft clearing
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Process form submission
      console.log("Contract created:", formData);

      // Clear draft from localStorage after successful submission
      clearDraft();

      // Show success message (optional)
      alert("Contract created successfully!");

      // Close modal
      onClose();

      // Reset form data
      setFormData(getInitialFormData());
      setCurrentStep(1);
      setErrors({});
      setWarnings([]);
    }
  };

  // Handle modal close with draft save confirmation
  const handleClose = () => {
    const hasContent =
      formData.companyName.trim() ||
      formData.taxId.trim() ||
      formData.contactPerson.trim() ||
      formData.vehicles.length > 0 ||
      formData.monthlyFee > 0;

    if (hasContent && !hasDraftData) {
      const shouldSave = window.confirm(
        "You have unsaved changes. Do you want to save as draft before closing?"
      );
      if (shouldSave) {
        saveToLocalStorage(formData);
      }
    }

    onClose();
  };

  // Warn user before leaving if they have unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasContent =
        formData.companyName.trim() ||
        formData.taxId.trim() ||
        formData.contactPerson.trim() ||
        formData.vehicles.length > 0 ||
        formData.monthlyFee > 0;

      if (isOpen && hasContent) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    if (isOpen) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isOpen, formData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Draft Restoration Prompt */}
        {showDraftPrompt && (
          <div className="bg-blue-50 border-b border-blue-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MdSave className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-900">
                    Draft Found
                  </h3>
                  <p className="text-sm text-blue-700">
                    You have unsaved changes from a previous session. Would you
                    like to restore them?
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleRestoreDraft}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Restore
                </button>
                <button
                  onClick={handleDiscardDraft}
                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Contract
            </h2>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-sm text-gray-500">
                Contract ID: {formData.contractId}
              </p>
              {hasDraftData && (
                <div className="flex items-center space-x-1 text-xs text-green-600">
                  <MdSave className="w-3 h-3" />
                  <span>Auto-saved</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Steps Navigation */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? "bg-gray-900 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {step === 1 && "Company Info"}
                  {step === 2 && "Contract Details"}
                  {step === 3 && "Vehicles"}
                  {step === 4 && "Documents & Review"}
                </span>
                {step < 4 && <div className="w-8 h-px bg-gray-300 mx-4"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mx-6 mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <MdWarning className="w-5 h-5 text-yellow-600 mr-2" />
              <h3 className="text-sm font-medium text-yellow-800">Warnings</h3>
            </div>
            {warnings.map((warning, index) => (
              <p key={index} className="text-sm text-yellow-700 mb-1">
                • {warning}
              </p>
            ))}
          </div>
        )}

        {/* Form Content - Replace all setFormData calls with updateFormData */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MdBusiness className="w-5 h-5 mr-2" />
                    Company Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) =>
                          updateFormData((prev) => ({
                            ...prev,
                            companyName: e.target.value,
                          }))
                        }
                        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                          errors.companyName
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter company name"
                      />
                      {errors.companyName && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.companyName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tax ID (MST) *
                      </label>
                      <input
                        type="text"
                        value={formData.taxId}
                        onChange={(e) =>
                          updateFormData((prev) => ({
                            ...prev,
                            taxId: e.target.value,
                          }))
                        }
                        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                          errors.taxId ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Enter tax ID"
                      />
                      {errors.taxId && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.taxId}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Address
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) =>
                          updateFormData((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        placeholder="Enter company address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) =>
                          updateFormData((prev) => ({
                            ...prev,
                            contactPerson: e.target.value,
                          }))
                        }
                        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                          errors.contactPerson
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter contact person name"
                      />
                      {errors.contactPerson && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.contactPerson}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          updateFormData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                          errors.phone ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Enter phone number"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          updateFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                          errors.email ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Enter email address"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contract Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MdCalendarToday className="w-5 h-5 mr-2" />
                    Contract Duration
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          updateFormData((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                          errors.startDate
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.startDate && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.startDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          updateFormData((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                          errors.endDate ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      {errors.endDate && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.endDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.autoRenewal}
                        onChange={(e) =>
                          updateFormData((prev) => ({
                            ...prev,
                            autoRenewal: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Auto-renewal contract
                      </span>
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MdAttachMoney className="w-5 h-5 mr-2" />
                    Pricing & Services
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Fee (VND)
                      </label>
                      <input
                        type="number"
                        value={formData.monthlyFee}
                        onChange={(e) =>
                          updateFormData((prev) => ({
                            ...prev,
                            monthlyFee: Number(e.target.value),
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        placeholder="Enter monthly fee"
                      />
                    </div>

                    <div>
                      <label className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={formData.insurance}
                          onChange={(e) =>
                            updateFormData((prev) => ({
                              ...prev,
                              insurance: e.target.checked,
                            }))
                          }
                          className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          Additional Insurance
                        </span>
                      </label>

                      {formData.insurance && (
                        <input
                          type="number"
                          value={formData.insuranceFee}
                          onChange={(e) =>
                            updateFormData((prev) => ({
                              ...prev,
                              insuranceFee: Number(e.target.value),
                            }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          placeholder="Insurance fee per month"
                        />
                      )}
                    </div>

                    <div className="bg-white rounded-lg p-3 border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Total Monthly Fee:
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {calculateTotalFee().toLocaleString()} VND
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Vehicle Management */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <MdDirectionsCar className="w-5 h-5 mr-2" />
                      Vehicle List ({formData.vehicles.length})
                    </h3>
                    <button
                      type="button"
                      onClick={addVehicle}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
                    >
                      <MdAdd className="w-4 h-4" />
                      <span>Add Vehicle</span>
                    </button>
                  </div>

                  {errors.vehicles && (
                    <p className="text-red-500 text-sm mb-4">
                      {errors.vehicles}
                    </p>
                  )}

                  <div className="space-y-4">
                    {formData.vehicles.map((vehicle, index) => (
                      <div
                        key={vehicle.id}
                        className="bg-white rounded-lg p-4 border"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">
                            Vehicle #{index + 1}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeVehicle(vehicle.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <MdDelete className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              License Plate *
                            </label>
                            <input
                              type="text"
                              value={vehicle.licensePlate}
                              onChange={(e) =>
                                updateVehicle(
                                  vehicle.id,
                                  "licensePlate",
                                  e.target.value
                                )
                              }
                              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                                errors[`vehicle_${index}_licensePlate`]
                                  ? "border-red-300"
                                  : "border-gray-300"
                              }`}
                              placeholder="e.g., 29A-12345"
                            />
                            {errors[`vehicle_${index}_licensePlate`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors[`vehicle_${index}_licensePlate`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Brand *
                            </label>
                            <input
                              type="text"
                              value={vehicle.brand}
                              onChange={(e) =>
                                updateVehicle(
                                  vehicle.id,
                                  "brand",
                                  e.target.value
                                )
                              }
                              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                                errors[`vehicle_${index}_brand`]
                                  ? "border-red-300"
                                  : "border-gray-300"
                              }`}
                              placeholder="e.g., Toyota"
                            />
                            {errors[`vehicle_${index}_brand`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors[`vehicle_${index}_brand`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Model *
                            </label>
                            <input
                              type="text"
                              value={vehicle.model}
                              onChange={(e) =>
                                updateVehicle(
                                  vehicle.id,
                                  "model",
                                  e.target.value
                                )
                              }
                              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                                errors[`vehicle_${index}_model`]
                                  ? "border-red-300"
                                  : "border-gray-300"
                              }`}
                              placeholder="e.g., Camry"
                            />
                            {errors[`vehicle_${index}_model`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors[`vehicle_${index}_model`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Year
                            </label>
                            <input
                              type="number"
                              value={vehicle.year}
                              onChange={(e) =>
                                updateVehicle(
                                  vehicle.id,
                                  "year",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                              min="1900"
                              max={new Date().getFullYear() + 1}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Engine Number
                            </label>
                            <input
                              type="text"
                              value={vehicle.engineNumber}
                              onChange={(e) =>
                                updateVehicle(
                                  vehicle.id,
                                  "engineNumber",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                              placeholder="Enter engine number"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Chassis Number
                            </label>
                            <input
                              type="text"
                              value={vehicle.chassisNumber}
                              onChange={(e) =>
                                updateVehicle(
                                  vehicle.id,
                                  "chassisNumber",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                              placeholder="Enter chassis number"
                            />
                          </div>
                        </div>

                        {/* Vehicle Documents */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="text-sm font-medium text-gray-700 mb-3">
                            Vehicle Documents
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Registration Document
                              </label>
                              <div className="border border-dashed border-gray-300 rounded-lg p-3">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) =>
                                    handleFileUpload(
                                      vehicle.id,
                                      "registrationDocument",
                                      e.target.files
                                    )
                                  }
                                  className="hidden"
                                  id={`reg-${vehicle.id}`}
                                />
                                <label
                                  htmlFor={`reg-${vehicle.id}`}
                                  className="flex items-center justify-center cursor-pointer text-gray-600 hover:text-gray-800"
                                >
                                  <MdUploadFile className="w-5 h-5 mr-2" />
                                  <span className="text-sm">
                                    Upload Registration
                                  </span>
                                </label>
                                {vehicle.registrationDocument && (
                                  <p className="text-xs text-green-600 mt-1">
                                    ✓ {vehicle.registrationDocument.name}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Inspection Document
                              </label>
                              <div className="border border-dashed border-gray-300 rounded-lg p-3">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) =>
                                    handleFileUpload(
                                      vehicle.id,
                                      "inspectionDocument",
                                      e.target.files
                                    )
                                  }
                                  className="hidden"
                                  id={`insp-${vehicle.id}`}
                                />
                                <label
                                  htmlFor={`insp-${vehicle.id}`}
                                  className="flex items-center justify-center cursor-pointer text-gray-600 hover:text-gray-800"
                                >
                                  <MdUploadFile className="w-5 h-5 mr-2" />
                                  <span className="text-sm">
                                    Upload Inspection
                                  </span>
                                </label>
                                {vehicle.inspectionDocument && (
                                  <p className="text-xs text-green-600 mt-1">
                                    ✓ {vehicle.inspectionDocument.name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Vehicle Images
                            </label>
                            <div className="border border-dashed border-gray-300 rounded-lg p-3">
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                multiple
                                onChange={(e) =>
                                  handleFileUpload(
                                    vehicle.id,
                                    "images",
                                    e.target.files
                                  )
                                }
                                className="hidden"
                                id={`images-${vehicle.id}`}
                              />
                              <label
                                htmlFor={`images-${vehicle.id}`}
                                className="flex items-center justify-center cursor-pointer text-gray-600 hover:text-gray-800"
                              >
                                <MdUploadFile className="w-5 h-5 mr-2" />
                                <span className="text-sm">
                                  Upload Vehicle Images
                                </span>
                              </label>
                              {vehicle.images.length > 0 && (
                                <p className="text-xs text-green-600 mt-1">
                                  ✓ {vehicle.images.length} image(s) uploaded
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {formData.vehicles.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MdDirectionsCar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>
                          No vehicles added yet. Click "Add Vehicle" to get
                          started.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Documents & Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MdFilePresent className="w-5 h-5 mr-2" />
                    Legal Documents
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Legal Documents
                      </label>
                      <div className="border border-dashed border-gray-300 rounded-lg p-4">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          multiple
                          onChange={(e) =>
                            handleFileUpload(
                              null,
                              "legalDocuments",
                              e.target.files
                            )
                          }
                          className="hidden"
                          id="legal-docs"
                        />
                        <label
                          htmlFor="legal-docs"
                          className="flex flex-col items-center justify-center cursor-pointer text-gray-600 hover:text-gray-800"
                        >
                          <MdUploadFile className="w-8 h-8 mb-2" />
                          <span className="text-sm">
                            Upload Legal Documents
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            Business License, Tax Certificate, etc.
                          </span>
                        </label>
                        {formData.legalDocuments.length > 0 && (
                          <div className="mt-3">
                            {formData.legalDocuments.map((doc, index) => (
                              <p key={index} className="text-xs text-green-600">
                                ✓ {doc.name}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Handover Document
                      </label>
                      <div className="border border-dashed border-gray-300 rounded-lg p-4">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            handleFileUpload(
                              null,
                              "handoverDocument",
                              e.target.files
                            )
                          }
                          className="hidden"
                          id="handover-doc"
                        />
                        <label
                          htmlFor="handover-doc"
                          className="flex flex-col items-center justify-center cursor-pointer text-gray-600 hover:text-gray-800"
                        >
                          <MdUploadFile className="w-8 h-8 mb-2" />
                          <span className="text-sm">
                            Upload Handover Document
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            Vehicle condition report
                          </span>
                        </label>
                        {formData.handoverDocument && (
                          <p className="text-xs text-green-600 mt-2">
                            ✓ {formData.handoverDocument.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Notes & Comments
                  </h3>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      updateFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    rows={4}
                    placeholder="Additional notes or special conditions..."
                  />
                </div>

                {/* Contract Summary */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Contract Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p>
                        <strong>Company:</strong> {formData.companyName}
                      </p>
                      <p>
                        <strong>Contact:</strong> {formData.contactPerson}
                      </p>
                      <p>
                        <strong>Duration:</strong> {formData.startDate} to{" "}
                        {formData.endDate}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Vehicles:</strong> {formData.vehicles.length}
                      </p>
                      <p>
                        <strong>Monthly Fee:</strong>{" "}
                        {calculateTotalFee().toLocaleString()} VND
                      </p>
                      <p>
                        <strong>Insurance:</strong>{" "}
                        {formData.insurance ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer with clear draft option */}
        <div className="p-6 border-t border-gray-100 flex justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {hasDraftData && (
              <button
                type="button"
                onClick={() => {
                  if (
                    confirm("Are you sure you want to clear the saved draft?")
                  ) {
                    clearDraft();
                    setFormData(getInitialFormData());
                    setCurrentStep(1);
                  }
                }}
                className="px-3 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
              >
                Clear Draft
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            {currentStep === 4 && (
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <MdPreview className="w-4 h-4" />
                <span>Preview PDF</span>
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (validateCurrentStep()) {
                    setCurrentStep(currentStep + 1);
                    setErrors({});
                  }
                }}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <MdSave className="w-4 h-4" />
                <span>Create Contract</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ContractStaff = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [contracts, setContracts] = useState<Contract[]>(sampleContracts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Stats calculation
  const stats = {
    total: contracts.length,
    active: contracts.filter((c) => c.status === "active").length,
    expiring: contracts.filter((c) => c.status === "expiring").length,
    expired: contracts.filter((c) => c.status === "expired").length,
    totalVehicles: contracts.reduce((sum, c) => sum + c.vehicleCount, 0),
    monthlyRevenue: contracts
      .filter((c) => c.status === "active")
      .reduce((sum, c) => sum + c.monthlyFee, 0),
  };

  // Get all alerts
  const allAlerts = contracts.flatMap((contract) =>
    contract.alerts.map((alert) => ({
      ...alert,
      contractId: contract.id,
      companyName: contract.companyName,
    }))
  );

  // Sort alerts by priority and date
  const sortedAlerts = allAlerts.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Filtered contracts
  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.companyContact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || contract.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expiring":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "expiring":
        return "Expiring Soon";
      case "expired":
        return "Expired";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "contract_expiring":
        return <MdWarning className="w-4 h-4" />;
      case "vehicle_inspection":
        return <MdDirectionsCar className="w-4 h-4" />;
      case "payment_due":
        return <MdAttachMoney className="w-4 h-4" />;
      default:
        return <MdNotifications className="w-4 h-4" />;
    }
  };

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
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Contract Management
            </h1>
            <p className="text-gray-600">
              Manage business contracts and vehicle consignments
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Notification Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative bg-white border border-gray-300 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <MdNotifications className="w-5 h-5" />
                <span>Notifications</span>
                {allAlerts.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[1.5rem] h-6 flex items-center justify-center">
                    {allAlerts.length}
                  </span>
                )}
                <MdKeyboardArrowDown
                  className={`w-4 h-4 transition-transform ${
                    showNotifications ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Notifications
                      </h3>
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        {allAlerts.length} alerts
                      </span>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {sortedAlerts.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {sortedAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className={`p-4 hover:bg-gray-50 transition-colors ${getPriorityColor(
                              alert.priority
                            )}`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                {getAlertIcon(alert.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {alert.companyName}
                                  </p>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      alert.priority === "high"
                                        ? "bg-red-100 text-red-800"
                                        : alert.priority === "medium"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {alert.priority}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mb-1">
                                  {alert.message}
                                </p>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-gray-500">
                                    Contract: {alert.contractId}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {alert.date}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <MdNotifications className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No notifications
                        </h3>
                        <p className="text-gray-500">
                          All contracts are up to date
                        </p>
                      </div>
                    )}
                  </div>

                  {sortedAlerts.length > 0 && (
                    <div className="p-4 border-t border-gray-100">
                      <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                        View All Notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2"
            >
              <MdAdd className="w-5 h-5" />
              <span>New Contract</span>
            </button>
            <button className="bg-white border border-gray-300 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <MdDownload className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MdBusiness className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.total}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-2">Total Contracts</h3>
          <p className="text-xs text-gray-500">All business contracts</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MdCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.active}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-2">Active Contracts</h3>
          <p className="text-xs text-gray-500">Currently active</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <MdWarning className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.expiring}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-2">Expiring Soon</h3>
          <p className="text-xs text-gray-500">Need renewal</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MdAttachMoney className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              {(stats.monthlyRevenue / 1000000).toFixed(0)}M
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-2">Monthly Revenue</h3>
          <p className="text-xs text-gray-500">VND from active contracts</p>
        </div>
      </div>

      {/* Contract List - Rest of the component remains the same */}
      <div className="bg-white rounded-xl border border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <h3 className="text-lg font-semibold text-gray-900">
              Contract List
            </h3>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <MdFilterList className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
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
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contract
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContracts.map((contract) => (
                <tr
                  key={contract.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => openDetail(contract)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {contract.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        Signed: {contract.signDate}
                      </div>
                    </div>
                  </td>
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
                      {contract.startDate}
                    </div>
                    <div className="text-sm text-gray-500">
                      to {contract.endDate}
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
                          openDetail(contract);
                        }}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <MdVisibility className="w-5 h-5" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 transition-colors">
                        <MdEdit className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredContracts.length === 0 && (
          <div className="text-center py-12">
            <MdBusiness className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No contracts found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Contract Detail Modal - Rest remains the same */}
      {isDetailOpen && selectedContract && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Contract Details - {selectedContract.id}
              </h2>
              <button
                onClick={closeDetail}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Company Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Company Name
                    </label>
                    <p className="text-gray-900">
                      {selectedContract.companyName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Contact Person
                    </label>
                    <p className="text-gray-900">
                      {selectedContract.companyContact}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <p className="text-gray-900">{selectedContract.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Phone
                    </label>
                    <p className="text-gray-900">{selectedContract.phone}</p>
                  </div>
                </div>
              </div>

              {/* Contract Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Contract Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Start Date
                    </label>
                    <p className="text-gray-900">
                      {selectedContract.startDate}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      End Date
                    </label>
                    <p className="text-gray-900">{selectedContract.endDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Status
                    </label>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        selectedContract.status
                      )}`}
                    >
                      {getStatusText(selectedContract.status)}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Vehicle Count
                    </label>
                    <p className="text-gray-900">
                      {selectedContract.vehicleCount}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Monthly Fee
                    </label>
                    <p className="text-gray-900">
                      {selectedContract.monthlyFee.toLocaleString()} VND
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Total Value
                    </label>
                    <p className="text-gray-900">
                      {selectedContract.totalValue.toLocaleString()} VND
                    </p>
                  </div>
                </div>
              </div>

              {/* Vehicles List */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Vehicle List
                </h3>
                {selectedContract.vehicles.length > 0 ? (
                  <div className="space-y-3">
                    {selectedContract.vehicles.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="bg-white rounded-lg p-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                          </div>
                          <div className="text-sm text-gray-500">
                            License: {vehicle.licensePlate}
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              vehicle.status === "available"
                                ? "bg-green-100 text-green-800"
                                : vehicle.status === "rented"
                                ? "bg-blue-100 text-blue-800"
                                : vehicle.status === "maintenance"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {vehicle.status}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            Next inspection: {vehicle.nextInspection}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No vehicles listed</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <MdExtension className="w-4 h-4" />
                    <span>Extend Contract</span>
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                    <MdEdit className="w-4 h-4" />
                    <span>Update Status</span>
                  </button>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
                    <MdFileDownload className="w-4 h-4" />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                onClick={closeDetail}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Contract Modal */}
      {isCreateOpen && (
        <CreateContractModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          existingContracts={contracts}
        />
      )}
    </div>
  );
};

export default ContractStaff;
