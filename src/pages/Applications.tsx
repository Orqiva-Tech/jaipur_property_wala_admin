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
    <div className="space-y-6 antialiased">
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Candidate Tracking
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Job Applications & Resumes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Review candidate resumes, evaluate experience in Rajasthan & MMR real estate, and schedule interviews.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name, job title, phone..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-medium text-slate-500 mr-1">Status:</span>
          {['All', 'New', 'Reviewed', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[760px] text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">Loading applications...</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">No applications received yet.</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">
                      <span className="block text-sm font-bold text-slate-900">{app.fullName}</span>
                      <span className="text-[11px] text-slate-500 font-normal">{app.email}</span>
                    </td>
                    <td className="p-4 font-semibold text-blue-600">{app.jobTitle}</td>
                    <td className="p-4">
                      <a href={`tel:${app.phone}`} className="font-semibold text-blue-600 hover:underline">
                        {app.phone}
                      </a>
                    </td>
                    <td className="p-4 text-slate-700">
                      <span>{app.experienceYears} Years</span>
                      <span className="block text-[11px] text-slate-500">{app.currentLocation}</span>
                    </td>
                    <td className="p-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className={`text-xs font-medium rounded-md px-2.5 py-1 border transition-colors ${
                          app.status === 'New'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : app.status === 'Shortlisted'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : app.status === 'Hired'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
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
                          className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center space-x-1 border border-slate-300 shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span>PDF Resume</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">No File</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 whitespace-nowrap">
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
