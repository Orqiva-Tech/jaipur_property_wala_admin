import React, { useState, useEffect } from 'react';
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
  MapPin,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === '/dashboard' && location.pathname === '/') ||
    (path === '/leads' && location.pathname.startsWith('/leads'));

  const renderNavLinks = () => (
    <nav className="p-3 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        return (
          <Link
            key={item.name}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              active
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
                className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                  active
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
  );

  const renderSidebarFooter = () => (
    <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
      <div className="grid grid-cols-2 gap-2 pt-1">
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
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col">
      {/* ================= MOBILE TOP HEADER (< md) ================= */}
      <header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>

          <Link to="/dashboard" className="flex items-center space-x-2.5">
            <img
              src="/logo.png"
              alt="Jaipur Property Wala Logo"
              className="w-8 h-8 rounded-full border border-slate-300 object-cover"
            />
            <div>
              <span className="font-bold text-xs text-slate-900 tracking-tight block leading-tight">
                Jaipur Property Wala
              </span>
              <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                <span>Admin Console</span>
              </span>
            </div>
          </Link>
        </div>

        <a
          href={import.meta.env.VITE_PUBLIC_WEBSITE_URL || 'https://property.dobhi.in'}
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="Visit Live Public Website"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </header>

      {/* ================= MOBILE DRAWER BACKDROP & PANEL (< md) ================= */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-2.5"
            >
              <img
                src="/logo.png"
                alt="Jaipur Property Wala Logo"
                className="w-9 h-9 rounded-full border border-slate-300 object-cover"
              />
              <div>
                <span className="font-bold text-xs text-slate-900 tracking-tight block">
                  Jaipur Property Wala
                </span>
                <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Admin Console</span>
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Cities Indicator Strip */}
          <div className="mx-3 my-2.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center space-x-1.5 font-medium">
              <Globe2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Markets:</span>
            </div>
            <div className="flex items-center space-x-1 text-[10px] font-semibold text-slate-700">
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">Jaipur</span>
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">Ajmer</span>
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">Mumbai</span>
            </div>
          </div>

          {/* Nav items */}
          {renderNavLinks()}
        </div>

        {/* Drawer Footer */}
        {renderSidebarFooter()}
      </aside>

      {/* ================= DESKTOP SIDEBAR (>= md) ================= */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-slate-200 z-30 justify-between shadow-xs">
        <div>
          {/* Logo & Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <img
                src="/logo.png"
                alt="Jaipur Property Wala Logo"
                className="w-10 h-10 rounded-full border border-slate-300 shadow-xs object-cover group-hover:scale-105 transition-transform"
              />
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
          {renderNavLinks()}
        </div>

        {/* Desktop Sidebar Footer */}
        {renderSidebarFooter()}
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 flex flex-col min-w-0 md:pl-64 min-h-screen bg-slate-50">
        {/* Desktop Top Bar */}
        <header className="hidden md:flex bg-white border-b border-slate-200 px-6 py-3.5 items-center justify-between shadow-xs sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 tracking-tight block">
                Admin Management Console
              </span>
              <span className="text-[11px] text-slate-500">
                Direct management for properties, enquiries, candidates, and market listings
              </span>
            </div>
          </div>

          <a
            href={import.meta.env.VITE_PUBLIC_WEBSITE_URL || 'https://property.dobhi.in'}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Visit Live Site</span>
          </a>
        </header>

        {/* Dynamic Route Content */}
        <div className="p-3.5 sm:p-6 lg:p-8 flex-1 max-w-full overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
