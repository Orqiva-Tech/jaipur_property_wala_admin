import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Check, X, AlertCircle, Globe2, Sparkles } from 'lucide-react';
import { locationService } from '../services/api';
import { LocationItem } from '../types';

export const Locations: React.FC = () => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    name: '',
    state: 'Rajasthan',
    tagline: 'Prime Growth Corridor',
    icon: '📍',
    status: 'Active' as 'Active' | 'Inactive'
  };

  const [formData, setFormData] = useState(initialForm);

  const iconOptions = ['📍', '🏰', '🕌', '🏛️', '🌊', '🏙️', '🌴', '🛣️', '🏢', '🌄'];

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await locationService.getAll({ all: 'true' });
      setLocations(res.data.data || []);
    } catch (err) {
      console.error('Error fetching locations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(initialForm);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (loc: LocationItem) => {
    setEditingId(loc._id);
    setFormData({
      name: loc.name,
      state: loc.state || 'Rajasthan',
      tagline: loc.tagline || 'Prime Growth Corridor',
      icon: loc.icon || '📍',
      status: loc.status
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await locationService.delete(id);
      setSuccessMessage(`Location "${name}" removed successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchLocations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting location');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingId) {
        await locationService.update(editingId, formData);
        setSuccessMessage(`Location "${formData.name}" updated successfully!`);
      } else {
        await locationService.create(formData);
        setSuccessMessage(`New location "${formData.name}" added successfully!`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchLocations();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error saving location');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Messages */}
      {successMessage && (
        <div className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 px-4 py-3 rounded-xl flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0c1c15] via-[#122b20] to-[#091710] p-6 sm:p-7 rounded-2xl border border-gold-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-gold-400 font-sans">
              Territory & City Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-white tracking-wide">
            Add & Manage Project Locations
          </h1>
          <p className="text-xs text-stone-300 max-w-xl">
            Create new cities and regions where Jaipur Property Wala operates. Added locations dynamically appear in Property & Gallery dropdowns.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="relative px-5 py-3 rounded-xl bg-gradient-to-r from-gold-500 via-gold-600 to-amber-600 text-forest-950 font-extrabold text-xs uppercase tracking-wider shadow-lg hover:shadow-gold-500/20 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 shrink-0 border border-gold-300"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Location</span>
        </button>
      </div>

      {/* Locations Grid / Table */}
      <div className="bg-[#0c1a13] rounded-2xl border border-gold-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-[#08120d] text-gold-400/90 uppercase tracking-wider font-extrabold border-b border-gold-500/20">
              <tr>
                <th className="p-4">City / Region</th>
                <th className="p-4">State</th>
                <th className="p-4">Corridor Tagline</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#152e22]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-stone-400">
                    <div className="inline-block w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <div className="text-xs">Loading territories...</div>
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-stone-400">No locations found. Click Add New Location above.</td>
                </tr>
              ) : (
                locations.map((loc) => (
                  <tr key={loc._id} className="hover:bg-[#12281e]/70 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center space-x-3">
                      <span className="text-2xl p-1 bg-[#152e22] rounded-lg border border-gold-500/20 inline-block">{loc.icon || '📍'}</span>
                      <div>
                        <span className="block text-sm font-editorial text-gold-200">{loc.name}</span>
                        <span className="text-[10px] text-stone-400 font-mono">slug: {loc.slug}</span>
                      </div>
                    </td>
                    <td className="p-4 text-stone-300 font-medium">{loc.state}</td>
                    <td className="p-4 text-stone-300 font-normal">{loc.tagline}</td>
                    <td className="p-4">
                      {loc.status === 'Active' ? (
                        <span className="text-[10px] bg-emerald-950/80 text-emerald-300 font-bold px-2.5 py-1 rounded border border-emerald-500/40">
                          Active Market
                        </span>
                      ) : (
                        <span className="text-[10px] bg-stone-900 text-stone-400 px-2.5 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(loc)}
                        className="p-2 rounded-lg bg-[#153125] hover:bg-gold-500 hover:text-forest-950 text-gold-400 transition-all border border-gold-500/30"
                        title="Edit Location"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(loc._id, loc.name)}
                        className="p-2 rounded-lg bg-red-950/60 hover:bg-red-700 text-red-300 hover:text-white transition-all border border-red-500/30"
                        title="Delete Location"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Location Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0d1d16] rounded-2xl shadow-2xl overflow-hidden border border-gold-500/40">
            <div className="bg-gradient-to-r from-[#07130e] to-[#0f281e] p-5 text-white flex justify-between items-center border-b border-gold-500/30">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-gold-400" />
                <h3 className="text-lg font-bold font-editorial text-gold-300">
                  {editingId ? 'Edit Location' : 'Add New Location / City'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="m-5 p-3.5 bg-red-950/80 border border-red-500/50 rounded-xl flex items-center space-x-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gold-300 mb-1">Location / City Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Delhi NCR, Kota, Udaipur, Pune"
                  className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 focus:border-gold-500 rounded-lg text-xs text-white placeholder-stone-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gold-300 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Rajasthan, Maharashtra"
                    className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 focus:border-gold-500 rounded-lg text-xs text-white placeholder-stone-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gold-300 mb-1">Market Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 focus:border-gold-500 rounded-lg text-xs text-white focus:outline-none"
                  >
                    <option value="Active">Active Market</option>
                    <option value="Inactive">Inactive / Upcoming</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gold-300 mb-1">Corridor Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Education & Industrial Hub"
                  className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 focus:border-gold-500 rounded-lg text-xs text-white placeholder-stone-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gold-300 mb-1">Select Icon</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {iconOptions.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: ic })}
                      className={`text-xl p-2 rounded-lg border transition-all ${
                        formData.icon === ic
                          ? 'bg-gold-500/20 border-gold-500 shadow'
                          : 'bg-[#08140f] border-gold-500/20 hover:border-gold-500/40'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gold-500/20 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-500 via-gold-600 to-amber-600 text-forest-950 text-xs font-extrabold shadow"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Location' : 'Add Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
