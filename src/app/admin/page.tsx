'use client';

import { useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, TrendingUp, Clock, FileText } from 'lucide-react';
import LoadingOverlay from '@/components/LoadingOverlay';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalMembers: number;
  activeClasses: number;
  pendingApplications: number;
  monthlyRevenue: number;
}

interface RecentApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  selectedClass: string;
  status: string;
  createdAt: string;
}

interface TodayClass {
  id: string;
  name: string;
  schedule: any;
  currentEnrollment: number;
  maxCapacity: number;
  ageCategory: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeClasses: 0,
    pendingApplications: 0,
    monthlyRevenue: 0,
  });
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [todaysClasses, setTodaysClasses] = useState<TodayClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/admin/dashboard', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        const data = await res.json();
        if (data.success) {
          setStats({
            totalMembers: data.data.totalMembers,
            activeClasses: data.data.activeClasses,
            pendingApplications: data.data.pendingApplications,
            monthlyRevenue: data.data.monthlyRevenue,
          });
          setRecentApplications(data.data.recentApplications || []);
          setTodaysClasses(data.data.todaysClasses || []);
        } else {
          toast.error('Failed to load dashboard data');
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
        toast.error('Network error loading dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Helper to get initials
  const getInitials = (first: string, last: string) => {
    return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
  };

  // Helper to format relative time
  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Helper to extract time from schedule
  const getScheduleTime = (schedule: any) => {
    if (typeof schedule === 'string') {
      // Try to extract time portion like "4:00 PM - 5:30 PM"
      const timeMatch = schedule.match(/\d{1,2}:\d{2}\s*(?:AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM)/i);
      return timeMatch ? timeMatch[0] : schedule;
    }
    if (schedule?.time) return schedule.time;
    if (schedule?.startTime && schedule?.endTime) return `${schedule.startTime} - ${schedule.endTime}`;
    return 'Time TBD';
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const statCards = [
    {
      title: 'Total Members',
      value: stats.totalMembers,
      icon: Users,
      iconColor: 'text-primary-wave',
      iconBg: 'bg-primary-wave/10',
      change: `${stats.totalMembers} registered`,
      changeType: 'positive',
    },
    {
      title: 'Active Classes',
      value: stats.activeClasses,
      icon: Calendar,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-50',
      change: `${stats.activeClasses} running`,
      changeType: 'positive',
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications,
      icon: TrendingUp,
      iconColor: 'text-primary-sunset',
      iconBg: 'bg-primary-sunset/10',
      change: `${stats.pendingApplications} to review`,
      changeType: stats.pendingApplications > 0 ? 'warning' : 'positive',
    },
    {
      title: 'Monthly Revenue',
      value: `£${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-50',
      change: new Date().toLocaleString('default', { month: 'long' }),
      changeType: 'positive',
    },
  ];

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-navy via-[#111e42] to-primary-navy rounded-3xl p-8 border border-white/5 shadow-lg shadow-primary-navy/10 flex items-center justify-between">
        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl font-bold text-white font-athletic uppercase tracking-wider">Welcome Back, Master!</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Monitor registration trends, update training schedules, and review pending student onboarding requests.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-12 pointer-events-none">
          <img src="/images/logo.png" alt="Highlanders shield" className="h-32 object-contain" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl border border-gray-150 p-6 hover:shadow-xl hover:shadow-gray-200/20 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className={`w-11 h-11 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-5.5 h-5.5 ${stat.iconColor}`} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                stat.changeType === 'positive' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                stat.changeType === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                'bg-slate-50 text-slate-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="mt-5">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1.5">{stat.value}</h3>
              <p className="text-gray-500 font-semibold text-xs uppercase tracking-wide">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-gray-150 p-7 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900 tracking-wide uppercase font-athletic">Recent Applications</h2>
            <a href="/admin/members" className="text-xs font-bold text-primary-wave hover:text-primary-sunset transition-colors">View All</a>
          </div>
          
          <div className="space-y-4">
            {recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-400">No applications yet</p>
                <p className="text-xs text-gray-400 mt-1">New applications will appear here</p>
              </div>
            ) : (
              recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm">
                      {getInitials(app.firstName, app.lastName)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{app.firstName} {app.lastName}</p>
                      <p className="text-xs text-gray-500 font-medium">{app.selectedClass}</p>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{getRelativeTime(app.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 border text-[10px] font-bold rounded-full uppercase tracking-wider ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Classes */}
        <div className="bg-white rounded-2xl border border-gray-150 p-7 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900 tracking-wide uppercase font-athletic">Today&apos;s Classes</h2>
            <a href="/admin/classes" className="text-xs font-bold text-primary-wave hover:text-primary-sunset transition-colors">View Schedule</a>
          </div>

          <div className="space-y-4">
            {todaysClasses.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-400">No classes today</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date().toLocaleDateString(undefined, { weekday: 'long' })} — check the schedule for upcoming classes
                </p>
              </div>
            ) : (
              todaysClasses.map((cls) => (
                <div key={cls.id} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-b-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900 text-sm">{cls.name}</p>
                    <div className="flex items-center text-xs text-gray-500 font-semibold space-x-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getScheduleTime(cls.schedule)}
                      </span>
                      <span>•</span>
                      <span>{cls.currentEnrollment}{cls.maxCapacity ? `/${cls.maxCapacity}` : ''} enrolled</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-primary-wave/10 text-primary-wave border border-primary-wave/20 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Today
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
