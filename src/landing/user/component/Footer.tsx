import React from "react";
import logoWeb from "../../../assets/loginImage/logoZami.png";
import { FaFacebook, FaInstagram, FaPhone, FaMapMarkerAlt, FaEnvelope, FaTwitter, FaYoutube } from "react-icons/fa";
import { SiZalo } from "react-icons/si";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-black via-black to-gray-950 text-white py-12 px-4 relative overflow-hidden">
      {/* Light reflection effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            
            {/* Company Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <img
                  src={logoWeb}
                  alt="ZaMi Logo"
                  className="w-16 md:w-20 h-auto object-contain"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Experience the future of mobility with our premium electric vehicle rental service. 
                Your eco-friendly journey starts here with cutting-edge technology and sustainable transportation.
              </p>
              <div className="flex space-x-4">
                <a href="https://facebook.com" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors duration-300 group border border-gray-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <FaFacebook className="w-5 h-5 text-blue-600 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-300" />
                </a>
                <a href="https://twitter.com" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors duration-300 group border border-gray-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="absolute -inset-1 bg-blue-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <FaTwitter className="w-5 h-5 text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-all duration-300" />
                </a>
                <a href="https://instagram.com" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors duration-300 group border border-gray-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <FaInstagram className="w-5 h-5 text-pink-500 group-hover:text-pink-400 group-hover:scale-110 transition-all duration-300" />
                </a>
                <a href="https://youtube.com" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors duration-300 group border border-gray-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="absolute -inset-1 bg-red-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <FaYoutube className="w-5 h-5 text-red-500 group-hover:text-red-400 group-hover:scale-110 transition-all duration-300" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white relative">
                Quick Links
                <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-emerald-400"></div>
              </h4>
              <div className="space-y-2">
                <a href="/" className="block text-gray-300 hover:text-emerald-400 transition-colors duration-300">Home</a>
                <a href="/vehicles" className="block text-gray-300 hover:text-emerald-400 transition-colors duration-300">Electric Vehicles</a>
                <a href="/about" className="block text-gray-300 hover:text-emerald-400 transition-colors duration-300">About Us</a>
                <a href="/contact" className="block text-gray-300 hover:text-emerald-400 transition-colors duration-300">Contact Us</a>
              </div>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white relative">
                Support
                <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-emerald-400"></div>
              </h4>
              <div className="space-y-2">
                <a href="/faq" className="block text-gray-300 hover:text-emerald-400 transition-colors duration-300">FAQ</a>
                <a href="/terms" className="block text-gray-300 hover:text-emerald-400 transition-colors duration-300">Terms of Service</a>
                <a href="/privacy" className="block text-gray-300 hover:text-emerald-400 transition-colors duration-300">Privacy Policy</a>
                <a href="/help" className="block text-gray-300 hover:text-emerald-400 transition-colors duration-300">Help Center</a>
              </div>
            </div>

            {/* Stay Updated & Contact */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white relative">
                Stay Updated
                <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-emerald-400"></div>
              </h4>
              <p className="text-gray-300 text-sm">
                Subscribe to our newsletter for special offers, new vehicle releases, and eco-friendly tips!
              </p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
                <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-r-lg transition-colors duration-300">
                  Subscribe
                </button>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2 text-gray-300">
                  <FaEnvelope className="text-emerald-400" />
                  <span className="text-sm">hello@zami.com</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <FaPhone className="text-emerald-400" />
                  <span className="text-sm">0917971420</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <FaMapMarkerAlt className="text-emerald-400" />
                  <span className="text-sm">136/15 Trần Quang Diệu, Phường Nhiu Lộc</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Border */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
              <p>&copy; 2024 ZaMi. All rights reserved.</p>
              <div className="flex space-x-4 mt-2 md:mt-0">
                <a href="/terms" className="hover:text-emerald-400 transition-colors duration-300">Terms</a>
                <a href="/privacy" className="hover:text-emerald-400 transition-colors duration-300">Privacy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;