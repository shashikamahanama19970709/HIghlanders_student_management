'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, Globe, Clock, Calendar } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import { useInquiry } from '@/contexts/InquiryContext';

interface ContactSectionProps {
  settings?: any;
}

const ContactSection = ({ settings }: ContactSectionProps) => {
  const { openModal } = useModal();
  const { openInquiryModal } = useInquiry();

  // Settings mock fallback
  const contactInfo = {
    address: settings?.contactInfo?.address || '123 Highland Avenue, Edinburgh, EH1 2YZ, Scotland',
    phone: settings?.contactInfo?.phone || '+44 131 234 5678',
    email: settings?.contactInfo?.email || 'info@highlanderstaekwondo.club',
    mapEmbedUrl: settings?.contactInfo?.mapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2238.123456789!2d-3.200000!3d55.950000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMznCsDU3JzAwLjAiTiAzcwrJMTInMDAuMCJF!5e0!3m2!1sen!2suk!4v1234567890',
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return Facebook;
      case 'instagram': return Instagram;
      case 'twitter': return Twitter;
      case 'youtube': return Youtube;
      default: return Globe;
    }
  };

  const getSocialColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return 'bg-[#1877F2] hover:bg-[#1877F2]/90';
      case 'instagram': return 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F56040] hover:opacity-90';
      case 'twitter': return 'bg-[#1DA1F2] hover:bg-[#1DA1F2]/90';
      case 'youtube': return 'bg-[#FF0000] hover:bg-[#FF0000]/90';
      default: return 'bg-slate-600 hover:bg-slate-700';
    }
  };

  const socialMedia = settings?.socialMedia
    ? settings.socialMedia.filter((s: any) => s.isEnabled).map((s: any) => ({
        name: s.platform,
        icon: getSocialIcon(s.platform),
        url: s.url,
        color: getSocialColor(s.platform)
      }))
    : [
        { name: 'Facebook', icon: Facebook, url: '#', color: 'bg-[#1877F2] hover:bg-[#1877F2]/90' },
        { name: 'Instagram', icon: Instagram, url: '#', color: 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F56040] hover:opacity-90' },
        { name: 'Twitter', icon: Twitter, url: '#', color: 'bg-[#1DA1F2] hover:bg-[#1DA1F2]/90' },
        { name: 'YouTube', icon: Youtube, url: '#', color: 'bg-[#FF0000] hover:bg-[#FF0000]/90' },
      ];

  const defaultHours: Record<string, string> = {
    monday: '16:00 - 21:30',
    tuesday: '16:00 - 21:30',
    wednesday: '16:00 - 21:30',
    thursday: '16:00 - 21:30',
    friday: '16:00 - 21:30',
    saturday: '09:00 - 14:00',
    sunday: 'Closed',
  };

  const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const getLiveStatus = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const now = new Date();
    const currentDay = days[now.getDay()];
    const todayRaw = settings?.operatingHours?.[currentDay] || defaultHours[currentDay];

    if (!todayRaw || todayRaw === 'Closed') {
      return { isOpen: false, text: 'Closed Now' };
    }

    const parts = todayRaw.split('-');
    if (parts.length !== 2) {
      return { isOpen: false, text: 'Closed Now' };
    }

    const parseToMin = (str: string) => {
      const [h, m] = str.trim().split(':').map(Number);
      return h * 60 + m;
    };

    try {
      const currentMin = now.getHours() * 60 + now.getMinutes();
      const startMin = parseToMin(parts[0]);
      const endMin = parseToMin(parts[1]);

      if (currentMin >= startMin && currentMin < endMin) {
        return { isOpen: true, text: `Open Now (until ${parts[1].trim()})` };
      } else if (currentMin < startMin) {
        return { isOpen: false, text: `Closed (opens at ${parts[0].trim()})` };
      } else {
        return { isOpen: false, text: 'Closed Now' };
      }
    } catch (e) {
      return { isOpen: false, text: 'Closed' };
    }
  };

  const liveStatus = getLiveStatus();
  const dayIndex = new Date().getDay(); 
  const currentDayName = daysOrder[dayIndex === 0 ? 6 : dayIndex - 1];

  return (
    <section id="contact" className="section-gradient py-24 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-primary-sunset/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-wave/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-5 font-athletic tracking-tight">
            Contact Us
          </h2>
          <div className="w-16 h-1.5 bg-gradient-to-r from-primary-sunset to-orange-500 mx-auto rounded-full mb-6" />
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Have questions about our training programs, schedule, or membership packages? We'd love to hear from you. Get in touch today.
          </p>
        </motion.div>

        {/* Contact Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Contact & Socials Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 flex flex-col justify-between gap-8"
          >
            {/* Quick Contact Info */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-100/80 rounded-3xl p-8 shadow-xl shadow-slate-100/50 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                  <span className="w-2 h-5 bg-primary-sunset rounded-full mr-2.5 inline-block"></span>
                  Get in Touch
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-11 h-11 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center text-primary-sunset flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-0.5">Location Address</h4>
                      <p className="text-sm font-semibold text-slate-700 leading-snug">{contactInfo.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-11 h-11 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center text-primary-sunset flex-shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-0.5">Phone Number</h4>
                      <a href={`tel:${contactInfo.phone}`} className="text-sm font-bold text-slate-700 hover:text-primary-sunset transition-colors leading-snug">
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-11 h-11 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center text-primary-sunset flex-shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-0.5">Email Address</h4>
                      <a href={`mailto:${contactInfo.email}`} className="text-sm font-bold text-slate-700 hover:text-primary-sunset transition-colors leading-snug">
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="mt-8 pt-8 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Follow Our Community</h4>
                <div className="flex flex-wrap gap-2.5">
                  {socialMedia.map((social: any) => (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center space-x-2 px-3.5 py-2 text-white rounded-xl text-xs font-bold shadow-sm transition-all duration-300 ${social.color}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <social.icon className="w-4 h-4" />
                      <span>{social.name}</span>
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Operating Hours Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-4"
          >
            <div className="bg-white/80 backdrop-blur-md border border-slate-100/80 rounded-3xl p-8 shadow-xl shadow-slate-100/50 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center">
                    <Clock className="w-5 h-5 text-primary-sunset mr-2" />
                    Operating Hours
                  </h3>
                  
                  {/* Live Status Badge */}
                  <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide border shadow-sm ${
                    liveStatus.isOpen 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                      : 'bg-red-50 text-red-700 border-red-100'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${liveStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <span>{liveStatus.text}</span>
                  </span>
                </div>

                <div className="space-y-3">
                  {daysOrder.map((day) => {
                    const rawHours = settings?.operatingHours?.[day] || defaultHours[day];
                    const isClosed = rawHours === 'Closed';
                    const isToday = day === currentDayName;

                    return (
                      <div 
                        key={day} 
                        className={`flex justify-between items-center px-3.5 py-2.5 rounded-xl border transition-all duration-300 ${
                          isToday 
                            ? 'bg-primary-sunset/[0.04] border-primary-sunset/30 shadow-sm scale-[1.02]' 
                            : 'border-transparent hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Calendar className={`w-4 h-4 ${isToday ? 'text-primary-sunset' : 'text-slate-400'}`} />
                          <span className={`text-sm font-bold capitalize ${isToday ? 'text-primary-sunset' : 'text-slate-700'}`}>
                            {day}
                          </span>
                        </div>
                        <span className={`text-xs font-black ${isClosed ? 'text-red-500 bg-red-50/40 px-2 py-0.5 rounded-md border border-red-100/20' : 'text-emerald-600 bg-emerald-50/40 px-2 py-0.5 rounded-md border border-emerald-100/20'}`}>
                          {rawHours}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Map Display Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3 min-h-[350px] lg:min-h-full flex"
          >
            <div className="bg-white/80 backdrop-blur-md border border-slate-100/80 rounded-3xl overflow-hidden shadow-xl shadow-slate-100/50 w-full p-2.5">
              <div className="rounded-2xl overflow-hidden h-full min-h-[300px]">
                <iframe
                  src={contactInfo.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Highlanders Taekwondo Dojo Location Map"
                  className="w-full h-full min-h-[300px] object-cover filter grayscale contrast-125"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dynamic CTA Footer Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-primary-navy to-[#0F1835] border border-white/5 rounded-3xl p-8 sm:p-10 max-w-5xl mx-auto shadow-2xl relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-sunset/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-3.5 font-athletic tracking-wide">
                Ready to Start Your Training Journey?
              </h3>
              <p className="text-sm font-semibold text-slate-350 mb-7 leading-relaxed">
                Join us for a free trial class and experience high-quality Taekwondo instruction. 
                We welcome all age groups, fitness levels, and experience backgrounds.
              </p>
              <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openModal()}
                  className="px-8 py-3 bg-gradient-to-r from-primary-sunset to-orange-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-sunset/20 hover:opacity-95 transition-all"
                >
                  Schedule Free Trial
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openInquiryModal()}
                  className="px-8 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl text-sm font-bold transition-all"
                >
                  Send an Inquiry
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
