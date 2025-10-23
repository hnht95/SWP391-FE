import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import greenCar from "../assets/loginImage/greenCar.png";
import yellowCar from "../assets/loginImage/VF-3_Summer-Yellow_With-Wheel-Co.png";
import redCar from "../assets/loginImage/Red-Tesla-PNG-Images.png";
import grayCar from "../assets/loginImage/vf8.png";
import blueCar from "../assets/loginImage/vf9-vinfast-blue.png";
import logoWeb from "../assets/loginImage/logoZami.png";

const cars = [
  { name: "Tesla Model S", color: "#7691D0", img: blueCar },
  { name: "Ford Mustang", color: "#E7C544", img: yellowCar },
  { name: "Chevrolet Camaro", color: "#44B861", img: greenCar },
  { name: "Dodge Charger", color: "#F25351", img: redCar },
  { name: "BMW M3", color: "#4F4F4F", img: grayCar },
];

interface AuthLayoutProps {
  subtitle: string;
  children: ReactNode;
  bottomText: string;
  bottomLink: string;
  bottomLinkText: string;
  animationKey?: string;
}

const AuthLayout = ({
  subtitle,
  children,
  bottomText,
  bottomLink,
  bottomLinkText,
  animationKey = "default",
}: AuthLayoutProps) => {
  const [carIndex, setCarIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => handleNextCar(), 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [carIndex]);

  const handleNextCar = () => {
    setAnimating(true);
    setTimeout(() => {
      setCarIndex((prev) => (prev + 1) % cars.length);
      setAnimating(false);
    }, 600);
  };

  const car = cars[carIndex];

  const formVariants: Variants = {
    initial: {
      opacity: 0,
      x: -50,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      x: 50,
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };

  const headerVariants: Variants = {
    initial: {
      opacity: 0,
      y: -20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.4,
      },
    },
  };

  const contentVariants: Variants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3,
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    initial: {
      opacity: 0,
      y: 10,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
  };
  return (
    <div className="relative h-full overflow-hidden">
      <motion.div
        className={`absolute hidden lg:block top-0 left-0 h-full w-2/3 transition-transform duration-500 z-0 ${
          animating ? "-translate-x-full" : "translate-x-0"
        }`}
        style={{ backgroundColor: car.color }}
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className={`absolute hidden lg:block top-0 right-0 h-full w-1/3 bg-white transition-transform duration-500 z-0 ${
          animating ? "translate-x-full" : "translate-x-0"
        }`}
      />

      <div className="relative z-10 flex h-full">
        <div className="lg:w-2/3 w-full flex lg:mx-20 md:justify-center lg:justify-start items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={animationKey}
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col h-full md:h-fit justify-center items-start bg-white md:rounded-4xl shadow-2xl w-full md:w-[400px] lg:w-[300px] xl:w-[400px] p-8 pt-0 backdrop-blur-sm border border-gray-100"
            >
              <motion.div
                variants={headerVariants}
                className="w-full flex flex-col select-none items-center justify-center mb-8 lg:mb-4 xl:mb-8"
              >
                <motion.img
                  src={logoWeb}
                  alt="Zami Logo"
                  className="w-[150px] lg:w-[100px] xl:w-[150px]"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />

                <motion.p
                  className="text-lg font-semibold text-gray-400 lg:text-[16px] xl:text-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {subtitle}
                </motion.p>
              </motion.div>

              <motion.div variants={contentVariants} className="w-full">
                {children}
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="w-full flex items-center my-6 lg:my-4 xl:my-6 select-none"
              >
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="w-full text-center select-none"
              >
                <p className="text-gray-700">
                  {bottomText}{" "}
                  <motion.a
                    href={bottomLink}
                    className="text-black hover:text-gray-700 font-medium underline"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {bottomLinkText}
                  </motion.a>
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.img
          key={car.img}
          src={car.img}
          alt={car.name}
          className={`transition-all hidden lg:block select-none duration-500 lg:w-[600px] xl:w-[920px] h-[500px] object-contain absolute left-2/3 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none
              ${animating ? "opacity-0 scale-90" : "opacity-100 scale-100"}
            `}
          style={{ aspectRatio: "2/1" }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200 }}
        />
      </div>
    </div>
  );
};

export default AuthLayout;
