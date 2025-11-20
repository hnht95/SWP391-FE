import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

interface KYCRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleName?: string;
}

const KYCRequiredModal = ({
  isOpen,
  onClose,
  vehicleName,
}: KYCRequiredModalProps) => {
  const navigate = useNavigate();

  const handleGoToProfile = () => {
    navigate("/profile");
    onClose();
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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
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
              <div className="relative bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 px-8 py-6 flex items-center justify-between">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative flex items-center space-x-3">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                  >
                    <Shield className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      KYC Verification Required
                    </h2>
                    <p className="text-sm text-orange-100">
                      Complete verification to book
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="relative w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors backdrop-blur-sm"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Warning Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="flex justify-center mb-6"
                >
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-orange-500" />
                  </div>
                </motion.div>

                {/* Message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center mb-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Verification Needed
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {vehicleName
                      ? `To book the ${vehicleName}, you need to complete your KYC verification first.`
                      : "To book a vehicle, you need to complete your KYC verification first."}
                  </p>
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <p className="text-sm text-orange-800 font-medium mb-2">
                      What you need to provide:
                    </p>
                    <ul className="text-sm text-orange-700 space-y-1 text-left">
                      <li className="flex items-center">
                        <span className="mr-2">•</span>
                        ID Card (Front & Back)
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">•</span>
                        Driver License (Front & Back)
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">•</span>
                        ID Number & License Number
                      </li>
                    </ul>
                  </div>
                </motion.div>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGoToProfile}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center space-x-2"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Go to Profile</span>
                  </button>
                </motion.div>
              </div>
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

export default KYCRequiredModal;
