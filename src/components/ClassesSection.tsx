'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, Calendar, ChevronRight, X } from 'lucide-react';
import { Class } from '@/types';
import { useInquiry } from '@/contexts/InquiryContext';

const ClassDescription = ({ description, onShowMore }: { description: string; onShowMore: () => void }) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const check = () => {
      setIsOverflowing(el.scrollHeight > el.clientHeight);
    };

    check();

    const observer = new ResizeObserver(check);
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [description]);

  return (
    <div className="mb-8">
      <div 
        ref={containerRef}
        className="text-gray-600 text-sm leading-relaxed break-words line-clamp-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2"
        dangerouslySetInnerHTML={{ __html: description }}
      />
      {isOverflowing && (
        <button
          type="button"
          onClick={onShowMore}
          className="text-xs font-bold text-primary-wave hover:text-primary-sunset mt-2 transition-colors inline-flex items-center space-x-0.5"
        >
          <span>Show More</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

const ClassesSection = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassForModal, setSelectedClassForModal] = useState<Class | null>(null);
  const { openInquiryModal } = useInquiry();

  useEffect(() => {
    const loadWebClasses = async () => {
      try {
        const response = await fetch('/api/classes');
        const result = await response.json();
        if (result.success) {
          const visible = (result.data || []).filter((c: Class) => c.showOnWeb === true);
          setClasses(visible);
        }
      } catch (err) {
        console.error('Error fetching visible classes:', err);
      }
    };
    loadWebClasses();
  }, []);

  if (classes.length === 0) return null;

  return (
    <section id="classes" className="section-gradient py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 font-athletic uppercase tracking-wider">
            Our Training Programs
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-primary-sunset to-[#FF3E00] mx-auto mb-6 rounded-full" />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the perfect class for your age and skill level. Our expert instructors provide personalized attention to help you achieve your martial arts goals.
          </p>
        </motion.div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {classes.map((classItem, index) => (
            <motion.div
              key={classItem._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="gradient-border card-hover"
            >
              <div className="gradient-border-inner p-8 flex flex-col h-full justify-between">
                <div>
                  {/* Class Header */}
                  <div className="mb-6">
                    <span className="px-3.5 py-1.5 bg-primary-wave/10 text-primary-wave text-xs font-bold rounded-full uppercase tracking-wider">
                      {classItem.ageCategory}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 mt-3 mb-2 font-athletic uppercase tracking-wide break-words">
                      {classItem.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 font-semibold mt-1">
                      <Users className="w-4 h-4 mr-1.5 text-primary-wave" />
                      <span>{classItem.currentEnrollment} students enrolled</span>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="mb-6 bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center text-gray-800 mb-2 font-bold text-sm uppercase tracking-wide">
                      <Calendar className="w-4.5 h-4.5 mr-2 text-primary-sunset" />
                      <span>Schedule</span>
                    </div>
                    <div className="text-gray-600 text-sm space-y-1">
                      <div className="font-semibold">{classItem.schedule.days.join(', ')}</div>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        <span>{classItem.schedule.startTime} - {classItem.schedule.endTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <ClassDescription 
                    description={classItem.description} 
                    onShowMore={() => setSelectedClassForModal(classItem)} 
                  />
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => openInquiryModal(classItem.name)}
                  className="w-full btn-primary text-center py-3.5"
                >
                  Join This Class
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <div className="bg-white border border-gray-150 rounded-2xl shadow-xl shadow-gray-200/40 p-10 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 font-athletic uppercase tracking-wider">
              Not Sure Which Class Is Right for You?
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Our experienced instructors are here to help you find the perfect fit. Contact us for a free consultation and trial class.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4.5 bg-primary-navy text-white font-bold rounded-full hover:bg-primary-navy/90 hover:shadow-lg transition-all duration-300"
            >
              Get Free Consultation
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Class Details Modal */}
      <AnimatePresence>
        {selectedClassForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden transform transition-all duration-300 scale-100 flex flex-col relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-navy to-[#121c3f] border-b-2 border-primary-sunset text-white p-5 sm:p-6 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div>
                    <span className="px-2.5 py-1 bg-white/10 text-white border border-white/20 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {selectedClassForModal.ageCategory}
                    </span>
                    <h3 className="text-xl font-bold font-athletic uppercase tracking-wide mt-2 text-white leading-tight break-words">
                      {selectedClassForModal.name}
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedClassForModal(null)}
                  className="text-white/60 hover:text-white transition-colors p-1"
                  aria-label="Close details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Program Description</h4>
                  <div 
                    className="text-sm text-slate-600 leading-relaxed font-medium break-words [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2"
                    dangerouslySetInnerHTML={{ __html: selectedClassForModal.description }}
                  />
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Schedule & Timing</h4>
                  <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center text-primary-sunset flex-shrink-0">
                        <Calendar className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-700 block capitalize">Training Days</span>
                        <span className="text-xs text-slate-500 font-semibold block mt-0.5">{selectedClassForModal.schedule.days.join(', ')}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-slate-750 block">Class Timing</span>
                      <span className="text-xs text-slate-500 font-semibold block mt-0.5">
                        {selectedClassForModal.schedule.startTime} - {selectedClassForModal.schedule.endTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-primary-wave" />
                    <span className="text-xs font-bold text-slate-600">Current Active Enrollment:</span>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 border border-blue-100 text-primary-wave font-bold text-xs rounded-full">
                    {selectedClassForModal.currentEnrollment} students
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedClassForModal(null)}
                  className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const className = selectedClassForModal.name;
                    setSelectedClassForModal(null);
                    openInquiryModal(className);
                  }}
                  className="px-6 py-2.5 bg-primary-sunset text-white hover:bg-primary-wave rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all"
                >
                  Join This Class
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ClassesSection;
