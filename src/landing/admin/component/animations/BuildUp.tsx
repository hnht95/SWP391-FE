import React from "react";
import { motion } from "framer-motion";

interface BuildUpProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "left" | "right" | "top" | "bottom";
  className?: string;
}

/**
 * Build-up/Assembly animation - hiệu ứng "lắp ghép"
 * Card/Section xuất hiện như đang được lắp ráp từng phần
 */
const BuildUp: React.FC<BuildUpProps> = ({
  children,
  delay = 0,
  direction = "bottom",
  className = "",
}) => {
  const getInitialTransform = () => {
    switch (direction) {
      case "left":
        return { x: -50, rotateY: -15 };
      case "right":
        return { x: 50, rotateY: 15 };
      case "top":
        return { y: -50, rotateX: 15 };
      case "bottom":
        return { y: 50, rotateX: -15 };
      default:
        return { y: 50, rotateX: -15 };
    }
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.9,
        ...getInitialTransform(),
      }}
      animate={{
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
      }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.34, 1.56, 0.64, 1], // Elastic easing cho hiệu ứng "lắp vào"
        opacity: { duration: 0.5 },
      }}
      className={className}
      style={{ transformPerspective: 1000 }}
    >
      {children}
    </motion.div>
  );
};

export default BuildUp;

