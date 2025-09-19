import CarCatalogue from "../component/homePageComponent/CarCatalogue";
import CarouselHome from "./homePageComponent/Carousel";
import Service from "./homePageComponent/Service";
import Whychooseus from "./homePageComponent/Whychooseus";
const HomePage = () => {
  return (
    <div className="space-y-24">
      <CarouselHome />
      <CarCatalogue />
      <Whychooseus />
      <Service />
    </div>
  );
};

export default HomePage;
