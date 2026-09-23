import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
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
    <div className="min-h-screen bg-[#050e0a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#0c1c15]/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-gold-500/40 space-y-6">
        
        {/* Brand Crest */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-amber-600 text-forest-950 flex items-center justify-center mx-auto shadow-xl shadow-gold-500/20 border border-gold-300">
            <Compass className="w-9 h-9 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-bold font-editorial text-gold-300 tracking-wide">
            JAIPUR PROPERTY WALA
          </h2>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] uppercase tracking-widest text-emerald-300 font-extrabold">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
            <span>Executive ERP Gateway</span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-950/80 text-red-300 rounded-xl text-xs flex items-center space-x-2 border border-red-500/50">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gold-300 mb-1">
              Executive Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gold-400/60 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jaipurpropertywala.in"
                className="w-full pl-9 pr-3 py-2.5 bg-[#06110c] border border-gold-500/30 focus:border-gold-500 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gold-300 mb-1">
              Secure Passkey
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gold-400/60 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-[#06110c] border border-gold-500/30 focus:border-gold-500 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 via-gold-600 to-amber-600 text-forest-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-gold-500/20 hover:scale-[1.01] transition-all flex items-center justify-center space-x-2 border border-gold-300"
          >
            {loading ? (
              <span>Verifying Authority...</span>
            ) : (
              <>
                <span>Enter Command Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Credentials Notice Box */}
        <div className="p-3.5 bg-[#07130e] border border-gold-500/20 rounded-xl text-center space-y-1">
          <div className="flex items-center justify-center space-x-1 text-[11px] font-bold text-gold-400">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Master Access Credentials</span>
          </div>
          <span className="text-[11px] text-stone-300 block">
            Email: <code className="font-mono text-emerald-400">admin@jaipurpropertywala.in</code>
          </span>
          <span className="text-[11px] text-stone-300 block">
            Password: <code className="font-mono text-emerald-400">Admin@JaipurPropertyWala2026</code>
          </span>
        </div>

        <div className="text-center pt-1">
          <a
            href="http://localhost:5180"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-stone-400 hover:text-gold-300 transition-colors"
          >
            ← View Public Client Website (Port 5180)
          </a>
        </div>

      </div>
    </div>
  );
};
