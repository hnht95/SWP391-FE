import FeaturesSection from "./aboutUsComponent/FeaturesSection";
import HeroSection from "./aboutUsComponent/HeroSection";
import KeyInfoSection from "./aboutUsComponent/KeyInfoSection";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const AboutUs = () => {
  return (
    <motion.div
      className="font-sans text-gray-800"
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div variants={fadeInUp}>
        <HeroSection />
      </motion.div>

      <motion.main
        variants={fadeIn}
        className="container mx-auto px-4 py-10 sm:px-6 lg:px-8"
      >
        <KeyInfoSection />
      </motion.main>

      <motion.div variants={fadeInUp}>
        <FeaturesSection />
      </motion.div>
    </motion.div>
  );
};

export default AboutUs;
