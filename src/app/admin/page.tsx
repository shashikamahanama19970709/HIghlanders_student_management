'use client';

import { useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalMembers: number;
  activeClasses: number;
  pendingApplications: number;
  monthlyRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeClasses: 0,
    pendingApplications: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        // Mock data for now
        setStats({
          totalMembers: 156,
          activeClasses: 12,
          pendingApplications: 8,
          monthlyRevenue: 15600,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Members',
      value: stats.totalMembers,
      icon: Users,
      iconColor: 'text-primary-wave',
      iconBg: 'bg-primary-wave/10',
      change: '+12% this month',
      changeType: 'positive',
    },
    {
      title: 'Active Classes',
      value: stats.activeClasses,
      icon: Calendar,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-50',
      change: '+2 new this week',
      changeType: 'positive',
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications,
      icon: TrendingUp,
      iconColor: 'text-primary-sunset',
      iconBg: 'bg-primary-sunset/10',
      change: '8 applications',
      changeType: 'warning',
    },
    {
      title: 'Monthly Revenue',
      value: `£${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-50',
      change: '+8% vs last month',
      changeType: 'positive',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-sunset"></div>
        <div className="ml-3 text-sm font-semibold text-slate-500">Loading dashboard data...</div>
      </div>
    );
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
            <div className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm">
                  JS
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">John Smith</p>
                  <p className="text-xs text-gray-500 font-medium">Beginners Taekwondo</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">2 hours ago</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Pending
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm">
                  SJ
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Sarah Johnson</p>
                  <p className="text-xs text-gray-500 font-medium">Advanced Taekwondo</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">5 hours ago</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Pending
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm">
                  MW
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Mike Wilson</p>
                  <p className="text-xs text-gray-500 font-medium">Adult Fitness Taekwondo</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">1 day ago</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Approved
              </span>
            </div>
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white rounded-2xl border border-gray-150 p-7 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900 tracking-wide uppercase font-athletic">Today's Classes</h2>
            <a href="/admin/classes" className="text-xs font-bold text-primary-wave hover:text-primary-sunset transition-colors">View Schedule</a>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-b-0 last:pb-0">
              <div className="space-y-1">
                <p className="font-bold text-gray-900 text-sm">Beginners Taekwondo</p>
                <div className="flex items-center text-xs text-gray-500 font-semibold space-x-3">
                  <span>4:00 PM - 5:30 PM</span>
                  <span>•</span>
                  <span>15 enrolled</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-primary-wave/10 text-primary-wave border border-primary-wave/20 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Today
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-b-0 last:pb-0">
              <div className="space-y-1">
                <p className="font-bold text-gray-900 text-sm">Advanced Taekwondo</p>
                <div className="flex items-center text-xs text-gray-500 font-semibold space-x-3">
                  <span>6:00 PM - 8:00 PM</span>
                  <span>•</span>
                  <span>12 enrolled</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-primary-wave/10 text-primary-wave border border-primary-wave/20 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Today
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-b-0 last:pb-0">
              <div className="space-y-1">
                <p className="font-bold text-gray-900 text-sm">Adult Fitness Taekwondo</p>
                <div className="flex items-center text-xs text-gray-500 font-semibold space-x-3">
                  <span>8:00 PM - 9:30 PM</span>
                  <span>•</span>
                  <span>8 enrolled</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-primary-wave/10 text-primary-wave border border-primary-wave/20 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Today
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
