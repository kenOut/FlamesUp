import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="lg:col-span-1">
            <div className="mb-4">
              <img
                src="/flameup_transparent.png"
                alt="Flames Up Solutions"
                className="h-12 object-contain"
              />
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Your trusted supplier of commercial kitchen and restaurant equipment. Quality products, expert installation, exceptional service.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="bg-gray-700 hover:bg-orange-600 p-2 rounded-lg transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-700 hover:bg-orange-600 p-2 rounded-lg transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/flameupghh/" target="_blank" rel="noopener noreferrer" className="bg-gray-700 hover:bg-orange-600 p-2 rounded-lg transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-700 hover:bg-orange-600 p-2 rounded-lg transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm hover:text-orange-500 transition-colors flex items-center group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-orange-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                Home
              </Link></li>
              <li><Link to="/about" className="text-sm hover:text-orange-500 transition-colors flex items-center group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-orange-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                About Us
              </Link></li>
              <li><Link to="/services" className="text-sm hover:text-orange-500 transition-colors flex items-center group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-orange-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                Services
              </Link></li>
              <li><Link to="/products" className="text-sm hover:text-orange-500 transition-colors flex items-center group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-orange-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                Products
              </Link></li>
              <li><Link to="/contact" className="text-sm hover:text-orange-500 transition-colors flex items-center group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-orange-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                Contact
              </Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Our Services</h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-orange-500 transition-colors cursor-pointer flex items-center group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-orange-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                Kitchen Design & Planning
              </li>
              <li className="hover:text-orange-500 transition-colors cursor-pointer flex items-center group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-orange-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                Equipment Supply
              </li>
              <li className="hover:text-orange-500 transition-colors cursor-pointer flex items-center group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-orange-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                Installation & Setup
              </li>
              <li className="hover:text-orange-500 transition-colors cursor-pointer flex items-center group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-orange-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                Interior Decoration
              </li>
              <li className="hover:text-orange-500 transition-colors cursor-pointer flex items-center group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-orange-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                Kitchen Remodeling
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Contact Info</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <a href="https://share.google/Sr307kB3AmSKX3Z8V" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">
                  Flame up Kitchen Equipment, Accra, Ghana
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <a href="tel:+233270131313" className="hover:text-orange-500 transition-colors">
                  +233 27 013 1313
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <a href="mailto:info@flameupghana.com" className="hover:text-orange-500 transition-colors">
                  info@flameupghana.com
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div>Mon - Sat: 8:00 AM - 6:00 PM</div>
                  <div className="text-gray-500">Sunday: Closed</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400 text-center md:text-left">
              &copy; {new Date().getFullYear()} Flames Up Solutions. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
