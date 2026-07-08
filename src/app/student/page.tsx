'use client';

import { useEffect, useState } from 'react';
import { Calendar, CreditCard, User, Trophy, Clock, DollarSign, Activity } from 'lucide-react';
import LoadingOverlay from '@/components/LoadingOverlay';

interface StudentStats {
  membershipStatus: string;
  nextPayment: string;
  planName: string;
  attendedClasses: number;
  totalClasses: number;
  currentRank: string;
  nextRank: string;
  monthlyFee: number;
  studentName: string;
  upcomingClasses: Array<{
    id: string;
    name: string;
    days: string[];
    time: string;
    instructor: string;
    category: string;
  }>;
}

export default function StudentDashboard() {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentStats();
  }, []);

  const fetchStudentStats = async () => {
    try {
      const response = await fetch('/api/student/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        window.location.href = '/login';
        return;
      }

      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching student stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 font-semibold">No dashboard data available.</div>
      </div>
    );
  }

  const attendancePercent = stats.totalClasses > 0 ? (stats.attendedClasses / stats.totalClasses) * 100 : 0;

  return (
    <div className="space-y-8 animate-fade-in pl-1 pr-1 pb-10">
      {/* Welcome Message Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-navy via-[#111e42] to-primary-navy rounded-3xl p-8 border border-white/5 shadow-lg shadow-primary-navy/10 flex items-center justify-between">
        <div className="relative z-10 space-y-2">
          <span className="px-3 py-1 bg-primary-sunset/15 text-primary-sunset text-[10px] font-bold rounded-full uppercase tracking-wider">
            Taekwondo Journey
          </span>
          <h2 className="text-2xl font-bold text-white font-athletic uppercase tracking-wider mt-2">
            Welcome Back, {stats.studentName || 'Student'}!
          </h2>
          <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
            Track your training attendance, review class schedules, and manage your subscription. Keep training hard!
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-12 pointer-events-none">
          <img src="/images/logo.png" alt="Highlanders Shield" className="h-32 object-contain" />
        </div>
      </div>

      {/* Belt Rank Progression Widget */}
      <div className="bg-white rounded-2xl border border-gray-150 p-6 md:p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Belt Progression Rank</h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">80% attendance criteria met for promotion test eligibility</p>
          </div>
          <span className="px-3.5 py-1.5 bg-[#E35E1C]/10 text-[#E35E1C] border border-[#E35E1C]/20 text-xs font-bold rounded-full uppercase tracking-wider flex items-center space-x-1.5">
            <Trophy className="w-3.5 h-3.5" />
            <span>{stats.currentRank}</span>
          </span>
        </div>

        {/* Visual Belt Strip & Progress */}
        <div className="space-y-4">
          <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div className="absolute top-0 bottom-0 left-0 bg-yellow-400 border-r-4 border-yellow-500" style={{ width: `${attendancePercent}%` }} />
            {/* Belt stripes for martial arts feel */}
            <div className="absolute top-0 bottom-0 left-[20%] w-1 bg-black/10" />
            <div className="absolute top-0 bottom-0 left-[40%] w-1 bg-black/10" />
            <div className="absolute top-0 bottom-0 left-[60%] w-1 bg-black/10" />
            <div className="absolute top-0 bottom-0 left-[80%] w-1 bg-yellow-600/30" />
          </div>

          <div className="flex justify-between items-center text-[11px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider py-1.5 leading-normal">
            <div className="flex items-center space-x-1 py-0.5">
              <span className="text-gray-400 font-medium">Current:</span>
              <span className="text-yellow-600">{stats.currentRank}</span>
            </div>
            <div className="text-slate-400 font-black py-0.5">
              {stats.attendedClasses} / {stats.totalClasses} Classes Completed
            </div>
            <div className="flex items-center space-x-1 py-0.5">
              <span className="text-gray-400 font-medium">Next:</span>
              <span className="text-emerald-600">{stats.nextRank}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Membership */}
        <div className="bg-white rounded-2xl border border-gray-150 p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-gray-200/20 hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5.5 h-5.5 text-emerald-500" />
            </div>
            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
              stats.membershipStatus === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500'
            }`}>
              {stats.membershipStatus}
            </span>
          </div>
          <div className="mt-5">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{stats.planName}</h3>
            <p className="text-gray-400 text-[11px] font-medium mt-1">Next Payment: {stats.nextPayment === 'N/A' ? 'N/A' : new Date(stats.nextPayment).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Classes Attendance */}
        <div className="bg-white rounded-2xl border border-gray-150 p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-gray-200/20 hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 bg-primary-wave/10 rounded-xl flex items-center justify-center">
              <Activity className="w-5.5 h-5.5 text-primary-wave" />
            </div>
            <span className="text-xs font-bold text-gray-500">{stats.attendedClasses} / {stats.totalClasses}</span>
          </div>
          <div className="mt-5">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">Class Attendance</h3>
            <p className="text-gray-400 text-[11px] font-medium mt-1">Training sessions this month</p>
          </div>
        </div>

        {/* Current Rank */}
        <div className="bg-white rounded-2xl border border-gray-150 p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-gray-200/20 hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center">
              <Trophy className="w-5.5 h-5.5 text-amber-500" />
            </div>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold rounded-full uppercase tracking-wider">Active</span>
          </div>
          <div className="mt-5">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{stats.currentRank}</h3>
            <p className="text-gray-400 text-[11px] font-medium mt-1">Next promotion rank: {stats.nextRank}</p>
          </div>
        </div>

        {/* Subscription Cost */}
        <div className="bg-white rounded-2xl border border-gray-150 p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-gray-200/20 hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5.5 h-5.5 text-purple-500" />
            </div>
            <span className="text-xs font-bold text-gray-500">Subscription</span>
          </div>
          <div className="mt-5">
            <h3 className="text-2xl font-black text-gray-900 leading-none mb-0.5">£{stats.monthlyFee}</h3>
            <p className="text-gray-400 text-[11px] font-medium">Standard Club membership fee</p>
          </div>
        </div>
      </div>

      {/* Recent & Upcoming Classes Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Classes */}
        <div className="bg-white rounded-2xl border border-gray-150 p-7 shadow-sm">
          <div className="flex items-center mb-6 border-b pb-4">
            <Clock className="w-5 h-5 mr-2 text-primary-sunset" />
            <h2 className="text-lg font-bold text-gray-900 tracking-wide uppercase font-athletic">Recent Classes</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4 last:border-b-0 last:pb-0">
              <div>
                <p className="font-bold text-gray-900 text-sm">Beginners Taekwondo</p>
                <div className="flex items-center text-xs text-gray-500 font-semibold space-x-2 mt-0.5">
                  <span>April 1, 2026</span>
                  <span>•</span>
                  <span>4:00 PM</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Attended
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-50 pb-4 last:border-b-0 last:pb-0">
              <div>
                <p className="font-bold text-gray-900 text-sm">Advanced Taekwondo</p>
                <div className="flex items-center text-xs text-gray-500 font-semibold space-x-2 mt-0.5">
                  <span>March 30, 2026</span>
                  <span>•</span>
                  <span>6:00 PM</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Attended
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-50 pb-4 last:border-b-0 last:pb-0">
              <div>
                <p className="font-bold text-gray-900 text-sm">Adult Fitness Taekwondo</p>
                <div className="flex items-center text-xs text-gray-500 font-semibold space-x-2 mt-0.5">
                  <span>March 28, 2026</span>
                  <span>•</span>
                  <span>8:00 PM</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Attended
              </span>
            </div>
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white rounded-2xl border border-gray-150 p-7 shadow-sm">
          <div className="flex items-center mb-6 border-b pb-4">
            <Calendar className="w-5 h-5 mr-2 text-primary-sunset" />
            <h2 className="text-lg font-bold text-gray-900 tracking-wide uppercase font-athletic">Upcoming Classes</h2>
          </div>

          <div className="space-y-4">
            {stats.upcomingClasses && stats.upcomingClasses.length > 0 ? (
              stats.upcomingClasses.map((cls) => (
                <div key={cls.id} className="flex justify-between items-center border-b border-slate-50 pb-4 last:border-b-0 last:pb-0">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{cls.name}</p>
                    <div className="flex items-center text-xs text-gray-500 font-semibold space-x-2 mt-0.5">
                      <span className="capitalize">{cls.days.join(', ')}</span>
                      <span>•</span>
                      <span>{cls.time}</span>
                      <span>•</span>
                      <span>{cls.category}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-primary-wave/10 text-primary-wave border border-primary-wave/20 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {cls.days[0] || 'Scheduled'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                <p className="text-xs text-gray-450 font-semibold">No visible training classes scheduled in database.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="bg-white rounded-2xl border border-gray-150 p-7 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 tracking-wide uppercase font-athletic mb-6 pb-4 border-b border-gray-100">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/student/subscription" className="p-6 border border-slate-150 rounded-2xl hover:shadow-xl hover:shadow-gray-200/30 hover:-translate-y-0.5 transition-all duration-300 text-left block group">
            <CreditCard className="w-7 h-7 text-primary-sunset mb-4 group-hover:scale-105 transition-transform duration-300" />
            <h3 className="font-bold text-gray-900 text-base">Manage Subscription</h3>
            <p className="text-xs text-gray-400 font-semibold mt-1 leading-relaxed">Update or change your membership plan and payment parameters.</p>
          </a>
          
          <a href="/student/profile" className="p-6 border border-slate-150 rounded-2xl hover:shadow-xl hover:shadow-gray-200/30 hover:-translate-y-0.5 transition-all duration-300 text-left block group">
            <User className="w-7 h-7 text-primary-sunset mb-4 group-hover:scale-105 transition-transform duration-300" />
            <h3 className="font-bold text-gray-900 text-base">Update Profile</h3>
            <p className="text-xs text-gray-400 font-semibold mt-1 leading-relaxed">Edit your personal contact info, guardian info and medical details.</p>
          </a>
          
          <a href="/student" className="p-6 border border-slate-150 rounded-2xl hover:shadow-xl hover:shadow-gray-200/30 hover:-translate-y-0.5 transition-all duration-300 text-left block group">
            <Calendar className="w-7 h-7 text-primary-sunset mb-4 group-hover:scale-105 transition-transform duration-300" />
            <h3 className="font-bold text-gray-900 text-base">View Schedule</h3>
            <p className="text-xs text-gray-400 font-semibold mt-1 leading-relaxed">See upcoming training schedules, events and logs of class attendance.</p>
          </a>
        </div>
      </div>
    </div>
  );
}
