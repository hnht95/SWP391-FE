import React, { useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaCar,
  FaInfoCircle,
  FaCreditCard,
  FaBatteryFull,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaFileContract,
  FaRegLightbulb,
} from "react-icons/fa";

import mache from "../../../../assets/subpage/mache.png";

const termsData = [
  {
    title: "1. General Terms & Agreement",
    content:
      "By accessing or using our EV rental services, you agree to be bound by these comprehensive Terms of Service. This document represents a legally binding agreement between you and our company. We reserve the right to modify these terms at any time without prior notice. Your continued use of the vehicle and related services constitutes your acceptance of all current and future terms, conditions, and notices. We highly recommend reviewing this page periodically for updates.",
    icon: <FaInfoCircle />,
  },
  {
    title: "2. Eligibility and Documentation",
    content:
      "To be eligible to rent an EV, you must be at least 21 years of age and hold a valid, non-provisional driver's license from your country of residence for a minimum of one year. A major credit card in your name is mandatory for both payment and the security deposit. All documents must be presented and verified at the time of vehicle pickup. Any fraudulent or invalid documentation will result in immediate cancellation of your reservation without a refund.",
    icon: <FaCar />,
  },
  {
    title: "3. Rental Period and Vehicle Usage",
    content:
      "The rental period begins at the scheduled pickup time and ends at the agreed-upon return time. The renter is responsible for the proper use and care of the EV throughout this period. Prohibited activities include, but are not limited to: off-roading, racing, using the vehicle for commercial delivery services, or driving under the influence of alcohol or drugs. Subleasing the vehicle is strictly forbidden.",
    icon: <FaShieldAlt />,
  },
  {
    title: "4. Charging, Range, and Battery Policy",
    content:
      "We provide the vehicle with a charge of at least 80% to ensure you can begin your journey smoothly. It is your responsibility to monitor the battery level and charge the EV as needed. You must return the vehicle with a charge of at least 70% to avoid a low-battery fee. Our company is not responsible for the availability, functionality, or compatibility of third-party charging stations.",
    icon: <FaBatteryFull />,
  },
  {
    title: "5. Payment, Fees, and Security Deposit",
    content:
      "All rental fees, including applicable taxes and surcharges, will be charged to the credit card on file. A temporary security deposit will be pre-authorized at the time of pickup to cover potential damages, late return fees, or cleaning costs. The hold will be released within 7-14 business days after the vehicle is returned in good condition. Late return fees are charged per hour after a grace period. Additional fees will be assessed for excessive dirtiness, unauthorized smoking, or damages.",
    icon: <FaCreditCard />,
  },
  {
    title: "6. Insurance and Liability",
    content:
      "Our rentals include basic third-party liability insurance. We strongly recommend purchasing an optional full-coverage plan to protect you from unexpected damages to the vehicle or other liabilities. In the event of an accident, you are responsible for the deductible amount, regardless of fault. All accidents must be reported to our support team within 24 hours.",
    icon: <FaRegLightbulb />,
  },
  {
    title: "7. Return and Inspection",
    content:
      "The vehicle must be returned to the agreed-upon location at the specified time. A late fee will be applied for delays. The vehicle will be inspected by our staff for any damages, missing items, or excessive dirtiness. Any new damages not documented at pickup will be charged to the renter. Please remove all personal belongings from the vehicle upon return.",
    icon: <FaFileContract />,
  },
  {
    title: "8. Geographic Restrictions",
    content:
      "Our vehicles are permitted for use only within the designated geographic area specified in your rental agreement. Driving the EV outside of this area without prior authorization is a violation of these terms and may result in penalties, including a suspension of our rental services and additional charges.",
    icon: <FaMapMarkerAlt />,
  },
];

const TermsOfService: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white text-black min-h-screen p-8 md:p-16 lg:p-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center">
          Terms of Service
        </h1>

        {/* Hình ảnh trên cùng */}
        <div className="mb-12">
          <img
            src={mache}
            alt="Terms of service"
            className="w-full h-auto object-cover rounded-xl shadow-lg"
          />
        </div>

        <p className="text-gray-600 text-center mb-12">
          Please read these terms and conditions carefully before using our
          EV-Car renting service.
        </p>

        <div className="space-y-6">
          {termsData.map((item, index) => (
            <div key={index} className="border-b border-gray-200 pb-4">
              <button
                className="w-full flex justify-between items-center text-left py-2 focus:outline-none"
                onClick={() => toggleSection(index)}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-xl text-gray-500">{item.icon}</div>
                  <h2 className="text-xl md:text-2xl font-bold">
                    {item.title}
                  </h2>
                </div>
                {openIndex === index ? (
                  <FaChevronUp className="text-gray-500" />
                ) : (
                  <FaChevronDown className="text-gray-500" />
                )}
              </button>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden
                  ${
                    openIndex === index
                      ? "max-h-96 opacity-100 mt-2"
                      : "max-h-0 opacity-0"
                  }`}
              >
                <p className="text-gray-600 pl-4 border-l-2 border-gray-600 transition-all duration-300">
                  {item.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        <section className="text-center mt-16">
          <p className="text-gray-500">
            Thank you for choosing our EV-Car renting service.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
