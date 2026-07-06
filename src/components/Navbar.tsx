'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, LogIn } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openModal } = useModal();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const regularNavItems = [
    { name: 'Home', href: '#home' },
    { name: 'Classes', href: '#classes' },
    { name: 'About Us', href: '#about' },
    { name: 'Contact Us', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleJoinUs = () => {
    openModal();
    setIsMobileMenuOpen(false);
  };

  const handleLogin = () => {
    window.location.href = '/login';
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-gray-100/50 shadow-lg shadow-gray-100/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            className="flex-shrink-0 flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavClick('#home')}
          >
            <div className={`relative w-12 h-12 flex items-center justify-center p-1 rounded-xl shadow-inner border transition-all duration-300 ${
              isScrolled 
                ? 'bg-gradient-to-b from-[#0A1128] to-[#101b3f] border-slate-200/50' 
                : 'bg-white/10 border-white/10'
            }`}>
              <img 
                src="/images/logo.png" 
                alt="Highlanders Taekwondo" 
                className="h-10 w-auto object-contain"
              />
            </div>
            <span className={`font-athletic text-xl font-black tracking-wider uppercase ${isScrolled ? 'text-primary-navy' : 'text-white'}`}>
              Highlanders
            </span>
          </motion.div>
 
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {regularNavItems.map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className={isScrolled ? 'nav-link-scrolled' : 'nav-link'}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.name}
                </motion.button>
              ))}
              
              {/* Login Button */}
              <motion.button
                onClick={handleLogin}
                className={`flex items-center space-x-2 px-5 py-2.5 border rounded-full font-semibold transition-all duration-300 ${
                  isScrolled 
                    ? 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-primary-sunset' 
                    : 'border-white/30 text-white hover:bg-white/10 hover:border-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </motion.button>
              
              {/* Join Us Button */}
              <motion.button
                onClick={handleJoinUs}
                className="btn-primary"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Join Us
              </motion.button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white/95 backdrop-blur-md rounded-lg shadow-lg mt-2 p-4"
          >
            <div className="space-y-2">
              {regularNavItems.map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className="block w-full text-left px-3 py-2 rounded-md text-gray-700 hover:text-primary-sunset hover:bg-gray-50 transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.name}
                </motion.button>
              ))}
              
              {/* Login Button for Mobile */}
              <motion.button
                onClick={handleLogin}
                className="w-full flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </motion.button>
              
              {/* Join Us Button for Mobile */}
              <motion.button
                onClick={handleJoinUs}
                className="w-full btn-primary text-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Join Us
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
