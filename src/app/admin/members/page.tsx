'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  Search, 
  Filter, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Key,
  Lock
} from 'lucide-react';
import { MemberRequest } from '@/types';
import LoadingOverlay from '@/components/LoadingOverlay';
import toast from 'react-hot-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';

export default function AdminMembers() {
  const [members, setMembers] = useState<MemberRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Set credentials modal state
  const [isCredsOpen, setIsCredsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberRequest | null>(null);
  const [credsEmail, setCredsEmail] = useState('');
  const [credsPassword, setCredsPassword] = useState('');
  const [credsSaving, setCredsSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'info' | 'success' | 'warning';
    confirmText?: string;
  }>({
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleOpenCredentialsModal = (member: MemberRequest) => {
    setSelectedMember(member);
    setCredsEmail(member.email);
    // Generate a random 8-character password
    const randPass = Math.random().toString(36).substring(2, 10);
    setCredsPassword(randPass);
    setIsCredsOpen(true);
  };

  const handleSaveCredentials = async () => {
    if (!selectedMember || !credsEmail || !credsPassword) {
      toast.error('Email and password are required');
      return;
    }
    setCredsSaving(true);
    const toastId = toast.loading('Setting credentials...');
    try {
      const res = await fetch('/api/members/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMember._id,
          email: credsEmail,
          password: credsPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Credentials successfully set!', { id: toastId });
        setIsCredsOpen(false);
        fetchMembers();
      } else {
        toast.error(data.error || 'Failed to set credentials', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Failed to set credentials.', { id: toastId });
    } finally {
      setCredsSaving(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members');
      const result = await response.json();
      if (result.success) {
        setMembers(result.data);
      } else {
        toast.error('Failed to load member requests');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Error connecting to the database');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (memberId: string, status: 'approved' | 'rejected') => {
    const title = status === 'approved' ? 'Approve Applicant' : 'Reject Applicant';
    const message = status === 'approved'
      ? 'Are you sure you want to approve this applicant? This will automatically generate a student user login account.'
      : 'Are you sure you want to reject this applicant?';
    const confirmText = status === 'approved' ? 'Approve' : 'Reject';
    const type = status === 'approved' ? 'success' : 'danger';

    setConfirmConfig({
      title,
      message,
      confirmText,
      type,
      onConfirm: async () => {
        setConfirmOpen(false);
        setActionLoadingId(memberId);
        const toastId = toast.loading(status === 'approved' ? 'Approving application...' : 'Rejecting application...');

        try {
          const response = await fetch('/api/members', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: memberId, status }),
          });
          
          const result = await response.json();

          if (result.success) {
            toast.success(result.message || `Member request successfully ${status}!`, { id: toastId });
            fetchMembers();
          } else {
            toast.error(result.error || 'Failed to update status', { id: toastId });
          }
        } catch (error) {
          console.error('Error updating member status:', error);
          toast.error('An error occurred. Please check network connection.', { id: toastId });
        } finally {
          setActionLoadingId(null);
        }
      }
    });
    setConfirmOpen(true);
  };

  const filteredMembers = members.filter(member => {
    const fullName = `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase();
    const email = (member.email || '').toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStats = () => {
    return {
      total: members.length,
      pending: members.filter(m => m.status === 'pending').length,
      approved: members.filter(m => m.status === 'approved').length,
      rejected: members.filter(m => m.status === 'rejected').length,
    };
  };

  const stats = getStats();

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="space-y-8 animate-fade-in pl-1 pr-1 pb-10">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black font-athletic uppercase tracking-wider text-gray-900">Member Onboarding</h1>
        <p className="text-gray-500 text-xs mt-1 font-medium">Review and process registrations, activate student log-in accounts, and check applicant status.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card: Total */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStatusFilter('all')}
          className={`text-left rounded-2xl border p-6 flex items-center justify-between transition-all duration-300 focus:outline-none w-full ${
            statusFilter === 'all'
              ? 'bg-blue-50/30 border-blue-500 shadow-md ring-2 ring-blue-500/10'
              : 'bg-white border-gray-150 hover:border-blue-300 hover:shadow-sm'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Requests</p>
            <p className="text-3xl font-black text-slate-800 mt-2 tracking-tight">{stats.total}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            statusFilter === 'all' ? 'bg-blue-200 text-blue-700' : 'bg-blue-50 text-blue-500'
          }`}>
            <Users className="w-6 h-6" />
          </div>
        </motion.button>

        {/* Card: Pending */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStatusFilter('pending')}
          className={`text-left rounded-2xl border p-6 flex items-center justify-between transition-all duration-300 focus:outline-none w-full ${
            statusFilter === 'pending'
              ? 'bg-amber-50/40 border-amber-500 shadow-md ring-2 ring-amber-500/10'
              : 'bg-white border-gray-150 hover:border-amber-300 hover:shadow-sm'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</p>
            <p className="text-3xl font-black text-amber-600 mt-2 tracking-tight">{stats.pending}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors animate-pulse-slow ${
            statusFilter === 'pending' ? 'bg-amber-200 text-amber-700' : 'bg-amber-50 text-amber-500'
          }`}>
            <Clock className="w-6 h-6" />
          </div>
        </motion.button>

        {/* Card: Approved */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStatusFilter('approved')}
          className={`text-left rounded-2xl border p-6 flex items-center justify-between transition-all duration-300 focus:outline-none w-full ${
            statusFilter === 'approved'
              ? 'bg-emerald-50/30 border-emerald-500 shadow-md ring-2 ring-emerald-500/10'
              : 'bg-white border-gray-150 hover:border-emerald-300 hover:shadow-sm'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Approved</p>
            <p className="text-3xl font-black text-emerald-600 mt-2 tracking-tight">{stats.approved}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            statusFilter === 'approved' ? 'bg-emerald-200 text-emerald-700' : 'bg-emerald-50 text-emerald-500'
          }`}>
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </motion.button>

        {/* Card: Rejected */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStatusFilter('rejected')}
          className={`text-left rounded-2xl border p-6 flex items-center justify-between transition-all duration-300 focus:outline-none w-full ${
            statusFilter === 'rejected'
              ? 'bg-rose-50/30 border-rose-500 shadow-md ring-2 ring-rose-500/10'
              : 'bg-white border-gray-150 hover:border-rose-300 hover:shadow-sm'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rejected</p>
            <p className="text-3xl font-black text-rose-600 mt-2 tracking-tight">{stats.rejected}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            statusFilter === 'rejected' ? 'bg-rose-200 text-rose-700' : 'bg-rose-50 text-rose-500'
          }`}>
            <XCircle className="w-6 h-6" />
          </div>
        </motion.button>
      </div>

      {/* Control Bar (Search & Filter) */}
      <div className="bg-white rounded-2xl border border-gray-150 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-sunset/20 focus:border-primary-sunset transition-all"
          />
        </div>
        
        <div className="flex items-center space-x-3 self-end md:self-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-sunset/20 focus:border-primary-sunset transition-all cursor-pointer font-medium text-slate-700"
          >
            <option value="all">All Applications</option>
            <option value="pending">Pending Status</option>
            <option value="approved">Approved Status</option>
            <option value="rejected">Rejected Status</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-3xl border border-gray-150 shadow-xl shadow-slate-100/40 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-gray-150">
                <th className="pl-8 pr-6 py-4.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Applicant Name
                </th>
                <th className="px-6 py-4.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Contact Details
                </th>
                <th className="px-6 py-4.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Date of Birth
                </th>
                <th className="px-6 py-4.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Applied Date
                </th>
                <th className="px-6 py-4.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="pr-8 pl-6 py-4.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedMembers.map((member) => (
                <tr key={member._id} className="hover:bg-slate-50/50 transition-colors duration-250">
                  {/* Name */}
                  <td className="pl-8 pr-6 py-5 whitespace-nowrap">
                    <div>
                      <div className="text-[14px] font-bold text-slate-800">
                        {member.firstName} {member.lastName}
                      </div>
                      {member.isMinor && member.parentGuardian ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 mt-1">
                          Minor (Guardian: {member.parentGuardian.name})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 mt-1">
                          Adult Account
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="space-y-1.5">
                      <div className="flex items-center text-xs font-semibold text-slate-600">
                        <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        <span>{member.email}</span>
                      </div>
                      <div className="flex items-center text-xs font-semibold text-slate-600">
                        <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        <span>{member.phone}</span>
                      </div>
                    </div>
                  </td>

                  {/* DOB */}
                  <td className="px-6 py-5 whitespace-nowrap text-xs font-semibold text-slate-600">
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span>{new Date(member.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </td>

                  {/* Applied */}
                  <td className="px-6 py-5 whitespace-nowrap text-xs font-semibold text-slate-600">
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      <span>{new Date(member.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider ${
                      member.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250/20' :
                      member.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-250/20' :
                      'bg-amber-50 text-amber-700 border border-amber-250/20 animate-pulse-slow'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        member.status === 'approved' ? 'bg-emerald-500' :
                        member.status === 'rejected' ? 'bg-rose-500' :
                        'bg-amber-500'
                      }`} />
                      {member.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="pr-8 pl-6 py-5 whitespace-nowrap text-sm">
                    {member.status === 'pending' ? (
                      <div className="flex items-center space-x-2.5">
                        <button
                          onClick={() => handleStatusUpdate(member._id, 'approved')}
                          disabled={actionLoadingId !== null}
                          className="flex items-center space-x-1 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-250/50 rounded-xl text-xs font-bold shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        
                        <button
                          onClick={() => handleStatusUpdate(member._id, 'rejected')}
                          disabled={actionLoadingId !== null}
                          className="flex items-center space-x-1 px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-250/50 rounded-xl text-xs font-bold shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : member.status === 'approved' ? (
                      <button
                        onClick={() => handleOpenCredentialsModal(member)}
                        className="flex items-center space-x-1 px-3.5 py-2 bg-[#E35E1C]/10 text-[#E35E1C] hover:bg-[#E35E1C]/20 border border-[#E35E1C]/25 rounded-xl text-xs font-bold shadow-sm transition-all duration-200 active:scale-95"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>{member.credentialsCreated ? 'Update Credentials' : 'Set Credentials'}</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-gray-400 italic">No actions pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredMembers.length === 0 && (
          <div className="text-center py-12 bg-slate-50/20">
            <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-400">No member requests found matching filter.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-150 pt-6 mt-6 mb-8">
          <p className="text-xs font-semibold text-slate-500">
            Showing <span className="text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-slate-700">{Math.min(currentPage * itemsPerPage, filteredMembers.length)}</span> of <span className="text-slate-700">{filteredMembers.length}</span> members
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-xl text-xs font-black transition-colors ${
                    currentPage === page
                      ? 'bg-primary-wave text-white'
                      : 'border border-gray-200 text-slate-600 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Set Credentials Modal */}
      {isCredsOpen && selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in animate-duration-200">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0A1128] to-[#101b3f] text-white p-6 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                  <Key className="w-5 h-5 text-primary-sunset" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    {selectedMember.credentialsCreated ? 'Update Credentials' : 'Set Credentials'}
                  </h3>
                  <p className="text-[10px] text-gray-300 mt-0.5">Account settings for {selectedMember.firstName} {selectedMember.lastName}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCredsOpen(false)}
                className="text-white/60 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Login Email (Username)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="email"
                    value={credsEmail}
                    onChange={(e) => setCredsEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-sunset/20 focus:border-primary-sunset transition-all font-semibold text-slate-700"
                    placeholder="student@example.com"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">This will be the student's username to log in.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={credsPassword}
                    onChange={(e) => setCredsPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-sunset/20 focus:border-primary-sunset transition-all font-mono text-slate-700 font-bold"
                    placeholder="Enter password"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">An auto-generated password is provided. You can customize it.</p>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start space-x-3">
                <Mail className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  Once saved, an email notification containing these credentials and the login portal link will be automatically sent to <strong>{credsEmail}</strong>.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-4.5 bg-slate-50 border-t border-gray-100 flex w-full sm:w-auto justify-end gap-3">
              <button
                onClick={() => setIsCredsOpen(false)}
                disabled={credsSaving}
                className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-xl transition-all text-center justify-center flex"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCredentials}
                disabled={credsSaving || !credsPassword || !isValidEmail(credsEmail)}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-primary-sunset text-white hover:bg-primary-wave rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-center"
              >
                <span>{credsSaving ? 'Saving...' : 'Save & Inform Student'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={confirmOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmOpen(false)}
        type={confirmConfig.type}
        confirmText={confirmConfig.confirmText}
      />
    </div>
  );
}
