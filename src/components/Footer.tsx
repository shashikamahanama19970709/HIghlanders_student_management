'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ExternalLink, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: '#' },
    { name: 'Instagram', icon: Instagram, url: '#' },
    { name: 'Twitter', icon: Twitter, url: '#' },
    { name: 'YouTube', icon: Youtube, url: '#' },
  ];

  return (
    <footer className="bg-primary-navy border-t border-white/5 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Club Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold mb-4 font-athletic uppercase tracking-wider">
              Highlanders Taekwondo
            </h3>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              Building champions in martial arts and life. Join our community of dedicated martial artists.
            </p>
            <div className="flex space-x-3.5">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  className="w-10 h-10 bg-white/5 rounded-full border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Home
                </a>
              </li>
              <li>
                <a href="#classes" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Classes
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-300 hover:text-white transition-colors duration-200">
                  About Us
                </a>
              </li>
              <li>
                <a 
                  href="https://highlandersfitness.store/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary-sunset font-semibold hover:text-white transition-colors duration-200 inline-flex items-center gap-1"
                >
                  <span>Online Store</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Contact
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-sunset" />
                <span className="text-gray-300">
                  123 Highland Avenue<br />
                  Edinburgh, EH1 2YZ
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-sunset" />
                <span className="text-gray-300">+44 131 234 5678</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-sunset" />
                <span className="text-gray-300">info@highlanderstaekwondo.club</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="border-t border-gray-700 mt-8 pt-8 text-center"
        >
          <p className="text-gray-300">
            © {currentYear} Highlanders Amateur Taekwondo CIC | Powered by{' '}
            <a
              href="https://flexnodelive.site"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-sunset hover:text-primary-wave transition-colors duration-200 inline-flex items-center space-x-1"
            >
              <span>FlexNode</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            {' '} | All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
