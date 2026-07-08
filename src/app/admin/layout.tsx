'use client';

import { Home, Calendar, Users, Shield, Settings, Mail, LogOut, ShieldAlert, CreditCard } from 'lucide-react';
import { redirect, usePathname } from 'next/navigation';
import { logout } from '@/utils/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Classes', href: '/admin/classes', icon: Calendar },
    { name: 'Members', href: '/admin/members', icon: Users },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'Masters', href: '/admin/masters', icon: Shield },
    { name: 'Inquiries', href: '/admin/inquiries', icon: Mail },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="h-screen bg-slate-50/50 flex flex-col font-sans">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-68 bg-gradient-to-b from-[#0A1128] to-[#101b3f] text-white min-h-full flex-shrink-0 flex flex-col border-r border-white/5">
          {/* Sidebar Header / Logo */}
          <div className="p-6 border-b border-white/5 flex items-center space-x-3.5">
            <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center p-1.5 shadow-inner">
              <img 
                src="/images/logo.png" 
                alt="Highlanders logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-[14px] font-black tracking-widest uppercase leading-none text-white">
                Highlanders
              </h1>
              <span className="text-[9px] text-primary-wave font-bold uppercase tracking-widest mt-0.5 inline-block">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-sunset/15 to-primary-sunset/5 border border-primary-sunset/30 text-white shadow-lg shadow-primary-sunset/5'
                      : 'text-white/70 hover:bg-white/5 hover:text-white hover:border-white/5 border border-transparent'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3.5 transition-transform duration-300 group-hover:scale-105 ${
                    isActive ? 'text-primary-sunset' : 'text-white/50 group-hover:text-white'
                  }`} />
                  <span className="text-[14px]">{item.name}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-sunset ml-auto" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="p-5 border-t border-white/5 bg-black/10 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 bg-primary-sunset/10 border border-primary-sunset/20 rounded-full flex items-center justify-center text-primary-sunset text-sm font-bold shadow-sm">
                A
              </div>
              <div className="leading-tight">
                <p className="text-xs font-semibold text-white">Admin User</p>
                <span className="text-[9px] text-gray-400">System Admin</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-gray-100/80 px-8 py-4.5 flex-shrink-0 flex items-center justify-between shadow-sm shadow-gray-100/10">
            <h2 className="text-lg font-bold text-gray-900 tracking-wide">
              {navItems.find(n => n.href === pathname)?.name || 'Admin Dashboard'}
            </h2>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-slate-100 rounded-xl border border-slate-200/50">
                <ShieldAlert className="w-4 h-4 text-primary-wave" />
                <span className="text-xs font-semibold text-slate-600">Production Mode</span>
              </div>
              <button 
                onClick={logout}
                className="flex items-center space-x-2 px-4.5 py-2 border border-red-100 text-red-500 font-semibold rounded-xl text-xs hover:bg-red-50 hover:border-red-200 transition-all duration-200 shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </header>
          
          {/* Dynamic Content */}
          <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50 relative">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-100 px-8 py-4 flex-shrink-0 flex items-center justify-between text-xs text-gray-500 font-medium">
            <p>&copy; {new Date().getFullYear()} Highlanders Amateur Taekwondo CIC. All rights reserved.</p>
            <p className="text-gray-400">Powered by FlexNode Solutions</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
