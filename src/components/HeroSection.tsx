'use client';

import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
  onMakeInquiry: () => void;
}

const HeroSection = ({ onGetStarted, onMakeInquiry }: HeroSectionProps) => {
  return (
    <section id="home" className="relative h-screen overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
          {/* Fallback image */}
          <img
            src="/images/hero-fallback.jpg"
            alt="Taekwondo training"
            className="w-full h-full object-cover"
          />
        </video>
        
        {/* Overlay */}
        <div className="absolute inset-0 hero-gradient" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo Circle with background glow */}
          <div className="relative mb-8 flex justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-sunset/20 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary-wave/10 rounded-full blur-2xl animate-pulse-slow" />
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: 0.2 
              }}
              className="relative w-44 h-44 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-center shadow-2xl shadow-black/40"
            >
              <img 
                src="/images/logo.png" 
                alt="Highlanders Taekwondo Logo" 
                className="w-32 h-32 object-contain animate-float"
              />
            </motion.div>
          </div>

          {/* Title */}
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-6xl md:text-8xl font-black text-white mb-2 font-athletic uppercase tracking-wider text-shadow-lg"
          >
            Highlanders
          </motion.h1>
          
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-2xl md:text-4xl font-extrabold mb-8 tracking-widest uppercase font-athletic text-shadow"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-sunset via-red-400 to-primary-wave">
              Amateur Taekwondo CIC
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg md:text-xl text-gray-200/90 mb-10 max-w-2xl mx-auto px-4 font-medium"
          >
            Building champions in martial arts and life through discipline, respect, and athletic excellence.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
          >
            <motion.button
              onClick={onGetStarted}
              className="w-full sm:w-auto btn-primary text-base py-4 px-10 flex items-center justify-center space-x-3 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>

            <motion.button
              onClick={onMakeInquiry}
              className="w-full sm:w-auto bg-white/5 backdrop-blur-md text-white border border-white/20 font-bold py-4 px-10 rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-300 flex items-center justify-center space-x-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Make an Inquiry</span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/50 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
