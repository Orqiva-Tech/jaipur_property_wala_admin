import React, { useEffect, useState, useRef } from 'react';
import { Save, CheckCircle2, Phone, MapPin, Mail, Upload, Loader2, Share2, KeyRound, Lock, Eye, EyeOff, AlertCircle, Image as ImageIcon, Video, Sparkles, Sliders, Award, Plus, Trash2, Building2, ArrowLeft, ArrowRight, RefreshCw, Star } from 'lucide-react';
import { adminService, propertyService, formatImageUrl } from '../services/api';
import { WebsiteSettings, Property } from '../types';

const defaultTownshipShowcase = {
  mode: 'recent' as const,
  selectedProperties: [] as (Property | string)[],
  badge: 'Signature Plotted Developments',
  title: 'Ongoing & Ready-to-Build Townships',
  subtitle: 'Explore prime projects with ready possession, underground utilities, and direct highway connectivity.'
};

const defaultAboutSection = {
  badge: 'About Our Company',
  title: 'Why Choose Jaipur Property Wala?',
  description: 'Jaipur Property Wala (Jaipur JDA Plots Colonizers & Developers) has established an unmatched benchmark of credibility across Rajasthan. We protect your hard-earned investment by offering only clear-title, JDA-approved schemes with direct spot registry and zero hidden charges.',
  image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
  imageTag: 'Authentic Jaipur Roots',
  imageQuote: '“Estate brings together all the essentials of modern living with features that ensure comfort, safety, and lasting value.”',
  experienceYears: '20+ Years',
  experienceText: 'Pioneering Safe JDA Land Ownership in Jaipur',
  points: [
    {
      title: 'Guaranteed Capital Appreciation:',
      description: 'Planned JDA sectors in Jagatpura, SEZ, and Tonk Road have consistently generated high capital gains.'
    },
    {
      title: 'Total Construction Flexibility:',
      description: 'Construct your custom dream villa immediately, lease commercial spaces, or hold the clear-title plot for your family.'
    },
    {
      title: '100% Security & 80% Bank Loan:',
      description: 'All properties feature complete 90-A revenue conversion with instant loans supported by SBI, HDFC, and ICICI.'
    }
  ]
};

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // About Company Section State & Ref
  const [uploadingAboutImg, setUploadingAboutImg] = useState(false);
  const aboutImgInputRef = useRef<HTMLInputElement>(null);

  // Hero Media State & Upload Refs
  const [uploadingHeroImg, setUploadingHeroImg] = useState<number | null>(null);
  const [uploadingHeroVideo, setUploadingHeroVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);
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
        const [res, propsRes] = await Promise.all([
          adminService.getSettings(),
          propertyService.getAll({ limit: 100 })
        ]);
        setSettings(res.data.data);
        setAllProperties(propsRes.data.data || []);
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
            mediaType: 'images',
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

    if (file.size > 95 * 1024 * 1024) {
      alert(`The selected video is ${(file.size / (1024 * 1024)).toFixed(1)}MB. For fast web playback and CDN compatibility, please select a web-optimized video under 95MB (such as 'Manglam-Hero-Web-Optimized.mp4').`);
      if (heroVideoInputRef.current) heroVideoInputRef.current.value = '';
      return;
    }

    setUploadingHeroVideo(true);
    setVideoProgress(0);
    try {
      const res = await propertyService.uploadFile(file, (percent) => {
        setVideoProgress(percent);
      });
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
            mediaType: 'video',
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
      setVideoProgress(0);
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

  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;
    setUploadingAboutImg(true);
    try {
      const res = await propertyService.uploadFile(file);
      if (res.data?.url) {
        updateAboutField('image', res.data.url);
      } else {
        throw new Error('Upload failed');
      }
    } catch (err: any) {
      console.error('Error uploading about image', err);
      alert('Failed to upload image: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingAboutImg(false);
      if (aboutImgInputRef.current) aboutImgInputRef.current.value = '';
    }
  };

  const updateAboutField = (field: string, value: any) => {
    if (!settings) return;
    const curAbout = settings.aboutSection || defaultAboutSection;
    setSettings({
      ...settings,
      aboutSection: {
        ...curAbout,
        [field]: value
      }
    });
  };

  const updateAboutPoint = (index: number, field: 'title' | 'description', value: string) => {
    if (!settings) return;
    const curAbout = settings.aboutSection || defaultAboutSection;
    const points = [...(curAbout.points || defaultAboutSection.points)];
    if (points[index]) {
      points[index] = { ...points[index], [field]: value };
      updateAboutField('points', points);
    }
  };

  const addAboutPoint = () => {
    if (!settings) return;
    const curAbout = settings.aboutSection || defaultAboutSection;
    const points = [...(curAbout.points || defaultAboutSection.points)];
    points.push({ title: 'New Advantage Point:', description: 'Describe the feature or benefit...' });
    updateAboutField('points', points);
  };

  const removeAboutPoint = (index: number) => {
    if (!settings) return;
    const curAbout = settings.aboutSection || defaultAboutSection;
    const points = (curAbout.points || defaultAboutSection.points).filter((_, i) => i !== index);
    updateAboutField('points', points);
  };

  // Township Showcase (3 Cards) Helpers
  const updateTownshipField = (field: string, value: any) => {
    if (!settings) return;
    const cur = settings.townshipShowcase || defaultTownshipShowcase;
    setSettings({
      ...settings,
      townshipShowcase: {
        ...cur,
        [field]: value
      }
    });
  };

  const setTownshipSlotProperty = (slotIndex: number, propertyId: string) => {
    if (!settings) return;
    const cur = settings.townshipShowcase || defaultTownshipShowcase;
    const rawList = [...(cur.selectedProperties || [])];
    while (rawList.length < 3) rawList.push('');
    if (!propertyId) {
      rawList[slotIndex] = '';
    } else {
      const found = allProperties.find(p => p._id === propertyId);
      rawList[slotIndex] = found || propertyId;
    }
    updateTownshipField('selectedProperties', rawList);
  };

  const clearTownshipSlot = (slotIndex: number) => {
    setTownshipSlotProperty(slotIndex, '');
  };

  const swapTownshipSlots = (idxA: number, idxB: number) => {
    if (!settings) return;
    const cur = settings.townshipShowcase || defaultTownshipShowcase;
    const list = [...(cur.selectedProperties || [])];
    while (list.length < 3) list.push('');
    const temp = list[idxA];
    list[idxA] = list[idxB];
    list[idxB] = temp;
    updateTownshipField('selectedProperties', list);
  };

  const preloadRecentIntoCustom = () => {
    if (!settings || allProperties.length === 0) return;
    const first3 = allProperties.slice(0, 3);
    setSettings({
      ...settings,
      townshipShowcase: {
        ...(settings.townshipShowcase || defaultTownshipShowcase),
        mode: 'custom',
        selectedProperties: first3
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSuccess(false);

    try {
      const payload = {
        ...settings,
        townshipShowcase: settings.townshipShowcase ? {
          ...settings.townshipShowcase,
          selectedProperties: (settings.townshipShowcase.selectedProperties || [])
            .map((item: any) => (typeof item === 'object' && item !== null && item._id ? item._id : item))
            .filter((id: any) => typeof id === 'string' && id.trim() !== '')
        } : undefined
      };
      const res = await adminService.updateSettings(payload);
      if (res.data?.data) {
        setSettings(res.data.data);
      }
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
            <span>Brand Logo</span>
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
                      <span>Uploading Logo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Logo</span>
                    </>
                  )}
                </button>
              </div>

              {logoError && (
                <p className="text-xs text-red-600 font-medium">{logoError}</p>
              )}
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
                      <div className="relative w-full h-36 rounded-lg overflow-hidden bg-slate-200 border border-slate-300">
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
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Hero Background Video
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Upload a high-quality looping video from your computer or phone.
                  </span>
                </div>
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
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 flex items-center space-x-1.5 shadow-xs transition-colors"
                  >
                    {uploadingHeroVideo ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading Video ({videoProgress}%)...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>{settings.hero?.videoUrl ? 'Change Video' : 'Upload Video'}</span>
                      </>
                    )}
                  </button>

                  {settings.hero?.videoUrl && (
                    <button
                      type="button"
                      onClick={() => updateHeroField('videoUrl', '')}
                      disabled={uploadingHeroVideo}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                    >
                      Remove Video
                    </button>
                  )}
                </div>
              </div>

              {/* Upload Progress Bar */}
              {uploadingHeroVideo && (
                <div className="space-y-1.5 bg-blue-50/70 border border-blue-200 rounded-lg p-3">
                  <div className="flex justify-between text-xs text-blue-700 font-semibold">
                    <span>Uploading directly to high-speed CDN...</span>
                    <span>{videoProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Video Player Preview */}
              {settings.hero?.videoUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-black aspect-video max-w-lg mx-auto shadow-md">
                  <video
                    src={formatImageUrl(settings.hero.videoUrl)}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center text-slate-400">
                  <Video className="w-10 h-10 mb-2 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-600">No Hero Video Uploaded</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click "Upload Video" above to select and upload a video file</p>
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

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Hero Settings'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Homepage Township Showcase (Signature Plotted Developments - 3 Cards) */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Homepage Township Showcase (3 Cards Section)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Control the 3 prominent cards displayed under "Signature Plotted Developments - Ongoing & Ready-to-Build Townships" on the public homepage.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => updateTownshipField('mode', 'recent')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  (settings.townshipShowcase?.mode || 'recent') === 'recent'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Automatic (Latest 3)</span>
              </button>
              <button
                type="button"
                onClick={() => updateTownshipField('mode', 'custom')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  settings.townshipShowcase?.mode === 'custom'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span>Custom Selection (3 Cards)</span>
              </button>
            </div>
          </div>

          {/* Section Info Banner */}
          {(settings.townshipShowcase?.mode === 'custom') ? (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-blue-900">Custom Manual Selection Mode is Active</h4>
                  <p className="text-[11px] text-blue-700">
                    The homepage will display the 3 specific properties you choose below in exact order (Card #1 Left, Card #2 Center, Card #3 Right).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateTownshipField('mode', 'recent')}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shrink-0 shadow-2xs"
              >
                Reset to Automatic Mode
              </button>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">Automatic Mode is Active</h4>
                  <p className="text-[11px] text-emerald-700">
                    The public homepage automatically displays the 3 most recently added properties. Want to override them with custom properties?
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={preloadRecentIntoCustom}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shrink-0 shadow-xs flex items-center space-x-1.5"
              >
                <Star className="w-3.5 h-3.5 text-amber-300" />
                <span>Choose Custom 3 Cards</span>
              </button>
            </div>
          )}

          {/* If Recent Mode: Preview what's currently showing */}
          {(settings.townshipShowcase?.mode || 'recent') === 'recent' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Currently Featured on Homepage (Automatic Latest 3):
                </span>
                <span className="text-[11px] text-slate-400">
                  Updates dynamically as new properties are added
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {allProperties.slice(0, 3).map((prop, idx) => (
                  <div
                    key={prop._id || idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        Position #{idx + 1} ({idx === 0 ? 'Left' : idx === 1 ? 'Center' : 'Right'})
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {prop.status}
                      </span>
                    </div>
                    <div className="h-32 rounded-lg overflow-hidden bg-slate-200 border border-slate-200 relative">
                      <img
                        src={formatImageUrl(prop.images?.[0])}
                        alt={prop.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                        {prop.location?.area || prop.location?.city || 'Jaipur'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 truncate" title={prop.title}>
                        {prop.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {prop.tagline || prop.priceDisplay || 'Prime Location'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* If Custom Mode: 3 Slot Selectors */}
          {settings.townshipShowcase?.mode === 'custom' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map((slotIdx) => {
                  const rawItem = settings.townshipShowcase?.selectedProperties?.[slotIdx];
                  const selectedId = typeof rawItem === 'object' && rawItem !== null ? rawItem._id : (typeof rawItem === 'string' ? rawItem : '');
                  const currentProp = allProperties.find(p => p._id === selectedId) || (typeof rawItem === 'object' && rawItem !== null ? rawItem as Property : null);
                  const slotLabel = slotIdx === 0 ? 'Card #1 (Left)' : slotIdx === 1 ? 'Card #2 (Center)' : 'Card #3 (Right)';

                  return (
                    <div
                      key={slotIdx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                              {slotIdx + 1}
                            </span>
                            <span>{slotLabel}</span>
                          </span>
                          {currentProp && (
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              ✓ Selected
                            </span>
                          )}
                        </div>

                        {/* Dropdown Selector */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Choose Property
                          </label>
                          <select
                            value={selectedId || ''}
                            onChange={(e) => setTownshipSlotProperty(slotIdx, e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-900 focus:outline-none shadow-xs"
                          >
                            <option value="">-- Select Property for Slot #{slotIdx + 1} --</option>
                            {allProperties.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.title} ({p.location?.area || p.location?.city}) - {p.status}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Live Card Preview */}
                        {currentProp ? (
                          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2">
                            <div className="h-32 rounded-md overflow-hidden relative bg-slate-100 border border-slate-200">
                              <img
                                src={formatImageUrl(currentProp.images?.[0])}
                                alt={currentProp.title}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-xs">
                                {currentProp.location?.area || currentProp.location?.city || 'Jaipur'}
                              </span>
                              {currentProp.status && (
                                <span className="absolute top-2 right-2 bg-slate-900/80 text-amber-300 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                                  {currentProp.status}
                                </span>
                              )}
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-slate-900 truncate" title={currentProp.title}>
                                {currentProp.title}
                              </h5>
                              <p className="text-[11px] text-amber-700 font-medium truncate">
                                {currentProp.tagline || (currentProp.location?.area ? `${currentProp.location.area}, ${currentProp.location.city}` : 'Prime Corridor')}
                              </p>
                              <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">
                                {currentProp.description || 'Verified JDA approved development with prime connectivity.'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-6 bg-white rounded-lg border border-dashed border-slate-300 text-center space-y-1">
                            <p className="text-xs font-medium text-slate-600">No property selected</p>
                            <p className="text-[11px] text-slate-400">
                              Slot will automatically display the latest available property from your catalog.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Card Reordering & Clear Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 gap-2">
                        <div className="flex items-center space-x-1.5">
                          {slotIdx > 0 && (
                            <button
                              type="button"
                              onClick={() => swapTownshipSlots(slotIdx, slotIdx - 1)}
                              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-medium transition-colors"
                              title="Move Left"
                            >
                              ← Move Left
                            </button>
                          )}
                          {slotIdx < 2 && (
                            <button
                              type="button"
                              onClick={() => swapTownshipSlots(slotIdx, slotIdx + 1)}
                              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-medium transition-colors"
                              title="Move Right"
                            >
                              Move Right →
                            </button>
                          )}
                        </div>

                        {currentProp && (
                          <button
                            type="button"
                            onClick={() => clearTownshipSlot(slotIdx)}
                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-[11px] font-medium transition-colors"
                          >
                            Clear Slot
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section Titles Customization */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Section Heading & Headline Text (Public Website)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Top Gold Tagline Badge
                </label>
                <input
                  type="text"
                  value={settings.townshipShowcase?.badge || 'Signature Plotted Developments'}
                  onChange={(e) => updateTownshipField('badge', e.target.value)}
                  placeholder="Signature Plotted Developments"
                  className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-900 shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Main Section Title
                </label>
                <input
                  type="text"
                  value={settings.townshipShowcase?.title || 'Ongoing & Ready-to-Build Townships'}
                  onChange={(e) => updateTownshipField('title', e.target.value)}
                  placeholder="Ongoing & Ready-to-Build Townships"
                  className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-900 shadow-xs"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Sub-description Text
                </label>
                <input
                  type="text"
                  value={settings.townshipShowcase?.subtitle || 'Explore prime projects with ready possession, underground utilities, and direct highway connectivity.'}
                  onChange={(e) => updateTownshipField('subtitle', e.target.value)}
                  placeholder="Explore prime projects..."
                  className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-900 shadow-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Homepage About Company / Why Choose Us Section Card */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Homepage "Why Choose Us / About Company" Section</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Customize the presentation image, headline, brand story, experience badge, and key value propositions displayed on the public homepage.
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg self-start sm:self-auto">
              Dynamic Homepage Section
            </span>
          </div>

          {(() => {
            const curAbout = settings.aboutSection || defaultAboutSection;
            const points = curAbout.points || defaultAboutSection.points;
            return (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Image & Image Overlay Badges */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Section Presentation Image</span>
                        {uploadingAboutImg && (
                          <span className="text-[11px] text-blue-600 flex items-center space-x-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Uploading...</span>
                          </span>
                        )}
                      </div>

                      {/* Image Preview with overlay mockup */}
                      <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-300 shadow-inner group">
                        <img
                          src={formatImageUrl(curAbout.image || defaultAboutSection.image)}
                          alt="About Section Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
                        <div className="absolute bottom-3 left-3 right-3 text-white space-y-0.5 pointer-events-none">
                          <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold block truncate">
                            {curAbout.imageTag || 'Authentic Jaipur Roots'}
                          </span>
                          <p className="text-[10px] italic leading-tight text-slate-200 line-clamp-2">
                            {curAbout.imageQuote || '“Estate brings together all the essentials of modern living...”'}
                          </p>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-slate-950/90 text-white p-2 rounded-lg border border-amber-400/50 max-w-[120px] pointer-events-none">
                          <span className="text-xs font-bold text-amber-400 block">{curAbout.experienceYears || '20+ Years'}</span>
                          <span className="text-[8px] text-slate-300 block line-clamp-1">{curAbout.experienceText || 'Safe JDA Land Ownership'}</span>
                        </div>
                      </div>

                      {/* Upload Button & Direct URL */}
                      <div className="space-y-2">
                        <input
                          type="file"
                          ref={aboutImgInputRef}
                          onChange={handleAboutImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => aboutImgInputRef.current?.click()}
                          disabled={uploadingAboutImg}
                          className="w-full py-2 px-3 bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5 text-slate-500" />
                          <span>{uploadingAboutImg ? 'Uploading New Image...' : 'Upload Image from Computer'}</span>
                        </button>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Or Image CDN URL</label>
                          <input
                            type="text"
                            value={curAbout.image || ''}
                            onChange={(e) => updateAboutField('image', e.target.value)}
                            placeholder="https://..."
                            className="w-full p-2 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-800"
                          />
                        </div>
                      </div>

                      {/* Overlay text fields */}
                      <div className="pt-2 border-t border-slate-200 space-y-3">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Overlay Badge & Quotes</h4>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Image Tagline</label>
                          <input
                            type="text"
                            value={curAbout.imageTag ?? 'Authentic Jaipur Roots'}
                            onChange={(e) => updateAboutField('imageTag', e.target.value)}
                            placeholder="Authentic Jaipur Roots"
                            className="w-full p-2 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Image Quote</label>
                          <textarea
                            rows={2}
                            value={curAbout.imageQuote ?? '“Estate brings together all the essentials of modern living with features that ensure comfort, safety, and lasting value.”'}
                            onChange={(e) => updateAboutField('imageQuote', e.target.value)}
                            placeholder="Quote text..."
                            className="w-full p-2 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-800 resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Badge Years</label>
                            <input
                              type="text"
                              value={curAbout.experienceYears ?? '20+ Years'}
                              onChange={(e) => updateAboutField('experienceYears', e.target.value)}
                              placeholder="20+ Years"
                              className="w-full p-2 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Badge Subtitle</label>
                            <input
                              type="text"
                              value={curAbout.experienceText ?? 'Pioneering Safe JDA Land Ownership in Jaipur'}
                              onChange={(e) => updateAboutField('experienceText', e.target.value)}
                              placeholder="Pioneering Safe JDA Land Ownership"
                              className="w-full p-2 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-800"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Titles, Descriptions, Bullet Points */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Section Pill Badge</label>
                          <input
                            type="text"
                            value={curAbout.badge ?? 'About Our Company'}
                            onChange={(e) => updateAboutField('badge', e.target.value)}
                            placeholder="About Our Company"
                            className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-900 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Main Section Title</label>
                          <input
                            type="text"
                            value={curAbout.title ?? 'Why Choose Jaipur Property Wala?'}
                            onChange={(e) => updateAboutField('title', e.target.value)}
                            placeholder="Why Choose Jaipur Property Wala?"
                            className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-900 font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Story / Narrative Paragraph</label>
                        <textarea
                          rows={4}
                          value={curAbout.description ?? ''}
                          onChange={(e) => updateAboutField('description', e.target.value)}
                          placeholder="Comprehensive description of the company, credibility, and JDA approval assurance..."
                          className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-900 resize-none"
                        />
                      </div>

                      {/* Key Highlight / Bullet Points */}
                      <div className="space-y-3 pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Key Advantage Points (Checklist)</span>
                            <p className="text-[11px] text-slate-500">Add or edit the key highlights shown with checkmarks</p>
                          </div>
                          <button
                            type="button"
                            onClick={addAboutPoint}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Point</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {points.map((pt: any, idx: number) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 relative shadow-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                  Point #{idx + 1}
                                </span>
                                {points.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeAboutPoint(idx)}
                                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                    title="Delete Point"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              <input
                                type="text"
                                value={pt.title}
                                onChange={(e) => updateAboutPoint(idx, 'title', e.target.value)}
                                placeholder="Heading (e.g. Guaranteed Capital Appreciation:)"
                                className="w-full p-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-md text-xs text-slate-900 font-semibold"
                              />
                              <textarea
                                rows={2}
                                value={pt.description}
                                onChange={(e) => updateAboutPoint(idx, 'description', e.target.value)}
                                placeholder="Brief explanation of this advantage..."
                                className="w-full p-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-md text-xs text-slate-700 resize-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center space-x-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{saving ? 'Saving...' : 'Save About Section Settings'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Contact Info Card */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
            Primary Helpline & Communications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Alternate Phone</label>
              <input
                type="text"
                value={settings.alternatePhone || ''}
                placeholder="0-9"
                onChange={(e) => setSettings({ ...settings, alternatePhone: e.target.value })}
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
