import React, { useEffect, useState } from 'react';
import { Download, Search, FileText } from 'lucide-react';
import { careerService } from '../services/api';
import { JobApplication } from '../types';

export const Applications: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await careerService.getApplications({
        search: search || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined
      });
      setApplications(res.data.data || []);
    } catch (err) {
      console.error('Error fetching applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await careerService.updateAppStatus(id, { status: newStatus });
      fetchApplications();
    } catch (err) {
      console.error('Error updating application status', err);
    }
  };

  const handleDownloadResume = (appId: string) => {
    const token = localStorage.getItem('jpw_admin_token');
    const url = careerService.getResumeDownloadUrl(appId);
    window.open(`${url}?token=${token}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0c1c15] via-[#122b20] to-[#091710] p-6 sm:p-7 rounded-2xl border border-gold-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-white tracking-wide">
            Candidate Job Applications & Resumes
          </h1>
          <p className="text-xs text-stone-300">
            Review candidate resumes, assess experience in Jaipur real estate, and schedule interviews.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#0e2119] p-4 rounded-xl border border-gold-500/20 shadow-md flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gold-400/70 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name, job title, phone..."
            className="w-full pl-9 pr-3 py-2 bg-[#08140f] border border-gold-500/30 rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:border-gold-500/60"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-gold-400/80 mr-1">Status:</span>
          {['All', 'New', 'Reviewed', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-all ${
                statusFilter === st
                  ? 'bg-gold-500 text-forest-950 shadow-md'
                  : 'bg-[#153125] text-stone-300 hover:text-white border border-emerald-900/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0c1a13] rounded-2xl border border-gold-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-[#08120d] text-gold-400/90 uppercase tracking-wider font-extrabold border-b border-gold-500/20">
              <tr>
                <th className="p-4">Candidate Name</th>
                <th className="p-4">Applied Role</th>
                <th className="p-4">Phone / WhatsApp</th>
                <th className="p-4">Experience & Location</th>
                <th className="p-4">Application Status</th>
                <th className="p-4">Resume</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#152e22]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-stone-400">Loading applications...</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-stone-400">No applications received yet.</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app._id} className="hover:bg-[#12281e]/70 transition-colors">
                    <td className="p-4 font-bold text-white">
                      <span className="block text-sm text-gold-200">{app.fullName}</span>
                      <span className="text-[11px] text-stone-400 font-normal">{app.email}</span>
                    </td>
                    <td className="p-4 font-semibold text-emerald-300">{app.jobTitle}</td>
                    <td className="p-4">
                      <a href={`tel:${app.phone}`} className="font-semibold text-gold-400 hover:underline">
                        {app.phone}
                      </a>
                    </td>
                    <td className="p-4 text-stone-300">
                      <span>{app.experienceYears} Years</span>
                      <span className="block text-[11px] text-stone-500">{app.currentLocation}</span>
                    </td>
                    <td className="p-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 border ${
                          app.status === 'New'
                            ? 'bg-red-950/80 text-red-300 border-red-500/40'
                            : app.status === 'Shortlisted'
                            ? 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                            : app.status === 'Hired'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                            : 'bg-[#153125] text-stone-300 border-gold-500/20'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Hired">Hired</option>
                      </select>
                    </td>
                    <td className="p-4">
                      {app.resumePath ? (
                        <button
                          onClick={() => handleDownloadResume(app._id)}
                          className="px-2.5 py-1 rounded bg-[#153125] hover:bg-gold-500 hover:text-forest-950 text-gold-400 text-xs font-semibold flex items-center space-x-1 border border-gold-500/30"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF Resume</span>
                        </button>
                      ) : (
                        <span className="text-stone-500 text-xs">No File</span>
                      )}
                    </td>
                    <td className="p-4 text-stone-400 whitespace-nowrap">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
