import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdCheck } from "react-icons/md";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, message }) => {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
            >
              {/* Content - No Header */}
              <div className="p-8 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  {/* Success Icon Animation */}
                  <div className="flex justify-center">
                    <motion.div
                      className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg relative"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        delay: 0.1,
                        type: "spring",
                        stiffness: 200,
                        damping: 15
                      }}
                    >
                      {/* Spinning Circle - Apple Pay style */}
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-white/30 border-t-white"
                        initial={{ rotate: 0, opacity: 1 }}
                        animate={{ rotate: 360, opacity: 0 }}
                        transition={{ 
                          rotate: {
                            duration: 0.8,
                            ease: "linear"
                          },
                          opacity: {
                            delay: 0.6,
                            duration: 0.3,
                            ease: "easeOut"
                          }
                        }}
                      />
                      
                      {/* Checkmark - appears after spinning */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          delay: 0.9, // After spinning completes and fades out
                          duration: 0.4,
                          type: "spring",
                          stiffness: 200,
                          damping: 15
                        }}
                      >
                        <MdCheck className="w-12 h-12 text-white" />
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Success Message */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 }} // After checkmark appears
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {message}
                    </h3>
                    <p className="text-gray-600">
                      The operation has been completed successfully.
                    </p>
                  </motion.div>

                  {/* Action Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }} // After message appears
                    className="pt-4"
                  >
                    <button
                      onClick={onClose}
                      className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 hover:shadow-lg transition-all duration-200 font-semibold shadow-md"
                    >
                      Continue
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SuccessModal;
