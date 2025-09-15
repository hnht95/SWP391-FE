import React from "react";
import { FaFacebook, FaInstagram, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { SiZalo } from "react-icons/si";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-green-800 to-green-900 text-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Main Content */}
        <div className="text-center space-y-6">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  {/* Tree trunk */}
                  <path d="M12 16v6" stroke="currentColor" strokeWidth="2" fill="none"/>
                  {/* Tree leaves - main canopy */}
                  <path d="M12 2c-3 0-6 2-6 5s3 5 6 5 6-2 6-5-3-5-6-5z" fill="currentColor"/>
                  {/* Tree leaves - smaller canopy */}
                  <path d="M12 4c-2 0-4 1.5-4 3.5s2 3.5 4 3.5 4-1.5 4-3.5-2-3.5-4-3.5z" fill="currentColor"/>
                  {/* Tree leaves - top */}
                  <path d="M12 1c-1.5 0-3 1-3 2.5s1.5 2.5 3 2.5 3-1 3-2.5-1.5-2.5-3-2.5z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">
                <span className="text-green-400">Green</span> Word
              </h3>
            </div>
            
            {/* Address */}
            <div className="flex items-center justify-center space-x-2 text-white">
              <FaMapMarkerAlt className="text-green-400" />
              <span>136/15 Trần Quang Diệu, Phường Nhiu Lộc</span>
            </div>
            
            {/* Phone */}
            <div className="flex items-center justify-center space-x-2 text-white">
              <FaPhone className="text-green-400" />
              <span>0917971420</span>
            </div>
          </div>

          {/* Thank you message */}
          <div className="py-4">
            <p className="text-lg text-white italic">
              "Cảm ơn vì đã đồng hành cùng chúng tôi"
            </p>
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center space-x-6">
            {/* Zalo */}
            <a 
              href="https://zalo.me/0917971420" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors duration-300 group"
            >
              <SiZalo className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
            </a>

            {/* Facebook */}
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors duration-300 group"
            >
              <FaFacebook className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
            </a>

            {/* Instagram */}
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 group"
            >
              <FaInstagram className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
            </a>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="text-center text-sm text-white">
            <p>&copy; 2024 Green Word. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
