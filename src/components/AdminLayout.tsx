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
  Compass,
  Globe2,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { adminUser, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Property Inventory', path: '/properties', icon: Building2, badge: 'Multi-City' },
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
    <div className="min-h-screen bg-[#07120e] flex flex-col md:flex-row font-sans text-stone-200">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-gradient-to-b from-[#06110c] via-[#091811] to-[#040b07] text-white flex-shrink-0 flex flex-col justify-between border-r border-gold-500/20 shadow-2xl">
        <div>
          {/* Logo & Header */}
          <div className="p-6 border-b border-gold-500/20 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-amber-600 flex items-center justify-center text-forest-950 font-bold shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-extrabold text-sm font-editorial text-gold-300 tracking-wider block">
                  JAIPUR PROPERTY WALA
                </span>
                <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  <span>Executive ERP Portal</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Active Cities Indicator Strip */}
          <div className="mx-4 my-3 px-3 py-2 rounded-xl bg-[#0e241a]/90 border border-gold-500/20 flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-1.5 text-stone-300 font-semibold">
              <Globe2 className="w-3.5 h-3.5 text-gold-400" />
              <span>Active Markets</span>
            </div>
            <div className="flex items-center space-x-1 text-[10px] font-bold">
              <span className="text-amber-400">JAI</span> •
              <span className="text-emerald-400">AJM</span> •
              <span className="text-cyan-400">KSG</span> •
              <span className="text-purple-400">BOM</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                    active
                      ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-forest-950 shadow-lg shadow-gold-500/20 font-extrabold'
                      : 'text-stone-300 hover:bg-[#11291d] hover:text-gold-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-forest-950 stroke-[2.5]' : 'text-gold-400/80'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-black ${
                      active ? 'bg-forest-950 text-gold-300' : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Footer */}
        <div className="p-4 border-t border-gold-500/20 space-y-3 bg-[#050e0a]">
          <div className="flex items-center justify-between px-2 text-xs">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Super Administrator</span>
              <span className="font-bold text-gold-300 truncate max-w-[150px] block text-xs">
                {adminUser?.email || 'admin@jaipurpropertywala.in'}
              </span>
            </div>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              {adminUser?.role || 'Root'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
            <a
              href="http://localhost:5180"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-[#11291d] hover:bg-[#183929] text-stone-200 hover:text-gold-300 text-[11px] font-bold border border-gold-500/20 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
              <span>Live Site</span>
            </a>
            <button
              onClick={logout}
              className="flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/80 text-red-300 hover:text-white text-[11px] font-bold border border-red-500/30 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen bg-[#07130e]">
        {/* Luxury Top Bar */}
        <header className="bg-[#091811] border-b border-gold-500/20 px-6 py-4 flex items-center justify-between shadow-xl sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-gold-300 tracking-wider uppercase block">
                Executive Command Center
              </span>
              <span className="text-[11px] text-stone-400">
                Multi-City Property Management ERP • Jaipur, Ajmer, Kishangarh, Mumbai
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 bg-[#050e0a] border border-gold-500/20 px-3 py-1.5 rounded-lg text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-stone-300 font-mono text-[11px]">API Port 5050 Online</span>
            </div>
            <a
              href="http://localhost:5180"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-gold-500 to-amber-600 text-forest-950 text-xs font-bold flex items-center space-x-1 shadow hover:scale-105 transition-transform"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Public Website</span>
            </a>
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
