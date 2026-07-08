'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Target, Heart } from 'lucide-react';
import { Master } from '@/types';

interface AboutSectionProps {
  historyText?: string;
}

const AboutSection = ({ historyText }: AboutSectionProps) => {
  const [masters, setMasters] = useState<Master[]>([]);

  useEffect(() => {
    const fetchVisibleMasters = async () => {
      try {
        const response = await fetch('/api/masters');
        const result = await response.json();
        if (result.success) {
          const visible = (result.data || []).filter((m: Master) => m && m.showOnWeb === true);
          setMasters(visible);
        }
      } catch (error) {
        console.error('Error fetching visible masters:', error);
      }
    };
    fetchVisibleMasters();
  }, []);

  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from technique to character development.',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Respect',
      description: 'Respect for self, others, and the martial arts tradition is at the core of our philosophy.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community',
      description: 'We build strong communities through martial arts training and shared values.',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Discipline',
      description: 'Martial arts discipline extends beyond the dojo into all aspects of life.',
    },
  ];

  return (
    <section id="about" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-athletic">
            About Highlanders Taekwondo
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We are more than just a martial arts school – we are a community dedicated to building champions in life and in the dojo.
          </p>
        </motion.div>

        {/* Vision & Mission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20"
        >
          <div className="bg-gradient-to-br from-primary-sunset to-primary-wave p-8 rounded-2xl text-white">
            <h3 className="text-3xl font-bold mb-4 font-athletic">Our Vision</h3>
            <p className="text-lg leading-relaxed">
              To be the leading Taekwondo community in Scotland, fostering personal growth, 
              physical fitness, and mental discipline through the art of Taekwondo. 
              We envision a world where every student reaches their full potential both 
              on and off the mat.
            </p>
          </div>
          
          <div className="bg-gray-100 p-8 rounded-2xl">
            <h3 className="text-3xl font-bold mb-4 font-athletic text-gray-900">Our Mission</h3>
            <p className="text-lg leading-relaxed text-gray-700">
              To provide high-quality Taekwondo instruction in a safe, inclusive environment 
              that promotes physical fitness, mental discipline, and character development. 
              We are committed to making martial arts accessible to all members of our community.
            </p>
          </div>
        </motion.div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-center mb-12 font-athletic text-gray-900">
            Our Core Values
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-sunset to-primary-wave rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  {value.icon}
                </div>
                <h4 className="text-xl font-semibold mb-2 text-gray-900">{value.title}</h4>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Masters Section */}
        {masters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-3xl font-bold text-center mb-12 font-athletic text-gray-900">
              Meet Our Masters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {masters.map((master, index) => (
                <motion.div
                  key={master._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Master avatar image */}
                    {master.image?.url ? (
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-sunset to-primary-wave rounded-full blur-sm opacity-45 animate-pulse-slow" />
                        <img 
                          src={master.image.url} 
                          alt={master.name}
                          className="relative w-32 h-32 rounded-full object-cover border-2 border-white shadow-lg"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-primary-sunset to-primary-wave rounded-full flex items-center justify-center text-white flex-shrink-0">
                        <span className="text-3xl font-bold">
                          {master.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold mb-1 font-athletic text-gray-900">
                        {master.name}
                      </h4>
                      <p className="text-primary-sunset font-semibold mb-2">{master.title}</p>
                      <p className="text-gray-600 mb-3 leading-relaxed">{master.bio}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-primary-navy text-white text-sm rounded-full">
                          {master.rank}
                        </span>
                        {master.certifications?.map((cert, certIndex) => (
                          <span
                            key={certIndex}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Club History */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20"
        >
          <div className="bg-gradient-to-r from-primary-navy to-primary-wave rounded-2xl p-12 text-white text-center">
            <h3 className="text-3xl font-bold mb-6 font-athletic">Our History</h3>
            <p className="text-lg max-w-3xl mx-auto leading-relaxed whitespace-pre-wrap">
              {historyText || `Founded in 2015, Highlanders Amateur Taekwondo CIC has grown from a small class 
of 10 students to a thriving community of over 150 members. Our commitment to 
excellence and community development has earned us recognition as one of the 
premier Taekwondo schools in Scotland. We continue to grow while maintaining 
the personal touch and family atmosphere that makes us special.`}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
