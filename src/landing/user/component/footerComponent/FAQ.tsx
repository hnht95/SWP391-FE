import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

import m6 from "../../../../assets/subpage/2bydm6.png";

const faqData = [
  {
    question: "1. How do I rent an electric vehicle (EV) from your service?",
    answer:
      "Renting an EV is easy. You can browse our fleet on the 'Vehicles' page, select the car and location that suits you, choose your rental dates, and complete the booking through our secure payment system. You will receive a confirmation email with all the details.",
  },
  {
    question: "2. What documents are required to rent an EV?",
    answer:
      "For a smooth rental process, please have a valid driver's license from your home country, a major credit card in the renter's name for payment and security deposit, and a valid government-issued ID ready at the time of pickup.",
  },
  {
    question: "3. What is the policy for charging the EV?",
    answer:
      "We strive to provide a fully charged vehicle at the start of your rental. To help us maintain our service, we ask that you return the vehicle with a battery level of at least 70%. A fee may be applied if the charge is below this threshold upon return. We are not liable for the availability or condition of third-party charging stations.",
  },
  {
    question: "4. Are there any mileage limitations?",
    answer:
      "Our standard rental agreements include unlimited mileage, giving you the freedom to explore without worry. For special offers or long-term rentals, specific mileage caps might apply, so please check the terms of your booking.",
  },
  {
    question:
      "5. What happens if I get into an accident or the EV breaks down?",
    answer:
      "In the unlikely event of an accident or breakdown, your safety is our top priority. Please contact our 24/7 support line immediately at [Your Phone Number]. Our team will guide you through the necessary steps and arrange for assistance.",
  },
  {
    question: "6. Can I cancel my reservation?",
    answer:
      "Yes, you can. Cancellations made more than 48 hours before the pickup time are eligible for a full refund. For cancellations within 48 hours, a fee may be charged. Please refer to our detailed cancellation policy in the Terms of Service for more information.",
  },
  {
    question: "7. Do you provide insurance coverage?",
    answer:
      "Our rentals come with basic insurance coverage. However, we highly recommend purchasing an optional full-coverage plan to protect you from unexpected damages or liabilities during your rental period.",
  },
  {
    question: "8. Is there a security deposit required?",
    answer:
      "Yes, a security deposit will be authorized on your credit card at the time of pickup. The amount varies based on the vehicle type. The hold will be released shortly after the vehicle is returned in good condition.",
  },
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAnswer = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white text-black min-h-screen p-8 md:p-16 lg:p-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-8 border-b-2 border-gray-200 pb-2 text-center">
          Frequently Asked Questions
        </h1>

        {/* Hình ảnh trên cùng */}
        <div className="mb-12">
          <img
            src={m6}
            alt="An electric car on a sunny road"
            className="w-full h-auto object-cover rounded-xl shadow-lg"
          />
        </div>

        {/* Danh sách FAQ */}
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div key={index} className="border-b border-gray-200 pb-4">
              <button
                className="w-full flex justify-between items-center text-left py-2 focus:outline-none"
                onClick={() => toggleAnswer(index)}
              >
                <h2 className="text-xl md:text-2xl font-bold">
                  {item.question}
                </h2>
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
                <p className="text-gray-600 pl-8 border-l-2 border-gray-600 transition-all duration-300">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
