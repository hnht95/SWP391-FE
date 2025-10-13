import React from "react";
import { motion } from "framer-motion";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

/**
 * Page Title component với animation smooth
 * Title in đậm, smooth hơn Staff
 */
const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle, icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="mb-6"
    >
      <div className="flex items-center space-x-3">
        {icon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              type: "spring",
              stiffness: 200,
            }}
          >
            {icon}
          </motion.div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-sm text-gray-600 mt-1"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PageTitle;

