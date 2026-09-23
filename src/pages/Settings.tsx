import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2, ShieldCheck, Phone, MapPin, Mail, Clock } from 'lucide-react';
import { adminService } from '../services/api';
import { WebsiteSettings } from '../types';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await adminService.getSettings();
        setSettings(res.data.data);
      } catch (err) {
        console.error('Error fetching settings', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSuccess(false);

    try {
      await adminService.updateSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings', err);
      alert('Error updating website settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="p-8 bg-[#0c1a13] rounded-2xl border border-gold-500/20 animate-pulse">
        <div className="h-8 bg-[#152e22] rounded w-1/4 mb-4" />
        <div className="h-4 bg-[#152e22] rounded w-1/2" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0c1c15] via-[#122b20] to-[#091710] p-6 sm:p-7 rounded-2xl border border-gold-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-white tracking-wide">
            Platform Settings & Office Data
          </h1>
          <p className="text-xs text-stone-300">
            Control phone numbers, office timings, corporate address, and header statistics across all public pages.
          </p>
        </div>

        {success && (
          <div className="px-4 py-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Info Card */}
        <div className="bg-[#0c1a13] p-6 rounded-2xl border border-gold-500/20 shadow-xl space-y-4">
          <h3 className="text-base font-bold font-editorial text-gold-300 border-b border-gold-500/20 pb-3">
            Primary Helpline & Communications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Helpline Phone *</label>
              <input
                type="text"
                required
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">WhatsApp Direct *</label>
              <input
                type="text"
                required
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Official Email *</label>
              <input
                type="email"
                required
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Office Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Office Timings</label>
              <input
                type="text"
                value={settings.officeTimings}
                onChange={(e) => setSettings({ ...settings, officeTimings: e.target.value })}
                className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Corporate Trust Statistics */}
        <div className="bg-[#0c1a13] p-6 rounded-2xl border border-gold-500/20 shadow-xl space-y-4">
          <h3 className="text-base font-bold font-editorial text-gold-300 border-b border-gold-500/20 pb-3">
            Public Website Trust Statistics (Counter Bar)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Years Experience</label>
              <input
                type="text"
                value={settings.stats.yearsExperience}
                onChange={(e) => setSettings({
                  ...settings,
                  stats: { ...settings.stats, yearsExperience: e.target.value }
                })}
                className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Satisfied Families</label>
              <input
                type="text"
                value={settings.stats.satisfiedClients}
                onChange={(e) => setSettings({
                  ...settings,
                  stats: { ...settings.stats, satisfiedClients: e.target.value }
                })}
                className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">JDA Plots Handed</label>
              <input
                type="text"
                value={settings.stats.jdaPlotsSold}
                onChange={(e) => setSettings({
                  ...settings,
                  stats: { ...settings.stats, jdaPlotsSold: e.target.value }
                })}
                className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Bank Loan Ratio</label>
              <input
                type="text"
                value={settings.stats.bankLoanApproval}
                onChange={(e) => setSettings({
                  ...settings,
                  stats: { ...settings.stats, bankLoanApproval: e.target.value }
                })}
                className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 via-gold-600 to-amber-600 text-forest-950 font-extrabold text-xs uppercase tracking-wider shadow-lg hover:shadow-gold-500/20 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Update Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
