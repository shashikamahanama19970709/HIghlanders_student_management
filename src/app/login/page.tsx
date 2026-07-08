'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, GraduationCap, X, Mail, Key } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface LoginFormData {
  email: string;
  password: string;
  role: 'admin' | 'student';
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    role: 'student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Forgot Password modal states
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newLoginEmail, setNewLoginEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'OTP code sent to your email!');
        setResetStep(2);
      } else {
        toast.error(data.error || 'Failed to send OTP code');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Failed to request code.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp || !newPassword) {
      toast.error('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          otp: resetOtp,
          newPassword,
          newEmail: newLoginEmail || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Credentials updated successfully!');
        setIsResetOpen(false);
        // Autofill the email with the new email
        setFormData(prev => ({
          ...prev,
          email: newLoginEmail || resetEmail
        }));
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Failed to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // Store authentication token
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('userRole', result.data.user.role);
        
        toast.success(`Welcome back, ${formData.role}!`);
        
        // Redirect based on role
        if (formData.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/student');
        }
      } else {
        toast.error(result.error || 'Invalid credentials. Please check your email and password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (role: 'admin' | 'student') => {
    setFormData(prev => ({
      ...prev,
      role,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-navy via-primary-wave to-primary-sunset flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange('student')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  formData.role === 'student'
                    ? 'border-primary-sunset bg-primary-sunset/10 text-primary-sunset'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <GraduationCap className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  formData.role === 'admin'
                    ? 'border-primary-sunset bg-primary-sunset/10 text-primary-sunset'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <User className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Admin</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                  placeholder={formData.role === 'admin' ? 'admin@example.com' : 'student@example.com'}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-sunset border-gray-300 rounded focus:ring-primary-sunset"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(formData.email);
                  setResetStep(1);
                  setIsResetOpen(true);
                }}
                className="text-sm text-primary-sunset hover:text-primary-wave transition-colors font-semibold"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center mt-8"
        >
          <a
            href="/"
            className="text-white/80 hover:text-white transition-colors text-sm"
          >
            ← Back to Home
          </a>
        </motion.div>
      </motion.div>

      {/* Forgot Password / Change Credentials Modal */}
      {isResetOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in animate-duration-200">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0A1128] to-[#101b3f] text-white p-6 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                  <Key className="w-5 h-5 text-primary-sunset" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Reset Credentials</h3>
                  <p className="text-[10px] text-gray-300 mt-0.5">Change password or login email via OTP</p>
                </div>
              </div>
              <button 
                onClick={() => setIsResetOpen(false)}
                className="text-white/60 hover:text-white transition-colors p-1"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Request OTP */}
            {resetStep === 1 ? (
              <form onSubmit={handleRequestOtp} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Your Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-sunset/20 focus:border-primary-sunset transition-all font-semibold text-slate-700"
                      placeholder="student@highlanders.com"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 font-medium leading-normal">
                    Enter the email assigned to your account. We will send a 6-digit verification code to this address.
                  </p>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsResetOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading || !resetEmail}
                    className="px-5 py-2.5 bg-primary-sunset text-white hover:bg-primary-wave rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resetLoading ? 'Sending OTP...' : 'Send Verification Code'}
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Verify OTP and Enter New Credentials */
              <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
                {/* OTP Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    6-Digit Verification Code *
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-sunset/20 focus:border-primary-sunset transition-all font-mono font-bold tracking-widest text-slate-700 text-center"
                      placeholder="123456"
                    />
                  </div>
                </div>

                {/* New Username / Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    New Login Email / Username (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="email"
                      value={newLoginEmail}
                      onChange={(e) => setNewLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-sunset/20 focus:border-primary-sunset transition-all font-semibold text-slate-700"
                      placeholder="new.email@example.com (Keep blank to reuse current)"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">Leave empty to keep using your current email address as login.</p>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-sunset/20 focus:border-primary-sunset transition-all font-semibold text-slate-700"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400 hover:text-slate-650" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400 hover:text-slate-655" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-sunset/20 focus:border-primary-sunset transition-all font-semibold text-slate-700"
                      placeholder="Re-enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400 hover:text-slate-650" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400 hover:text-slate-655" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="text-xs text-primary-sunset hover:underline font-bold"
                  >
                    ← Re-send code
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsResetOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading || !resetOtp || !newPassword || !confirmPassword}
                      className="px-5 py-2.5 bg-primary-sunset text-white hover:bg-primary-wave rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resetLoading ? 'Resetting...' : 'Change Credentials'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
