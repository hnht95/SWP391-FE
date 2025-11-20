import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdCheckCircle, MdClose } from "react-icons/md";

interface SuccessNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  autoCloseDuration?: number; // in milliseconds
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  isOpen,
  onClose,
  message,
  autoCloseDuration = 3000,
}) => {
  useEffect(() => {
    if (isOpen && autoCloseDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDuration, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed top-4 right-4 z-[100] max-w-md"
          initial={{ opacity: 0, x: 50, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 50, scale: 0.8 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-green-200 overflow-hidden">
            <div className="flex items-start p-4 space-x-3">
              <motion.div
                className="flex-shrink-0"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  damping: 10,
                  stiffness: 200,
                  delay: 0.1,
                }}
              >
                <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full">
                  <MdCheckCircle className="w-6 h-6 text-white" />
                </div>
              </motion.div>

              <div className="flex-1 pt-0.5">
                <motion.h3
                  className="text-lg font-bold text-gray-900 mb-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Success!
                </motion.h3>
                <motion.p
                  className="text-sm text-gray-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {message}
                </motion.p>
              </div>

              <motion.button
                onClick={onClose}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MdClose className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Progress Bar */}
            {autoCloseDuration > 0 && (
              <motion.div
                className="h-1 bg-gradient-to-r from-green-400 to-emerald-500"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{
                  duration: autoCloseDuration / 1000,
                  ease: "linear",
                }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessNotification;
