import React from "react";
import CarouselHome from "../homePageComponent/Carousel";
import Service from "../homePageComponent/Service";
import Whychooseus from "../homePageComponent/Whychooseus";
const HomePage = () => {
  return (
    <div className="space-y-24">
      <CarouselHome />
      <Whychooseus />
      <Service />
    </div>
  );
};

export default HomePage;
