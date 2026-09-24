import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@jaipurpropertywala.in');
  const [password, setPassword] = useState('Admin@JaipurPropertyWala2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await adminService.login({ email, password });
      login(res.data.token, res.data.admin);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials or server error. Please verify email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800 antialiased">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-10 space-y-6">
        
        {/* Brand Crest */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Jaipur Property Wala
          </h2>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Admin Management Console</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center space-x-2 border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jaipurpropertywala.in"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-xs"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Credentials Notice Box */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-1">
          <div className="flex items-center justify-center space-x-1 text-xs font-semibold text-slate-700">
            <KeyRound className="w-3.5 h-3.5 text-blue-600" />
            <span>Master Access Credentials</span>
          </div>
          <span className="text-[11px] text-slate-600 block">
            Email: <code className="font-mono text-slate-900 font-semibold">admin@jaipurpropertywala.in</code>
          </span>
          <span className="text-[11px] text-slate-600 block">
            Password: <code className="font-mono text-slate-900 font-semibold">Admin@JaipurPropertyWala2026</code>
          </span>
        </div>

        <div className="text-center pt-1">
          <a
            href={import.meta.env.VITE_PUBLIC_WEBSITE_URL || 'https://property.dobhi.in'}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            &larr; View Public Website
          </a>
        </div>

      </div>
    </div>
  );
};
