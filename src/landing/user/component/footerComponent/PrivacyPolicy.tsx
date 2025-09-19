import React, { useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaLock,
  FaUserShield,
  FaShareAlt,
  FaCogs,
  FaHandshake,
  FaGlobe,
} from "react-icons/fa";

// Import hình ảnh của bạn ở đây
import ioniq9 from "../../../../assets/subpage/ioniq9.png";

const privacyData = [
  {
    title: "1. The Information We Collect",
    content:
      "We collect various types of information to provide and improve our services. This includes personal information you provide directly to us, such as your full name, email address, phone number, and driver's license details during registration. We also collect payment information, including credit card numbers, to process transactions. Additionally, we may collect non-personal data like usage patterns, device information, and location data to enhance our app's functionality and your overall experience.",
    icon: <FaLock />,
  },
  {
    title: "2. How We Use Your Information",
    content:
      "The information we collect is primarily used to fulfill our services. This includes processing your EV rental reservations, managing your account, and communicating with you about your bookings. We also use this data to improve our services, develop new features, and personalize your experience. Occasionally, we may use your contact information to send you promotional offers or updates about our service, but you can opt out at any time.",
    icon: <FaCogs />,
  },
  {
    title: "3. Information Sharing and Disclosure",
    content:
      "We are committed to protecting your privacy. We do not sell or rent your personal information to third parties. We may share your data with trusted partners and service providers who assist us in operating our business, such as payment processors and customer support platforms. We will also disclose information if required by law, to enforce our Terms of Service, or to protect the rights, property, or safety of our company, our users, or the public.",
    icon: <FaShareAlt />,
  },
  {
    title: "4. Data Security Measures",
    content:
      "We take your data security seriously and implement a variety of security measures to protect your personal information from unauthorized access, alteration, or disclosure. We use industry-standard encryption for data transmission and store your data on secure servers. However, it's important to remember that no method of internet transmission or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee its absolute security.",
    icon: <FaUserShield />,
  },
  {
    title: "5. Your Rights and Choices",
    content:
      "You have several rights regarding your personal information. You have the right to access the data we hold about you, request corrections to any inaccurate information, or ask for your data to be deleted. You can also withdraw your consent for us to use your information at any time. To exercise any of these rights, please contact our support team. We are dedicated to helping you maintain control over your personal data.",
    icon: <FaHandshake />,
  },
  {
    title: "6. International Data Transfers",
    content:
      "Your information may be transferred to and maintained on computers located outside of your state, province, or country where the data protection laws may differ. By using our services, you consent to the transfer of your information to these locations. We will take all reasonable steps to ensure that your data is treated securely and in accordance with this Privacy Policy.",
    icon: <FaGlobe />,
  },
];

const PrivacyPolicy: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white text-black min-h-screen p-8 md:p-16 lg:p-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center">
          Privacy Policy
        </h1>

        {/* Hình ảnh trên cùng */}
        <div className="mb-12">
          <img
            src={ioniq9}
            alt="Privacy and data security"
            className="w-full h-auto object-cover rounded-xl shadow-lg"
          />
        </div>

        <p className="text-gray-600 text-center mb-12">
          Your privacy is important to us. This policy explains how we collect,
          use, and protect your personal information.
        </p>

        <div className="space-y-6">
          {privacyData.map((item, index) => (
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

        <p className="text-sm text-gray-500 mt-16 text-center">
          By using our services, you acknowledge that you have read and
          understood this Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
