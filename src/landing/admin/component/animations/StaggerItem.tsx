import React from "react";
import { motion } from "framer-motion";

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "left" | "right"; // Thêm direction option
}

/**
 * Individual item for stagger animation
 * Must be used inside StaggerContainer
 */
const StaggerItem: React.FC<StaggerItemProps> = ({ 
  children, 
  className = "",
  direction = "up" 
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case "left":
        return { x: -30, y: 0 }; // Slide từ trái (giống Staff)
      case "right":
        return { x: 30, y: 0 };
      case "up":
        return { x: 0, y: 30 };
      default:
        return { x: 0, y: 30 };
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.98,
      ...getInitialPosition() 
    },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5, // Smooth như Staff
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
};

export default StaggerItem;

