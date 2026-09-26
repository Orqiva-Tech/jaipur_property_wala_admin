import React, { useEffect, useState, useRef } from 'react';
import { Save, CheckCircle2, Phone, MapPin, Mail, Upload, Loader2, Share2 } from 'lucide-react';
import { adminService, propertyService } from '../services/api';
import { WebsiteSettings } from '../types';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;
    setUploadingLogo(true);
    setLogoError(null);
    try {
      const res = await propertyService.uploadFile(file);
      if (res.data?.url) {
        setSettings({ ...settings, logoUrl: res.data.url });
      } else {
        throw new Error('Upload failed');
      }
    } catch (err: any) {
      console.error('Error uploading logo', err);
      setLogoError(err.response?.data?.message || 'Failed to upload logo from your device');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

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
      <div className="p-8 bg-white rounded-xl border border-slate-200 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-4" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
      </div>
    );
  }

  return (
    <div className="space-y-6 antialiased">
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              System Configuration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Platform Settings & Office Data
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Configure contact helplines, official addresses, business hours, and trust badges displayed across all public website pages.
          </p>
        </div>

        {success && (
          <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand & Logo Card */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center justify-between">
            <span>Brand Identity & Logo</span>
            <span className="text-[11px] font-normal text-slate-500">Stored on Cloudinary CDN</span>
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <img 
                src={settings.logoUrl || '/logo.png'} 
                alt="Brand Logo" 
                className="w-20 h-20 rounded-full border-2 border-slate-300 shadow-md object-cover flex-shrink-0 bg-white"
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
              >
                <Upload className="w-4 h-4 mb-0.5" />
                <span>Change</span>
              </button>
            </div>

            <div className="flex-1 w-full space-y-2">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors flex items-center space-x-1.5 shadow-2xs"
                >
                  {uploadingLogo ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading Logo from Device...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Logo from Computer / Phone</span>
                    </>
                  )}
                </button>
              </div>

              {logoError && (
                <p className="text-xs text-red-600 font-medium">{logoError}</p>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Logo URL (Cloudinary)</label>
                <input
                  type="text"
                  value={settings.logoUrl || ''}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500">This logo appears in the public website header, mobile menu, footer, and admin console.</p>
            </div>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
            Primary Helpline & Communications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Helpline Phone *</label>
              <input
                type="text"
                required
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Direct *</label>
              <input
                type="text"
                required
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email *</label>
              <input
                type="email"
                required
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Office Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Office Timings</label>
              <input
                type="text"
                value={settings.officeTimings}
                onChange={(e) => setSettings({ ...settings, officeTimings: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Corporate Trust Statistics */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
            Public Website Trust Statistics (Counter Bar)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Years Experience</label>
              <input
                type="text"
                value={settings.stats.yearsExperience}
                onChange={(e) => setSettings({
                  ...settings,
                  stats: { ...settings.stats, yearsExperience: e.target.value }
                })}
                className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Satisfied Families</label>
              <input
                type="text"
                value={settings.stats.satisfiedClients}
                onChange={(e) => setSettings({
                  ...settings,
                  stats: { ...settings.stats, satisfiedClients: e.target.value }
                })}
                className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">JDA Plots Handed</label>
              <input
                type="text"
                value={settings.stats.jdaPlotsSold}
                onChange={(e) => setSettings({
                  ...settings,
                  stats: { ...settings.stats, jdaPlotsSold: e.target.value }
                })}
                className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Loan Ratio</label>
              <input
                type="text"
                value={settings.stats.bankLoanApproval}
                onChange={(e) => setSettings({
                  ...settings,
                  stats: { ...settings.stats, bankLoanApproval: e.target.value }
                })}
                className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links Card */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-blue-600" />
            Social Media Links (Footer Icons)
          </h3>
          <p className="text-[11px] text-slate-500 -mt-2">
            These links appear on the public website footer social media icons. Enter the full URL including https://.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Facebook */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-600 inline-flex items-center justify-center">
                  <i className="fa-brands fa-facebook-f text-white text-[9px]" />
                </span>
                Facebook Page URL
              </label>
              <input
                type="url"
                value={settings.socialLinks?.facebook || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, facebook: e.target.value }
                })}
                placeholder="https://facebook.com/yourpage"
                className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 inline-flex items-center justify-center">
                  <i className="fa-brands fa-instagram text-white text-[9px]" />
                </span>
                Instagram Profile URL
              </label>
              <input
                type="url"
                value={settings.socialLinks?.instagram || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, instagram: e.target.value }
                })}
                placeholder="https://instagram.com/yourprofile"
                className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
              />
            </div>

            {/* YouTube */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-red-600 inline-flex items-center justify-center">
                  <i className="fa-brands fa-youtube text-white text-[9px]" />
                </span>
                YouTube Channel URL
              </label>
              <input
                type="url"
                value={settings.socialLinks?.youtube || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, youtube: e.target.value }
                })}
                placeholder="https://youtube.com/@yourchannel"
                className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-700 inline-flex items-center justify-center">
                  <i className="fa-brands fa-linkedin-in text-white text-[9px]" />
                </span>
                LinkedIn Page URL
              </label>
              <input
                type="url"
                value={settings.socialLinks?.linkedin || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, linkedin: e.target.value }
                })}
                placeholder="https://linkedin.com/company/yourcompany"
                className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
              />
            </div>
          </div>

          {/* Live Preview */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-500 mb-2 font-semibold">Live Preview (Footer Icons):</p>
            <div className="flex items-center gap-2">
              <a href={settings.socialLinks?.facebook || '#'} target="_blank" rel="noreferrer"
                className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white hover:scale-110 transition-transform" title="Facebook">
                <i className="fa-brands fa-facebook-f text-xs text-white" />
              </a>
              <a href={settings.socialLinks?.instagram || '#'} target="_blank" rel="noreferrer"
                className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white hover:scale-110 transition-transform" title="Instagram">
                <i className="fa-brands fa-instagram text-xs text-white" />
              </a>
              <a href={settings.socialLinks?.youtube || '#'} target="_blank" rel="noreferrer"
                className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white hover:scale-110 transition-transform" title="YouTube">
                <i className="fa-brands fa-youtube text-xs text-white" />
              </a>
              <a href={settings.socialLinks?.linkedin || '#'} target="_blank" rel="noreferrer"
                className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-white hover:scale-110 transition-transform" title="LinkedIn">
                <i className="fa-brands fa-linkedin-in text-xs text-white" />
              </a>
              <span className="text-[10px] text-slate-400 ml-1">← Click to test links</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Update Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
