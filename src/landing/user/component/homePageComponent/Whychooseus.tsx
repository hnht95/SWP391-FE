import greenCar from "../../../../assets/loginImage/greenCar.png";

const WhyChooseUs = () => {
  return (
    <section className="w-full bg-white py-16">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Why Choose Us</h2>
        <p className="text-gray-500 mb-12">
          We Provide You Best Services In Your Life
        </p>

        {/* Car with advantages */}
        <div className="relative flex justify-center items-center mb-16">
          <img
            src={greenCar}
            alt="Sports Car"
            className="max-w-3xl w-full object-contain"
          />

          {/* Advantages */}
          <div className="absolute top-10 left-0 flex flex-col items-end text-right space-y-20">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-black"></span>
              <p className="text-sm">
                Easier Rent on
                <br />
                Your Budget
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-black"></span>
              <p className="text-sm">Competitive Pricing</p>
            </div>
          </div>

          <div className="absolute top-10 right-0 flex flex-col items-start text-left space-y-20">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-black"></span>
              <p className="text-sm">
                Most Flexible
                <br />
                Payment Plans
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-black"></span>
              <p className="text-sm">Your Choice of Mechanic</p>
            </div>
          </div>

          <div className="absolute top-0 md:top-2 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-64">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-black"></span>
              <p className="text-sm">
                The Best Extended
                <br />
                Auto Warranties
              </p>
            </div>
          </div>
        </div>

        {/* Car specs */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-center">
          <div>
            <h3 className="text-3xl font-bold">420</h3>
            <p className="uppercase text-sm text-gray-500">
              KPH
              <br />
              Maximum Speed
            </p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">1.3</h3>
            <p className="uppercase text-sm text-gray-500">
              s<br />
              0-100 km/h
            </p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">987</h3>
            <p className="uppercase text-sm text-gray-500">
              PS
              <br />
              Horsepower
            </p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">998</h3>
            <p className="uppercase text-sm text-gray-500">
              NM
              <br />
              Torque
            </p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">5.3</h3>
            <p className="uppercase text-sm text-gray-500">
              CC
              <br />
              Engine
            </p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">Automatic</h3>
            <p className="uppercase text-sm text-gray-500">
              Gears
              <br />
              Transmission
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
