import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const HomePageStaff = () => {
  const location = useLocation();

  return (
    <div className="flex-1 px-8 py-3 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          className="flex-1 h-full overflow-auto"
          initial="initial"
          animate="in"
          exit="out"
          variants={{
            initial: {
              opacity: 0,
              x: 30,
              filter: "blur(4px)",
            },
            in: {
              opacity: 1,
              x: 0,
              filter: "blur(0px)",
            },
            out: {
              opacity: 0,
              x: -30,
              filter: "blur(4px)",
            },
          }}
          transition={{
            type: "tween",
            ease: "easeInOut",
            duration: 0.4,
          }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default HomePageStaff;
