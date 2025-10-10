import React from "react";
import { motion } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Smooth page transition wrapper for admin pages
 * Provides fade-in and slide-up animation
 */
const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: 12,
        filter: "blur(4px)"
      }}
      animate={{ 
        opacity: 1, 
        y: 0,
        filter: "blur(0px)"
      }}
      exit={{ 
        opacity: 0, 
        y: -12,
        filter: "blur(4px)"
      }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1], // Smooth easeOutExpo - like Tesla website
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;

