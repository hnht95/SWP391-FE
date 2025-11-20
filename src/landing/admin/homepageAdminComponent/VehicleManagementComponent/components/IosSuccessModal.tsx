import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface IosSuccessModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  delayMs?: number; // time before showing the checkmark (Apple Pay feel)
  checkDurationMs?: number; // how long the check draws
  popupDurationMs?: number; // how long the popup springs in
}

const IosSuccessModal: React.FC<IosSuccessModalProps> = ({
  isOpen,
  title = "Success",
  message,
  onClose,
  delayMs = 1400,
  checkDurationMs = 1300,
  popupDurationMs = 420,
}) => {
  const [showCheck, setShowCheck] = useState(false);
  useEffect(() => {
    if (!isOpen) {
      setShowCheck(false);
      return;
    }
    const t = setTimeout(() => setShowCheck(true), delayMs);
    return () => clearTimeout(t);
  }, [isOpen, delayMs]);
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl w-[360px] p-8 text-center"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 170, damping: 24, mass: 0.9, duration: popupDurationMs / 1000 }}
          >
            {/* Circle + delayed check (Apple Pay-like) */}
            <motion.div
              className="mx-auto w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-4 relative"
              initial={{ scale: 0.88 }}
              animate={{ scale: [0.88, 1, 1.03, 1] }}
              transition={{ duration: 1.15, ease: [0.17, 0.84, 0.44, 1] }}
            >
              {/* soft pulse while waiting */}
              {!showCheck && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-green-400/40"
                  initial={{ opacity: 0, scale: 1 }}
                  animate={{ opacity: [0.45, 0], scale: [1, 1.22] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeOut" }}
                />
              )}
              {showCheck && (
                <motion.svg
                  viewBox="0 0 24 24"
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  initial={{ pathLength: 0, opacity: 0.9 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: checkDurationMs / 1000, ease: [0.2, 0.6, 0.2, 1] }}
                >
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              )}
            </motion.div>
            <div className="text-lg font-semibold text-gray-900">{title}</div>
            {message && <div className="mt-1 text-sm text-gray-600">{message}</div>}
            <div className="mt-6">
              <button onClick={onClose} className="px-5 py-2 rounded-xl bg-black text-white text-sm hover:bg-gray-900">OK</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IosSuccessModal;


