import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdWarning, MdDelete } from "react-icons/md";
import type { Vehicle } from "../../../../../service/apiAdmin/apiVehicles/API";
import type { CreateDeletionRequest } from "../../../../../types/vehicle";
import { createDeletionRequest } from "../../../../../service/apiAdmin/apiVehicles/API";

interface RequestDeletionModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RequestDeletionModal: React.FC<RequestDeletionModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateDeletionRequest>({
    reason: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        reason: "",
      });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    setIsLoading(true);
    setError(null);

    try {
      await createDeletionRequest(vehicle._id, formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deletion request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!vehicle) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40" onClick={onClose} />
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <MdWarning className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Request Vehicle Deletion
                    </h2>
                    <p className="text-sm text-gray-500">
                      {vehicle.brand} {vehicle.model} - {vehicle.plateNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MdClose className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Warning */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <MdWarning className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Warning</h3>
                      <p className="text-sm text-red-700 mt-1">
                        This action will request the permanent deletion of this vehicle. 
                        This action cannot be undone and requires admin approval.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MdDelete className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Vehicle Information</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">VIN:</span> {vehicle.vin}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Status:</span> {vehicle.status}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Location:</span> {vehicle.stationData?.name || "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Deletion Reason */}
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Deletion *
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="Please provide a detailed reason for requesting vehicle deletion..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This reason will be reviewed by administrators before approval.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !formData.reason.trim()}
                    className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-white bg-red-600 border border-transparent rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Requesting...</span>
                      </>
                    ) : (
                      <>
                        <MdDelete className="w-4 h-4" />
                        <span>Request Deletion</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RequestDeletionModal;
