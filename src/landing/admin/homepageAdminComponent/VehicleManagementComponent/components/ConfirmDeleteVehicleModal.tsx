import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MdClose, MdWarning } from "react-icons/md";
import type { Vehicle } from "../../../../../service/apiAdmin/apiVehicles/API";

interface ConfirmDeleteVehicleModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (vehicleId: string) => Promise<void>;
}

const ConfirmDeleteVehicleModal: React.FC<ConfirmDeleteVehicleModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!vehicle) return;
    setIsLoading(true);
    try {
      await onConfirm((vehicle as any).id || (vehicle as any)._id);
    } finally {
      setIsLoading(false);
    }
  };

  if (!vehicle) return null;

  const isEligible = !(vehicle.status === 'rented' || vehicle.status === 'reserved');

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
          <div className="fixed inset-0 bg-black/40" onClick={onClose} />

          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <MdWarning className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Delete Vehicle</h2>
                    <p className="text-sm text-gray-500">{vehicle.brand} {vehicle.model} - {vehicle.plateNumber}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MdClose className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {isEligible ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      This vehicle is eligible for deletion.
                    </p>
                    <p className="mt-2 text-sm text-green-700">
                      Action is permanent and cannot be undone.
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">
                      Vehicle is currently in status <span className="font-semibold">{vehicle.status}</span>. You cannot delete this vehicle.
                    </p>
                    <ul className="mt-3 list-disc list-inside text-sm text-red-700">
                      <li>Vehicles in status <span className="font-semibold">rented</span> or <span className="font-semibold">reserved</span> cannot be deleted.</li>
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isLoading || !isEligible}
                    className={`px-5 py-2 text-sm font-medium rounded-xl flex items-center gap-2 ${
                      !isEligible
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-white bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDeleteVehicleModal;


