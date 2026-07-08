'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { OnboardingFormData } from '@/types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingModal = ({ isOpen, onClose }: OnboardingModalProps) => {
  const [isTermsExpanded, setIsTermsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<OnboardingFormData>({
    mode: 'onChange',
  });

  const watchDateOfBirth = watch('dateOfBirth');
  const watchIsMinor = watch('isMinor');
  const watchTermsAccepted = watch('termsAccepted');

  const dobRegister = register('dateOfBirth', {
    required: 'Date of birth is required',
    validate: {
      notFuture: (value) => {
        if (!value) return true;
        const selected = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selected <= today || 'Date of birth cannot be in the future';
      },
      tooOld: (value) => {
        if (!value) return true;
        const selected = new Date(value);
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 100);
        return selected >= minDate || 'Please enter a valid date of birth';
      }
    }
  });

  // Calculate if the person is a minor based on date of birth
  const calculateIsMinor = (dateOfBirth: string) => {
    if (!dateOfBirth) return false;
    const dob = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    return age < 18 || (age === 18 && monthDiff < 0);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      // Submit to API
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Application submitted successfully! We will contact you soon.');
        onClose();
      } else {
        toast.error(result.error || 'Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const termsAndConditions = `
TERMS AND CONDITIONS - HIGHLANDERS AMATEUR TAEKWONDO CIC

1. MEMBERSHIP AGREEMENT
By joining Highlanders Amateur Taekwondo CIC, you agree to abide by all club rules, regulations, and the code of conduct as outlined by the club management.

2. TRAINING PARTICIPATION
- All participants must follow the instructions of qualified instructors at all times
- Proper training attire must be worn during all sessions
- Members must maintain appropriate behavior and respect fellow students and instructors

3. HEALTH AND SAFETY
- Members must disclose any relevant medical conditions that may affect training
- The club is not responsible for injuries sustained during training participation
- All members are encouraged to consult with a physician before beginning any martial arts training

4. PAYMENT AND FEES
- All membership fees must be paid on time as per the payment schedule
- No refunds will be provided for unused training sessions
- The club reserves the right to modify fees with reasonable notice

5. CONDUCT AND DISCIPLINE
- Any form of bullying, harassment, or inappropriate behavior will result in immediate disciplinary action
- The club reserves the right to terminate membership for serious violations of club rules
- Respect for instructors, fellow students, and the facility is mandatory at all times

6. PARENTAL CONSENT (FOR MINORS)
- Parents/guardians are responsible for ensuring their child's attendance and behavior
- Emergency contact information must be kept up to date
- Parents/guardians must be available for pickup immediately after classes

7. LIABILITY WAIVER
Participation in Taekwondo training involves inherent risks. By signing this agreement, you acknowledge and accept these risks and release Highlanders Amateur Taekwondo CIC, its instructors, and staff from any liability for injuries or damages.

8. TERMINATION
- Membership may be terminated by either party with 30 days written notice
- The club reserves the right to immediately terminate membership for serious violations

9. PRIVACY
- Personal information will be kept confidential and used only for club-related purposes
- Photos/videos may be taken for promotional purposes unless specifically declined in writing

10. AMENDMENTS
The club reserves the right to modify these terms and conditions with reasonable notice to all members.

By accepting these terms, you confirm that you have read, understood, and agree to be bound by all conditions outlined above.
  `;

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
                <h2 className="text-2xl font-bold font-athletic">Join Highlanders Taekwondo</h2>
                <p className="text-white/90 mt-1">Begin your martial arts journey today</p>
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
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary-sunset" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      {...register('firstName', { required: 'First name is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      {...register('lastName', { required: 'Last name is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-primary-sunset" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                      placeholder="john.doe@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      {...register('phone', { required: 'Phone number is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                      placeholder="+44 131 234 5678"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary-sunset" />
                  Date of Birth *
                </h3>
                <input
                  type="date"
                  name={dobRegister.name}
                  ref={dobRegister.ref}
                  onBlur={dobRegister.onBlur}
                  onChange={(e) => {
                    dobRegister.onChange(e);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>
                )}
              </div>

              {/* Parent/Guardian Information (for minors) */}
              {calculateIsMinor(watchDateOfBirth) && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-primary-sunset" />
                    Parent/Guardian Information *
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent/Guardian Name *
                      </label>
                      <input
                        {...register('parentGuardian.name', { required: 'Parent/Guardian name is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                        placeholder="Jane Doe"
                      />
                      {errors.parentGuardian?.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.parentGuardian.name.message}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Parent Phone *
                        </label>
                        <input
                          {...register('parentGuardian.phone', { required: 'Parent phone is required' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                          placeholder="+44 131 234 5678"
                        />
                        {errors.parentGuardian?.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.parentGuardian.phone.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Parent Email *
                        </label>
                        <input
                          {...register('parentGuardian.email', {
                            required: 'Parent email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address',
                            },
                          })}
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                          placeholder="jane.doe@example.com"
                        />
                        {errors.parentGuardian?.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.parentGuardian.email.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Emergency Contact *</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emergency Contact Name *
                      </label>
                      <input
                        {...register('emergencyContact.name', { required: 'Emergency contact name is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                        placeholder="Emergency Contact"
                      />
                      {errors.emergencyContact?.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship *
                      </label>
                      <input
                        {...register('emergencyContact.relationship', { required: 'Relationship is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                        placeholder="Parent, Spouse, etc."
                      />
                      {errors.emergencyContact?.relationship && (
                        <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.relationship.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Phone *
                    </label>
                    <input
                      {...register('emergencyContact.phone', { required: 'Emergency phone is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                      placeholder="+44 131 234 5678"
                    />
                    {errors.emergencyContact?.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.phone.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Information (Optional)
                </label>
                <textarea
                  {...register('medicalInfo')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                  placeholder="Any medical conditions, allergies, or medications we should be aware of..."
                />
              </div>

              {/* Terms and Conditions */}
              <div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Terms and Conditions *</h3>
                    <button
                      type="button"
                      onClick={() => setIsTermsExpanded(!isTermsExpanded)}
                      className="flex items-center text-primary-sunset hover:text-primary-wave transition-colors"
                    >
                      {isTermsExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  
                  <div className={`overflow-hidden transition-all duration-300 ${isTermsExpanded ? 'max-h-96' : 'max-h-20'}`}>
                    <div className="text-sm text-gray-600 whitespace-pre-wrap">
                      {termsAndConditions}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        {...register('termsAccepted', { required: 'You must accept the terms and conditions' })}
                        type="checkbox"
                        className="w-4 h-4 text-primary-sundance border-gray-300 rounded focus:ring-primary-sunset"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        I have read and agree to the Terms and Conditions *
                      </span>
                    </label>
                    {errors.termsAccepted && (
                      <p className="text-red-500 text-sm mt-1">{errors.termsAccepted.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
              <div className="text-sm text-gray-600">
                <p>By submitting, you agree to our terms and conditions.</p>
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
                  onClick={handleSubmit(onSubmit)}
                  disabled={!isValid || isSubmitting}
                  className="flex-1 sm:flex-initial btn-primary disabled:opacity-50 disabled:cursor-not-allowed font-medium text-center justify-center"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingModal;
