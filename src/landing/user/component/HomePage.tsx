import BrandsSlider from "./homePageComponent/BrandSlider";
import CarouselHome from "./homePageComponent/Carousel";
import VehicleShowcase from "./homePageComponent/VehicleShowcase";
import StationShowcase from "./homePageComponent/StationShowcase";
const HomePage = () => {
  return (
    <div>
      <CarouselHome />
      <VehicleShowcase /> <BrandsSlider />
      <StationShowcase />
    </div>
  );
};

export default HomePage;
