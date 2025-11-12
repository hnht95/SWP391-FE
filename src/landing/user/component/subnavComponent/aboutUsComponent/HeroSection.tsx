import React from "react";
import { motion } from "framer-motion";
import vf9 from "../../../../../assets/aboutus/vf9.png";

const HeroSection: React.FC = () => {
  return (
    <section className="relative h-screen bg-black flex items-center justify-center overflow-hidden">
      <motion.img
        src={vf9}
        alt="Citipark About Us Hero"
        className="absolute inset-0 w-full h-full object-cover opacity-60 will-change-transform"
        initial={{ scale: 1.08, y: 0 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
      />

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)] pointer-events-none" />

      <motion.div
        className="absolute inset-0 z-10 top-20 p-10 flex flex-col justify-between text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold drop-shadow-lg text-left max-w-2xl"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          About Us <br />{" "}
          <span className="text-gray-400 block">Zami EV-Car Renting</span>
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg max-w-2xl drop-shadow-md text-left self-end"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          Since 2023, Zami EV Renting-Car has provided reliable and eco-friendly
          electric vehicle rental solutions for residents, workers, and
          travelers alike. With a diverse fleet from city cars to luxury EVs, we
          make every journey convenient, sustainable, and tailored to your
          needs.
        </motion.p>
      </motion.div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-xs tracking-wider">
        <div className="flex flex-col items-center gap-2">
          <span>SCROLL</span>
          <span className="h-6 w-px bg-white/50" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
