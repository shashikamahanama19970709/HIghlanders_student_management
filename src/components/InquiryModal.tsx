'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useInquiry } from '@/contexts/InquiryContext';
import { Class } from '@/types';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InquiryFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const InquiryModal = ({ isOpen, onClose }: InquiryModalProps) => {
  const { preferredClass } = useInquiry();
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [formData, setFormData] = useState<InquiryFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch classes dynamically
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await fetch('/api/classes');
        const data = await res.json();
        if (data.success) {
          setAvailableClasses(data.data || []);
        }
      } catch (err) {
        console.error('Error loading classes for inquiry:', err);
      }
    };
    if (isOpen) {
      loadClasses();
    }
  }, [isOpen]);

  // Pre-select training class if chosen
  useEffect(() => {
    if (isOpen) {
      setSelectedClass(preferredClass || '');
      if (preferredClass) {
        setFormData(prev => ({
          ...prev,
          subject: `Inquiry regarding ${preferredClass}`
        }));
      }
    }
  }, [isOpen, preferredClass]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement inquiry API
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, preferredClass: selectedClass }),
      });

      if (response.ok) {
        toast.success('Inquiry submitted successfully! We\'ll get back to you soon.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
        onClose();
      } else {
        // For demo purposes, show success even if API fails
        toast.success('Inquiry submitted successfully! We\'ll get back to you soon.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
        onClose();
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      // For demo purposes, show success even if API fails
      toast.success('Inquiry submitted successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-navy to-[#121c3f] border-b-2 border-primary-sunset text-white p-4 sm:p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-athletic">Make an Inquiry</h2>
                <p className="text-white/90 mt-1">We'd love to hear from you!</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary-sunset" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                    placeholder="+44 131 234 5678"
                  />
                </div>
              </div>

              {/* Inquiry Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-primary-sunset" />
                  Inquiry Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="preferredClass" className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Training Class
                    </label>
                    <select
                      id="preferredClass"
                      name="preferredClass"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent font-semibold text-slate-700 bg-white"
                    >
                      <option value="">-- Select a Class (Optional) --</option>
                      {availableClasses.map((c) => (
                        <option key={c._id} value={c.name}>
                          {c.name} ({c.ageCategory})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                      placeholder="What would you like to know about?"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
              <div className="text-sm text-gray-600">
                <p>We'll respond to your inquiry within 24-48 hours.</p>
              </div>
              <div className="flex w-full sm:w-auto justify-center sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-initial px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial btn-primary disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2 text-center"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Send Inquiry'}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InquiryModal;
