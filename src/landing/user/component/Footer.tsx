import { useState, useEffect } from 'react';
import logoWeb from "../../../assets/loginImage/logoZami.png";
import {
  FaFacebook,
  FaInstagram,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
// import { SiZalo } from "react-icons/si";
import { Link } from "react-router-dom";

const Footer = () => {
  const [isBackToTopVisible, setIsBackToTopVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const currentScrollY = window.scrollY;
      
      // Nếu scroll lên thì ẩn ngay lập tức
      if (currentScrollY < lastScrollY) {
        setIsBackToTopVisible(false);
      }
      // Nếu scroll xuống và > 800px thì hiện
      else if (currentScrollY > lastScrollY && currentScrollY > 800) {
        setIsBackToTopVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility();

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [lastScrollY]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="bg-gradient-to-r from-black via-black to-gray-950 text-white py-12 px-4 relative overflow-hidden">
      {/* Light reflection effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-600/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gray-700/15 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-2 md:px-4">
          {/* Main Footer Content - Left info + Right map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-24 mb-8 items-start">
            {/* Left: Company, Quick Links, Support */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* Company Information (spans two columns on md+) */}
              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center justify-start">
                  <img
                    src={logoWeb}
                    alt="ZaMi Logo"
                    className="w-16 md:w-20 h-auto object-contain"
                    style={{ filter: "brightness(0) invert(1)" }}
                  />
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Experience the future of mobility with our premium electric
                  vehicle rental service. Your eco-friendly journey starts here
                  with cutting-edge technology and sustainable transportation.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="https://facebook.com"
                    className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors duration-300 group border border-gray-600 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <div className="absolute -inset-1 bg-gray-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <FaFacebook className="w-5 h-5 text-gray-400 group-hover:text-gray-300 group-hover:scale-110 transition-all duration-300" />
                  </a>
                  <a
                    href="https://twitter.com"
                    className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors duration-300 group border border-gray-600 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <div className="absolute -inset-1 bg-gray-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <FaTwitter className="w-5 h-5 text-gray-400 group-hover:text-gray-300 group-hover:scale-110 transition-all duration-300" />
                  </a>
                  <a
                    href="https://instagram.com"
                    className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors duration-300 group border border-gray-600 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <div className="absolute -inset-1 bg-gray-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <FaInstagram className="w-5 h-5 text-gray-400 group-hover:text-gray-300 group-hover:scale-110 transition-all duration-300" />
                  </a>
                  <a
                    href="https://youtube.com"
                    className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors duration-300 group border border-gray-600 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <div className="absolute -inset-1 bg-gray-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <FaYoutube className="w-5 h-5 text-gray-400 group-hover:text-gray-300 group-hover:scale-110 transition-all duration-300" />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white relative">
                  Quick Links
                  <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gray-500"></div>
                </h4>
                <div className="space-y-2">
                  <Link
                    to="/"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="block text-gray-300 hover:text-gray-200 transition-colors duration-300"
                  >
                    Home
                  </Link>
                  <Link
                    to="/vehicles"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="block text-gray-300 hover:text-gray-200 transition-colors duration-300"
                  >
                    Electric Vehicles
                  </Link>
                  <Link
                    to="/aboutus"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="block text-gray-300 hover:text-gray-200 transition-colors duration-300"
                  >
                    About Us
                  </Link>
                  <Link
                    to="/contactus"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="block text-gray-300 hover:text-gray-200 transition-colors duration-300"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>

              {/* Support */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white relative">
                  Support
                  <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gray-500"></div>
                </h4>
                <div className="space-y-2">
                  <Link
                    to="/faq"
                    className="block text-gray-300 hover:text-gray-200 transition-colors duration-300"
                  >
                    FAQ
                  </Link>
                  <Link
                    to="/terms"
                    className="block text-gray-300 hover:text-gray-200 transition-colors duration-300"
                  >
                    Terms of Service
                  </Link>
                  <Link
                    to="/privacy"
                    className="block text-gray-300 hover:text-gray-200 transition-colors duration-300"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    to="/help"
                    className="block text-gray-300 hover:text-gray-200 transition-colors duration-300"
                  >
                    Help Center
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Google Maps */}
            <div className="w-full">
              <div className="aspect-[16/10] md:aspect-[16/9] w-full overflow-hidden rounded-lg border border-gray-700 shadow-inner">
                <iframe
                  title="ZaMi Location"
                  src="https://www.google.com/maps?q=136/15%20Tran%20Quang%20Dieu%2C%20Ho%20Chi%20Minh%20City&output=embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
              <div className="mt-3 space-y-2 text-gray-300 text-sm">
                <div className="flex items-center space-x-2">
                  <FaMapMarkerAlt className="text-gray-400" />
                  <span>136/15 Trần Quang Diệu, Phường Nhiu Lộc</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaEnvelope className="text-gray-400" />
                  <span>hello@zami.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaPhone className="text-gray-400" />
                  <span>0917971420</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Border */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-sm text-gray-300">
              {/* Left: Copyright */}
              <div className="text-center md:text-left">
                <p>&copy; 2024 ZaMi. All rights reserved.</p>
              </div>
              
              {/* Center: Back to Top Button */}
              <div className="flex justify-center">
                <button
                  className={`
                    relative bg-black/80 hover:bg-black/90 text-white rounded-full p-3 
                    shadow-lg hover:shadow-2xl backdrop-blur-sm cursor-pointer select-none
                    border border-white/20 hover:border-white/60
                    transition-all duration-500 ease-in-out
                    hover:scale-110 group
                    ${isBackToTopVisible ? 
                      'opacity-100 scale-100 translate-y-0' : 
                      'opacity-0 scale-90 translate-y-2 pointer-events-none'
                    }
                  `}
                  onClick={scrollToTop}
                  aria-label="Back to top"
                >
                  {/* Glow effect on hover */}
                  <div className="absolute -inset-1 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                  
                  <div className="relative flex flex-col items-center">
                    <svg
                      className="w-4 h-4 mb-1 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                    <span className="text-xs font-medium transition-all duration-300 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.9)] group-hover:text-white">
                      Top
                    </span>
                  </div>
                </button>
              </div>

              {/* Right: Terms & Privacy */}
              <div className="flex justify-center md:justify-end space-x-4">
                <a
                  href="/terms"
                  className="hover:text-gray-200 transition-colors duration-300"
                >
                  Terms
                </a>
                <a
                  href="/privacy"
                  className="hover:text-gray-200 transition-colors duration-300"
                >
                  Privacy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

