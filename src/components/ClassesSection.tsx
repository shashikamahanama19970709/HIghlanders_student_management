'use client';

import { motion } from 'framer-motion';
import { Clock, Users, Calendar } from 'lucide-react';
import { Class } from '@/types';

const ClassesSection = () => {
  // Mock data - this will come from the API
  const classes: Class[] = [
    {
      _id: '1',
      name: 'Beginners Taekwondo',
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        startTime: '18:00',
        endTime: '19:30',
      },
      ageCategory: 'Ages 7-12',
      description: 'Perfect for young beginners to learn the fundamentals of Taekwondo in a fun and safe environment.',
      isVisible: true,
      currentEnrollment: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: '2',
      name: 'Advanced Taekwondo',
      schedule: {
        days: ['Tuesday', 'Thursday'],
        startTime: '19:00',
        endTime: '21:00',
      },
      ageCategory: 'Ages 13+',
      description: 'For experienced practitioners looking to advance their skills and prepare for competitions.',
      isVisible: true,
      currentEnrollment: 12,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: '3',
      name: 'Adult Fitness Taekwondo',
      schedule: {
        days: ['Monday', 'Wednesday', 'Saturday'],
        startTime: '20:00',
        endTime: '21:30',
      },
      ageCategory: 'Ages 18+',
      description: 'Combine martial arts training with fitness for a comprehensive workout experience.',
      isVisible: true,
      currentEnrollment: 8,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

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
          <div className="w-24 h-1.5 bg-gradient-to-r from-primary-sunset to-primary-wave mx-auto mb-6 rounded-full" />
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
                    <h3 className="text-2xl font-bold text-gray-900 mt-3 mb-2 font-athletic uppercase tracking-wide">
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
                  <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                    {classItem.description}
                  </p>
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
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
    </section>
  );
};

export default ClassesSection;
