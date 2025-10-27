import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdSwapHoriz, MdLocationOn } from "react-icons/md";
import type { Vehicle } from "../../../../../service/apiAdmin/apiVehicles/API";
import { getStationId } from "../../../../../service/apiAdmin/apiVehicles/API";
import type { Station, TransferVehicleRequest } from "../../../../../types/vehicle";
import { transferVehicleStation } from "../../../../../service/apiAdmin/apiVehicles/API";

interface TransferVehicleModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  stations?: Station[];
}

const TransferVehicleModal: React.FC<TransferVehicleModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onSuccess,
  stations = [],
}) => {
  const [formData, setFormData] = useState<TransferVehicleRequest>({
    toStationId: "",
    reason: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        toStationId: "",
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
      await transferVehicleStation(vehicle._id, formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to transfer vehicle");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MdSwapHoriz className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Transfer Vehicle
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
                {/* Current Location */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MdLocationOn className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Current Location</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {typeof vehicle.station === 'object' 
                      ? vehicle.station.name 
                      : (vehicle.stationData?.name || "Unknown")
                    }
                  </p>
                </div>

                {/* Destination Station */}
                <div>
                  <label htmlFor="toStationId" className="block text-sm font-medium text-gray-700 mb-2">
                    Transfer to Station *
                  </label>
                  <select
                    id="toStationId"
                    name="toStationId"
                    value={formData.toStationId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select destination station</option>
                    {stations
                      .filter(station => station.isActive && station._id !== getStationId(vehicle.station))
                      .map(station => (
                        <option key={station._id} value={station._id}>
                          {station.name} - {station.code}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Reason */}
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter reason for transfer..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
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
                    disabled={isLoading || !formData.toStationId}
                    className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-white bg-green-600 border border-transparent rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Transferring...</span>
                      </>
                    ) : (
                      <>
                        <MdSwapHoriz className="w-4 h-4" />
                        <span>Transfer Vehicle</span>
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

export default TransferVehicleModal;
