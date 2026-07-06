'use client';

import { useEffect, useState } from 'react';
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
  XCircle 
} from 'lucide-react';
import { MemberRequest } from '@/types';
import toast from 'react-hot-toast';

export default function AdminMembers() {
  const [members, setMembers] = useState<MemberRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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

  const handleStatusUpdate = async (memberId: string, status: 'approved' | 'rejected') => {
    const confirmationText = status === 'approved' 
      ? 'Are you sure you want to approve this applicant? This will create a student account.' 
      : 'Are you sure you want to reject this applicant?';

    if (!confirm(confirmationText)) return;

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
  };

  const filteredMembers = members.filter(member => {
    const fullName = `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase();
    const email = (member.email || '').toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-sunset"></div>
        <div className="text-sm font-semibold text-slate-500">Loading member requests...</div>
      </div>
    );
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
        <div className="bg-white rounded-2xl border border-gray-150 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Requests</p>
            <p className="text-3xl font-black text-slate-800 mt-2 tracking-tight">{stats.total}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card: Pending */}
        <div className="bg-white rounded-2xl border border-gray-150 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</p>
            <p className="text-3xl font-black text-amber-600 mt-2 tracking-tight">{stats.pending}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center animate-pulse-slow">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card: Approved */}
        <div className="bg-white rounded-2xl border border-gray-150 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Approved</p>
            <p className="text-3xl font-black text-emerald-600 mt-2 tracking-tight">{stats.approved}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card: Rejected */}
        <div className="bg-white rounded-2xl border border-gray-150 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rejected</p>
            <p className="text-3xl font-black text-rose-600 mt-2 tracking-tight">{stats.rejected}</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
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
              {filteredMembers.map((member) => (
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
    </div>
  );
}
