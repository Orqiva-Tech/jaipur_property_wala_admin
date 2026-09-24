import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Check, X, AlertCircle } from 'lucide-react';
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
    <div className="space-y-6 antialiased">
      {/* Toast Messages */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Master Geographic Index
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Manage Cities & Strategic Hubs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Add or configure territories where Jaipur Property Wala manages real estate. Newly created locations automatically integrate into property dropdowns.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Location</span>
        </button>
      </div>

      {/* Locations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[600px] text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-4">City / Region</th>
                <th className="p-4">State</th>
                <th className="p-4">Corridor Tagline</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <div className="text-xs">Loading territories...</div>
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    No locations configured yet. Click Add New Location above.
                  </td>
                </tr>
              ) : (
                locations.map((loc) => (
                  <tr key={loc._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-semibold text-slate-900 flex items-center space-x-3">
                      <span className="text-xl p-1.5 bg-slate-50 rounded-lg border border-slate-200 inline-block">
                        {loc.icon || '📍'}
                      </span>
                      <div>
                        <span className="block text-sm font-bold text-slate-900">{loc.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">slug: {loc.slug}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{loc.state}</td>
                    <td className="p-4 text-slate-600">{loc.tagline}</td>
                    <td className="p-4">
                      {loc.status === 'Active' ? (
                        <span className="text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                          Active Market
                        </span>
                      ) : (
                        <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => openEditModal(loc)}
                        className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                        title="Edit Location"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(loc._id, loc.name)}
                        className="p-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-white border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingId ? 'Edit Location' : 'Add New Location'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location / City Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Delhi NCR, Kota, Udaipur, Pune"
                  className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Rajasthan"
                    className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Market Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-lg text-xs text-slate-900 focus:outline-none shadow-xs"
                  >
                    <option value="Active">Active Market</option>
                    <option value="Inactive">Inactive / Upcoming</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corridor Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Growth & Expressway Hub"
                  className="w-full p-2.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Icon</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {iconOptions.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: ic })}
                      className={`text-xl p-2 rounded-lg border transition-all ${
                        formData.icon === ic
                          ? 'bg-blue-50 border-blue-600 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
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
