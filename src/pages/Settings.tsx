import React, { useEffect, useState, useRef } from 'react';
import { Save, CheckCircle2, Phone, MapPin, Mail, Upload, Loader2, Share2, KeyRound, Lock, Eye, EyeOff, AlertCircle, Image as ImageIcon, Video, Sparkles, Sliders } from 'lucide-react';
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

  // Hero Media State & Upload Refs
  const [uploadingHeroImg, setUploadingHeroImg] = useState<number | null>(null);
  const [uploadingHeroVideo, setUploadingHeroVideo] = useState(false);
  const heroImageInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];
  const heroVideoInputRef = useRef<HTMLInputElement>(null);

  // Security / Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

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

  const handleHeroImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;
    setUploadingHeroImg(index);
    try {
      const res = await propertyService.uploadFile(file);
      if (res.data?.url) {
        const curHero = settings.hero || {
          mediaType: 'images',
          images: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=85',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85'
          ],
          videoUrl: '',
          badge: '100% JDA & RERA Approved Residential & Commercial Plots',
          title: 'Discover Verified JDA Approved Plots in Jaipur',
          subtitle: 'Buy residential and commercial plots starting from ₹15 Lakhs with spot registry and 80% pre-approved bank loans. Prime schemes in Jagatpura, Mahindra SEZ, Tonk Road & Ajmer Expressway.'
        };
        const updatedImages = [...(curHero.images || ['', '', ''])];
        while (updatedImages.length < 3) updatedImages.push('');
        updatedImages[index] = res.data.url;
        setSettings({
          ...settings,
          hero: {
            ...curHero,
            images: updatedImages
          }
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (err: any) {
      console.error('Error uploading hero image', err);
      alert('Failed to upload hero image: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingHeroImg(null);
      if (heroImageInputRefs[index].current) {
        heroImageInputRefs[index].current!.value = '';
      }
    }
  };

  const handleHeroVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;
    setUploadingHeroVideo(true);
    try {
      const res = await propertyService.uploadFile(file);
      if (res.data?.url) {
        const curHero = settings.hero || {
          mediaType: 'video',
          images: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=85',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85'
          ],
          videoUrl: '',
          badge: '100% JDA & RERA Approved Residential & Commercial Plots',
          title: 'Discover Verified JDA Approved Plots in Jaipur',
          subtitle: 'Buy residential and commercial plots starting from ₹15 Lakhs with spot registry and 80% pre-approved bank loans. Prime schemes in Jagatpura, Mahindra SEZ, Tonk Road & Ajmer Expressway.'
        };
        setSettings({
          ...settings,
          hero: {
            ...curHero,
            videoUrl: res.data.url
          }
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (err: any) {
      console.error('Error uploading hero video', err);
      alert('Failed to upload hero video: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingHeroVideo(false);
      if (heroVideoInputRef.current) heroVideoInputRef.current.value = '';
    }
  };

  const updateHeroField = (field: string, value: any) => {
    if (!settings) return;
    const curHero = settings.hero || {
      mediaType: 'images',
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85'
      ],
      videoUrl: '',
      badge: '100% JDA & RERA Approved Residential & Commercial Plots',
      title: 'Discover Verified JDA Approved Plots in Jaipur',
      subtitle: 'Buy residential and commercial plots starting from ₹15 Lakhs with spot registry and 80% pre-approved bank loans. Prime schemes in Jagatpura, Mahindra SEZ, Tonk Road & Ajmer Expressway.'
    };
    setSettings({
      ...settings,
      hero: {
        ...curHero,
        [field]: value
      }
    });
  };

  const updateHeroImage = (index: number, url: string) => {
    if (!settings) return;
    const curHero = settings.hero || {
      mediaType: 'images',
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=85',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85'
      ],
      videoUrl: '',
      badge: '100% JDA & RERA Approved Residential & Commercial Plots',
      title: 'Discover Verified JDA Approved Plots in Jaipur',
      subtitle: 'Buy residential and commercial plots starting from ₹15 Lakhs with spot registry and 80% pre-approved bank loans. Prime schemes in Jagatpura, Mahindra SEZ, Tonk Road & Ajmer Expressway.'
    };
    const updatedImages = [...(curHero.images || ['', '', ''])];
    while (updatedImages.length < 3) updatedImages.push('');
    updatedImages[index] = url;
    updateHeroField('images', updatedImages);
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (!oldPassword || !newPassword) {
      setPwdError('Please enter both your current password and new password.');
      return;
    }

    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('New password and confirm password do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await adminService.changePassword({
        oldPassword,
        newPassword,
        confirmPassword
      });
      setPwdSuccess(res.data?.message || 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdSuccess(null), 5000);
    } catch (err: any) {
      setPwdError(err.response?.data?.message || 'Failed to update password. Please check your current password.');
    } finally {
      setChangingPassword(false);
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

      {/* Admin Security & Password Change Section */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Security & Password Management</h3>
              <p className="text-[11px] text-slate-500">Update your administrator login password</p>
            </div>
          </div>
          {pwdSuccess && (
            <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{pwdSuccess}</span>
            </div>
          )}
        </div>

        {pwdError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{pwdError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Old Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showOldPwd ? 'text' : 'password'}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPwd(!showOldPwd)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showOldPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPwd ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={changingPassword || !oldPassword || !newPassword}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center space-x-2"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
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

        {/* Homepage Hero Banner & Media Card */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Homepage Hero Banner & Media Controls</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Control whether the public website header displays 3 sliding photos or a looping video, and customize the headline text.
              </p>
            </div>
            
            {/* Media Type Switcher */}
            <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => updateHeroField('mediaType', 'images')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  (settings.hero?.mediaType || 'images') === 'images'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>3 Photos Carousel</span>
              </button>
              <button
                type="button"
                onClick={() => updateHeroField('mediaType', 'video')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  settings.hero?.mediaType === 'video'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Hero Video</span>
              </button>
            </div>
          </div>

          {/* Conditional Media Slots */}
          {(settings.hero?.mediaType || 'images') === 'images' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Carousel Slides (Exactly 3 High-Quality Photos)
                </span>
                <span className="text-[11px] text-slate-400">Smooth auto-transition every 5 seconds</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map((idx) => {
                  const imgList = settings.hero?.images || [
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=85',
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85'
                  ];
                  const imgUrl = imgList[idx] || '';
                  return (
                    <div key={idx} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span>Slide {idx + 1}</span>
                        </span>
                        <input
                          ref={heroImageInputRefs[idx]}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleHeroImageUpload(idx, e)}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => heroImageInputRefs[idx].current?.click()}
                          disabled={uploadingHeroImg === idx}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center space-x-1 shadow-2xs"
                        >
                          {uploadingHeroImg === idx ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3 h-3 text-slate-500" />
                              <span>Upload Photo</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Image Preview */}
                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-200 border border-slate-300">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={`Hero Slide ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                            <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                            <span>No photo set</span>
                          </div>
                        )}
                      </div>

                      {/* URL Field */}
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                          Direct Image URL
                        </label>
                        <input
                          type="text"
                          value={imgUrl}
                          onChange={(e) => updateHeroImage(idx, e.target.value)}
                          placeholder="https://..."
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Background Video Configuration
                </span>
                <div className="flex items-center gap-2">
                  <input
                    ref={heroVideoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleHeroVideoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => heroVideoInputRef.current?.click()}
                    disabled={uploadingHeroVideo}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 flex items-center space-x-1.5 shadow-2xs"
                  >
                    {uploadingHeroVideo ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading Video...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Video from Device</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Video URL (Direct MP4 or YouTube Link)
                </label>
                <input
                  type="text"
                  value={settings.hero?.videoUrl || ''}
                  onChange={(e) => updateHeroField('videoUrl', e.target.value)}
                  placeholder="https://... or YouTube URL"
                  className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Tip: A lightweight 10–30 second HD looping video without audio works best for cinematic hero backgrounds.
                </p>
              </div>

              {settings.hero?.videoUrl && (
                <div className="mt-3 rounded-lg overflow-hidden border border-slate-300 bg-black aspect-video max-w-md mx-auto">
                  {settings.hero.videoUrl.includes('youtube.com') || settings.hero.videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={settings.hero.videoUrl.includes('embed') ? settings.hero.videoUrl : `https://www.youtube.com/embed/${settings.hero.videoUrl.split('v=')[1]?.split('&')[0] || ''}`}
                      title="Hero Video Preview"
                      className="w-full h-full"
                    />
                  ) : (
                    <video
                      src={settings.hero.videoUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Hero Headlines & Text Content Section */}
          <div className="pt-3 border-t border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Hero Headings & Texts</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Top Pill Badge Text</label>
                <input
                  type="text"
                  value={settings.hero?.badge ?? '100% JDA & RERA Approved Residential & Commercial Plots'}
                  onChange={(e) => updateHeroField('badge', e.target.value)}
                  placeholder="e.g. 100% JDA & RERA Approved Residential & Commercial Plots"
                  className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Main Heading Title</label>
                <input
                  type="text"
                  value={settings.hero?.title ?? 'Discover Verified JDA Approved Plots in Jaipur'}
                  onChange={(e) => updateHeroField('title', e.target.value)}
                  placeholder="Discover Verified JDA Approved Plots in Jaipur"
                  className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-900 focus:outline-none font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle / Description</label>
              <textarea
                rows={2}
                value={settings.hero?.subtitle ?? 'Buy residential and commercial plots starting from ₹15 Lakhs with spot registry and 80% pre-approved bank loans. Prime schemes in Jagatpura, Mahindra SEZ, Tonk Road & Ajmer Expressway.'}
                onChange={(e) => updateHeroField('subtitle', e.target.value)}
                placeholder="Brief narrative shown under the main title on the public homepage..."
                className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-900 focus:outline-none resize-none"
              />
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Helpline Phone</label>
              <input
                type="text"
                value={settings.phone || ''}
                placeholder="0-9"
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Direct</label>
              <input
                type="text"
                value={settings.whatsapp || ''}
                placeholder="0-9"
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
