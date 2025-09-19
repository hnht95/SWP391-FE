import CarCatalogue from "../component/homePageComponent/CarCatalogue";
import BrandsSlider from "./homePageComponent/BrandSlider";
import CarouselHome from "./homePageComponent/Carousel";
import Service from "./homePageComponent/Service";
import Whychooseus from "./homePageComponent/Whychooseus";
const HomePage = () => {
  return (
    <div>
      <CarouselHome />
      <CarCatalogue />
      <BrandsSlider />
      <Whychooseus />
      <Service />
    </div>
  );
};

export default HomePage;
