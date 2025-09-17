import React from "react";
import vf9 from "../../../../../assets/aboutus/vf9.png";
const HeroSection: React.FC = () => {
  return (
    <section className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] bg-black flex items-center justify-center overflow-hidden">
      <img
        src={vf9}
        alt="Citipark About Us Hero"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />

      <div className="absolute inset-0 z-10 p-10 flex flex-col justify-between text-white ">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold drop-shadow-lg text-left max-w-2xl">
          About Us <br />{" "}
          <div className="text-gray-400">Zami EV-Car Renting</div>
        </h1>

        <p className="text-base sm:text-lg max-w-2xl drop-shadow-md text-left self-end">
          Since 2023, Zami EV Renting-Car has provided reliable and eco-friendly
          electric vehicle rental solutions for residents, workers, and
          travelers alike. With a diverse fleet from city cars to luxury EVs, we
          make every journey convenient, sustainable, and tailored to your
          needs.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
