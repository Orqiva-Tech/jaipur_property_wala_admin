import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  FileText,
  Image,
  BookOpen,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Globe2,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { adminUser, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Properties', path: '/properties', icon: Building2, badge: 'Inventory' },
    { name: 'Locations & Hubs', path: '/locations', icon: MapPin, badge: 'Cities' },
    { name: 'Leads & Enquiries', path: '/leads', icon: Users },
    { name: 'Media Gallery', path: '/gallery', icon: Image },
    { name: 'Careers & Vacancies', path: '/careers', icon: Briefcase },
    { name: 'Job Applications', path: '/applications', icon: FileText },
    { name: 'Blog Articles', path: '/blogs', icon: BookOpen },
    { name: 'Platform Settings', path: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path || (path === '/dashboard' && location.pathname === '/');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 antialiased">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col justify-between shadow-xs">
        <div>
          {/* Logo & Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900 tracking-tight block">
                  Jaipur Property Wala
                </span>
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  <span>Admin Console</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Active Cities Indicator Strip */}
          <div className="mx-3 my-2.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center space-x-1.5 font-medium">
              <Globe2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Markets:</span>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-700">
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">Jaipur</span>
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">Ajmer</span>
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">Mumbai</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${active
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${active
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">


          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
            <a
              href={import.meta.env.VITE_PUBLIC_WEBSITE_URL || 'https://property.dobhi.in'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 shadow-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Live Site</span>
            </a>
            <button
              onClick={logout}
              className="flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-white hover:bg-red-50 text-red-600 text-xs font-medium border border-red-200 shadow-xs transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen bg-slate-50">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 tracking-tight block">
                Admin Management Console
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Direct management for properties, enquiries, candidates, and market listings
              </span>
            </div>
          </div>


        </header>

        {/* Dynamic Route Content */}
        <div className="p-6 sm:p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
