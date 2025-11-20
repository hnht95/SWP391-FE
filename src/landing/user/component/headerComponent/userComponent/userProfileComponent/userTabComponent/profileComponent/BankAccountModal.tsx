import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  Building2,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { createPortal } from "react-dom";
import type { BankInfo } from "../../../../../../../../service/apiUser/profile/API";
import profileApi from "../../../../../../../../service/apiUser/profile/API";

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBankInfo?: BankInfo | null;
  onSuccess?: () => void;
}

const BankAccountModal = ({
  isOpen,
  onClose,
  currentBankInfo,
  onSuccess,
}: BankAccountModalProps) => {
  const [formData, setFormData] = useState({
    accountNumber: "",
    accountName: "",
    bankCode: "",
    bankName: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const banks = profileApi.getVietnameseBanks();

  // Reset form when bank info changes
  useEffect(() => {
    if (currentBankInfo) {
      setFormData({
        accountNumber: currentBankInfo.accountNumber || "",
        accountName: currentBankInfo.accountName || "",
        bankCode: currentBankInfo.bankCode || "",
        bankName: currentBankInfo.bankName || "",
      });
    } else {
      setFormData({
        accountNumber: "",
        accountName: "",
        bankCode: "",
        bankName: "",
      });
    }
  }, [currentBankInfo, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // If bank code changes, update bank name
    if (name === "bankCode") {
      const selectedBank = banks.find((bank) => bank.code === value);
      setFormData((prev) => ({
        ...prev,
        bankCode: value,
        bankName: selectedBank?.name || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate
      if (!formData.accountNumber.trim()) {
        throw new Error("Account number is required");
      }
      if (!formData.accountName.trim()) {
        throw new Error("Account name is required");
      }
      if (!formData.bankCode) {
        throw new Error("Please select a bank");
      }

      console.log("💳 Updating bank info:", formData);

      // Call API
      await profileApi.updateBankInfo({
        accountNumber: formData.accountNumber.trim(),
        accountName: formData.accountName.trim().toUpperCase(),
        bankCode: formData.bankCode,
        bankName: formData.bankName,
      });

      console.log("✅ Bank info updated successfully");

      setSuccess(true);

      // Call success callback after delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("❌ Update bank info failed:", err);
      setError(err.message || "Failed to update bank information");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 px-8 py-6 flex items-center justify-between">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative flex items-center space-x-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                  >
                    <CreditCard className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {currentBankInfo ? "Update" : "Add"} Bank Account
                    </h2>
                    <p className="text-sm text-gray-200">
                      For refunds and withdrawals
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="relative w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors backdrop-blur-sm disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8">
                {/* Success Message */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-green-800">
                        Bank information updated successfully!
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Bank Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bank <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select
                      name="bankCode"
                      value={formData.bankCode}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none"
                    >
                      <option value="">Select your bank</option>
                      {banks.map((bank) => (
                        <option key={bank.code} value={bank.code}>
                          {bank.name} ({bank.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Account Number */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      placeholder="Enter account number"
                      disabled={isSubmitting}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Account Name */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleChange}
                      placeholder="NGUYEN VAN A"
                      disabled={isSubmitting}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed uppercase"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter exactly as shown on your bank account
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex space-x-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting || success}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <span>Save Bank Account</span>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(
    modalContent,
    document.getElementById("modal-root") || document.body
  );
};

export default BankAccountModal;
