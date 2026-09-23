import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Briefcase, Check, X, AlertCircle } from 'lucide-react';
import { careerService } from '../services/api';
import { Career } from '../types';

export const Careers: React.FC = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialForm = {
    title: '',
    department: 'Sales & Business Development',
    employmentType: 'Full-Time',
    location: 'Jagatpura, Jaipur',
    experience: '1 - 3 Years',
    salaryRange: '₹25,000 - ₹45,000 / month + Incentives',
    openings: 2,
    description: '',
    responsibilities: 'Conduct property site visits with clients\nExplain JDA legal titles and bank loan procedures\nClose residential plot deals with high customer satisfaction',
    qualifications: 'Graduation in any stream\nGood communication skills in Hindi & English\nOwn conveyance for site visits',
    isActive: true
  };

  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchCareers = async () => {
    setLoading(true);
    try {
      const res = await careerService.getAllAdmin();
      setCareers(res.data.data || []);
    } catch (err) {
      console.error('Error fetching careers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (job: Career) => {
    setEditingId(job._id);
    setFormData({
      title: job.title,
      department: job.department,
      employmentType: job.employmentType,
      location: job.location,
      experience: job.experience,
      salaryRange: job.salaryRange || '',
      openings: job.openings || 1,
      description: job.description,
      responsibilities: job.responsibilities ? job.responsibilities.join('\n') : '',
      qualifications: job.qualifications ? job.qualifications.join('\n') : '',
      isActive: job.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this career opening?')) return;
    try {
      await careerService.delete(id);
      fetchCareers();
    } catch (err) {
      console.error('Error deleting career', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        responsibilities: formData.responsibilities.split('\n').map(s => s.trim()).filter(Boolean),
        qualifications: formData.qualifications.split('\n').map(s => s.trim()).filter(Boolean)
      };

      if (editingId) {
        await careerService.update(editingId, payload);
      } else {
        await careerService.create(payload);
      }

      setIsModalOpen(false);
      fetchCareers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving career opening');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0c1c15] via-[#122b20] to-[#091710] p-6 sm:p-7 rounded-2xl border border-gold-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-white tracking-wide">
            Careers & Job Openings
          </h1>
          <p className="text-xs text-stone-300">
            Post job vacancies, specify requirements, and manage company hiring for real estate specialists.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-gold-500 via-gold-600 to-amber-600 text-forest-950 font-extrabold text-xs uppercase tracking-wider shadow-lg hover:shadow-gold-500/20 flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </div>

      <div className="bg-[#0c1a13] rounded-2xl border border-gold-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-[#08120d] text-gold-400/90 uppercase tracking-wider font-extrabold border-b border-gold-500/20">
              <tr>
                <th className="p-4">Job Role</th>
                <th className="p-4">Department</th>
                <th className="p-4">Location</th>
                <th className="p-4">Type & Exp</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#152e22]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-stone-400">Loading careers...</td>
                </tr>
              ) : careers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-stone-400">No active job vacancies created yet.</td>
                </tr>
              ) : (
                careers.map((job) => (
                  <tr key={job._id} className="hover:bg-[#12281e]/70 transition-colors">
                    <td className="p-4 font-bold text-white">
                      <span className="block text-sm text-gold-200">{job.title}</span>
                      <span className="text-[11px] text-stone-400">{job.salaryRange}</span>
                    </td>
                    <td className="p-4 text-stone-300">{job.department}</td>
                    <td className="p-4 text-stone-300">{job.location}</td>
                    <td className="p-4 text-stone-300">{job.employmentType} • {job.experience}</td>
                    <td className="p-4">
                      {job.isActive ? (
                        <span className="text-[10px] bg-emerald-950/80 text-emerald-300 font-bold px-2.5 py-1 rounded border border-emerald-500/40">
                          Active Hiring
                        </span>
                      ) : (
                        <span className="text-[10px] bg-stone-900 text-stone-400 px-2.5 py-1 rounded">
                          Paused
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(job)}
                        className="p-1.5 rounded bg-[#153125] text-gold-300 hover:bg-gold-500 hover:text-forest-950"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(job._id)}
                        className="p-1.5 rounded bg-red-950/60 text-red-300 hover:bg-red-700 hover:text-white"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-[#0d1d16] rounded-2xl shadow-2xl overflow-hidden border border-gold-500/40 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#07130e] to-[#0f281e] p-5 text-white flex justify-between items-center border-b border-gold-500/30">
              <h3 className="text-lg font-bold font-editorial text-gold-300">
                {editingId ? 'Edit Job Opening' : 'Post New Job Vacancy'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gold-300 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Senior Real Estate Sales Manager"
                  className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gold-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gold-300 mb-1">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                    className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Consultant">Consultant</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gold-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gold-300 mb-1">Experience Required</label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gold-300 mb-1">Responsibilities (one per line)</label>
                <textarea
                  rows={3}
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gold-300 mb-1">Qualifications (one per line)</label>
                <textarea
                  rows={3}
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  className="w-full p-2.5 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white"
                />
              </div>

              <div className="pt-3 border-t border-gold-500/20 flex justify-end space-x-2">
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-500 via-gold-600 to-amber-600 text-forest-950 text-xs font-extrabold"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Opening' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
